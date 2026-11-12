import { ConvexHttpClient } from "convex/browser";
import { FunctionReference } from "convex/server";
import { api } from "../../convex/_generated/api";

export { api };

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "";

let _httpClient: ConvexHttpClient | null = null;

/**
 * Returns a singleton ConvexHttpClient for server-side queries, actions, and API routes.
 */
export function getConvexClient(): ConvexHttpClient {
  if (!convexUrl) {
    throw new Error(
      "NEXT_PUBLIC_CONVEX_URL is not configured. Run `npx convex dev` to configure Convex."
    );
  }
  if (!_httpClient) {
    _httpClient = new ConvexHttpClient(convexUrl);
  }
  return _httpClient;
}

/**
 * Checks whether the Convex backend is enabled.
 * Set NEXT_PUBLIC_USE_CONVEX="true" and NEXT_PUBLIC_CONVEX_URL in .env to switch from Neon to Convex.
 */
export function isConvexEnabled(): boolean {
  return (
    Boolean(process.env.NEXT_PUBLIC_CONVEX_URL) &&
    process.env.NEXT_PUBLIC_USE_CONVEX === "true"
  );
}

/**
 * Execute a Convex query from Next.js Server Components / Server Actions / API Routes.
 * Defaults generic R to `never` so `if (isConvexEnabled()) return await convexQuery(...)`
 * preserves the exact Prisma return type inferred from the fallback branch (`never | T = T`).
 */
export async function convexQuery<R = never>(
  queryRef: FunctionReference<"query">,
  args: Record<string, any> = {}
): Promise<R> {
  const client = getConvexClient();
  return (await client.query(queryRef as any, args)) as R;
}

/**
 * Execute a Convex mutation from Next.js Server Actions / API Routes.
 */
export async function convexMutation<R = never>(
  mutationRef: FunctionReference<"mutation">,
  args: Record<string, any> = {}
): Promise<R> {
  const client = getConvexClient();
  return (await client.mutation(mutationRef as any, args)) as R;
}
