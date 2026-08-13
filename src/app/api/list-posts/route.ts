import { NextResponse } from 'next/server';
import { getAccessToken } from '../../../../functions/abhiPcCalls';
import { requireAuth } from '@/lib/auth';

export async function GET(req: Request) {
  const { access_token } = await getAccessToken();

  const res = await fetch('https://home.sriabhi.com/api/v1/list_files', {
    headers: { Authorization: `Bearer ${access_token}` },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to list posts' }, { status: res.status });
  }

  const data = await res.json();

  if (await requireAuth(req)) {
    return NextResponse.json(data);
  }

  const publicData = Array.isArray(data) ? data.filter((p: any) => p.active) : data;
  return NextResponse.json(publicData);
}
