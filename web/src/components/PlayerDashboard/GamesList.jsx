import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PlayerLayout from "./PlayerLayout";
import { Search, ChevronDown, ChevronRight } from "lucide-react";

export default function GamesList() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedSubjects, setExpandedSubjects] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const res = await fetch("https://exam-practice-1.onrender.com/api/games/all", {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                const data = await res.json();
                setGames(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchGames();
    }, []);

    const handleJoin = (game) => {
        const enteredCode = window.prompt(`Enter the game code for "${game.title}" to join:`);
        if (!enteredCode) return;
        if (enteredCode === game.gameCode) {
            navigate(`/attempt/${game.gameCode}`);
        } else {
            alert("Invalid game code! Please enter the correct code provided by the host.");
        }
    };

    // Filter games based on search
    const filteredGames = games.filter(
        (g) =>
            g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.subject?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group games by subject
    const gamesBySubject = filteredGames.reduce((acc, game) => {
        const subject = game.subject || "Other";
        if (!acc[subject]) acc[subject] = [];
        acc[subject].push(game);
        return acc;
    }, {});

    const toggleSubject = (subject) => {
        setExpandedSubjects((prev) => ({
            ...prev,
            [subject]: !prev[subject],
        }));
    };

    if (loading)
        return <p className="p-6 text-center text-gray-600 animate-pulse">Loading games...</p>;

    return (
        <PlayerLayout>
            <div className="p-6 max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">🎮 Available Games</h2>
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

                {Object.keys(gamesBySubject).length === 0 ? (
                    <p className="text-gray-600">No games found.</p>
                ) : (
                    Object.entries(gamesBySubject).map(([subject, games]) => (
                        <div key={subject} className="mb-4 border rounded overflow-hidden">
                            {/* Subject Header */}
                            <button
                                onClick={() => toggleSubject(subject)}
                                className="w-full flex justify-between items-center p-3 bg-gray-100 hover:bg-gray-200 rounded-t"
                            >
                                <span className="font-semibold">{subject} ({games.length})</span>
                                {expandedSubjects[subject] ? (
                                    <ChevronDown className="w-4 h-4 transition-transform duration-300" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 transition-transform duration-300" />
                                )}
                            </button>

                            {/* Collapsible Games Table */}
                            <div
                                className="transition-all duration-500 ease-in-out overflow-hidden"
                                style={{ maxHeight: expandedSubjects[subject] ? "2000px" : "0px" }}
                            >
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 text-gray-700 text-left">
                                                <th className="p-3 border">#</th>
                                                <th className="p-3 border">Title</th>
                                                <th className="p-3 border">Code</th>
                                                <th className="p-3 border">Questions</th>
                                                <th className="p-3 border">Host</th>
                                                <th className="p-3 border">Created At</th>
                                                <th className="p-3 border">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {games.map((game, index) => (
                                                <tr key={game._id} className="text-gray-800 text-sm hover:bg-gray-50">
                                                    <td className="p-3 border">{index + 1}</td>
                                                    <td className="p-3 border font-medium">{game.title}</td>
                                                    <td className="p-3 border font-mono text-blue-600">{game.gameCode}</td>
                                                    <td className="p-3 border">{game.questions?.length || 0}</td>
                                                    <td className="p-3 border">{game.host?.name || "N/A"}</td>
                                                    <td className="p-3 border text-gray-600">
                                                        {new Date(game.createdAt).toLocaleString()}
                                                    </td>
                                                    <td className="p-3 border">
                                                        <button
                                                            onClick={() => handleJoin(game)}
                                                            className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                                                        >
                                                            Join
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </PlayerLayout>
    );
}
