import nodemailer from "nodemailer";

const auth = process.env.SMTP_USER && process.env.SMTP_PASS ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 1025),
  auth,
});

async function sendVerificationEmail(to: string, token: string) {
  if (!process.env.SMTP_HOST) return;

  const verificationUrl = `${process.env.APP_URL}/api/v1/users/verify-email?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Confirme seu cadastro - Rugby na TV",
    html: `<p>Clique no link abaixo para confirmar seu e-mail:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p>`,
  });
}

const mailer = { sendVerificationEmail };

export default mailer;
