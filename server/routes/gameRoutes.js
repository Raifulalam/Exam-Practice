const express = require("express");
const mongoose = require("mongoose");
const Exam = require("../models/Exam");
const ExamResponse = require("../models/ExamResponse");
const auth = require("../middleware/auth");

const router = express.Router();

/**
 * ✅ Create Exam (only hosts/teachers)
 */
router.post("/create", auth(["host"]), async (req, res) => {
    try {
        const {
            title,
            subject,
            description,
            questions,
            totalMarks,
            passingMarks,
            duration,
            startTime,
            endTime,
            examCode
        } = req.body;

        if (!title || !subject || !duration || !examCode) {
            return res.status(400).json({ error: "Title, subject, duration, and examCode are required" });
        }

        const exam = new Exam({
            title,
            subject,
            description,
            questions,
            totalMarks,
            passingMarks,
            duration,
            startTime,
            endTime,
            createdBy: req.user.id,
            examCode
        });

        await exam.save();

        res.status(201).json({ message: "Exam created successfully", exam });
    } catch (err) {
        console.error("Error creating exam:", err);
        res.status(500).json({ error: "Failed to create exam" });
    }
});

/**
 * ✅ Get all exams created by logged-in host
 */
router.get("/mine", auth(["host"]), async (req, res) => {
    try {
        const exams = await Exam.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
        res.json(exams);
    } catch (error) {
        console.error("Error fetching host exams:", error);
        res.status(500).json({ error: "Failed to fetch exams" });
    }
});

/**
 * ✅ Attempt Exam (player submits responses)
 */
router.post("/:examId/attempt", auth(["player"]), async (req, res) => {
    try {
        const { responses } = req.body; // [{questionId, givenAnswer, timeTaken}]
        const exam = await Exam.findById(req.params.examId);
        if (!exam) return res.status(404).json({ error: "Exam not found" });

        let score = 0;
        const evaluatedResponses = responses.map(r => {
            const q = exam.questions.find(q => String(q._id) === String(r.questionId));
            if (!q) return { ...r, isCorrect: null, marksObtained: 0 };

            let isCorrect = false;
            if (q.questionType === "mcq" || q.questionType === "true_false") {
                isCorrect = q.correctAnswer === r.givenAnswer;
            } else if (q.questionType === "short_answer") {
                isCorrect = q.correctAnswer.toLowerCase().trim() === String(r.givenAnswer).toLowerCase().trim();
            }

            const marksObtained = isCorrect
                ? q.marks
                : exam.settings?.allowNegativeMarking
                    ? -q.negativeMarks
                    : 0;

            score += marksObtained;

            return {
                questionId: r.questionId,
                givenAnswer: r.givenAnswer,
                isCorrect,
                marksObtained,
                timeTaken: r.timeTaken || 0
            };
        });

        const percentage = exam.totalMarks > 0 ? (score / exam.totalMarks) * 100 : 0;

        const attempt = await ExamResponse.create({
            exam: exam._id,
            player: req.user.id,
            responses: evaluatedResponses,
            score,
            percentage,
            status: "completed",
            completedAt: new Date()
        });

        res.status(201).json({ msg: "Attempt saved", attempt, evaluatedResponses });
    } catch (error) {
        console.error("Error saving exam attempt:", error);
        res.status(500).json({ error: "Failed to save attempt" });
    }
});

/**
 * ✅ Get attempts of logged-in player
 */
router.get("/attempts/me", auth(["player"]), async (req, res) => {
    try {
        const attempts = await ExamResponse.find({ player: req.user.id })
            .populate("exam", "title subject duration totalMarks")
            .lean();

        res.json({ attempts });
    } catch (err) {
        console.error("Error fetching player attempts:", err);
        res.status(500).json({ error: "Failed to fetch attempts" });
    }
});

/**
 * ✅ Get all attempts for exams created by this host
 */
router.get("/host/attempts", auth(["host"]), async (req, res) => {
    try {
        const myExams = await Exam.find({ createdBy: req.user.id });
        const examIds = myExams.map(e => e._id);

        const attempts = await ExamResponse.find({ exam: { $in: examIds } })
            .populate("player", "name email")
            .populate("exam", "title examCode totalMarks");

        const formatted = attempts.map(a => ({
            attemptId: a._id,
            examId: a.exam._id,
            examTitle: a.exam.title,
            examCode: a.exam.examCode,
            playerName: a.player?.name,
            playerEmail: a.player?.email,
            score: a.score,
            percentage: a.percentage,
            attemptedAt: a.createdAt
        }));

        res.json(formatted);
    } catch (error) {
        console.error("Error fetching host attempts:", error);
        res.status(500).json({ error: "Failed to fetch attempts" });
    }
});

/**
 * ✅ Get attempts for a specific exam by examCode
 */
