import { NextRequest, NextResponse } from "next/server";

const baseAccessUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const baseUrl = process.env.NODE_ENV === 'development'
  ? 'http://192.168.1.68:8000'
  : 'https://home.sriabhi.com';


export async function POST(req: NextRequest) {
    const { item_id} = await req.json();
        console.log('item id', item_id);
    
    
        const res = await fetch(`${baseAccessUrl}/api/get-access-token`, { method: 'POST' });
        const res_json = await res.json();
        const access_token = res_json.access_token;
    
        if (!access_token) {
            return new Response('Failed to fetch access token', { status: 500 });
        }

        // get institution id from item id
        const res_institution_id = await fetch(`${baseUrl}/api/v1/get_institution?item_id=${item_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${access_token}`,
            },
        
        })
        const res_institution_id_json = await res_institution_id.json();
    
        const res_add_accounts = await fetch(`${baseUrl}/api/v1/add_institution_accounts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${access_token}`,
            },
            body: JSON.stringify({
                item_id: item_id,
                access_token: res_institution_id_json.access_token,
            }),
        })
        
        return NextResponse.json(res_add_accounts.json(), { status: res_add_accounts.status });
}