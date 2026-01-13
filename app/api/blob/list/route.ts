import { NextRequest, NextResponse } from 'next/server';
import { listBlobs } from '@/lib/blob';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get('prefix') || undefined;
    const limit = searchParams.get('limit');
    const cursor = searchParams.get('cursor') || undefined;

    const result = await listBlobs({
      prefix,
      limit: limit ? parseInt(limit, 10) : undefined,
      cursor,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('List error:', error);
    return NextResponse.json(
      { error: 'Failed to list blobs' },
      { status: 500 }
    );
  }
}
