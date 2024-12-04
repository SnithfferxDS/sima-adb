import type { APIRoute } from "astro";
import { db, Country } from "astro:db";


export const get: APIRoute = async ({req}) => {
    const { search } = await req.json();
    const countries = await db.select().from(Country).all();
  const filteredCountries = search
    ? await db
        .select()
        .from(Country)
        .where((country) =>
          country.name.includes(search) ||
          country.tlc.includes(search) ||
          country.impex.includes(search) ||
          country.additional.includes(search)
        )
        .all()
    : countries;

  return filteredCountries;
};

export const POST: APIRoute = async ({ request }) => {
    try {
        const { name, tlc, impex, additional } = await request.json();
        const country = await db.insert(Country).values({
            name,
            tlc,
            impex,
            additional,
        });
        return new Response(JSON.stringify({ success: true, country }), { status: 201 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};