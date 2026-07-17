import { NextRequest, NextResponse } from "next/server";

const baseUrl = "http://localhost:8080";

export async function POST(req: NextRequest) {
    const { old_account_id, new_account_id } = await req.json();

    const isServer = typeof window === 'undefined';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
    const accessTokenUrl = `${siteUrl}/api/access-token`;

    const tokenRes = await fetch(accessTokenUrl);
    const { access_token } = await tokenRes.json();

    const res = await fetch(`${baseUrl}/api/v1/plaid/update_account_id`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({ old_account_id, new_account_id }),
    });
    console.log("RES: ", res)
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}