// const express = require("express");
// const auth = require("../middleware/auth");
// const Game = require("../models/Game.js");
// const GameResponse = require("../models/GameResponse");

// const router = express.Router();

// // ✅ Create a game (host only)
// router.post("/create", auth(["host"]), async (req, res) => {
//     try {
//         const { title, gameType, questions, gameCode, description } = req.body;

//         if (!title || !gameType) {
//             return res.status(400).json({ msg: "Title and type are required" });
//         }

//         const newGame = new Game({
//             title,
//             gameType,
//             questions: questions || [],
//             host: req.user.id, // from token
//             gameCode,
//             description
//         });

//         await newGame.save();

//         return res.status(201).json({ msg: "Game created", game: newGame });
//     } catch (err) {
//         console.error("Error creating game:", err.message);
//         return res.status(500).json({ msg: "Server error" });
//     }
// });

// // ✅ Get all games
// // ✅ Get games created by the logged-in host
// router.get("/mine", auth(["host"]), async (req, res) => {
//     try {
//         const games = await Game.find({ host: req.user.id })
//             .sort({ createdAt: -1 }); // latest first
//         res.json(games);
//     } catch (error) {
//         console.error("Error fetching host games:", error);
//         res.status(500).json({ error: "Failed to fetch host games" });
//     }
// });


// // ✅ Player attempts game
// router.post("/:gameId/attempt", auth(["host"]), async (req, res) => {
//     try {
//         const { responses } = req.body; // [{questionId, answer}, ...]

//         const game = await Game.findById(req.params.gameId);
//         if (!game) return res.status(404).json({ error: "Game not found" });

//         let score = 0;

//         const evaluatedResponses = responses.map((r) => {
//             const q = game.questions.find(q => String(q._id) === String(r.questionId));

//             const correct = game.gameType === "quiz" && q ? q.answer === r.answer : null;
//             if (correct) score++;

//             return { questionId: r.questionId, answer: r.answer, correct };
//         });

//         const attempt = await GameResponse.create({
//             game: game._id,
//             player: req.user.id,
//             responses: evaluatedResponses,
//             score
//         });

//         res.status(201).json({ msg: "Attempt saved", attempt });
//     } catch (error) {
//         console.error("Error saving attempt:", error);
//         res.status(500).json({ error: "Failed to save attempt" });
//     }
// });


// // ✅ Get attempts of a player
// router.get("/attempts/me", auth(["player"]), async (req, res) => {
//     try {
//         const attempts = await GameResponse.find({ player: req.user.id })
//             .populate("game", "title gameType questions") // populate game title and questions
//             .lean();

//         res.json({ attempts });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "Failed to fetch attempts" });
//     }
// });

// // ✅ Get all attempts for host's games with player details
// router.get("/host/attempts", auth(["host"]), async (req, res) => {
//     try {
//         // Find all games created by this host
//         const myGames = await Game.find({ host: req.user.id });
//         const gameIds = myGames.map(g => g._id);

//         // Fetch attempts for those games
//         const attempts = await GameResponse.find({ game: { $in: gameIds } })
//             .populate("player", "name email")   // who attempted
//             .populate("game", "title gameCode questions truths dares"); // which game

//         // format response with score & percentage
//         const formatted = attempts.map(a => {
//             const totalQuestions = a.game.questions?.length || a.game.truths?.length || a.game.dares?.length || 0;
//             const percentage = totalQuestions > 0 ? Math.round((a.score / totalQuestions) * 100) : null;

//             return {
//                 attemptId: a._id,
//                 gameId: a.game._id,
//                 gameTitle: a.game.title,
//                 gameCode: a.game.gameCode,
//                 playerName: a.player.name,
//                 playerEmail: a.player.email,
//                 score: a.score,
//                 percentage,
//                 attemptedAt: a.createdAt
//             };
//         });

//         res.json(formatted);
//     } catch (error) {
//         console.error("Error fetching host attempts:", error);
//         res.status(500).json({ error: "Failed to fetch host attempts" });
//     }
// });
// // GET attempts for a specific game by host
// router.get("/host/attempts/:gameCode", auth(["host"]), async (req, res) => {
//     try {
//         const game = await Game.findOne({ host: req.user.id, gameCode: req.params.gameCode });
//         if (!game) return res.status(404).json({ error: "Game not found" });

//         const attempts = await GameResponse.find({ game: game._id })
//             .populate("player", "name email");

//         const formatted = attempts.map(a => {
//             const totalQuestions = game.questions?.length || game.truths?.length || game.dares?.length || 0;
//             const percentage = totalQuestions > 0 ? Math.round((a.score / totalQuestions) * 100) : null;

