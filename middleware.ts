import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { ADMIN_COOKIE_NAME, VISITOR_ENTRY_COOKIE_NAME, getAuthSecret } from "@/lib/auth-shared";

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function sign(payload: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(getAuthSecret()), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign"
  ]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return toHex(signature);
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function verifyAdminToken(token: string | undefined) {
  if (!token) {
    return false;
  }
  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    return false;
  }
  const expected = await sign(payload);
  if (!safeEqual(signature, expected)) {
    return false;
  }
  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt)) {
    return false;
  }
  return Date.now() < expiresAt;
}

function isPublicAsset(pathname: string) {
  return pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname === "/favicon.ico" || /\.[a-zA-Z0-9]+$/.test(pathname);
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (isPublicAsset(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const isAdmin = await verifyAdminToken(token);
  const hasVisitorEntry = request.cookies.get(VISITOR_ENTRY_COOKIE_NAME)?.value === "visitor";

  if (pathname.startsWith("/write")) {
    if (isAdmin) {
      return NextResponse.next();
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/enter")) {
    return NextResponse.next();
  }

  if (isAdmin || hasVisitorEntry) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: ["/:path*"]
};

