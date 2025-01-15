import { APP_SMTP_FROM, APP_SMTP_HOST, APP_SMTP_PASSWORD, APP_SMTP_PORT, APP_SMTP_USER } from '@Configs/constants';
import nodemailer from 'nodemailer';

export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: APP_SMTP_HOST,
            port: Number(APP_SMTP_PORT),
            secure: true,
            auth: {
                user: APP_SMTP_USER,
                pass: APP_SMTP_PASSWORD,
            },
        });
    }

    async sendEmail(
        to: string,
        subject: string,
        text: string,
        html?: string
    ): Promise<void> {
        try {
            await this.transporter.sendMail({
                from: APP_SMTP_FROM,
                to,
                subject,
                text,
                html: html || text,
            });
        } catch (error) {
            throw new Error(`Failed to send email: ${error}`);
        }
    }

    async sendPasswordReset(email: string, resetToken: string) {
        const text = `
            <p>Hello,</p>
            <p>You are receiving this email because you (or someone else) has requested the reset of the password for your account.</p>
            <p>Please click on the following link, or paste this into your browser to complete the process:</p>
            <p><a href="https://example.com/reset-password?token=${resetToken}">Reset Password</a></p>
            <p>If you did not request this, please ignore this email.</p>
            <p>Thank you,</p>
            <p>Example Team</p>
        `;

        await this.sendEmail(email, 'Reset Password', text);
    }
}

export const emailService = new EmailService();