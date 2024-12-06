import type { APIRoute } from 'astro';
import { db, Supplier } from 'astro:db';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const supplier = await db.insert(Supplier).values({
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
      taxes: data.taxes,
      discount: data.discount,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return new Response(JSON.stringify({ success: true, supplier }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to create supplier' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};