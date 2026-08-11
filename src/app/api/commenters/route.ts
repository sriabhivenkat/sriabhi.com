import { NextResponse } from 'next/server';
import { getAccessToken } from '../../../../functions/abhiPcCalls';

export async function GET() {
  const { access_token } = await getAccessToken();

  const res = await fetch('https://home.sriabhi.com/api/v1/get_commenters', {
    method: 'GET',
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch commenters' }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
