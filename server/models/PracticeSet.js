// models/PracticeSet.js
const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctIndex: { type: Number, required: true }, // ✅ 0-3 for MCQ
});

const PracticeSetSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        questions: [QuestionSchema],
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("PracticeSet", PracticeSetSchema);
