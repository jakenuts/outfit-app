import { put, del, list, head, copy } from '@vercel/blob';
import type { PutBlobResult, ListBlobResult, HeadBlobResult } from '@vercel/blob';

/**
 * Vercel Blob Storage utilities for outfit-store
 * Uses BLOB_READ_WRITE_TOKEN environment variable for authentication
 */

export type BlobUploadResult = PutBlobResult;
export type BlobListResult = ListBlobResult;
export type BlobHeadResult = HeadBlobResult;

/**
 * Upload a blob to the outfit-store
 * @param pathname - The path/filename for the blob
 * @param body - The file content (can be string, Blob, ArrayBuffer, ReadableStream, etc.)
 * @param options - Additional options like contentType, access level
 */
export async function uploadBlob(
  pathname: string,
  body: string | Blob | ArrayBuffer | ReadableStream | File,
  options?: {
    contentType?: string;
    addRandomSuffix?: boolean;
  }
): Promise<BlobUploadResult> {
  const result = await put(pathname, body, {
    access: 'public',
    addRandomSuffix: options?.addRandomSuffix ?? true,
    contentType: options?.contentType,
  });

  return result;
}

/**
 * Delete a blob from the outfit-store
 * @param url - The URL of the blob to delete
 */
export async function deleteBlob(url: string): Promise<void> {
  await del(url);
}

/**
 * Delete multiple blobs from the outfit-store
 * @param urls - Array of URLs to delete
 */
export async function deleteBlobs(urls: string[]): Promise<void> {
  await del(urls);
}

/**
 * List all blobs in the outfit-store
 * @param options - Pagination and filtering options
 */
export async function listBlobs(options?: {
  prefix?: string;
  limit?: number;
  cursor?: string;
}): Promise<BlobListResult> {
  const result = await list({
    prefix: options?.prefix,
    limit: options?.limit,
    cursor: options?.cursor,
  });

  return result;
}

/**
 * Get metadata for a specific blob
 * @param url - The URL of the blob
 */
export async function getBlobMetadata(url: string): Promise<BlobHeadResult> {
  const result = await head(url);
  return result;
}

/**
 * Copy a blob to a new location
 * @param fromUrl - The source blob URL
 * @param toPathname - The destination pathname
 */
export async function copyBlob(
  fromUrl: string,
  toPathname: string,
  options?: {
    addRandomSuffix?: boolean;
    contentType?: string;
  }
): Promise<BlobUploadResult> {
  const result = await copy(fromUrl, toPathname, {
    access: 'public',
    addRandomSuffix: options?.addRandomSuffix ?? true,
    contentType: options?.contentType,
  });

  return result;
}

/**
 * Download blob content as text
 * @param url - The URL of the blob
 */
export async function downloadBlobAsText(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download blob: ${response.statusText}`);
  }
  return response.text();
}

/**
 * Download blob content as ArrayBuffer
 * @param url - The URL of the blob
 */
export async function downloadBlobAsBuffer(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download blob: ${response.statusText}`);
  }
  return response.arrayBuffer();
}

/**
 * Download blob content as Blob
 * @param url - The URL of the blob
 */
export async function downloadBlobAsBlob(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download blob: ${response.statusText}`);
  }
  return response.blob();
}
