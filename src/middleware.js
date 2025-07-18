import { NextResponse } from 'next/server'
import { parse } from 'cookie'

export async function middleware(request) {
  const pathname = request.nextUrl.pathname

  // Skip middleware for static files and API routes
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next()
  }

  // Parse cookies
  const cookies = parse(request.headers.get('cookie') || '')
  const token = cookies['auth-token']

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/']
  const isPublicRoute = publicRoutes.includes(pathname)

  // Dashboard routes that require authentication
  const isDashboardRoute = pathname.startsWith('/dashboard')

  // If user is not authenticated and trying to access dashboard
  if (!token && isDashboardRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If user is authenticated and trying to access login/register
  if (token && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
