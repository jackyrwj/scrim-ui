import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const configured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);
const isDashboard = createRouteMatcher(["/dashboard(.*)"]);
const isProtectedApi = createRouteMatcher([
  "/api/account/token(.*)",
  "/api/account/invoice(.*)",
  "/api/checkout/session(.*)",
]);

const withClerk = clerkMiddleware(async (auth, request) => {
  if (!isDashboard(request) && !isProtectedApi(request)) return;

  const { userId } = await auth();
  if (userId) return;

  if (isDashboard(request)) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect_url", request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.json({ error: "Sign in required." }, { status: 401 });
});

export default configured ? withClerk : () => NextResponse.next();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
