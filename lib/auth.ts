import { getServerSession, NextAuthOptions } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function session() {
  return getServerSession(authOptions as NextAuthOptions)
}
