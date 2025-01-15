import type { APIContext, AstroGlobal } from 'astro';
import { defineMiddleware } from 'astro:middleware';
import { getSession } from '../lib/session.ts';

export const onRequest = defineMiddleware((context, next) => {
  const protectedRoutes = ['/admin', '/dashboard'];

  const { pathname } = context.url;

  // Skip auth check for non-protected routes
  if (!protectedRoutes.some(route => pathname.startsWith(route))) {
    return next();
  }
  // Verficar si el usuario está autenticado
  const authenticated = isAuthenticated(context);

  if (!authenticated) {
    // Redirect to login page
    return context.redirect('/auth/login');
  }

  // Continue to the next middleware
  next();
});

export async function isAuthenticated(Astro: AstroGlobal | APIContext): Promise<boolean> {
  const session = await getSession(Astro);
  return session !== null;
}

export async function requireAuth(Astro: AstroGlobal) {
  if (!await isAuthenticated(Astro)) {
    return Astro.redirect('/auth/login');
  }
}

export async function redirectIfAuthenticated(Astro: AstroGlobal) {
  if (await isAuthenticated(Astro)) {
    return Astro.redirect('/dashboard');
  }
}