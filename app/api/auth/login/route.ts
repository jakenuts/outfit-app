import { NextRequest, NextResponse } from 'next/server';
import { authCookieName, authCookieValue, buildAuthCookieOptions } from '@/lib/auth';

const password = process.env.AUTH_PASSWORD ?? 'alex';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { password?: string };

    if (!body?.password || body.password !== password) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(authCookieName, authCookieValue, buildAuthCookieOptions());
    return response;
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Unable to sign in' }, { status: 400 });
  }
}
