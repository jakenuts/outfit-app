import { NextRequest, NextResponse } from 'next/server';
import { listBlobs } from '@/lib/blob';
import { isClothingType, prefixForType } from '@/lib/wardrobe';

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 60;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type || !isClothingType(type)) {
      return NextResponse.json(
        { error: 'Invalid or missing type' },
        { status: 400 }
      );
    }

    const cursor = searchParams.get('cursor') || undefined;
    const limitParam = searchParams.get('limit');
    const limit = Math.min(
      MAX_LIMIT,
      limitParam ? parseInt(limitParam, 10) : DEFAULT_LIMIT
    );

    const result = await listBlobs({
      prefix: prefixForType(type),
      limit,
      cursor,
    });

    return NextResponse.json({
      type,
      items: result.blobs,
      nextCursor: result.cursor,
      hasMore: result.hasMore,
    });
  } catch (error) {
    console.error('Wardrobe list error:', error);
    return NextResponse.json(
      { error: 'Failed to list wardrobe items' },
      { status: 500 }
    );
  }
}
