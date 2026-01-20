import { NextRequest, NextResponse } from 'next/server';
import { copyBlob, deleteBlob, getBlobMetadata } from '@/lib/blob';
import { isClothingType, prefixForType } from '@/lib/wardrobe';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      url?: string;
      toType?: string;
    };

    if (!body?.url || !body?.toType) {
      return NextResponse.json(
        { error: 'Missing url or destination type' },
        { status: 400 }
      );
    }

    if (!isClothingType(body.toType)) {
      return NextResponse.json({ error: 'Invalid destination type' }, { status: 400 });
    }

    const metadata = await getBlobMetadata(body.url);
    const filename = metadata.pathname.split('/').pop();

    if (!filename) {
      return NextResponse.json(
        { error: 'Unable to determine file name' },
        { status: 400 }
      );
    }

    const destinationPath = `${prefixForType(body.toType)}${filename}`;
    const result = await copyBlob(body.url, destinationPath, {
      addRandomSuffix: false,
      contentType: metadata.contentType ?? undefined,
    });

    await deleteBlob(body.url);

    return NextResponse.json({ ok: true, item: result, toType: body.toType });
  } catch (error) {
    console.error('Wardrobe move error:', error);
    return NextResponse.json(
      { error: 'Failed to move item' },
      { status: 500 }
    );
  }
}
