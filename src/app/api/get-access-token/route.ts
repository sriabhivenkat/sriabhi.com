import { NextResponse } from 'next/server';

const baseUrl = process.env.NODE_ENV === 'development'
  ? 'http://192.168.1.68:8000'
  : 'https://home.sriabhi.com';

export async function POST() {
    console.log("getting access token", baseUrl);
    const res = await fetch(`${baseUrl}/api/v1/request_access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        username: process.env.ABHI_PC_ACCESS_TOKEN_USER,
        password: process.env.ABHI_PC_ACCESS_TOKEN_PASS,
      }),
    });
  
    if (!res.ok) {
      return new NextResponse('Failed to fetch token', { status: 500 });
    }
  
    const data = await res.json();
    console.log('access token', data.access_token);
    return NextResponse.json({ access_token: data.access_token, item_id: data.item_id });
  }