router.get("/host/attempts/:examCode", auth(["host"]), async (req, res) => {
    try {
        const exam = await Exam.findOne({ createdBy: req.user.id, examCode: req.params.examCode });
        if (!exam) return res.status(404).json({ error: "Exam not found" });

        const attempts = await ExamResponse.find({ exam: exam._id }).populate("player", "name email");

        const formatted = attempts.map(a => ({
            attemptId: a._id,
            playerName: a.player?.name,
            playerEmail: a.player?.email,
            score: a.score,
            percentage: a.percentage,
            attemptedAt: a.createdAt
        }));

        res.json(formatted);
    } catch (error) {
        console.error("Error fetching exam attempts:", error);
        res.status(500).json({ error: "Failed to fetch attempts" });
    }
});

/**
 * ✅ Get all exams (for browsing/joining)
 */
router.get("/all", auth(["player", "host"]), async (req, res) => {
    try {
        const exams = await Exam.find()
            .populate("createdBy", "name email")
            .select("title subject examCode duration totalMarks createdAt");

        res.json(exams);
    } catch (error) {
        console.error("Error fetching exams:", error);
        res.status(500).json({ error: "Failed to fetch exams" });
    }
});

/**
 * ✅ Join exam by code
 */
router.get("/join/:code", async (req, res) => {
    try {
        const exam = await Exam.findOne({ examCode: req.params.code });
        if (!exam) return res.status(404).json({ error: "Exam not found" });

        res.json(exam);
    } catch (err) {
        console.error("Error joining exam:", err);
        res.status(500).json({ error: "Server error" });
    }
});

/**
 * ✅ Get all attempts (admin/debug)
 */
router.get("/attempts", async (req, res) => {
    try {
        const attempts = await ExamResponse.find()
            .populate("player", "name email")
            .populate("exam", "title");
        res.json(attempts);
    } catch (err) {
        console.error("Error fetching attempts:", err);
        res.status(500).json({ error: "Failed to fetch attempts" });
    }
});

/**
 * ✅ Leaderboard across all exams
 */
router.get("/leaderboard/full", async (req, res) => {
    try {
        const playerExamScores = await ExamResponse.aggregate([
            {
                $group: {
                    _id: { player: "$player", exam: "$exam" },
                    totalScorePerExam: { $sum: "$score" },
                    attemptsPerExam: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id.player",
                    foreignField: "_id",
                    as: "player"
                }
            },
            { $unwind: "$player" },
            {
                $lookup: {
                    from: "exams",
                    localField: "_id.exam",
                    foreignField: "_id",
                    as: "exam"
                }
            },
            { $unwind: "$exam" },
            { $sort: { totalScorePerExam: -1 } }
        ]);

        const leaderboardMap = {};
        playerExamScores.forEach(entry => {
            const playerId = entry.player._id.toString();
            if (!leaderboardMap[playerId]) {
                leaderboardMap[playerId] = {
                    playerId,
                    name: entry.player.name,
                    email: entry.player.email,
                    totalScore: 0,
                    totalAttempts: 0,
                    exams: []
                };
            }
            leaderboardMap[playerId].totalScore += entry.totalScorePerExam;
            leaderboardMap[playerId].totalAttempts += entry.attemptsPerExam;

            leaderboardMap[playerId].exams.push({
                examId: entry.exam._id,
                title: entry.exam.title,
                examCode: entry.exam.examCode,
                score: entry.totalScorePerExam,
                attempts: entry.attemptsPerExam
            });
        });

        const leaderboard = Object.values(leaderboardMap).sort((a, b) => b.totalScore - a.totalScore);

        res.json(leaderboard);
    } catch (err) {
        console.error("Error fetching full leaderboard:", err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * ✅ Host dashboard stats
 */
router.get("/host/stats", auth(["host"]), async (req, res) => {
    try {
        const myExams = await Exam.find({ createdBy: req.user.id });
        const examCount = myExams.length;
        const examIds = myExams.map(e => e._id);

        const attempts = await ExamResponse.find({ exam: { $in: examIds } })
            .populate("player", "name email")
            .populate("exam", "title examCode questions");

        const examStats = myExams.map(exam => {
            const examAttempts = attempts.filter(a => a.exam && String(a.exam._id) === String(exam._id));
            return {
                examId: exam._id,
                title: exam.title,
                examCode: exam.examCode,
                totalQuestions: exam.questions?.length || 0,
                totalAttempts: examAttempts.length
            };
        });

        const leaderboardMap = {};
        attempts.forEach(a => {
            if (!a.player) return;
            const playerId = a.player._id.toString();
            if (!leaderboardMap[playerId]) {
                leaderboardMap[playerId] = {
                    playerId,
                    name: a.player.name,
                    email: a.player.email,
                    totalScore: 0,
                    totalAttempts: 0
                };
            }
            leaderboardMap[playerId].totalScore += a.score || 0;
            leaderboardMap[playerId].totalAttempts += 1;
        });

        const leaderboard = Object.values(leaderboardMap).sort((a, b) => b.totalScore - a.totalScore);

        res.json({
            examCount,
            totalAttempts: attempts.length,
            examStats,
            topScorer: leaderboard[0] || null,
            topParticipant: leaderboard.reduce(
                (max, player) => (player.totalAttempts > (max?.totalAttempts || 0) ? player : max),
                null
            ),
            leaderboard
        });
    } catch (error) {
        console.error("Error fetching host stats:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
