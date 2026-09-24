import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How Scrim UI uses analytics, advertising, account and payment services, and how to opt out.",
};

const UPDATED = "September 24, 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-7 text-(--muted-foreground)">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Privacy</h1>
      <p className="mt-3 text-pretty text-lg text-(--muted-foreground)">
        The short version: text entered into the browser-based tools stays on your device. The site
        uses analytics, account and payment providers, and advertising on selected free pages.
      </p>
      <p className="mt-6 text-xs text-(--muted-foreground)">Last updated {UPDATED}</p>

      <Section title="What is collected">
        <p>
          {SITE_NAME} uses Google Analytics 4 to understand which pages people find useful. It
          records the page you viewed, roughly where in the world you are (country level, derived
          from an IP address that Google discards rather than stores), your browser and device type,
          and how you arrived — a search engine, a link, or directly.
        </p>
        <p>
          A small number of interactions are also recorded — always anonymously, never tied to an
          identity: copying a component&apos;s code, using one of the tools, following a link out to
          a resource&apos;s website, and terms typed into site search. Search terms are
          recorded because a search that returns nothing is the clearest possible signal about a
          page that ought to exist.
        </p>
      </Section>

      <Section title="Advertising">
        <p>
          Selected free content pages display banner advertising supplied by Adsterra. Adsterra and
          its advertising partners may process your IP address, approximate location, browser and
          device information, the page and referring site, and cookies or similar identifiers to
          deliver, limit and measure advertising.
        </p>
        <p>
          Advertising is labelled and does not receive text entered into Scrim UI&apos;s browser-based
          tools. Pro, account, sign-in and payment pages do not contain Adsterra ads.
        </p>
      </Section>

      <Section title="What is never collected">
        <p>
          Nothing you type into the prompt generator, theme generator, token counter, or any other
          browser-based tool is sent to Scrim UI or to advertisers. Account authentication and
          payments are handled by Clerk and Stripe; Scrim UI does not receive your password or full
          card number.
        </p>
        <p>Scrim UI does not sell or rent personal information.</p>
      </Section>

      <Section title="Cookies">
        <p>
          Google Analytics sets a cookie (<code className="text-(--foreground)">_ga</code>) that
          distinguishes a returning visitor from a new one. It holds a random identifier, not
          anything about you. Adsterra and its advertising partners may set cookies or similar
          identifiers when an advertising placement loads. Your theme preference is also stored in
          your browser, which is what keeps the site dark if you asked for dark.
        </p>
      </Section>

      <Section title="How to opt out">
        <p>
          Any browser-level tracking protection stops analytics entirely, as does any content
          blocker. Google also publishes an{" "}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            target="_blank"
            rel="noreferrer noopener"
            className="text-(--foreground) underline underline-offset-4"
          >
            opt-out browser add-on
          </a>{" "}
          that applies across every site using Analytics. Browser tracking protection and content
          blockers can also prevent advertising from loading. Site content and Pro access are not
          gated on analytics or advertising.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          If this page changes in a way that affects what is collected, the date above changes with
          it.
        </p>
      </Section>
    </div>
  );
}
