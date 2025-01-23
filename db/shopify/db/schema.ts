import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const Products = sqliteTable('products', {
    id: integer({ mode: 'number' }).primaryKey(),
    name: text('name').notNull(),
    handle: text('hadle'),
    longDescription: text('long_description'),
    shortDescription: text('short_description'),
    tags: text({ mode: 'json' }),
    sku: text(),
    mpn: text(),
    upc: text().notNull(),
    ean: text(),
    isbn: text(),
    weight: real(),
    weightUnit: text('weight_unit'),
    width: real(),
    height: real(),
    length: real(),
    warranty: integer({ mode: 'number' }),
    innerDiameter: real('inner_diameter'),
    outerDiameter: real('outer_diameter'),
    measureUnit: text('measure_unit'),
    customizable: integer({ mode: 'boolean' }),
    downloadable: integer({ mode: 'boolean' }),
    downloadableFiles: text('downloadable_files', { mode: 'json' }),
    customizableFields: text('customizable_fields', { mode: 'json' }),
    shippingVolume: real('shipping_volume'),
    shippingVolumeUnit: text('shipping_volume_unit'),
    shippingWeight: real('shipping_weight'),
    shippingWeightUnit: text('shipping_weight_unit'),
    createdAt: text('created_at').default(sql`(CURRENT_TIME)`),
    updatedAt: text('updated_at').default(sql`(CURRENT_TIME)`),
    deletedAt: text('deleted_at').default(sql`(CURRENT_TIME)`)
});

export const ProductRelations = sqliteTable('product_relations', {
    id: integer({ mode: 'number' }).primaryKey(),
    product: integer({ mode: 'number' }).notNull(),
    status: integer({ mode: 'number' }).notNull(),
    brand: integer({ mode: 'number' }).notNull(),
    categories: text('categories').notNull(),
    images: text('images').notNull(),
    prices: text('prices').notNull(),
    stocks: text('stocks').notNull(),
    store: integer({ mode: 'number' }),
    createdAt: text('created_at').default(sql`(CURRENT_TIME)`),
    updatedAt: text('updated_at').default(sql`(CURRENT_TIME)`),
    deletedAt: text('deleted_at').default(sql`(CURRENT_TIME)`)
});

