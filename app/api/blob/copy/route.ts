import { NextRequest, NextResponse } from 'next/server';
import { copyBlob } from '@/lib/blob';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fromUrl, toPathname, addRandomSuffix, contentType } = body as {
      fromUrl?: string;
      toPathname?: string;
      addRandomSuffix?: boolean;
      contentType?: string;
    };

    if (!fromUrl || !toPathname) {
      return NextResponse.json(
        { error: 'Both "fromUrl" and "toPathname" are required' },
        { status: 400 }
      );
    }

    const result = await copyBlob(fromUrl, toPathname, {
      addRandomSuffix,
      contentType,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Copy error:', error);
    return NextResponse.json(
      { error: 'Failed to copy blob' },
      { status: 500 }
    );
  }
}
