const express = require("express");
const router = express.Router();
const User = require("../models/User");
const transporter = require("../config/nodeMailer");

router.post("/send-bulk-email", async (req, res) => {
    try {
        const { subject, message } = req.body;

        // Fetch only verified users
        const users = await User.find({ verified: true }).select("email name");

        if (!users.length) {
            return res.status(404).json({ msg: "No verified users found" });
        }

        // Send emails one by one
        for (const user of users) {
            const mailOptions = {
                from: `"ExamPrepHub" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject,
                html: `
          <h3>Hello ${user.name || "there"},</h3>
          <p>${message}</p>
          <p>Best regards,<br/>ExamPrepHub Team</p>
        `,
            };

            await transporter.sendMail(mailOptions);
            console.log(`✅ Mail sent to ${user.email}`);
        }

        res.json({ success: true, msg: `Emails sent to ${users.length} users` });
    } catch (err) {
        console.error("❌ Bulk email error:", err);
        res.status(500).json({ msg: "Failed to send bulk emails" });
    }
});

module.exports = router;
