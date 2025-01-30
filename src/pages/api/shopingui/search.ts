import { type APIRoute } from 'astro';
import { API_TOKEN, API_URL, API_USER, API_PASS, API_EMAIL, API_TOKEN_NAME } from '@Configs/constants';
import { ShopinguiService } from 'src/services/shopingui.service';

const shopinguiServices = new ShopinguiService();

export const GET: APIRoute = async ({ request, url }) => {
    try {
        const terms = url.searchParams.get('terms');
        // console.log("terms: ", terms);
        if (!terms) return new Response(JSON.stringify({ error: 'No search terms provided' }), { status: 400 });
        const localRequest = await shopinguiServices.search(terms);
        if (!localRequest || localRequest.length === 0) {
            // Authenticate before request
            let token = API_TOKEN;
            // console.log("start: ", token);
            if (token == '') {
                const apiToken = request.headers.get(API_TOKEN_NAME);
                if (apiToken) {
                    token = apiToken;
                    //     } else {
                    //         return new Response(
                    //             JSON.stringify({ error: 'Not Authorized' }), {
                    //             status: 401
                    //         });
                }
            }
            console.log("Token: ", token);
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
            //         setSessionCookie(token);
            //     }
            // }
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
            if (!response.ok) {
                console.log(response);
                throw new Error("Search failed");
            }
            const results = await response.json();
            // console.log("Products: ", results);
            return new Response(JSON.stringify({ success: true, products: results }), { status: 201 });
        }
        return new Response(JSON.stringify({ success: true, products: localRequest }), { status: 201 });
    } catch (error) {
        if (error instanceof Error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        return new Response(JSON.stringify({ error: 'An unknown error occurred' }), { status: 500 });
    }
}