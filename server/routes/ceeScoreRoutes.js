const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const CeeScore = require("../models/CeeScore");

// Save score
router.post("/score", auth(), async (req, res) => {
    try {
        const { score, mode, totalAttempt, totalQuestion } = req.body;

        if (totalQuestion <= 0) {
            return res.status(400).json({ msg: "Total questions must be greater than 0" });
        }

        const percentage = ((score / totalQuestion) * 100).toFixed(2);

        const newScore = new CeeScore({
            user: req.user.id,
            score,
            mode: mode || "practice",
            totalAttempt,
            totalQuestion,
            percentage,
        });

        await newScore.save();

        res.json({ msg: "Score saved successfully", score: newScore });
    } catch (err) {
        console.error("Error saving score:", err);
        res.status(500).json({ msg: "Server error while saving score" });
    }
});

// Get my scores + stats
router.get("/my-scores", auth(), async (req, res) => {
    try {
        const scores = await CeeScore.find({ user: req.user.id })
            .populate("user", "name email")
            .sort({ date: -1 });

        // Compute stats
        const totalAttempts = scores.reduce((acc, s) => acc + s.totalAttempt, 0);
        const totalQuestions = scores.reduce((acc, s) => acc + s.totalQuestion, 0);
        const highestScore = scores.reduce((max, s) => (s.score > max ? s.score : max), 0);
        const avgScore = scores.length
            ? (scores.reduce((acc, s) => acc + s.score, 0) / scores.length).toFixed(2)
            : 0;

        const stats = {
            totalAttempts,
            totalQuestions,
            highestScore,
            avgScore,
            totalSets: scores.length,
            scores, // keep the full score list
        };

        res.json(stats);
    } catch (err) {
        console.error("Error fetching scores:", err);
        res.status(500).json({ msg: "Server error while fetching scores" });
    }
});

// Admin: get all scores
router.get("/all-scores", auth("admin"), async (req, res) => {
    try {
        const scores = await CeeScore.find()
            .populate("user", "name email")
            .sort({ date: -1 });
        res.json(scores);
    } catch (err) {
        console.error("Error fetching all scores:", err);
        res.status(500).json({ msg: "Server error while fetching all scores" });
    }
});

module.exports = router;
