import { NextResponse } from 'next/server';
import { getAccessToken } from '../../../../../functions/abhiPcCalls';


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { access_token } = await getAccessToken();

    const upstreamRes = await fetch('https://home.sriabhi.com/api/v1/photo/add_photo_metadata', {
      method: "POST",
      headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await upstreamRes.text();
    console.log("Upstream status:", upstreamRes.status, "body:", text);

    if (!upstreamRes.ok) {
      return NextResponse.json(
        { success: false, error: text || upstreamRes.statusText },
        { status: upstreamRes.status }
      );
    }

    const data = JSON.parse(text);
    return NextResponse.json({ success: true, ...data });
  } catch (err) {
    console.error("update_metadata route error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}