import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendOtpEmail = async (to, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_SENDER,
    to,
    subject: "Kode OTP Pendaftaran Akun",
    html: `
        <h3>Verifikasi Akun Anda</h3>
        <p>Gunakan kode berikut untuk menyelesaikan proses pendaftaran:</p>
        <h2>${otp}</h2>
        <p>Kode ini hanya berlaku selama 5 menit.</p>
        <p>Jika Anda tidak merasa melakukan pendaftaran, abaikan email ini.</p>
        <p>Terima kasih!</p>
        <p>Tim Tahu Suzuka</p>
    `
  };

  await transporter.sendMail(mailOptions);
};
