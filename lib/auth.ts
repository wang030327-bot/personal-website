import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

const ADMIN_COOKIE_NAME = "writer_admin_session";
const ADMIN_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

function getAdminPassword() {
  return process.env.SITE_ADMIN_PASSWORD ?? "wangwang";
}

function getAuthSecret() {
  return process.env.SITE_AUTH_SECRET ?? process.env.SITE_ADMIN_PASSWORD ?? "change-this-secret";
}

function sign(payload: string) {
  return createHmac("sha256", getAuthSecret()).update(payload).digest("hex");
}

function constantEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}

function buildToken(expiresAt: number) {
  const payload = String(expiresAt);
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

function verifyToken(token: string) {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    return false;
  }

  const expected = sign(payload);
  if (!constantEqual(signature, expected)) {
    return false;
  }

  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt)) {
    return false;
  }

  return Date.now() < expiresAt;
}

export async function isAdminAuthenticated() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) {
    return false;
  }
  return verifyToken(token);
}

export async function loginAsAdmin(password: string) {
  const normalizedInput = password.trim();
  const normalizedPassword = getAdminPassword().trim();
  if (!normalizedInput || !constantEqual(normalizedInput, normalizedPassword)) {
    return { ok: false, message: "密码不正确，请重试。" };
  }

  const expiresAt = Date.now() + ADMIN_COOKIE_MAX_AGE_SECONDS * 1000;
  const token = buildToken(expiresAt);
  const store = await cookies();
  store.set({
    name: ADMIN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE_SECONDS
  });

  return { ok: true, message: "登录成功。" };
}

export async function logoutAdmin() {
  const store = await cookies();
  store.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0)
  });
}

