import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { createSessionToken, COOKIE_NAME, MAX_AGE_SECONDS } from "@/lib/auth";

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function POST(req: Request) {
  const { username, password } = await req.json();

  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  const ok =
    !!adminUsername &&
    !!adminPassword &&
    typeof username === "string" &&
    typeof password === "string" &&
    safeEqual(username, adminUsername) &&
    safeEqual(password, adminPassword);

  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await createSessionToken();
  const res = NextResponse.json({ success: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
  return res;
}
