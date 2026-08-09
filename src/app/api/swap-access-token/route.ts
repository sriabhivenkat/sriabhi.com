import { NextRequest, NextResponse } from "next/server";
import { exchangePublicToken, getAccessToken } from "../../../../functions/abhiPcCalls";

const baseUrl = "http://localhost:8080";

export async function POST(req: NextRequest) {
    const { public_token, existing_item_id } = await req.json();

    console.log("Exchanging public token for fresh access token...");
    const { access_token: new_plaid_token, item_id: new_item_id } = await exchangePublicToken(public_token);
    console.log("Got new access token, new item_id from Plaid:", new_item_id);

    const { access_token } = await getAccessToken();

    const res = await fetch(`${baseUrl}/api/v1/swap_access_token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({
            access_token: new_plaid_token,
            existing_item_id,
        }),
    });

    const data = await res.json();
    console.log("Swap result:", data);
    return NextResponse.json(data, { status: res.status });
}