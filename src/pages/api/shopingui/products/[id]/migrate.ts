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
        /* {
            "id": 12606,
            "productType": {
                "id": 167,
                "name": "Matriciales"
            },
            "category": {
                "id": 23,
                "name": "Impresoras",
                "client": 4
            },
            "image": "bfdgg_1817.jpeg",
            "name": "Impresora Epson TM-U220A Matricial",
            "upc": "C31C513A8901",
            "sku": "TM-U220A",
            "specsLink": "https://epson.com.mx/Para-el-trabajo/Punto-de-Venta/Impresoras-de-Punto-de-Venta/Impresora-Epson-TM-U220-para-recibos-cocina-/p/C31C514653",
            "defaultWarranty": "12",
            "disabled": 0,
            "weight": "",
            "offerEnd": null,
            "offer": "false",
            "mpn": null,
            "min": 1,
            "max": 3,
            "origin": null,
            "priceCategory": 2,
            "commonName": [
                {
                    "id": 43,
                    "name": "Impresora Matricial",
                    "position": 1,
                    "storeCategory": {
                        "id": 5,
                        "name": "Impresoras",
                        "storeId": "42729963556",
                        "handle": "impresoras",
                        "isLinea": 0
                    }
                }
            ],
            "store": {
                "id": "4720566435973",
                "price": 2,
                "status": "4",
                "combo": "",
                "bundle": "",
                "dsComputer": "",
                "variantValue": 0,
                "variantId": ""
            },
            "price": {
                "cost": 260,
                "added": {
                    "value": 60.6,
                    "asignedBy": "cjjs",
                    "updatedAt": "2022-12-06"
                },
                "value": 365.90078000000005
            },
            "stocks": {
                "HQ": [
                    {
                        "id": 1,
                        "name": "Almacén",
                        "qnt": 2,
                        "sucursal": null
                    }
                ],
                "Santa Ana": [
                    {
                        "id": 18,
                        "name": "Santa Ana",
                        "qnt": 2,
                        "sucursal": {
                            "id": 4,
                            "name": "Santa Ana"
                        }
                    }
                ],
                "total": {
                    "HQ": 2,
                    "Santa Ana": 2
                }
            },
            "metadata": [
                {
                    "id": 360,
                    "name": "Modelo",
                    "value": "TM-U220A",
                    "position": 1,
                    "active": 1,
                    "isFeature": 0,
                    "format": "",
                    "tooltip": "",
                    "allowDescription": 1,
                    "group": {
                        "id": "22",
                        "name": "Información del Producto",
                        "order": 1
                    }
                },
                {
                    "id": 361,
                    "name": "Serie",
                    "value": "TM-U",
                    "position": 2,
                    "active": 1,
                    "isFeature": 0,
                    "format": null,
                    "tooltip": null,
                    "allowDescription": 1,
                    "group": {
                        "id": "22",
                        "name": "Información del Producto",
                        "order": 1
                    }
                }
            ],
            "tags": []
        } */
        const productMigrated = await shopinguiService.addProductFromDS(productDs);
        return new Response(JSON.stringify({ product: product }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to create product' }), { status: 500 });
    }
}