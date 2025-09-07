const mongoose = require("mongoose");

const ResponseSchema = new mongoose.Schema({
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    answer: String,               // player answer
    correct: { type: Boolean, default: null }, // was the answer correct
    marksObtained: { type: Number, default: 0 } // marks obtained for this question
});

const GameResponseSchema = new mongoose.Schema(
    {
        game: { type: mongoose.Schema.Types.ObjectId, ref: "Game", required: true },
        player: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        responses: [ResponseSchema],  // detailed per-question responses
        score: { type: Number, default: 0 }, // total score for the attempt
        completedAt: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

// Ensure one attempt per player per game
GameResponseSchema.index({ game: 1, player: 1 }, { unique: true });

/* -------------------- METHODS -------------------- */

// Calculate total score based on evaluated responses
GameResponseSchema.methods.calculateScore = function () {
    this.score = this.responses.reduce((sum, r) => sum + (r.marksObtained || 0), 0);
    return this.score;
};

// Evaluate responses against the game questions (quiz/exam)
GameResponseSchema.methods.evaluateResponses = function (game) {
    this.responses = this.responses.map(r => {
        const q = game.questions.id(r.questionId);
        if (!q) return r;

        let correct = null;
        let marksObtained = 0;

        if (game.gameType === "quiz" || game.gameType === "exam") {
            correct = r.answer === q.answer;
            marksObtained = correct ? q.marks : 0;
        }

        return { ...r.toObject(), correct, marksObtained };
    });

    this.calculateScore();
    return this;
};

module.exports = mongoose.model("GameResponse", GameResponseSchema);
