import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../Auth/UserContext.jsx";
import PlayerLayout from "./PlayerLayout.jsx";
import { Trophy, BarChart2, Gamepad2, Users } from "lucide-react";
import '../../cssfiles/Playerdashboard.css'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import CountUp from "react-countup";

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
            ? (attempts.reduce((acc, a) => acc + a.score, 0) / totalAttempts).toFixed(2)
            : 0;

    return (
        <PlayerLayout>
            <div className="p-4 md:p-6 space-y-6">
                <h1 className="text-2xl md:text-3xl font-bold text-center">
                    🎮 Player Dashboard
                </h1>

                {/* --- Quick Stats & Analytics --- */}
                <div className="grid md:grid-cols-3 gap-4">
                    {/* Analytics Chart */}
                    <div className="bg-white shadow-lg rounded-2xl p-4 md:col-span-2">
                        <h2 className="text-lg md:text-xl font-semibold mb-2 flex items-center gap-2">
                            <BarChart2 className="w-5 h-5" /> Performance Analytics
                        </h2>
                        <div className="responsive-chart">
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
                        <div className="mt-2 text-center text-sm md:text-base space-y-1">
                            <p>📊 Total Attempts: <CountUp end={totalAttempts} duration={1.2} /></p>
                            <p>🏆 Highest Score: <CountUp end={highestScore} duration={1.2} /></p>
                            <p>📈 Average Score: {avgScore}</p>
                        </div>
                    </div>

                    {/* Leaderboard Rank */}
                    <div className="bg-white shadow-lg rounded-2xl p-4 text-center">
                        <h2 className="text-lg md:text-xl font-semibold mb-2 flex items-center justify-center gap-2">
                            <Users className="w-5 h-5" /> Your Rank
                        </h2>
                        {playerStats ? (
                            <div className="space-y-1">
                                <p className="text-md md:text-lg font-semibold">{playerStats.name}</p>
                                <p>Total Score: {playerStats.totalScore}</p>
                                <p>Attempts: {playerStats.totalAttempts}</p>
                                <p className="text-green-600 font-bold mt-1 md:mt-2">
                                    🏅 Ranked #{playerStats.rank}
                                </p>
                            </div>
                        ) : (
                            <p className="text-gray-500">No leaderboard data</p>
                        )}
                    </div>
                </div>

                {/* Recent Attempts */}
                <div className="bg-white shadow-lg rounded-2xl p-4">
                    <h2 className="text-lg md:text-xl font-semibold mb-2 flex items-center gap-2">
                        <Gamepad2 className="w-5 h-5" /> Recent Attempts
                    </h2>
                    {attempts.length > 0 ? (
                        <div className="space-y-2">
                            {attempts.slice(-5).reverse().map((a, i) => {
                                const totalQ = a.game?.questions?.length || 0;
                                const percentage =
                                    totalQ > 0 ? ((a.score / totalQ) * 100).toFixed(2) : 0;
                                return (
                                    <div
                                        key={i}
                                        className="p-3 border rounded shadow flex justify-between md:flex-row flex-col"
                                    >
                                        <span className="font-medium">{a.game?.title || "Game"}</span>
                                        <span className="font-semibold text-sm md:text-base">
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

                {/* Best Result Card (Horizontal Scroll for Mobile) */}
                {highestScore > 0 && (
                    <div className="mt-4 bg-yellow-100 shadow-lg rounded-2xl p-4 overflow-x-auto">
                        <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
                            <Trophy className="w-6 h-6 text-yellow-600" /> Your Best Result
                        </h2>
                        <div className="flex gap-4 mt-2 min-w-max">
                            <div className="bg-white shadow rounded-xl p-4 flex flex-col items-center min-w-[150px]">
                                <span className="text-2xl md:text-3xl">🥇</span>
                                <p className="mt-1 font-semibold">Highest Score</p>
                                <p className="text-lg md:text-xl font-bold">{highestScore}</p>
                            </div>
                            <div className="bg-white shadow rounded-xl p-4 flex flex-col items-center min-w-[150px]">
                                <span className="text-2xl md:text-3xl">📊</span>
                                <p className="mt-1 font-semibold">Total Attempts</p>
                                <p className="text-lg md:text-xl font-bold">{totalAttempts}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PlayerLayout>
    );
}
