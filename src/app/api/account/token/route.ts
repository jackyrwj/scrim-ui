import { auth } from "@clerk/nextjs/server";
import {
  createApiToken,
  listApiTokens,
  revokeApiToken,
} from "@/lib/account-store.server";
import { databaseConfigured } from "@/lib/db.server";

const noStore = { "cache-control": "no-store" };

async function userIdOrNull() {
  const { userId } = await auth();
  return userId;
}

export async function GET() {
  const userId = await userIdOrNull();
  if (!userId) return Response.json({ error: "Sign in required." }, { status: 401, headers: noStore });
  if (!databaseConfigured()) return Response.json({ error: "Database not configured." }, { status: 503, headers: noStore });
  return Response.json({ tokens: await listApiTokens(userId) }, { headers: noStore });
}

export async function POST() {
  const userId = await userIdOrNull();
  if (!userId) return Response.json({ error: "Sign in required." }, { status: 401, headers: noStore });
  if (!databaseConfigured()) return Response.json({ error: "Database not configured." }, { status: 503, headers: noStore });
  try {
    return Response.json(await createApiToken(userId), { status: 201, headers: noStore });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create a token.";
    return Response.json({ error: message }, { status: 403, headers: noStore });
  }
}

export async function DELETE(request: Request) {
  const userId = await userIdOrNull();
  if (!userId) return Response.json({ error: "Sign in required." }, { status: 401, headers: noStore });
  const body: unknown = await request.json().catch(() => null);
  const tokenId = (body as { id?: unknown } | null)?.id;
  if (typeof tokenId !== "string") {
    return Response.json({ error: "Token id required." }, { status: 400, headers: noStore });
  }
  return Response.json({ revoked: await revokeApiToken(userId, tokenId) }, { headers: noStore });
}
