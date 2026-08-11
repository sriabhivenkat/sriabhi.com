import { NextResponse } from 'next/server';
import { getAccessToken } from '../../../../../functions/abhiPcCalls';

export async function POST(req: Request) {
  const { id, content } = await req.json();
  if (!id || typeof content !== 'string') {
    return NextResponse.json({ error: 'Missing id or content' }, { status: 400 });
  }

  const { access_token } = await getAccessToken();

  const form = new FormData();
  const blob = new Blob([content], { type: 'text/markdown' });
  form.append('file', blob, 'post.md');

  const res = await fetch(`https://home.sriabhi.com/api/v1/update_blog_file/${id}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${access_token}` },
    body: form,
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to save post' }, { status: res.status });
  }

  return NextResponse.json({ success: true });
}
