import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  
  // Admin authentication check using NextAuth
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })
    
    // Check if user is authenticated AND is an admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@chefpax.com'
    
    if (!token || token.email !== adminEmail) {
      // Redirect to login with callback URL
      const loginUrl = new URL('/api/auth/signin', request.url)
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }
  
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
