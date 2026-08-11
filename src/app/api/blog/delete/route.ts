import { NextResponse } from 'next/server';
import { getAccessToken } from '../../../../../functions/abhiPcCalls';

export async function POST(req: Request) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { access_token } = await getAccessToken();
  const res = await fetch(`https://home.sriabhi.com/api/v1/delete/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to delete post' }, { status: res.status });
  }

  return NextResponse.json({ success: true });
}
