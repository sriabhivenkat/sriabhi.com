import { NextResponse } from 'next/server';
import { getAccessToken } from '../../../../../functions/abhiPcCalls';
import { requireAuth } from '@/lib/auth';

export async function PATCH(req: Request) {
  if (!(await requireAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { transId, category } = await req.json();
  if (!transId || !category) {
    return NextResponse.json({ error: 'Missing transId or category' }, { status: 400 });
  }

  const { access_token } = await getAccessToken();

  const res = await fetch(`https://home.sriabhi.com/api/v1/transactions/${transId}/category`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify({ category }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ error: data?.error ?? `Request failed (${res.status})` }, { status: res.status });
  }

  return NextResponse.json(data);
}
