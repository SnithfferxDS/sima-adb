import type { APIRoute } from "astro";
import { db, eq, inArray } from 'astro:db';
import { Metadata, MetadataRelations, Group, MetadataValueRelations } from 'astro:db';

export const POST:APIRoute = async ({ request }) => {
    try {
        const formData = await request.json();
        /* {"action":"common","product":"","common_name":"2","categories":"[\"1\",\"3\"]"} */
        // Ids of the metadata
        const metadatas: number[] = [];
        const metadataRelations = await db.select()
        .from(MetadataRelations);
        // If product is not empty, find metadata vlue relations where product_id is equal to product
        if (formData.product) {
            const metadataByProduct = await db.select()
                .from(MetadataValueRelations)
                .where(eq(MetadataValueRelations.product_id, formData.product))
                .get();
        }
        // If common_name is not empty, get metadata relations where common_name is in common_names json array
        if (metadataRelations) {
            const relationsArray = await Promise.all(
                metadataRelations.map((rel: any) => {
                    const commonNames = JSON.parse(rel.common_names);
                    const categoriesR = JSON.parse(rel.categories);
                    if (formData.common_names) {
                        const commons = formData.common_names.map((commonName: string | number) => Number(commonName));
                        // If commons is an array, check if common_name is in commons array
                        if (Array.isArray(commons)) {
                            if (commons.includes(commonNames)) {
                                metadatas.push(Number(rel.metadata_id));
                            }
                        }
                    }

                    if (formData.categories) {
                        // If categories is not an array, parse it
                        let catsArray: number[] = [];
                        if (!Array.isArray(formData.categories)) {
                            catsArray = JSON.parse(formData.categories);
                        } else {
                            catsArray = formData.categories;
                        }
                        const cats = catsArray.map((category: string | number) => Number(category));
                        // For each category, check if it is included in the categories array
                        cats.forEach((category: string | number) => {
                            if (categoriesR.includes(category)) {
                                metadatas.push(Number(rel.metadata_id));
                            }
                        });
                  }
                  if (formData.product_type) {
                    const productTypes = JSON.parse(rel.product_types);
                    if (Array.isArray(productTypes)) {
                      if (productTypes.includes(formData.product_type)) {
                        metadatas.push(Number(rel.metadata_id));
                      }
                    } else {
                      if (productTypes === formData.product_type) {
                        metadatas.push(Number(rel.metadata_id));
                      } 
                    }
                  }
                }))
            .catch((error) => {
                console.error('Error:', error);
            });
        }

        // Get metadata with their groups
        const metadatos = await db.select()
            .from(Metadata)
            .where(inArray(Metadata.id,metadatas))
            .orderBy(Metadata.name);
        // console.log("Metadatos: ", metadatos);
        // Get groups for the metadata
        const groupIds = [...new Set(metadatos.map(m => m.id_group).filter(Boolean))];
        const groups = groupIds.length > 0 
        ? await db.select()
            .from(Group)
            .where(inArray(Group.id,groupIds))
        : [];

        //Organize metadata by group
        const groupedMetadata = groups.map(group => ({
            ...group,
            metadata: metadatos.filter(m => m.id_group === group.id)
        }));

        // Add ungrouped metadata
        const ungroupedMetadata = metadatos.filter(m => !m.id_group);
        if (ungroupedMetadata.length > 0) {
            groupedMetadata.push({
                id: 0,
                name: 'Other',
                metadata: ungroupedMetadata
            });
        }

        //return new Response(JSON.stringify(metadatos), {
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