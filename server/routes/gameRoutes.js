const express = require("express");
const auth = require("../middleware/auth");
const Game = require("../models/Game.js");
const GameResponse = require("../models/GameResponse");

const router = express.Router();

// ✅ Create a game (host only)
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

        const newGame = new Game({
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

        await newGame.save();

        return res.status(201).json({ message: "Exam created successfully", game: newGame });
    } catch (err) {
        console.error("Error creating exam:", err.message);
        res.status(500).json({ error: "Failed to create exam" });
    }
});

// ✅ Get all games
// ✅ Get games created by the logged-in host
router.get("/mine", auth(["host"]), async (req, res) => {
    try {
        const games = await Game.find({ host: req.user.id })
            .sort({ createdAt: -1 }); // latest first
        res.json(games);
    } catch (error) {
        console.error("Error fetching host games:", error);
        res.status(500).json({ error: "Failed to fetch host games" });
    }
});


// ✅ Player attempts game
router.post("/:gameId/attempt", auth(["host"]), async (req, res) => {
    try {
        const { responses } = req.body; // [{questionId, answer}, ...]

        const game = await Game.findById(req.params.gameId);
        if (!game) return res.status(404).json({ error: "Game not found" });

        let score = 0;

        const evaluatedResponses = responses.map((r) => {
            const q = game.questions.find(q => String(q._id) === String(r.questionId));

            const correct = game.gameType === "quiz" && q ? q.answer === r.answer : null;
            if (correct) score++;

            return { questionId: r.questionId, answer: r.answer, correct };
        });

        const attempt = await GameResponse.create({
            game: game._id,
            player: req.user.id,
            responses: evaluatedResponses,
            score
        });

        res.status(201).json({ msg: "Attempt saved", attempt });
    } catch (error) {
        console.error("Error saving attempt:", error);
        res.status(500).json({ error: "Failed to save attempt" });
    }
});


