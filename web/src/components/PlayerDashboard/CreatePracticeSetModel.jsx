import React, { useState } from "react";

export default function CreatePracticeSet() {
    const [title, setTitle] = useState("");
    const [questions, setQuestions] = useState([]);
    const [mode, setMode] = useState("manual");
    const [manualQuestion, setManualQuestion] = useState("");
    const [manualOptions, setManualOptions] = useState(["", "", "", ""]);
    const [correctOption, setCorrectOption] = useState(null);
    const [showPreview, setShowPreview] = useState(false); // NEW STATE

    const token = localStorage.getItem("token");

    // Fetch random auto questions
    const fetchAutoQuestions = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/questions/random", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setQuestions(
                data.map((q) => ({
                    question: q.question,
                    options: q.options,
                    correctIndex: q.correctIndex ?? 0,
                }))
            );
        } catch (err) {
            console.error("Error fetching auto questions:", err);
        }
    };

    // Add manual question
    const addManualQuestion = () => {
        if (
            !manualQuestion.trim() ||
            manualOptions.some((o) => !o.trim()) ||
            correctOption === null
        ) {
            alert("Please fill all fields and select the correct answer.");
            return;
        }
        const newQ = {
            question: manualQuestion,
            options: manualOptions,
            correctIndex: correctOption,
        };
        setQuestions([...questions, newQ]);
        setManualQuestion("");
        setManualOptions(["", "", "", ""]);
        setCorrectOption(null);
    };

    // Save practice set
    const savePracticeSet = async () => {
        if (!title.trim() || questions.length === 0) {
            alert("Add title and at least one question.");
            return;
        }
        try {
            const res = await fetch("http://localhost:5000/api/practice-sets", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title, questions }),
            });
            if (res.ok) {
                alert("Practice Set created successfully!");
                setTitle("");
                setQuestions([]);
                setMode("manual");
                setShowPreview(false);
            } else {
                const error = await res.json();
                alert(error.msg || "Failed to save practice set");
            }
        } catch (err) {
            console.error(err);
            alert("Network error while saving");
        }
    };

    return (
        <div className="p-4 sm:p-6 bg-white shadow-lg rounded-xl w-full max-w-3xl mx-auto mt-4 sm:mt-6">
            <h2 className="text-lg sm:text-2xl font-bold mb-4 text-center sm:text-left">
                Create Practice Set
            </h2>

            {/* Title input */}
            <input
                type="text"
                placeholder="Enter set title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded p-2 mb-3 text-sm sm:text-base"
            />

            {/* Mode Toggle */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <button
                    onClick={() => setMode("manual")}
                    className={`flex-1 py-2 rounded text-sm sm:text-base ${mode === "manual"
                            ? "bg-green-500 text-white"
                            : "bg-gray-200"
                        }`}
                >
                    Manual
                </button>
                <button
                    onClick={() => {
                        setMode("auto");
                        fetchAutoQuestions();
                    }}
                    className={`flex-1 py-2 rounded text-sm sm:text-base ${mode === "auto"
                            ? "bg-green-500 text-white"
                            : "bg-gray-200"
                        }`}
                >
                    Auto
                </button>
            </div>

            {/* Manual mode */}
            {mode === "manual" && (
                <div className="space-y-2">
                    <input
                        type="text"
                        placeholder="Enter question"
                        value={manualQuestion}
                        onChange={(e) => setManualQuestion(e.target.value)}
                        className="w-full border rounded p-2 text-sm sm:text-base"
                    />

                    {manualOptions.map((opt, idx) => (
                        <div
                            key={idx}
                            className="flex flex-col sm:flex-row items-start sm:items-center gap-2"
                        >
                            <input
                                type="radio"
                                name="correct"
                                checked={correctOption === idx}
                                onChange={() => setCorrectOption(idx)}
                                className="mt-1 sm:mt-0"
                            />
                            <input
                                type="text"
                                placeholder={`Option ${idx + 1}`}
                                value={opt}
                                onChange={(e) => {
                                    const newOpts = [...manualOptions];
                                    newOpts[idx] = e.target.value;
                                    setManualOptions(newOpts);
                                }}
                                className="flex-1 border rounded p-2 text-sm sm:text-base"
                            />
                        </div>
                    ))}

                    <button
                        onClick={addManualQuestion}
                        className="mt-2 w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded text-sm sm:text-base hover:bg-blue-600"
                    >
                        Add Question
                    </button>

                    {questions.length > 0 && (
                        <div className="mt-4">
                            <button
                                onClick={() => setShowPreview(!showPreview)}
                                className="text-sm font-medium text-blue-600 hover:underline"
                            >
                                {showPreview ? "Hide Questions" : "Show Questions"} ({questions.length})
                            </button>

                            {showPreview && (
                                <ul className="list-disc pl-4 mt-2 text-sm max-h-40 sm:max-h-48 overflow-y-auto">
                                    {questions.map((q, idx) => (
                                        <li key={idx}>
                                            {q.question}{" "}
                                            <span className="text-green-600">
                                                (Correct: Option {q.correctIndex + 1})
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Auto mode */}
            {mode === "auto" && (
                <div className="bg-gray-100 p-2 rounded h-40 overflow-y-auto text-sm sm:text-base">
                    {questions.length > 0 ? (
                        <ul className="list-disc pl-4">
                            {questions.map((q, idx) => (
                                <li key={idx}>{q.question}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>Loading auto questions...</p>
                    )}
                </div>
            )}

            {/* Save button */}
            <div className="mt-4 flex flex-col sm:flex-row justify-end gap-3">
                <button
                    onClick={savePracticeSet}
                    className="w-full sm:w-auto px-4 py-2 bg-green-500 text-white rounded text-sm sm:text-base hover:bg-green-600"
                >
                    Save Practice Set
                </button>
            </div>
        </div>
    );
}
