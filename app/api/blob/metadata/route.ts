import { NextRequest, NextResponse } from 'next/server';
import { getBlobMetadata } from '@/lib/blob';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'No URL provided' },
        { status: 400 }
      );
    }

    const metadata = await getBlobMetadata(url);
    return NextResponse.json(metadata);
  } catch (error) {
    console.error('Metadata error:', error);
    return NextResponse.json(
      { error: 'Failed to get blob metadata' },
      { status: 500 }
    );
  }
}
