import type { APIRoute } from 'astro';
import { db, eq, Product } from "astro:db";

export const GET: APIRoute = async ({ url }) => {
    try {
        // Get product ID from query parameter
        const productUPC = url.searchParams.get('upc');

        if (!productUPC) {
            return new Response(JSON.stringify({ error: 'Product UPC is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const product = await db.select({
            description: Product.short_description
        }).from(Product).where(eq(Product.upc, productUPC)).get();

        if (!product) {
            return new Response(JSON.stringify({ error: 'Product not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify(product.description), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};