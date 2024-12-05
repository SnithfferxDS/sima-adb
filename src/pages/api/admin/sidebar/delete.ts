import { APIRoute } from 'astro';
import { db, eq, SidebarMenu } from 'astro:db';

export const post: APIRoute = async ({request}) => {
  try {
    const { id } = await request.json();

    await db.delete(SidebarMenu).where(eq(SidebarMenu.id, parseInt(id!)));
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify(
        { error: error.message, success: false }
      ),
      { status: 500 }
    );
  }
};