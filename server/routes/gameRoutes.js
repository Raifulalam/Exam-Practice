const express = require("express");
const auth = require("../middleware/auth");
const Game = require("../models/Game.js");
const GameResponse = require("../models/GameResponse");

const router = express.Router();

/* -------------------- HOST ROUTES -------------------- */

// ✅ Create a new game (host only)
router.post("/create", auth(["host"]), async (req, res) => {
    try {
        const { title, gameType, questions, gameCode, description, duration, passMarks, shuffleQuestions } = req.body;
        if (!title || !gameType || !gameCode) return res.status(400).json({ msg: "Title, type, and gameCode are required" });

        const newGame = new Game({
            host: req.user.id,
            title,
            gameType,
            questions: questions || [],
            gameCode,
            description,
            duration: duration || 0,
            passMarks: passMarks || 0,
            shuffleQuestions: shuffleQuestions ?? true
        });

        // auto calculate total marks
        newGame.totalMarks = newGame.questions.reduce((sum, q) => sum + (q.marks || 0), 0);
        await newGame.save();

        res.status(201).json({ msg: "Game created", game: newGame });
    } catch (err) {
        console.error("Error creating game:", err.message);
        res.status(500).json({ msg: "Server error" });
    }
});

// ✅ Get all games created by host
router.get("/mine", auth(["host"]), async (req, res) => {
    try {
        const games = await Game.find({ host: req.user.id }).sort({ createdAt: -1 });
        res.json(games);
    } catch (err) {
        console.error("Error fetching host games:", err);
        res.status(500).json({ error: "Failed to fetch host games" });
    }
});

