const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail", // or use SMTP if you prefer
    auth: {
        user: process.env.EMAIL_USER, // your email
        pass: process.env.EMAIL_PASS  // app password (not your Gmail password)
    }
});

module.exports = transporter;
