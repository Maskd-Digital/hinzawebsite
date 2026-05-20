import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const DEFAULT_TO = "afshad0fficial@gmail.com";
const MAX_LEN = { name: 200, email: 320, message: 8000 };

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { name: rawName, email: rawEmail, message: rawMessage } = body as Record<
    string,
    unknown
  >;

  const name = typeof rawName === "string" ? rawName.trim() : "";
  const email = typeof rawEmail === "string" ? rawEmail.trim() : "";
  const message = typeof rawMessage === "string" ? rawMessage.trim() : "";

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Please fill in all fields." }, { status: 400 });
  }

  if (
    name.length > MAX_LEN.name ||
    email.length > MAX_LEN.email ||
    message.length > MAX_LEN.message
  ) {
    return NextResponse.json({ error: "One or more fields are too long." }, { status: 400 });
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const to = process.env.CONTACT_EMAIL_TO?.trim() || DEFAULT_TO;

  if (!smtpUser || !smtpPass) {
    console.error("Contact form: SMTP_USER or SMTP_PASS is not set in .env.local");
    return NextResponse.json(
      { error: "Email is not configured. Please try again later." },
      { status: 503 },
    );
  }

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = port === 465;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user: smtpUser, pass: smtpPass },
  });

  const text = `New message from the Hinza website contact form\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n`;

  const html = `
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replace(/\r\n/g, "\n").split("\n").join("<br/>")}</p>
  `;

  try {
    await transporter.sendMail({
      from: `"Hinza website" <${smtpUser}>`,
      to,
      replyTo: email,
      subject: `Hinza contact: ${name}`,
      text,
      html,
    });
  } catch (err) {
    console.error("Contact form send error:", err);
    return NextResponse.json(
      { error: "Could not send your message. Please try again later." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
