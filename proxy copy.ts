import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const guestOnlyPaths = ['/auth/login', '/auth/forgot-password', '/auth/reset-password'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;
  const isGuestOnly = guestOnlyPaths.some((path) => pathname.startsWith(path));

  if (isGuestOnly && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = { matcher: ['/auth/login', '/auth/forgot-password', '/auth/reset-password'] };
