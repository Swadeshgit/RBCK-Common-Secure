import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.sendMail(
  {
    from: `"Test" <${process.env.SMTP_USER}>`,
    to: process.env.SMTP_USER, // khud ko hi bhejo test ke liye
    subject: "Test Email",
    text: "Agar ye mail mila to SMTP sahi kaam kar raha hai.",
  },
  (err, info) => {
    if (err) {
      console.log("❌ ERROR:", err);
    } else {
      console.log("✅ SUCCESS:", info.response);
    }
  },
);

