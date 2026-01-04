import { getCloudflareContext } from "@opennextjs/cloudflare";
import { toNextJsHandler } from "better-auth/next-js";
import { createAuth } from "@/lib/auth";

export const runtime = "edge";

async function getHandler() {
  const { env } = await getCloudflareContext();
  const auth = createAuth(env.DB, env);
  return toNextJsHandler(auth);
}

export async function GET(request: Request) {
  const handler = await getHandler();
  return handler.GET(request);
}

export async function POST(request: Request) {
  const handler = await getHandler();
  return handler.POST(request);
}
