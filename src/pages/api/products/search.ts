import type { APIRoute } from 'astro';
import { db, eq, like, or, Product } from 'astro:db';

export const GET: APIRoute = async ({ request }) => {
    const url = new URL(request.url);
    const searchTerm = url.searchParams.get('q')?.toLowerCase();
    if (!searchTerm) {
		return new Response(JSON.stringify({ error: 'Search term is required' }), { status: 400 });
    }

    const filteredProducts = await db.select({
        id: Product.id,
        name: Product.name,
        sku: Product.sku,
        mpn: Product.mpn,
        upc: Product.upc,
    }).from(Product).where(
        or(
            like(Product.name, `%${searchTerm}%`),
            eq(Product.sku, searchTerm),
            eq(Product.mpn, searchTerm),
            eq(Product.upc, searchTerm)
        )
    );

    return new Response(JSON.stringify(filteredProducts), {
        headers: { 'Content-Type': 'application/json' },
    });
}
