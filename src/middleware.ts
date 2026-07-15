import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isMemberRoute = nextUrl.pathname.startsWith("/member");
  const isAuthRoute =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register");
  const isApiAdminRoute =
    nextUrl.pathname.startsWith("/api/banners") ||
    nextUrl.pathname.startsWith("/api/pages") ||
    nextUrl.pathname.startsWith("/api/users") ||
    nextUrl.pathname.startsWith("/api/settings") ||
    nextUrl.pathname.startsWith("/api/contact-messages") ||
    nextUrl.pathname.startsWith("/api/payment/settings") ||
    nextUrl.pathname.startsWith("/api/payment/bank-accounts");

  if (isMemberRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL(`/login?callbackUrl=${nextUrl.pathname}`, nextUrl));
  }

  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login?callbackUrl=/admin", nextUrl));
    }
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  if (isAuthRoute && isLoggedIn && role === "ADMIN") {
    return NextResponse.redirect(new URL("/admin", nextUrl));
  }

  if (isApiAdminRoute) {
    if (!isLoggedIn || role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/banners/:path*",
    "/api/pages/:path*",
    "/api/users/:path*",
    "/api/settings/:path*",
    "/api/contact-messages/:path*",
    "/api/payment/settings/:path*",
    "/api/payment/bank-accounts/:path*",
    "/member",
    "/member/:path*",
    "/login",
    "/register",
  ],
};
