import { NextResponse } from 'next/server';
import { getAccessToken } from '../../../../../functions/abhiPcCalls';

export async function POST(req: Request) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { access_token } = await getAccessToken();
  const res = await fetch(`https://home.sriabhi.com/api/v1/pin_post/${id}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to pin post' }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
