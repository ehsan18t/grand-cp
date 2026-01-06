import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDb } from "@/db";
import { createAuth } from "@/lib/auth";
import { createServices } from "@/lib/service-factory";
import type { ProblemStatus } from "@/types/domain";

const varyCookieHeaders = {
  Vary: "Cookie",
} as const;

const publicApiCacheHeaders = {
  ...varyCookieHeaders,
  "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=3600",
} as const;

const privateApiNoStoreHeaders = {
  ...varyCookieHeaders,
  "Cache-Control": "private, no-store",
} as const;

interface StatusUpdateBody {
  problemNumber: number;
  status: ProblemStatus;
}

export async function POST(request: Request) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = createDb(env.DB);
    const auth = createAuth(env.DB, env);
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401, headers: privateApiNoStoreHeaders },
      );
    }

    const body = (await request.json()) as StatusUpdateBody;
    const { problemNumber, status } = body;

    const { statusService } = createServices(db);
    const result = await statusService.updateStatus(session.user.id, problemNumber, status);

    if ("error" in result) {
      return Response.json(
        { error: result.error },
        { status: result.code, headers: privateApiNoStoreHeaders },
      );
    }

    return Response.json(
      {
        message: "Status updated",
        problemNumber: result.problemNumber,
        status: result.status,
        previousStatus: result.previousStatus,
      },
      { headers: privateApiNoStoreHeaders },
    );
  } catch (error) {
    console.error("Status update error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500, headers: privateApiNoStoreHeaders },
    );
  }
}

export async function GET(request: Request) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = createDb(env.DB);
    const auth = createAuth(env.DB, env);
    const session = await auth.api.getSession({ headers: request.headers });

    // For authenticated users, get their personal status
    if (session?.user?.id) {
      const { statusService } = createServices(db);
      const statuses = await statusService.getAllStatuses(session.user.id);
      return Response.json({ statuses }, { headers: privateApiNoStoreHeaders });
    }

    // For guests, return empty (they can only view, not track)
    return Response.json({ statuses: [] }, { headers: publicApiCacheHeaders });
  } catch (error) {
    console.error("Status fetch error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500, headers: privateApiNoStoreHeaders },
    );
  }
}
