import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function AttemptGame() {
    const { gameCode } = useParams();
    const navigate = useNavigate();
    const [game, setGame] = useState(null);
    const [responses, setResponses] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Fetch game with JWT auth
    useEffect(() => {
        const fetchGame = async () => {
            setLoading(true);
            setError("");
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setError("No token found. Please login.");
                    setLoading(false);
                    return;
                }

                const res = await fetch(`http://localhost:5000/api/games/join/${gameCode}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                    const errData = await res.json();
                    setError(errData.msg || errData.error || "Failed to fetch game");
                    setGame(null);
                    setLoading(false);
                    return;
                }

                const data = await res.json();
                setGame(data);
            } catch (err) {
                console.error("Error fetching game:", err);
                setError("Server error while fetching game");
            } finally {
                setLoading(false);
            }
        };

        fetchGame();
    }, [gameCode]);
    console.log(localStorage.getItem('token'))
    const handleChange = (questionId, value) => {
        setResponses({ ...responses, [questionId]: value });
    };

    const handleSubmit = async () => {
        if (!game) return;

        const answers = Object.entries(responses).map(([questionId, answer]) => ({
            questionId,
            answer,
        }));

        const totalQuestions =
            (game.questions?.length || 0) +
            (game.truths?.length || 0) +
            (game.dares?.length || 0);

        if (answers.length !== totalQuestions) {
            return alert("Please answer all questions before submitting!");
        }

        try {
            setSubmitting(true);
            const token = localStorage.getItem('token');
            if (!token) return alert("No token found, please login.");

            const res = await fetch(
                `http://localhost:5000/api/games/attempt/code/${game.gameCode}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ responses: answers }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                console.error("Backend error:", data);
                return alert(data.msg || data.error || "Failed to submit attempt");
            }

            alert(`✅ Attempt submitted! Your score: ${data.attempt.score}`);
            navigate("/games");
        } catch (err) {
            console.error(err);
            alert("❌ Error submitting attempt: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <p className="text-center mt-6">Loading game...</p>;
    if (error) return <p className="text-center mt-6 text-red-500">{error}</p>;
    if (!game) return <p className="text-center mt-6 text-red-500">Game not found!</p>;

    // Prepare questions for display
    let allQuestions = [];
    if (game.gameType === "quiz" || game.gameType === "exam") allQuestions = game.questions;
    else if (game.gameType === "truth-dare") {
        allQuestions = [
            ...(game.truths?.map((q) => ({ ...q, type: "truth" })) || []),
            ...(game.dares?.map((q) => ({ ...q, type: "dare" })) || []),
        ];
    }

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">{game.title}</h2>
            <p className="mb-6">
                Game Code: <span className="font-mono">{game.gameCode}</span>
            </p>

            <div className="space-y-6">
                {allQuestions.map((q, idx) => (
                    <div key={q._id} className="bg-gray-50 p-4 rounded shadow">
                        <p className="font-medium mb-2">
                            {idx + 1}. {q.question || q.prompt}{" "}
                            {q.type === "truth" && "(Truth)"}
                            {q.type === "dare" && "(Dare)"}
                        </p>

                        {/* Quiz options */}
                        {game.gameType === "quiz" && q.options?.length > 0 && (
                            <div className="space-y-2">
                                {q.options.map((opt, i) => (
                                    <label key={i} className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name={q._id}
                                            value={opt}
                                            checked={responses[q._id] === opt}
                                            onChange={() => handleChange(q._id, opt)}
                                            className="accent-indigo-600"
                                        />
                                        {opt}
                                    </label>
                                ))}
                            </div>
                        )}

                        {/* Exam or Truth/Dare input */}
                        {(game.gameType === "exam" || game.gameType === "truth-dare") && (
                            <input
                                type="text"
                                placeholder="Your answer..."
                                value={responses[q._id] || ""}
                                onChange={(e) => handleChange(q._id, e.target.value)}
                                className="w-full border border-gray-300 rounded p-2 mt-2"
                            />
                        )}
                    </div>
                ))}
            </div>

            <button
                onClick={handleSubmit}
                disabled={submitting}
                className="mt-6 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
                {submitting ? "Submitting..." : "Submit Attempt"}
            </button>
        </div>
    );
}
