import type { APIRoute } from 'astro';
import { db, eq, Person } from 'astro:db';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    // In a real app, get the user ID from the session
    const userId = 1;

    await db
      .update(Person)
      .set({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        address: formData.get('address') as string,
        phone: formData.get('phone') as string,
      })
      .where(eq(Person.userId, userId));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update profile' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
