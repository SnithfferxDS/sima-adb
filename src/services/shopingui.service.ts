import { db } from '@DB/shopify/db';
import {
    Products,
    TProductRelations,
    TPrices,
    ProductStocks,
    TMetadatas,
    Tags,
    Brands,
    ProductCategories,
    ProductTypes,
    MetadataProductAsociations,
    TTagsProducts
} from '@DB/shopify/db/schema';
import type { ShopinguiMetadata } from '@Types/shopingui/metadata/MetadataSchema';
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
            name: product.name,
            handle: this.generateHandle(product),
            longDescription: this.generateLongDescription(product),
            shortDescription: this.generateShortDescription(product),
            tags: JSON.stringify(product.tags),
            sku: product.sku,
        }).returning();

        if (productDb) {
            let brandId = 0;
            let categoryId = 0;
            let productTypeId = 0;
            // check if brand exists
            if (product.brand) {
                const brand = await db
                    .select()
                    .from(Brands)
                    .where(eq(Brands.name, product.brand.name));
                if (brand.length === 0) {
                    const brandDb = await db.insert(Brands).values({
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
                    .from(ProductCategories)
                    .where(eq(ProductCategories.name, product.category.name));
                if (category.length === 0) {
                    await db.insert(ProductCategories).values({
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
                    .from(ProductTypes)
                    .where(eq(ProductTypes.name, product.productType.name));
                if (productType.length === 0) {
                    await db.insert(ProductTypes).values({
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
                /* product.stocks.sucursals.map(sucursalStock => {
                    const productStocks = await db.insert(Stocks).values({
                        product_id: productDb[0].id,
                        min: product.min ?? 0,
                        max: product.max ?? 0,
                        qnt: sucursalStock.stocks[0].qnt,
                        sucursal: sucursalStock.name,
                    })
                }); */
                // const productStocks = await db.insert(Stocks).values({
                //     product_id: productDb[0].id,
                //     min: product.stocks?.min ?? 0,
                //     max: product.stocks?.max ?? 0,
                //     qnt: product.stocks?.total.HQ ?? 0,
                //     sucursal: product.stocks?.total["Santa Ana"] ?? 0,
                // }).returning();
            }
            // Adding product metadata
            if (product.metadata) {
                product.metadata.map(async metadata => {
                    if (metadata.name !== null && metadata.name !== '') {
                        const productMetadataExists = await db.select().from(TMetadatas).where(eq(TMetadatas.name, metadata.name));
                        if (!productMetadataExists) {
                            const productMetadata = await db.insert(TMetadatas).values({
                                name: metadata.name,
                                position: metadata.position,
                                active: metadata.active,
                                is_feature: metadata.isFeature,
                                tooltip: metadata.tooltip,
                                format: metadata.format,
                                allow_description: metadata.allowDescription,
                                group_id: metadata.group?.id,
                            }).returning();

                            if (productMetadata) {
                                if (metadata.value !== '') {
                                    await db.insert(MetadataProductAsociations).values({
                                        metadata_id: productMetadata[0].id,
                                        product_id: productDb[0].id,
                                        content: metadata.value,
                                        active: metadata.active,
                                        allowDescription: metadata.allowDescription,
                                    });
                                }
                            }
                        } else {
                            if (metadata.value !== '') {
                                await db.insert(MetadataProductAsociations).values({
                                    metadata_id: productMetadataExists[0].id,
                                    product_id: productDb[0].id,
                                    content: metadata.value,
                                    active: metadata.active,
                                    allowDescription: metadata.allowDescription,
                                });
                            }
                        }
                    }
                });
            }
            // saving tags if not exists
            if (product.tags) {
                product.tags.map(async tag => {
                    const tagExists = await db.select().from(Tags).where(eq(Tags.name, tag));
                    if (!tagExists) {
                        const tagDb = await db.insert(Tags).values({
                            name: tag,
                        }).returning();
                        await db.insert(TTagsProducts).values({
                            tag_id: tagDb[0].id,
                            product_id: productDb[0].id,
                        });
                    }
                    await db.insert(TTagsProducts).values({
                        tag_id: tagExists[0].id,
                        product_id: productDb[0].id,
                    });
                });
            }
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

    generateHandle(products: ShopinguiProduct) { }

    generateLongDescription(product: ShopinguiProduct) {
        if (product.tags) {
            const tags = product.tags.map(tag => `<span class="badge badge-pill badge-primary">${tag}</span>`).join('');
        }
        let contentTable = '';
        if (product.metadata) {
            let metadataString = '';
            let featureString = '';
            const groupIds = [
                ...new Set(
                    product.metadata
                        .map((m: ShopinguiMetadata) => m.group?.id)
                        .filter(Boolean),
                ),
            ];
            groupIds.map(groupId => {
                product.metadata.map(metadata => {
                    if (metadata.group?.id === groupId) {
                        if (metadata.value !== '0') {
                            metadataString += `<tr><td class='tableCellMeta'>${metadata.name}</td><td class='tableCellMeta'>${metadata.value}</td></tr>`;
                        } else {
                            featureString += `<tr><td class='tableCellMeta'>${metadata.name}</td><td class='tableCellContent'>&#10004</td></tr>`;
                        }
                    }
                });
                contentTable += `<tr><td class="tableCellGroupTitle">`;
            });
        }
        const body = `
        <div class="col-sm-8 col-offset-sm-2 col-md-10 offset-md-1 mb-3">
            <h6 class="tt-title-sub text-center"> ESPECIFICACIONES DEL PRODUCTO </h6>
            <div class="div-drop">
                <table
                    id="table001"
                    width="100%"
                    class="NEW-TABLE TableOverride-1 tab-drag"
                    style="margin: auto">
                    <tbody></tbody>
                </table>
            </div>
        </div>
        <hr>
        <div class='col-sm-8 col-offset-sm-2 col-md-10 offset-md-1 align-content-center mt-2'>
            <h6 class='tt-title-sub text-center mb-2'>BÚSQUEDAS RELACIONADAS</h6>
            <a class="btn btn-outline-primary mr-1 mb-2" href="https://digitalsolutions.com.sv/collections/"></a>
        <style>.nav-tabs .nav-item.show .nav-link, .nav-tabs .nav-link .active {background: #f5f5f5;border-bottom: 2px solid #036cbf;border-radius: 5px 5px 0px 0px;} .tableCellMeta {border: 1px solid #fbfbfb;padding: 3px 0px 3px 15px;vertical-align: middle;background-color: #fdfdfd;width: 50%;} .tableCellContent {text-align: center;border: 1px solid #fbfbfb;padding: 3px 0px 3px 15px;vertical-align: middle;background-color: #fafafa;width: 50%;} .tableCellGroupTitle {border: 1px solid #f8f8f8;padding: 3px 0px 3px 5px;vertical-align: middle;background-color: #f7f7f7;font-weight: 800;text-transform: uppercase;text-align: center;} .tableCellGroupTitleContent {border: 1px solid #fbfbfb;padding: 3px 0px 3px 15px;vertical-align: middle;background-color: #fafafa;width: 50%;}</style>`;
    }
}