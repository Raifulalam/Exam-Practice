// routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
const { sendVerificationEmail } = require("../utils/emailService");
const router = express.Router();

// Register


// Register
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ msg: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, role, verified: false });
        await newUser.save();

        // create verification token
        const token = jwt.sign(
            { id: newUser._id, email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // send verification email
        await sendVerificationEmail(newUser, token);

        res.json({ msg: "✅ Registered! Please check your email to verify." });
    } catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ msg: err.message });
    }
});
//verify 
router.get("/verify-email", async (req, res) => {
    try {
        const { token } = req.query;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        await User.findByIdAndUpdate(decoded.id, { verified: true });

        res.send("✅ Email verified successfully! You can now login.");
    } catch (err) {
        console.error("Email verify error:", err);
        res.status(400).send("❌ Invalid or expired link");
    }
});

// Login
// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

        if (user.role !== role) {
            return res.status(400).json({ msg: `You are not registered as ${role}` });
        }

        if (!user.verified) {
            return res.status(403).json({ msg: "Please verify your email before login" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({ token, role: user.role });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ msg: err.message });
    }
});


// Get logged-in user
router.get("/me", authMiddleware(), async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        console.error("Me route error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
