const transporter = require("../config/nodeMailer");

exports.sendVerificationEmail = async (user, token) => {
    try {
        console.log("📧 Preparing to send verification email to:", user.email);

        const baseUrl = process.env.BASE_URL || "http://localhost:5000";
        const url = `${baseUrl}/api/auth/verify-email?token=${token}`;

        console.log("🔗 Verification URL:", url);

        const info = await transporter.sendMail({
            from: `"ExamPrepHub" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Verify your email",
            html: `
                <h2>Hello ${user.name},</h2>
                <p>Thank you for registering. Please verify your email:</p>
                <a href="${url}" style="padding:10px 15px;background:#007bff;color:#fff;text-decoration:none;border-radius:5px;">Verify Email</a>
                <p>Or copy & paste this URL into your browser:</p>
                <p>${url}</p>
                <p><b>Note:</b> This link expires in 1 hour.</p>
            `,
        });

        console.log("✅ Email sent successfully:", info.response);
        return true;
    } catch (err) {
        console.error("❌ Error sending email:", err);
        throw new Error("Email could not be sent");
    }
};
