const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // ✅ استخدم علامات اقتباس هنا
    port: 465,
    secure: true, // Use true for port 465
    auth: {
      user: "ayadakhil372@gmail.com",
      pass: "zqcd sfji dqnl eyol", // تأكد إن الباسورد دا هو App Password من جوجل
    },
  });

  const mailOpts = {
    from: "SkinSafe <ayadakhil372@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOpts);
};

module.exports = sendEmail;
