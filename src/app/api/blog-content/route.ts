import { NextResponse } from 'next/server';
import { getAccessToken } from '../../../../functions/abhiPcCalls';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const { access_token } = await getAccessToken();

  const listRes = await fetch('https://home.sriabhi.com/api/v1/list_files', {
    headers: { Authorization: `Bearer ${access_token}` },
    next: { revalidate: 60 },
  });

  if (!listRes.ok) {
    return NextResponse.json({ error: 'Failed to look up post' }, { status: listRes.status });
  }

  const posts = await listRes.json();
  const post = posts.find((p: any) => p.id === id);

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const fileRes = await fetch(`https://home.sriabhi.com/${post.file_url}`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!fileRes.ok) {
    return NextResponse.json({ error: 'Failed to load post content' }, { status: fileRes.status });
  }

  const text = await fileRes.text();
  return new NextResponse(text, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
