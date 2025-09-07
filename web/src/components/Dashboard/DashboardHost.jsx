import React, { useEffect, useState } from "react";
import { Trophy, Users, Gamepad2 } from "lucide-react";
import HostLayout from "./HostLayout";

export default function DashboardHost() {
    const [stats, setStats] = useState(null);
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    console.log(games.id)
    function getTimestampFromObjectId(id) {
        return new Date(parseInt(id.substring(0, 8), 16) * 1000);
    }
    const mt = localStorage.getItem('token');
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, gamesRes] = await Promise.all([
                    fetch("https://exam-practice-1.onrender.com/api/games/host/stats", {
                        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                    }),
                    fetch("https://exam-practice-1.onrender.com/api/games/mine", {
                        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                    })
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
    }, []);

    if (loading) return <p className="p-6 text-center">Loading dashboard...</p>;

    return (
        <HostLayout>

            <p>{mt}</p>

            {/* Stats Section */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">

                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg rounded-2xl p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">Games Created</h2>
                        <p className="text-4xl font-bold">{stats?.gameCount || 0}</p>
                    </div>
                    <Gamepad2 className="w-10 h-10 opacity-80" />
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg rounded-2xl p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">Top Participant</h2>
                        <p className="font-bold">
                            {stats?.topParticipant?.name || "N/A"}
                        </p>
                        <p className="text-sm opacity-80">
                            Attempts: {stats?.topParticipant?.attempts || 0}
                        </p>
                    </div>
                    <Users className="w-10 h-10 opacity-80" />
                </div>

                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg rounded-2xl p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">Top Scorer</h2>
                        <p className="font-bold">
                            {stats?.topScorer?.name || "N/A"}
                        </p>
                        <p className="text-sm opacity-80">
                            Score: {stats?.topScorer?.score || 0}
                        </p>
                    </div>
                    <Trophy className="w-10 h-10 opacity-80" />
                </div>
            </div>

            {/* Games List Section */}
            <div className="p-6 mt-6 bg-white shadow-lg rounded-2xl">
                <h2 className="text-2xl font-bold mb-4">🎮 My Created Games</h2>
                {games.length > 0 ? (
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
                                {stats?.gameStats?.map((game, index) => (
                                    <tr
                                        key={game.gameId}
                                        className="text-gray-800 text-sm hover:bg-gray-50"
                                    >
                                        <td className="p-3 border">{index + 1}</td>
                                        <td className="p-3 border font-medium">{game.title}</td>
                                        <td className="p-3 border font-mono text-blue-600">{game.gameCode}</td>
                                        <td className="p-3 border">{game.totalQuestions}</td>
                                        <td className="p-3 border">{game.totalAttempts}</td>
                                        <td className="p-3 border text-gray-600">
                                            {games?._id
                                                ? getTimestampFromObjectId(String(games._id)).toLocaleString()
                                                : "N/A"}
                                        </td>


                                    </tr>

                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-600">No games created yet.</p>
                )}
            </div>
        </HostLayout>
    );
}
