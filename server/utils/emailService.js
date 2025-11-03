// utils/emailService.js
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (user, token) => {
    // ✅ Always define the verification URL
    const verificationUrl = `https://exam-practice-1.onrender.com/api/auth/verify-email?token=${token}`;

    try {
        console.log(`📧 Preparing to send verification email to: ${user.email}`);
        console.log(`🔗 Verification URL: ${verificationUrl}`);

        await resend.emails.send({
            from: "Exam App <onboarding@resend.dev>",
            to: user.email,
            subject: "Verify your email address",
            html: `
        <div style="font-family:Arial, sans-serif; line-height:1.6;">
          <h2>Hello ${user.name},</h2>
          <p>Thank you for registering on <strong>Exam Practice App</strong>.</p>
          <p>Please verify your email by clicking the button below:</p>
          <a href="${verificationUrl}" 
             style="background-color:#22c55e;color:white;padding:10px 20px;
             text-decoration:none;border-radius:8px;display:inline-block;">
             ✅ Verify Email
          </a>
          <p>If the button doesn’t work, copy and paste this URL into your browser:</p>
          <p>${verificationUrl}</p>
        </div>
      `,
        });

        console.log("✅ Verification email sent successfully!");
    } catch (error) {
        console.error("❌ Error sending email:", error);
        throw new Error("Email could not be sent");
    }
};
