import { NextRequest, NextResponse } from "next/server";

const baseAccessUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const baseUrl = process.env.NODE_ENV === 'development'
? 'http://192.168.1.68:8000'
: 'https://home.sriabhi.com';


export async function POST(req: NextRequest) {
    const { item_id, plaid_access_token } = await req.json();
    console.log('item id', item_id);


    const res = await fetch(`${baseAccessUrl}/api/get-access-token`, { method: 'POST' });
    const res_json = await res.json();
    const access_token = res_json.access_token;

    if (!access_token) {
        return new Response('Failed to fetch access token', { status: 500 });
    }

    const res_add_new_institution = await fetch(`${baseUrl}/api/v1/connect_new_institution`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({
            item_id: item_id,
            access_token: plaid_access_token
        }),
    })

    // check if we got 201 created
    if (res_add_new_institution.status !== 201) {
        return new NextResponse('Institution was not created properly', { status: 500 });
    }

    const data = await res_add_new_institution.json();
    
    return NextResponse.json("Institution created successfully", { status: 201 });
}