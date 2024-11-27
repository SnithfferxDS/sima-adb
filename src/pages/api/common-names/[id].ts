import type { APIRoute } from 'astro';
import { db, eq, CommonName } from 'astro:db';

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const id = parseInt(params.id!);
    await db.delete(CommonName).where(eq(CommonName.id, id));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to delete common name' }),
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
      .update(CommonName)
      .set({
        name: data.name,
        possition: parseInt(data.possition) || 1,
        active: data.active === 'true' || data.active === true,
        desc_active: data.desc_active === 'true' || data.desc_active === true,
        categories: data.categories,
        updated_at: new Date(),
      })
      .where(eq(CommonName.id, id));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to update common name' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};