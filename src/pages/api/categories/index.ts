import type { APIRoute } from 'astro';
import { db, Category } from 'astro:db';
import { generateSlug } from '../../../lib/utils/slug';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const category = await db.insert(Category).values({
      name: data.name,
      slug: generateSlug(data.name),
      description: data.description.trim() || null,
      parents: JSON.stringify(data.parents),
      active: data.active ?? true
    });

    return new Response(JSON.stringify({ success: true, category }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create category' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};