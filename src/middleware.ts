import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  
  // Handle chefpax.shop domain - redirect to shop page
  if (hostname === 'chefpax.shop') {
    // If already on shop page or shop sub-pages, allow through
    if (request.nextUrl.pathname.startsWith('/shop')) {
      return NextResponse.next()
    }
    
    // Redirect everything else to shop page
    return NextResponse.redirect(new URL('/shop', request.url))
  }
  
  // For chefpax.com and other domains, continue normally
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
