import { db } from '@DB/shopify/db';
import { Products, TProductRelations } from '@DB/shopify/db/schema';
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

    async addProductFromDS(product) {
        const productWeight = product.weight.split(' ');
        let wUnit = 'g', weight = 0;
        if (productWeight.length > 1) {
            wUnit = productWeight[1];
            if (wUnit === 'kg') {
                weight = Number(productWeight[0]) * 1000;
            } else if (wUnit === 'lb') {
                weight = Number(productWeight[0]) * 2.20462;
            } else if (wUnit === 'oz') {
                weight = Number(productWeight[0]) * 28.3495;
            }
        } else {
            weight = Number(productWeight[0]);
        }
        const productDb = await db.insert(Products).values({
            name: product.name,
            upc: product.upc,
            sku: product.sku,
            mpn: product.mpn,
            weight: weight,
            weightUnit: wUnit,
            warranty: product.defaultWarranty
        }).returning();
        if (productDb) {
            const productRelation = await db.insert(TProductRelations).values({
                product_id: productDb.id,
                dsin: product.id,
            }).returning();

        }
    }