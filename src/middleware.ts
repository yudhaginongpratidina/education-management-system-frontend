import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES = [
    '/dashboard',
    '/access-control/menu',
    '/access-control/role',
    '/access-control/role-menu',
    '/profile',
    '/security',
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isAuthenticated = request.cookies.get('authenticated');
    const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

    if (isProtectedRoute && !isAuthenticated) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/login',
        '/dashboard/:path*',
        '/access-control/:path*',
        '/profile/:path*',
        '/security/:path*',
    ],
};
