import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public navigation routes accessible without login on desktop & web
const PUBLIC_NAV_ROUTES = [
  "/",
  "/members",
  "/businesses",
  "/jobs",
  "/advertisements",
  "/events",
  "/donations",
  "/committee",
  "/matrimony",
  "/circulars",
  "/announcements",
];

// Helper to determine if a route is a public browsing tab or subpage
const isPublicNavRoute = (pathname: string) => {
  if (PUBLIC_NAV_ROUTES.includes(pathname)) return true;
  if (pathname.startsWith("/events/")) return true;
  if (pathname.startsWith("/businesses/")) return true;
  if (pathname.startsWith("/circulars/")) return true;
  if (pathname.startsWith("/announcements/")) return true;
  return false;
};

// Routes that strictly require user login
const isStrictlyProtectedPage = (pathname: string) => {
  return (
    pathname === "/profile" ||
    pathname.startsWith("/profile/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/family-tree" ||
    pathname.startsWith("/family-tree/")
  );
};

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Allow public static assets and icons
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.json" ||
    pathname.startsWith("/icon") ||
    pathname.startsWith("/logo") ||
    pathname.startsWith("/apple-touch-icon") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".webp")
  ) {
    return NextResponse.next();
  }

  // 2. Allow public GET APIs (e.g. dynamic members directory for navbar tabs)
  if (pathname === "/api/members" && request.method === "GET") {
    return NextResponse.next();
  }

  // 3. Determine auth page
  const isAuthPage = pathname === "/login" || pathname === "/register";

  // Check authentication cookie
  const sessionCookie = request.cookies.get("ad8_session")?.value;
  const isAuthenticated = Boolean(
    sessionCookie && sessionCookie.trim().length > 0 && sessionCookie !== "guest"
  );

  // 4. If unauthenticated, allow all navbar tabs on desktop so visitors can see all lists
  if (!isAuthenticated && !isAuthPage) {
    // If user is accessing a public navigation tab, allow direct access
    if (isPublicNavRoute(pathname)) {
      return NextResponse.next();
    }

    // If it's a backend protected API request (e.g. /api/upload, /api/profile)
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        {
          success: false,
          message: "અનધિકૃત પ્રવેશ. કૃપા કરીને પ્રથમ લૉગિન કરો (Unauthorized. Please log in).",
        },
        { status: 401 }
      );
    }

    // Direct page navigation for strictly protected pages (/profile, /admin, etc.)
    const loginUrl = new URL("/login", request.url);
    const destination = pathname + search;
    if (destination && destination !== "/") {
      loginUrl.searchParams.set("callbackUrl", destination);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 5. If already authenticated user visits /login or /register, redirect to destination or home
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
