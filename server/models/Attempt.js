// models/Attempt.js
const mongoose = require("mongoose");

const AttemptSchema = new mongoose.Schema({
    setId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PracticeSet",
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    correct: { type: Number, required: true },
    total: { type: Number, required: true },
    percentage: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Attempt", AttemptSchema);
