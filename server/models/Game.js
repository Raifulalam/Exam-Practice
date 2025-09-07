

const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    questionType: { type: String, enum: ["mcq", "shortAnswer", "longAnswer", "truth", "dare"], default: "mcq" },
    options: [String], // only for MCQs
    answer: String, // correct answer for MCQs / exams
    marks: { type: Number, default: 1 }, // weightage
    explanation: String, // optional explanation
    media: String, // image/audio/video URL
});

const GameSchema = new mongoose.Schema(
    {
        host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        gameType: { type: String, enum: ["quiz", "exam", "truth", "dare", "competitive"], required: true },
        title: { type: String, required: true },
        description: String,

        questions: [QuestionSchema], // embed for smaller games or reference for huge exams
        gameCode: { type: String, required: true, unique: true },

        // Game settings
        duration: { type: Number, default: 0 }, // in minutes
        totalMarks: { type: Number, default: 0 },
        passMarks: { type: Number, default: 0 }, // for exam/competitive
        shuffleQuestions: { type: Boolean, default: true }, // randomize questions
        maxParticipants: { type: Number, default: 0 }, // 0 = unlimited
        isPublished: { type: Boolean, default: false },

        // Participants
        participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

        // Optional competitive settings
        leaderboardEnabled: { type: Boolean, default: false },
        resultVisibility: { type: String, enum: ["public", "private"], default: "private" },
    },
    { timestamps: true }
);

// Index for faster lookup by code or host
GameSchema.index({ gameCode: 1 });
GameSchema.index({ host: 1 });

module.exports = mongoose.model("Game", GameSchema);
