"use client";

import { createAuthClient } from "better-auth/react";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
if (!siteUrl) {
  throw new Error("NEXT_PUBLIC_SITE_URL environment variable is required");
}

export const authClient = createAuthClient({
  baseURL: siteUrl,
});

export const { signIn, signUp, signOut, useSession } = authClient;
