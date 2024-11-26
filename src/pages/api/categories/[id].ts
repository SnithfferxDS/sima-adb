import type { APIRoute } from 'astro';
import { db, eq, Category } from 'astro:db';
import { generateSlug } from '../../../lib/utils/slug';

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const id = parseInt(params.id!);
    await db.delete(Category).where(eq(Category.id, id));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to delete category' }),
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
      .update(Category)
      .set({
        name: data.name,
        slug: generateSlug(data.name),
        description: data.description.trim() || null,
        parents: data.parents || [],
        active: data.active ?? true,
        updated_at: new Date(),
      })
      .where(eq(Category.id, id));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to update category' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};