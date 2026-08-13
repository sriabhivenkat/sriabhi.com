import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "../../../../functions/abhiPcCalls";
import { requireAuth } from '@/lib/auth';

const baseUrl = "http://localhost:8080";

export async function POST(req: NextRequest) {
    if (!(await requireAuth(req))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { mask, new_account_id } = await req.json();

    const { access_token } = await getAccessToken();

    const res = await fetch(`${baseUrl}/api/v1/plaid/update_account_id`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({ mask, new_account_id }),
    });
    console.log("RES: ", res)
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}