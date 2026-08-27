import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const configured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);
const isProtected = createRouteMatcher([
  "/dashboard(.*)",
  "/api/account/token(.*)",
  "/api/account/invoice(.*)",
  "/api/checkout/session(.*)",
]);

const withClerk = clerkMiddleware(async (auth, request) => {
  if (isProtected(request)) await auth.protect();
});

export default configured ? withClerk : () => NextResponse.next();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
