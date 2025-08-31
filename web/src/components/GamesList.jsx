import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function GamesList() {
    const [games, setGames] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/games/all", {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                const data = await res.json();
                setGames(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchGames();
    }, []);

    const handleJoin = (game) => {
        const enteredCode = window.prompt(
            `Enter the game code for "${game.title}" to join:`
        );

        if (!enteredCode) return; // user cancelled

        if (enteredCode === game.gameCode) {
            navigate(`/attempt/${game.gameCode}`);
        } else {
            alert("Invalid game code! Please enter the correct code provided by the host.");
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">🎮 Available Games</h2>
            {games.length === 0 ? (
                <p>No games available.</p>
            ) : (
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2 border">#</th>
                            <th className="p-2 border">Title</th>
                            <th className="p-2 border">Host</th>
                            <th className="p-2 border">Descriptions</th>

                            <th className="p-2 border">No. Questions</th>
                            <th className="p-2 border">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {games.map((game, idx) => (
                            <tr key={game._id} className="text-center hover:bg-gray-50">
                                <td className="p-2 border">{idx + 1}</td>
                                <td className="p-2 border">{game.title}</td>
                                <td className="p-2 border">{game.host?.name || "N/A"}</td>
                                <td className="p-2 border">{game.description || "-"}</td>
                                <td className="p-2 border">{game.questions?.length || 0}</td>
                                <td className="p-2 border">
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
            )}
        </div>
    );
}
