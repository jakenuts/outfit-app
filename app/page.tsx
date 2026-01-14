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

  const hasOutfit = useMemo(
    () => clothingTypes.every((type) => outfit[type.id]),
    [outfit]
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
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-wrap items-start justify-between gap-6 rounded-[32px] border border-white/50 bg-white/70 p-8 shadow-[0_24px_60px_-40px_rgba(27,26,23,0.6)] backdrop-blur">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-[color:var(--ink-muted)]">
              Outfit Lab
            </p>
            <h1 className="text-4xl font-semibold text-[color:var(--ink)] md:text-5xl">
              Generate outfits from your wardrobe in seconds.
            </h1>
            <p className="max-w-2xl text-base text-[color:var(--ink-muted)] md:text-lg">
              Upload your tops, bottoms, and shoes. The generator stacks them
              into a single preview.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-[color:var(--ink-muted)]">
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
          </div>
          <div className="flex flex-col gap-3">
            <Link
              href="/upload"
              className="rounded-full border border-black/10 bg-[color:var(--teal)]/10 px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--teal)] transition hover:-translate-y-0.5"
            >
              Upload Items
            </Link>
          </div>
        </header>

        {message ? (
          <p className="rounded-2xl border border-[color:var(--accent)]/20 bg-[color:var(--accent)]/10 px-4 py-3 text-sm text-[color:var(--accent-dark)]">
            {message}
          </p>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.42fr)]">
          <div className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_50px_-30px_var(--shadow)] backdrop-blur">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9)_0%,_rgba(255,255,255,0)_60%),linear-gradient(140deg,_rgba(255,221,191,0.6)_0%,_rgba(190,235,236,0.5)_60%,_rgba(255,255,255,0.8)_100%)]" />
            <div className="relative z-10 flex min-h-[560px] flex-col">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-[color:var(--ink-muted)]">
                    Outfit Preview
                  </p>
                  <p className="text-sm text-[color:var(--ink-muted)]">
                    {hasOutfit
                      ? 'Tap generate to shuffle another look.'
                      : 'Generate an outfit to see the stack.'}
                  </p>
                </div>
                <span className="rounded-full border border-black/10 bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">
                  {hasOutfit ? 'Ready' : 'Waiting'}
                </span>
              </div>

              <div className="relative mt-6 flex-1">
                {hasOutfit ? (
                  <div className="relative mx-auto h-[520px] w-full max-w-sm sm:h-[640px]">
                    <div className="absolute left-1/2 top-0 h-[45%] w-[90%] -translate-x-1/2">
                      {outfit.tops ? (
                        <Image
                          src={outfit.tops.url}
                          alt="Top selection"
                          fill
                          sizes="(min-width: 1024px) 420px, (min-width: 640px) 360px, 90vw"
                          className="object-contain drop-shadow-[0_22px_45px_rgba(27,26,23,0.22)]"
                        />
                      ) : null}
                    </div>
                    <div className="absolute left-1/2 top-[36%] h-[52%] w-[82%] -translate-x-1/2">
                      {outfit.bottoms ? (
                        <Image
                          src={outfit.bottoms.url}
                          alt="Bottom selection"
                          fill
                          sizes="(min-width: 1024px) 380px, (min-width: 640px) 330px, 86vw"
                          className="object-contain drop-shadow-[0_24px_45px_rgba(27,26,23,0.22)]"
                        />
                      ) : null}
                    </div>
                    <div className="absolute left-1/2 bottom-0 h-[22%] w-[72%] -translate-x-1/2">
                      {outfit.shoes ? (
                        <Image
                          src={outfit.shoes.url}
                          alt="Shoes selection"
                          fill
                          sizes="(min-width: 1024px) 320px, (min-width: 640px) 280px, 80vw"
                          className="object-contain drop-shadow-[0_18px_35px_rgba(27,26,23,0.22)]"
                        />
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <p className="text-lg font-semibold text-[color:var(--ink)]">
                      No outfit yet
                    </p>
                    <p className="mt-2 max-w-sm text-sm text-[color:var(--ink-muted)]">
                      Upload items, then tap generate to see a combined preview
                      of tops, bottoms, and shoes.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={generateOutfit}
                  className="rounded-full bg-[color:var(--accent)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white shadow-[0_16px_30px_-18px_rgba(228,90,42,0.9)] transition hover:-translate-y-0.5"
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
              </div>
            </div>
          </div>

          <aside className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_22px_40px_-30px_var(--shadow)] backdrop-blur">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.35em] text-[color:var(--ink-muted)]">
                Selected Pieces
              </p>
              <span className="rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs text-[color:var(--ink-muted)]">
                {totalCount} total
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {clothingTypes.map((type) => {
                const item = outfit[type.id];
                return (
                  <div
                    key={type.id}
                    className="flex items-center gap-4 rounded-2xl border border-black/10 bg-white/80 p-3"
                  >
                    <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-white/60 bg-white">
                      {item ? (
                        <Image
                          src={item.url}
                          alt={`${type.label} thumbnail`}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-[color:var(--ink-muted)]">
                          --
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">
                        {type.label}
                      </p>
                      <p className="truncate text-sm text-[color:var(--ink)]">
                        {item
                          ? item.pathname.replace(prefixForType(type.id), '')
                          : 'No selection yet'}
                      </p>
                    </div>
                    <span className="text-xs text-[color:var(--ink-muted)]">
                      {wardrobe[type.id].length}
                    </span>
                  </div>
                );
              })}
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
