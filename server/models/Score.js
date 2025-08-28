// models/Score.js
const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    practiceSet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PracticeSet",
        required: true,
    },
    score: {
        type: Number,
        required: true,
    },
    mode: {  // self or hosted
        type: String,
        enum: ["self", "hosted"],
        default: "self"
    },
    attemptedAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model("Score", scoreSchema);
