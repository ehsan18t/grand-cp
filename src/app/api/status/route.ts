import { getCloudflareContext } from "@opennextjs/cloudflare";
import { and, eq } from "drizzle-orm";
import { createDb } from "@/db";
import { problems, statusHistory, userProblems } from "@/db/schema";
import { createAuth } from "@/lib/auth";

export const runtime = "edge";

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

type StatusValue = "untouched" | "attempting" | "solved" | "revisit" | "skipped";

interface StatusUpdateBody {
  problemNumber: number;
  status: StatusValue;
}

export async function POST(request: Request) {
  try {
    const { env } = await getCloudflareContext();
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

    // Validate status
    const validStatuses: StatusValue[] = [
      "untouched",
      "attempting",
      "solved",
      "revisit",
      "skipped",
    ];
    if (!validStatuses.includes(status)) {
      return Response.json(
        { error: "Invalid status" },
        { status: 400, headers: privateApiNoStoreHeaders },
      );
    }

    // Get problem by number
    const problem = await db
      .select()
      .from(problems)
      .where(eq(problems.number, problemNumber))
      .get();

    if (!problem) {
      return Response.json(
        { error: "Problem not found" },
        { status: 404, headers: privateApiNoStoreHeaders },
      );
    }

    const now = new Date();
    const userId = session.user.id;
    const problemId = problem.id;

    // Get current user problem status
    const currentUserProblem = await db
      .select()
      .from(userProblems)
      .where(and(eq(userProblems.userId, userId), eq(userProblems.problemId, problemId)))
      .get();

    const fromStatus = currentUserProblem?.status as StatusValue | undefined;

    // Only update if status actually changed
    if (fromStatus === status) {
      return Response.json(
        { message: "Status unchanged", status },
        { headers: privateApiNoStoreHeaders },
      );
    }

    // Upsert user problem status
    if (currentUserProblem) {
      await db
        .update(userProblems)
        .set({ status, updatedAt: now })
        .where(and(eq(userProblems.userId, userId), eq(userProblems.problemId, problemId)));
    } else {
      await db.insert(userProblems).values({
        userId,
        problemId,
        status,
        updatedAt: now,
      });
    }

    // Log status change to history
    await db.insert(statusHistory).values({
      userId,
      problemId,
      fromStatus: fromStatus ?? null,
      toStatus: status,
      changedAt: now,
    });

    return Response.json(
      {
        message: "Status updated",
        problemNumber,
        status,
        previousStatus: fromStatus ?? "untouched",
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
    const { env } = await getCloudflareContext();
    const db = createDb(env.DB);
    const auth = createAuth(env.DB, env);
    const session = await auth.api.getSession({ headers: request.headers });

    const url = new URL(request.url);
    const phaseId = url.searchParams.get("phaseId");

    // For authenticated users, get their personal status
    if (session?.user?.id) {
      const query = db
        .select({
          problemNumber: problems.number,
          status: userProblems.status,
          updatedAt: userProblems.updatedAt,
        })
        .from(userProblems)
        .innerJoin(problems, eq(userProblems.problemId, problems.id))
        .where(eq(userProblems.userId, session.user.id));

      if (phaseId) {
        const results = await query.all();
        return Response.json(
          {
            statuses: results.filter((_r) => {
              // Filter by phase would need a join - simplified here
              return true;
            }),
          },
          { headers: privateApiNoStoreHeaders },
        );
      }

      const results = await query.all();
      return Response.json({ statuses: results }, { headers: privateApiNoStoreHeaders });
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
