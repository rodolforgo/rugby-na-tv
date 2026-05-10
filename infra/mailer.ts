import nodemailer from "nodemailer";
import type { MailerStatus } from "@/domain/mailer/mailer.types";

const auth = process.env.SMTP_USER && process.env.SMTP_PASS ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 1025),
  auth,
});

const BASE_URL = process.env.APP_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

async function sendVerificationEmail(to: string, token: string) {
  if (!process.env.SMTP_HOST) return;

  const verificationUrl = `${BASE_URL}/api/v1/users/verify-email?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Confirme seu cadastro - Rugby na TV",
    html: `<p>Clique no link abaixo para confirmar seu e-mail:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p>`,
  });
}

async function checkConnection(): Promise<MailerStatus> {
  if (!process.env.SMTP_HOST) return { status: "não configurado" };

  try {
    await transporter.verify();
    return { status: "ok" };
  } catch (error) {
    return { status: "indisponível", erro: (error as Error).message };
  }
}

const mailer = { sendVerificationEmail, checkConnection };

export default mailer;
