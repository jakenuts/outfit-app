import { NextRequest, NextResponse } from 'next/server';
import { deleteBlob } from '@/lib/blob';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { url?: string };

    if (!body?.url) {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 });
    }

    await deleteBlob(body.url);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Wardrobe delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}
