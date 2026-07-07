import { NextResponse } from 'next/server';

export async function GET() {
  // Fetch token directly instead of calling our own API route
  const tokenRes = await fetch(`${process.env.API_BASE_URL}/api/v1/request_access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: process.env.AUTH_TOKEN_USER,
      password: process.env.AUTH_TOKEN_PASS,
    }),
  });

  const { access_token } = await tokenRes.json();

  const res = await fetch(`${process.env.API_BASE_URL}/api/v1/photo/collections`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!res.ok) throw new Error('Failed to fetch collections');

  const data = await res.json();
  return NextResponse.json(data);
}