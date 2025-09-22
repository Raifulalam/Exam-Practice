import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function VerifyEmail() {
    const navigate = useNavigate();

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        const token = query.get("token");

        if (token) {
            fetch(`https://exam-practice-1.onrender.com/api/auth/verify-email?token=${token}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        alert("Email verified successfully! You can now login.");
                        navigate("/login");
                    } else {
                        alert("Invalid or expired link.");
                    }
                })
                .catch(err => {
                    console.error("Verification error:", err);
                    alert("Something went wrong. Please try again later.");
                });
        }
    }, [navigate]); // include navigate in dependency array

    return <div>Verifying email...</div>;
}

export default VerifyEmail;
