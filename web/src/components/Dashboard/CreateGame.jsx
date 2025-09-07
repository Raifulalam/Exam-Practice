import React, { useState, useEffect } from "react";

export default function CreateGameModal({ showModal, setShowModal }) {
    const [gameType, setGameType] = useState("quiz");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [duration, setDuration] = useState(15);
    const [passMarks, setPassMarks] = useState(5);
    const [shuffleQuestions, setShuffleQuestions] = useState(true);
    const [maxParticipants, setMaxParticipants] = useState(0);
    const [isPublished, setIsPublished] = useState(false);
    const [leaderboardEnabled, setLeaderboardEnabled] = useState(false);
    const [resultVisibility, setResultVisibility] = useState("private");

    const [question, setQuestion] = useState("");
    const [questionType, setQuestionType] = useState("mcq");
    const [options, setOptions] = useState(["", "", "", ""]);
    const [correctOption, setCorrectOption] = useState(null);
    const [marks, setMarks] = useState(1);
    const [explanation, setExplanation] = useState("");
    const [media, setMedia] = useState("");

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setQuestion("");
        setOptions(["", "", "", ""]);
        setCorrectOption(null);
        setMarks(1);
        setExplanation("");
        setMedia("");
        setQuestionType(gameType === "truth" || gameType === "dare" ? gameType : "mcq");
    }, [gameType]);

    const addQuestion = () => {
        if (!question.trim()) return alert("⚠️ Please enter a question");

        const qData = {
            question,
            questionType,
            marks,
            explanation,
            media: media || "",
        };

        if (questionType === "mcq") {
            if (options.some((opt) => !opt.trim())) return alert("⚠️ Fill all options");
            if (correctOption === null) return alert("⚠️ Select correct option");
            qData.options = [...options];
            qData.answer = options[correctOption];
        } else if (questionType === "shortAnswer" || questionType === "longAnswer") {
            qData.answer = explanation || "";
        } else if (questionType === "truth" || questionType === "dare") {
            qData.answer = question;
        }

        setQuestions([...questions, qData]);
        setQuestion("");
        setOptions(["", "", "", ""]);
        setCorrectOption(null);
        setMarks(1);
        setExplanation("");
        setMedia("");
    };

    const removeQuestion = (idx) => setQuestions(questions.filter((_, i) => i !== idx));

    const finishAndSave = async () => {
        if (!title.trim()) return alert("⚠️ Enter game title");
        if (!questions.length) return alert("⚠️ Add at least one question");

        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const gameCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);

            const payload = {
                title,
                gameType,
                description,
                gameCode,
                duration,
                passMarks,
                shuffleQuestions,
                maxParticipants,
                isPublished,
                leaderboardEnabled,
                resultVisibility,
                totalMarks,
                questions,
            };

            const res = await fetch(
                "https://exam-practice-1.onrender.com/api/games/create",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Failed to save game");
            }

            alert(`✅ Game Created! Code: ${gameCode}`);
            // Reset all
            setQuestions([]);
            setTitle("");
            setDescription("");
            setDuration(15);
            setPassMarks(5);
            setShuffleQuestions(true);
            setMaxParticipants(0);
            setIsPublished(false);
            setLeaderboardEnabled(false);
            setResultVisibility("private");
            setShowModal(false);
        } catch (err) {
            alert("❌ " + err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!showModal) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
            <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 w-full max-w-lg rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh] p-6 border border-gray-200">
                <h2 className="text-3xl font-extrabold mb-6 text-gray-800">🎮 Create Game</h2>

                <input
                    type="text"
                    placeholder="Game Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full mb-4 p-3 border border-gray-300 text-black rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                />

                <textarea
                    placeholder="Description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full mb-4 p-3 border border-gray-300 text-black rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                />

                <div className="flex gap-3 mb-4">
                    <input
                        type="number"
                        placeholder="Duration (mins)"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="flex-1 p-3 border border-gray-300 text-black rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                    />
                    <input
                        type="number"
                        placeholder="Pass Marks"
                        value={passMarks}
                        onChange={(e) => setPassMarks(Number(e.target.value))}
                        className="flex-1 p-3 border border-gray-300 text-black rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                    />
                </div>

                <div className="flex gap-3 mb-4">
                    <input
                        type="number"
                        placeholder="Max Participants (0 = unlimited)"
                        value={maxParticipants}
                        onChange={(e) => setMaxParticipants(Number(e.target.value))}
                        className="flex-1 p-3 border border-gray-300 text-black rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                    />
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={shuffleQuestions}
                            onChange={(e) => setShuffleQuestions(e.target.checked)}
                            className="accent-indigo-600 w-5 h-5 text-black "
                        />
                        Shuffle Questions
                    </label>
                </div>

                <label className="flex items-center gap-2 mb-4 text-black ">
                    <input
                        type="checkbox"
                        checked={isPublished}
                        onChange={(e) => setIsPublished(e.target.checked)}
                        className="accent-green-600 w-5 h-5"
                    />
                    Publish Game
                </label>

                <div className="flex gap-3 mb-4 text-black ">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={leaderboardEnabled}
                            onChange={(e) => setLeaderboardEnabled(e.target.checked)}
                            className="accent-indigo-600 w-5 h-5"
                        />
                        Enable Leaderboard
                    </label>

                    <select
                        value={resultVisibility}
                        onChange={(e) => setResultVisibility(e.target.value)}
                        className="flex-1 p-3 border border-gray-300 text-black rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                    >
                        <option value="private">Private Results</option>
                        <option value="public">Public Results</option>
                    </select>
                </div>

                <input
                    type="text"
                    placeholder="Question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full mb-4 p-3 border border-gray-300 text-black rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                />

                <select
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value)}
                    className="w-full mb-4 p-3 border border-gray-300 text-black rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                >
                    <option value="mcq">MCQ</option>
                    <option value="shortAnswer">Short Answer</option>
                    <option value="longAnswer">Long Answer</option>
                    <option value="truth">Truth</option>
                    <option value="dare">Dare</option>
                </select>

                {questionType === "mcq" &&
                    options.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-3 mb-3 text-black ">
                            <input
                                type="radio"
                                name="correct"
                                checked={correctOption === idx}
                                onChange={() => setCorrectOption(idx)}
                                className="accent-indigo-600 w-5 h-5"
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
                                className="flex-1 p-3 border border-gray-300 text-black  rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                            />
                        </div>
                    ))}

                <input
                    type="number"
                    placeholder="Marks"
                    value={marks}
                    onChange={(e) => setMarks(Number(e.target.value))}
                    className="w-full mb-4 p-3 border border-gray-300 text-black rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                />

                <input
                    type="text"
                    placeholder="Explanation / Answer"
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    className="w-full mb-4 p-3 border border-gray-300 text-black rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                />

                <input
                    type="text"
                    placeholder="Media URL (optional)"
                    value={media}
                    onChange={(e) => setMedia(e.target.value)}
                    className="w-full mb-4 p-3 border border-gray-300 text-black rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                />

                {/* Preview Questions */}
                {questions.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4 shadow-inner">
                        <h4 className="font-semibold mb-3 text-gray-700 text-lg">Preview Questions</h4>
                        {questions.map((q, idx) => (
                            <div
                                key={idx}
                                className="flex justify-between items-center mb-2 text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition"
                            >
                                <span>
                                    {idx + 1}. {q.question} ({q.questionType})
                                </span>
                                <button
                                    onClick={() => removeQuestion(idx)}
                                    className="text-red-500 hover:text-red-700 font-semibold text-sm"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Buttons */}
                <div className="flex justify-end gap-3 mt-5">
                    <button
                        onClick={() => setShowModal(false)}
                        className="px-5 py-2 rounded-xl bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={addQuestion}
                        className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition"
                    >
                        ➕ Add Question
                    </button>
                    {questions.length > 0 && (
                        <button
                            onClick={finishAndSave}
                            disabled={loading}
                            className="px-5 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white font-medium disabled:opacity-50 transition"
                        >
                            {loading ? "Saving..." : "✅ Finish & Save All"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
