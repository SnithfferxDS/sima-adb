import { EmailService } from '../../services/email.service';
import { APP_NAME } from '@Configs/constants';

const emailService = new EmailService();

interface RegisterEmailData {
    email: string;
    username: string;
    activationLink?: string;
}

export async function sendRegisterNotification({
    email,
    username,
    activationLink,
}: RegisterEmailData): Promise<boolean> {
    try {
        await emailService.sendEmail(
            email,
            `Bienvenido a ${APP_NAME} - ${username}`,
            `
                <h1>Bienvenido, ${username}!</h1>
                <p>Gracias por registrarte en ${APP_NAME}.</p>
                ${activationLink
                ? `<p>Por favor activa tu cuenta haciendo clic en el siguiente enlace:</p>
                             <a href="${activationLink}">Activar Cuenta</a>`
                : ''
            }
                <p>Si no has sido tu quien creo tu cuenta, favor ignorar este correo.</p>
            `,
        );
        return true;
    } catch (error) {
        console.error('Failed to send registration email:', error);
        return false;
    }
}