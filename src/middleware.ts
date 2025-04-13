import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of public routes that don't require authentication
const publicRoutes = ['/login'];

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.get('isAuthenticated')?.value === 'true';
  const path = request.nextUrl.pathname;

  // Allow access to public routes regardless of authentication
  if (publicRoutes.includes(path)) {
    return NextResponse.next();
  }

  // If not authenticated and trying to access a protected route, redirect to login
  if (!isAuthenticated) {
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }

  // If authenticated, allow access to protected routes
  return NextResponse.next();
}

// Match all routes except for static files, api routes, and _next
export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
