const nodemailer = require('nodemailer');

const sendEmail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Lub inny dostawca
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"PlayAgain Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      text: text,
      // Opcjonalnie html: `<h1>...</h1>`
    });

    console.log("📧 Email wysłany do:", email);
  } catch (error) {
    console.log("❌ Błąd wysyłania emaila:", error);
  }
};

module.exports = sendEmail;