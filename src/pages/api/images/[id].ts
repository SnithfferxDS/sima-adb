import type { APIRoute } from 'astro';
import path from 'path';
import fs from 'fs/promises';

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const [productId, index] = (params.id || '').split('_');
    
    if (!productId || !index) {
      return new Response(JSON.stringify({ error: 'Invalid image ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const storagePath = path.join('src', 'storage', 'uploads', productId);
    
    // Delete main image and thumbnail
    await Promise.all([
      fs.unlink(path.join(storagePath, `${productId}_${index}.webp`)),
      fs.unlink(path.join(storagePath, `${productId}_${index}_thumb.webp`))
    ]);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    return new Response(JSON.stringify({ error: 'Delete failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};