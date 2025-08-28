const mongoose = require("mongoose");

const AnalyticsSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    scores: [
        {
            quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
            score: Number,
            date: { type: Date, default: Date.now }
        }
    ],
});

module.exports = mongoose.model("Analytics", AnalyticsSchema);
