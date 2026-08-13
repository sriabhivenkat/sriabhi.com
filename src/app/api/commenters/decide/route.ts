import { NextResponse } from 'next/server';
import { getAccessToken } from '../../../../../functions/abhiPcCalls';
import { requireAuth } from '@/lib/auth';

export async function POST(req: Request) {
  if (!(await requireAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, decision } = await req.json();
  if (!id || !['approve', 'block', 'unblock'].includes(decision)) {
    return NextResponse.json({ error: 'Missing id or invalid decision' }, { status: 400 });
  }

  const { access_token } = await getAccessToken();

  const url =
    decision === 'approve'
      ? `https://home.sriabhi.com/api/v1/approve_commenter/${id}`
      : `https://home.sriabhi.com/api/v1/block_commenter/${id}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access_token}`,
      ...(decision !== 'approve' ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(decision === 'block' ? { body: JSON.stringify({ action: 'BLOCK' }) } : {}),
    ...(decision === 'unblock' ? { body: JSON.stringify({ action: 'UNBLOCK' }) } : {}),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return NextResponse.json({ error: data?.error ?? `Request failed (${res.status})` }, { status: res.status });
  }

  return NextResponse.json({ success: true });
}
