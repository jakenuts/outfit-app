import { NextRequest, NextResponse } from 'next/server';
import { uploadBlob } from '@/lib/blob';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const pathname = formData.get('pathname') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const filename = pathname || file.name;

    const result = await uploadBlob(filename, file, {
      contentType: file.type,
      addRandomSuffix: formData.get('addRandomSuffix') !== 'false',
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
