import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Monitor, Loader2 } from "lucide-react";

export default function Register() {
    const navigate = useNavigate();
    const [role, setRole] = useState("player");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("https://exam-practice-1.onrender.com/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, role }),
            });

            const data = await res.json();
            console.log("Backend response:", data, res.status);

            if (!res.ok) {
                setError(data.msg || data.error || `Error ${res.status}`);
                return;
            }

            alert("Registration successful! Please login.");
            navigate("/login");
        } catch (err) {
            console.error("Frontend error:", err);
            setError("Something went wrong. Please check console for details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-green-400 via-blue-500 to-purple-600">
            <form
                onSubmit={handleRegister}
                className="bg-white p-8 rounded-2xl shadow-2xl w-96"
            >
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    Create your account
                </h2>

                {error && (
                    <div className="mb-4 p-3 text-red-600 bg-red-100 border border-red-300 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full mb-4 p-3 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
                />

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full mb-4 p-3 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full mb-6 p-3 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
                />

                <label className="block mb-3 font-medium text-gray-700 text-center">
                    Register as:
                </label>

                <div className="flex justify-between gap-4 mb-6">
                    <div
                        onClick={() => setRole("host")}
                        className={`flex-1 cursor-pointer p-4 rounded-xl border-2 flex flex-col items-center transition-all duration-300 ${role === "host"
                            ? "border-green-500 bg-green-50"
                            : "border-gray-300 hover:border-green-300"
                            }`}
                    >
                        <Monitor
                            size={32}
                            className={`mb-2 ${role === "host" ? "text-green-600" : "text-gray-500"
                                }`}
                        />
                        <span
                            className={`font-semibold ${role === "host" ? "text-green-600" : "text-gray-700"
                                }`}
                        >
                            Host
                        </span>
                    </div>

                    <div
                        onClick={() => setRole("player")}
                        className={`flex-1 cursor-pointer p-4 rounded-xl border-2 flex flex-col items-center transition-all duration-300 ${role === "player"
                            ? "border-green-500 bg-green-50"
                            : "border-gray-300 hover:border-green-300"
                            }`}
                    >
                        <User
                            size={32}
                            className={`mb-2 ${role === "player" ? "text-green-600" : "text-gray-500"
                                }`}
                        />
                        <span
                            className={`font-semibold ${role === "player" ? "text-green-600" : "text-gray-700"
                                }`}
                        >
                            Player
                        </span>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 text-white p-3 rounded-lg font-semibold hover:bg-green-700 transition flex justify-center items-center"
                >
                    {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
                    {loading ? "Registering..." : "Register"}
                </button>

                <p className="mt-4 text-center text-gray-600 text-sm">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="text-green-600 hover:underline font-medium"
                    >
                        Login
                    </Link>
                </p>
            </form>
        </div>
    );
}
