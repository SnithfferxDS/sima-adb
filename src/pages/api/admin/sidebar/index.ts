import type { APIRoute } from "astro";
import { db, SidebarMenu } from "astro:db";

/* export const get: APIRoute = async ({ request }) => {
    const { search } = await request.json();
    const sidebarMenus = await db.select().from(SidebarMenu).all();
    const filteredSidebarMenus = search
        ? await db
            .select()
            .from(SidebarMenu)
            .where((sidebarMenu) =>
                sidebarMenu.name.includes(search) ||
                sidebarMenu.url.includes(search) ||
                sidebarMenu.icon.includes(search)
            )
            .all()
        : sidebarMenus;

    return filteredSidebarMenus;
}; */

export const POST: APIRoute = async ({ request }) => {
    try {
        const { name, url, icon } = await request.json();
        const sidebarMenu = await db.insert(SidebarMenu).values({
            name,
            url,
            icon,
        });
        return new Response(JSON.stringify({ success: true, sidebarMenu }), { status: 201 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};