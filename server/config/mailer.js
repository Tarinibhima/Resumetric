/**
 * Mailer — Nodemailer transport
 * Reads SMTP credentials from .env
 *
 * Required .env keys:
 *   SMTP_HOST      e.g. smtp.gmail.com
 *   SMTP_PORT      e.g. 587
 *   SMTP_USER      your Gmail address
 *   SMTP_PASS      Gmail App Password (NOT your login password)
 *   MAIL_FROM      e.g. "Resumetric <no-reply@resumetric.io>"
 *
 * Gmail quick-start:
 *   1. Enable 2FA on your Google account
 *   2. Go to https://myaccount.google.com/apppasswords
 *   3. Generate an app password for "Mail"
 *   4. Use that as SMTP_PASS
 */
console.log("EMAIL USER:", process.env.SMTP_USER);
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: 465,          // ✅ CHANGE
  secure: true,       // ✅ CHANGE
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send an OTP verification email.
 * @param {string} to   - recipient email
 * @param {string} name - recipient first name
 * @param {string} otp  - 6-digit code
 */
async function sendOTPEmail(to, name, otp) {
  const from = process.env.MAIL_FROM || `"Resumetric" <${process.env.SMTP_USER}>`;

  await transporter.sendMail({
    from,
    to,
    subject: `${otp} is your Resumetric verification code`,
    text: `Hi ${name},\n\nYour verification code is: ${otp}\n\nIt expires in 10 minutes. Do not share this code with anyone.\n\n— Resumetric`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family:'Helvetica Neue',sans-serif;background:#FAFAF8;margin:0;padding:40px 0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #E8E6E1;border-radius:4px;overflow:hidden;">
        <tr>
          <td style="padding:36px 40px 24px;border-bottom:1px solid #E8E6E1;">
            <p style="font-family:Georgia,serif;font-size:20px;letter-spacing:-0.04em;color:#0A0A0A;margin:0;">Resumetric</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            <p style="font-size:14px;color:#6B6B6B;margin:0 0 8px;">Hi ${name},</p>
            <p style="font-size:14px;color:#6B6B6B;margin:0 0 32px;line-height:1.6;">
              Use the code below to verify your email address. It expires in <strong>10 minutes</strong>.
            </p>
            <!-- OTP box -->
            <div style="background:#F5F4F0;border-radius:4px;padding:28px;text-align:center;margin-bottom:32px;">
              <p style="font-family:'Courier New',monospace;font-size:36px;letter-spacing:0.18em;color:#0A0A0A;margin:0;font-weight:600;">${otp}</p>
            </div>
            <p style="font-size:12px;color:#9B9B9B;margin:0;line-height:1.6;">
              If you did not request this, you can safely ignore this email.<br>
              Never share this code with anyone.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #E8E6E1;">
            <p style="font-size:11px;color:#9B9B9B;margin:0;">© ${new Date().getFullYear()} Resumetric</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}

module.exports = { sendOTPEmail };
