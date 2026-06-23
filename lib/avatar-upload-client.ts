const MAX_BYTES = 500 * 1024;
const OUTPUT_SIZE = 512;

const EXTENSION_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
};

export function resolveImageMime(file: File): string | null {
  const type = file.type?.toLowerCase();
  if (type && Object.values(EXTENSION_MIME).includes(type)) {
    return type;
  }
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  return EXTENSION_MIME[ext] ?? null;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image.'));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not process image.'))),
      type,
      quality,
    );
  });
}

/** Center-crop to square, resize, and compress before upload. GIFs pass through unchanged. */
export async function prepareAvatarFile(file: File): Promise<File> {
  const mime = resolveImageMime(file);
  if (!mime) {
    throw new Error('Use a JPEG, PNG, WebP, or GIF image.');
  }

  if (mime === 'image/gif') {
    if (file.size > MAX_BYTES) {
      throw new Error('Image must be 500 KB or smaller.');
    }
    return file;
  }

  const img = await loadImage(file);
  const cropSize = Math.min(img.width, img.height);
  const sx = (img.width - cropSize) / 2;
  const sy = (img.height - cropSize) / 2;

  const canvas = document.createElement('canvas');
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not process image.');
  }

  ctx.drawImage(img, sx, sy, cropSize, cropSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

  let quality = 0.92;
  let blob = await canvasToBlob(canvas, 'image/jpeg', quality);
  while (blob.size > MAX_BYTES && quality > 0.5) {
    quality -= 0.08;
    blob = await canvasToBlob(canvas, 'image/jpeg', quality);
  }

  if (blob.size > MAX_BYTES) {
    throw new Error('Image is too large after processing. Try a smaller file.');
  }

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'avatar';
  return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
}

export function validateAvatarFile(file: File): string | null {
  const mime = resolveImageMime(file);
  if (!mime) {
    return 'Use a JPEG, PNG, WebP, or GIF image.';
  }
  if (mime === 'image/gif' && file.size > MAX_BYTES) {
    return 'Image must be 500 KB or smaller.';
  }
  return null;
}
