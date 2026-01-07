import { getApiContext } from "@/lib/request-context";

// Update username
export async function PATCH(request: Request) {
  const { auth, services } = await getApiContext();

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

  try {
    const result = await services.userService.updateUsername(session.user.id, username);
    return Response.json({ success: true, username: result.username });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Invalid username format") {
        return Response.json(
          {
            error:
              "Username must be 3-20 characters and contain only letters, numbers, and underscores",
          },
          { status: 400 },
        );
      }
      if (error.message === "Username is already taken") {
        return Response.json({ error: "Username is already taken" }, { status: 409 });
      }
    }
    console.error("Username update error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Get current user info
export async function GET(request: Request) {
  const { auth, services } = await getApiContext();

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await services.userService.getUserById(session.user.id);

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  return Response.json(user);
}
