// routes/testAttempts.js
const express = require("express");
const router = express.Router();
const TestAttempt = require("../models/Attempt");
const auth = require("../middleware/auth");

// ✅ Get all attempts of logged-in user
router.get("/", auth(), async (req, res) => {
    try {
        const attempts = await TestAttempt.find({ user: req.user.id })
            .populate("practiceSet", "title")
            .sort({ attemptedAt: -1 });

        const totalAttempts = attempts.length;
        const maxScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : 0;
        const avgScore = attempts.length > 0
            ? (attempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts).toFixed(1)
            : 0;

        res.json({
            totalAttempts,
            maxScore,
            avgScore,
            attempts, // full history
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

module.exports = router