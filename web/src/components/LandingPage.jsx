import React from "react";
import { useNavigate } from "react-router-dom";
import "../cssfiles/LandingPage.css";


import examIllustration from "../assets/exam.svg";
import aiIllustration from "../assets/ai-learning.svg";
import testIllustration from "../assets/online-test.svg";
import analyticsIllustration from "../assets/analytics.svg";

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="landing-container">


            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1 className="landing-title">📘 ExamPrepHub</h1>
                    <p className="tagline">Prepare. Practice. Perform.</p>
                    <p className="landing-subtitle">
                        Your ultimate <strong>AI-powered exam preparation platform</strong>.
                        Learn smarter, practice better, and track your progress – all in one
                        place.
                    </p>
                    <div className="button-group">
                        <button
                            className="btn-primary"
                            onClick={() => navigate("/signup")}
                        >
                            Get Started Free
                        </button>
                        <button
                            className="btn-secondary"
                            onClick={() => navigate("/login")}
                        >
                            Login
                        </button>
                    </div>
                </div>

                {/* Hero Illustration */}
                <div className="hero-image">
                    <img src={examIllustration} alt="Exam preparation" />
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <div className="feature-card">
                    <img
                        src={aiIllustration}
                        alt="AI Smart Practice"
                        className="feature-icon"
                    />
                    <h2>⚡ Smart Practice</h2>
                    <p>
                        AI-generated questions, adaptive quizzes, and instant feedback to
                        boost your preparation.
                    </p>
                </div>

                <div className="feature-card">
                    <img
                        src={examIllustration}
                        alt="Exam Hub"
                        className="feature-icon"
                    />
                    <h2>📚 Exam Hub</h2>
                    <p>
                        Practice mock tests, timed exams, and subject-wise challenges to
                        sharpen your skills.
                    </p>
                </div>

                <div className="feature-card">
                    <img
                        src={analyticsIllustration}
                        alt="Performance Insights"
                        className="feature-icon"
                    />
                    <h2>📊 Performance Insights</h2>
                    <p>
                        Detailed analytics, leaderboards, and progress tracking to help you
                        stay ahead.
                    </p>
                </div>

                <div className="feature-card">
                    <img
                        src={testIllustration}
                        alt="Personalized Learning"
                        className="feature-icon"
                    />
                    <h2>🎯 Personalized Learning</h2>
                    <p>
                        AI-tailored paths focusing on your weak areas for faster
                        improvement.
                    </p>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats">
                <div className="stat">
                    <h3>10k+</h3>
                    <p>Practice Questions</p>
                </div>
                <div className="stat">
                    <h3>500+</h3>
                    <p>Mock Tests</p>
                </div>
                <div className="stat">
                    <h3>20+</h3>
                    <p>Countries Reached</p>
                </div>
            </section>

            {/* About Section */}
            <section className="about">
                <h2>About ExamPrepHub</h2>
                <p>
                    ExamPrepHub is designed to make learning{" "}
                    <strong>efficient, personalized, and fun</strong>. Whether you're
                    preparing for school exams, competitive tests, or professional
                    certifications, our platform ensures you practice smarter with{" "}
                    <strong>AI-driven insights</strong>.
                </p>
            </section>

            {/* Call to Action */}
            <section className="cta">
                <div className="cta-content">
                    <h2>🚀 Ready to ace your next exam?</h2>
                    <p>Join thousands of learners who trust ExamPrepHub for success.</p>
                    <button
                        className="btn-primary"
                        onClick={() => navigate("/signup")}
                    >
                        Join ExamPrepHub Today
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-links">
                    <div>
                        <h3>ExamPrepHub</h3>
                        <p>
                            Empowering students and professionals with AI-driven preparation
                            tools.
                        </p>
                    </div>
                    <div>
                        <h4>Quick Links</h4>
                        <ul>
                            <li onClick={() => navigate("/")}>Home</li>
                            <li onClick={() => navigate("/about")}>About</li>
                            <li onClick={() => navigate("/contact")}>Contact</li>
                        </ul>
                    </div>
                    <div>
                        <h4>Legal</h4>
                        <ul>
                            <li>Terms & Conditions</li>
                            <li>Privacy Policy</li>
                        </ul>
                    </div>
                    <div>
                        <h4>Follow Us</h4>
                        <ul>
                            <li>LinkedIn</li>
                            <li>Twitter</li>
                            <li>Facebook</li>
                        </ul>
                    </div>
                </div>
                <p className="footer-bottom">
                    © {new Date().getFullYear()} ExamPrepHub. All rights reserved.
                </p>
            </footer>
        </div>
    );
}
