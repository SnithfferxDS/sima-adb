import type { APIRoute } from 'astro';
import { db, VariantType } from 'astro:db';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const type = await db.insert(VariantType).values({
      name: data.name,
      active: data.active,
      created_at: new Date()
    });

    return new Response(JSON.stringify({ success: true, type }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to create variant type' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};