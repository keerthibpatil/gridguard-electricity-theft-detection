import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow the login page and login API without authentication.
  if (
    pathname === "/login" ||
    pathname.startsWith("/api/auth/login")
  ) {
    return NextResponse.next();
  }

  // Check whether a session cookie exists.
  const session = request.cookies.get("gridguard_session");

  if (!session) {
    // API requests receive an unauthorized response.
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, message: "Please log in first." },
        { status: 401 }
      );
    }

    // Page requests are redirected to login.
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};