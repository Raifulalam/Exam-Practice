import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../../Auth/UserContext";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import {
    BarChart2,
    Gamepad2,
    Trophy,
    List,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import PlayerLayout from "./PlayerLayout";

export default function Dashboard() {
    const { user } = useContext(UserContext);
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [stats, setStats] = useState(null);
    const [scoreData, setScoreData] = useState([]);
    const [view, setView] = useState("analytics");
    const [expanded, setExpanded] = useState({});

    useEffect(() => {
        const fetchAttempts = async () => {
            setLoading(true);
            setError("");
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setError("Please login to view your attempts.");
                    setLoading(false);
                    return;
                }

                const res = await fetch(
                    "https://exam-practice-1.onrender.com/api/games/attempts/me",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                if (!res.ok) {
                    const errData = await res.json();
                    setError(errData.msg || errData.error || "Failed to fetch attempts");
                    setLoading(false);
                    return;
                }

                const data = await res.json();
                const userAttempts = data.attempts || [];
                setAttempts(userAttempts);

                if (userAttempts.length > 0) {
                    const chartData = userAttempts.map((a, idx) => {
                        const total = a.responses.length;
                        const correct = a.responses.filter((r) => r.correct).length;
                        return {
                            attempt: `#${idx + 1}`,
                            score: Math.round((correct / total) * 100),
                        };
                    });

                    const scores = chartData.map((d) => d.score);
                    const totalAttempts = chartData.length;
                    const highestScore = Math.max(...scores);
                    const avgScore = (
                        scores.reduce((sum, val) => sum + val, 0) / totalAttempts
                    ).toFixed(2);

                    setScoreData(chartData);
                    setStats({ totalAttempts, highestScore, avgScore, scores: chartData });
                }
            } catch (err) {
                console.error(err);
                setError("Server error while fetching attempts");
            } finally {
                setLoading(false);
            }
        };

        fetchAttempts();
    }, []);

    const toggleExpand = (id) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    if (loading)
        return (
            <p className="text-center mt-6 text-gray-600">Loading dashboard...</p>
        );
    if (error) return <p className="text-center mt-6 text-red-500">{error}</p>;
    if (!attempts.length)
        return (
            <p className="text-center mt-6 text-gray-500">
                You have not attempted any games yet.
            </p>
        );

    return (
        <PlayerLayout>
            <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
                {/* Toggle */}
                <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-4">
                    <button
                        className={`w-full sm:w-auto px-4 py-2 rounded transition ${view === "analytics"
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-700"
                            }`}
                        onClick={() => setView("analytics")}
                    >
                        <BarChart2 className="inline w-5 h-5 mr-1" /> Analytics
                    </button>
                    <button
                        className={`w-full sm:w-auto px-4 py-2 rounded transition ${view === "details"
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-700"
                            }`}
                        onClick={() => setView("details")}
                    >
                        <List className="inline w-5 h-5 mr-1" /> Attempts
                    </button>
                </div>

                {view === "analytics" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Chart */}
                        <div className="bg-white shadow-lg rounded-2xl p-4 col-span-1 md:col-span-2">
                            <h2 className="text-lg sm:text-xl font-semibold mb-2 flex items-center gap-2">
                                <BarChart2 className="w-5 h-5" /> Analytics
                            </h2>
                            <div className="h-52 sm:h-64">
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
                                <div className="mt-4 text-center text-sm sm:text-base">
                                    <p>📊 Total Attempts: {stats.totalAttempts}</p>
                                    <p>🏆 Highest Score: {stats.highestScore}%</p>
                                    <p>📈 Average Score: {stats.avgScore}%</p>
                                </div>
                            )}
                        </div>

                        {/* Recent Attempts */}
                        <div className="bg-white shadow-lg rounded-2xl p-4">
                            <h2 className="text-lg sm:text-xl font-semibold mb-2 flex items-center gap-2">
                                <Gamepad2 className="w-5 h-5" /> Recent Attempts
                            </h2>
                            <ul className="space-y-1 sm:space-y-2 text-sm sm:text-base">
                                {scoreData
                                    .slice(-5)
                                    .reverse()
                                    .map((s, i) => (
                                        <li key={i}>
                                            Attempt {s.attempt} →{" "}
                                            <span className="font-semibold">{s.score}%</span>
                                        </li>
                                    ))}
                            </ul>
                        </div>

                        {/* Best Result */}
                        {stats && (
                            <div className="mt-4 md:mt-6 bg-yellow-100 shadow-lg rounded-2xl p-4 sm:p-6 col-span-1 md:col-span-3">
                                <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                                    <Trophy className="w-6 h-6 text-yellow-600" /> Your Best Result
                                </h2>
                                <p className="mt-2 text-base sm:text-lg">
                                    🥇 Highest Score →{" "}
                                    <span className="font-semibold">{stats.highestScore}%</span>
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Details */}
                {view === "details" && (
                    <div className="space-y-4">
                        {attempts.map((attempt, idx) => {
                            const totalQuestions = attempt.responses.length;
                            const correctCount = attempt.responses.filter((r) => r.correct)
                                .length;
                            const percentage = (
                                (correctCount / totalQuestions) *
                                100
                            ).toFixed(2);
                            const isExpanded = expanded[attempt._id];

                            return (
                                <div
                                    key={attempt._id}
                                    className="p-4 border rounded-lg shadow bg-white"
                                >
                                    <div
                                        className="flex justify-between items-center cursor-pointer"
                                        onClick={() => toggleExpand(attempt._id)}
                                    >
                                        <h3 className="font-semibold text-base sm:text-lg truncate max-w-[75%]">
                                            {attempt.game.title}
                                        </h3>
                                        {isExpanded ? (
                                            <ChevronUp className="w-5 h-5" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5" />
                                        )}
                                    </div>
                                    <p className="text-sm sm:text-base">
                                        Score:{" "}
                                        <strong>
                                            {correctCount} / {totalQuestions}
                                        </strong>
                                    </p>
                                    <p className="text-sm sm:text-base">
                                        Percentage: <strong>{percentage}%</strong>
                                    </p>

                                    {isExpanded && (
                                        <div className="mt-2 border-t pt-2 overflow-x-auto">
                                            <h4 className="font-medium">Feedback:</h4>
                                            <ul className="list-disc list-inside text-sm sm:text-base">
                                                {attempt.responses.map((r, i) => (
                                                    <li key={i}>
                                                        {r.question || r.questionId}: Your answer:{" "}
                                                        <strong>{r.answer}</strong>{" "}
                                                        {r.correct !== null &&
                                                            (r.correct ? (
                                                                <span className="text-green-600">
                                                                    Correct ✅
                                                                </span>
                                                            ) : (
                                                                <span className="text-red-600">Wrong ❌</span>
                                                            ))}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </PlayerLayout>
    );
}
