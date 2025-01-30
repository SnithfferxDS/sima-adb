import type { APIRoute } from "astro";
import { db, eq, User } from "astro:db";

export const POST: APIRoute = async ({ request }) => {
    const { userName } = await request.json();
    const user = await db
        .select()
        .from(User)
        .where(eq(User.name, userName))
        .get();

    if (user) {
        return new Response(JSON.stringify({ exists: true }), { status: 200 });
    } else {
        return new Response(JSON.stringify({ exists: false }), { status: 400 });
    }
};