// src/pages/DashboardPlayer.jsx
import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../Auth/UserContext.jsx";
import PlayerLayout from "./PlayerLayout.jsx";
import {
    PlusCircle,
    Trophy,
    BarChart2,
    Gamepad2
} from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

export default function DashboardPlayer() {
    const { user } = useContext(UserContext);
    const [practiceSets, setPracticeSets] = useState([]);
    const [stats, setStats] = useState(null);

    const token = localStorage.getItem("token");

    // Fetch practice sets + scores
    useEffect(() => {
        if (!token) return;

        const fetchPracticeSets = async () => {
            try {
                const res = await fetch("https://exam-practice-1.onrender.com/api/practice-sets", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) setPracticeSets(await res.json());
            } catch (err) {
                console.error("Error fetching practice sets:", err);
            }
        };

        const fetchScores = async () => {
            try {
                const res = await fetch("https://exam-practice-1.onrender.com/api/cee/my-scores", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (res.ok) setStats(data);
            } catch (err) {
                console.error("Error fetching scores:", err);
            }
        };

        fetchPracticeSets();
        fetchScores();
    }, [token]);

    const scoreData =
        stats?.scores?.map((s, i) => ({
            attempt: `#${i + 1}`,
            score: s.score,
        })) || [];

    return (
        <PlayerLayout>
            <div className="p-6">
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
                                    className="flex justify-between items-center mb-2"
                                >
                                    {set.title} ({set.questions.length} Questions)
                                    <button
                                        onClick={() =>
                                            (window.location.href = `/practice/${set._id}`)
                                        }
                                        className="ml-3 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        Play
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Analytics */}
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

                    {/* Recent Attempts */}
                    <div className="bg-white shadow-lg rounded-2xl p-4 col-span-3 md:col-span-1">
                        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                            <Gamepad2 className="w-5 h-5" /> Recent Attempts
                        </h2>
                        {stats?.scores?.length > 0 ? (
                            <div className="space-y-2">
                                {stats.scores
                                    .slice(-5)
                                    .reverse()
                                    .map((s, i) => {
                                        const percentage = (
                                            (s.score / s.totalQuestions) *
                                            100
                                        ).toFixed(2);
                                        return (
                                            <div
                                                key={i}
                                                className="p-3 border rounded shadow flex justify-between"
                                            >
                                                <span>{s.practiceSet?.title || "Test"}</span>
                                                <span className="font-semibold">
                                                    {s.score}/{s.totalQuestions} ({percentage}%)
                                                </span>
                                            </div>
                                        );
                                    })}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500">No attempts yet.</p>
                        )}
                    </div>

                    {/* Best Result */}
                    {stats && (
                        <div className="mt-6 bg-yellow-100 shadow-lg rounded-2xl p-6 col-span-3">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Trophy className="w-6 h-6 text-yellow-600" /> Your Best
                                Result
                            </h2>
                            <p className="mt-2 text-lg">
                                🥇 Highest Score →{" "}
                                <span className="font-semibold">{stats.highestScore}</span>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </PlayerLayout>
    );
}
