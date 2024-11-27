import type { APIRoute } from 'astro';
import { db,sql, ProductType } from 'astro:db';

export const GET: APIRoute = async ({ url }) => {
  const categoryId = url.searchParams.get('categoryId');
  
  if (!categoryId) {
    return new Response('Category ID is required', { status: 400 });
  }

  try {
    const productTypes = await db.select()
      .from(ProductType)
      .where(sql`JSON_ARRAY_CONTAINS(categories, ${parseInt(categoryId)})`)
      .orderBy(ProductType.name);

    return new Response(JSON.stringify(productTypes), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error fetching product types:', error);
    return new Response('Error fetching product types', { status: 500 });
  }
};