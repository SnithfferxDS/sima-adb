import type { APIRoute } from "astro";
import { db, eq, inArray } from "astro:db";
import { Category, CommonName, Product } from "astro:db";

export const POST: APIRoute = async ({ request }) => {
    try {
        const formData = await request.json();
        const resource = formData.resource;
        const params = formData.params;
        if (!resource || !params) return new Response(JSON.stringify({ error: 'Invalid resource' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
        if (resource === 'common_names') {
            if (params.category_id) {
                const categoryId = Number(params.category_id);
                const commonNames = await db.select().from(CommonName).where(eq(CommonName.parent_id, categoryId)).all();

                return new Response(
                    JSON.stringify({ success: true, common_names: commonNames }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        } else if (resource === 'products') {
            if (params.name) {
                const productsByName = await db.select().from(Product).where(eq(Product.name, params.name));
                return new Response(JSON.stringify(productsByName), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }
        return new Response(JSON.stringify({ error: 'Invalid resource' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
