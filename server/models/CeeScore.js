const mongoose = require("mongoose");

const ceeScoreSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    score: { type: Number, required: true },
    mode: { type: String, default: "practice" },
    totalAttempt: { type: Number, default: 0 },   // ✅ corrected spelling
    totalQuestion: { type: Number, required: true },
    percentage: { type: Number, default: 0 },     // e.g., (score / totalQuestion) * 100
    date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("CeeScore", ceeScoreSchema);