export const Status = sqliteTable('status', {
    id: integer({ mode: 'number' }).primaryKey(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    active: integer({ mode: 'boolean' }).notNull(),
    createdAt: text('created_at').default(sql`(CURRENT_TIME)`),
    updatedAt: text('updated_at').default(sql`(CURRENT_TIME)`),
});

export const Brands = sqliteTable('brands', {
    id: integer({ mode: 'number' }).primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    logo: text('logo'),
    active: integer({ mode: 'boolean' }),
    createdAt: text('created_at').default(sql`(CURRENT_TIME)`),
    updatedAt: text('updated_at').default(sql`(CURRENT_TIME)`),
});

export const CommonNames = sqliteTable('common_names', {
    id: integer().primaryKey(),
    name: text(),
    position: integer().default(1),
    active: integer({ mode: 'boolean' }).default(true),
    desc_active: integer({ mode: 'boolean' }).default(true),
    parent_id: integer(),
    categories: text(),
    created_at: text('created_at').default(sql`(CURRENT_TIME)`),
    updated_at: text('updated_at').default(sql`(CURRENT_TIME)`),
});

export const Tags = sqliteTable('tags', {
    id: integer().primaryKey(),
    name: text(),
    created_at: text('created_at').default(sql`(CURRENT_TIME)`),
    updated_at: text('updated_at').default(sql`(CURRENT_TIME)`)
});

export const Categories = sqliteTable('categories', {
    id: integer().primaryKey(),
    name: text(),
    slug: text(),
    description: text(),
    parents: text(),
    active: integer({ mode: 'boolean' }).default(true),
    created_at: text('created_at').default(sql`(CURRENT_TIME)`),
    updated_at: text('updated_at').default(sql`(CURRENT_TIME)`)
});

export const Groups = sqliteTable('groups', {
    id: integer().primaryKey(),
    name: text(),
    position: integer({ mode: 'number' }).default(1),
    active: integer({ mode: 'boolean' }).default(true),
    is_allow_desc: integer({ mode: 'boolean' }).default(true),
    created_at: text('created_at').default(sql`(CURRENT_TIME)`),
    updated_at: text('updated_at').default(sql`(CURRENT_TIME)`)
});

export const Metadatas = sqliteTable('metadatas', {
    id: integer().primaryKey(),
    name: text(),
    position: integer({ mode: 'number' }).default(1),
    active: integer({ mode: 'boolean' }).default(true),
    allow_description: integer({ mode: 'boolean' }).default(true),
    is_feature: integer({ mode: 'boolean' }).default(false),
    format: text(),
    tooltip: text(),
    id_group: integer(),
    created_at: text('created_at').default(sql`(CURRENT_TIME)`),
    updated_at: text('updated_at').default(sql`(CURRENT_TIME)`)
});

export const Prices = sqliteTable('prices', {
    id: integer().primaryKey(),
    cost: integer({ mode: 'number' }).notNull(),
    added: integer({ mode: 'number' }).notNull(),
    value: integer({ mode: 'number' }).notNull(),
    asigned_by: text('asigned_by').notNull(),
    active: integer({ mode: 'boolean' }).default(true),
    created_at: text('created_at').default(sql`(CURRENT_TIME)`),
    updated_at: text('updated_at').default(sql`(CURRENT_TIME)`)
});

export const TagsProducts = sqliteTable('tags_products', {
    id: integer().primaryKey(),
    tag_id: integer().notNull(),
    product_id: integer().notNull(),
    created_at: text('created_at').default(sql`(CURRENT_TIME)`),
    updated_at: text('updated_at').default(sql`(CURRENT_TIME)`)
});

export const StoreInformation = sqliteTable('store_information', {
    id: integer().primaryKey(),
    name: text('name').notNull(),
    price: integer({ mode: 'number' }).notNull(),
    priceType: integer('price_type', { mode: 'number' }).notNull(),
    offer: integer({ mode: 'boolean' }).notNull(),
    status: text('status').notNull().default('1'),
    combo: text('combo'),
    bundle: text('bundle'),
    dsComputer: text('dsComputer'),
    variant: text('variant'),
    created_at: text('created_at').default(sql`(CURRENT_TIME)`),
    updated_at: text('updated_at').default(sql`(CURRENT_TIME)`)
});

export const MetadataProductAsociations = sqliteTable('metadata_product_asociations', {
    id: integer({ mode: 'number' }).primaryKey(),
    metadata_id: integer({ mode: 'number' }).notNull(),
    product_id: integer({ mode: 'number' }).notNull(),
    content: text('content').notNull(),
    active: integer({ mode: 'boolean' }).notNull(),
    allowDescription: integer({ mode: 'boolean' }).notNull(),
    created_at: text('created_at').default(sql`(CURRENT_TIME)`),
    updated_at: text('updated_at').default(sql`(CURRENT_TIME)`)
});

export const Stocks = sqliteTable('tmp_stocks', {
    id: integer({ mode: 'number' }).primaryKey(),
    product_id: integer({ mode: 'number' }).notNull(),
    min: integer({ mode: 'number' }).notNull(),
    max: integer({ mode: 'number' }).notNull(),
    qnt: integer({ mode: 'number' }).notNull(),
    sucursal: integer({ mode: 'number' }).notNull(),
    created_at: text('created_at').default(sql`(CURRENT_TIME)`),
    updated_at: text('updated_at').default(sql`(CURRENT_TIME)`)
});

// TPMs
export const ProductTypes = sqliteTable('tmp_product_type', {
    id: integer({ mode: 'number' }).primaryKey(),
    name: text('name').notNull(),
    category: integer({ mode: 'number' }).notNull(),
    created_at: text('created_at').default(sql`(CURRENT_TIME)`),
    updated_at: text('updated_at').default(sql`(CURRENT_TIME)`)
});

export const ProductCategories = sqliteTable('tmp_product_category', {
    id: integer({ mode: 'number' }).primaryKey(),
    name: text('name').notNull(),
    client: integer({ mode: 'number' }).notNull(),
    created_at: text('created_at').default(sql`(CURRENT_TIME)`),
    updated_at: text('updated_at').default(sql`(CURRENT_TIME)`)
});

export const ProductStocks = sqliteTable('tmp_stocks', {
    id: integer({ mode: 'number' }).primaryKey(),
    product_id: integer({ mode: 'number' }).notNull(),
    min: integer({ mode: 'number' }).notNull(),
    max: integer({ mode: 'number' }).notNull(),
    qnt: integer({ mode: 'number' }).notNull(),
    sucursal: integer({ mode: 'number' }).notNull(),
    created_at: text('created_at').default(sql`(CURRENT_TIME)`),
    updated_at: text('updated_at').default(sql`(CURRENT_TIME)`)
});

export const WharehouseSucursals = sqliteTable('tmp_sucursales', {
    id: integer({ mode: 'number' }).primaryKey(),
    name: text('name').notNull(),
    created_at: text('created_at').default(sql`(CURRENT_TIME)`),
    updated_at: text('updated_at').default(sql`(CURRENT_TIME)`)
});

export const ProductImages = sqliteTable('tmp_product_images', {
    id: integer({ mode: 'number' }).primaryKey(),
    product_id: integer({ mode: 'number' }).notNull(),
    image_id: integer({ mode: 'number' }).notNull(),
    created_at: text('created_at').default(sql`(CURRENT_TIME)`),
    updated_at: text('updated_at').default(sql`(CURRENT_TIME)`)
});

export const TProductRelations = sqliteTable('tmp_product_relations', {
    id: integer({ mode: 'number' }).primaryKey(),
    product_id: integer({ mode: 'number' }).notNull(),
    image_id: integer({ mode: 'number' }),
    brand_id: integer({ mode: 'number' }).notNull(),
    status_id: integer({ mode: 'number' }).notNull(),
    variants_id: integer({ mode: 'number' }),
    price: integer({ mode: 'number' }).notNull(),
    store: integer({ mode: 'number' }),
    dsin: integer({ mode: 'number' }).notNull(),
    product_type_id: integer({ mode: 'number' }).notNull(),
    created_at: text('created_at').default(sql`(CURRENT_TIME)`),
    updated_at: text('updated_at').default(sql`(CURRENT_TIME)`)
});

export const TGroups = sqliteTable('tmp_groups', {
    id: integer().primaryKey(),
    name: text(),
    position: integer({ mode: 'number' }).default(1),
    active: integer({ mode: 'boolean' }).default(true),
    is_allow_desc: integer({ mode: 'boolean' }).default(true),
    created_at: text('created_at').default(sql`(CURRENT_TIME)`),
    updated_at: text('updated_at').default(sql`(CURRENT_TIME)`)
});

export const TMetadatas = sqliteTable('tmp_metadatas', {
    id: integer().primaryKey(),
    name: text().notNull(),
    position: integer({ mode: 'number' }).default(1),
    active: integer({ mode: 'boolean' }).default(true),
    allow_description: integer({ mode: 'boolean' }).default(true),
    is_feature: integer({ mode: 'boolean' }).default(false),
    format: text(),
    tooltip: text(),
    id_group: integer(),
    created_at: text('created_at').default(sql`(CURRENT_TIME)`),
    updated_at: text('updated_at').default(sql`(CURRENT_TIME)`)
});

export const TPrices = sqliteTable('tmp_prices', {
    id: integer({ mode: 'number' }).primaryKey(),
    cost: integer({ mode: 'number' }).notNull(),
    added: integer({ mode: 'number' }).notNull(),
    value: integer({ mode: 'number' }).notNull(),
    asigned_by: text('asigned_by').notNull(),
    active: integer({ mode: 'boolean' }).notNull(),
    regularPrice: integer({ mode: 'number' }).notNull(),
    salePrice: integer({ mode: 'number' }).notNull(),
    offer: integer({ mode: 'boolean' }).notNull(),
    category: integer({ mode: 'number' }).notNull(),
    created_at: text('created_at').default(sql`(CURRENT_TIME)`),
    updated_at: text('updated_at').default(sql`(CURRENT_TIME)`)
});

export const TMetadataProductAsociations = sqliteTable('tmp_metadata_product_asociations', {
    id: integer({ mode: 'number' }).primaryKey(),
    metadata_id: integer({ mode: 'number' }).notNull(),
    product_id: integer({ mode: 'number' }).notNull(),
    content: text('content').notNull(),
    active: integer({ mode: 'boolean' }).notNull(),
    allowDescription: integer({ mode: 'boolean' }).notNull(),
    created_at: text('created_at').default(sql`(CURRENT_TIME)`),
    updated_at: text('updated_at').default(sql`(CURRENT_TIME)`)
});

export const TStoreInformation = sqliteTable('tmp_store_information', {
    id: integer().primaryKey(),
    name: text('name').notNull(),
    price: integer({ mode: 'number' }).notNull(),
    priceType: integer('price_type', { mode: 'number' }).notNull(),
    offer: integer({ mode: 'boolean' }).notNull(),
    status: text('status').notNull().default('1'),
    combo: text('combo'),
    bundle: text('bundle'),
    dsComputer: text('dsComputer'),
    variant: text('variant'),
    created_at: text('created_at').default(sql`(CURRENT_TIME)`),
    updated_at: text('updated_at').default(sql`(CURRENT_TIME)`)
});

export const TTagsProducts = sqliteTable('tmp_tags_products', {
    id: integer().primaryKey(),
    tag_id: integer().notNull(),
    product_id: integer().notNull(),
    created_at: text('created_at').default(sql`(CURRENT_TIME)`),
    updated_at: text('updated_at').default(sql`(CURRENT_TIME)`)
});

export const TOffers = sqliteTable('tmp_offers', {
    id: integer().primaryKey(),
    offerId: integer().notNull().default(1),
    productId: integer().notNull(),
    startDate: integer('start_date', { mode: 'timestamp' }).notNull().default(sql`(CURRENT_TIME)`),
    endDate: integer('end_date', { mode: 'timestamp' }).notNull().default(sql`(CURRENT_TIME)`),
    closeDate: integer('close_date', { mode: 'timestamp' }).notNull().default(sql`(CURRENT_TIME)`),
    status: integer().notNull().default(1),
    deletedAt: integer().notNull(),
    createdAt: text('created_at').default(sql`(CURRENT_TIME)`),
    updatedAt: text('updated_at').default(sql`(CURRENT_TIME)`)
});