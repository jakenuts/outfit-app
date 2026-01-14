'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function GatePage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRedirectPath(params.get('from'));
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!password.trim()) {
      setError('Enter the passphrase to continue.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || 'Access denied');
      }

      const nextPath = redirectPath || '/';
      router.push(nextPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Access denied');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <div
        className="absolute inset-0 bg-cover bg-[position:center_35%] md:bg-center"
        style={{ backgroundImage: 'url(/images/castle-gate.png)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-[28px] border border-white/30 bg-white/10 p-6 text-white shadow-[0_30px_60px_-40px_rgba(0,0,0,0.7)] backdrop-blur md:p-8">
          <h1 className="text-3xl font-semibold md:text-4xl">
            The wardrobe awaits.
          </h1>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-xs uppercase tracking-[0.3em] text-white/70"
              >
                Passphrase
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-full border border-white/40 bg-white/15 px-5 py-3 text-base text-white outline-none placeholder:text-white/50 focus:border-white"
                placeholder="Enter access key"
                autoComplete="current-password"
              />
            </div>
            {error ? (
              <p className="rounded-2xl border border-red-200/40 bg-red-500/20 px-4 py-3 text-sm text-red-100">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Opening...' : 'Open the gates'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
