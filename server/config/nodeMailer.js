const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// ✅ Verify transporter connection
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Mail transporter error:", error);
    } else {
        console.log("✅ Mail transporter ready to send emails");
    }
});

module.exports = transporter;
