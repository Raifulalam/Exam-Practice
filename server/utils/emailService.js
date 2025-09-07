const nodemailer = require("nodemailer");

exports.sendVerificationEmail = async (user, token) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS, // Gmail App Password
            },
        });

        const url = `http://localhost:5000/api/auth/verify-email?token=${token}`;

        await transporter.sendMail({
            from: `"My App" <${process.env.EMAIL_USER}>`,
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

        console.log("✅ Verification email sent to", user.email);
    } catch (err) {
        console.error("❌ Error sending email:", err);
        throw new Error("Email could not be sent");
    }
};
