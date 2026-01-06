import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDb } from "@/db";
import { createAuth } from "@/lib/auth";
import { createServices } from "@/lib/service-factory";

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

  const { userService } = createServices(db);
  const result = await userService.updateUsername(session.user.id, username);

  if ("error" in result) {
    return Response.json({ error: result.error }, { status: result.code });
  }

  return Response.json({ success: true, username: result.username });
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

  const { userService } = createServices(db);
  const user = await userService.getUserById(session.user.id);

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  return Response.json(user);
}
