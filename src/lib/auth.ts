import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { $Enums } from "@/generated/prisma"

type AdminRole = $Enums.AdminRole

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password harus diisi")
        }

        try {
          // Find admin by email
          const admin = await prisma.admin.findUnique({
            where: {
              email: credentials.email
            }
          })

          if (!admin) {
            throw new Error("Email atau password salah")
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(credentials.password, admin.password)

          if (!isPasswordValid) {
            throw new Error("Email atau password salah")
          }

          // Return user object
          return {
            id: admin.id.toString(),
            email: admin.email,
            name: admin.name,
            username: admin.username,
            role: admin.role,
          }
        } catch (error) {
          console.error("Auth error:", error)
          throw new Error("Terjadi kesalahan saat login")
        }
      }
    })
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.username = user.username
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as AdminRole
        session.user.username = token.username as string
      }
      return session
    }
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
