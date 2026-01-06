/**
 * Request Context - Centralized access to services, auth, and database.
 *
 * Uses React's cache() function to memoize within a single request,
 * eliminating redundant context/db/service creation across components.
 *
 * Usage in Server Components / API Routes:
 * ```ts
 * const { services, auth, session, db } = await getRequestContext();
 * const phases = await services.phaseService.getAllPhases();
 * ```
 */

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";
import { cache } from "react";
import { createDb, type Database } from "@/db";
import { type Auth, createAuth } from "@/lib/auth";
import { createServices, type Services } from "@/lib/service-factory";

export interface RequestContext {
  db: Database;
  auth: Auth;
  env: CloudflareEnv;
  session: Awaited<ReturnType<Auth["api"]["getSession"]>>;
  services: Services;
  userId: string | null;
}

export interface ApiRequestContext {
  db: Database;
  auth: Auth;
  env: CloudflareEnv;
  services: Services;
}

/**
 * Get the Cloudflare context (memoized per request).
 */
const getContext = cache(async () => {
  return getCloudflareContext({ async: true });
});

/**
 * Get database instance (memoized per request).
 */
const getDb = cache(async () => {
  const { env } = await getContext();
  return createDb(env.DB);
});

/**
 * Get auth instance (memoized per request).
 */
const getAuth = cache(async () => {
  const { env } = await getContext();
  return createAuth(env.DB, env);
});

/**
 * Get services (memoized per request).
 */
const getServices = cache(async () => {
  const db = await getDb();
  return createServices(db);
});

/**
 * Get session (memoized per request).
 */
const getSession = cache(async () => {
  const auth = await getAuth();
  const requestHeaders = await headers();
  return auth.api.getSession({ headers: requestHeaders });
});

/**
 * Get the full request context - one function to rule them all.
 *
 * This is the main entry point for all server-side code.
 * Everything is memoized, so calling this multiple times in a
 * single request is essentially free.
 */
export const getRequestContext = cache(async (): Promise<RequestContext> => {
  const [{ env }, db, auth, services, session] = await Promise.all([
    getContext(),
    getDb(),
    getAuth(),
    getServices(),
    getSession(),
  ]);

  return {
    db,
    auth,
    env,
    session,
    services,
    userId: session?.user?.id ?? null,
  };
});

/**
 * Get just the services (for when you don't need auth).
 * Slightly lighter weight than getRequestContext.
 */
export const getServicesOnly = cache(async (): Promise<Services> => {
  return getServices();
});

/**
 * Get just auth-related context (for API routes that only need auth).
 */
export const getAuthContext = cache(async () => {
  const [auth, session, { env }] = await Promise.all([getAuth(), getSession(), getContext()]);

  return {
    auth,
    session,
    env,
    userId: session?.user?.id ?? null,
  };
});

/**
 * Get API context for route handlers that receive Request.
 * Unlike getRequestContext, this doesn't use Next.js headers() function
 * since API routes receive headers via the Request object.
 */
export const getApiContext = cache(async (): Promise<ApiRequestContext> => {
  const [{ env }, db, services] = await Promise.all([getContext(), getDb(), getServices()]);

  const auth = createAuth(env.DB, env);

  return {
    db,
    auth,
    env,
    services,
  };
});
