import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { createDb } from "@/db";
import { users } from "@/db/schema";
import { createAuth } from "@/lib/auth";

// Update username
export async function PATCH(request: Request) {
  const { env } = await getCloudflareContext({ async: true });
  const db = createDb(env.DB);
  const auth = createAuth(env.DB, env);

  // Get current session
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { username } = body as { username?: string };

  if (!username || typeof username !== "string") {
    return Response.json({ error: "Username is required" }, { status: 400 });
  }

  // Validate username format (alphanumeric, underscores, 3-20 chars)
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  if (!usernameRegex.test(username)) {
    return Response.json(
      {
        error:
          "Username must be 3-20 characters and contain only letters, numbers, and underscores",
      },
      { status: 400 },
    );
  }

  // Check if username is already taken
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (existing && existing.id !== session.user.id) {
    return Response.json({ error: "Username is already taken" }, { status: 409 });
  }

  // Update username
  await db
    .update(users)
    .set({
      username,
      updatedAt: new Date(),
    })
    .where(eq(users.id, session.user.id));

  return Response.json({ success: true, username });
}

// Get current user info
export async function GET(request: Request) {
  const { env } = await getCloudflareContext({ async: true });
  const db = createDb(env.DB);
  const auth = createAuth(env.DB, env);

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      username: users.username,
      image: users.image,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  return Response.json(user);
}