//             return {
//                 attemptId: a._id,
//                 playerName: a.player.name,
//                 playerEmail: a.player.email,
//                 score: a.score,
//                 percentage,
//                 attemptedAt: a.createdAt
//             };
//         });

//         res.json(formatted);
//     } catch (error) {
//         console.error("Error fetching attempts for game:", error);
//         res.status(500).json({ error: "Failed to fetch attempts" });
//     }
// });

// // ✅ Get all games (for players to browse)
// router.get("/all", auth(["player", "host"]), async (req, res) => {
//     try {
//         const games = await Game.find()
//             .populate("host", "name email") // show host details
//             .select("title gameType descriptions gameCode host createdAt questions");

//         res.json(games);
//     } catch (error) {
//         console.error("Error fetching games:", error);
//         res.status(500).json({ error: "Failed to fetch games" });
//     }
// });


// // ✅ Get host dashboard stats
// // ✅ Get host dashboard stats
// router.get("/host/stats", auth(["host"]), async (req, res) => {
//     try {
//         console.log("Host stats requested by:", req.user);

//         // 1️⃣ Fetch all games created by this host
//         const myGames = await Game.find({ host: req.user.id });
//         const gameCount = myGames.length;
//         const gameIds = myGames.map(g => g._id);

//         // 2️⃣ Fetch all attempts for these games
//         const attempts = await GameResponse.find({ game: { $in: gameIds } })
//             .populate("player", "name email")
//             .populate("game", "title gameCode questions truths dares");

//         // 3️⃣ Summary per game
//         const gameStats = myGames.map(game => {
//             const gameAttempts = attempts.filter(a => a.game && String(a.game._id) === String(game._id));
//             return {
//                 gameId: game._id,
//                 title: game.title,
//                 gameCode: game.gameCode,
//                 totalQuestions:
//                     game.questions?.length ||
//                     game.truths?.length ||
//                     game.dares?.length ||
//                     0,
//                 totalAttempts: gameAttempts.length,
//             };
//         });

//         // 4️⃣ Compute cumulative scores per player (leaderboard)
//         const leaderboardMap = {};
//         attempts.forEach(a => {
//             if (!a.player) return; // skip if player is missing
//             const playerId = a.player._id.toString();
//             if (!leaderboardMap[playerId]) {
//                 leaderboardMap[playerId] = {
//                     playerId,
//                     name: a.player.name,
//                     email: a.player.email,
//                     totalScore: 0,
//                     totalAttempts: 0,
//                 };
//             }
//             leaderboardMap[playerId].totalScore += a.score || 0;
//             leaderboardMap[playerId].totalAttempts += 1;
//         });

//         const leaderboard = Object.values(leaderboardMap).sort(
//             (a, b) => b.totalScore - a.totalScore
//         );

//         // 5️⃣ Determine top scorer and top participant
//         const topScorer = leaderboard[0] || null;

//         const topParticipant = leaderboard.reduce((max, player) => {
//             return player.totalAttempts > (max?.totalAttempts || 0) ? player : max;
//         }, null);

//         // 6️⃣ Return stats
//         return res.json({
//             gameCount,
//             totalAttempts: attempts.length,
//             gameStats,
//             topScorer,
//             topParticipant,
//             leaderboard // optional: include full leaderboard
//         });

//     } catch (error) {
//         console.error("Error fetching host stats:", error);
//         res.status(500).json({ error: error.message });
//     }
// });





// // GET /api/games/join/:code
// router.get("/join/:code", async (req, res) => {
//     const code = req.params.code;
//     console.log("Join request received for code:", code);

//     try {
//         const game = await Game.findOne({ gameCode: code });
//         console.log("Game found:", game);

//         if (!game) return res.status(404).json({ error: "Game not found" });

//         res.json(game);
//     } catch (err) {
//         console.error("Error joining game:", err);
//         res.status(500).json({ error: "Server error" });
//     }
// });

// // POST /api/games/attempt/code/:gameCode
// router.post("/attempt/code/:gameCode", auth(["player"]), async (req, res) => {
//     try {
//         const { responses } = req.body; // [{questionId, answer}, ...]
//         const game = await Game.findOne({ gameCode: req.params.gameCode });
//         if (!game) return res.status(404).json({ error: "Game not found" });

//         // Evaluate responses (only for quiz)
//         let score = 0;
//         const evaluatedResponses = responses.map(r => {
//             const q = game.questions.find(q => String(q._id) === String(r.questionId));
//             const correct = game.gameType === "quiz" && q ? q.answer === r.answer : null;
//             if (correct) score++;
//             return { questionId: r.questionId, answer: r.answer, correct };
//         });

