const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

// Temporary in-memory demo storage
let demoQuestions = [
    {
        id: 1,
        question: "What is the capital of France?",
        options: ["Berlin", "London", "Paris", "Rome"],
        correctAnswer: "Paris"
    },
    {
        id: 2,
        question: "What is 5 × 6?",
        options: ["11", "30", "56", "20"],
        correctAnswer: "30"
    },
    {
        id: 3,
        question: "Which gas do humans breathe in?",
        options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Helium"],
        correctAnswer: "Oxygen"
    },
    {
        id: 4,
        question: "Who wrote 'Romeo and Juliet'?",
        options: ["Shakespeare", "Charles Dickens", "Homer", "Leo Tolstoy"],
        correctAnswer: "Shakespeare"
    },
    {
        id: 5,
        question: "What is the largest planet in our solar system?",
        options: ["Earth", "Mars", "Jupiter", "Saturn"],
        correctAnswer: "Jupiter"
    },
    {
        id: 6,
        question: "What is the boiling point of water?",
        options: ["90°C", "100°C", "80°C", "120°C"],
        correctAnswer: "100°C"
    },
    {
        id: 7,
        question: "Which is the fastest land animal?",
        options: ["Tiger", "Cheetah", "Leopard", "Horse"],
        correctAnswer: "Cheetah"
    },
    {
        id: 8,
        question: "What is 12 ÷ 4?",
        options: ["2", "3", "4", "5"],
        correctAnswer: "3"
    },
    {
        id: 9,
        question: "Which element has the chemical symbol 'O'?",
        options: ["Oxygen", "Gold", "Osmium", "Oxide"],
        correctAnswer: "Oxygen"
    },
    {
        id: 10,
        question: "Which ocean is the largest?",
        options: ["Atlantic", "Indian", "Arctic", "Pacific"],
        correctAnswer: "Pacific"
    },
    {
        id: 11,
        question: "What is the square root of 49?",
        options: ["6", "7", "8", "9"],
        correctAnswer: "7"
    },
    {
        id: 12,
        question: "Which organ pumps blood in the human body?",
        options: ["Brain", "Liver", "Heart", "Kidney"],
        correctAnswer: "Heart"
    },
    {
        id: 13,
        question: "Which country is known as the Land of the Rising Sun?",
        options: ["China", "Japan", "Thailand", "Korea"],
        correctAnswer: "Japan"
    },
    {
        id: 14,
        question: "Which is the smallest prime number?",
        options: ["0", "1", "2", "3"],
        correctAnswer: "2"
    },
    {
        id: 15,
        question: "What is the chemical symbol for water?",
        options: ["H", "H2O", "O2", "HO2"],
        correctAnswer: "H2O"
    },
    {
        id: 16,
        question: "What planet is known as the Red Planet?",
        options: ["Earth", "Mars", "Venus", "Saturn"],
        correctAnswer: "Mars"
    },
    {
        id: 17,
        question: "Who invented the light bulb?",
        options: ["Albert Einstein", "Isaac Newton", "Thomas Edison", "Nikola Tesla"],
        correctAnswer: "Thomas Edison"
    },
    {
        id: 18,
        question: "Which continent is the Sahara Desert in?",
        options: ["Asia", "Africa", "Australia", "Europe"],
        correctAnswer: "Africa"
    },
    {
        id: 19,
        question: "How many sides does a hexagon have?",
        options: ["5", "6", "7", "8"],
        correctAnswer: "6"
    },
    {
        id: 20,
        question: "What is 15 + 25?",
        options: ["30", "35", "40", "45"],
        correctAnswer: "40"
    }
];


// Get all demo practice questions
router.get("/demo", auth(["player", "host"]), (req, res) => {
    res.json(demoQuestions);
});

// Save a new demo practice question
router.post("/demo", auth(["host"]), (req, res) => {
    const { question, options, correctAnswer } = req.body;
    if (!question || !options || !correctAnswer) {
        return res.status(400).json({ msg: "All fields required" });
    }

    const newQuestion = {
        id: demoQuestions.length + 1,
        question,
        options,
        correctAnswer,
    };
    demoQuestions.push(newQuestion);

    res.status(201).json(newQuestion);
});

module.exports = router;
