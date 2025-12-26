import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "PALETTE Publisher <onboarding@resend.dev>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email and message are required" },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      replyTo: email,
      subject: `New Contact Form Message from ${name}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f3f4f6;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h2 { 
      color: #14b8a6; 
      margin-top: 0;
      border-bottom: 3px solid #14b8a6;
      padding-bottom: 10px;
    }
    .field { 
      margin: 20px 0; 
      padding: 15px;
      background-color: #f9fafb;
      border-radius: 8px;
      border-left: 4px solid #14b8a6;
    }
    .label { 
      font-weight: 600; 
      color: #374151;
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .value { 
      color: #111827;
      word-wrap: break-word;
      font-size: 16px;
    }
    .message-box {
      background-color: #f3f4f6;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #14b8a6;
      margin: 20px 0;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 14px;
    }
    .reply-button {
      display: inline-block;
      background-color: #14b8a6;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin-top: 15px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>📧 New Contact Form Submission</h2>

    <div class="field">
      <span class="label">From:</span>
      <span class="value">${name}</span>
    </div>

    <div class="field">
      <span class="label">Email Address:</span>
      <span class="value">${email}</span>
    </div>

    <div class="message-box">
      <span class="label">Message:</span>
      <p class="value" style="margin: 10px 0 0 0; white-space: pre-wrap; line-height: 1.6;">
        ${message}
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0 0 10px 0;">
        <strong>Reply directly to this message:</strong>
      </p>
      <a href="mailto:${email}" class="reply-button">
        Reply to ${name}
      </a>
      <p style="margin-top: 20px; color: #9ca3af; font-size: 13px;">
        This message was sent via the PALETTE Publisher contact form.
      </p>
    </div>
  </div>
</body>
</html>
      `,
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return NextResponse.json({ message: "Message sent successfully" });
  } catch (err: any) {
    console.error("Contact email failed:", err);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
