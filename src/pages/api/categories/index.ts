import type { APIRoute } from 'astro';
import { db, Category, DaiCategoryProduct } from 'astro:db';
import { generateSlug } from '../../../lib/utils/slug';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    console.log(data);
    const category = await db.insert(Category).values({
      name: data.name,
      slug: generateSlug(data.name),
      description: data.description.trim() || null,
      parents: JSON.stringify(data.parents),
      active: data.active ?? true,
    }).returning({id: Category.id});

    if (category.length > 0) {
      const daiCat = await db.insert(DaiCategoryProduct).values({
        category_id: category[0].id,
        dai: data.dai,
        eco_tax: data.eco,
        licenses: data.lic,
      });
      if (daiCat.rowsAffected > 0) {
        return new Response(JSON.stringify({ success: true, category }), {
          status: 201,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
    }

    return new Response(JSON.stringify({ error: 'Category creation failed' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create category' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};

// export const GET: APIRoute = async ({ url }) => {
//   try {
//     const commonNameId = url.searchParams.get('commonNameId');
    
//     if (!commonNameId) {
//       return new Response(JSON.stringify({ error: 'Common Name ID is required' }), {
//         status: 400,
//         headers: {
//           'Content-Type': 'application/json'
//         }
//       });
//     }

//     const categories = await db.select()
//       .from(Category)
//       .where(eq(Category.active, true))
//       .orderBy(Category.name);

//     return new Response(JSON.stringify(categories), {
//       status: 200,
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     });
//   } catch (error) {
//     console.error('Error fetching categories:', error);
//     return new Response(JSON.stringify({ error: 'Internal server error' }), {
//       status: 500,
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     });
//   }
// };