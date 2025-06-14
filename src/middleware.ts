import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Check if accessing admin routes
    if (pathname.startsWith('/admin')) {
      // Allow access to login page
      if (pathname === '/admin/login') {
        // If already logged in, redirect to admin dashboard
        if (token) {
          return NextResponse.redirect(new URL('/admin', req.url))
        }
        return NextResponse.next()
      }

      // For other admin routes, require authentication
      if (!token) {
        return NextResponse.redirect(new URL('/admin/login', req.url))
      }

      // Check role-based access
      if (pathname.startsWith('/admin/users') || pathname.startsWith('/admin/admins')) {
        // Only SUPER_ADMIN can access user management
        if (token.role !== 'SUPER_ADMIN') {
          return NextResponse.redirect(new URL('/admin', req.url))
        }
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Allow public routes
        if (!pathname.startsWith('/admin')) {
          return true
        }

        // Allow login page without token
        if (pathname === '/admin/login') {
          return true
        }

        // Require token for admin routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}
