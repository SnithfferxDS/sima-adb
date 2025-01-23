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
    TMetadataProductAsociations,
    TTagsProducts
} from '@DB/shopify/db/schema';
import type { ShopinguiBrand } from '@Types/shopingui/brands/schema';
import type { ShopinguiCategory } from '@Types/shopingui/categories/schema';
import type { ShopinguiMetadata } from '@Types/shopingui/metadata/MetadataSchema';
import type { ShopinguiProductPrice } from '@Types/shopingui/product_price/schema';
import type { ShopinguiProductType } from '@Types/shopingui/product_types/shcema';
import type { ShopinguiProduct } from '@Types/shopingui/products/ProductSchema';
import { like, or, eq, and } from 'drizzle-orm';
import slugify from 'slugify';

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
        // console.log(product);
        if (!product.upc) {
            return null;
        }
        const productExists = await db.select().from(Products).where(eq(Products.upc, product.upc));
        if (productExists.length > 0) {
            return productExists;
        }
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
            name: this.generateTitle(product),
            handle: this.generateHandle(product),
            longDescription: this.generateLongDescription(product),
            shortDescription: this.generateShortDescription(product),
            tags: JSON.stringify(product.tags),
            sku: product.sku as string,
            mpn: product.mpn as string,
            upc: product.upc as string,
            ean: product.upc as string,
            weight: weight,
            weightUnit: wUnit,
            warranty: product.defaultWarranty as number
        }).returning();

        if (productDb) {
            let brandId = 0;
            let categoryId = 0;
            let productTypeId = 0;
            let productPriceId = 0;
            // check if brand exists
            if (product.brand) {
                const brandDb = await this.saveBrand({
                    id: null,
                    name: product.brand.name as string,
                    description: null, logo: null, active: true, createdAt: null, updatedAt: null
                });
                if (brandDb) {
                    brandId = brandDb.id;
                }
            }
            // Check if Category exists
            if (product.category) {
                const category = await this.saveCategory({
                    name: product.category.name,
                    client: product.category.client || 4,
                    id: null, slug: null, description: null, parents: null,
                    active: true, createdAt: null, updatedAt: null
                });
                if (category) {
                    categoryId = category.id;
                }
            }
            // Check if ProductType exists
            if (product.productType && product.productType.name) {
                const productType = await this.saveProductType({
                    name: product.productType.name,
                    category: categoryId,
                    id: null, createdAt: null, updatedAt: null
                });
                if (productType) {
                    productTypeId = productType.id;
                }
            }
            // Adding product price
            if (product.price) {
                const productPriceExists = await this.saveProductPrice(
                    productDb[0].id, {
                    cost: product.price.cost,
                    added: {
                        value: product.price.added?.value ?? 0,
                        asignedBy: product.price.added?.asignedBy ?? 'Sin Información'
                    },
                    value: product.price.value,
                    category: product.priceCategory ?? 4,
                    store: {
                        regular_price: product.store.price.value,
                        sale_price: product.store.price.value,
                        offer: product.store.price.offer,
                        price_category: product.priceCategory ?? 4
                    },
                    active: true
                });
                if (productPriceExists) {
                    productPriceId = productPriceExists.id;
                }
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
                        const productMetadataExists = await this.saveProductMetadata(productDb[0].id, metadata);
                    }
                });
            }
            // saving tags if not exists
            if (product.tags) {
                product.tags.map(async (tag: string) => {
                    const tagDb = await this.saveTags(tag);
                    if (tagDb) {
                        await this.relateProductTags(productDb[0].id, tagDb.id);
                    }
                });
            }
            // Product Relations
            const productRelations = await this.saveProductRelations(productDb[0].id,
                {
                    brand: brandId,
                    category: categoryId,
                    product_type: productTypeId,
                    price: productPriceId,
                    store: (product.store.id as unknown) as number,
                    dsin: product.id,
                });
            return productDb[0];
        }
        return null;
    }

    /**
     * Extracts the weight and unit from a given weight string.
     *
     * @param weight - A string representing the weight, which may include a unit 
     *                 (e.g., "2.1kg", "2.1lb", "2.1oz", "2.1g", or "2.1").
     *                 If null or undefined, the function returns a default weight of 0.0 grams.
     * @returns An object containing:
     *          - weight: A number representing the extracted weight.
     *          - unit: A string representing the unit of the weight (e.g., "kg", "lb", "oz", "g").
     *                 If no unit is provided, defaults to "g".
     */
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

    /**
     * Generates a slug (handle) for a product based on its name, brand and sku/mpn.
     *
     * @param product - The product to generate the slug for.
     * @returns The generated slug.
     */
    generateHandle(product: ShopinguiProduct) {
        const commonName = product.commonName[0].name;
        const brand = product.brand?.name;
        let skuMpn = '';
        if (product.sku) {
            skuMpn = product.sku;
        } else {
            if (product.mpn) {
                skuMpn = product.mpn;
            }
        }
        const title = `${commonName} ${brand} ${skuMpn}`;
        return slugify(title);
    }

    generateLongDescription(product: ShopinguiProduct) {
        let tags = '';
        if (product.tags) {
            tags = product.tags.map(tag => {
                const tagSlug = slugify(tag);
                return `<a class="btn btn-outline-primary mr-1 mb-2" href="${tagSlug}">
                    <span class="badge badge-pill badge-primary">${tag}</span>
                </a>`;
            }).join('');
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
                let groupName = '';
                product.metadata.map(metadata => {
                    if (metadata.group?.id === groupId) {
                        if (metadata.value !== '0') {
                            metadataString += `<tr><td class="tableCellMeta">${metadata.name}</td><td class="tableCellMeta">${metadata.value}</td></tr>`;
                        } else {
                            featureString += `<tr><td class="tableCellMeta">${metadata.name}</td><td class="tableCellContent">&#10004</td></tr>`;
                        }
                        groupName = metadata.group.name as string;
                    }
                });
                contentTable += `<tr><td class="tableCellGroupTitle">${groupName}</td><td class="tableCellGroupTitleContent"></td>${metadataString}${featureString}</tr>`;
            });
        }
        const commonName = product.commonName[0].name;
        const commonNameSlug = slugify(commonName);
        const brand = product.brand?.name;
        const brandSlug = slugify(`${commonName} ${brand}`);

        return `<style>.nav-tabs .nav-item.show .nav-link, .nav-tabs .nav-link .active {background: #f5f5f5;border-bottom: 2px solid #036cbf;border-radius: 5px 5px 0px 0px;} .tableCellMeta {border: 1px solid #fbfbfb;padding: 3px 0px 3px 15px;vertical-align: middle;background-color: #fdfdfd;width: 50%;} .tableCellContent {text-align: center;border: 1px solid #fbfbfb;padding: 3px 0px 3px 15px;vertical-align: middle;background-color: #fafafa;width: 50%;} .tableCellGroupTitle {border: 1px solid #f8f8f8;padding: 3px 0px 3px 5px;vertical-align: middle;background-color: #f7f7f7;font-weight: 800;text-transform: uppercase;text-align: center;} .tableCellGroupTitleContent {border: 1px solid #fbfbfb;padding: 3px 0px 3px 15px;vertical-align: middle;background-color: #fafafa;width: 50%;}</style>
        <div class="col-sm-8 col-offset-sm-2 col-md-10 offset-md-1 mb-3">
        <h6 class="tt-title-sub text-center"> ESPECIFICACIONES DEL PRODUCTO </h6>
        <div class="div-drop"><table id="table001" width="100%" class="NEW-TABLE TableOverride-1 tab-drag" style="margin: auto"><tbody>${contentTable}</tbody></table></div></div><hr>
        <div class='col-sm-8 col-offset-sm-2 col-md-10 offset-md-1 align-content-center mt-2'>
        <h6 class='tt-title-sub text-center mb-2'>BÚSQUEDAS RELACIONADAS</h6>
        <a class="btn btn-outline-primary mr-1 mb-2" href="https://digitalsolutions.com.sv/collections/${commonNameSlug}">${commonName}</a>
        <a class="btn btn-outline-primary mr-1 mb-2" href="https://digitalsolutions.com.sv/collections/${brandSlug}">${brand}</a>${tags}</div>`;
    }

    generateShortDescription(product: ShopinguiProduct) {
        /* 
        <p>
            <strong>Almacenamiento</strong>
            <br>&nbsp;&nbsp;&nbsp;&nbsp;&bull;&nbsp;&nbsp;<em>256GB SATA</em>
            <br><br>
        </p>
        */
        let metadataString = '';
        let featureString = '';
        let htmlString = '<p>';
        const groupIds = [
            ...new Set(
                product.metadata
                    .map((m: ShopinguiMetadata) => m.group?.id)
                    .filter(Boolean),
            ),
        ];
        const groupIdsLength = groupIds.length;
        groupIds.map((groupId, index) => {
            let groupName = '';
            product.metadata.map(metadata => {
                if (metadata.group?.id === groupId) {
                    if (metadata.value !== '0') {
                        metadataString += `<br>&nbsp;&nbsp;&nbsp;&nbsp;&bull;&nbsp;&nbsp;<strong>${metadata.name}</strong> : <em>${metadata.value}</em>`;
                    } else {
                        featureString += `<br>&nbsp;&nbsp;&nbsp;&nbsp;&bull;&nbsp;&nbsp;<strong>${metadata.name}</strong> : <em>&#10004</em>`;
                    }
                    groupName = `<strong>${metadata.group?.name}</strong>`;
                }
            });
            htmlString += `<strong>${groupName}</strong><br>${metadataString}${featureString}`;
            if (index < groupIdsLength) {
                htmlString += `<br><br>`;
            }
        });
        htmlString += '</p>';
        return htmlString;
    }

    generateTitle(product: ShopinguiProduct) {
        const commonName = product.commonName[0].name;
        const brand = product.brand?.name;
        const skuMpn = product.sku ?? product.mpn;
        return `${commonName} ${brand} ${skuMpn}`;
    }

    async saveBrand(brand: ShopinguiBrand) {
        const brandExists = await db.select()
            .from(Brands)
            .where(eq(Brands.name, brand.name as string));
        if (brandExists.length === 0) {
            const brandDb = await db.insert(Brands).values({
                name: brand.name as string,
            }).returning();
            if (brandDb.length > 0) {
                return brandDb[0];
            }
        }
        return brandExists[0];
    }

    async saveCategory(category: ShopinguiCategory) {
        const categoryExists = await db.select()
            .from(ProductCategories)
            .where(eq(ProductCategories.name, category.name as string));
        if (categoryExists.length === 0) {
            const categoryDb = await db.insert(ProductCategories)
                .values({
                    name: category.name as string,
                    client: category.client as number,
                }).returning();
            if (categoryDb.length > 0) {
                return categoryDb[0];
            }
        }
        return categoryExists[0];
    }

    async saveProductType(productType: ShopinguiProductType) {
        const productTypeExists = await db.select()
            .from(ProductTypes)
            .where(eq(ProductTypes.name, productType.name as string));
        if (productTypeExists.length === 0) {
            const productTypeDb = await db.insert(ProductTypes)
                .values({
                    name: productType.name as string,
                    category: productType.category as number,
                }).returning();
            if (productTypeDb.length > 0) {
                return productTypeDb[0];
            }
        }
        return productTypeExists[0];
    }

    async saveProductPrice(product: number, price: ShopinguiProductPrice) {
        const productPriceExists = await db.select({
            id: TProductRelations.price
        })
            .from(TProductRelations)
            .where(eq(TProductRelations.product_id, product));
        if (productPriceExists.length === 0) {
            const productPrice = await db.insert(TPrices).values({
                cost: price.cost,
                added: price.added.value,
                value: price.value,
                asigned_by: price.added.asignedBy,
                active: true,
                category: price.category,
                regularPrice: price.store.regular_price,
                salePrice: price.store.sale_price,
                offer: price.store.offer,
            }).returning();
            if (productPrice.length > 0) {
                return productPrice[0];
            }
        }
        return productPriceExists[0];
    }

    async updateProductPrice(price: number, data: ShopinguiProductPrice) {
        const productPriceUpdated = await db.update(TPrices)
            .set({
                cost: data.cost,
                added: data.added.value,
                value: data.value,
                asigned_by: data.added.asignedBy,
                active: true,
                category: data.category,
                regularPrice: data.store.regular_price,
                salePrice: data.store.sale_price,
                offer: data.store.offer,
            }).where(eq(TPrices.id, price));
        if (productPriceUpdated) {
            return true;
        }
        return false;
    }

    async saveTags(tag: string) {
        const tagExists = await db.select().from(Tags).where(eq(Tags.name, tag));
        if (!tagExists) {
            const tagDb = await db.insert(Tags).values({
                name: tag,
            }).returning();
            return tagDb[0];
        }
        return tagExists[0];
    }

    async relateProductTags(product: number, tag: number) {
        return await db.insert(TTagsProducts).values({
            tag_id: tag,
            product_id: product,
        });
    }

    async saveProductRelations(product: number, relations: {
        brand: number,
        category: number,
        product_type: number,
        price: number,
        store: number,
        dsin: number,
    }) {
        const productRelationsExists = await db.select().from(TProductRelations).where(eq(TProductRelations.product_id, product));
        if (productRelationsExists.length === 0) {
            const productRelations = await db.insert(TProductRelations).values({
                product_id: product,
                brand_id: relations.brand,
                product_type_id: relations.product_type,
                price: relations.price,
                store: relations.store,
                dsin: relations.dsin,
                status_id: 1,
            }).returning();
            return productRelations[0];
        }
        return productRelationsExists[0];
    }

    // async saveProductStocks(product: number, stocks: ShopinguiProductStocks) {
    //     const productStocksExists = await db.select().from(Stocks).where(eq(Stocks.product_id, product));
    //     if (productStocksExists.length === 0) {
    //         const productStocks = await db.insert(Stocks).values({
    //             product_id: product,
    //             min: stocks.min,
    //             max: stocks.max,
    //             qnt: stocks.qnt,
    //             sucursal: stocks.sucursal,
    //         }).returning();
    //         return productStocks[0];
    //     }
    //     return productStocksExists[0];
    // }

    async saveProductMetadata(product: number, metadata: ShopinguiMetadata) {
        const productMetadataExists = await db.select().from(TMetadatas).where(eq(TMetadatas.name, metadata.name as string));
        if (productMetadataExists.length === 0) {
            const productMetadata = await db.insert(TMetadatas).values({
                name: metadata.name as string,
                position: metadata.position as number,
                active: metadata.active == 1 ? true : false,
                is_feature: metadata.isFeature == 1 ? true : false,
                tooltip: metadata.tooltip as string,
                format: metadata.format as string,
                id_group: parseInt(metadata.group?.id as string),
            }).returning();

            if (productMetadata) {
                if (metadata.value !== '') {
                    await this.saveProductMetadataRelations(
                        productMetadata[0].id as number,
                        product,
                        metadata.value as string,
                        metadata.active == 1 ? true : false,
                        metadata.allowDescription == 1 ? true : false);
                }
            }
            return productMetadata[0];
        }
        return productMetadataExists[0];
    }

    async saveProductMetadataRelations(metadata: number, product: number, content: string, active: boolean, allowDescription: boolean) {
        const productMetadataRelationExists = await db.select()
            .from(TMetadataProductAsociations)
            .where(and(
                eq(TMetadataProductAsociations.metadata_id, metadata),
                eq(TMetadataProductAsociations.product_id, product),
            ));
        if (productMetadataRelationExists.length === 0) {
            if (content !== '') {
                await db.insert(TMetadataProductAsociations).values({
                    metadata_id: metadata,
                    product_id: product,
                    content: content,
                    active: active,
                    allowDescription: allowDescription,
                });
            }
        }
    }
}