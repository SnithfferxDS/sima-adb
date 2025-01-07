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
}

export const emailService = new EmailService();