import type { APIRoute } from 'astro';
import { db, eq, Metadata, MetadataRelations, Group, CommonName } from 'astro:db';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.json();
    
    // Extract and validate form data
    const name = formData.name;
    const format = formData.format;
    const groupId = formData.group_id;
    const tooltip = formData.tooltip;
    const categories = formData.categories;
    const commonNames = formData.common_names;
    const productTypes = formData.product_types;

    // Get relations data
    // const categories = formData.getAll('categories').map(id => parseInt(id as string));
    // const commonNames = formData.getAll('common_names').map(id => parseInt(id as string));
    // const productTypes = formData.getAll('product_types').map(id => parseInt(id as string));

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return new Response('Name is required', { status: 400 });
    }

    // Prepare metadata object with validated data
    const metadataValues = {
      name: name.trim(),
      allow_description: formData.has('description') || false,
      is_feature: formData.has('is_feature') || false,
      format: format && typeof format === 'string' ? format.trim() : null,
      id_group: groupId && typeof groupId === 'string' ? parseInt(groupId) : null,
      tooltip: tooltip && typeof tooltip === 'string' ? tooltip.trim() : null
    };

    // Validate group ID if provided
    if (metadataValues.id_group) {
      const group = await db
        .select()
        .from(Group)
        .where(eq(Group.id, metadataValues.id_group))
        .get();

      if (!group) {
        return new Response('Invalid group ID', { status: 400 });
      }
    }

    // Insert metadata
    const metadata = await db.insert(Metadata).values(metadataValues).returning().get();

    // Create relations
    if (metadata) {
      const relations = [];

      // Add category relations
      for (const categoryId of categories) {
        relations.push({
          metadata_id: metadata.id,
          category: categoryId
        });
      }

      // Add common name relations
      for (const commonNameId of commonNames) {
        relations.push({
          metadata_id: metadata.id,
          comun_name: commonNameId
        });
      }

      // Add product type relations
      for (const productTypeId of productTypes) {
        relations.push({
          metadata_id: metadata.id,
          product_type: productTypeId
        });
      }

      if (relations.length > 0) {
        await db.insert(MetadataRelations).values(relations);
      }
    }

    return new Response(JSON.stringify({ message: 'Metadata created successfully' }), { status: 200 });
  } catch (error) {
    console.error('Error creating metadata:', error);
    return new Response('Error creating metadata', { status: 500 });
  }
}

export const GET: APIRoute = async ({ request }) => {
  try {
    const formData = await request.json();
    const {id, common_names, product_type} = formData;

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
    const metadata = [];
    // Get metadata by ID
    if (id) {
        const metadataById = await db
        .select()
        .from(Metadata)
        .where(eq(Metadata.id, Number(id)))
        .get();
        if (metadataById) {
            metadata.push(metadataById);
        }
    }

    if (common_names) {
        const commonNames = await db
          .select()
          .from(CommonName)
          .where(eq(CommonName.id, Number(common_names)))
          .get();
        if (commonNames) {
            const metadataByCommonName = await db.select().from(MetadataRelations).where(eq(MetadataRelations.common_name, Number(common_names))).all();
            if (metadataByCommonName) {
                metadata.push(...metadataByCommonName);
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
                metadata.push(...metadataByCategories);
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
              metadata.push(...metadataByProductTypes);
          }
      }


    return new Response(JSON.stringify({success: true, metadata }), { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Error al obtener metadatos" }), {
      status: 500,
    });
  }
};