import type { ShopinguiProductStocks } from "./ProductSchema";
export interface ProductCardSchema {
    id: number | null,
    dsin: number | null,
    name: string | null,
    description: string | null,
    image: string | null,
    price: number | null,
    brand: string | null,
    category: string | null,
    productType: string | null,
    store: {
        id: string | null,
        price: number | null,
        offer: boolean | null,
        status: string | null,
    },
    stocks: ShopinguiProductStocks | null,
}
export type ProductCardSchemas = ProductCardSchema[];