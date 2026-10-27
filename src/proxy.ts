import { auth } from "@/server/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAuthed = !!req.auth;
  const isProtected =
    req.nextUrl.pathname.startsWith("/schedule") ||
    req.nextUrl.pathname.startsWith("/profile") ||
    req.nextUrl.pathname.startsWith("/tasks") ||
    req.nextUrl.pathname.startsWith("/projects") ||
    req.nextUrl.pathname.startsWith("/tags") ||
    req.nextUrl.pathname.startsWith("/activity") ||
    req.nextUrl.pathname.startsWith("/api/profile");
  if (isProtected && !isAuthed) {
    if (req.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/signin", req.url));
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/schedule/:path*",
    "/profile/:path*",
    "/tasks/:path*",
    "/projects/:path*",
    "/tags/:path*",
    "/activity/:path*",
    "/api/profile/:path*",
  ],
};