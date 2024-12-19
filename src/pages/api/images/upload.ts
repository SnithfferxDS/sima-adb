import type { APIRoute } from 'astro';
import { processImage, createThumbnail, saveProductImage, getNextImageIndex } from '../../../lib/utils/upload';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const productId = formData.get('productId') as string;

    if (!imageFile || !productId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Read file buffer
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    
    // Get next image index
    const index = await getNextImageIndex(productId);
    
    // Process and save main image
    const processedImage = await processImage(buffer, {
      width: 800,
      height: 800,
      fit: 'contain',
      background: '#FFFFFF'
    });
    const mainPath = await saveProductImage(processedImage, productId, index);
    
    // Process and save thumbnail
    const thumbnail = await createThumbnail(buffer);
    const thumbPath = await saveProductImage(thumbnail, productId, index, true);

    return new Response(JSON.stringify({
      success: true,
      id: `${productId}_${index}`,
      mainUrl: `/storage/uploads/${productId}/${productId}_${index}.webp`,
      thumbnailUrl: `/storage/uploads/${productId}/${productId}_${index}_thumb.webp`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error processing upload:', error);
    return new Response(JSON.stringify({ error: 'Upload failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};