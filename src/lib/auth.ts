import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createDb } from "@/db";
import * as schema from "@/db/schema";

export function createAuth(d1: D1Database, env: CloudflareEnv) {
	const db = createDb(d1);

	return betterAuth({
		database: drizzleAdapter(db, {
			provider: "sqlite",
			schema: {
				user: schema.users,
				session: schema.sessions,
				account: schema.accounts,
				verification: schema.verifications,
			},
		}),
		baseURL: env.BETTER_AUTH_URL ?? "http://localhost:3000",
		secret: env.BETTER_AUTH_SECRET,
		emailAndPassword: {
			enabled: false,
		},
		socialProviders: {
			google: {
				clientId: env.GOOGLE_CLIENT_ID,
				clientSecret: env.GOOGLE_CLIENT_SECRET,
			},
		},
		user: {
			additionalFields: {
				username: {
					type: "string",
					required: false,
				},
			},
		},
		session: {
			expiresIn: 60 * 60 * 24 * 7, // 7 days
			updateAge: 60 * 60 * 24, // 1 day
		},
	});
}

export type Auth = ReturnType<typeof createAuth>;
