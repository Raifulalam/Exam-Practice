// src/components/Host/HostDashboard.jsx
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
    Legend,
} from "recharts";
import { Trophy, Users, Gamepad2, Crown, Star, Search } from "lucide-react";
import CountUp from "react-countup";

export default function HostDashboard() {
    const [stats, setStats] = useState(null);
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, gamesRes] = await Promise.all([
                    fetch("https://exam-practice-1.onrender.com/api/games/host/stats", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch("https://exam-practice-1.onrender.com/api/games/mine", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                const statsData = await statsRes.json();
                const gamesData = await gamesRes.json();

                setStats(statsData);
                setGames(gamesData);
            } catch (err) {
                console.error("Error fetching dashboard data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token]);

    if (loading)
        return <p className="p-6 text-center text-gray-600 animate-pulse">Loading dashboard...</p>;

    const topPlayers = stats?.leaderboard?.slice(0, 5) || [];
    const filteredGames = games.filter((g) =>
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.gameCode.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <HostLayout>
            <div className="p-6 space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard icon={<Gamepad2 />} title="Games Created" value={stats?.gameCount || 0} color="blue" />
                    <StatCard icon={<Users />} title="Total Attempts" value={stats?.totalAttempts || 0} color="green" />
                    <StatCard
                        icon={<Trophy />}
                        title="Avg Attempts/Game"
                        value={stats?.gameCount > 0 ? (stats.totalAttempts / stats.gameCount).toFixed(1) : 0}
                        color="purple"
                    />
                    <StatCard
                        icon={<Trophy />}
                        title="Top Scorer"
                        value={stats?.topScorer?.name || "N/A"}
                        subtitle={`Score: ${stats?.topScorer?.totalScore || 0}`}
                        color="yellow"
                    />
                </div>

                {/* Top Players Podium */}
                <div className="bg-white shadow-lg rounded-xl p-6">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <Crown className="w-6 h-6 text-yellow-500" /> Top Players
                    </h2>
                    <div className="flex flex-col md:flex-row justify-center items-end gap-6">
                        {topPlayers.slice(0, 3).map((player, index) => (
                            <div
                                key={player.playerId}
                                className={`flex flex-col items-center justify-end p-4 rounded-xl shadow-md w-36 ${index === 0
                                        ? "bg-yellow-100 h-52"
                                        : index === 1
                                            ? "bg-gray-100 h-44"
                                            : "bg-orange-100 h-36"
                                    }`}
                            >
                                <span className="text-3xl mb-2">{index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}</span>
                                <p className="font-bold text-lg text-gray-800">{player.name}</p>
                                <p className="text-blue-600 font-semibold">{player.totalScore} pts</p>
                            </div>
                        ))}
                    </div>

                    {/* Remaining players */}
                    {topPlayers.length > 3 && (
                        <ul className="mt-4 divide-y divide-gray-200">
                            {topPlayers.slice(3).map((player, index) => (
                                <li key={player.playerId} className="flex justify-between p-2 hover:bg-gray-50 rounded-lg">
                                    <span>{index + 4}. {player.name}</span>
                                    <span className="flex items-center gap-1 text-yellow-600 font-semibold">
                                        <Star className="w-4 h-4" /> {player.totalScore}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Attempts Per Game Chart */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Attempts Per Game</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats.gameStats || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="title" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="totalAttempts" fill="#6366f1" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Searchable Games Table */}
                <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold">🎮 My Created Games</h2>
                        <div className="flex items-center border rounded p-1 px-2">
                            <Search className="w-4 h-4 mr-1 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search games..."
                                className="outline-none text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {filteredGames.length === 0 ? (
                        <p className="text-gray-600">No games found.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 text-gray-700 text-left">
                                        <th className="p-3 border">#</th>
                                        <th className="p-3 border">Title</th>
                                        <th className="p-3 border">Code</th>
                                        <th className="p-3 border">Questions</th>
                                        <th className="p-3 border">Attempts</th>
                                        <th className="p-3 border">Created At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredGames.map((game, index) => {
                                        const gameStat = stats?.gameStats?.find((gs) => gs.gameId === game._id);
                                        return (
                                            <tr key={game._id} className="text-gray-800 text-sm hover:bg-gray-50">
                                                <td className="p-3 border">{index + 1}</td>
                                                <td className="p-3 border font-medium">{game.title}</td>
                                                <td className="p-3 border font-mono text-blue-600">{game.gameCode}</td>
                                                <td className="p-3 border">{game.questions?.length || 0}</td>
                                                <td className="p-3 border">{gameStat?.totalAttempts || 0}</td>
                                                <td className="p-3 border text-gray-600">{new Date(game.createdAt).toLocaleString()}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </HostLayout>
    );
}

// --- Stats Card Component ---
function StatCard({ icon, title, value, subtitle, color }) {
    const bgColors = {
        blue: "from-blue-500 to-blue-600",
        green: "from-green-500 to-green-600",
        yellow: "from-yellow-500 to-yellow-600",
        purple: "from-purple-500 to-purple-600",
    };
    return (
        <div className={`bg-gradient-to-r ${bgColors[color]} text-white shadow-lg rounded-2xl p-6 flex flex-col justify-between`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="opacity-80">{title}</p>
                    <h3 className="text-3xl font-bold">
                        {typeof value === "number" ? <CountUp end={value} duration={1.5} /> : value}
                    </h3>
                    {subtitle && <p className="text-sm opacity-80">{subtitle}</p>}
                </div>
                <div className="opacity-80">{icon}</div>
            </div>
        </div>
    );
}
