import React, { useState } from "react";

export default function CreateGameModal({ showModal, setShowModal }) {
    const [gameType, setGameType] = useState("truth_dare");
    const [question, setQuestion] = useState("");
    const [truthOrDare, setTruthOrDare] = useState("truth");
    const [options, setOptions] = useState(["", "", "", ""]);
    const [correctOption, setCorrectOption] = useState(null);
    const [answer, setAnswer] = useState("");
    const [questions, setQuestions] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    const addQuestion = () => {
        if (!question.trim()) return alert("⚠️ Please enter a question");

        let gameData = { type: gameType, question };

        if (gameType === "quiz") {
            if (options.some((opt) => opt.trim() === "")) {
                return alert("⚠️ Please fill all options");
            }
            if (correctOption === null) {
                return alert("⚠️ Please select correct option");
            }
            gameData.options = options;
            gameData.correctIndex = correctOption;
        } else if (gameType === "exam") {
            if (!answer.trim()) return alert("⚠️ Please enter an answer");
            gameData.answer = answer;
        } else if (gameType === "truth_dare") {
            gameData.truthOrDare = truthOrDare;
        }

        setQuestions([...questions, gameData]);

        // reset
        setQuestion("");
        setOptions(["", "", "", ""]);
        setCorrectOption(null);
        setAnswer("");
        setTruthOrDare("truth");
    };

    const finishAndSave = async () => {
        if (!title.trim()) return alert("⚠️ Please enter game title");
        if (questions.length === 0) return alert("⚠️ Please add at least one question");

        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            // 🎯 Generate random 6-digit code
            const gameCode = Math.floor(100000 + Math.random() * 900000).toString();

            let payload = {
                title,
                description,
                gameCode,
            };

            if (gameType === "quiz") {
                payload.gameType = "quiz";
                payload.questions = questions.map(q => ({
                    question: q.question,
                    options: q.options,
                    answer: q.options[q.correctIndex], // ✅ store correct answer
                }));
            } else if (gameType === "exam") {
                payload.gameType = "quiz"; // exam works like quiz with text answer
                payload.questions = questions.map(q => ({
                    question: q.question,
                    answer: q.answer,
                }));
            } else if (gameType === "truth_dare") {
                payload.gameType = "truth"; // or "dare", backend requires split
                payload.truths = questions.filter(q => q.truthOrDare === "truth").map(q => q.question);
                payload.dares = questions.filter(q => q.truthOrDare === "dare").map(q => q.question);
            }

            const res = await fetch("https://exam-practice-1.onrender.com/api/games/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Failed to save game");
            }

            const data = await res.json();
            alert(`✅ Game Saved Successfully!\nYour Game Code: ${gameCode}`);
            console.log("Game created:", data);

            setQuestions([]);
            setTitle("");
            setDescription("");
            setShowModal(false);
        } catch (error) {
            console.error("❌ Error saving game:", error);
            alert("❌ Failed to save game: " + error.message);
        } finally {
            setLoading(false);
        }
    };


    return (
        showModal && (
            <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-2xl w-[420px] shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-200">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                        🎮 Create a Game
                    </h2>

                    {/* Title */}
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Game Title
                    </label>
                    <input
                        type="text"
                        placeholder="Enter Game Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2 mb-4 text-black"
                    />

                    {/* Description */}
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description (optional)
                    </label>
                    <textarea
                        placeholder="Enter Game Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2 mb-4 text-black"
                    />

                    {/* Dropdown for game type */}
                    <label className="block text-sm font-medium text-blue-700 mb-1">
                        Select Game Type
                    </label>
                    <select
                        value={gameType}
                        onChange={(e) => setGameType(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2 mb-4 text-black"
                    >
                        <option value="truth_dare">Truth/Dare</option>
                        <option value="quiz">Quiz</option>
                        <option value="exam">Exam</option>
                    </select>

                    {/* Question */}
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question
                    </label>
                    <input
                        type="text"
                        placeholder="Enter Question"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2 mb-4 text-black"
                    />

                    {/* Truth/Dare selector */}
                    {gameType === "truth_dare" && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Is this Truth or Dare?
                            </label>
                            <select
                                value={truthOrDare}
                                onChange={(e) => setTruthOrDare(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 text-black"
                            >
                                <option value="truth">Truth</option>
                                <option value="dare">Dare</option>
                            </select>
                        </div>
                    )}

                    {/* Quiz options */}
                    {gameType === "quiz" && (
                        <div className="space-y-3 mb-4">
                            <p className="text-sm font-medium text-gray-700">Options</p>
                            {options.map((opt, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="correct"
                                        checked={correctOption === idx}
                                        onChange={() => setCorrectOption(idx)}
                                        className="accent-indigo-600"
                                    />
                                    <input
                                        type="text"
                                        placeholder={`Option ${idx + 1}`}
                                        value={opt}
                                        onChange={(e) => {
                                            const newOpts = [...options];
                                            newOpts[idx] = e.target.value;
                                            setOptions(newOpts);
                                        }}
                                        className="flex-1 border border-gray-300 rounded-lg p-2 text-black"
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Exam answer */}
                    {gameType === "exam" && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Correct Answer
                            </label>
                            <input
                                type="text"
                                placeholder="Enter Correct Answer"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2"
                            />
                        </div>
                    )}

                    {/* Preview */}
                    {questions.length > 0 && (
                        <div className="bg-gray-50 p-3 rounded-lg mb-4 border border-gray-200 text-sm">
                            <p className="font-medium text-gray-700 mb-2">Added Questions</p>
                            <ul className="list-disc pl-5 space-y-1">
                                {questions.map((q, idx) => (
                                    <li key={idx} className="text-gray-700">
                                        {q.question}{" "}
                                        {q.type === "truth_dare" && (
                                            <span className="text-purple-600">
                                                ({q.truthOrDare})
                                            </span>
                                        )}
                                        {q.type === "quiz" && (
                                            <span className="text-green-600">
                                                (Correct: Option {q.correctIndex + 1})
                                            </span>
                                        )}
                                        {q.type === "exam" && (
                                            <span className="text-blue-600">
                                                (Ans: {q.answer})
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="mt-5 flex justify-end gap-3">
                        <button
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={addQuestion}
                            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
                        >
                            ➕ Add Question
                        </button>
                        {questions.length > 0 && (
                            <button
                                onClick={finishAndSave}
                                disabled={loading}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                            >
                                {loading ? "Saving..." : "✅ Finish & Save All"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )
    );
}
