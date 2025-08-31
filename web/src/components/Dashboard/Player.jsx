import React, { useEffect, useState } from "react";
import HostLayout from "./HostLayout";

export default function Players() {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/host/players", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`, // if you use JWT
                    },
                });
                const data = await res.json();
                setPlayers(data);
            } catch (err) {
                console.error("Error fetching players:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPlayers();
    }, []);

    return (
        <HostLayout>
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">👥 Player Management</h2>

                {loading ? (
                    <p>Loading players...</p>
                ) : players.length === 0 ? (
                    <p>No players found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border rounded-lg shadow">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="py-2 px-4 border">#</th>
                                    <th className="py-2 px-4 border">Player Name</th>
                                    <th className="py-2 px-4 border">Score</th>
                                    <th className="py-2 px-4 border">Attempts</th>
                                    <th className="py-2 px-4 border">Percentage</th>
                                </tr>
                            </thead>
                            <tbody>
                                {players.map((player, index) => {
                                    const percentage = player.attempts > 0
                                        ? ((player.score / player.attempts) * 100).toFixed(1)
                                        : 0;
                                    return (
                                        <tr key={index} className="text-center">
                                            <td className="py-2 px-4 border">{index + 1}</td>
                                            <td className="py-2 px-4 border">{player.name}</td>
                                            <td className="py-2 px-4 border">{player.score}</td>
                                            <td className="py-2 px-4 border">{player.attempts}</td>
                                            <td className="py-2 px-4 border">{percentage}%</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </HostLayout>
    );
}
