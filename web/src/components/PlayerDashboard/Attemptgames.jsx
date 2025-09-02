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
    const [feedback, setFeedback] = useState(null);

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

                const res = await fetch(`https://exam-practice-1.onrender.com/api/games/join/${gameCode}`, {
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

    const handleChange = (questionId, value) => {
        setResponses({ ...responses, [questionId]: value });
    };

    const handleSubmit = async () => {
        if (!game) return;

        const answers = Object.entries(responses).map(([questionId, answer]) => ({
            questionId,
            answer,
        }));

        const totalQuestions = game.questions.length;
        if (answers.length !== totalQuestions) {
            return alert("Please answer all questions before submitting!");
        }

        try {
            setSubmitting(true);
            const res = await fetch(`https://exam-practice-1.onrender.com/api/games/attempt/code/${game.gameCode}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ responses: answers }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to submit attempt");

            setFeedback(data.attempt.responses); // show feedback
        } catch (err) {
            console.error(err);
            alert("❌ " + err.message);
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
        <div className="p-4 sm:p-6 max-w-5xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 text-center sm:text-left">
                {game.title}
            </h2>
            <p className="mb-6 text-center sm:text-left text-sm sm:text-base">
                Game Code: <span className="font-mono">{game.gameCode}</span>
            </p>

            {/* Questions */}
            {!feedback && (
                <div className="space-y-6">
                    {allQuestions.map((q, idx) => (
                        <div
                            key={q._id}
                            className="bg-gray-50 p-3 sm:p-4 rounded-lg shadow flex flex-col"
                        >
                            <p className="font-medium mb-2 text-sm sm:text-base">
                                {idx + 1}. {q.question || q.prompt}{" "}
                                {q.type === "truth" && "(Truth)"}
                                {q.type === "dare" && "(Dare)"}
                            </p>

                            {game.gameType === "quiz" && q.options?.length > 0 && (
                                <div className="grid gap-2 sm:gap-3">
                                    {q.options.map((opt, i) => (
                                        <label
                                            key={i}
                                            className="flex items-center gap-2 text-sm sm:text-base"
                                        >
                                            <input
                                                type="radio"
                                                name={q._id}
                                                value={opt}
                                                checked={responses[q._id] === opt}
                                                onChange={() => handleChange(q._id, opt)}
                                                className="accent-indigo-600 w-4 h-4"
                                            />
                                            {opt}
                                        </label>
                                    ))}
                                </div>
                            )}

                            {(game.gameType === "exam" || game.gameType === "truth-dare") && (
                                <input
                                    type="text"
                                    placeholder="Your answer..."
                                    value={responses[q._id] || ""}
                                    onChange={(e) => handleChange(q._id, e.target.value)}
                                    className="w-full border border-gray-300 rounded p-2 mt-2 text-sm sm:text-base"
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Feedback after submission */}
            {feedback && (
                <div className="space-y-4">
                    {allQuestions.map((q, idx) => {
                        const fb = feedback.find(f => String(f.questionId) === String(q._id));
                        return (
                            <div
                                key={q._id}
                                className="p-3 sm:p-4 border rounded-lg bg-gray-50"
                            >
                                <p className="text-sm sm:text-base">
                                    {idx + 1}. {q.question || q.prompt} <br />
                                    Your answer: <strong>{fb?.answer}</strong> <br />
                                    {game.gameType === "quiz" && (
                                        <span>
                                            Correct answer: <strong>{q.answer}</strong> -{" "}
                                            {fb?.correct ? (
                                                <span className="text-green-600">Correct ✅</span>
                                            ) : (
                                                <span className="text-red-600">Wrong ❌</span>
                                            )}
                                        </span>
                                    )}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Submit button */}
            {!feedback && (
                <div className="flex justify-center sm:justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="mt-6 bg-green-500 text-white px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base hover:bg-green-600 disabled:opacity-50"
                    >
                        {submitting ? "Submitting..." : "Submit Attempt"}
                    </button>
                </div>
            )}
        </div>
    );
}
