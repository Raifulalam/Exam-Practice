const mongoose = require("mongoose");

const ResponseSchema = new mongoose.Schema(
    {
        questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
        givenAnswer: { type: mongoose.Schema.Types.Mixed, required: true },
        // string, number, boolean, or array (for multi-select)

        isCorrect: { type: Boolean, default: null },
        marksObtained: { type: Number, default: 0 },
        timeTaken: { type: Number, default: 0 }, // seconds spent per question
    },
    { _id: false }
);

const GameResponseSchema = new mongoose.Schema(
    {
        exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true }, // ✅ fix
        student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // ✅ fix

        responses: [ResponseSchema],

        score: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 },

        status: {
            type: String,
            enum: ["in-progress", "completed", "review"],
            default: "in-progress",
        },

        startedAt: { type: Date, default: Date.now },
        completedAt: { type: Date },
        duration: { type: Number }, // in seconds
    },
    { timestamps: true }
);

module.exports = mongoose.model("GameResponse", GameResponseSchema);
