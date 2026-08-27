import { SignUp } from "@clerk/nextjs";
import { clerkConfigured } from "@/lib/auth.server";

export default function SignUpPage() {
  if (!clerkConfigured()) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Account sign-up is not configured yet.</h1>
        <p className="mt-3 text-sm text-(--muted-foreground)">
          Add the Clerk environment variables, then redeploy.
        </p>
      </div>
    );
  }

  return (
    <div className="flex justify-center px-4 py-16">
      <SignUp
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
        forceRedirectUrl="/dashboard"
      />
    </div>
  );
}
