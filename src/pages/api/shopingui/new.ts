import { API_URL } from '@Configs/constants';
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
    try {
        const data = await request.json();
        const product = await fetch(`${API_URL}/products/migrate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                product: data.product,
            }),
        });
        if (!product.ok) throw new Error("Failed to create product");
        return new Response(JSON.stringify({ success: true }), { status: 201 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to create product' }), { status: 500 });
    }
}