import { NextResponse, type NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const role = req.cookies.get("role")?.value ?? "viewer";
  if (req.nextUrl.pathname.startsWith("/studio") && role === "viewer") {
    const url = req.nextUrl.clone();
    url.pathname = req.nextUrl.pathname.replace(/^\/studio/, "/preview");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = { matcher: ["/studio/:path*"] };