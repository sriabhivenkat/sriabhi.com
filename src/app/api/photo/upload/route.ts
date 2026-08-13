import { NextResponse } from 'next/server';
import { getAccessToken } from '../../../../../functions/abhiPcCalls';
import { requireAuth } from '@/lib/auth';

export async function POST(req: Request) {
  if (!(await requireAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const { access_token } = await getAccessToken();

  const res = await fetch('https://home.sriabhi.com/api/v1/photo/upload_photos', {
    method: 'POST',
    body: formData,
    headers: { Authorization: `Bearer ${access_token}` },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ error: data?.error || 'Failed to upload photo' }, { status: res.status });
  }

  return NextResponse.json(data);
}