//         // Save attempt
//         const attempt = await GameResponse.create({
//             game: game._id,
//             player: req.user.id, // use decoded user id from token
//             responses: evaluatedResponses,
//             score
//         });
//         res.status(201).json({
//             msg: "Attempt saved",
//             attempt,
//             evaluatedResponses // include this for frontend feedback
//         });
//     } catch (error) {
//         console.error("Error saving attempt:", error);
//         res.status(500).json({ error: "Failed to save attempt" });
//     }
// });
// router.get("/attempts", async (req, res) => {
//     try {
//         // populate player details instead of just player ID
//         const attempts = await GameResponse.find()
//             .populate("player", "name email") // fetch player info
//             .populate("game", "title"); // optional: fetch game title

//         res.json(attempts);
//     } catch (err) {
//         console.error("Error fetching attempts:", err);
//         res.status(500).json({ error: "Failed to fetch attempts" });
//     }
// });
// router.get("/leaderboard/full", async (req, res) => {
//     try {
//         const playerGameScores = await GameResponse.aggregate([
//             // group by player + game
//             {
//                 $group: {
//                     _id: { player: "$player", game: "$game" },
//                     totalScorePerGame: { $sum: "$score" },
//                     attemptsPerGame: { $sum: 1 }
//                 }
//             },
//             // lookup player info
//             {
//                 $lookup: {
//                     from: "users",           // your User collection name
//                     localField: "_id.player",
//                     foreignField: "_id",
//                     as: "player"
//                 }
//             },
//             { $unwind: "$player" },      // flatten the array
//             // lookup game info
//             {
//                 $lookup: {
//                     from: "games",           // your Game collection name
//                     localField: "_id.game",
//                     foreignField: "_id",
//                     as: "game"
//                 }
//             },
//             { $unwind: "$game" },        // flatten the array
//             { $sort: { totalScorePerGame: -1 } } // sort descending
//         ]);

//         // merge scores per player
//         const leaderboardMap = {};
//         playerGameScores.forEach(entry => {
//             const playerId = entry.player._id.toString();
//             if (!leaderboardMap[playerId]) {
//                 leaderboardMap[playerId] = {
//                     playerId,
//                     name: entry.player.name,
//                     email: entry.player.email,
//                     totalScore: 0,
//                     totalAttempts: 0,
//                     games: []
//                 };
//             }
//             leaderboardMap[playerId].totalScore += entry.totalScorePerGame;
//             leaderboardMap[playerId].totalAttempts += entry.attemptsPerGame;

//             leaderboardMap[playerId].games.push({
//                 gameId: entry.game._id,
//                 title: entry.game.title,
//                 gameCode: entry.game.gameCode,
//                 score: entry.totalScorePerGame,
//                 attempts: entry.attemptsPerGame
//             });
//         });

//         const leaderboard = Object.values(leaderboardMap).sort(
//             (a, b) => b.totalScore - a.totalScore
//         );

//         res.json(leaderboard);

//     } catch (err) {
//         console.error("Error fetching full leaderboard:", err);
//         res.status(500).json({ error: err.message });
//     }
// });



// module.exports = router;

const express = require("express");
const Exam = require("../models/Exam");
const ExamResponse = require("../models/ExamResponse");
const auth = require("../middleware/auth"); // ✅ assumes you already have role-based auth
const router = express.Router();
const mongoose = require("mongoose");


// 🟢 Create Exam (only teachers/hosts)
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
            createdBy: req.user.id, // host from token
            examCode
        });

        await exam.save();

        res.status(201).json({
            message: "Exam created successfully",
            exam
        });
    } catch (err) {
        console.error("Error creating exam:", err.message);
        res.status(500).json({ error: "Failed to create exam" });
    }
});


