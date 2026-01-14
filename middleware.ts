import { NextRequest, NextResponse } from 'next/server';
import { authCookieName, authCookieValue } from '@/lib/auth';

const publicRoutes = new Set(['/api/auth/login']);
const publicPrefixes = ['/_next', '/images', '/favicon.ico', '/_vercel'];
const publicFileRegex = /\.(.*)$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  if (publicFileRegex.test(pathname)) {
    return NextResponse.next();
  }

  if (publicRoutes.has(pathname)) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(authCookieName)?.value;
  const isAuthed = cookie === authCookieValue;

  if (pathname === '/gate') {
    if (isAuthed) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.search = '';
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  if (!isAuthed) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = request.nextUrl.clone();
    url.pathname = '/gate';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
