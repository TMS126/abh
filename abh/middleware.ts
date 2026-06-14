import { NextResponse } from 'next/server';

export function middleware(req) {
  const isMaintenanceMode = false; // Site is now LIVE
  if (isMaintenanceMode) {
    return NextResponse.rewrite(new URL('/maintenance', req.url));
  }
}
