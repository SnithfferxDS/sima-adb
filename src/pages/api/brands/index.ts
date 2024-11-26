import type { APIRoute } from 'astro';
import { db, Brand } from 'astro:db';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const brand = await db.insert(Brand).values({
      name: data.name,
      description: data.description,
      logo: data.logo,
      active: data.active,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return new Response(JSON.stringify({ success: true, brand }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to create brand' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};