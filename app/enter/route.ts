import { NextResponse } from "next/server";

import { VISITOR_ENTRY_COOKIE_MAX_AGE_SECONDS, VISITOR_ENTRY_COOKIE_NAME } from "@/lib/auth-shared";

function resolveSafeNext(next: string | null) {
  if (!next || !next.startsWith("/")) {
    return "/home";
  }
  return next;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const role = url.searchParams.get("role");

  if (role !== "visitor") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const next = resolveSafeNext(url.searchParams.get("next"));
  const response = NextResponse.redirect(new URL(next, request.url));
  response.cookies.set({
    name: VISITOR_ENTRY_COOKIE_NAME,
    value: "visitor",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: VISITOR_ENTRY_COOKIE_MAX_AGE_SECONDS
  });

  return response;
}

