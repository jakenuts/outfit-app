'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import {
  clothingTypes,
  prefixForType,
  type ClothingType,
  type WardrobeItem,
} from '@/lib/wardrobe';

type WardrobeState = Record<ClothingType, WardrobeItem[]>;

type OutfitState = Record<ClothingType, WardrobeItem | null>;

const emptyWardrobe: WardrobeState = {
  tops: [],
  bottoms: [],
  shoes: [],
};

const emptyOutfit: OutfitState = {
  tops: null,
  bottoms: null,
  shoes: null,
};

function pickRandom(items: WardrobeItem[]): WardrobeItem | null {
  if (!items.length) return null;
  const index = Math.floor(Math.random() * items.length);
  return items[index] ?? null;
}

export default function Home() {
  const [wardrobe, setWardrobe] = useState<WardrobeState>(emptyWardrobe);
  const [outfit, setOutfit] = useState<OutfitState>(emptyOutfit);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const totalCount = useMemo(
    () =>
      clothingTypes.reduce(
        (total, type) => total + wardrobe[type.id].length,
        0
      ),
    [wardrobe]
  );

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
      return nextWardrobe;
    } catch (error) {
      console.error(error);
      setMessage('Unable to load your wardrobe right now.');
      return wardrobe;
    } finally {
      setIsLoading(false);
    }
  }, [wardrobe]);

  const generateOutfit = useCallback(async () => {
    setMessage(null);
    const currentWardrobe = totalCount ? wardrobe : await refreshWardrobe();

    const missing = clothingTypes
      .filter((type) => currentWardrobe[type.id].length === 0)
      .map((type) => type.label);

    if (missing.length) {
      setMessage(`Add at least one item for: ${missing.join(', ')}.`);
      setOutfit(emptyOutfit);
      return;
    }

    const nextOutfit: OutfitState = {
      tops: pickRandom(currentWardrobe.tops),
      bottoms: pickRandom(currentWardrobe.bottoms),
      shoes: pickRandom(currentWardrobe.shoes),
    };

    setOutfit(nextOutfit);
  }, [refreshWardrobe, totalCount, wardrobe]);

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="flex flex-col gap-6 rounded-[32px] border border-white/50 bg-white/70 p-8 shadow-[0_24px_60px_-40px_rgba(27,26,23,0.6)] backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.4em] text-[color:var(--ink-muted)]">
                Outfit Lab
              </p>
              <h1 className="text-4xl font-semibold text-[color:var(--ink)] md:text-5xl">
                Generate outfits from your wardrobe in seconds.
              </h1>
              <p className="max-w-2xl text-base text-[color:var(--ink-muted)] md:text-lg">
                Upload your tops, bottoms, and shoes. The generator pulls a
                fresh combination each time.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={generateOutfit}
                className="rounded-full bg-[color:var(--accent)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-[0_16px_30px_-18px_rgba(228,90,42,0.9)] transition hover:-translate-y-0.5 hover:bg-[color:var(--accent-dark)]"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Generate Outfit'}
              </button>
              <button
                type="button"
                onClick={refreshWardrobe}
                className="rounded-full border border-black/10 bg-white/80 px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--ink)] transition hover:-translate-y-0.5 hover:border-black/30"
                disabled={isLoading}
              >
                Refresh Wardrobe
              </button>
              <Link
                href="/upload"
                className="rounded-full border border-black/10 bg-[color:var(--teal)]/10 px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--teal)] transition hover:-translate-y-0.5"
              >
                Upload Items
              </Link>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm text-[color:var(--ink-muted)]">
            <span className="rounded-full border border-black/10 bg-white/80 px-4 py-2">
              Total items: {totalCount}
            </span>
            {clothingTypes.map((type) => (
              <span
                key={type.id}
                className="rounded-full border border-black/10 bg-white/80 px-4 py-2"
              >
                {type.label}: {wardrobe[type.id].length}
              </span>
            ))}
          </div>
          {message ? (
            <p className="rounded-2xl border border-[color:var(--accent)]/20 bg-[color:var(--accent)]/10 px-4 py-3 text-sm text-[color:var(--accent-dark)]">
              {message}
            </p>
          ) : null}
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          {clothingTypes.map((type) => {
            const item = outfit[type.id];
            return (
              <article
                key={type.id}
                className="relative flex h-full flex-col overflow-hidden rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_22px_40px_-30px_var(--shadow)] backdrop-blur"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">
                    {type.label}
                  </p>
                  <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs text-[color:var(--ink-muted)]">
                    {wardrobe[type.id].length} pieces
                  </span>
                </div>
                <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-4 text-center">
                  {item ? (
                    <>
                      <div className="relative h-52 w-full overflow-hidden rounded-2xl border border-white/50 bg-white shadow-[0_18px_40px_-28px_rgba(27,26,23,0.4)]">
                        <Image
                          src={item.url}
                          alt={`${type.label} selection`}
                          fill
                          sizes="(min-width: 1024px) 24vw, (min-width: 768px) 40vw, 90vw"
                          className="object-cover"
                        />
                      </div>
                      <p className="text-sm text-[color:var(--ink-muted)]">
                        {item.pathname.replace(prefixForType(type.id), '')}
                      </p>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-[color:var(--ink)]">
                        No pick yet
                      </p>
                      <p className="text-sm text-[color:var(--ink-muted)]">
                        Generate an outfit to see a random piece.
                      </p>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
}
