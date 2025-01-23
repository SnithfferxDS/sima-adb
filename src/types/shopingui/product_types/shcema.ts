export interface ShopinguiProductType {
    id: number | null;
    name: string | null;
    category: number | null;
    createdAt: string | null;
    updatedAt: string | null;
}

export interface ShopinguiProductTypeResponse {
    success: boolean;
    productTypes: ShopinguiProductType[];
}

export interface ShopinguiProductTypes {
    id: number;
    name: string;
    category: number;
    createdAt: string;
    updatedAt: string;
}