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
    upc: text(),
    ean: text(),
    isbn: text(),
    weight: real(),
    weightUnit: text('weight_unit'),
    width: real(),
    height: real(),
    length: real(),
    innerDiameter: real('inner_diameter'),
    outerDiameter: real('outer_diameter'),
    measureUnit: text('measure_unit'),
    customizable: integer({ mode: 'boolean' }),
    customizableFields: text('customizable_fields', { mode: 'json' }),
    createdAt: text('created_at').default(sql`(CURRENT_TIME)`),
    updatedAt: text('updated_at').default(sql`(CURRENT_TIME)`),
    deletedAt: text('deleted_at').default(sql`(CURRENT_TIME)`)
});