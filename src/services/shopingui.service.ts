import { db } from '@DB/shopify/db';
import { Products, TProductRelations, TPrices, Stocks, TMetadatas, Tags, brands, ProductCategory, ProductType } from '@DB/shopify/db/schema';
import type { ShopinguiProduct } from '@Types/shopingui/products/ProductSchema';
import { like, or, eq } from 'drizzle-orm';

export class ShopinguiService {
    async search(terms: string) {
        return await db.select().from(Products).where(
            or(
                like(Products.name, `%${terms}%`),
                like(Products.sku, `%${terms}%`),
                like(Products.mpn, `%${terms}%`),
                like(Products.upc, `%${terms}%`),
            )
        );
    }

    async getDsinProduct(product: number) {
        const exists = await db.select().from(TProductRelations).where(eq(TProductRelations.product_id, product));
        if (exists.length > 0) {
            return await db.select().from(Products).where(eq(Products.id, exists[0].product_id));
        }
        return null;
    }

    async addProductFromDS(product: ShopinguiProduct) {
        const productWeight = this.extractWeight(product.weight);
        let wUnit = productWeight.unit, weight = productWeight.weight;
        if (wUnit === 'kg') {
            weight = Number(productWeight) * 1000;
        } else if (wUnit === 'lb') {
            weight = Number(productWeight) * 2.20462;
        } else if (wUnit === 'oz') {
            weight = Number(productWeight) * 28.3495;
        } else {
            weight = Number(productWeight);
        }
        // Insert product information
        const productDb = await db.insert(Products).values({
            name: product.name || '',
            upc: product.upc,
            sku: product.sku,
            mpn: product.mpn || null,
            weight: weight || null,
            weightUnit: wUnit || null,
            warranty: product.defaultWarranty || null,
            tags: JSON.stringify(product.tags || []),
        }).returning();

        if (productDb) {
            let brandId = 0;
            let categoryId = 0;
            let productTypeId = 0;
            // check if brand exists
            if (product.brand) {
                const brand = await db
                    .select()
                    .from(brands)
                    .where(eq(brands.name, product.brand.name));
                if (brand.length === 0) {
                    const brandDb = await db.insert(brands).values({
                        name: product.brand.name
                    }).returning();
                    brandId = brandDb[0].id;
                }
                brandId = brand[0].id;
            }
            // Check if Category exists
            if (product.category) {
                const category = await db
                    .select()
                    .from(ProductCategory)
                    .where(eq(ProductCategory.name, product.category.name));
                if (category.length === 0) {
                    await db.insert(ProductCategory).values({
                        name: product.category.name,
                        client: product.category.client || 4
                    }).returning();
                    categoryId = category[0].id;
                }
                categoryId = category[0].id;
            }
            // Check if ProductType exists
            if (product.productType && product.productType.name) {
                const productType = await db
                    .select()
                    .from(ProductType)
                    .where(eq(ProductType.name, product.productType.name));
                if (productType.length === 0) {
                    await db.insert(ProductType).values({
                        name: product.productType.name,
                        category: categoryId
                    }).returning();
                    productTypeId = productType[0].id;
                }
                productTypeId = productType[0].id;
            }
            // Adding product price
            if (product.price) {
                const dsPrice = product.price;
                const productPrice = await db.insert(TPrices).values({
                    cost: dsPrice.cost,
                    added: dsPrice.added?.value ?? 0,
                    value: dsPrice.value,
                    asigned_by: dsPrice.added?.asignedBy ?? 'Sin Información',
                    active: true,
                }).returning();
            }
            // Adding product stocks
            if (product.stocks) {
                product.stocks.sucursal
                const productStocks = await db.insert(Stocks).values({
                    product_id: productDb[0].id,
                    min: product.stocks?.min ?? 0,
                    max: product.stocks?.max ?? 0,
                    qnt: product.stocks?.total.HQ ?? 0,
                    sucursal: product.stocks?.total["Santa Ana"] ?? 0,
                }).returning();
                // Adding product metadata
                const productMetadata = await db.insert(TMetadatas).values({
                    name: product.metadata.name,
                    value: product.metadata.value,
                    position: product.metadata.position,
                    active: product.metadata.active,
                    isFeature: product.metadata.isFeature,
                    format: product.metadata.format,
                    tooltip: product.metadata.tooltip,
                    id_group: product.metadata.group.id,
                }).returning();
                // Adding product tags
                const productTags = await db.insert(Tags).values({
                    name: product.tags[0],
                }).returning();
                // Adding relations
                const productRelation = await db.insert(TProductRelations).values({
                    product_id: productDb[0].id,
                    dsin: product.id,
                    brand_id: brandId,
                    product_type_id: productTypeId,
                    status_id: 1,
                }).returning();

            }
        }

        extractWeight(weight: string | null | undefined) {
            let w = 0, u = '';
            if (!weight) return { weight: 0.0, unit: 'g' };
            // weight: "2.1kg" || "2.1lb" || "2.1oz" || "2.1g" || "2.1"
            // substract from the last two characters
            const lastChar = weight.substring(-1, -2);
            const pLastChar = weight.substring(-2, -3);
            if (isNaN(Number(lastChar))) {
                if (isNaN(Number(pLastChar))) {
                    u.concat(pLastChar, lastChar);
                    w = Number(weight.substring(-2));
                } else {
                    u.concat(lastChar);
                    w = Number(weight.substring(-1));
                }
            } else {
                if (isNaN(Number(pLastChar)) && pLastChar === '.') {
                    u = 'g';
                    w = Number(weight);
                } else {
                    u = 'g';
                    w = Number(weight);
                }
            }
            return { weight: w, unit: u };
        }
    }