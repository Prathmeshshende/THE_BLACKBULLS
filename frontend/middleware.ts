import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/dashboard-login") || pathname.startsWith("/api/dashboard-auth") || pathname.startsWith("/api/dashboard-logout")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard")) {
    const isAuthenticated = request.cookies.get("dashboard_auth")?.value === "1";
    if (!isAuthenticated) {
      const loginUrl = new URL("/dashboard-login", request.url);
      loginUrl.searchParams.set("next", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/dashboard"],
};
