require("dotenv").config();
const transporter = require("./config/nodeMailer");

async function testMail() {
    try {
        console.log("📧 Sending test email...");
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: "SMTP Test",
            text: "✅ Your nodemailer setup works!",
        });
        console.log("✅ Test email sent successfully!");
    } catch (err) {
        console.error("❌ SMTP test error:", err);
    }
}
testMail();
