import nodemailer from "nodemailer";

import mailConfig from "../config/mail.js";

class MailService {
    createTransporter() {
        if (
            !mailConfig.host ||
            !mailConfig.username ||
            !mailConfig.password
        ) {
            return null;
        }

        return nodemailer.createTransport({
            host:
                mailConfig.host,

            port:
                mailConfig.port,

            secure:
                mailConfig.secure,

            auth: {
                user:
                    mailConfig.username,

                pass:
                    mailConfig.password
            }
        });
    }

    async sendPasswordResetOtp({
        email,
        name,
        otp
    }) {
        const transporter =
            this.createTransporter();

        if (!transporter) {
            throw new Error(
                "Mail server is not configured."
            );
        }

        const expiresInMinutes =
            Number(
                process.env
                    .PASSWORD_RESET_OTP_EXPIRES_MINUTES ||
                10
            );

        const subject =
            "Your Sentinel password reset code";

        const text = `
Hello ${name || "there"},

Your Sentinel password reset verification code is:

${otp}

This code expires in ${expiresInMinutes} minutes.

If you did not request a password reset, you can safely ignore this email.

Sentinel
        `.trim();

        const html = `
<!DOCTYPE html>

<html>
<head>
    <meta charset="UTF-8">
</head>

<body
    style="
        margin: 0;
        padding: 0;
        background: #f5f5f5;
        font-family: Arial, sans-serif;
        color: #111111;
    "
>
    <div
        style="
            max-width: 560px;
            margin: 40px auto;
            background: #ffffff;
            padding: 40px;
            border-radius: 16px;
        "
    >
        <div
            style="
                font-size: 24px;
                font-weight: 700;
                margin-bottom: 32px;
            "
        >
            Sentinel
        </div>

        <h2
            style="
                margin: 0 0 20px;
            "
        >
            Password reset verification
        </h2>

        <p>
            Hello ${name || "there"},
        </p>

        <p>
            We received a request to reset
            your Sentinel password.
        </p>

        <p>
            Enter this verification code:
        </p>

        <div
            style="
                margin: 28px 0;
                padding: 20px;
                text-align: center;
                background: #f3f3f3;
                border-radius: 12px;
                font-size: 34px;
                font-weight: 700;
                letter-spacing: 10px;
            "
        >
            ${otp}
        </div>

        <p>
            This verification code expires
            in ${expiresInMinutes} minutes.
        </p>

        <p>
            If you didn't request a password
            reset, you can safely ignore this
            message.
        </p>

        <hr
            style="
                border: 0;
                border-top: 1px solid #eeeeee;
                margin: 32px 0;
            "
        >

        <p
            style="
                font-size: 12px;
                color: #777777;
            "
        >
            Sentinel Identity & Authentication
        </p>
    </div>
</body>
</html>
        `.trim();

        return transporter.sendMail({
            from:
                `"${mailConfig.fromName}" <${mailConfig.fromAddress}>`,

            to:
                email,

            subject,

            text,

            html
        });
    }

    async sendEmailVerificationOtp({
        email,
        name,
        otp
    }) {
        const expiresMinutes =
            Number(
                process.env
                    .EMAIL_VERIFICATION_OTP_EXPIRES_MINUTES ||
                10
            );

        if (!this.transporter) {
            throw new Error(
                "Mail transporter is not configured."
            );
        }

        await this.transporter.sendMail({
            from:
                `"${mailConfig.fromName}" <${mailConfig.fromAddress}>`,

            to:
                email,

            subject:
                "Verify your Sentinel account",

            text:
                `Hello ${name},

Your Sentinel verification code is:

${otp}

This code expires in ${expiresMinutes} minutes.

If you did not create this account, you can ignore this email.`
        });
    }
}

export default new MailService();