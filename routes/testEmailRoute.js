const express = require("express");
const router = express.Router();
const sendEmail = require("../utils/sendEmail"); // غير المسار لو انت حاطط sendEmail بمكان مختلف

router.post("/test-email", async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide an email to send to.",
      });
    }

    await sendEmail({
      email: email,
      subject: "Test Email from SkinSafe App!",
      message: "Hello from your SkinSafe backend 🎉!",
    });

    res.status(200).json({
      status: "success",
      message: `Email successfully sent to ${email}`,
    });
  } catch (error) {
    console.error("Email Error:", error.message);
    res.status(500).json({
      status: "error",
      message: `There was a problem sending the email: ${error.message}`,
    });
  }
});

module.exports = router;
