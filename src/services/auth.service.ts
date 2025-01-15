import { db, eq, User, or } from 'astro:db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export class AuthService {
    async login(user: string, email: string, password: string) {
        const userData = await db
            .select()
            .from(User)
            .where(or(eq(User.email, email), eq(User.name, user)))
            .get();

        if (!userData) return null;

        const validPassword = await bcrypt.compare(password, userData.password);
        if (!validPassword) return null;

        return userData;
    }

    async verifyUser(token: string) {
        const user = await db
            .select()
            .from(User)
            .where(eq(User.verified_token, token))
            .get();

        if (!user) return null;

        await db
            .update(User)
            .set({
                email_verified: true,
                verified_token: null,
                updated_at: new Date()
            })
            .where(eq(User.id, user.id));

        return user;
    }

    async createPasswordReset(email: string) {
        const user = await db
            .select()
            .from(User)
            .where(eq(User.email, email))
            .get();

        if (!user) return null;

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await db
            .update(User)
            .set({
                reset_token: resetToken,
                token_expiry: resetTokenExpiry,
                updated_at: new Date()
            })
            .where(eq(User.id, user.id));

        return resetToken;
    }

    async resetPassword(token: string, newPassword: string) {
        const user = await db
            .select()
            .from(User)
            .where(eq(User.reset_token, token))
            .get();

        if (!user || !user.token_expiry || new Date() > user.token_expiry) {
            return null;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db
            .update(User)
            .set({
                password: hashedPassword,
                reset_token: null,
                token_expiry: null,
                updated_at: new Date()
            })
            .where(eq(User.id, user.id));

        return user;
    }

    async saveApiToken(user: string, token: string) {
        await db
            .update(User)
            .set({
                apiToken: token,
                updated_at: new Date()
            })
            .where(eq(User.id, user));

        return token;
    }
}