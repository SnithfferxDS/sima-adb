import type { APIRoute } from "astro";
import { API_EMAIL, API_PASS, API_URL, API_USER } from "@Configs/constants";

export const GET: APIRoute = async ({ params, request }) => {
    // Get token from cookies
    let token = params.token;
    if (!token) return new Response(JSON.stringify({ error: "No token provided" }), {
        status: 400,
    });
    // temp solution
    const authResponse = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        body: JSON.stringify({
            name: API_USER,
            email: API_EMAIL,
            password: API_PASS
        }),
        headers: {
            "Content-Type": "application/json"
        },
    })
        .then(res => res.json())
        .catch(err => console.log("Error: ", err));
    if (authResponse && authResponse.token) {
        token = authResponse.token;
    }
    // Get product
    const product = await fetch(`${API_URL}/products/${params.id}`).then((res) =>
        res.json(),
    );
    if (!product || product.length === 0)
        return new Response(JSON.stringify({ error: "Failed to get product" }), {
            status: 500,
        });
    return new Response(JSON.stringify({ success: true, product: product[0] }), {
        status: 200,
    });
};