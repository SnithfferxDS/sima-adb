export interface ShopinguiProductStock {
    id: number;
    name: string;
    qnt: number;
    sucursal: {
        id: number;
        name: string;
    } | null;
}
export interface ShopinguiProductStocks {
    [key: string]: ShopinguiProductStock[] | {
        [key: string]: number;
    };
    total: {
        [key: string]: number;
    };
}

export interface ShopinguiProduct {
    id: number;
    productType: {
        id: number;
        name: string;
    };
    category: {
        id: number;
        name: string;
        client: number
    };
    image: string;
    name: string;
    upc: string;
    sku: string;
    specsLink: string;
    defaultWarranty: number;
    disabled: number | boolean;
    weight: number | null | undefined;
    offerEnd: string | null;
    offer: string | boolean;
    mpn: string | null;
    min: number;
    max: number;
    stocks: ShopinguiProductStocks;
    origin: string | null;
    priceCategory: number;
    commonName: {
        id: number;
        name: string;
        position: number;
        storeCategory: {
            id: number;
            name: string;
            storeId: string;
            handle: string;
            isLinea: number;
        };
    }[];
    store: {
        id: string;
        price: number;
        status: number;
        combo: string;
        bundle: string;
        dsComputer: string;
        variantValue: number;
        variantId: string;
    };
    price: {
        cost: number;
        added: {
            value: number;
            asignedBy: string;
            updatedAt: string;
        };
        price: number;
    };
    metadata: {
        id: number;
        name: string;
        value: string;
        position: number;
        active: boolean;
        isFeature: boolean;
        tooltip?: string;
        format?: string;
        group: {
            id: number;
            name: string;
            order: number;
        };
    }[];
    tags: string[];
}

export type ShopinguiProducts = ShopinguiProduct[];

export interface ShopinguiProductsResponse {
    success: boolean;
    products: ShopinguiProduct[];
}