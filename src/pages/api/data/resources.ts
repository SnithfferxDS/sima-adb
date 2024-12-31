import type { APIRoute } from "astro";
import { db, eq, inArray } from "astro:db";
import { Category, CommonName, Product } from "astro:db";

export const POST: APIRoute = async ({ request }) => {
    try {
        const formData = await request.json();
        const resource = formData.resource;
        const params = formData.params;
        /* if (resource === 'products') {
            if (params.name) {
                const productsByName = await db.select().from(Product).where(eq(Product.name, params.name));
                return new Response(JSON.stringify(productsByName), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            } else {
                const resources = await db.select().from(Product).all();
                return new Response(JSON.stringify(resources), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        } else if (resource === 'categories') {
            if (params.name) {
                const categoriesByName = await db.select().from(Category).where(eq(Category.name, params.name));
                return new Response(JSON.stringify({ success: true, categories: categoriesByName }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            } else if (params.id) {
                const categoriesById = await db.select().from(Category).where(eq(Category.id, params.id));
                return new Response(JSON.stringify({ success: true, categories: categoriesById }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            } else {
                const resources = await db.select().from(Category).all();
                return new Response(JSON.stringify({ success: true, categories: resources }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        } else if (resource === 'common_names') {
            if (params.name) {
                const commonNamesByName = await db.select().from(CommonName).where(eq(CommonName.name, params.name));
                return new Response(JSON.stringify({ success: true, common_names: commonNamesByName }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            } else if (params.id) {
                const commonNamesById = await db.select().from(CommonName).where(eq(CommonName.id, params.id));
                return new Response(
                    JSON.stringify({ success: true, common_names: commonNamesById }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            } else if (params.category_id) {
                console.log(commonNamesByCategoryId);
                */
        const commonNames = await db.select().from(CommonName).all();
        if (params.category_id) {
            let categoryId = Number(params.category_id);
            console.log("categoryId: ", categoryId);
            const commonNamesByCategoryId = await Promise.all(
                // Filter common names by category id
                commonNames.map(async (commonName: any) => {
                    console.log("CommonName: ", commonName);
                    // Get categories array from common name categories json
                    const categories = JSON.parse(String(commonName.categories));
                    console.log("Categories: ", categories);
                    // Check if category id is included in categories array
                    if (categories.includes(categoryId)) {
                        console.log("Including common name: ", commonName);
                        return commonName;
                    }
                })
            );
            return new Response(
                JSON.stringify({ success: true, common_names: commonNamesByCategoryId }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        /*
           } else {
               const resources = await db.select().from(Category).all();
               return new Response(
                   JSON.stringify({ success: true, common_names: resources }), {
                   status: 200,
                   headers: { 'Content-Type': 'application/json' }
               });
           }
       } */
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
