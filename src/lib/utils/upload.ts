import { showError } from './notifications';

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