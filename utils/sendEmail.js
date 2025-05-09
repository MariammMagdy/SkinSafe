/*
const nodemailer = require("nodemailer");
 
// Nodemailer
const sendEmail = async (options) => {
  // 1) Create transporter ( service that will send email like "gmail","Mailgun", "mialtrap", sendGrid)(object send email)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT, // if secure false port = 587, if true port= 465
    secure: true,
    auth: {
      user: process.env.EMAIL_USER, //send by him email
      pass: process.env.EMAIL_PASSWORD,
    },
  });
 
  // 2) Define email options (like from, to, subject, email content)
  const mailOpts = {
    from: "Sign Up <nabihmohaned@gmail.com>",
    to: options.Email,
    subject: options.subject,
    text: options.message,
  };
 
  // 3) Send email
  await transporter.sendMail(mailOpts);
};
 
module.exports = sendEmail;


*/

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
