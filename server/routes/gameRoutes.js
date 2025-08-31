const express = require("express");
const auth = require("../middleware/auth");
const Game = require("../models/Game.js");
const GameResponse = require("../models/GameResponse");

const router = express.Router();

// ✅ Create a game (host only)
router.post("/create", auth, async (req, res) => {
    try {
        const { gameType, title, description, questions } = req.body;

        const newGame = await Game.create({
            host: req.user.id,
            gameType,
            title,
            description,
            questions,
        });

        res.status(201).json(newGame);
    } catch (error) {
        console.error("Error creating game:", error);
        res.status(500).json({ error: "Failed to create game" });
    }
});

// ✅ Get all games
router.get("/", auth, async (req, res) => {
    try {
        const games = await Game.find().populate("host", "email");
        res.json(games);
    } catch (error) {
        console.error("Error fetching games:", error);
        res.status(500).json({ error: "Failed to fetch games" });
    }
});

// ✅ Player attempts game
router.post("/:gameId/attempt", auth, async (req, res) => {
    try {
        const { responses } = req.body; // [{questionId, answer}, ...]

        const game = await Game.findById(req.params.gameId);
        if (!game) return res.status(404).json({ error: "Game not found" });

        const evaluatedResponses = responses.map((r) => {
            const q = game.questions.find(
                (q) => String(q._id) === String(r.questionId)
            );

            return {
                questionId: r.questionId,
                answer: r.answer,
                correct: game.gameType === "quiz" && q ? q.answer === r.answer : null,
            };
        });


        const attempt = await GameResponse.create({
            game: game._id,
            player: req.user.id,
            responses: evaluatedResponses,
        });

        res.status(201).json(attempt);
    } catch (error) {
        console.error("Error saving attempt:", error);
        res.status(500).json({ error: "Failed to save attempt" });
    }
});

// ✅ Get attempts of a player
router.get("/my-attempts", auth, async (req, res) => {
    try {
        const attempts = await GameResponse.find({ player: req.user.id })
            .populate("game", "title gameType");
        res.json(attempts);
    } catch (error) {
        console.error("Error fetching attempts:", error);
        res.status(500).json({ error: "Failed to fetch attempts" });
    }
});

module.exports = router;
