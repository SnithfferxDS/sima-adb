import type { APIRoute } from 'astro';
import { db, eq, variantTypeValue } from 'astro:db';

export const GET: APIRoute = async ({ params }) => {
  try {
    const typeId = parseInt(params.id!);
    const values = await db
      .select()
      .from(variantTypeValue)
      .where(eq(variantTypeValue.variant_type_id, typeId))
      .all();

    return new Response(JSON.stringify(values), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch variant values' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};