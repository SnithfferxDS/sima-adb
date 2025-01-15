import { APP_KEY } from '@Configs/constants';
import { db, eq, User, Person, or } from 'astro:db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { AuthService } from 'src/services/auth.service';
import { EmailService } from 'src/services/email.service';

const authService = new AuthService();
const emailService = new EmailService();

export async function verifyUser(token: string) {
    return authService.verifyUser(token);
}

export async function authenticateUser(email: string, userName: string, password: string) {
    return authService.login(userName, email, password);
}

export async function createPasswordReset(email: string) {
    const resetToken = await authService.createPasswordReset(email);
    // send email
    if (resetToken) emailService.sendPasswordReset(email, resetToken);
    // return resetToken;
    return resetToken;
}

export async function resetPassword(token: string, newPassword: string) {
    return authService.resetPassword(token, newPassword);
}

export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

export const comparePasswords = async (password: string, hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
};

export const generateUserId = (): string => {
    return crypto.randomUUID(); //uuidv4();
};

export const generateSignature = async (name: string): Promise<string> => {
    name = name + APP_KEY;
    const signature = await bcrypt.hash(name, 10);
    return signature;
};

export const saveApiToken = (userId: string, token: string) => {
    return authService.saveApiToken(userId, token);
}