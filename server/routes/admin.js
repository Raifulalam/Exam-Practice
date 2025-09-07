// routes/admin.js
const express = require("express");
const User = require("../models/User");
const transporter = require("../utils/emailService"); // your transporter setup

const router = express.Router();

// Bulk email route
router.post("/send-bulk-email", async (req, res) => {
    try {
        const { subject, message } = req.body;

        if (!subject || !message) {
            return res.status(400).json({ msg: "Subject and message are required" });
        }

        const users = await User.find({ isVerified: true }).select("email");

        if (!users.length) {
            return res.status(404).json({ msg: "No verified users found" });
        }

        // Send in BCC
        await transporter.sendMail({
            from: `"Exam Practice" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            bcc: users.map(u => u.email).join(","),
            subject,
            html: `<p>${message}</p>`,
        });

        res.json({ msg: `Email sent to ${users.length} users!` });
    } catch (err) {
        console.error("Bulk email error:", err);
        res.status(500).json({ msg: "Failed to send emails" });
    }
});

module.exports = router;
