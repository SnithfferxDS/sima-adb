export interface ShopinguiBrand {
    id: number | null;
    name: string | null;
    description: string | null;
    logo: string | null;
    active: boolean | null;
    createdAt: string | null;
    updatedAt: string | null;
}

export interface ShopinguiBrandResponse {
    success: boolean;
    brands: ShopinguiBrand[];
}

export interface ShopinguiBrands {
    id: number;
    name: string;
    description: string;
    logo: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}