import type { APIRoute } from "astro";
import { db, eq, inArray } from 'astro:db';
import { Metadata, MetadataRelations, Group, CommonName } from 'astro:db';

// Define the metadata array type at the start
interface MetadataItem {
    id: number;
    name: string;
    position: number,
    active: boolean,
    allow_description: boolean,
    is_feature: boolean,
    format: string,
    tooltip: string,
    id_common_name: number,
    id_group: number,
}

interface MetaRelationItem {
    id: number;
    metadata_id: number;
    common_names: string|unknown;
    categories: string|unknown;
    product_types: string|unknown;
}

export const POST:APIRoute = async ({ request }) => {
    try {
        const formData = await request.json();
        /* {"action":"common","id":"","common_name":"2","categories":"[\"1\",\"3\"]"} */
        // Ids of the metadata
        const metadata:MetadataItem[] = [];
        const relations = await db.select()
            .from(MetadataRelations)
            .all();
        if (formData.action == "common") {
            const {id, common_name, categories } = formData;
            if (!id || typeof id !== 'string' || id.trim() === '') {
                if (!common_name || typeof common_name !== 'string' || common_name.trim() === '') {
                    if (!categories || typeof categories !== 'string' || categories.trim() === '') {
                        return new Response('A Metadata, or Common Name, or Product Type identifier is required', { status: 400 });
                    }
                    //return new Response('A Metadata, or Common Name identifier is required', { status: 400 });
                }
                //return new Response('A Metadata identifier is required', { status: 400 });
            }
                     
            relations.forEach(relation => {
                const commonNames = JSON.parse(relation.common_names as string);
                const categoriesR = JSON.parse(relation.categories as string);
                if (commonNames) {
                    if (commonNames.includes(common_name)) {
                        metadata.push(...relation);
                    }
                }
                if (categoriesR) {
                    for (let x = 0; x < categoriesR.lenght; x++) {
                        let category = Number(categoriesR[x]);
                        for (let i = 0; i < categories.length; i++) {
                            let categoryId = Number(categories[i]);
                            if (categoryId === category) {
                                metadata.push(...relation);
                            }
                        }
                    };
                }
            });
            console.log(metadata);
            
        } else {
            const { id, common_name, categories, product_type } = formData;
            if (!id || typeof id !== 'string' || id.trim() === '') {
                if (!common_name || typeof common_name !== 'string' || common_name.trim() === '') {
                    if (!categories || typeof categories !== 'string' || categories.trim() === '') {
                        if (!product_type || typeof product_type !== 'string' || product_type.trim() === '') {
                            return new Response('A Metadata, or Common Name, or Product Type identifier is required', { status: 400 });
                        }
                        //return new Response('A Metadata, or Common Name identifier is required', { status: 400 });
                    }
                    //return new Response('A Metadata identifier is required', { status: 400 });
                }
                //return new Response('A Metadata identifier is required', { status: 400 });
            }
             // Get metadata by common name
            if (common_name) {
                const metadataByCommonName = await db
                    .select({metadata_id: MetadataRelations.metadata_id})
                    .from(MetadataRelations)
                    .where(eq(MetadataRelations.common_name, Number(common_name)))
                    .all();
                if (metadataByCommonName) {
                    metadata.push(...metadataByCommonName);
                }
                console.log(metadata);
                
                // Get metadata by category
                if (categories) {
                    let categoriesArray = JSON.parse(categories as string);
                    const metadataByCategory = await db
                        .select({metadata_id: MetadataRelations.metadata_id})
                        .from(MetadataRelations)
                        .where(inArray(MetadataRelations.category, categoriesArray))
                        .all();
                    if (metadataByCategory) {
                        metadata.push(...metadataByCategory);
                    }
                }
                console.log(metadata);
            }

            if (product_type) {
                const metadataByProductTypes = await  db
                    .select({metadata_id: MetadataRelations.metadata_id})
                    .from(MetadataRelations)
                    .where(eq(MetadataRelations.product_type, Number(product_type)))
                    .all();
                if (metadataByProductTypes) {
                    metadata.push(...metadataByProductTypes);
                }
                console.log(metadata);
            }

        }

        if (metadata.length === 0) {
            return new Response(JSON.stringify([]), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get metadata with their groups
        const metadatas = await db.select()
            .from(Metadata)
            .where(inArray(Metadata.id,metadata))
            .orderBy(Metadata.name);

        // Get groups for the metadata
        const groupIds = [...new Set(metadatas.map(m => m.id_group).filter(Boolean))];
        const groups = groupIds.length > 0 
        ? await db.select()
            .from(Group)
            .where(inArray(Group.id,groupIds))
        : [];

        // Organize metadata by group
        const groupedMetadata = groups.map(group => ({
            ...group,
            metadata: metadatas.filter(m => m.id_group === group.id)
        }));

        // Add ungrouped metadata
        const ungroupedMetadata = metadatas.filter(m => !m.id_group);
        if (ungroupedMetadata.length > 0) {
            groupedMetadata.push({
                id: 0,
                name: 'Other',
                metadata: ungroupedMetadata
            });
        }

        return new Response(JSON.stringify(groupedMetadata), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error("Error:", error);
        return new Response(JSON.stringify({ error: "Error al obtener metadatos" }), {
            status: 500,
        });
    }
};


export const GET: APIRoute = async ({ url }) => {
  try {
    const commonNameId = url.searchParams.get('commonNameId');
    const categoryId = url.searchParams.get('categoryId');
    const productTypeId = url.searchParams.get('productTypeId');
    
    if (!commonNameId || !categoryId || !productTypeId) {
      return new Response(JSON.stringify({ error: 'All IDs are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get metadata IDs related to these entities
    const [commonRelations, categoryRelations, productTypeRelations] = await Promise.all([
      db.select()
        .from(MetadataRelations)
        .where(eq(MetadataRelations.comun_name, parseInt(commonNameId))),
      db.select()
        .from(MetadataRelations)
        .where(eq(MetadataRelations.category, parseInt(categoryId))),
      db.select()
        .from(MetadataRelations)
        .where(eq(MetadataRelations.product_type, parseInt(productTypeId)))
    ]);

    // Merge all relations
    const relations = [...commonRelations, ...categoryRelations, ...productTypeRelations];
    
    const metadataIds = [...new Set(relations.map(rel => rel.metadata_id))];

    if (metadataIds.length === 0) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get metadata with their groups
    const metadata = await db.select()
      .from(Metadata)
      .where(inArray(Metadata.id,metadataIds))
      .orderBy(Metadata.name);

    // Get groups for the metadata
    const groupIds = [...new Set(metadata.map(m => m.id_group).filter(Boolean))];
    const groups = groupIds.length > 0 
      ? await db.select()
          .from(Group)
          .where(inArray(Group.id,groupIds))
      : [];

    // Organize metadata by group
    const groupedMetadata = groups.map(group => ({
      ...group,
      metadata: metadata.filter(m => m.id_group === group.id)
    }));

    // Add ungrouped metadata
    const ungroupedMetadata = metadata.filter(m => !m.id_group);
    if (ungroupedMetadata.length > 0) {
      groupedMetadata.push({
        id: 0,
        name: 'Other',
        metadata: ungroupedMetadata
      });
    }

    return new Response(JSON.stringify(groupedMetadata), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};