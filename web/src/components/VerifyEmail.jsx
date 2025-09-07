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
            });
    }
}, []);
