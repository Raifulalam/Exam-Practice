const express = require("express");
const auth = require("../middleware/auth");
const Game = require("../models/Game.js");
const GameResponse = require("../models/GameResponse");

const router = express.Router();

// ✅ Create a game (host only)
router.post("/create", auth(["host"]), async (req, res) => {
    try {
        const { title, gameType, questions, gameCode } = req.body;

        if (!title || !gameType) {
            return res.status(400).json({ msg: "Title and type are required" });
        }

        const newGame = new Game({
            title,
            gameType,
            questions: questions || [],
            host: req.user.id, // from token
            gameCode
        });

        await newGame.save();

        return res.status(201).json({ msg: "Game created", game: newGame });
    } catch (err) {
        console.error("Error creating game:", err.message);
        return res.status(500).json({ msg: "Server error" });
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
router.post("/:gameId/attempt", auth, async (req, res) => {
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
router.get("/my-attempts", auth, async (req, res) => {
    try {
        const attempts = await GameResponse.find({ player: req.user.id })
            .populate("game", "title gameType gameCode");
        res.json(attempts);
    } catch (error) {
        console.error("Error fetching attempts:", error);
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
            .select("title gameType gameCode host createdAt");

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
        const myGames = await Game.find({ host: req.user.id });
        const gameCount = myGames.length;

        // fetch all attempts
        const attempts = await GameResponse.find({ game: { $in: myGames.map(g => g._id) } })
            .populate("player", "name email")
            .populate("game", "title gameCode");

        // summary per game
        const gameStats = myGames.map(game => {
            const gameAttempts = attempts.filter(a => String(a.game._id) === String(game._id));
            return {
                gameId: game._id,
                title: game.title,
                gameCode: game.gameCode,
                totalQuestions: game.questions.length || game.truths?.length || game.dares?.length || 0,
                totalAttempts: gameAttempts.length,
            };
        });

        return res.json({
            gameCount,
            totalAttempts: attempts.length,
            gameStats
        });
    } catch (error) {
        console.error("Error fetching host stats:", error);
        res.status(500).json({ error: "Failed to fetch host stats" });
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
router.post("/attempt/code/:gameCode", async (req, res) => {
    try {
        const { responses } = req.body; // [{questionId, answer}, ...]
        const game = await Game.findOne({ gameCode: req.params.gameCode });
        if (!game) return res.status(404).json({ error: "Game not found" });

        // Evaluate responses
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


module.exports = router;
