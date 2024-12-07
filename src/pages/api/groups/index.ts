import type { APIRoute } from 'astro';
import {db, Group} from 'astro:db';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    console.log(data);
    const group = await db.insert(Group).values({
      name: data.name,
      position: data.position,
      is_allow_desc: data.is_allow_desc,
      active: data.active ?? true,
    }).returning({id: Group.id});

    return new Response(JSON.stringify({ success: true, group }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error creating group:', error);
    return new Response(
        JSON.stringify({ error: 'Failed to create group' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
    );
  }
}; 