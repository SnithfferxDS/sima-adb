import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
    try {
        const data = await request.json();
        console.log(data);
        return new Response(JSON.stringify({ success: true }), { status: 201 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to create product' }), { status: 500 });
    }
}