import React from "react";
import { useNavigate } from "react-router-dom";
import "../cssfiles/LandingPage.css"; // import custom css

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="landing-container">
            <h1 className="landing-title">🎮 AI Game Platform</h1>
            <p className="landing-subtitle">
                Experience the future of AI-based gaming. Create, host, and play quizzes, surveys, exams, and fun games
                with real-time AI insights!
            </p>

            {/* Features */}
            <div className="features">
                <div className="feature-card">
                    <h2>⚡ AI Powered</h2>
                    <p>Smart question generation, instant evaluation, and adaptive difficulty.</p>
                </div>
                <div className="feature-card">
                    <h2>👥 Host & Players</h2>
                    <p>Hosts can create games; players join in real-time from anywhere.</p>
                </div>
                <div className="feature-card">
                    <h2>📊 Insights</h2>
                    <p>Get performance analytics, leaderboards, and progress tracking.</p>
                </div>
            </div>

            {/* Buttons */}
            <div className="button-group">
                <button className="btn-primary" onClick={() => navigate("/signup")}>Get Started</button>
                <button className="btn-secondary" onClick={() => navigate("/login")}>Login</button>
            </div>

            {/* About Section */}
            <div className="about">
                <h2>About Us</h2>
                <p>
                    We are an innovative tech company revolutionizing the way people learn and play.
                    Our mission is to bring <strong>AI-driven interactivity</strong> to classrooms,
                    businesses, and communities worldwide.
                </p>
            </div>
        </div>
    );
}
