import React, { useEffect, useState } from "react";
import HostLayout from "./HostLayout";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Trophy, Users, Gamepad2, Crown, Star, Search, ChevronDown, ChevronRight } from "lucide-react";
import CountUp from "react-countup";
import "../../cssfiles/HostDashboard.css";

export default function HostDashboard() {
    const [stats, setStats] = useState(null);
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedSubjects, setExpandedSubjects] = useState({});

    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, gamesRes] = await Promise.all([
                    fetch("https://exam-practice-1.onrender.com/api/games/host/stats", { headers: { Authorization: `Bearer ${token}` } }),
                    fetch("https://exam-practice-1.onrender.com/api/games/mine", { headers: { Authorization: `Bearer ${token}` } }),
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

    if (loading) return <p className="p-6 text-center">Loading dashboard...</p>;

    const topPlayers = stats?.leaderboard?.slice(0, 5) || [];
    const filteredGames = games.filter(
        g => g.title.toLowerCase().includes(searchQuery.toLowerCase()) || g.gameCode.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const gamesBySubject = filteredGames.reduce((acc, game) => {
        if (!acc[game.subject]) acc[game.subject] = [];
        acc[game.subject].push(game);
        return acc;
    }, {});

    const toggleSubject = subject => {
        setExpandedSubjects(prev => ({ ...prev, [subject]: !prev[subject] }));
    };

    return (
        <HostLayout>
            <div className="dashboard-container">
                {/* --- Stats --- */}
                <div className="stats-grid">
                    <StatCard icon={<Gamepad2 />} title="Games Created" value={stats?.gameCount || 0} color="blue" />
                    <StatCard icon={<Users />} title="Total Attempts" value={stats?.totalAttempts || 0} color="green" />
                    <StatCard icon={<Trophy />} title="Avg Attempts/Game" value={stats?.gameCount > 0 ? (stats.totalAttempts / stats.gameCount).toFixed(1) : 0} color="purple" />
                    <StatCard icon={<Trophy />} title="Top Scorer" value={stats?.topScorer?.name || "N/A"} subtitle={`Score: ${stats?.topScorer?.totalScore || 0}`} color="yellow" />
                </div>

                {/* --- Top Players --- */}
                <div className="top-players">
                    <h2><Crown className="text-yellow-500" /> Top Players</h2>
                    <div className="podium">
                        {topPlayers.slice(0, 3).map((player, index) => (
                            <div key={player.playerId} className="player-card" style={{ height: `${120 + (2 - index) * 20}px`, background: index === 0 ? "#fde68a" : index === 1 ? "#e5e7eb" : "#fdba74" }}>
                                <span className="emoji">{index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}</span>
                                <p>{player.name}</p>
                                <p>{player.totalScore} pts</p>
                            </div>
                        ))}
                    </div>

                    {topPlayers.length > 3 && (
                        <ul className="leaderboard-list">
                            {topPlayers.slice(3).map((player, index) => (
                                <li key={player.playerId}>
                                    <span>{index + 4}. {player.name}</span>
                                    <span><Star /> {player.totalScore}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* --- Chart --- */}
                <div className="chart-container">
                    <h3>Attempts Per Game</h3>
                    <ResponsiveContainer width="100%" height={250}>
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

                {/* --- Games Accordion --- */}
                <div className="games-container">
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                        <h2>🎮 My Created Games</h2>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", border: "1px solid #d1d5db", padding: "0.2rem 0.4rem", borderRadius: "0.4rem" }}>
                            <Search size={14} color="#6b7280" />
                            <input type="text" placeholder="Search games..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                    </div>

                    {Object.keys(gamesBySubject).length === 0 ? (
                        <p>No games found.</p>
                    ) : (
                        Object.entries(gamesBySubject).map(([subject, games]) => (
                            <div key={subject} className="accordion-subject">
                                <div className="accordion-header" onClick={() => toggleSubject(subject)}>
                                    <span>{subject} ({games.length})</span>
                                    {expandedSubjects[subject] ? <ChevronDown /> : <ChevronRight />}
                                </div>
                                <div className="accordion-content" style={{ maxHeight: expandedSubjects[subject] ? "2000px" : "0px" }}>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Title</th>
                                                <th>Code</th>
                                                <th>Questions</th>
                                                <th>Attempts</th>
                                                <th>Created At</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {games.map((game, idx) => {
                                                const gameStat = stats?.gameStats?.find(gs => gs.gameId === game._id);
                                                return (
                                                    <tr key={game._id}>
                                                        <td>{idx + 1}</td>
                                                        <td>{game.title}</td>
                                                        <td style={{ fontFamily: "monospace", color: "#3b82f6" }}>{game.gameCode}</td>
                                                        <td>{game.questions?.length || 0}</td>
                                                        <td>{gameStat?.totalAttempts || 0}</td>
                                                        <td>{new Date(game.createdAt).toLocaleString()}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </HostLayout>
    );
}

// --- Stats Card Component ---
function StatCard({ icon, title, value, subtitle, color }) {
    return (
        <div className={`stat-card ${color}`}>
            <div>
                <p>{title}</p>
                <h3>{typeof value === "number" ? <CountUp end={value} duration={1.2} /> : value}</h3>
                {subtitle && <p>{subtitle}</p>}
            </div>
            <div>{icon}</div>
        </div>
    );
}
