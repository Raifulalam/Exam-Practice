const mongoose = require("mongoose");

// -------------------- Question Schema --------------------
const QuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true,
    },
    options: [
        {
            type: String,
            trim: true,
        },
    ], // Only for quiz type
    answer: {
        type: String,
        trim: true, // Correct answer for quiz
    },
});

// -------------------- Game Schema --------------------
const GameSchema = new mongoose.Schema(
    {
        host: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        gameType: {
            type: String,
            enum: ["quiz", "truth", "dare"],
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        subject: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        questions: [QuestionSchema],
        gameCode: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
    },
    { timestamps: true }
);

// -------------------- Export Model --------------------
module.exports = mongoose.model("Game", GameSchema);
