import { readFileSync } from 'fs';
import { resolve } from 'path';

const SUPPORTED_EXT = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

function getMime(path: string): string {
  const ext = path.toLowerCase().slice(path.lastIndexOf('.'));
  const mimes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  };
  return mimes[ext] ?? 'image/jpeg';
}

export function imageToDataUrl(filePath: string): string | null {
  const absPath = resolve(process.cwd(), filePath);
  try {
    const buf = readFileSync(absPath);
    const mime = getMime(filePath);
    return `data:${mime};base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
}
