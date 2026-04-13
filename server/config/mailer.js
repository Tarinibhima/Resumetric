const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendOTPEmail(to, name, otp) {
  await resend.emails.send({
    from: "Resumetric <onboarding@resend.dev>",
    to: "tarinibhima@gmail.com",
    subject: `${otp} is your Resumetric verification code`,
    html: `
      <h2>Hi ${name}</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>Expires in 10 minutes</p>
    `,
  });
}

module.exports = { sendOTPEmail };