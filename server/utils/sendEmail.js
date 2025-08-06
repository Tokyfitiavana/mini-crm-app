const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, text }) => {
  console.log("📤 Tentative d’envoi d’email...");
  console.log("🔐 Email utilisé :", process.env.EMAIL_USER);
  console.log("➡️ Destinataire :", to);
  console.log("✉️ Sujet :", subject);

  try {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // SSL
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      

    const mailOptions = {
      from: `"MiniCRM" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email envoyé :", info.response);
  } catch (error) {
    console.error("❌ Échec de l’envoi de l’email :");
    console.error(error);
    throw error;
  }
};

module.exports = sendEmail;
