import type { APIRoute } from 'astro';
import { db, Product } from "astro:db";

export const POST: APIRoute = async ({ request }) => {
    try {
      const data = await request.json();
      console.log(data);
      let infoType = data.info;
      if (infoType === "general") {
        const productHandle = generateHandle(data.name);
        const product = await db.insert(Product).values({
          name: data.name,
          handle: productHandle,
          mpn: data.mpn,
          sku: data.sku,
          upc: data.upc,
          ean: data.ean == '' ? data.upc : data.ean
        });
        //const relations = await db.insert(R).values({
        return new Response(JSON.stringify({ success: true, product }), {
          status: 201,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } else if (infoType === "variants") {
        const product = await db.insert(Product).values({
          name: data.name,
          mpn: data.mpn,
          sku: data.sku,
          upc: data.upc,
          ean: data.ean,
          created_at: new Date(),
          updated_at: new Date(),
        });
        return new Response(JSON.stringify({ success: true, product }), {
          status: 201,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
      return new Response(JSON.stringify({ error: 'Invalid product info type' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      //console.log(error);
      return new Response(JSON.stringify({ error: 'Failed to create product' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
};
  
function generateHandle(name: string): string {
  // replace whitespaces with dashes
  name = name.replace(/\s+/g, "-");
  // remove all non-alphanumeric characters
  name = name.replace(/[^a-zA-Z0-9]/g, "");
  // to lowercase
  let handle = name.toLowerCase();
  return handle;
}