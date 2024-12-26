import type { APIRoute } from 'astro';
import { db, VariantTypeValue } from 'astro:db';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const value = await db.insert(VariantTypeValue).values({
      name: data.name,
      value: data.value,
      abbreviation: data.abbreviation,
      variant_type_id: data.variant_type_id,
      active: true,
      created_at: new Date()
    });

    return new Response(JSON.stringify({ success: true, value }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to create variant type value' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};