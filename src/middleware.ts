import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public paths that do not require authentication
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/send-otp",
  "/api/auth/verify-otp",
  "/api/auth/logout",
  "/api/auth/me",
];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Allow public static assets and icons
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/favicon.ico" ||
    pathname === "/logo.png" ||
    pathname === "/logo_cropped.png" ||
    pathname === "/manifest.json" ||
    pathname.startsWith("/icons")
  ) {
    return NextResponse.next();
  }

  // 2. Determine auth page
  const isAuthPage = pathname === "/login" || pathname === "/register";

  // Check authentication cookie (Task 2: Mobile Application Authentication)
  const sessionCookie = request.cookies.get("ad8_session")?.value;
  const isAuthenticated = Boolean(sessionCookie && sessionCookie.trim().length > 0 && sessionCookie !== "guest");

  // 3. If unauthenticated, block direct navigation to protected application screens
  if (!isAuthenticated && !isAuthPage) {
    // If it's a backend API request (e.g. /api/upload)
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        {
          success: false,
          message: "અનધિકૃત પ્રવેશ. કૃપા કરીને પ્રથમ લૉગિન કરો (Unauthorized. Please log in).",
        },
        { status: 401 }
      );
    }

    // Direct page navigation: preserve deep link callback
    const loginUrl = new URL("/login", request.url);
    const destination = pathname + search;
    if (destination && destination !== "/") {
      loginUrl.searchParams.set("callbackUrl", destination);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 4. If already authenticated user visits /login or /register, redirect to destination
  if (isAuthenticated && isAuthPage) {
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
    if (callbackUrl && !callbackUrl.startsWith("/login") && !callbackUrl.startsWith("/register")) {
      return NextResponse.redirect(new URL(callbackUrl, request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, logo.png, logo_cropped.png, manifest.json
     */
    "/((?!_next/static|_next/image|favicon.ico|logo.png|logo_cropped.png|manifest.json).*)",
  ],
};

