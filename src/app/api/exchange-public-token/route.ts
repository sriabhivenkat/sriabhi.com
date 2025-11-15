import { NextRequest, NextResponse } from "next/server";
import { addInstitutionAccounts, connectNewInstitution, exchangePublicToken } from "../../../../functions/abhiPcCalls";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';


export async function POST(req: NextRequest) {
    const { public_token, institution_name, institution_id } = await req.json();

    const { access_token, item_id } = await exchangePublicToken(public_token);

    const data = await connectNewInstitution(item_id, access_token, institution_id, institution_name);

    const final_data = await addInstitutionAccounts(item_id, institution_name);

    return NextResponse.json({ message: 'success'}, { status: 200 });
}