// src/components/Host/Analytics.jsx
import React, { useEffect, useState } from "react";
import HostLayout from "./HostLayout";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";

export default function Analytics() {
    const [stats, setStats] = useState(null);
    const [attempts, setAttempts] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    // filters
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // pagination
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10; // rows per page

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(
                    "https://exam-practice-1.onrender.com/api/games/host/stats",
                    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
                );
                const data = await res.json();
                setStats(data);
            } catch (err) {
                console.error("Error fetching stats:", err);
            }
        };

        const fetchAttempts = async () => {
            try {
                const res = await fetch(
                    "https://exam-practice-1.onrender.com/api/games/attempts",
                    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
                );
                const data = await res.json();
                setAttempts(data);
            } catch (err) {
                console.error("Error fetching attempts:", err);
            } finally {
                setLoading(false);
            }
        };

        const fetchLeaderboard = async () => {
            try {
                const res = await fetch(
                    "https://exam-practice-1.onrender.com/api/games/leaderboard/full",
                    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
                );
                const data = await res.json();
                setLeaderboard(data);
            } catch (err) {
                console.error("Error fetching leaderboard:", err);
            }
        };

        fetchStats();
        fetchAttempts();
        fetchLeaderboard();
    }, []);

    // Apply filters
    const filteredAttempts = attempts.filter((a) => {
        const playerName = a.player?.name?.toLowerCase() || "";
        const gameTitle = a.game?.title?.toLowerCase() || "";
        const searchMatch =
            playerName.includes(search.toLowerCase()) ||
            gameTitle.includes(search.toLowerCase());

        const attemptDate = new Date(a.createdAt);
        const afterStart = startDate ? attemptDate >= new Date(startDate) : true;
        const beforeEnd = endDate ? attemptDate <= new Date(endDate) : true;

        return searchMatch && afterStart && beforeEnd;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredAttempts.length / pageSize);
    const paginatedAttempts = filteredAttempts.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    // Export attempts to CSV
    const exportToCSV = () => {
        const headers = ["Player", "Email", "Game", "Score", "Date"];
        const rows = filteredAttempts.map((a) => [
            a.player?.name,
            a.player?.email,
            a.game?.title,
            a.score,
            a.createdAt ? new Date(a.createdAt).toLocaleString() : "N/A",
        ]);

        let csvContent =
            "data:text/csv;charset=utf-8," +
            [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", "attempts_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <HostLayout>
            <div className="p-6">
                <h2 className="text-3xl font-bold mb-8 text-gray-800">
                    📊 Detailed Analytics
                </h2>

                {loading ? (
                    <p>Loading stats...</p>
                ) : (
                    <>
                        {/* Charts Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                            {/* Attempts per Game */}
                            <div className="bg-white rounded-xl shadow p-6">
                                <h3 className="text-lg font-semibold mb-4 text-gray-700">
                                    Attempts Per Game
                                </h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={stats?.gameStats}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="title" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="totalAttempts" fill="#6366f1" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Top Players */}
                            <div className="bg-white rounded-xl shadow p-6">
                                <h3 className="text-lg font-semibold mb-4 text-gray-700">
                                    Top Players by Score
                                </h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={leaderboard.slice(0, 5)}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="totalScore" fill="#10b981" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Leaderboard Table */}
                        <div className="bg-white rounded-xl shadow p-6 mb-10 overflow-x-auto">
                            <h3 className="text-lg font-semibold mb-4 text-gray-700">
                                🏆 Leaderboard
                            </h3>
                            <table className="min-w-full text-sm text-left border rounded-lg">
                                <thead>
                                    <tr className="bg-gray-100 text-gray-600">
                                        <th className="px-4 py-2 border">Player</th>
                                        <th className="px-4 py-2 border">Email</th>
                                        <th className="px-4 py-2 border">Total Score</th>
                                        <th className="px-4 py-2 border">Attempts</th>
                                        <th className="px-4 py-2 border">Games Played</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboard.length > 0 ? (
                                        leaderboard.map((p) => (
                                            <tr
                                                key={p.playerId}
                                                className="hover:bg-gray-50 transition"
                                            >
                                                <td className="px-4 py-2 border">{p.name}</td>
                                                <td className="px-4 py-2 border">{p.email}</td>
                                                <td className="px-4 py-2 border">{p.totalScore}</td>
                                                <td className="px-4 py-2 border">{p.totalAttempts}</td>
                                                <td className="px-4 py-2 border">{p.games.length}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="5"
                                                className="px-4 py-4 text-center text-gray-500"
                                            >
                                                No leaderboard data available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Attempts Table with Filters + Pagination */}
                        <div className="bg-white rounded-xl shadow p-6 mb-10 overflow-x-auto">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
                                <input
                                    type="text"
                                    placeholder="Search by player or game"
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setCurrentPage(1); // reset to page 1
                                    }}
                                    className="border rounded px-3 py-2 w-full md:w-1/3"
                                />
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => {
                                            setStartDate(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="border rounded px-3 py-2"
                                    />
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => {
                                            setEndDate(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="border rounded px-3 py-2"
                                    />
                                </div>
                                <button
                                    onClick={exportToCSV}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow"
                                >
                                    ⬇ Export CSV
                                </button>
                            </div>

                            <h3 className="text-lg font-semibold mb-4 text-gray-700">
                                Player Attempts
                            </h3>

                            <table className="min-w-full text-sm text-left border rounded-lg">
                                <thead>
                                    <tr className="bg-gray-100 text-gray-600">
                                        <th className="px-4 py-2 border">Player</th>
                                        <th className="px-4 py-2 border">Email</th>
                                        <th className="px-4 py-2 border">Game</th>
                                        <th className="px-4 py-2 border">Score</th>
                                        <th className="px-4 py-2 border">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedAttempts.length > 0 ? (
                                        paginatedAttempts.map((a) => (
                                            <tr key={a._id} className="hover:bg-gray-50 transition">
                                                <td className="px-4 py-2 border">{a.player?.name}</td>
                                                <td className="px-4 py-2 border">{a.player?.email}</td>
                                                <td className="px-4 py-2 border">{a.game?.title}</td>
                                                <td className="px-4 py-2 border">{a.score}</td>
                                                <td className="px-4 py-2 border text-gray-500">
                                                    {a.createdAt
                                                        ? new Date(a.createdAt).toLocaleString()
                                                        : "N/A"}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="5"
                                                className="px-4 py-4 text-center text-gray-500"
                                            >
                                                No attempts match your filters
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Pagination Controls */}
                            <div className="flex items-center justify-between mt-4">
                                <p className="text-sm text-gray-600">
                                    Page {currentPage} of {totalPages || 1}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                                    >
                                        Prev
                                    </button>
                                    <button
                                        onClick={() =>
                                            setCurrentPage((p) => Math.min(p + 1, totalPages))
                                        }
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </HostLayout>
    );
}
