import { $Enums } from "@/generated/prisma"
import { DefaultSession } from "next-auth"

type AdminRole = $Enums.AdminRole

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: AdminRole
      username: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: AdminRole
    username: string
    email: string
    name: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: AdminRole
    username: string
  }
}
