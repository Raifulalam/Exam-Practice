import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../Auth/UserContext.jsx";
import {
    PlusCircle,
    Trophy,
    BarChart2,
    Gamepad2,
    UserCircle,
} from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export default function DashboardPlayer() {
    const { user } = useContext(UserContext);
    const [practiceSets, setPracticeSets] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newSetTitle, setNewSetTitle] = useState("");
    const [questions, setQuestions] = useState([]);
    const [mode, setMode] = useState("manual"); // manual | auto

    // Manual question input
    const [manualQuestion, setManualQuestion] = useState("");
    const [manualOptions, setManualOptions] = useState(["", "", "", ""]);
    const [correctOption, setCorrectOption] = useState(null);

    // Scores & stats
    const [stats, setStats] = useState(null);

    const token = localStorage.getItem("token");

    // 📌 Fetch saved practice sets on mount
    useEffect(() => {
        const fetchPracticeSets = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/practice-sets", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setPracticeSets(data);
                } else {
                    console.error("Failed to fetch practice sets");
                }
            } catch (err) {
                console.error("Error fetching practice sets:", err);
            }
        };


        if (token) {
            fetchPracticeSets();
            fetchScores();
        }
    }, [token]);
    const fetchScores = async () => {
        if (!token) return;
        try {
            const res = await fetch("http://localhost:5000/api/cee/my-scores", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) setStats(data); // assuming backend returns { scores: [], maxScore: x, avgScore: y }
        } catch (err) {
            console.error("Error fetching history:", err);
        }
    };


    // 📌 Fetch random questions from backend (auto mode)
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

    // 📌 Add manual question
    const addManualQuestion = () => {
        if (
            !manualQuestion.trim() ||
            manualOptions.some((o) => !o.trim()) ||
            correctOption === null
        ) {
            alert("Please fill all fields and select a correct answer.");
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

    // 📌 Save practice set to backend
    const savePracticeSet = async () => {
        if (!newSetTitle.trim() || questions.length === 0) {
            alert("Please add a title and at least one question.");
            return;
        }

        try {
            const res = await fetch("http://localhost:5000/api/practice-sets", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title: newSetTitle, questions }),
            });

            if (res.ok) {
                const saved = await res.json();
                setPracticeSets([...practiceSets, saved]);
                setShowModal(false);
                setNewSetTitle("");
                setQuestions([]);
            } else {
                const error = await res.json();
                alert(error.msg || "Failed to save practice set");
            }
        } catch (err) {
            console.error("Error saving practice set:", err);
            alert("Network error while saving");
        }
    };

    // 📊 Prepare chart data
    const scoreData = stats?.scores?.map((s, i) => ({
        attempt: `#${i + 1}`,
        score: s.score,
    })) || [];

    return (
        <div className="flex min-h-screen bg-green-50">
            {/* Sidebar */}
            <div className="w-64 bg-green-700 text-white p-6 flex flex-col items-center">
                <UserCircle className="w-20 h-20 mb-4" />
                <h2 className="text-lg font-bold">
                    {user?.email?.split("@")[0] || "Player"}
                </h2>
                <p className="text-sm text-green-200">{user?.email}</p>

                <button className="w-full text-left px-3 py-2 rounded bg-green-600 hover:bg-green-500">
                    Dashboard
                </button>
                <br />
                <button
                    onClick={() => (window.location.href = `/demo`)}
                    className="w-full text-left px-3 py-2 rounded bg-green-600 hover:bg-green-500 flex items-center gap-2"
                >
                    Demo test
                </button>
                <br />
                <button
                    onClick={() => (window.location.href = `/cee-practice`)}
                    className="w-full text-left px-3 py-2 rounded bg-green-600 hover:bg-green-500 flex items-center gap-2"
                >
                    CEE Practice
                </button>

                <div className="mt-8 space-y-3 w-full">
                    <button
                        onClick={() => setShowModal(true)}
                        className="w-full text-left px-3 py-2 rounded bg-green-600 hover:bg-green-500 flex items-center gap-2"
                    >
                        <PlusCircle className="w-4 h-4" /> Create Practice Set
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
                <h1 className="text-3xl font-bold mb-6 text-center">
                    🎮 Player Dashboard
                </h1>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Practice Sets */}
                    <div className="bg-white shadow-lg rounded-2xl p-4">
                        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                            <PlusCircle className="w-5 h-5" /> Practice Sets
                        </h2>
                        <ul className="list-disc pl-5">
                            {practiceSets.map((set) => (
                                <li
                                    key={set._id}
                                    className="flex justify-between items-center"
                                >
                                    {set.title} ({set.questions.length} Questions)
                                    <button
                                        onClick={() =>
                                            (window.location.href = `/practice/${set._id}`)
                                        }
                                        className="ml-3 px-2 py-1 bg-blue-500 text-white rounded"
                                    >
                                        Play
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Analytics with Chart */}
                    <div className="bg-white shadow-lg rounded-2xl p-4 col-span-2">
                        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                            <BarChart2 className="w-5 h-5" /> Analytics
                        </h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={scoreData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="attempt" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        {stats && (
                            <div className="mt-4 text-center">
                                <p>📊 Total Attempts: {stats.totalAttempts}</p>
                                <p>🏆 Highest Score: {stats.highestScore}</p>
                                <p>📈 Average Score: {stats.avgScore}</p>
                            </div>
                        )}
                    </div>

                    {/* Last Attempts */}
                    <div className="bg-white shadow-lg rounded-2xl p-4">
                        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                            <Gamepad2 className="w-5 h-5" /> Recent Attempts
                        </h2>
                        <ul className="space-y-2">
                            {stats?.scores?.slice(-5).map((s, i) => (
                                <li key={i}>
                                    {s.practiceSet?.title || "Test"} →{" "}
                                    <span className="font-semibold">{s.score}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Best Result */}
                {stats && (
                    <div className="mt-6 bg-yellow-100 shadow-lg rounded-2xl p-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Trophy className="w-6 h-6 text-yellow-600" /> Your Best Result
                        </h2>
                        <p className="mt-2 text-lg">
                            🥇 Highest Score →{" "}
                            <span className="font-semibold">{stats.highestScore}</span>
                        </p>
                    </div>
                )}
            </div>

            {/* Modal for Create Practice Set */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-xl w-96 shadow-lg">
                        <h2 className="text-xl font-bold mb-4">Create Practice Set</h2>
                        <input
                            type="text"
                            placeholder="Enter set title"
                            value={newSetTitle}
                            onChange={(e) => setNewSetTitle(e.target.value)}
                            className="w-full border rounded p-2 mb-3"
                        />

                        <div className="flex gap-3 mb-4">
                            <button
                                onClick={() => setMode("manual")}
                                className={`flex-1 py-2 rounded ${mode === "manual"
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
                                className={`flex-1 py-2 rounded ${mode === "auto"
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-200"
                                    }`}
                            >
                                Auto
                            </button>
                        </div>

                        {mode === "manual" && (
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    placeholder="Enter question"
                                    value={manualQuestion}
                                    onChange={(e) => setManualQuestion(e.target.value)}
                                    className="w-full border rounded p-2"
                                />
                                {manualOptions.map((opt, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="correct"
                                            checked={correctOption === idx}
                                            onChange={() => setCorrectOption(idx)}
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
                                            className="flex-1 border rounded p-2"
                                        />
                                    </div>
                                ))}
                                <button
                                    onClick={addManualQuestion}
                                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Add Question
                                </button>

                                {questions.length > 0 && (
                                    <ul className="list-disc pl-4 mt-2 text-sm">
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

                        {mode === "auto" && (
                            <div className="bg-gray-100 p-2 rounded h-28 overflow-y-auto text-sm">
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

                        <div className="mt-4 flex justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={savePracticeSet}
                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
