import { NextResponse } from 'next/server';

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

export async function GET() {
  const now = Date.now();

  // Return cached token if it exists and isn't expired (with 60s buffer)
  if (cachedToken && tokenExpiry && now < tokenExpiry - 60_000) {
    return NextResponse.json({ access_token: cachedToken });
  }

  const res = await fetch(`${process.env.API_BASE_URL}/api/v1/request_access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: process.env.AUTH_TOKEN_USER,
      password: process.env.AUTH_TOKEN_PASS,
    }),
  });

  if (!res.ok) throw new Error('Failed to fetch access token');

  const data = await res.json();
  cachedToken = data.access_token;

  // Decode expiry from JWT payload
  const payload = JSON.parse(Buffer.from(data.access_token.split('.')[1], 'base64').toString());
  tokenExpiry = payload.exp * 1000; // convert to ms

  return NextResponse.json({ access_token: cachedToken });
}