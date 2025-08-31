const mongoose = require("mongoose");

const ResponseSchema = new mongoose.Schema({
    questionId: { type: mongoose.Schema.Types.ObjectId },
    answer: String,
    correct: { type: Boolean, default: null },
});

const GameResponseSchema = new mongoose.Schema(
    {
        game: { type: mongoose.Schema.Types.ObjectId, ref: "Game", required: true },
        player: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        responses: [ResponseSchema],
        score: { type: Number, default: 0 } // ✅ track score for quiz
    },
    { timestamps: true }
);

module.exports = mongoose.model("GameResponse", GameResponseSchema);
