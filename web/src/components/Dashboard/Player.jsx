import React, { useEffect, useState } from "react";
import HostLayout from "./HostLayout";
export default function Player() {
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAttempts = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/games/attempts");
                if (!res.ok) throw new Error("Failed to fetch attempts");

                const data = await res.json();
                console.log("Attempts API response:", data);

                if (Array.isArray(data)) {
                    // sort by score (highest first)
                    const sorted = [...data].sort((a, b) => b.score - a.score);
                    setAttempts(sorted);
                } else {
                    throw new Error("Unexpected response format");
                }
            } catch (err) {
                console.error("Error fetching attempts:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAttempts();
    }, []);

    if (loading) return <p>Loading leaderboard...</p>;
    if (error) return <p className="text-red-500">Error: {error}</p>;

    return (
        <HostLayout>


            <div className="bg-white shadow-2xl rounded-2xl p-6 w-full max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-center text-indigo-600">
                    🏆 Leaderboard
                </h2>

                {attempts.length === 0 ? (
                    <p className="text-gray-600 text-center">No attempts yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto border-collapse">
                            <thead>
                                <tr className="bg-indigo-100 text-indigo-700 text-left">
                                    <th className="px-4 py-2 rounded-tl-lg">Rank</th>
                                    <th className="px-4 py-2">Player</th>
                                    <th className="px-4 py-2">Email</th>
                                    <th className="px-4 py-2">Score</th>
                                    <th className="px-4 py-2">Responses</th>
                                    <th className="px-4 py-2 rounded-tr-lg">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attempts.map((attempt, index) => (
                                    <tr
                                        key={attempt._id}
                                        className={`border-b hover:bg-gray-50 transition ${index === 0
                                            ? "bg-yellow-50 font-bold"
                                            : index === 1
                                                ? "bg-gray-100 font-semibold"
                                                : index === 2
                                                    ? "bg-orange-50 font-medium"
                                                    : ""
                                            }`}
                                    >
                                        <td className="px-4 py-3">
                                            {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                                        </td>
                                        <td className="px-4 py-3">{attempt.player?.name ?? "Unknown"}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {attempt.player?.email ?? "N/A"}
                                        </td>
                                        <td className="px-4 py-3 text-blue-600 font-bold">{attempt.score}</td>
                                        <td className="px-4 py-3">{attempt.responses?.length ?? 0}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {new Date(attempt.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </HostLayout>
    );
}
