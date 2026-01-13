export type ClothingType = 'tops' | 'bottoms' | 'shoes';

export type WardrobeItem = {
  url: string;
  pathname: string;
  uploadedAt?: string;
};

export const clothingTypes: Array<{
  id: ClothingType;
  label: string;
  description: string;
}> = [
  {
    id: 'tops',
    label: 'Tops',
    description: 'Shirts, sweaters, jackets, hoodies.',
  },
  {
    id: 'bottoms',
    label: 'Bottoms',
    description: 'Pants, shorts, skirts.',
  },
  {
    id: 'shoes',
    label: 'Shoes',
    description: 'Sneakers, boots, heels.',
  },
];

export const wardrobePrefix = 'clothes';

export function prefixForType(type: ClothingType): string {
  return `${wardrobePrefix}/${type}/`;
}

export function sanitizeFilename(filename: string): string {
  const cleaned = filename
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9.-]+/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  return cleaned || `item-${Date.now()}`;
}

export function buildBlobPath(type: ClothingType, filename: string): string {
  return `${prefixForType(type)}${sanitizeFilename(filename)}`;
}
