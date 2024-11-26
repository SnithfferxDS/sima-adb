import type { APIRoute } from 'astro';
import { db, eq, Supplier } from 'astro:db';

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const id = parseInt(params.id!);
    await db.delete(Supplier).where(eq(Supplier.id, id));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to delete supplier' }),
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
      .update(Supplier)
      .set({
        name: data.name,
        address: data.address,
        phone: data.phone,
        email: data.email,
        website: data.website,
        contact: data.contact,
        country: data.country,
        state: data.state,
        city: data.city,
        street: data.street,
        logo: data.logo,
        updated_at: new Date(),
      })
      .where(eq(Supplier.id, id));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to update supplier' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};