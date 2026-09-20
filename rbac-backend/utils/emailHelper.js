import nodemailer from "nodemailer";


console.log("SMTP_USER:", process.env.SMTP_USER);
console.log("SMTP_PASS:", process.env.SMTP_PASS);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "swadeshitmaurya@gmail.com",
    pass: "andqlmbrvrujahdt",
  },
});

export const sendResetPasswordEmail = async (toEmail, resetLink) => {
  await transporter.sendMail({
    from: `"RBAC System" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: "Reset Your Password",
    html: `
      <p>You requested a password reset.</p>
      <p>Click the link below to set a new password. This link expires in 30 minutes.</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  });
};

export const sendOtpEmail = async (toEmail, otp) => {
  await transporter.sendMail({
    from: `"RBAC System" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: "Your Password Reset OTP",
    html: `
      <p>Your OTP for password reset is:</p>
      <h2 style="letter-spacing: 4px;">${otp}</h2>
      <p>This OTP expires in 10 minutes. If you didn't request this, please ignore this email.</p>
    `,
  });
};