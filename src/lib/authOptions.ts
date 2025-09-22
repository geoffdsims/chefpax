// lib/authOptions.ts
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";

// Only import mongoClient if MongoDB URI is available
let clientPromise: Promise<import("mongodb").MongoClient> | undefined;
try {
  if (process.env.MONGODB_URI) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    clientPromise = require("./mongoClient").default;
  }
} catch {
  console.warn("MongoDB not configured, NextAuth will work without database adapter");
}

export const authOptions: NextAuthOptions = {
  // Only use MongoDB adapter if available
  ...(clientPromise && { adapter: MongoDBAdapter(clientPromise) }),
  providers: [
    // Only add Google provider if credentials are available
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
  callbacks: {
    // expose id on session.user.id
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id?: string; sub?: string }).id ?? (user as { id?: string; sub?: string }).sub ?? token.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { id?: string }).id = (token as { id?: string }).id;
      }
      return session;
    },
  },
};
