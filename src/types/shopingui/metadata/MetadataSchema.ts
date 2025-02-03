export interface ShopinguiMetadata {
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
}

export interface ShopinguiGroup {
    id: string;
    name: string;
    order: number;
}

export interface ShopinguiGroupResponse {
    success: boolean;
    groups: ShopinguiGroup[];
}

export interface ShopinguiMetadataGroup {
    id: number;
    name: string;
    metadata: Array<{
        id: number;
        name: string;
        value: string;
        position: number;
        active: boolean;
        isFeature: boolean;
        tooltip?: string;
        format?: string;
    }>;
}

export type ShopinguiMetadatas = ShopinguiMetadata[];
export type ShopinguiGroups = ShopinguiGroup[];
export type ShopinguiMetadataGroups = ShopinguiMetadataGroup[];