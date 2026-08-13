import { NextResponse } from 'next/server';
import { getAccessToken } from '../../../../../functions/abhiPcCalls';
import { requireAuth } from '@/lib/auth';

export async function POST(req: Request) {
  if (!(await requireAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
