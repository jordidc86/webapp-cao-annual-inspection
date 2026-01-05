import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Simple MVP Auth: Check for a session cookie or basic header
  // In a real prod environment, this would be a proper JWT or session
  const authCookie = request.cookies.get('cao_session')
  const { pathname } = request.nextUrl

  // Allow access to login page and public assets
  if (pathname.startsWith('/login') || pathname.startsWith('/_next') || pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  if (!authCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
