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
      .where(eq(MetadataRelations.product_type, parseInt(productTypeId)));

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