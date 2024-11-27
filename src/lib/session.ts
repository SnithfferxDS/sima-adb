import { SignJWT, jwtVerify } from 'jose';
import { parse, serialize } from 'cookie';
import type { AstroGlobal } from 'astro';

const JWT_SECRET = new TextEncoder().encode(import.meta.env.JWT_SECRET || 'your-secret-key');
const SESSION_NAME = 'session';
const CSRF_TOKEN_NAME = 'csrf-token';

export interface SessionData {
    userId: string;
    email: string;
    name: string;
}

export async function createSession(data: SessionData): Promise<string> {
    return new SignJWT(data)
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('24h')
        .sign(JWT_SECRET);
}

export async function getSession(Astro: AstroGlobal): Promise<SessionData | null> {
    const cookies = parse(Astro.request.headers.get('cookie') || '');
    const token = cookies[SESSION_NAME];

    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as SessionData;
    } catch {
        return null;
    }
}

export function setSessionCookie(token: string): string {
    return serialize(SESSION_NAME, token, {
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 // 24 hours
    });
}

export function generateCsrfToken(): string {
    return crypto.randomUUID();
}

export function setCsrfCookie(token: string): string {
    return serialize(CSRF_TOKEN_NAME, token, {
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: 'lax',
        path: '/'
    });
}

export async function validateCsrfToken(request: Request): Promise<boolean> {
    const cookies = parse(request.headers.get('cookie') || '');
    const cookieToken = cookies[CSRF_TOKEN_NAME];
    const formToken = request.headers.get('x-csrf-token');

    return cookieToken === formToken;
}