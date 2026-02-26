import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const IS_COMING_SOON = process.env.NEXT_PUBLIC_COMING_SOON === "true";

export function middleware(request: NextRequest) {
  if (!IS_COMING_SOON) return NextResponse.next();

  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/dashboard")
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/dashboard/:path*"],
};
