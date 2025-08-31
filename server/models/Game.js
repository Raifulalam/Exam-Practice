const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: [String], // only for quiz type
    answer: String,    // correct answer for quiz
});

const GameSchema = new mongoose.Schema(
    {
        host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        gameType: { type: String, enum: ["quiz", "truth", "dare"], required: true },
        title: { type: String, required: true },
        description: String,
        questions: [QuestionSchema],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Game", GameSchema);
