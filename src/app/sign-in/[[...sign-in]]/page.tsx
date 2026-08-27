import { SignIn } from "@clerk/nextjs";
import { clerkConfigured } from "@/lib/auth.server";

export default function SignInPage() {
  if (!clerkConfigured()) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Account sign-in is not configured yet.</h1>
        <p className="mt-3 text-sm text-(--muted-foreground)">
          Add the Clerk environment variables, then redeploy.
        </p>
      </div>
    );
  }

  return (
    <div className="flex justify-center px-4 py-16">
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        forceRedirectUrl="/dashboard"
      />
    </div>
  );
}
