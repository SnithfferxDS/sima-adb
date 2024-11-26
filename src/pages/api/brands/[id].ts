import type { APIRoute } from 'astro';
import { db, eq, Brand } from 'astro:db';

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const id = parseInt(params.id!);
    await db.delete(Brand).where(eq(Brand.id, id));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to delete brand' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};

export const PUT: APIRoute = async ({ request, params }) => {
  try {
    const id = parseInt(params.id!);
    const data = await request.json();
    
    await db
      .update(Brand)
      .set({
        name: data.name,
        description: data.description,
        logo: data.logo,
        active: data.active,
        updated_at: new Date(),
      })
      .where(eq(Brand.id, id));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to update brand' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};