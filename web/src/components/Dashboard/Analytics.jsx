// src/components/Host/Analytics.jsx
import React, { useEffect, useState } from "react";
import HostLayout from "./HostLayout";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function Analytics() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/games/host/stats", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
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
                <h2 className="text-2xl font-bold mb-6">📊 Analytics Dashboard</h2>

                {loading ? (
                    <p>Loading stats...</p>
                ) : !stats ? (
                    <p>No stats available</p>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white rounded-xl shadow p-4 text-center">
                                <p className="text-gray-500">Total Games</p>
                                <h3 className="text-3xl font-bold text-indigo-600">{stats.gameCount}</h3>
                            </div>

                            <div className="bg-white rounded-xl shadow p-4 text-center">
                                <p className="text-gray-500">Total Attempts</p>
                                <h3 className="text-3xl font-bold text-green-600">{stats.totalAttempts}</h3>
                            </div>
                            <div className="bg-white rounded-xl shadow p-4 text-center">
                                <p className="text-gray-500">Avg Attempts/Game</p>
                                <h3 className="text-3xl font-bold text-blue-600">
                                    {stats.gameCount > 0
                                        ? (stats.totalAttempts / stats.gameCount).toFixed(1)
                                        : 0}
                                </h3>
                            </div>
                        </div>

                        {/* Chart */}
                        <div className="bg-white rounded-xl shadow p-6 mb-8">
                            <h3 className="text-lg font-semibold mb-4">Attempts Per Game</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={stats.gameStats}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="title" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="totalAttempts" fill="#4f46e5" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Table */}
                        <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
                            <h3 className="text-lg font-semibold mb-4">Game Breakdown</h3>
                            <table className="min-w-full text-sm text-left">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-4 py-2 border">Game</th>
                                        <th className="px-4 py-2 border">Game Code</th>
                                        <th className="px-4 py-2 border">Questions</th>
                                        <th className="px-4 py-2 border">Attempts</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.gameStats.map((g) => (
                                        <tr key={g.gameId} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 border">{g.title}</td>
                                            <td className="px-4 py-2 border">{g.gameCode}</td>
                                            <td className="px-4 py-2 border">{g.totalQuestions}</td>
                                            <td className="px-4 py-2 border">{g.totalAttempts}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </HostLayout>
    );
}
