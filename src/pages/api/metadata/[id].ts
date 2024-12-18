import { APIRoute } from "astro";
import { db, eq, Metadata, MetadataRelations, Group } from "astro:db";

export const POST: APIRoute = async ({ request,params }) => {
    try {
        const id = parseInt(params.id!);
		const formData = await request.json();
		// Extract and validate form data
		const name = formData.data.name;
		const format = formData.data.format;
		const groupId = formData.data.group_id;
		const tooltip = formData.data.tooltip;
		const categories = formData.data.categories;
		const commonNames = formData.data.common_names;
		const productTypes = formData.data.product_types;

		// Validate required fields
		if (!name || typeof name !== "string" || name.trim() === "") {
			return new Response("Name is required", { status: 400 });
		}

		// Prepare metadata object with validated data
		const metadataValues = {
			name: name.trim(),
			allow_description: formData.data.allow_description, //formData.has('description') || false,
			is_feature: formData.data.is_feature, //formData.has('is_feature') || false,
			format: format && typeof format === "string" ? format.trim() : null,
			id_group: groupId && typeof groupId === "string" ? parseInt(groupId) : null,
			tooltip: tooltip && typeof tooltip === "string" ? tooltip.trim() : null,
		};

		// Validate group ID if provided
		if (metadataValues.id_group) {
			const group = await db
				.select()
				.from(Group)
				.where(eq(Group.id, metadataValues.id_group))
				.get();

			if (!group) {
				return new Response("Invalid group ID", { status: 400 });
			}
        }

		// Insert metadata
		const metadata = await db.update(Metadata)
			.set(metadataValues)
			.where(eq(Metadata.id, id)).returning().get();
		// Update relations
		if (metadata) {
			const relations = await db.update(MetadataRelations)
			.set({
				common_names: JSON.stringify(commonNames),
				categories: JSON.stringify(categories),
				product_types: JSON.stringify(productTypes),
			}).where(eq(MetadataRelations.metadata_id, id));
		}

		return new Response(JSON.stringify({ message: "Metadata created successfully" }), { status: 200 });
	} catch (error) {
		console.error("Error creating metadata:", error);
		return new Response("Error creating metadata", { status: 500 });
	}
};

export const PUT: APIRoute = async ({ request,params }) => {
    try {
        const id = parseInt(params.id!);
		const formData = await request.json();
		// Update metadata
		if (formData.allow_description) {
		const metadata = await db.update(Metadata)
			.set({
				allow_description: formData.allow_description,
				updated_at: new Date(),
			})
			.where(eq(Metadata.id, id)).returning().get();
		}
		if (formData.is_feature) {
		const metadata = await db.update(Metadata)
			.set({
				is_feature: formData.is_feature,
				updated_at: new Date(),
			})
			.where(eq(Metadata.id, id)).returning().get();
		}
		return new Response(JSON.stringify({ message: "Metadata updated successfully" }), { status: 200 });
	} catch (error) {
		console.error("Error updating metadata:", error);
		return new Response("Error updating metadata", { status: 500 });
	}
};