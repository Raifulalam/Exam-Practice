import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Monitor, Eye, EyeOff } from "lucide-react";

export default function Login() {
    const navigate = useNavigate();
    const [role, setRole] = useState("player");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, role }),
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("role", data.role);

                // Small delay for UX
                setTimeout(() => {
                    if (data.role === "host") navigate("/dashboard/host");
                    else navigate("/dashboard/player");
                }, 800);
            } else {
                setError(data.msg || "Invalid credentials");
            }
        } catch (err) {
            console.error(err);
            setError("Something went wrong. Try again!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            <form
                onSubmit={handleLogin}
                className="bg-white p-8 rounded-2xl shadow-2xl w-96"
            >
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    Welcome back
                </h2>

                {error && (
                    <p className="mb-4 text-sm text-red-500 font-medium text-center">
                        {error}
                    </p>
                )}

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full mb-4 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
                />

                <div className="relative mb-6">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>

                {/* Role Selector */}
                <div className="flex justify-between gap-4 mb-6">
                    <div
                        onClick={() => setRole("host")}
                        className={`flex-1 cursor-pointer p-4 rounded-xl border-2 flex flex-col items-center transition-all duration-300 ${role === "host"
                                ? "border-indigo-500 bg-indigo-50"
                                : "border-gray-300 hover:border-indigo-300"
                            }`}
                    >
                        <Monitor
                            size={32}
                            className={`mb-2 ${role === "host" ? "text-indigo-600" : "text-gray-500"
                                }`}
                        />
                        <span
                            className={`font-semibold ${role === "host" ? "text-indigo-600" : "text-gray-700"
                                }`}
                        >
                            Host
                        </span>
                    </div>

                    <div
                        onClick={() => setRole("player")}
                        className={`flex-1 cursor-pointer p-4 rounded-xl border-2 flex flex-col items-center transition-all duration-300 ${role === "player"
                                ? "border-indigo-500 bg-indigo-50"
                                : "border-gray-300 hover:border-indigo-300"
                            }`}
                    >
                        <User
                            size={32}
                            className={`mb-2 ${role === "player" ? "text-indigo-600" : "text-gray-500"
                                }`}
                        />
                        <span
                            className={`font-semibold ${role === "player" ? "text-indigo-600" : "text-gray-700"
                                }`}
                        >
                            Player
                        </span>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
}
