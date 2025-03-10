import { NextRequest, NextResponse } from "next/server";

// Define role-based access rules
const roleAccess = {
  admin: ["admin"],
  user: ["user"],
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname.split("/").filter(Boolean)

  if (roleAccess.user.includes(url[0])) {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next(); // Allow access if token exists
  }

  // return NextResponse.next();
}

// Apply middleware to protect specific routes
export const config = {
  matcher: ["/user"], // Protect the homepage
};