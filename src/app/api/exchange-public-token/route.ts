import { NextRequest, NextResponse } from "next/server";
import { addInstitutionAccounts, connectNewInstitution, exchangePublicToken } from "../../../../functions/abhiPcCalls";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

console.log("route.ts module loaded");
export async function POST(req: NextRequest) {
    console.log("Startign flow")
    const { public_token, institution_name, institution_id } = await req.json();
    console.log("Institution name: ", institution_name)
    console.log("About to exchange public token")
    const { access_token, item_id } = await exchangePublicToken(public_token);
    console.log("Exchanged for item id: ", item_id, " about to connect institution")
    const data = await connectNewInstitution(item_id, access_token, institution_id, institution_name);
    console.log("Connected institution: ", data, "about to add accounts")
    const final_data = await addInstitutionAccounts(item_id, institution_name);
    console.log("Done: ", final_data)

    return NextResponse.json({ message: 'success'}, { status: 200 });
}