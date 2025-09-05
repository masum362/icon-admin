import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  const loginPath = "/auth/login";
  const adminPath = "/admin";
  const isAdminPath = req.nextUrl.pathname.startsWith(adminPath);

  // Redirect logged-in users away from /login
  if (token && req.nextUrl.pathname === loginPath) {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url)); // Redirect to an admin page or another protected route
  }

  // Check if the request path starts with "/admin"
  if (!token && isAdminPath) {
    return NextResponse.redirect(new URL(loginPath, req.url));
  }

  return NextResponse.next();
}

// Protect all routes that start with "/admin" and the "/login" route
export const config = {
  matcher: ["/admin/:path*", "/auth/login"],
};
