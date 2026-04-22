export const ADMIN_COOKIE_NAME = "writer_admin_session";
export const ADMIN_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;
export const VISITOR_ENTRY_COOKIE_NAME = "site_entry_mode";
export const VISITOR_ENTRY_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function getAdminPassword() {
  return process.env.SITE_ADMIN_PASSWORD ?? "wangwang";
}

export function getAuthSecret() {
  return process.env.SITE_AUTH_SECRET ?? process.env.SITE_ADMIN_PASSWORD ?? "change-this-secret";
}
