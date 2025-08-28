// routes/practiceSet.js
const express = require("express");
const router = express.Router();
const PracticeSet = require("../models/PracticeSet");
const auth = require("../middleware/auth");
const Result = require('../models/Attempt');

// ✅ Create a new practice set
router.post("/", auth(), async (req, res) => {
    try {
        const { title, questions } = req.body;

        if (!title || !questions || questions.length === 0) {
            return res.status(400).json({ msg: "Title and questions are required" });
        }

        const newSet = new PracticeSet({
            title,
            questions,
            createdBy: req.user.id,
        });

        await newSet.save();
        res.status(201).json(newSet);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server error" });
    }
});

// ✅ Get all sets of logged-in player
router.get("/", auth(), async (req, res) => {
    try {
        const sets = await PracticeSet.find({ createdBy: req.user.id });
        res.json(sets);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server error" });
    }
});

// ✅ Get single practice set (with questions)
router.get("/:id", auth(), async (req, res) => {
    try {
        const set = await PracticeSet.findById(req.params.id);
        if (!set) return res.status(404).json({ msg: "Set not found" });

        // Check ownership
        if (set.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ msg: "Not authorized" });
        }

        res.json(set);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server error" });
    }
});

// ✅ Submit answers and calculate score
// ✅ Submit answers and calculate score
router.post("/:id/submit", auth(), async (req, res) => {
    try {
        const { id } = req.params;
        const { answers } = req.body;

        const set = await PracticeSet.findById(id);
        if (!set) return res.status(404).json({ error: "Set not found" });

        let correct = 0;
        set.questions.forEach((q, idx) => {
            if (answers[idx] === q.correctAnswer) correct++;
        });

        const result = {
            correct,
            total: set.questions.length,
            percentage: ((correct / set.questions.length) * 100).toFixed(2),
        };

        // ✅ Save result in DB
        await Result.create({
            setId: id,
            userId: req.user.id,
            ...result,
        });

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});


// ✅ Delete a practice set
router.delete("/:id", auth(), async (req, res) => {
    try {
        const set = await PracticeSet.findById(req.params.id);
        if (!set) return res.status(404).json({ msg: "Set not found" });

        if (set.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ msg: "Not authorized" });
        }

        await set.deleteOne();
        res.json({ msg: "Practice set deleted successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server error" });
    }
});

module.exports = router;
