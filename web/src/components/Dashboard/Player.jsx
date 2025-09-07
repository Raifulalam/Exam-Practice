import React, { useEffect, useState } from "react";
import HostLayout from "./HostLayout";
import { Crown, User, Mail, Star } from "lucide-react";

export default function PlayerLeaderboard() {
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAttempts = async () => {
            try {
                const res = await fetch("https://exam-practice-1.onrender.com/api/games/leaderboard/full", {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                if (!res.ok) throw new Error("Failed to fetch attempts");

                const data = await res.json();
                if (Array.isArray(data)) {
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

    if (loading)
        return <p className="p-6 text-center text-gray-600 animate-pulse">Loading leaderboard...</p>;

    if (error)
        return <p className="p-6 text-center text-red-500 font-semibold">Error: {error}</p>;

    const topThree = attempts.slice(0, 3);

    return (
        <HostLayout>
            <div className="bg-white shadow-2xl rounded-2xl p-6 w-full max-w-6xl mx-auto">
                <h2 className="text-3xl font-extrabold mb-8 text-center text-indigo-700 flex items-center justify-center gap-2">
                    <Crown className="w-8 h-8 text-yellow-500" />
                    Leaderboard
                </h2>

                {/* 🏆 Top 3 Winners Podium */}
                {topThree.length > 0 && (
                    <div className="flex flex-col md:flex-row justify-center items-end gap-6 mb-10">
                        {topThree.map((player, index) => (
                            <div
                                key={player._id}
                                className={`flex flex-col items-center justify-end p-4 rounded-xl shadow-md w-40 ${index === 0
                                    ? "bg-yellow-100 h-48"
                                    : index === 1
                                        ? "bg-gray-100 h-40"
                                        : "bg-orange-100 h-36"
                                    }`}
                            >
                                <span className="text-3xl mb-2">
                                    {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                                </span>
                                <p className="font-bold text-lg text-gray-800">
                                    {player.player?.name ?? "Unknown"}
                                </p>
                                <p className="text-blue-600 font-semibold">{player.score} pts</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* 📊 Full Leaderboard Table */}
                {attempts.length === 0 ? (
                    <p className="text-gray-600 text-center">No attempts yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                            <thead>
                                <tr className="bg-indigo-600 text-white text-left">
                                    <th className="px-4 py-3">Rank</th>
                                    <th className="px-4 py-3 ">Player</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3">Score</th>
                                    <th className="px-4 py-3">Questions</th>
                                    <th className="px-4 py-3">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {attempts.map((attempt, index) => (
                                    <tr
                                        key={attempt._id}
                                        className={`transition ${index === 0
                                            ? "bg-yellow-50 font-bold"
                                            : index === 1
                                                ? "bg-gray-50 font-semibold"
                                                : index === 2
                                                    ? "bg-orange-50 font-medium"
                                                    : "hover:bg-gray-50"
                                            }`}
                                    >
                                        <td className="px-4 py-3">
                                            {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                                        </td>

                                        <td className="px-4 py-3 flex items-center gap-2">
                                            <User className="w-4 h-4 text-indigo-500" />
                                            {attempt.player?.name ?? "Unknown"}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 items-center gap-2">
                                            <Mail className="w-4 h-4 text-gray-400 " />
                                            {attempt.player?.email ?? "N/A"}
                                        </td>
                                        <td className="px-4 py-3 text-blue-600 font-bold items-center gap-1">
                                            <Star className="w-4 h-4 text-yellow-500" />
                                            {attempt.score}
                                        </td>
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
