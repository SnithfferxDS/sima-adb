import type { AstroGlobal } from 'astro';
import { defineMiddleware } from 'astro:middleware';
import { getSession } from '../lib/session.ts';
import { db, eq,User } from 'astro:db';

export const onRequest = defineMiddleware(async ({ locals, request, redirect }) => {
  const protectedPaths = ['/dashboard', '/dashboard/profile'];
  const currentPath = new URL(request.url).pathname;

  // Check if the current path is protected
  if (protectedPaths.some(path => currentPath.startsWith(path))) {
    // In a real app, check the session/token
    const isAuthenticated = false; // Replace with actual auth check

    if (!isAuthenticated) {
      return redirect('/auth/login');
    }
  }
});

export async function isAuthenticated(Astro: AstroGlobal): Promise<boolean> {
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