export interface ShopinguiCategory {
    id: number | null;
    name: string | null;
    slug: string | null;
    description: string | null;
    parents: string | null;
    client: number | null;
    active: boolean | null;
    createdAt: string | null;
    updatedAt: string | null;
}

export interface ShopinguiCategoryResponse {
    success: boolean;
    categories: ShopinguiCategory[];
}

export interface ShopinguiCategories {
    id: number;
    name: string;
    description: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}