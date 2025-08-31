import React, { useEffect, useState } from "react";
import HostLayout from "./HostLayout";

export default function DashboardHost() {
    const [stats, setStats] = useState(null);
    const [games, setGames] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/games/host/stats", {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                });
                const data = await res.json();
                setStats(data);
            } catch (err) {
                console.error("Error fetching stats", err);
            }
        };

        const fetchGames = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/games/mine", {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                });
                const data = await res.json();
                setGames(data);
            } catch (err) {
                console.error("Error fetching games", err);
            }
        };

        fetchStats();
        fetchGames();
    }, []);

    return (
        <HostLayout>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats Section */}
                <div className="bg-white shadow-lg rounded-2xl p-4">
                    <h2 className="text-xl font-semibold">Games Created</h2>
                    <p className="text-3xl">{stats?.gameCount || 0}</p>
                </div>

                <div className="bg-white shadow-lg rounded-2xl p-4">
                    <h2 className="text-xl font-semibold">Top Participant</h2>
                    <p>{stats?.topParticipant?.playerId || "N/A"}</p>
                    <p className="text-sm text-gray-600">
                        Attempts: {stats?.topParticipant?.attempts || 0}
                    </p>
                </div>

                <div className="bg-white shadow-lg rounded-2xl p-4">
                    <h2 className="text-xl font-semibold">Top Scorer</h2>
                    <p>{stats?.topScorer?.playerId || "N/A"}</p>
                    <p className="text-sm text-gray-600">
                        Score: {stats?.topScorer?.score || 0}
                    </p>
                </div>
            </div>

            {/* Games List Section */}
            <div className="p-6 mt-6 bg-white shadow-lg rounded-2xl">
                <h2 className="text-2xl font-bold mb-4">🎮 My Created Games</h2>
                {games.length > 0 ? (
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-2 border">#</th>
                                <th className="p-2 border">Title</th>
                                <th className="p-2 border">Code</th>
                                <th className="p-2 border">Questions</th>
                                <th className="p-2 border">Attempts</th>
                                <th className="p-2 border">Created At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats?.gameStats?.map((game, index) => (
                                <tr key={game.gameId} className="text-center hover:bg-gray-50">
                                    <td className="p-2 border">{index + 1}</td>
                                    <td className="p-2 border">{game.title}</td>
                                    <td className="p-2 border font-mono">{game.gameCode}</td>
                                    <td className="p-2 border">{game.totalQuestions}</td>
                                    <td className="p-2 border">{game.totalAttempts}</td>
                                    <td className="p-2 border">
                                        {new Date(game.createdAt).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>


                ) : (
                    <p className="text-gray-600">No games created yet.</p>
                )}
            </div>
        </HostLayout>
    );
}
