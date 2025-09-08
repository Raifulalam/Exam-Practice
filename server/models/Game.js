const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema(
    {
        questionText: { type: String, required: true, trim: true },

        questionType: {
            type: String,
            enum: ["mcq", "true_false", "short_answer"],
            default: "mcq"
        },

        options: {
            type: [String],
            validate: {
                validator: function (v) {
                    return this.questionType === "mcq" ? v.length >= 2 : true;
                },
                message: "MCQ must have at least 2 options",
            },
        },

        correctAnswer: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
            // could be string, index of option, or boolean
        },

        explanation: { type: String, trim: true },

        marks: { type: Number, default: 1, min: 0 },

        negativeMarks: { type: Number, default: 0, min: 0 },

        difficulty: {
            type: String,
            enum: ["easy", "medium", "hard"],
            default: "medium"
        },

        tags: [String], // e.g., "math", "grammar", "logical reasoning"
    },
    { _id: false }
);


const GameSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        subject: { type: String, required: true, trim: true },
        description: { type: String, trim: true },

        questions: [QuestionSchema],

        totalMarks: { type: Number, default: 0 },
        passingMarks: { type: Number, default: 0 },

        duration: { type: Number, required: true }, // in minutes
        startTime: { type: Date },
        endTime: { type: Date },

        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

        settings: {
            shuffleQuestions: { type: Boolean, default: false },
            shuffleOptions: { type: Boolean, default: false },
            allowNegativeMarking: { type: Boolean, default: false },
            attemptsAllowed: { type: Number, default: 1 },
        },

        examCode: { type: String, required: true, unique: true, index: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);


module.exports = mongoose.model("Game", GameSchema);
