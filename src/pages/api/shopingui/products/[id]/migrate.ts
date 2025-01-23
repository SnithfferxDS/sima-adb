import {
    API_EMAIL,
    API_PASS,
    API_TOKEN_NAME,
    API_URL,
    API_USER
} from '@Configs/constants';
import type { APIRoute } from 'astro';
import { ShopinguiService } from 'src/services/shopingui.service';

const shopinguiService = new ShopinguiService();

export const GET: APIRoute = async ({ params, request }) => {
    try {
        const id = params.id;
        let token = '';
        const data = await request.json();
        // look if product exists
        const product = await shopinguiService.getDsinProduct(Number(id));
        if (product) {
            return new Response(JSON.stringify({ error: 'Product already exists', product: product[0] }), { status: 404 });
        }
        // const token = request.headers.get(API_TOKEN_NAME);
        // if (!token) return new Response(JSON.stringify({ error: 'No token provided' }), { status: 401 });
        // temp solution
        const authResponse = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            body: JSON.stringify({
                name: API_USER,
                email: API_EMAIL,
                password: API_PASS,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .catch((err) => console.log("Error: ", err));
        if (authResponse && authResponse.token) {
            token = authResponse.token;
        }
        const productDs = await fetch(`${API_URL}/products/${id}`, {
            headers: {
                Authorization: "Bearer " + token,
            },
        })
            .then((res) => res.json())
            .catch((err) => console.log("Error: ", err));
        const productMigrated = await shopinguiService.addProductFromDS(productDs);
        return new Response(JSON.stringify({ product: product }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to create product' }), { status: 500 });
    }
}