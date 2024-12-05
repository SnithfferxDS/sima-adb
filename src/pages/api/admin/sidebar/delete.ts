import { db, SidebarMenu } from 'astro:db';

const { id } = Astro.params;

if (Astro.request.method === 'POST') {
  await db.delete(SidebarMenu).where(SidebarMenu.id, '=', parseInt(id!));
  return Astro.redirect('/sidebar-menu');
}