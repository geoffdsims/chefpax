import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Middleware for route protection and security
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes (but allow access to admin login page)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // If no session, redirect to admin login page
    if (!token) {
      const signInUrl = new URL('/admin/login', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Check if user is admin (based on email domain or explicit admin list)
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    const isAdmin = token.email && (
      adminEmails.includes(token.email as string) ||
      (token.email as string).endsWith('@chefpax.com')
    );

    if (!isAdmin) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Protect customer routes (like /account)
  if (pathname.startsWith('/account')) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // If no session, redirect to customer sign-in page
    if (!token) {
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Check if user is admin trying to access customer account
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    const isAdmin = token.email && (
      adminEmails.includes(token.email as string) ||
      (token.email as string).endsWith('@chefpax.com')
    );

    // If admin tries to access customer account, redirect to admin
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // Add security headers to all responses
  const response = NextResponse.next();
  
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // CSP for production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://www.googletagmanager.com https://maps.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.stripe.com https://vitals.vercel-insights.com https://maps.googleapis.com;"
    );
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/account/:path*',
    '/((?!_next/static|_next/image|favicon.ico|public|auth).*)',
  ],
};
