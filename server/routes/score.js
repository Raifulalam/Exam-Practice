const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Score = require("../models/Score");

// Save score after a test submission
router.post("/", auth, async (req, res) => {
    try {
        const { practiceSetId, score, mode } = req.body;

        const newScore = new Score({
            user: req.user.id,
            practiceSet: practiceSetId,
            score,
            mode,
        });

        await newScore.save();
        res.json(newScore);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Get all scores for logged-in user
router.get("/my-scores", auth, async (req, res) => {
    try {
        const scores = await Score.find({ user: req.user.id }).populate("practiceSet");

        const totalAttempts = scores.length;
        const maxScore = scores.length > 0 ? Math.max(...scores.map(s => s.score)) : 0;
        const avgScore = scores.length > 0
            ? (scores.reduce((acc, s) => acc + s.score, 0) / scores.length).toFixed(2)
            : 0;

        res.json({ totalAttempts, maxScore, avgScore, scores });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
