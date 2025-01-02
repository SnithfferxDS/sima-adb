import { db } from '@DB/index';
import { DSproducts } from '@DB/schema';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request }) => {
	try {
		const data = await request.json();
		console.log(data);
		const product = await db.select().from(DSproducts).where(eq(DSproducts.upc, data.product));
		console.log(product);
		return new Response(JSON.stringify({ success: true }), { status: 201 });
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Failed to create product' }), { status: 500 });
	}
}
