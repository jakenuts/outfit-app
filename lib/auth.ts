export const authCookieName = 'outfit_gate';
export const authCookieValue = 'allowed';

export const authCookieMaxAge = 60 * 60 * 24 * 30;

export function buildAuthCookieOptions() {
  const domain = process.env.AUTH_COOKIE_DOMAIN;

  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: authCookieMaxAge,
    ...(domain ? { domain } : {}),
  };
}
