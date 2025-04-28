const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  try {
    // 1. Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT == 465, // true for port 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false, // هذا الخيار يسمح بتجاوز التحقق من الشهادة
      },
    });

    // 2. Define email options
    const mailOptions = {
      from: `"SkinSafe" <${process.env.EMAIL_USER}>`, // Use your email from env
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    // 3. Send email
    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully!");
    console.log("📩 Message ID:", info.messageId);
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = sendEmail;
