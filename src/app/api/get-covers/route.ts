import { NextResponse } from 'next/server';
import { getAccessToken } from '../../../../functions/abhiPcCalls';

export async function GET(req: Request) {
  const token = req.headers.get('Authorization');
  const res = await fetch('https://home.sriabhi.com/api/v1/photo/get_covers', {
    headers: { Authorization: token || '' },
  });
  console.log("Response from covers API: ", res);
  const data = await res.json();
  console.log("Covers data: ", data);
  return NextResponse.json(data);
}