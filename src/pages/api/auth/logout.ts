import type { APIRoute } from 'astro';
import cookie from 'cookie';
import { checkRateLimit } from '@Utils/rate-limits';
import { validateCsrfToken } from '@Lib/session';

export const POST: APIRoute = async ({ request, clientAddress }) => {
    try {
        // Rate limiting check
        if (!checkRateLimit(clientAddress, '/api/auth/logout')) {
            return new Response('Too many attempts. Please try again later.', {
                status: 429
            });
        }

        // const formData = await request.formData();
        // const csrfToken = formData.get('x-csrf-token')?.toString();

        // if (!csrfToken) {
        //     return new Response('Missing CSRF token', { status: 400 });
        // }

        // // Verify CSRF token
        // const cookies = cookie.parse(request.headers.get('cookie') || '');
        // const storedToken = cookies.csrf_token;

        // if (!storedToken || !validateCsrfToken(request)) {
        if (!validateCsrfToken(request)) {
            return new Response('Invalid CSRF token', { status: 403 });
        }

        // Clear both auth and CSRF tokens
        const clearAuthCookie = cookie.serialize('auth_token', '', {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 0,
            path: '/'
        });

        const clearCsrfCookie = cookie.serialize('x-csrf-token', '', {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 0,
            path: '/'
        });

        const headers = new Headers();
        headers.set('Location', '/login');
        headers.append('Set-Cookie', clearAuthCookie);
        headers.append('Set-Cookie', clearCsrfCookie);

        return new Response(null, {
            status: 302,
            headers
        });
    } catch (error) {
        return new Response('Error during logout', { status: 500 });
    }
}