import type { APIRoute } from 'astro';
import { db, eq, Product } from 'astro:db';

export const GET: APIRoute = async ({ params }) => {
    try {
        const type = params.type as string;
        const identifier = await generateIdentifier(type);
        if (identifier !== undefined) {
            return new Response(identifier, { status: 200 });
        }
        return new Response(JSON.stringify({ error: 'Identifier not found' }), { status: 404 });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to generate identifier' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
};
  
export async function generateIdentifier(type: string): Promise<string> {
  const date = new Date();
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10).toString().padStart(1, '0');
  const additional = Math.floor(Math.random() * 10).toString().padStart(1, '0');
  let identifier = '';

  switch (type) {
    case 'mpn':
      identifier = `DS-${year}${month}${day}-${hours}${minutes}${random}${additional}`;
      const mpnExists = await db.select().from(Product).where(eq(Product.mpn, identifier)).get();
      if (mpnExists) {
        return generateIdentifier(type);
      }
      break;

    case 'sku':
      identifier = `DS-${year}${month}${day}${random}-${additional}`;
      const skuExists = await db.select().from(Product).where(eq(Product.sku, identifier)).get();
      if (skuExists) {
        return generateIdentifier(type);
      }
      break;

    case 'upc':
      identifier = `${year}${month}${day}${hours}${minutes}${random}`;
      if (identifier.length > 12) {
        identifier = identifier.slice(0, 12);
      } else if (identifier.length < 12) {
        identifier = identifier.padStart(12, additional);
      }
      const upcExists = await db.select().from(Product).where(eq(Product.upc, identifier)).get();
      if (upcExists) {
        return generateIdentifier(type);
      }
      break;

    case 'ean':
      identifier = `0${year}${month}${day}${hours}${random}${additional}`;
      if (identifier.length > 13) {
        identifier = identifier.slice(0, 13);
      } else if (identifier.length < 13) {
        identifier = identifier.padStart(13, additional);
      }
      const eanExists = await db.select().from(Product).where(eq(Product.ean, identifier)).get();
      if (eanExists) {
        return generateIdentifier(type);
      }
      break;
  }
  return identifier;
}
