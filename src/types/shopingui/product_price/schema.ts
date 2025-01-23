export interface ShopinguiProductPrice {
    cost: number;
    value: number;
    category: number;
    added: {
        value: number
        asignedBy: string
    }
    active: boolean;
    store: {
        regular_price: number
        sale_price: number
        offer: boolean
        price_category: number
    }
}