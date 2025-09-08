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
    marks: {
        type: Number,
        default: 1, // Each question default 1 mark
    },
});

// -------------------- Game/Exam Schema --------------------
const GameSchema = new mongoose.Schema(
    {
        host: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        gameType: {
            type: String,
            enum: ["quiz", "truth", "dare", "exam"], // added "exam" explicitly
            required: true,
            default: "quiz",
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

        // 🔑 Exam/Quiz specific fields
        totalMarks: {
            type: Number,
            default: 0,
        },
        passingMarks: {
            type: Number,
            default: 0,
        },
        duration: {
            type: Number, // in minutes
            required: true,
        },
        startTime: {
            type: Date,
        },
        endTime: {
            type: Date,
        },

        // Unique exam/game code
        examCode: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        // Track creator
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

// -------------------- Export Model --------------------
module.exports = mongoose.model("Game", GameSchema);
