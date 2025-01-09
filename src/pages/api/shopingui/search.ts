import type { APIRoute } from 'astro';
import { db } from '@DB/shopify/db';
import { Products } from '@DB/shopify/db/schema';
import { like, or } from 'drizzle-orm';
import { API_TOKEN, API_URL } from '@Configs/constants';

export const GET: APIRoute = async ({ url }) => {
    try {
        const terms = url.searchParams.get('terms');
        if (!terms) return new Response(JSON.stringify({ error: 'No search terms provided' }), { status: 400 });
        const request = await db.select().from(Products).where(
            or(
                like(Products.name, `%${terms}%`),
                like(Products.sku, `%${terms}%`),
                like(Products.mpn, `%${terms}%`),
                like(Products.upc, `%${terms}%`),
            )
        );
        console.log("Local Request: ", request);
        if (!request || request.length === 0) {
            // Authenticate before request
            let token = API_TOKEN;
            if (API_TOKEN == '') {
                const authResponse = await fetch(`${API_URL}/auth/login`, {
                    method: "POST",
                    body: JSON.stringify({
                        name: "jorge", email: "john@example.com", password: "password123"
                    }),
                    headers: {
                        "Content-Type": "application/json"
                    },
                });
                if (authResponse) {
                    const authToken = await authResponse.json();
                    token = authToken.token;
                }
            }
            // Get api response
            const response = await fetch(`${API_URL}/products/search?terms=${terms}`, {
                headers: {
                    'Authorization': "Bearer " + token
                },
                method: 'GET',
                mode: 'cors',
                credentials: 'include',
            });
            // console.log("API Request: ", response);
            if (!response.ok) throw new Error("Search failed");
            const results = await response.json();
            // console.log("Products: ", results);
            return new Response(JSON.stringify({ success: true, products: results }), { status: 201 });
        }
        return new Response(JSON.stringify({ success: true, products: request }), { status: 201 });
    } catch (error) {
        if (error instanceof Error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        return new Response(JSON.stringify({ error: 'An unknown error occurred' }), { status: 500 });
    }
}