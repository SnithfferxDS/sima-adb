import { API_URL, API_EMAIL, API_PASS, API_USER } from '@Configs/constants';
import type { ShopinguiProduct } from '@Types/shopingui/products/ProductSchema';
import type { APIRoute } from 'astro';
import { ShopinguiService } from 'src/services/shopingui.service';

const shopinguiServices = new ShopinguiService();

export const POST: APIRoute = async ({ request }) => {
    try {
        const data = await request.json();
        const product = await fetch(`${API_URL}/products/migrate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                page: data.product,
            }),
        });
        if (!product.ok) throw new Error("Failed to create product");
        return new Response(JSON.stringify({ success: true }), { status: 201 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to create product' }), { status: 500 });
    }
}

export const GET: APIRoute = async ({ request }) => {
    try {
        let token = '';
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
        // Loop through all products
        let currentProduct = 0, currentPage = 1, limit = 10, totalPages = 0, max = 0;
        do {
            const response = await getProducts(token, currentPage, limit);
            if (response.ok) {
                const productsData = await response.json();
                if (currentProduct == 0) {
                    totalPages = productsData.max;
                    max = parseInt(productsData.max);
                }
                console.info("Initiating migration of page: ", currentPage, " of ", totalPages);
                // console.info("Total pages: ", totalPages);
                currentPage += limit;
                try {
                    const products = await Promise.all(
                        productsData.data.map(async (product: ShopinguiProduct) => {
                            if (product !== null) {
                                console.log("Product: ", product.id);
                                await shopinguiServices.addProductFromDS(product);
                            }
                            currentProduct += 1;
                        })
                    ).catch((err) => console.log("Error: ", err));
                    if (products) {
                        console.info("Product Migrated: ", currentProduct);
                    }
                } catch (error) {
                    throw new Error("Error: " + error);
                }
            } else {
                if (currentPage < 100) {
                    throw new Error("Failed to create product");
                }
            }
        } while (currentPage <= 100);
        return new Response(JSON.stringify({ success: true }), { status: 201 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to create product' }), { status: 500 });
    } finally {
        console.info("Fin");
    }
}

async function getProducts(token: string, current: number, limit: number) {
    return await fetch(`${API_URL}/products/migrate?page=${current}&limit=${limit}`, {
        headers: {
            Authorization: "Bearer " + token,
        },
    });
}