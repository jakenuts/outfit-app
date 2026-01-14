'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  clothingTypes,
  prefixForType,
  type ClothingType,
  type WardrobeItem,
} from '@/lib/wardrobe';

type WardrobeState = Record<ClothingType, WardrobeItem[]>;

const emptyWardrobe: WardrobeState = {
  tops: [],
  bottoms: [],
  shoes: [],
};

export default function WardrobePage() {
  const [wardrobe, setWardrobe] = useState<WardrobeState>(emptyWardrobe);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const refreshWardrobe = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const results = await Promise.all(
        clothingTypes.map(async (type) => {
          const response = await fetch(
            `/api/blob/list?prefix=${encodeURIComponent(
              prefixForType(type.id)
            )}`,
            { cache: 'no-store' }
          );

          if (!response.ok) {
            throw new Error(`Failed to load ${type.label.toLowerCase()}`);
          }

          const data = (await response.json()) as {
            blobs?: WardrobeItem[];
          };

          return [type.id, data.blobs ?? []] as const;
        })
      );

      const nextWardrobe = results.reduce(
        (acc, [type, items]) => ({ ...acc, [type]: items }),
        emptyWardrobe
      );

      setWardrobe(nextWardrobe);
    } catch (error) {
      console.error(error);
      setMessage('Unable to load your wardrobe right now.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshWardrobe();
  }, [refreshWardrobe]);

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <nav className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-white/60 bg-white/70 px-6 py-4 shadow-[0_18px_40px_-30px_rgba(27,26,23,0.5)] backdrop-blur">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.4em] text-[color:var(--ink-muted)]">
              Wardrobe Summary
            </p>
            <h1 className="text-2xl font-semibold text-[color:var(--ink)] md:text-3xl">
              Your Closet Index
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/"
              className="rounded-full border border-black/10 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--ink)] transition hover:-translate-y-0.5"
            >
              Generator
            </Link>
            <Link
              href="/upload"
              className="rounded-full border border-black/10 bg-[color:var(--teal)]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--teal)] transition hover:-translate-y-0.5"
            >
              Upload
            </Link>
          </div>
        </nav>

        {message ? (
          <p className="rounded-2xl border border-[color:var(--accent)]/20 bg-[color:var(--accent)]/10 px-4 py-3 text-sm text-[color:var(--accent-dark)]">
            {message}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={refreshWardrobe}
            className="rounded-full border border-black/10 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--ink)] transition hover:-translate-y-0.5 hover:border-black/30"
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh Wardrobe'}
          </button>
          <span className="text-sm text-[color:var(--ink-muted)]">
            {isLoading
              ? 'Loading items...'
              : 'Browse your uploaded items by category.'}
          </span>
        </div>

        <section className="grid gap-6">
          {clothingTypes.map((type) => {
            const items = wardrobe[type.id];
            return (
              <article
                key={type.id}
                className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_22px_40px_-30px_var(--shadow)] backdrop-blur"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-[color:var(--ink-muted)]">
                      {type.label}
                    </p>
                    <p className="text-sm text-[color:var(--ink-muted)]">
                      {type.description}
                    </p>
                  </div>
                  <span className="rounded-full border border-black/10 bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">
                    {items.length} items
                  </span>
                </div>

                {items.length ? (
                  <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {items.slice(0, 12).map((item) => (
                      <div
                        key={item.url}
                        className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white/80 p-3"
                      >
                        <div className="relative aspect-square overflow-hidden rounded-xl border border-white/60 bg-white">
                          <Image
                            src={item.url}
                            alt={item.pathname.replace(prefixForType(type.id), '')}
                            fill
                            sizes="(min-width: 1024px) 160px, (min-width: 640px) 140px, 45vw"
                            className="object-cover"
                          />
                        </div>
                        <p className="truncate text-xs text-[color:var(--ink-muted)]">
                          {item.pathname.replace(prefixForType(type.id), '')}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm text-[color:var(--ink-muted)]">
                    No {type.label.toLowerCase()} uploaded yet.
                  </p>
                )}
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
}
