// lib/authOptions.ts
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import CredentialsProvider from "next-auth/providers/credentials";
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

// Debug: Log environment variables
console.log('🔍 Auth Options Debug:', {
  hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
  hasGoogleSecret: !!process.env.GOOGLE_CLIENT_SECRET,
  clientIdLength: process.env.GOOGLE_CLIENT_ID?.length,
  nodeEnv: process.env.NODE_ENV,
});

export const authOptions: NextAuthOptions = {
  // Only use MongoDB adapter if available
  ...(clientPromise && { adapter: MongoDBAdapter(clientPromise) }),
  providers: [
    // Google OAuth provider for admin and customer login
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
    // Admin credentials provider with password check
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const adminEmail = process.env.ADMIN_EMAIL || 'geoff@chefpax.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'chefpax2024';

        // Verify BOTH email and password match
        if (
          credentials?.email === adminEmail && 
          credentials?.password === adminPassword
        ) {
          return {
            id: "admin-1",
            email: adminEmail,
            name: "ChefPax Admin",
          };
        }
        
        // Invalid credentials
        return null;
      }
    }),
    // Only add Apple provider if credentials are available
    ...(process.env.APPLE_ID && process.env.APPLE_SECRET ? [
      AppleProvider({
        clientId: process.env.APPLE_ID,
        clientSecret: process.env.APPLE_SECRET,
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
