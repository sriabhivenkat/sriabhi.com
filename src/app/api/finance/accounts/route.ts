import { NextResponse } from 'next/server';
import { getAccessToken } from '../../../../../functions/abhiPcCalls';

export async function GET() {
  const { access_token } = await getAccessToken();

  const res = await fetch('https://home.sriabhi.com/api/v1/get_accounts', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
