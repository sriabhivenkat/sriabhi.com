import { NextResponse } from 'next/server';
import { getAccessToken } from '../../../../../functions/abhiPcCalls';

export async function POST(req: Request) {
  const formData = await req.formData();
  const { access_token } = await getAccessToken();

  const res = await fetch('https://home.sriabhi.com/api/v1/upload_files', {
    method: 'POST',
    body: formData,
    headers: { Authorization: `Bearer ${access_token}` },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ error: data?.error || 'Failed to upload blog' }, { status: res.status });
  }

  return NextResponse.json(data);
}
