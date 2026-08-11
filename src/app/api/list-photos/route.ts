import { NextResponse } from 'next/server';
import { getAccessToken, getPhotoUrls } from '../../../../functions/abhiPcCalls';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const folder = searchParams.get('folder');
  const limit = searchParams.get('limit');

  if (!folder) {
    return NextResponse.json({ error: 'Missing folder' }, { status: 400 });
  }

  const { access_token } = await getAccessToken();
  const data = await getPhotoUrls(folder, access_token, limit ? Number(limit) : undefined);

  return NextResponse.json(data);
}
