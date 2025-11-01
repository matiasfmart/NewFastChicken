import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')
 
  // If no session and trying to access anything under /admin except /admin/login
  if (!session && request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin/login') {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // If there is a session and they try to go to login, redirect to dashboard
  if(session && request.nextUrl.pathname === '/admin/login') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }
 
  return NextResponse.next()
}
 
export const config = {
  matcher: '/admin/:path*',
}
