import type { APIRoute } from 'astro';
import { db, MetadataValue } from 'astro:db';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { product_id, metadata_id, value } = await request.json();

    await db.insert(MetadataValue).values({
      product_id,
      metadata_id,
      value,
      created_at: new Date()
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error saving metadata value:', error);
    return new Response(JSON.stringify({ error: 'Failed to save metadata value' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};