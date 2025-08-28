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

// Get my scores
// Get my scores
router.get("/my-scores", auth(), async (req, res) => {
    try {
        const scores = await CeeScore.find({ user: req.user.id })
            .populate("user", "name email")
            .sort({ date: -1 });
        res.json({ scores }); // wrap in object
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
