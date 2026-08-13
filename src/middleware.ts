import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/internal/login") {
    return NextResponse.next();
  }

  const token = req.cookies.get("session")?.value;
  if (token) {
    try {
      const secret = process.env.SESSION_SECRET;
      if (secret) {
        await jwtVerify(token, new TextEncoder().encode(secret));
        return NextResponse.next();
      }
    } catch {
      // fall through to redirect
    }
  }

  const loginUrl = new URL("/internal/login", req.url);
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/internal/:path*"],
};
