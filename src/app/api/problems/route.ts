import { getApiContext } from "@/lib/request-context";

const varyCookieHeaders = {
  Vary: "Cookie",
} as const;

const publicApiCacheHeaders = {
  ...varyCookieHeaders,
  "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
} as const;

const privateApiNoStoreHeaders = {
  ...varyCookieHeaders,
  "Cache-Control": "private, no-store",
} as const;

export async function GET(request: Request) {
  try {
    const { auth, services } = await getApiContext();
    const session = await auth.api.getSession({ headers: request.headers });

    const url = new URL(request.url);
    const phaseId = url.searchParams.get("phaseId");

    // Fetch problems from service
    const phaseIdNum = phaseId ? Number.parseInt(phaseId, 10) : null;
    const problems = phaseIdNum
      ? await services.problemService.getProblemsByPhaseId(phaseIdNum)
      : await services.problemService.getAllProblems();

    // Enrich with user data
    const userId = session?.user?.id ?? null;
    const problemsWithUserData = await services.problemService.getProblemsWithUserData(
      problems,
      userId,
    );

    const cacheHeaders = session?.user?.id ? privateApiNoStoreHeaders : publicApiCacheHeaders;

    return Response.json({ problems: problemsWithUserData }, { headers: cacheHeaders });
  } catch (error) {
    console.error("Problems fetch error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500, headers: privateApiNoStoreHeaders },
    );
  }
}
