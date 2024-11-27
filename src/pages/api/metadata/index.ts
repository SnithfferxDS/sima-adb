import { db, Metadata, MetadataRelations, Group } from 'astro:db';

if (Astro.request.method === 'POST') {
  try {
    const formData = await Astro.request.formData();
    
    // Extract and validate form data
    const name = formData.get('name');
    const format = formData.get('format');
    const groupId = formData.get('group_id');
    const tooltip = formData.get('tooltip');

    // Get relations data
    const categories = formData.getAll('categories').map(id => parseInt(id as string));
    const commonNames = formData.getAll('common_names').map(id => parseInt(id as string));
    const productTypes = formData.getAll('product_types').map(id => parseInt(id as string));

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
        .where(Group.id, '=', metadataValues.id_group)
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

    return Astro.redirect('/metadata', 303);
  } catch (error) {
    console.error('Error creating metadata:', error);
    return new Response('Error creating metadata', { status: 500 });
  }
}

return Astro.redirect('/metadata', 303);