import { auth } from "@/server/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAuthed = !!req.auth;
  const isProtected =
    req.nextUrl.pathname.startsWith("/profile") ||
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
  matcher: ["/profile/:path*", "/api/profile/:path*"],
};