// 🟢 Get all active exams
router.get("/all", auth(), async (req, res) => {
    try {
        const exams = await Exam.find({ isActive: true }).select("-questions.correctAnswer");
        res.json(exams);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// 🟢 Join Exam by Code
router.get("/join/:code", auth(["student"]), async (req, res) => {
    try {
        const exam = await Exam.findOne({ examCode: req.params.code, isActive: true });
        if (!exam) return res.status(404).json({ error: "Exam not found" });

        // remove correct answers before sending to students
        const safeExam = exam.toObject();
        safeExam.questions = safeExam.questions.map(q => {
            const { correctAnswer, ...rest } = q;
            return rest;
        });

        res.json(safeExam);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// 🟢 Submit Attempt
router.post("/:examId/attempt", auth(["student"]), async (req, res) => {
    try {
        const { responses } = req.body;
        const exam = await Exam.findById(req.params.examId);
        if (!exam) return res.status(404).json({ error: "Exam not found" });

        // Prevent multiple attempts if attemptsAllowed = 1
        const existing = await ExamResponse.findOne({ exam: exam._id, student: req.user.id });
        if (existing) return res.status(400).json({ error: "You already attempted this exam" });

        let score = 0;
        let total = 0;

        const evaluatedResponses = exam.questions.map(q => {
            const r = responses.find(r => String(r.questionId) === String(q._id));
            if (!r) return { questionId: q._id, givenAnswer: null, isCorrect: false, marksObtained: 0 };

            let isCorrect = false;
            if (q.questionType === "mcq" || q.questionType === "true_false") {
                isCorrect = String(q.correctAnswer).toLowerCase().trim() === String(r.givenAnswer).toLowerCase().trim();
            } else if (q.questionType === "short_answer") {
                // optional: implement fuzzy matching or exact string match
                isCorrect = String(q.correctAnswer).toLowerCase().trim() === String(r.givenAnswer).toLowerCase().trim();
            }

            const marksObtained = isCorrect ? q.marks : (exam.settings.allowNegativeMarking ? -q.negativeMarks : 0);
            score += marksObtained;
            total += q.marks;

            return {
                questionId: q._id,
                givenAnswer: r.givenAnswer,
                isCorrect,
                marksObtained,
                timeTaken: r.timeTaken || 0
            };
        });

        const percentage = (score / total) * 100;

        const attempt = new ExamResponse({
            exam: exam._id,
            student: req.user.id,
            responses: evaluatedResponses,
            score,
            percentage,
            status: "completed",
            completedAt: new Date(),
            duration: exam.duration * 60
        });

        await attempt.save();
        res.json(attempt);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// 🟢 Get My Attempts
router.get("/attempts/me", auth(["student"]), async (req, res) => {
    try {
        const attempts = await ExamResponse.find({ student: req.user.id })
            .populate("exam", "title subject examCode")
            .sort({ createdAt: -1 });

        res.json(attempts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// 🟢 Host: View Attempts for Exam
router.get("/:examId/attempts", auth(["host"]), async (req, res) => {
    try {
        const attempts = await ExamResponse.find({ exam: req.params.examId })
            .populate("student", "name email")
            .sort({ score: -1 });

        res.json(attempts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// 🟢 Leaderboard for Exam
router.get("/:examId/leaderboard", auth(), async (req, res) => {
    try {
        const leaderboard = await ExamResponse.aggregate([
            { $match: { exam: new mongoose.Types.ObjectId(req.params.examId) } },
            {
                $lookup: {
                    from: "users",
                    localField: "student",
                    foreignField: "_id",
                    as: "student"
                }
            },
            { $unwind: "$student" },
            {
                $project: {
                    _id: 1,
                    score: 1,
                    percentage: 1,
                    "student._id": 1,
                    "student.name": 1,
                    "student.email": 1
                }
            },
            { $sort: { score: -1, percentage: -1 } }
        ]);

        res.json(leaderboard);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 🟢 Host: Exam Stats (overview + question-wise analysis)
router.get("/:examId/stats", auth(["host"]), async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.examId);
        if (!exam) return res.status(404).json({ error: "Exam not found" });

        const attempts = await ExamResponse.find({ exam: exam._id });

        if (!attempts.length) {
            return res.json({
                totalAttempts: 0,
                avgScore: 0,
                passRate: 0,
                questionStats: []
            });
        }

        // 📌 Overall Stats
        const totalAttempts = attempts.length;
        const totalScores = attempts.reduce((sum, a) => sum + a.score, 0);
        const avgScore = totalScores / totalAttempts;

        const passCount = attempts.filter(a => a.score >= exam.passingMarks).length;
        const passRate = (passCount / totalAttempts) * 100;

        // 📌 Question-wise Stats
        const questionStats = exam.questions.map(q => {
            const qAttempts = attempts.map(a =>
                a.responses.find(r => String(r.questionId) === String(q._id))
            ).filter(Boolean);

            const attemptedCount = qAttempts.length;
            const correctCount = qAttempts.filter(r => r.isCorrect).length;
            const avgMarks = qAttempts.reduce((sum, r) => sum + (r.marksObtained || 0), 0) / (attemptedCount || 1);

            return {
                questionId: q._id,
                questionText: q.questionText,
                attemptedCount,
                correctCount,
                accuracy: attemptedCount ? (correctCount / attemptedCount) * 100 : 0,
                avgMarks
            };
        });

        res.json({
            examId: exam._id,
            title: exam.title,
            subject: exam.subject,
            totalAttempts,
            avgScore,
            passRate,
            questionStats
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
