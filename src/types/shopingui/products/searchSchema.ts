export interface SearchableProduct {
    id: number;
    image: string;
    name: string;
    upc: string;
    sku: string;
    mpn: string;
    productType: {
        id: number;
        name: string;
    },
    brand: {
        id: number;
        name: string;
    },
    category: {
        id: number;
        name: string;
        client: number;
    },
    store: string;
    variant: {
        id: string;
        main: string;
        value: string;
    },
    disabled: number;
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