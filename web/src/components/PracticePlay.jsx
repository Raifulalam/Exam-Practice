import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function PracticePlay() {
    const { id } = useParams();
    const [data, setData] = useState(null);  // ✅ corrected state
    const [answers, setAnswers] = useState([]);
    const [result, setResult] = useState(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchSet = async () => {
            const res = await fetch(`http://localhost:5000/api/practice-sets/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const fetched = await res.json();
            setData(fetched);
            setAnswers(new Array(fetched.questions.length).fill(null));
        };
        fetchSet();
    }, [id, token]);

    const submitAnswers = async () => {
        try {
            console.log("Submitting answers:", answers);

            // send to backend for saving
            const res = await fetch(`http://localhost:5000/api/practice-sets/${id}/submit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ answers }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Backend error response:", errorText);
                throw new Error("Failed to save result");
            }

            console.log("Answers saved successfully to backend ✅");

            // ✅ calculate result on frontend
            let correct = 0;
            data.questions.forEach((q, idx) => {
                console.log(
                    `Q${idx + 1}: User answered ${answers[idx]}, Correct is ${q.correctIndex}`
                );
                if (answers[idx] === q.correctIndex) {
                    correct++;
                }
            });

            const total = data.questions.length;
            const percentage = ((correct / total) * 100).toFixed(2);

            const calculatedResult = { correct, total, percentage };
            setResult(calculatedResult);

            console.log("Final Calculated Result ✅:", calculatedResult);
        } catch (err) {
            console.error("Error submitting result ❌:", err);
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
                    <p>Percentage: {result.percentage}%</p>
                </div>
            ) : (
                <div>
                    {data.questions.map((q, idx) => (
                        <div key={idx} className="mb-4 p-3 border rounded">
                            <p className="font-semibold">{idx + 1}. {q.question}</p>
                            {q.options.map((opt, oIdx) => (
                                <div key={oIdx}>
                                    <label>
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
                                        {opt}
                                    </label>
                                </div>
                            ))}
                        </div>
                    ))}

                    <button
                        onClick={submitAnswers}
                        className="px-4 py-2 bg-green-600 text-white rounded"
                    >
                        Submit
                    </button>
                </div>
            )}
        </div>
    );
}
