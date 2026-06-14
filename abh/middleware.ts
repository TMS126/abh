import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiting (Note: This is per-instance and resets on restart)
// For production, consider using Vercel KV or a similar distributed store.
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // Max requests per window

export function middleware(req: NextRequest) {
  // ── Maintenance Mode ──
  const isMaintenanceMode = false;
  if (isMaintenanceMode) {
    return NextResponse.rewrite(new URL('/maintenance', req.url));
  }

  // ── Basic Rate Limiting ──
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const now = Date.now();
  const limitInfo = rateLimitMap.get(ip) ?? { count: 0, lastReset: now };

  if (now - limitInfo.lastReset > RATE_LIMIT_WINDOW) {
    limitInfo.count = 1;
    limitInfo.lastReset = now;
  } else {
    limitInfo.count++;
  }

  rateLimitMap.set(ip, limitInfo);

  if (limitInfo.count > MAX_REQUESTS) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  return NextResponse.next();
}
