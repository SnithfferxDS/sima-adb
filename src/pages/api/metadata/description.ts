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

const metadata: MetadataItem[] = [];

export const POST:APIRoute = async ({ request }) => {
    try {
        const formData = await request.json();
        console.log(formData);
        if (formData.action == "common") {
            const { id, common_name, categories } = formData;
            if (!id || typeof id !== 'string' || id.trim() === '') {
                if (!common_name || typeof common_name !== 'string' || common_name.trim() === '') {
                    if (!categories || typeof categories !== 'string' || categories.trim() === '') {
                        return new Response('A Metadata, or Common Name, or Product Type identifier is required', { status: 400 });
                    }
                    //return new Response('A Metadata, or Common Name identifier is required', { status: 400 });
                }
                //return new Response('A Metadata identifier is required', { status: 400 });
            }
            
            // Get metadata by ID
            if (id) {
                const metadataById = await db
                .select()
                .from(MetadataRelations)
                .where(eq(Metadata.metadata_id, Number(id)))
                .get();
                if (metadataById) {
                    metadata.push(metadataById as MetadataItem);
                }
            }
            
            // Get common name by ID
            if (common_name) {
                const commonNameById = await db
                .select()
                .from(MetadataRelations)
                .where(inArray(Number(common_name), MetadataRelations.common_name))
                .get();
                if (commonNameById) {
                    metadata.push(commonNameById as MetadataItem);
                }
            }
            
            // Get metadata by category
            if (categories) {
                let categoriesArray = JSON.parse(categories as string);
                const metadataByCategory = await Promise.all(
                    categoriesArray?.map(async (category: number) => {
                        const metadata = await db
                            .select()
                            .from(MetadataRelations)
                            .where(eq(MetadataRelations.category, category))
                            .all();
                        return metadata;
                    }) || [],
                );
                if (metadataByCategory) {
                    metadata.push(metadataByCategory as MetadataItem[]);
                }
            }
            
            return new Response(JSON.stringify({success: true, metadata }), { status: 200 });
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
            // Validate ID
            if (!id || typeof id !== 'string' || id.trim() === '') {
                if (!common_names || typeof common_names !== 'string' || common_names.trim() === '') {
                    if (!product_type || typeof product_type !== 'string' || product_type.trim() === '') {
                        return new Response('A Metadata, or Common Name, or Product Type identifier is required', { status: 400 });
                    }
                    //return new Response('A Metadata, or Common Name identifier is required', { status: 400 });
                }
                //return new Response('A Metadata identifier is required', { status: 400 });
            }
            // const metadata = [];
            // Get metadata by ID
            if (id) {
                const metadataById = await db
                    .select()
                    .from(Metadata)
                    .where(eq(Metadata.id, Number(id)))
                    .get();
                if (metadataById) {
                    metadata.push(metadataById as MetadataItem);
                }
            }
                    
            if (common_name) {
                const commonNames = await db
                    .select()
                    .from(CommonName)
                    .where(eq(CommonName.id, Number(common_name)))
                    .get();
                if (commonNames) {
                    const metadataByCommonName = await db
                        .select()
                        .from(MetadataRelations)
                        .where(eq(MetadataRelations.common_name, Number(common_name)))
                        .all();
                    if (metadataByCommonName) {
                        metadata.push(...metadataByCommonName as MetadataItem[]);
                    }
                    let categories = JSON.parse(commonNames.categories as string);
                    const metadataByCategories = await Promise.all(
                        categories?.map(async (category: number) => {
                            const metadata = await db
                                .select()
                                .from(MetadataRelations)
                                .where(eq(MetadataRelations.category, category))
                                .all();
                                return metadata;
                        }) || [],
                    );
                    if (metadataByCategories) {
                        metadata.push(...metadataByCategories as MetadataItem[]);
                    }
                }
            }

            if (product_type) {
                const metadataByProductTypes = await  db
                    .select()
                    .from(MetadataRelations)
                    .where(eq(MetadataRelations.product_type, Number(product_type)))
                    .all();
                if (metadataByProductTypes) {
                    metadata.push(...metadataByProductTypes as MetadataItem[]);
                }
            }

        }

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