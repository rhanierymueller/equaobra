import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const PROTECTED_ROUTES = [
  '/profile',
  '/my-teams',
  '/my-contractor',
  '/my-applications',
  '/oportunidades',
  '/team/',
]

export function middleware(request: NextRequest) {
  const token = request.cookies.get('equobra_token')?.value

  const isProtected = PROTECTED_ROUTES.some((route) => request.nextUrl.pathname.startsWith(route))

  if (isProtected && !token) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/my-teams/:path*',
    '/my-contractor/:path*',
    '/my-applications/:path*',
    '/oportunidades/:path*',
    '/team/:path*',
  ],
}
