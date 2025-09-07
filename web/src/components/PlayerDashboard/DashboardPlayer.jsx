// src/pages/DashboardPlayer.jsx
import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../Auth/UserContext.jsx";
import PlayerLayout from "./PlayerLayout.jsx";
import { Trophy, BarChart2, Gamepad2, Users } from "lucide-react";
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
    const [attempts, setAttempts] = useState([]);
    const [playerStats, setPlayerStats] = useState(null);

    const token = localStorage.getItem("token");

    // Fetch attempts + leaderboard
    useEffect(() => {
        if (!token) return;

        const fetchData = async () => {
            try {
                // 1️⃣ Fetch leaderboard
                const resLeaderboard = await fetch(
                    "https://exam-practice-1.onrender.com/api/games/leaderboard/full",
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const dataLeaderboard = await resLeaderboard.json();

                console.log("📊 Leaderboard response:", dataLeaderboard);
                console.log("🙋 User from context:", user);

                if (resLeaderboard.ok) {
                    const list = Array.isArray(dataLeaderboard)
                        ? dataLeaderboard
                        : dataLeaderboard.leaderboard || [];

                    const sorted = [...list].sort((a, b) => b.totalScore - a.totalScore);

                    const rankIndex = sorted.findIndex(
                        (p) =>
                            p.playerId === user?.id ||
                            p.playerId === user?._id ||
                            p._id === user?.id ||
                            p.id === user?.id
                    );

                    if (rankIndex !== -1) {
                        setPlayerStats({
                            ...sorted[rankIndex],
                            rank: rankIndex + 1,
                        });
                    }
                }

                // 2️⃣ Fetch my attempts
                const resAttempts = await fetch(
                    "https://exam-practice-1.onrender.com/api/games/attempts/me",
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const dataAttempts = await resAttempts.json();

                console.log("🎯 Attempts response:", dataAttempts);

                if (resAttempts.ok) {
                    setAttempts(dataAttempts.attempts || []);
                }
            } catch (err) {
                console.error("Error fetching player dashboard data:", err);
            }
        };

        fetchData();
    }, [token, user]);



    // Prepare chart data
    const scoreData =
        attempts?.map((a, i) => ({
            attempt: `#${i + 1}`,
            score: a.score,
            total: a.game?.questions?.length || 0,
        })) || [];

    // Quick stats
    const totalAttempts = attempts.length;
    const highestScore = Math.max(...attempts.map((a) => a.score), 0);
    const avgScore =
        totalAttempts > 0
            ? (attempts.reduce((acc, a) => acc + a.score, 0) / totalAttempts).toFixed(
                2
            )
            : 0;

    return (
        <PlayerLayout>
            <div className="p-6">
                <h1 className="text-3xl font-bold mb-6 text-center">
                    🎮 Player Dashboard
                </h1>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Analytics */}
                    <div className="bg-white shadow-lg rounded-2xl p-4 col-span-2">
                        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                            <BarChart2 className="w-5 h-5" /> Performance Analytics
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
                        <div className="mt-4 text-center">
                            <p>📊 Total Attempts: {totalAttempts}</p>
                            <p>🏆 Highest Score: {highestScore}</p>
                            <p>📈 Average Score: {avgScore}</p>
                        </div>
                    </div>

                    {/* Leaderboard Rank */}
                    <div className="bg-white shadow-lg rounded-2xl p-4">
                        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                            <Users className="w-5 h-5" /> Your Rank
                        </h2>
                        {playerStats ? (
                            <div className="text-center">
                                <p className="text-lg font-semibold">{playerStats.name}</p>
                                <p>Total Score: {playerStats.totalScore}</p>
                                <p>Attempts: {playerStats.totalAttempts}</p>
                                <p className="text-green-600 font-bold mt-2">
                                    🏅 Ranked #{playerStats.rank}
                                </p>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center">No leaderboard data</p>
                        )}
                    </div>

                    {/* Recent Attempts */}
                    <div className="bg-white shadow-lg rounded-2xl p-4 col-span-3">
                        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                            <Gamepad2 className="w-5 h-5" /> Recent Attempts
                        </h2>
                        {attempts.length > 0 ? (
                            <div className="space-y-2">
                                {attempts
                                    .slice(-5)
                                    .reverse()
                                    .map((a, i) => {
                                        const totalQ = a.game?.questions?.length || 0;
                                        const percentage =
                                            totalQ > 0
                                                ? ((a.score / totalQ) * 100).toFixed(2)
                                                : 0;
                                        return (
                                            <div
                                                key={i}
                                                className="p-3 border rounded shadow flex justify-between"
                                            >
                                                <span>{a.game?.title || "Game"}</span>
                                                <span className="font-semibold">
                                                    {a.score}/{totalQ} ({percentage}%)
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
                    {highestScore > 0 && (
                        <div className="mt-6 bg-yellow-100 shadow-lg rounded-2xl p-6 col-span-3">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Trophy className="w-6 h-6 text-yellow-600" /> Your Best Result
                            </h2>
                            <p className="mt-2 text-lg">
                                🥇 Highest Score →{" "}
                                <span className="font-semibold">{highestScore}</span>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </PlayerLayout>
    );
}
