export interface SearchableProduct {
    id: string;
    name: string;
    image?: string;
    sku?: string;
    mpn?: string;
    upc?: string;
    description?: string;
    active: boolean;
    product_type?: ProductType;
    store?: Store;
}

export interface ProductType {
    id: number;
    name: string;
}

export interface Store {
    id: string;
    name: string;
    price?: number;
    handle?: string;
    active: boolean;
}