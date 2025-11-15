// app/api/get-photo-urls/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getPhotoUrls } from "../../../../functions/abhiPcCalls";

export async function GET(req: NextRequest) {
  try {
    // Get subfolder from query params
    const { searchParams } = new URL(req.url);
    const subfolder = searchParams.get("subfolder");

    if (!subfolder) {
      return NextResponse.json({ error: "Missing subfolder parameter" }, { status: 400 });
    }

    // Fetch photo URLs securely from Oshawott
    const urls = await getPhotoUrls(subfolder);

    return NextResponse.json(urls);
  } catch (err) {
    console.error("Error fetching photo URLs:", err);
    return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 });
  }
}
