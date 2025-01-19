import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // List of protected routes
  const protectedRoutes = ["/tasks"];

  if (protectedRoutes.includes(path)) {
    const authToken = request.cookies.get("authToken")?.value;
    console.log("authToken", authToken);
    console.log("All Cookies:", request.cookies.getAll());

    if (!authToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|uploads).*)"],
};
