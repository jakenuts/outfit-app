import { NextRequest, NextResponse } from 'next/server';
import { deleteBlob, deleteBlobs } from '@/lib/blob';

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, urls } = body as { url?: string; urls?: string[] };

    if (urls && Array.isArray(urls)) {
      await deleteBlobs(urls);
      return NextResponse.json({ success: true, deleted: urls.length });
    }

    if (url) {
      await deleteBlob(url);
      return NextResponse.json({ success: true, deleted: 1 });
    }

    return NextResponse.json(
      { error: 'No URL provided. Use "url" for single delete or "urls" for batch delete.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete blob(s)' },
      { status: 500 }
    );
  }
}
