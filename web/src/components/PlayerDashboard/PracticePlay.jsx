import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function PracticePlay() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [result, setResult] = useState(null);
    const token = localStorage.getItem("token");

    // Fetch practice set on mount
    useEffect(() => {
        const fetchSet = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/practice-sets/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const fetched = await res.json();
                setData(fetched);
                setAnswers(new Array(fetched.questions.length).fill(null));
            } catch (err) {
                console.error("Error fetching practice set:", err);
            }
        };
        fetchSet();
    }, [id, token]);

    // Submit answers and save score
    const submitAnswers = async () => {
        try {
            // Count correct answers
            let correct = 0;
            data.questions.forEach((q, idx) => {
                if (answers[idx] === q.correctIndex) correct++;
            });

            const totalQuestions = data.questions.length;
            const totalAttempt = answers.filter(a => a !== null && a !== undefined).length;
            const percentage = ((correct / totalQuestions) * 100).toFixed(2);

            // Update local result
            setResult({ correct, total: totalQuestions, totalAttempt, percentage });

            // Save to backend
            const res = await fetch("http://localhost:5000/api/cee/score", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    score: correct,
                    totalAttempt,
                    totalQuestion: totalQuestions,
                    mode: "practice",
                }),
            });

            const dataRes = await res.json();
            if (!res.ok) console.error("Failed to save score:", dataRes);
            else console.log("Score saved successfully:", dataRes);

        } catch (err) {
            console.error("Error submitting result:", err);
            alert("Error submitting result");
        }
    };

    if (!data) return <p>Loading...</p>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">{data.title}</h1>

            {result ? (
                <div className="bg-green-100 p-4 rounded">
                    <h2 className="text-xl font-bold">Your Result</h2>
                    <p>Correct: {result.correct} / {result.total}</p>
                    <p>Attempted Questions: {result.totalAttempt} / {result.total}</p>
                    <p>Percentage: {result.percentage}%</p>
                </div>
            ) : (
                <div>
                    {data.questions.map((q, idx) => (
                        <div key={idx} className="mb-4 p-3 border rounded">
                            <p className="font-semibold">{idx + 1}. {q.question}</p>
                            {q.options.map((opt, oIdx) => (
                                <div key={oIdx} className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name={`q${idx}`}
                                        checked={answers[idx] === oIdx}
                                        onChange={() => {
                                            const newAns = [...answers];
                                            newAns[idx] = oIdx;
                                            setAnswers(newAns);
                                        }}
                                    />
                                    <label>{opt}</label>
                                </div>
                            ))}
                        </div>
                    ))}

                    <button
                        onClick={submitAnswers}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Submit
                    </button>
                </div>
            )}
        </div>
    );
}
