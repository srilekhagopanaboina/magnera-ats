import type { NextAuthConfig } from 'next-auth'

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/admin/login',
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAdminRoute = nextUrl.pathname.startsWith('/admin/dashboard') ||
        nextUrl.pathname.startsWith('/api/admin')
      if (isAdminRoute) {
        return isLoggedIn
      }
      return true
    },
  },
}
