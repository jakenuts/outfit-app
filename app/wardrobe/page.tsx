'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  clothingTypes,
  prefixForType,
  type ClothingType,
  type WardrobeItem,
} from '@/lib/wardrobe';

type WardrobeBucket = {
  items: WardrobeItem[];
  cursor: string | null;
  hasMore: boolean;
  isLoading: boolean;
};

type WardrobeBuckets = Record<ClothingType, WardrobeBucket>;

const PAGE_SIZE = 24;

const emptyBucket: WardrobeBucket = {
  items: [],
  cursor: null,
  hasMore: true,
  isLoading: false,
};

const createBuckets = (): WardrobeBuckets => ({
  tops: { ...emptyBucket },
  bottoms: { ...emptyBucket },
  shoes: { ...emptyBucket },
});

const otherTypes = (current: ClothingType) =>
  clothingTypes.filter((type) => type.id !== current);

export default function WardrobePage() {
  const [activeType, setActiveType] = useState<ClothingType>('tops');
  const [buckets, setBuckets] = useState<WardrobeBuckets>(createBuckets);
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [pendingUrls, setPendingUrls] = useState<Record<string, boolean>>({});

  const activeBucket = buckets[activeType];

  const filteredItems = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return activeBucket.items;

    return activeBucket.items.filter((item) =>
      item.pathname.toLowerCase().includes(term)
    );
  }, [activeBucket.items, query]);

  const setBucketState = useCallback(
    (type: ClothingType, updater: (bucket: WardrobeBucket) => WardrobeBucket) => {
      setBuckets((prev) => ({ ...prev, [type]: updater(prev[type]) }));
    },
    []
  );

  const loadItems = useCallback(
    async (type: ClothingType, options?: { reset?: boolean }) => {
      setMessage(null);
      setBucketState(type, (bucket) => ({
        ...bucket,
        isLoading: true,
        ...(options?.reset ? { cursor: null, items: [] } : {}),
      }));

      try {
        const bucket = buckets[type];
        const cursor = options?.reset ? undefined : bucket.cursor || undefined;
        const params = new URLSearchParams({
          type,
          limit: PAGE_SIZE.toString(),
        });

        if (cursor) {
          params.set('cursor', cursor);
        }

        const response = await fetch(`/api/wardrobe/list?${params.toString()}`);

        if (!response.ok) {
          const data = (await response.json()) as { error?: string };
          throw new Error(data.error || 'Failed to load items');
        }

        const data = (await response.json()) as {
          items: WardrobeItem[];
          nextCursor?: string;
          hasMore: boolean;
        };

        setBucketState(type, (current) => ({
          ...current,
          items: options?.reset
            ? data.items
            : [...current.items, ...data.items],
          cursor: data.nextCursor ?? null,
          hasMore: data.hasMore,
          isLoading: false,
        }));
      } catch (error) {
        console.error(error);
        setMessage(
          error instanceof Error
            ? error.message
            : 'Unable to load wardrobe items.'
        );
        setBucketState(type, (bucket) => ({ ...bucket, isLoading: false }));
      }
    },
    [buckets, setBucketState]
  );

  useEffect(() => {
    if (!activeBucket.items.length && activeBucket.hasMore) {
      void loadItems(activeType, { reset: true });
    }
  }, [activeBucket.hasMore, activeBucket.items.length, activeType, loadItems]);

  const refreshActive = () => {
    void loadItems(activeType, { reset: true });
  };

  const markPending = (url: string, value: boolean) => {
    setPendingUrls((prev) => ({ ...prev, [url]: value }));
  };

  const handleDelete = async (item: WardrobeItem) => {
    if (!window.confirm('Delete this item? This cannot be undone.')) {
      return;
    }

    markPending(item.url, true);
    setMessage(null);

    try {
      const response = await fetch('/api/wardrobe/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: item.url }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || 'Delete failed');
      }

      setBucketState(activeType, (bucket) => ({
        ...bucket,
        items: bucket.items.filter((current) => current.url !== item.url),
      }));
    } catch (error) {
      console.error(error);
      setMessage(
        error instanceof Error ? error.message : 'Unable to delete item.'
      );
    } finally {
      markPending(item.url, false);
    }
  };

  const handleMove = async (item: WardrobeItem, toType: ClothingType) => {
    if (toType === activeType) {
      return;
    }

    markPending(item.url, true);
    setMessage(null);

    try {
      const response = await fetch('/api/wardrobe/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: item.url, toType }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || 'Move failed');
      }

      const data = (await response.json()) as {
        item: WardrobeItem;
        toType: ClothingType;
      };

      setBucketState(activeType, (bucket) => ({
        ...bucket,
        items: bucket.items.filter((current) => current.url !== item.url),
      }));

      setBucketState(data.toType, (bucket) => ({
        ...bucket,
        items: [data.item, ...bucket.items],
      }));
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : 'Unable to move item.');
    } finally {
      markPending(item.url, false);
    }
  };

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <nav className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-white/60 bg-white/70 px-6 py-4 shadow-[0_18px_40px_-30px_rgba(27,26,23,0.5)] backdrop-blur">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.4em] text-[color:var(--ink-muted)]">
              Wardrobe Manager
            </p>
            <h1 className="text-2xl font-semibold text-[color:var(--ink)] md:text-3xl">
              Sort, search, and retag your pieces
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

        <section className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_22px_40px_-30px_var(--shadow)] backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {clothingTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setActiveType(type.id)}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition ${
                    activeType === type.id
                      ? 'border-[color:var(--accent)] bg-[color:var(--accent)]/15 text-[color:var(--accent-dark)]'
                      : 'border-black/10 bg-white/80 text-[color:var(--ink)] hover:border-black/30'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by filename"
                className="w-52 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm text-[color:var(--ink)] outline-none focus:border-[color:var(--accent)]"
              />
              <button
                type="button"
                onClick={refreshActive}
                className="rounded-full border border-black/10 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--ink)] transition hover:-translate-y-0.5 hover:border-black/30"
                disabled={activeBucket.isLoading}
              >
                {activeBucket.isLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">
            <span className="rounded-full border border-black/10 bg-white/80 px-3 py-1">
              Loaded {filteredItems.length}
            </span>
            <span className="rounded-full border border-black/10 bg-white/80 px-3 py-1">
              Total in view {activeBucket.items.length}
            </span>
            <span className="rounded-full border border-black/10 bg-white/80 px-3 py-1">
              {activeBucket.hasMore ? 'More available' : 'End of list'}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filteredItems.map((item) => (
              <div
                key={item.url}
                className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white/80 p-3"
              >
                <div className="relative aspect-square overflow-hidden rounded-xl border border-white/60 bg-white">
                  <Image
                    src={item.url}
                    alt={item.pathname.replace(prefixForType(activeType), '')}
                    fill
                    sizes="(min-width: 1024px) 180px, (min-width: 640px) 160px, 45vw"
                    className="object-cover"
                  />
                </div>
                <p className="truncate text-xs text-[color:var(--ink-muted)]">
                  {item.pathname.replace(prefixForType(activeType), '')}
                </p>
                <div className="flex items-center gap-2">
                  <select
                    defaultValue=""
                    onChange={(event) => {
                      const nextType = event.target.value as ClothingType;
                      if (nextType) {
                        void handleMove(item, nextType);
                      }
                      event.currentTarget.value = '';
                    }}
                    className="flex-1 rounded-full border border-black/10 bg-white px-3 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--ink)]"
                    disabled={pendingUrls[item.url]}
                  >
                    <option value="">Move to...</option>
                    {otherTypes(activeType).map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => void handleDelete(item)}
                    className="rounded-full border border-red-200/60 bg-red-100/70 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-700"
                    disabled={pendingUrls[item.url]}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {activeBucket.items.length === 0 && !activeBucket.isLoading ? (
            <p className="mt-6 rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm text-[color:var(--ink-muted)]">
              No {activeType} uploaded yet. Head to Upload to add items.
            </p>
          ) : null}

          {activeBucket.hasMore ? (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => void loadItems(activeType)}
                disabled={activeBucket.isLoading}
                className="rounded-full border border-black/10 bg-white/80 px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--ink)] transition hover:-translate-y-0.5 hover:border-black/30"
              >
                {activeBucket.isLoading ? 'Loading...' : 'Load more'}
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
