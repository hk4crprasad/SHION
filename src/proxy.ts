import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const AUTH_PATHS = ['/login', '/signup', '/verify-email'];
const PUBLIC_API_PREFIXES = ['/api/auth/'];
const STATIC_PREFIXES = ['/_next/', '/fonts/', '/screenshots/', '/weather-ico/', '/favicon'];

function isPublicPath(pathname: string): boolean {
  if (AUTH_PATHS.includes(pathname)) return true;
  if (PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  if (STATIC_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  return false;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always set x-pathname so the root layout can detect auth pages
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  if (isPublicPath(pathname)) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);
    await jwtVerify(token, secret);
    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    // Clear invalid cookie
    response.cookies.set('auth-token', '', { maxAge: 0, path: '/' });
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|fonts/|screenshots/|weather-ico/).*)',
  ],
};
