import React, { useEffect, useState } from "react";
import {
    Trophy,
    Users,
    Gamepad2,
    Eye,
    EyeOff,
    Plus,
    Trash,
    Edit,
} from "lucide-react";
import HostLayout from "./HostLayout";

export default function HostAdminPanel() {
    const [stats, setStats] = useState(null);
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newGameTitle, setNewGameTitle] = useState("");
    const [newGameType, setNewGameType] = useState("quiz");

    const token = localStorage.getItem("token");

    // Fetch dashboard stats and games
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, gamesRes] = await Promise.all([
                    fetch(
                        "https://exam-practice-1.onrender.com/api/games/host/stats",
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        }
                    ),
                    fetch("https://exam-practice-1.onrender.com/api/games/mine", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                setStats(await statsRes.json());
                setGames(await gamesRes.json());
            } catch (err) {
                console.error("Error fetching dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);

    // Toggle publish/unpublish
    const togglePublish = async (gameId, isPublished) => {
        try {
            const res = await fetch(
                `https://exam-practice-1.onrender.com/api/games/publish/${gameId}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ isPublished: !isPublished }),
                }
            );
            if (!res.ok) throw new Error("Failed to update status");
            setGames((prev) =>
                prev.map((g) =>
                    g._id === gameId ? { ...g, isPublished: !isPublished } : g
                )
            );
        } catch (err) {
            console.error(err);
        }
    };

    // Create a new game
    const createGame = async () => {
        if (!newGameTitle) return alert("Title required");
        try {
            const res = await fetch(
                "https://exam-practice-1.onrender.com/api/games/create",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title: newGameTitle,
                        gameType: newGameType,
                        questions: [],
                        gameCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
                    }),
                }
            );
            const data = await res.json();
            if (res.ok) {
                setGames((prev) => [data.game, ...prev]);
                setNewGameTitle("");
            } else {
                alert(data.msg || "Failed to create game");
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Delete game
    const deleteGame = async (gameId) => {
        if (!window.confirm("Are you sure to delete this game?")) return;
        try {
            const res = await fetch(
                `https://exam-practice-1.onrender.com/api/games/delete/${gameId}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (!res.ok) throw new Error("Delete failed");
            setGames((prev) => prev.filter((g) => g._id !== gameId));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <p className="p-6 text-center">Loading dashboard...</p>;

    return (
        <HostLayout>
            <div className="p-6 space-y-8">
                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg rounded-2xl p-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold">Games Created</h2>
                            <p className="text-4xl font-bold">{games.length || 0}</p>
                        </div>
                        <Gamepad2 className="w-10 h-10 opacity-80" />
                    </div>

                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg rounded-2xl p-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold">Top Participant</h2>
                            <p className="font-bold">{stats?.topParticipant || "N/A"}</p>
                            <p className="text-sm opacity-80">
                                Attempts: {stats?.topParticipant?.attempts || 0}
                            </p>
                        </div>
                        <Users className="w-10 h-10 opacity-80" />
                    </div>

                    <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg rounded-2xl p-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold">Top Scorer</h2>
                            <p className="font-bold">{stats?.topScorer?.name || "N/A"}</p>
                            <p className="text-sm opacity-80">
                                Score: {stats?.topScorer?.score || 0}
                            </p>
                        </div>
                        <Trophy className="w-10 h-10 opacity-80" />
                    </div>
                </div>

                {/* Create Game */}
                <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
                    <input
                        type="text"
                        placeholder="New Game Title"
                        value={newGameTitle}
                        onChange={(e) => setNewGameTitle(e.target.value)}
                        className="border rounded-lg p-2 flex-1"
                    />
                    <select
                        value={newGameType}
                        onChange={(e) => setNewGameType(e.target.value)}
                        className="border rounded-lg p-2"
                    >
                        <option value="quiz">Quiz</option>
                        <option value="exam">Exam</option>
                        <option value="truth">Truth</option>
                        <option value="dare">Dare</option>
                        <option value="competitive">Competitive</option>
                    </select>
                    <button
                        onClick={createGame}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Create Game</span>
                    </button>
                </div>

                {/* Games Table */}
                <div className="bg-white shadow-lg rounded-2xl p-6">
                    <h2 className="text-2xl font-bold mb-4">🎮 My Games</h2>
                    {games.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="bg-gray-100 text-gray-700">
                                        <th className="p-3 border">#</th>
                                        <th className="p-3 border">Title</th>
                                        <th className="p-3 border">Code</th>
                                        <th className="p-3 border">Type</th>
                                        <th className="p-3 border">Questions</th>
                                        <th className="p-3 border">Status</th>
                                        <th className="p-3 border">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {games.map((game, idx) => (
                                        <tr
                                            key={game._id}
                                            className="text-gray-800 text-sm hover:bg-gray-50"
                                        >
                                            <td className="p-3 border">{idx + 1}</td>
                                            <td className="p-3 border font-medium">{game.title}</td>
                                            <td className="p-3 border font-mono text-blue-600">
                                                {game.gameCode}
                                            </td>
                                            <td className="p-3 border">{game.gameType}</td>
                                            <td className="p-3 border">{game.questions?.length || 0}</td>
                                            <td className="p-3 border flex items-center space-x-2">
                                                {game.isPublished ? (
                                                    <span className="flex items-center text-green-600 font-semibold">
                                                        <Eye className="w-4 h-4 mr-1" /> Published
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center text-red-600 font-semibold">
                                                        <EyeOff className="w-4 h-4 mr-1" /> Hidden
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3 border flex space-x-2">
                                                <button
                                                    onClick={() => togglePublish(game._id, game.isPublished)}
                                                    className={`px-3 py-1 rounded-lg text-white ${game.isPublished
                                                        ? "bg-red-500 hover:bg-red-600"
                                                        : "bg-green-500 hover:bg-green-600"
                                                        }`}
                                                >
                                                    {game.isPublished ? "Unpublish" : "Publish"}
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        window.open(
                                                            `/host/leaderboard/${game.gameCode}`,
                                                            "_blank"
                                                        )
                                                    }
                                                    className="px-3 py-1 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600"
                                                >
                                                    Leaderboard
                                                </button>
                                                <button
                                                    onClick={() => deleteGame(game._id)}
                                                    className="px-3 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600"
                                                >
                                                    <Trash className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        window.location.href = `/host/edit/${game._id}`
                                                    }
                                                    className="px-3 py-1 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
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
            </div>
        </HostLayout>
    );
}
