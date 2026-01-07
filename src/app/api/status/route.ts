import { getApiContext } from "@/lib/request-context";
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
    const { auth, services } = await getApiContext();
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401, headers: privateApiNoStoreHeaders },
      );
    }

    const body = (await request.json()) as StatusUpdateBody;
    const { problemNumber, status } = body;

    const result = await services.statusService.updateStatus(
      session.user.id,
      problemNumber,
      status,
    );

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
    if (error instanceof Error) {
      if (error.message === "Invalid status") {
        return Response.json(
          { error: "Invalid status" },
          { status: 400, headers: privateApiNoStoreHeaders },
        );
      }
      if (error.message === "Problem not found") {
        return Response.json(
          { error: "Problem not found" },
          { status: 404, headers: privateApiNoStoreHeaders },
        );
      }
    }
    console.error("Status update error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500, headers: privateApiNoStoreHeaders },
    );
  }
}

export async function GET(request: Request) {
  try {
    const { auth, services } = await getApiContext();
    const session = await auth.api.getSession({ headers: request.headers });

    // For authenticated users, get their personal status
    if (session?.user?.id) {
      const statuses = await services.statusService.getAllStatuses(session.user.id);
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
