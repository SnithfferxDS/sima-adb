export interface ShopinguiProductStockByWarehouse {
    id: number;
    name: string;
    qnt: number;
}
export interface ShopinguiProductStocks {
    total: {
        [key: string]: number;
    };
    sucursals: {
        [key: string]: ShopinguiProductStockByWarehouse[]
    } | {
        [key: string]: number;
    };
}

export interface ShopinguiProduct {
    id: number;
    productType: {
        id: number;
        name: string | null;
    } | null;
    category: {
        id: number;
        name: string;
        client: number | null;
    } | null;
    image: string | null;
    name: string | null;
    upc: string | null;
    sku: string | null;
    specsLink: string | null;
    defaultWarranty: string | number | null;
    disabled: number | boolean;
    weight: string | null | undefined;
    offerEnd: string | null;
    offer: string | boolean | null;
    mpn: string | null;
    min: number | null;
    max: number | null;
    stocks: ShopinguiProductStocks | null;
    origin: {
        id: number;
        name: string;
    } | null;
    priceCategory: number | null;
    brand: {
        id: number;
        name: string;
    } | null;
    commonName: {
        id: number;
        name: string;
        position: number | null;
        storeCategory: {
            id: number;
            name: string;
            storeId: string;
            handle: string;
            isLinea: number;
        } | null;
    }[];
    store: {
        id: string;
        price: {
            type: number;
            value: number;
            offer: boolean;
        };
        status: string;
        combo: string | null;
        bundle: string | null;
        dsComputer: string | null;
        variant: {
            id: string;
            main: string;
            value: string;
        }
    };
    price: {
        value: number;
        cost: number;
        added: {
            value: number;
            asignedBy: string | null;
            updatedAt: string | null;
        } | null;
    } | null;
    metadata: {
        id: number | null;
        name: string | null;
        value: string;
        position: number | null;
        active: number | null;
        isFeature: number | null;
        tooltip: string | null;
        format: string | null;
        allowDescription: number | null;
        group: {
            id: string | null;
            name: string | null;
            order: number | null;
        };
    }[];
    tags: string[];
}

export type ShopinguiProducts = ShopinguiProduct[];

export interface ShopinguiProductsResponse {
    success: boolean;
    products: ShopinguiProduct[];
}