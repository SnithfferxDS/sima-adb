import type { APIRoute } from 'astro';
import {db, ProductType} from 'astro:db';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    console.log(data);
    const productType = await db.insert(ProductType).values({
      name: data.name,
      categories: JSON.stringify(data.categories),
      created_at: new Date()
    });

    return new Response(JSON.stringify({ success: true, productType }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error creating product type:', error);
    return new Response(
        JSON.stringify({ error: 'Failed to create product type' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
    );
  }
};