// lib/authOptions.ts
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import EmailProvider from "next-auth/providers/email";
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
    // Google OAuth - Primary customer login
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
    // Email Magic Link - Customer signup/login
    ...(process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL && clientPromise ? [
      EmailProvider({
        server: {
          host: 'smtp.sendgrid.net',
          port: 587,
          auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY
          }
        },
        from: process.env.SENDGRID_FROM_EMAIL
      })
    ] : []),
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
