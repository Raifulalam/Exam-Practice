import React, { useEffect, useState } from "react";

const PracticeDemo = () => {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [finished, setFinished] = useState(false);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchDemo = async () => {
            try {
                const res = await fetch("https://exam-practice-1.onrender.com/api/practice/demo", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await res.json();
                setQuestions(data);
            } catch (err) {
                console.error("Failed to fetch demo questions", err);
            }
        };

        fetchDemo();
    }, [token]);

    const handleOptionSelect = (qId, option) => {
        setAnswers((prev) => ({ ...prev, [qId]: option }));
    };

    const handleFinish = () => {
        setFinished(true);
    };

    const calculateAccuracy = () => {
        let correct = 0;
        questions.forEach((q) => {
            if (answers[q.id] === q.correctAnswer) correct++;
        });
        return ((correct / questions.length) * 100).toFixed(2);
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6 text-center">
                Demo Practice Questions
            </h2>

            {!finished ? (
                <div className="space-y-6">
                    {questions.map((q) => (
                        <div
                            key={q.id}
                            className="bg-white shadow-md rounded-lg p-4 border border-gray-200"
                        >
                            <p className="font-semibold mb-3">
                                Q{q.id}: {q.question}
                            </p>
                            <div className="space-y-2">
                                {q.options.map((opt, idx) => (
                                    <label
                                        key={idx}
                                        className={`block px-4 py-2 rounded-md border cursor-pointer transition ${answers[q.id] === opt
                                            ? "bg-blue-500 text-white border-blue-600"
                                            : "bg-gray-100 hover:bg-gray-200 border-gray-300"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name={`question-${q.id}`}
                                            value={opt}
                                            checked={answers[q.id] === opt}
                                            onChange={() => handleOptionSelect(q.id, opt)}
                                            className="hidden"
                                        />
                                        {opt}
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={handleFinish}
                        className="w-full bg-green-600 text-white py-3 rounded-lg shadow-lg hover:bg-green-700 transition"
                    >
                        Finish
                    </button>
                </div>
            ) : (
                <div className="bg-white shadow-lg rounded-xl p-6 text-center border">
                    <h3 className="text-xl font-semibold mb-4">Results</h3>
                    <p className="text-lg">
                        ✅ Your accuracy:{" "}
                        <span className="font-bold text-green-600">
                            {calculateAccuracy()}%
                        </span>
                    </p>
                </div>
            )}
        </div>
    );
};

export default PracticeDemo;
