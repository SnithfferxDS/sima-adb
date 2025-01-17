import { db } from '@DB/shopify/db';
import { Products } from '@DB/shopify/db/schema';
import { like, or } from 'drizzle-orm';

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
}