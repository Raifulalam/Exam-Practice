
// utils/emailService.js
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (user, token) => {
    const verificationUrl = `https://exam-practice-1.onrender.com/api/auth/verify-email?token=${token}`;

    await resend.emails.send({
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
};
