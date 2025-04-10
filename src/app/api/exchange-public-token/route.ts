import { NextRequest, NextResponse } from "next/server";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';


export async function POST(req: NextRequest) {
    const { public_token } = await req.json();
    console.log('public token', public_token);

    const res = await fetch(`${baseUrl}/api/get-access-token`, { method: 'POST' });
    const res_json = await res.json();
    const access_token = res_json.access_token;

    if (!access_token) {
        return new Response('Failed to fetch access token', { status: 500 });
    }

    const res_access_token = await fetch('https://home.sriabhi.com/api/v1/plaid/exchange_public_token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({
            public_token: public_token,
        }),
    })

    if (!res_access_token.ok) {
        return new Response('Failed to fetch token', { status: 500 });
    }

    const data = await res_access_token.json();
    return NextResponse.json({ access_token: data.access_token, item_id: data.item_id });
}