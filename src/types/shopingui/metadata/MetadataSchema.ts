export interface ShopinguiMetadata {
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
}

export interface ShopinguiGroup {
    id: number;
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