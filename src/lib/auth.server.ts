import { auth, currentUser } from "@clerk/nextjs/server";
import { cache } from "react";

if (typeof window !== "undefined") {
  throw new Error("lib/auth.server.ts was imported into client code.");
}

export type Viewer = {
  id: string;
  email: string;
  name: string;
};

export function clerkConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
  );
}

/** Request-scoped DTO: never hand the complete Clerk user object to clients. */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  if (!clerkConfigured()) return null;
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  if (!user) return null;
  const primary =
    user.emailAddresses.find((address) => address.id === user.primaryEmailAddressId) ??
    user.emailAddresses[0];
  if (!primary) return null;

  return {
    id: user.id,
    email: primary.emailAddress.trim().toLowerCase(),
    name: user.fullName ?? user.firstName ?? primary.emailAddress,
  };
});
