import { auth } from "@clerk/nextjs/server";
import { hasActiveEntitlement } from "@/lib/account-store.server";
import { clerkConfigured } from "@/lib/auth.server";
import { databaseConfigured } from "@/lib/db.server";

export async function GET() {
  const headers = { "cache-control": "no-store" };
  if (!clerkConfigured()) {
    return Response.json({ authenticated: false, hasPro: false }, { headers });
  }

  const { userId } = await auth();
  if (!userId) {
    return Response.json({ authenticated: false, hasPro: false }, { headers });
  }
  if (!databaseConfigured()) {
    return Response.json(
      { authenticated: true, hasPro: false, error: "Account database is not configured." },
      { status: 503, headers },
    );
  }

  try {
    return Response.json(
      { authenticated: true, hasPro: await hasActiveEntitlement(userId) },
      { headers },
    );
  } catch (error) {
    console.error("[account] Entitlement lookup failed:", error);
    return Response.json(
      { authenticated: true, hasPro: false, error: "Could not check Pro access." },
      { status: 503, headers },
    );
  }
}
