// src/components/Host/Analytics.jsx
import React, { useEffect, useState } from "react";
import HostLayout from "./HostLayout";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import {
    Trophy,
    Users,
    FileText,
    Target,
} from "lucide-react";

export default function Analytics() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(
                    "https://exam-practice-1.onrender.com/api/games/host/stats",
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                const data = await res.json();
                setStats(data);
            } catch (err) {
                console.error("Error fetching stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <HostLayout>
            <div className="p-6">
                <h2 className="text-3xl font-bold mb-8 text-gray-800">
                    📊 Analytics Dashboard
                </h2>

                {loading ? (
                    <p>Loading stats...</p>
                ) : !stats ? (
                    <p>No stats available</p>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                            <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-xl shadow p-6 text-white">
                                <FileText className="w-8 h-8 mb-2" />
                                <p className="opacity-80">Total Games</p>
                                <h3 className="text-3xl font-bold">{stats.gameCount}</h3>
                            </div>

                            <div className="bg-gradient-to-r from-green-500 to-green-700 rounded-xl shadow p-6 text-white">
                                <Users className="w-8 h-8 mb-2" />
                                <p className="opacity-80">Total Attempts</p>
                                <h3 className="text-3xl font-bold">{stats.totalAttempts}</h3>
                            </div>

                            <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl shadow p-6 text-white">
                                <Target className="w-8 h-8 mb-2" />
                                <p className="opacity-80">Avg Attempts/Game</p>
                                <h3 className="text-3xl font-bold">
                                    {stats.gameCount > 0
                                        ? (stats.totalAttempts / stats.gameCount).toFixed(1)
                                        : 0}
                                </h3>
                            </div>

                            <div className="bg-gradient-to-r from-amber-500 to-amber-700 rounded-xl shadow p-6 text-white">
                                <Trophy className="w-8 h-8 mb-2" />
                                <p className="opacity-80">Top Scorer</p>
                                <h3 className="text-lg font-semibold">
                                    {stats.topScorer?.name || "N/A"}
                                </h3>
                            </div>
                        </div>

                        {/* Chart */}
                        <div className="bg-white rounded-xl shadow p-6 mb-10">
                            <h3 className="text-lg font-semibold mb-4 text-gray-700">
                                Attempts Per Game
                            </h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={stats.gameStats}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="title" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="totalAttempts" fill="#6366f1" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Table */}
                        <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
                            <h3 className="text-lg font-semibold mb-4 text-gray-700">
                                Game Breakdown
                            </h3>
                            <table className="min-w-full text-sm text-left border rounded-lg overflow-hidden">
                                <thead>
                                    <tr className="bg-gray-100 text-gray-600">
                                        <th className="px-4 py-2 border">Game</th>
                                        <th className="px-4 py-2 border">Game Code</th>
                                        <th className="px-4 py-2 border">Questions</th>
                                        <th className="px-4 py-2 border">Attempts</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(stats.gameStats) && stats.gameStats.length > 0 ? (
                                        stats.gameStats.map((g) => (
                                            <tr key={g.gameId} className="hover:bg-gray-50 transition">
                                                <td className="px-4 py-2 border">{g.title}</td>
                                                <td className="px-4 py-2 border">{g.gameCode}</td>
                                                <td className="px-4 py-2 border">{g.totalQuestions}</td>
                                                <td className="px-4 py-2 border">{g.totalAttempts}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-4 py-4 text-center text-gray-500">
                                                No game data available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>


                    </>
                )}
            </div>
        </HostLayout>
    );
}
