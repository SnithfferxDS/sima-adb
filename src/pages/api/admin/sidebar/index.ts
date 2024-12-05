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
        const { name, url, icon, parent_id, position } = await request.json();
        console.log(name, url, icon, parent_id, position);
        let parent = parent_id > 0 ? parent_id : null;

        const sidebarMenu = await db.insert(SidebarMenu).values({
            name,
            url,
            icon,
            parent_id: parent,
            position,
        });
        return new Response(JSON.stringify({ success: true, sidebarMenu }), { status: 201 });
    } catch (error) {
        console.log(error);
        return new Response(
            JSON.stringify(
                { error: error.message, success: false }
            ),
            { status: 500 });
    }
};