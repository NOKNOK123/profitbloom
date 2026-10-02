import defaultLogo from 'figma:asset/21baad6507e62ba97c53b4e96400cc78fb54fe4c.png';
import type { User } from './api';

/** The shop's own branding, falling back to ProfitBloom until the user sets it in Settings. */
export const brandName = (user: User) => user.businessName.trim() || 'ProfitBloom';
export const brandLogo = (user: User) => user.businessLogo || defaultLogo;

/**
 * Shrinks an uploaded image so it fits in a 256px square and returns a data URL.
 * PNG keeps transparency; photos become JPEG to stay small.
 */
export function resizeLogo(file: File, maxSize = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
      reject(new Error('รองรับเฉพาะไฟล์ PNG, JPG หรือ WebP'));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL(file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png', 0.9));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('เปิดไฟล์รูปไม่ได้ ลองไฟล์อื่น'));
    };
    img.src = url;
  });
}
