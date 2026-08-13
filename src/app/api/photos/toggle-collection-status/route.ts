import { NextResponse } from 'next/server';
import { getAccessToken } from '../../../../../functions/abhiPcCalls';
import { requireAuth } from '@/lib/auth';

export async function POST(req: Request) {
  if (!(await requireAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { collection_id } = await req.json();
  if (!collection_id) return NextResponse.json({ error: 'Missing collection_id' }, { status: 400 });

  const { access_token } = await getAccessToken();
  const res = await fetch(`https://home.sriabhi.com/api/v1/photo/update_col_status/${collection_id}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to toggle collection status' }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
