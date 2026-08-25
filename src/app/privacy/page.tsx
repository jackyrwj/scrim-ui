import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What Scrim UI collects, what it does not, and how to opt out. No accounts, no ads, no data sold.",
};

const UPDATED = "August 25, 2026";

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
      <p className="mt-3 text-lg text-(--muted-foreground)">
        The short version: there are no accounts, nothing you type into the tools ever leaves your
        browser, and nothing is sold to anyone.
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

      <Section title="What is never collected">
        <p>
          There are no accounts, so there is no name, email address, or password to collect. Nothing
          you type into the prompt generator, theme generator, token counter, or any other tool is
          transmitted anywhere — those tools run entirely in your browser, and the text stays on your
          machine.
        </p>
        <p>No data is sold, rented, or shared with advertisers.</p>
      </Section>

      <Section title="Cookies">
        <p>
          Google Analytics sets a cookie (<code className="text-(--foreground)">_ga</code>) that
          distinguishes a returning visitor from a new one. It holds a random identifier, not
          anything about you. Your theme preference is also stored in your browser, which is what
          keeps the site dark if you asked for dark.
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
          that applies across every site using Analytics. The site works identically either way —
          nothing here is gated on being measured.
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
