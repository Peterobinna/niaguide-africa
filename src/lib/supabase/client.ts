"use client";
import { createBrowserClient } from "@supabase/ssr";
export function browserDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key)
    throw new Error(
      "Supabase authentication is not configured. You can still explore the synthetic demo.",
    );
  return createBrowserClient(url, key);
}
