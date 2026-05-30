import type { CookieOptions } from "@supabase/ssr";

/** Keep auth cookies for 30 days (align with Supabase refresh token lifetime in dashboard). */
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export const authCookieOptions: CookieOptions = {
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: AUTH_COOKIE_MAX_AGE,
};
