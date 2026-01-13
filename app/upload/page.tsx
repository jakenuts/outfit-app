'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  buildBlobPath,
  clothingTypes,
  type ClothingType,
} from '@/lib/wardrobe';

type UploadStatus = {
  name: string;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
};

export default function UploadPage() {
  const [selectedType, setSelectedType] = useState<ClothingType>('tops');
  const [files, setFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const totalSize = useMemo(
    () => files.reduce((total, file) => total + file.size, 0),
    [files]
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(event.target.files ?? []);
    setFiles(nextFiles);
    setUploadStatus(
      nextFiles.map((file) => ({ name: file.name, status: 'pending' }))
    );
    setMessage(null);
  };

  const updateStatus = (index: number, update: Partial<UploadStatus>) => {
    setUploadStatus((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, ...update } : item))
    );
  };

  const uploadFiles = async () => {
    if (!files.length) {
      setMessage('Select at least one photo to upload.');
      return;
    }

    setIsUploading(true);
    setMessage(null);

    for (const [index, file] of files.entries()) {
      updateStatus(index, { status: 'uploading', error: undefined });
      const formData = new FormData();
      formData.append('file', file);
      formData.append('pathname', buildBlobPath(selectedType, file.name));
      formData.append('addRandomSuffix', 'true');

      try {
        const response = await fetch('/api/blob/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const data = (await response.json()) as { error?: string };
          throw new Error(data.error || 'Upload failed');
        }

        updateStatus(index, { status: 'complete' });
      } catch (error) {
        console.error(error);
        updateStatus(index, {
          status: 'error',
          error: error instanceof Error ? error.message : 'Upload failed',
        });
      }
    }

    setIsUploading(false);
    setMessage('Uploads complete. You can generate an outfit now.');
  };

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-6 rounded-[28px] border border-white/70 bg-white/75 p-8 shadow-[0_20px_40px_-30px_var(--shadow)] backdrop-blur">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.4em] text-[color:var(--ink-muted)]">
              Wardrobe Upload
            </p>
            <h1 className="text-3xl font-semibold md:text-4xl">
              Upload one clothing category at a time.
            </h1>
            <p className="max-w-xl text-sm text-[color:var(--ink-muted)] md:text-base">
              Large files are ok. Choose a category, drop in photos, and we will
              tag them for the generator.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="rounded-full border border-black/10 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--ink)] transition hover:-translate-y-0.5"
            >
              Back to Generator
            </Link>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="space-y-6 rounded-[28px] border border-white/70 bg-white/80 p-8 shadow-[0_22px_40px_-30px_var(--shadow)] backdrop-blur">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">1. Pick a category</h2>
              <div className="grid gap-3 md:grid-cols-3">
                {clothingTypes.map((type) => (
                  <label
                    key={type.id}
                    className={`flex cursor-pointer flex-col gap-2 rounded-2xl border px-4 py-3 text-sm transition ${
                      selectedType === type.id
                        ? 'border-[color:var(--accent)] bg-[color:var(--accent)]/10'
                        : 'border-black/10 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={type.id}
                      checked={selectedType === type.id}
                      onChange={() => setSelectedType(type.id)}
                      className="sr-only"
                    />
                    <span className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">
                      {type.label}
                    </span>
                    <span className="text-sm text-[color:var(--ink)]">
                      {type.description}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">2. Add photos</h2>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-black/20 bg-white/60 px-6 py-10 text-center transition hover:border-[color:var(--accent)]">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="sr-only"
                />
                <span className="text-sm uppercase tracking-[0.35em] text-[color:var(--ink-muted)]">
                  Choose files
                </span>
                <span className="text-base text-[color:var(--ink)]">
                  {files.length
                    ? `${files.length} files selected`
                    : 'Drop photos or browse from your device'}
                </span>
                <span className="text-xs text-[color:var(--ink-muted)]">
                  Total size: {(totalSize / (1024 * 1024)).toFixed(1)} MB
                </span>
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={uploadFiles}
                disabled={isUploading || files.length === 0}
                className="rounded-full bg-[color:var(--accent)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-[0_16px_30px_-18px_rgba(228,90,42,0.9)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-black/30"
              >
                {isUploading ? 'Uploading...' : 'Upload photos'}
              </button>
              {message ? (
                <span className="text-sm text-[color:var(--ink-muted)]">
                  {message}
                </span>
              ) : null}
            </div>
          </div>

          <aside className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_22px_40px_-30px_var(--shadow)] backdrop-blur">
            <h2 className="text-lg font-semibold">Upload queue</h2>
            <p className="mt-1 text-sm text-[color:var(--ink-muted)]">
              We keep everything organized by category, so upload all items of
              one type at a time.
            </p>
            <div className="mt-4 space-y-3">
              {uploadStatus.length === 0 ? (
                <p className="rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm text-[color:var(--ink-muted)]">
                  No files queued yet.
                </p>
              ) : (
                uploadStatus.map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate text-[color:var(--ink)]">
                        {item.name}
                      </span>
                      <span
                        className={`text-xs uppercase tracking-[0.2em] ${
                          item.status === 'complete'
                            ? 'text-[color:var(--teal)]'
                            : item.status === 'error'
                            ? 'text-[color:var(--accent-dark)]'
                            : 'text-[color:var(--ink-muted)]'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    {item.error ? (
                      <p className="mt-2 text-xs text-[color:var(--accent-dark)]">
                        {item.error}
                      </p>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
