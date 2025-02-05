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
    TTagsProducts,
    ProductImages,
    Status,
    Wharehouses,
    CommonNames,
    TSucursals,
    Groups
} from '@DB/shopify/db/schema';
import type { ShopinguiBrand } from '@Types/shopingui/brands/schema';
import type { ShopinguiCategory } from '@Types/shopingui/categories/schema';
import type { ShopinguiCommonName } from '@Types/shopingui/common_name';
import type { ShopinguiMetadata, ShopinguiMetadatas } from '@Types/shopingui/metadata/MetadataSchema';
import type { ShopinguiProductPrice } from '@Types/shopingui/product_price/schema';
import type { ShopinguiProductType } from '@Types/shopingui/product_types/shcema';
import type { ShopinguiProduct, ShopinguiProductStocks } from '@Types/shopingui/products/ProductSchema';
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
        if (!product.upc) {
            return null;
        }
        let productId = null;
        const productExists = await db.select().from(Products).where(eq(Products.upc, product.upc as string));
        if (productExists.length > 0) {
            productId = productExists[0].id;
        }
        const productWeight = this.extractWeight(product.weight);
        // console.log("Product Weight: ", productWeight);
        let wUnit = productWeight.unit, weight = isNaN(productWeight.weight) ? 0 : productWeight.weight;
        if (wUnit === 'kg') {
            weight = Number(weight) * 1000;
        } else if (wUnit === 'lb') {
            weight = Number(weight) * 2.20462;
        } else if (wUnit === 'oz') {
            weight = Number(weight) * 28.3495;
        } else {
            weight = Number(weight);
        }
        // console.log("weight", weight);
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
            weight: 0.0,
            weightUnit: "g",
            warranty: product.defaultWarranty as number
        }).returning();

        if (productDb.length > 0) {
            productId = productDb[0].id;
        }
        let brandId = 0;
        let categoryId = 0;
        let productTypeId = 0;
        let productPriceId = 0;
        let productStocks: number[] = [];
        let productCommonName: number[] = [];
        // check if brand
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
        if (product.price !== null) {
            const productPriceExists = await this.saveProductPrice(
                productId as number, {
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
            productStocks = await this.saveProductStocks(productId as number, product.stocks);
        }
        
        // Adding product common names
        if (product.commonName) {
            productCommonName = await this.saveProductCommonName(product.commonName);
        }
        // Adding product metadata
        if (product.metadata) {
            await this.saveProductMetadata(productId as number, product.metadata);
        }
        // saving tags if not exists
        if (product.tags) {
            await this.saveTags(product.id, product.tags);
        }
        // Product Relations
        const productRelations = await this.saveProductRelations(productId as number, {
            brand: brandId,
            category: categoryId,
            product_type: productTypeId,
            price: productPriceId,
            store: (product.store.id as unknown) as string,
            dsin: product.id,
            commonNames: productCommonName,
            stocks: productStocks
        });
    }

    /**
     * Retrieves a list of products with their respective information, including their short description, image URL, price, brand, category, product type, and store information.
     * 
     * @param page - The page number to retrieve. Defaults to 1.
     * @param limit - The number of products to retrieve per page. Defaults to 100.
     * @returns A list of products with the specified information.
     */
    async getAllProducts(page: number = 1, limit: number = 100) {
        return await db.select({
            id: Products.id,
            dsin: TProductRelations.dsin,
            name: Products.name,
            short_desc: Products.shortDescription,
            image_url: ProductImages.url,
            price: TPrices.regularPrice,
            brand: Brands.name,
            category: ProductCategories.name,
            product_type: ProductTypes.name,
            store: {
                id: TProductRelations.store,
                price: TPrices.regularPrice,
                offer: TPrices.offer,
                status: Status.name,
            }
        }).from(Products)
            .leftJoin(TProductRelations, eq(Products.id, TProductRelations.product_id))
            .leftJoin(Brands, eq(Brands.id, TProductRelations.brand_id))
            .leftJoin(ProductTypes, eq(ProductTypes.id, TProductRelations.product_type_id))
            .leftJoin(TPrices, eq(TPrices.id, TProductRelations.price))
            .leftJoin(ProductImages, eq(ProductImages.id, TProductRelations.image_id))
            .leftJoin(Status, eq(Status.id, TProductRelations.status_id))
            .leftJoin(ProductCategories, eq(ProductCategories.id, TProductRelations.category_id))
            .limit(limit).offset((page - 1) * limit);
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
        if (weight == null || weight == undefined || weight == '') return { weight: 0.0, unit: 'g' };
        // weight: "2.1kg" || "2.1lb" || "2.1oz" || "2.1g" || "2.1" || "2.1 lb"
        // substract from the last two characters
        const lastChar = weight.substring(weight.length - 1, weight.length);
        // console.log("lastChar", lastChar);
        const pLastChar = weight.substring(weight.length - 2, weight.length);
        // console.log("pLastChar", pLastChar);
        if (isNaN(Number(lastChar))) {
            if (isNaN(Number(pLastChar))) {
                u += pLastChar + lastChar;
                w = Number(weight.substring(weight.length - 2, weight.length - 1).trim());
            } else {
                u += lastChar;
                w = Number(weight.substring(weight.length - 1, weight.length).trim());
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
        let commonName = 'Sin Nombre Común';
        let common: ShopinguiCommonName | null = product.commonName.length > 0 ? product.commonName[0] : null;
        if (common !== null) {
            commonName = common.name ?? 'Sin Nombre Común';
        }
        const brand = product.brand?.name ?? '';
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
        let commonName = 'Sin Nombre Común';
        let common: ShopinguiCommonName | null = product.commonName.length > 0 ? product.commonName[0] : null;
        if (common !== null) {
            commonName = common.name ?? 'Sin Nombre Común';
        }
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
        let commonName = 'Sin Nombre Común';
        let common: ShopinguiCommonName | null = product.commonName.length > 0 ? product.commonName[0] : null;
        if (common !== null) {
            commonName = common.name ?? 'Sin Nombre Común';
        }
        const brand = product.brand?.name ?? '';
        let skuMpn = '';
        if (product.sku) {
            skuMpn = product.sku;
        } else {
            if (product.mpn) {
                skuMpn = product.mpn;
            }
        }
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

    async saveTags(product: number, tags: string[]) {
        const result = await Promise.all(tags.map(async tag => {
            const tagExists = await db
                .select()
                .from(Tags)
                .where(eq(Tags.name, tag));
            if (tagExists.length === 0) {
                const tagDb = await db.insert(Tags).values({
                    name: tag,
                }).returning();
                if (tagDb.length > 0) {
                    await this.relateProductTags(product, tagDb[0].id);
                    return tagDb[0];
                }
            } else {
                const tagData = tagExists[0];
                await this.relateProductTags(product, tagData.id);
                return tagData;
            }
        }));
        return result;
    }

    async relateProductTags(product: number, tag: number) {
        // console.log("tag", tag);
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
        store: string,
        dsin: number,
        commonNames: number[],
        stocks: number[],
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
                status_id: 5,
                category_id: relations.category,
                commonNames: JSON.stringify(relations.commonNames),
                stocks: JSON.stringify(relations.stocks),
            }).returning();
            return productRelations[0];
        }
        return productRelationsExists[0];
    }

    async saveProductMetadata(product: number, metadatas: ShopinguiMetadatas) {
        const result = await Promise.all(metadatas.map(async metadata => {
            /* {
                "id": 361,
                "name": "Serie",
                "value": "TM-U",
                "position": 2,
                "active": 1,
                "isFeature": 0,
                "format": null,
                "tooltip": null,
                "allowDescription": 1,
                "group": {
                    "id": "22",
                    "name": "Información del Producto",
                    "order": 1
                }
            }
                
            id: integer().primaryKey(),
            name: text().notNull(),
            position: integer({ mode: 'number' }).default(1),
            active: integer({ mode: 'boolean' }).default(true),
            allow_description: integer({ mode: 'boolean' }).default(true),
            is_feature: integer({ mode: 'boolean' }).default(false),
            format: text(),
            tooltip: text(),*/
            console.log("Metadata: ", metadata);
            const metadataExists = await db
                .select()
                .from(TMetadatas)
                .where(eq(TMetadatas.name, metadata.name as string));
            if (metadataExists.length === 0) {
                const groupDb = await this.saveGroup({
                    name: metadata.group?.name as string,
                    position: metadata.group?.order ?? 1
                });
                if (metadata.name !== null) {
                    const productMetadata = await db
                        .insert(TMetadatas).values({
                            name: metadata.name,
                            id_group: groupDb.id,
                            position: metadata.position ?? 1,
                            active: metadata.active == 1 ? true : false,
                            allow_description: metadata.allowDescription == 1 ? true : false,
                            is_feature: metadata.isFeature == 1 ? true : false,
                            format: metadata.format,
                            tooltip: metadata.tooltip
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

            } else {
                if (metadata.value !== '') {
                    await this.saveProductMetadataRelations(
                        metadataExists[0].id as number,
                        product,
                        metadata.value,
                        metadata.active == 1 ? true : false,
                        metadata.allowDescription == 1 ? true : false);
                }
            }
        }));
        return result;
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

    async saveProductCommonName(commonNames: ShopinguiCommonName[]) {
        const commonNamesProduct: number[] = [];
        commonNames.map(async commonName => {
            const productCommonNameExists = await db.select()
                .from(CommonNames)
                .where(eq(CommonNames.name, commonName.name as string));
            if (productCommonNameExists.length === 0) {
                const productCommonName = await db.insert(CommonNames).values({
                    name: commonName.name as string,
                    position: commonName.position as number,
                    storeId: commonName.storeCategory?.storeId as string,
                    storeName: commonName.storeCategory?.name as string,
                    handle: commonName.storeCategory?.handle as string,
                    isLinea: commonName.storeCategory?.isLinea as number > 0 ? true : false,
                }).returning({
                    id: CommonNames.id
                });
                if (productCommonName.length > 0) {
                    commonNamesProduct.push(productCommonName[0].id);
                }
            } else {
                commonNamesProduct.push(productCommonNameExists[0].id);
            }
        });
        return commonNamesProduct;
    }

    async saveProductStocks(product: number, stocks: ShopinguiProductStocks) {
        const stocksDb: number[] = [];
        stocks.sucursals.map(async sucursal => {
            // console.log("Sucursal: ", sucursal.name);
            // console.log("Stocks: ", sucursal.stocks);
            sucursal.stocks.map(async warehouseStock => {
                const sucursalDb = await this.saveSucursal(sucursal.name);
                const warehouse = await this.saveWarehouse(warehouseStock.name, sucursal.name);
                const productStocksExists = await db.select()
                    .from(ProductStocks)
                    .where(
                        and(
                            eq(ProductStocks.product_id, product),
                            eq(ProductStocks.sucursal, sucursalDb.id),
                            eq(ProductStocks.warehouse, warehouse.id),
                        ));
                if (productStocksExists.length === 0) {
                    // console.log("Product Stocks Insert: ", warehouseStock);
                    const productStocks = await db.insert(ProductStocks).values({
                        product_id: product,
                        min: 1,
                        max: warehouseStock.stock * 10,
                        current: warehouseStock.stock,
                        last: 0,
                        sucursal: sucursalDb.id,
                        warehouse: warehouse.id
                    }).returning({ id: ProductStocks.id });
                    if (productStocks.length > 0) {
                        stocksDb.push(productStocks[0].id);
                    }
                } else {
                    //         console.log("Product Stocks: ", productStocksExists);
                    //         console.log("Product Stock updated: ", warehouseStock);
                    const productStoctUpdated = await db.update(ProductStocks).set({
                        current: warehouseStock.stock,
                        last: productStocksExists[0].current
                    }).where(eq(ProductStocks.id, productStocksExists[0].id)).returning({ id: ProductStocks.id });
                    if (productStoctUpdated.length > 0) {
                        stocksDb.push(productStoctUpdated[0].id);
                    }
                }
            });
        });
        return stocksDb;
    }

    async saveWarehouse(name: string, sucursal: string) {
        const sucursalDb = await db.select({ id: TSucursals.id }).from(TSucursals).where(eq(TSucursals.name, sucursal));
        let sucursalId = sucursalDb[0].id;

        if (sucursalDb.length === 0) {
            sucursalId = (await this.saveSucursal(sucursal)).id;
        }
        const warehouseExists = await db.select()
            .from(Wharehouses)
            .where(eq(Wharehouses.name, name));
        if (warehouseExists.length === 0) {
            const warehouse = await db.insert(Wharehouses).values({
                name: name as string,
                sucursal: sucursalId
            }).returning();
            if (warehouse.length > 0) {
                return warehouse[0];
            }
        }
        return warehouseExists[0];
    }

    async saveSucursal(name: string) {
        const sucursalExists = await db.select()
            .from(TSucursals)
            .where(eq(TSucursals.name, name));
        if (sucursalExists.length === 0) {
            const sucursal = await db.insert(TSucursals).values({
                name: name,
            }).returning();
            if (sucursal.length > 0) {
                return sucursal[0];
            }
        }
        return sucursalExists[0];
    }

    async saveGroup(group: {
        name: string;
        position: number;
    }) {
        const groupExists = await db.select()
            .from(Groups)
            .where(eq(Groups.name, group.name as string));
        if (groupExists.length === 0) {
            const groupDb = await db.insert(Groups).values({
                name: group.name,
                position: group.position
            }).returning();
            if (groupDb.length > 0) {
                return groupDb[0];
            }
        }
        return groupExists[0];
    }
}