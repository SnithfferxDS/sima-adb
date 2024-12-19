import type { APIRoute } from 'astro';
import { db, CommonName } from 'astro:db';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const commonName = await db.insert(CommonName).values({
      name: data.name,
      position: parseInt(data.possition) || 1,
      active: data.active === 'true' || data.active === true,
      desc_active: data.desc_active === 'true' || data.desc_active === true,
      parent_id: data.parent,
      categories: JSON.stringify(data.categories),
      created_at: new Date()
    });

    return new Response(JSON.stringify({ success: true, commonName }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error creating common name:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create common name' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};