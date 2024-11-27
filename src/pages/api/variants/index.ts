import type { APIRoute } from 'astro';
import { db, Variant } from 'astro:db';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const variant = await db.insert(Variant).values({
      upc: data.upc,
      mpn: data.mpn || null,
      sku: data.sku || null,
      variant_type_id: parseInt(data.type),
      variant_value_id: parseInt(data.value),
      created_at: new Date()
    });

    return new Response(JSON.stringify(variant), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to create variant' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};