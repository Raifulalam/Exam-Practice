// src/components/CEEPractice.js
import React, { useState, useEffect, useRef, useContext } from "react";
import questionsData from "../data/cee_nepal_mcq_bank.json";
import { UserContext } from "../Auth/UserContext";

const CEEPractice = () => {
    const { user } = useContext(UserContext);
    const [subject, setSubject] = useState("");
    const [topic, setTopic] = useState("");
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [score, setScore] = useState(null);
    const [showAnswers, setShowAnswers] = useState(false);
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const token = localStorage.getItem("token");

    const [timeLeft, setTimeLeft] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const timerRef = useRef(null);

    const subjects = [...new Set(questionsData.questions.map(q => q.subject))];
    const topics = subject
        ? [...new Set(questionsData.questions.filter(q => q.subject === subject).map(q => q.topic))]
        : [];

    useEffect(() => {
        if (token) fetchHistory();
    }, [token]);

    const fetchHistory = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/cee/my-scores", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) setHistory(data.scores || []);
        } catch (err) {
            console.error("Error fetching history:", err);
        }
    };

    const loadQuestions = (count = null, range = null) => {
        let qs = questionsData.questions;
        if (subject) qs = qs.filter(q => q.subject === subject);
        if (topic) qs = qs.filter(q => q.topic === topic);
        if (range) qs = qs.slice(range.start - 1, range.end);
        if (count && count < qs.length) qs = qs.sort(() => 0.5 - Math.random()).slice(0, count);

        setSelectedQuestions(qs);
        setAnswers({});
        setScore(null);
        setShowAnswers(false);
        if (qs.length > 0) startTimer(qs.length * 60);
    };

    const startTimer = (duration) => {
        clearInterval(timerRef.current);
        setTimeLeft(duration);
        setIsRunning(true);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev === 1) {
                    clearInterval(timerRef.current);
                    handleAutoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    useEffect(() => {
        if (score !== null) {
            clearInterval(timerRef.current);
            setIsRunning(false);
        }
    }, [score]);

    const formatTime = sec => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const handleAnswer = (qId, option) => setAnswers(prev => ({ ...prev, [qId]: option }));

    const saveScore = async (result) => {
        if (!token) return alert("Please log in to save your score.");
        try {
            const res = await fetch("http://localhost:5000/api/cee/score", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(result),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || "Failed to save score");
            fetchHistory();
        } catch (err) {
            console.error("Error saving score:", err.message);
            alert("Failed to save score.");
        }
    };

    const calculateScore = async () => {
        let sc = 0;
        let attempted = 0;
        selectedQuestions.forEach(q => {
            if (answers[q.id]) attempted++;
            if (answers[q.id] === q.answer) sc++;
        });

        const totalQuestions = selectedQuestions.length;
        const percentage = ((sc / totalQuestions) * 100).toFixed(2);

        const result = {
            score: sc,
            totalAttempt: attempted,
            totalQuestion: totalQuestions,
            percentage,
            mode: "practice",
        };

        setScore(sc);
        setShowAnswers(true);
        await saveScore(result);
    };

    const handleAutoSubmit = () => {
        calculateScore();
        alert("⏳ Time's up! Your test has been submitted.");
    };

    return (
        <div className="min-h-screen bg-blue-50 p-6">
            <h2 className="text-3xl font-extrabold mb-6 text-center text-blue-700">
                CEE Practice MCQs
            </h2>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar */}
                <div className="md:w-1/4 bg-white p-6 rounded-xl shadow-lg flex flex-col gap-4">
                    <h3 className="text-xl font-bold text-gray-700">📚 Exam Options</h3>

                    <div>
                        <label className="font-medium">Subject</label>
                        <select
                            value={subject}
                            onChange={e => { setSubject(e.target.value); setTopic(""); setSelectedQuestions([]); setAnswers({}); setScore(null); }}
                            className="w-full mt-2 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="">Select Subject</option>
                            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    {subject && (
                        <div>
                            <label className="font-medium">Topic</label>
                            <select
                                value={topic}
                                onChange={e => setTopic(e.target.value)}
                                className="w-full mt-2 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                                <option value="">Select Topic</option>
                                {topics.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    )}

                    <div className="flex flex-col gap-2 mt-4">
                        <button onClick={() => loadQuestions(10)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Load 10</button>
                        <button onClick={() => loadQuestions(20)} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Load 20</button>
                        <button onClick={() => loadQuestions(50)} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Load 50</button>
                        <button onClick={() => loadQuestions()} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Load All</button>
                    </div>

                    {token && (
                        <button
                            onClick={() => setShowHistory(prev => !prev)}
                            className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
                        >
                            {showHistory ? "Hide History" : "Show History"}
                        </button>
                    )}
                </div>

                {/* Main Content */}
                <div className="md:w-3/4 flex flex-col gap-6">
                    {/* Timer */}
                    {isRunning && timeLeft !== null && (
                        <div className="text-center">
                            <div className="inline-block px-6 py-2 bg-gray-800 text-white rounded shadow-md font-bold">
                                ⏳ Time Left: {formatTime(timeLeft)}
                            </div>
                        </div>
                    )}

                    {/* Questions */}
                    {selectedQuestions.length > 0 && (
                        <div className="space-y-6">
                            {selectedQuestions.map((q, i) => (
                                <div key={q.id} className="p-4 bg-white shadow rounded-lg border hover:shadow-lg transition">
                                    <p className="font-semibold text-lg text-gray-800">{i + 1}. {q.question}</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                        {q.options.map((opt, idx) => {
                                            const isSelected = answers[q.id] === opt;
                                            const isCorrect = showAnswers && q.answer === opt;
                                            const isWrong = showAnswers && isSelected && q.answer !== opt;
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleAnswer(q.id, opt)}
                                                    disabled={showAnswers}
                                                    className={`p-2 border rounded-lg text-left transition
                                                        ${isSelected ? "bg-blue-100 border-blue-400" : "bg-white hover:bg-gray-100"}
                                                        ${isCorrect ? "bg-green-200 border-green-500" : ""}
                                                        ${isWrong ? "bg-red-200 border-red-500" : ""}`}
                                                >
                                                    {opt}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {showAnswers && <p className="mt-2 text-sm text-green-600 font-medium">✅ Correct Answer: {q.answer}</p>}
                                </div>
                            ))}

                            {!showAnswers && (
                                <button onClick={calculateScore} className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg mt-6 shadow-md">
                                    Submit Test
                                </button>
                            )}
                        </div>
                    )}

                    {/* Score */}
                    {score !== null && (
                        <div className="text-center mt-6">
                            <p className="text-2xl font-bold text-gray-800">🎉 Score: {score} / {selectedQuestions.length}</p>
                            <p className="text-lg text-gray-600 mt-1">Percentage: {((score / selectedQuestions.length) * 100).toFixed(2)}%</p>
                            <button onClick={() => {
                                setSelectedQuestions([]);
                                setAnswers({});
                                setScore(null);
                                setShowAnswers(false);
                                setIsRunning(false);
                                setTimeLeft(null);
                            }} className="mt-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">
                                Restart
                            </button>
                        </div>
                    )}

                    {/* History Table */}
                    {showHistory && history.length > 0 && (
                        <div className="mt-10 bg-white p-6 rounded-xl shadow-lg">
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">📊 Your Previous Scores</h3>
                            <table className="w-full border-collapse border border-gray-300 text-left">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="border px-3 py-2">#</th>
                                        <th className="border px-3 py-2">Score</th>
                                        <th className="border px-3 py-2">Attempted</th>
                                        <th className="border px-3 py-2">Total Questions</th>
                                        <th className="border px-3 py-2">Percentage</th>
                                        <th className="border px-3 py-2">Mode</th>
                                        <th className="border px-3 py-2">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((s, idx) => (
                                        <tr key={s._id} className="hover:bg-gray-50">
                                            <td className="border px-3 py-2">{idx + 1}</td>
                                            <td className="border px-3 py-2">{s.score}</td>
                                            <td className="border px-3 py-2">{s.totalAttempt}</td>
                                            <td className="border px-3 py-2">{s.totalQuestion}</td>
                                            <td className="border px-3 py-2">{s.percentage}%</td>
                                            <td className="border px-3 py-2">{s.mode}</td>
                                            <td className="border px-3 py-2">{new Date(s.createdAt).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CEEPractice;
