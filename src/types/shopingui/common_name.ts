export interface ShopinguiCommonName {
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
}

export type ShopinguiCommonNames = ShopinguiCommonName[];