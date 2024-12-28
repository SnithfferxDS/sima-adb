import { showError } from './notifications';
import sharp from 'sharp';
// import path from 'path';
import fs from 'fs/promises';
import { UPLOADS } from '@Configs/constants';

// upload file to server

export async function uploadFile(file: File): Promise<string | null> {
  // For demo purposes, we'll simulate file upload and return a data URL
  // In production, you would upload to a proper storage service
  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  } catch (error) {
    showError('Failed to upload file');
    return null;
  }
}

// save file in local storage
export async function saveFile(file: File): Promise<string | null> {
  try {
    const fileUrl = URL.createObjectURL(file);
    const fileName = file.name;
    localStorage.setItem(fileName, fileUrl);
    return fileUrl;
  } catch (error) {
    showError('Failed to save file');
    return null;
  }
}

interface ImageProcessingOptions {
  width: number;
  height: number;
  fit?: 'contain' | 'cover';
  background?: string;
}

export async function processImage(
  inputBuffer: Buffer,
  options: ImageProcessingOptions
): Promise<Buffer> {
  return sharp(inputBuffer)
    .resize(options.width, options.height, {
      fit: options.fit || 'contain',
      background: options.background || '#FFFFFF'
    })
    .webp({ quality: 80 })
    .toBuffer();
}

export async function createThumbnail(inputBuffer: Buffer): Promise<Buffer> {
  return processImage(inputBuffer, {
    width: 200,
    height: 200,
    fit: 'cover'
  });
}

export async function saveProductImage(
  imageBuffer: Buffer,
  upc: string,
  index: number,
  isThumb = false
): Promise<string> {
  // Create base storage path
  const storagePath = `${UPLOADS}${upc}`;

  // Ensure directory exists
  await fs.mkdir(storagePath, { recursive: true });

  // Generate filename
  const filename = `${upc}_${index}${isThumb ? '_thumb' : ''}.webp`;
  const filepath = `${storagePath}/${filename}`;
  console.log(filepath);
  // Save file
  const saved = await fs.writeFile(filepath, imageBuffer);
  console.log('saved : ', saved);
  return filepath;
}

export async function getNextImageIndex(upc: string): Promise<number> {
  const storagePath = `${UPLOADS}${upc}`;

  try {
    const files = await fs.readdir(storagePath);
    const indices = files
      .filter(f => !f.includes('_thumb'))
      .map(f => parseInt(f.split('_')[1]))
      .filter(n => !isNaN(n));

    return indices.length > 0 ? Math.max(...indices) + 1 : 1;
  } catch {
    return 1;
  }
}

export async function saveImage(imageBuffer: Buffer, identifier: string, isThumb = false): Promise<string> {
  // Create base storage path
  const storagePath = `${UPLOADS}${identifier}`;
  return saveProductImage(imageBuffer, identifier, await getNextImageIndex(identifier), isThumb);
}