// ✅ Get all attempts for host's games
router.get("/host/attempts", auth(["host"]), async (req, res) => {
    try {
        const myGames = await Game.find({ host: req.user.id });
        const gameIds = myGames.map(g => g._id);

        const attempts = await GameResponse.find({ game: { $in: gameIds } })
            .populate("player", "name email")
            .populate("game", "title gameCode questions");

        const formatted = attempts.map(a => {
            const totalQuestions = a.game.questions?.length || 0;
            const percentage = totalQuestions ? Math.round((a.score / totalQuestions) * 100) : null;

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
    } catch (err) {
        console.error("Error fetching host attempts:", err);
        res.status(500).json({ error: "Failed to fetch host attempts" });
    }
});
// ✅ Publish / Unpublish a game
router.patch("/publish/:id", auth(["host"]), async (req, res) => {
    try {
        const { isPublished } = req.body;

        const game = await Game.findOne({ _id: req.params.id, host: req.user.id });
        if (!game) return res.status(404).json({ msg: "Game not found or not owned by you" });

        game.isPublished = isPublished;
        await game.save();

        res.json({ msg: `Game ${isPublished ? "published" : "unpublished"} successfully`, game });
    } catch (err) {
        console.error("Error publishing game:", err);
        res.status(500).json({ error: "Failed to update game" });
    }
});


// ✅ Delete a game
router.delete("/delete/:id", auth(["host"]), async (req, res) => {
    try {
        const game = await Game.findOneAndDelete({ _id: req.params.id, host: req.user.id });
        if (!game) return res.status(404).json({ msg: "Game not found or not owned by you" });

        // Remove attempts linked to this game
        await GameResponse.deleteMany({ game: game._id });

        res.json({ msg: "Game and related attempts deleted successfully" });
    } catch (err) {
        console.error("Error deleting game:", err);
        res.status(500).json({ error: "Failed to delete game" });
    }
});


// ✅ Edit / Update a game (title, questions, etc.)
router.put("/edit/:id", auth(["host"]), async (req, res) => {
    try {
        const { title, description, questions } = req.body;

        const game = await Game.findOneAndUpdate(
            { _id: req.params.id, host: req.user.id },
            { title, description, questions },
            { new: true, runValidators: true }
        );

        if (!game) return res.status(404).json({ msg: "Game not found or not owned by you" });

        res.json({ msg: "Game updated successfully", game });
    } catch (err) {
        console.error("Error updating game:", err);
        res.status(500).json({ error: "Failed to update game" });
    }
});


// ✅ Get dashboard stats for host
// ✅ Get dashboard stats for host
router.get("/host/stats", auth(["host"]), async (req, res) => {
    try {
        const myGames = await Game.find({ host: req.user.id });
        const gameIds = myGames.map((g) => g._id);

        const attempts = await GameResponse.find({ game: { $in: gameIds } })
            .populate("player", "name email")
            .populate("game", "title gameCode");

        // 📊 Per-game breakdown
        const gameStats = myGames.map((game) => {
            const gameAttempts = attempts.filter(
                (a) => String(a.game._id) === String(game._id)
            );
            return {
                gameId: game._id,
                title: game.title,
                gameCode: game.gameCode,
                totalQuestions: game.questions.length,
                totalAttempts: gameAttempts.length,
                uniqueParticipants: new Set(
                    gameAttempts.map((a) => a.player?._id?.toString())
                ).size,
            };
        });

        // 🏆 Top scorer across all games
        const topScorer = attempts.length
            ? attempts.reduce((prev, curr) =>
                curr.score > (prev?.score || 0) ? curr : prev
            )
            : null;

        // 👥 Count unique participants across all host’s games
        const uniqueParticipants = new Set(
            attempts.map((a) => a.player?._id?.toString())
        );

        // 🎯 Top participant (most attempts overall)
        const attemptsCountMap = {};
        attempts.forEach((a) => {
            const id = a.player._id.toString();
            if (!attemptsCountMap[id]) {
                attemptsCountMap[id] = { ...a.player._doc, attempts: 0 };
            }
            attemptsCountMap[id].attempts++;
        });
        const topParticipant =
            Object.values(attemptsCountMap).sort((a, b) => b.attempts - a.attempts)[0] ||
            null;

        res.json({
            gameCount: myGames.length,
            totalAttempts: attempts.length,
            totalParticipants: uniqueParticipants.size, // ✅ NEW
            gameStats,
            topScorer,
            topParticipant,
        });
    } catch (err) {
        console.error("Error fetching host stats:", err);
        res.status(500).json({ error: "Failed to fetch host stats" });
    }
});


/* -------------------- PLAYER ROUTES -------------------- */

// ✅ Browse all published games
router.get("/all", auth(["player", "host"]), async (req, res) => {
    try {
        const games = await Game.find({ isPublished: true })
            .populate("host", "name email")
            .select("title gameType description gameCode host createdAt questions");
        res.json(games);
    } catch (err) {
        console.error("Error fetching games:", err);
        res.status(500).json({ error: "Failed to fetch games" });
    }
});

// ✅ Join a game by code
router.get("/join/:code", auth(["player"]), async (req, res) => {
    try {
        const game = await Game.findOne({ gameCode: req.params.code, isPublished: true });
        if (!game) return res.status(404).json({ error: "Game not found" });
        res.json(game);
    } catch (err) {
        console.error("Error joining game:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Submit attempt (by game ID)
router.post("/:gameId/attempt", auth(["player"]), async (req, res) => {
    try {
        const { responses } = req.body;
        const game = await Game.findById(req.params.gameId);
        if (!game) return res.status(404).json({ error: "Game not found" });

        const evaluatedResponses = responses.map(r => {
            const q = game.questions.find(q => String(q._id) === String(r.questionId));
            let correct = null;
            if (game.gameType === "quiz" || game.gameType === "exam") correct = q && q.answer === r.answer;
            const marksObtained = correct ? q.marks : 0;
            return { questionId: r.questionId, answer: r.answer, correct, marksObtained };
        });

        const score = evaluatedResponses.reduce((sum, r) => sum + (r.marksObtained || 0), 0);

        const attempt = await GameResponse.create({
            game: game._id,
            player: req.user.id,
            responses: evaluatedResponses,
            score
        });

        res.status(201).json({ msg: "Attempt saved", attempt, evaluatedResponses });
    } catch (err) {
        console.error("Error saving attempt:", err);
        res.status(500).json({ error: "Failed to save attempt" });
    }
});

// ✅ Get attempts of logged-in player
router.get("/attempts/me", auth(["player"]), async (req, res) => {
    try {
        const attempts = await GameResponse.find({ player: req.user.id })
            .populate("game", "title gameType questions")
            .lean();
        res.json({ attempts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch attempts" });
    }
});

module.exports = router;
