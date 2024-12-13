import type { APIRoute } from 'astro';
import { db,eq,inArray, Metadata, MetadataValue, MetadataRelations, Group } from 'astro:db';

export const GET: APIRoute = async ({ url }) => {
  const productTypeId = url.searchParams.get('productTypeId');
  
  if (!productTypeId) {
    return new Response('Product Type ID is required', { status: 400 });
  }

  try {
    // Get metadata IDs related to this product type
    const relations = await db.select()
      .from(MetadataRelations)
      .where(eq(MetadataRelations.product_types, parseInt(productTypeId)));

    const metadataIds = relations.map(rel => rel.metadata_id);

    // Get metadata with their groups and values
    const metadata = await db.select()
      .from(Metadata)
      .where(inArray(Metadata.id,metadataIds))
      .orderBy(Metadata.name);

    // Get groups for the metadata
    const groups = await db.select()
      .from(Group)
      .where(inArray(Group.id, metadata.map(m => m.id_group)).filter(Boolean));

    // Get values for the metadata
    const values = await db.select()
      .from(MetadataValue)
      .where(inArray(MetadataValue.metadata_id, metadataIds))
      .where(eq(MetadataValue.active, true))
      .orderBy(MetadataValue.metadata_value);

    // Create a map of groups
    const groupMap = new Map(groups.map(g => [g.id, g]));

    // Create a map of values by metadata ID
    const valueMap = values.reduce((acc, val) => {
      if (!acc[val.metadata_id]) {
        acc[val.metadata_id] = [];
      }
      acc[val.metadata_id].push(val);
      return acc;
    }, {});

    // Combine all data
    const enrichedMetadata = metadata.map(meta => ({
      ...meta,
      group: meta.id_group ? groupMap.get(meta.id_group) : null,
      values: valueMap[meta.id] || []
    }));

    return new Response(JSON.stringify(enrichedMetadata), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return new Response('Error fetching metadata', { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();
  /* {
				name: name.trim(),
				allow_description: formData.has("description") || false,
				is_feature: formData.has("is_feature") || false,
				format:
					format && typeof format === "string" ? format.trim() : null,
				id_group:
					groupId && typeof groupId === "string"
						? parseInt(groupId)
						: null,
				tooltip:
					tooltip && typeof tooltip === "string"
						? tooltip.trim()
						: null,
				categories: categories,
				common_names: commonNames,
				product_types: productTypes,
			} */
  // Extract and validate form data
    const name = data.name;
    const format = data.format;
    const groupId = data.id_group;
    const tooltip = data.tooltip;

    // Get relations data
    const categories = data.categories;//.map(id => parseInt(id as string));
    const commonNames = data.common_names; //formData.getAll('common_names').map(id => parseInt(id as string));
    const productTypes = data.product_types; //formData.getAll('product_types').map(id => parseInt(id as string));

  if (!name) {
    return new Response('Name is required', { status: 400 });
  }

  /* if (!format) {
    return new Response('Format is required', { status: 400 });
  } */

  if (!tooltip) {
    return new Response('Tooltip is required', { status: 400 });
  }
  
  // Prepare metadata object with validated data
    const metadataValues = {
      name: name.trim(),
      allow_description: data.allow_description == 'on' ? true : false, //formData.has('description') || false,
      is_feature: data.is_feature == 'on' ? true : false, //formData.has('is_feature') || false,
      format: format && typeof format === 'string' ? format.trim() : null,
      id_group: groupId && typeof groupId === 'string' ? parseInt(groupId) : null,
      tooltip: tooltip && typeof tooltip === 'string' ? tooltip.trim() : null
  };
  
  try {
  
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
    
      return new Response(JSON.stringify(metadata), {
        status: 201,
        headers: {
          'Content-Type': 'application/json'
        }
      });
  } catch (error) {
    console.error('Error creating metadata:', error);
    return new Response('Error creating metadata', { status: 500 });
  }
};