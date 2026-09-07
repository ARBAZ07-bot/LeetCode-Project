const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const sendOtpEmail = async (toEmail, otp) => {
    await resend.emails.send({
        from: 'CodeArena <onboarding@resend.dev>',
        to: toEmail,
        subject: 'Verify your CodeArena account',
        html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
                <h2>Verify your email</h2>
                <p>Your CodeArena verification code is:</p>
                <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px;">${otp}</p>
                <p>This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
            </div>
        `
    });
};

module.exports = sendOtpEmail;