// ✅ Get attempts of a player
router.get("/attempts/me", auth(["player"]), async (req, res) => {
    try {
        const attempts = await GameResponse.find({ player: req.user.id })
            .populate("game", "title gameType questions") // populate game title and questions
            .lean();

        res.json({ attempts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch attempts" });
    }
});

// ✅ Get all attempts for host's games with player details
router.get("/host/attempts", auth(["host"]), async (req, res) => {
    try {
        // Find all games created by this host
        const myGames = await Game.find({ host: req.user.id });
        const gameIds = myGames.map(g => g._id);

        // Fetch attempts for those games
        const attempts = await GameResponse.find({ game: { $in: gameIds } })
            .populate("player", "name email")   // who attempted
            .populate("game", "title gameCode questions truths dares"); // which game

        // format response with score & percentage
        const formatted = attempts.map(a => {
            const totalQuestions = a.game.questions?.length || a.game.truths?.length || a.game.dares?.length || 0;
            const percentage = totalQuestions > 0 ? Math.round((a.score / totalQuestions) * 100) : null;

            return {
                attemptId: a._id,
                gameId: a.game._id,
                gameTitle: a.game.title,
                gameCode: a.game.gameCode,
                playerName: a.player.name,
                playerEmail: a.player.email,
                score: a.score,
                percentage,
                attemptedAt: a.createdAt
            };
        });

        res.json(formatted);
    } catch (error) {
        console.error("Error fetching host attempts:", error);
        res.status(500).json({ error: "Failed to fetch host attempts" });
    }
});
// GET attempts for a specific game by host
router.get("/host/attempts/:gameCode", auth(["host"]), async (req, res) => {
    try {
        const game = await Game.findOne({ host: req.user.id, gameCode: req.params.gameCode });
        if (!game) return res.status(404).json({ error: "Game not found" });

        const attempts = await GameResponse.find({ game: game._id })
            .populate("player", "name email");

        const formatted = attempts.map(a => {
            const totalQuestions = game.questions?.length || game.truths?.length || game.dares?.length || 0;
            const percentage = totalQuestions > 0 ? Math.round((a.score / totalQuestions) * 100) : null;

            return {
                attemptId: a._id,
                playerName: a.player.name,
                playerEmail: a.player.email,
                score: a.score,
                percentage,
                attemptedAt: a.createdAt
            };
        });

        res.json(formatted);
    } catch (error) {
        console.error("Error fetching attempts for game:", error);
        res.status(500).json({ error: "Failed to fetch attempts" });
    }
});

// ✅ Get all games (for players to browse)
router.get("/all", auth(["player", "host"]), async (req, res) => {
    try {
        const games = await Game.find()
            .populate("host", "name email") // show host details
            .select("title gameType descriptions gameCode host createdAt questions");

        res.json(games);
    } catch (error) {
        console.error("Error fetching games:", error);
        res.status(500).json({ error: "Failed to fetch games" });
    }
});


// ✅ Get host dashboard stats
// ✅ Get host dashboard stats
router.get("/host/stats", auth(["host"]), async (req, res) => {
    try {
        console.log("Host stats requested by:", req.user);

        // 1️⃣ Fetch all games created by this host
        const myGames = await Game.find({ host: req.user.id });
        const gameCount = myGames.length;
        const gameIds = myGames.map(g => g._id);

        // 2️⃣ Fetch all attempts for these games
        const attempts = await GameResponse.find({ game: { $in: gameIds } })
            .populate("player", "name email")
            .populate("game", "title gameCode questions truths dares");

        // 3️⃣ Summary per game
        const gameStats = myGames.map(game => {
            const gameAttempts = attempts.filter(a => a.game && String(a.game._id) === String(game._id));
            return {
                gameId: game._id,
                title: game.title,
                gameCode: game.gameCode,
                totalQuestions:
                    game.questions?.length ||
                    game.truths?.length ||
                    game.dares?.length ||
                    0,
                totalAttempts: gameAttempts.length,
            };
        });

        // 4️⃣ Compute cumulative scores per player (leaderboard)
        const leaderboardMap = {};
        attempts.forEach(a => {
            if (!a.player) return; // skip if player is missing
            const playerId = a.player._id.toString();
            if (!leaderboardMap[playerId]) {
                leaderboardMap[playerId] = {
                    playerId,
                    name: a.player.name,
                    email: a.player.email,
                    totalScore: 0,
                    totalAttempts: 0,
                };
            }
            leaderboardMap[playerId].totalScore += a.score || 0;
            leaderboardMap[playerId].totalAttempts += 1;
        });

        const leaderboard = Object.values(leaderboardMap).sort(
            (a, b) => b.totalScore - a.totalScore
        );

        // 5️⃣ Determine top scorer and top participant
        const topScorer = leaderboard[0] || null;

        const topParticipant = leaderboard.reduce((max, player) => {
            return player.totalAttempts > (max?.totalAttempts || 0) ? player : max;
        }, null);

        // 6️⃣ Return stats
        return res.json({
            gameCount,
            totalAttempts: attempts.length,
            gameStats,
            topScorer,
            topParticipant,
            leaderboard // optional: include full leaderboard
        });

    } catch (error) {
        console.error("Error fetching host stats:", error);
        res.status(500).json({ error: error.message });
    }
});





// GET /api/games/join/:code
router.get("/join/:code", async (req, res) => {
    const code = req.params.code;
    console.log("Join request received for code:", code);

    try {
        const game = await Game.findOne({ gameCode: code });
        console.log("Game found:", game);

        if (!game) return res.status(404).json({ error: "Game not found" });

        res.json(game);
    } catch (err) {
        console.error("Error joining game:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /api/games/attempt/code/:gameCode
router.post("/attempt/code/:gameCode", auth(["player"]), async (req, res) => {
    try {
        const { responses } = req.body; // [{questionId, answer}, ...]
        const game = await Game.findOne({ gameCode: req.params.gameCode });
        if (!game) return res.status(404).json({ error: "Game not found" });

        // Evaluate responses (only for quiz)
        let score = 0;
        const evaluatedResponses = responses.map(r => {
            const q = game.questions.find(q => String(q._id) === String(r.questionId));
            const correct = game.gameType === "quiz" && q ? q.answer === r.answer : null;
            if (correct) score++;
            return { questionId: r.questionId, answer: r.answer, correct };
        });

        // Save attempt
        const attempt = await GameResponse.create({
            game: game._id,
            player: req.user.id, // use decoded user id from token
            responses: evaluatedResponses,
            score
        });
        res.status(201).json({
            msg: "Attempt saved",
            attempt,
            evaluatedResponses // include this for frontend feedback
        });
    } catch (error) {
        console.error("Error saving attempt:", error);
        res.status(500).json({ error: "Failed to save attempt" });
    }
});
router.get("/attempts", async (req, res) => {
    try {
        // populate player details instead of just player ID
        const attempts = await GameResponse.find()
            .populate("player", "name email") // fetch player info
            .populate("game", "title"); // optional: fetch game title

        res.json(attempts);
    } catch (err) {
        console.error("Error fetching attempts:", err);
        res.status(500).json({ error: "Failed to fetch attempts" });
    }
});
router.get("/leaderboard/full", async (req, res) => {
    try {
        const playerGameScores = await GameResponse.aggregate([
            // group by player + game
            {
                $group: {
                    _id: { player: "$player", game: "$game" },
                    totalScorePerGame: { $sum: "$score" },
                    attemptsPerGame: { $sum: 1 }
                }
            },
            // lookup player info
            {
                $lookup: {
                    from: "users",           // your User collection name
                    localField: "_id.player",
                    foreignField: "_id",
                    as: "player"
                }
            },
            { $unwind: "$player" },      // flatten the array
            // lookup game info
            {
                $lookup: {
                    from: "games",           // your Game collection name
                    localField: "_id.game",
                    foreignField: "_id",
                    as: "game"
                }
            },
            { $unwind: "$game" },        // flatten the array
            { $sort: { totalScorePerGame: -1 } } // sort descending
        ]);

        // merge scores per player
        const leaderboardMap = {};
        playerGameScores.forEach(entry => {
            const playerId = entry.player._id.toString();
            if (!leaderboardMap[playerId]) {
                leaderboardMap[playerId] = {
                    playerId,
                    name: entry.player.name,
                    email: entry.player.email,
                    totalScore: 0,
                    totalAttempts: 0,
                    games: []
                };
            }
            leaderboardMap[playerId].totalScore += entry.totalScorePerGame;
            leaderboardMap[playerId].totalAttempts += entry.attemptsPerGame;

            leaderboardMap[playerId].games.push({
                gameId: entry.game._id,
                title: entry.game.title,
                gameCode: entry.game.gameCode,
                score: entry.totalScorePerGame,
                attempts: entry.attemptsPerGame
            });
        });

        const leaderboard = Object.values(leaderboardMap).sort(
            (a, b) => b.totalScore - a.totalScore
        );

        res.json(leaderboard);

    } catch (err) {
        console.error("Error fetching full leaderboard:", err);
        res.status(500).json({ error: err.message });
    }
});



module.exports = router;
