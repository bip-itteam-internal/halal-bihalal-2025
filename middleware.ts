import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next(); // Allow access if token exists
}

// Apply middleware to protect specific routes
export const config = {
  matcher: ["/user"], // Protect the homepage
};