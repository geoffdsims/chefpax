import { NextRequest } from 'next/server';

// Simple in-memory rate limiting (for production, use Redis)
const requests = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(limit: number = 10, windowMs: number = 60000) {
  return (request: NextRequest): { success: boolean; limit: number; remaining: number; resetTime: number } => {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean up old entries
    for (const [key, value] of requests.entries()) {
      if (value.resetTime < windowStart) {
        requests.delete(key);
      }
    }
    
    const key = `${ip}-${request.nextUrl.pathname}`;
    const current = requests.get(key);
    
    if (!current || current.resetTime < windowStart) {
      // New window
      requests.set(key, { count: 1, resetTime: now + windowMs });
      return { success: true, limit, remaining: limit - 1, resetTime: now + windowMs };
    }
    
    if (current.count >= limit) {
      // Rate limit exceeded
      return { success: false, limit, remaining: 0, resetTime: current.resetTime };
    }
    
    // Increment count
    current.count++;
    return { success: true, limit, remaining: limit - current.count, resetTime: current.resetTime };
  };
}
