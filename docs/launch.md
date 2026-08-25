# Launch checklist

Ordered by what unblocks what, not by effort. Nothing below needs new features
— the site is finished enough. What it needs is the first hundred people.

The honest framing: for a component library, **GitHub is the product's front
door and the site is its documentation.** Peer star counts say so plainly —
shadcn/ui 122k, daisyUI 42k, CopilotKit 37k, Magic UI 22k, assistant-ui 12k,
Kibo 3.9k. None of them grew from search traffic first.

---

## 0. Before anything is public

- [ ] Decide on the repo: `jackyrwj/scrim-ui` is private. Flipping it public is
      one-way — forks and caches survive a delete. The open question is
      `public/previews/`: 102 screenshots of third-party sites. `LICENSING.md`
      says they are not MIT and belong to the sites they show, which is the
      honest position, but decide you are comfortable with it before, not after.
- [ ] Upload the social preview image (Settings → General → Social preview).
      GitHub has no API for it. Without one, every shared repo link is a grey
      card.
- [ ] Search Console: add `scrimui.dev` as a new property and submit
      `https://scrimui.dev/sitemap.xml`. The old `.vercel.app` property does not
      cover the new domain.
- [ ] Read your own README as a stranger would. It is the single most-read file
      you will publish.

## 1. Week one — the places that actually move

Ordered by expected return for this specific product.

- [ ] **Show HN** — `Show HN: Scrim UI – copy-ready components for AI interfaces`.
      Post Tuesday–Thursday, 08:00–10:00 ET. Write the first comment yourself:
      what it is, why you built it, what it deliberately does not do
      (no dependency, one file). Answer everything for the first six hours.
      HN rewards a specific technical opinion; yours is "no package, one file,
      paste it" — lead with that, not with the feature list.
- [ ] **r/reactjs** and **r/nextjs** — read the self-promotion rules first; both
      allow it with an account that has history. Lead with the registry line,
      not the site.
- [ ] **Product Hunt** — lower value here than people assume for dev tools, but
      cheap. Ship on a Tuesday. The gallery images are the OG cards you already
      generate.
- [ ] **X/Twitter** — one thread, one idea per post, a GIF per component. The
      hero showcase is already a scripted tour; screen-record 20 seconds of it.
      Tag nobody in the first post; it reads as spam.

## 2. Get listed where people already look

Each is a PR or a form. These compound and cost nothing.

- [ ] **awesome-shadcn-ui** — the registry entry makes you eligible; it is the
      single highest-intent list for this product.
- [ ] **awesome-react-components**, **awesome-nextjs**
- [ ] Directories: **Toolfolio**, **Landingfolio**-adjacent design-tool lists,
      **uiverse**-style aggregators, **Free Frontend**
- [ ] AI-specific: lists that collect LLM app tooling — the same places your own
      `/resources` entries appear. You have 102 of them; a fair number maintain
      a "submit a tool" page.
- [ ] **Lucide** — you built an opinionated concept→icon mapping on top of their
      set. Their Discord and discussions are a natural, non-spammy place for it.

## 3. Communities where the audience already is

Show up as a participant, not a poster. Answer three questions before you
mention the site once.

- [ ] **shadcn/ui Discord** — the registry is directly relevant there.
- [ ] **Vercel / Next.js Discord**
- [ ] **assistant-ui** and **CopilotKit** communities — adjacent, not competing:
      they own the runtime, you own the visual layer, and their users hit
      exactly the problem you solve.
- [ ] Designer side: **Designer Hangout**, relevant Slack workspaces. The tools
      half of the site is for them and they never see dev-tool launches.

## 4. Content that earns links, not traffic

The `/inspiration` breakdowns are already the strongest asset. A component
library gets cited; a listicle does not.

- [ ] Turn each existing breakdown into a post on your own domain first, then
      a shortened cross-post to **dev.to** / **Hashnode** with a canonical link
      back. Never publish there first.
- [ ] The icon guide is a citable artefact — "which icon means tool call" is a
      question people ask out loud. Pitch it as a standalone piece.
- [ ] Write one post about a decision, not a feature: why every component is a
      single file with no dependency. That is an opinion people argue with, and
      arguments carry links.

## 5. Instrument it, then leave it alone

- [ ] Confirm `NEXT_PUBLIC_GA_ID` is set in Vercel, or the analytics component
      renders nothing.
- [ ] Watch three numbers only: registry installs (`/r/*.json` hits), copy-button
      events, and GitHub stars. Everything else is noise at this size.
- [ ] Give it six weeks before judging anything. Search takes that long to
      register a new domain regardless of what you do.

---

## What not to do

- **Do not build 500 SEO landing pages about other people's tools.** That is a
  different business (an ad-supported directory) and it requires volume you
  would be starting 500 pages behind on. Your pages are products; keep them
  that way.
- **Do not launch on every channel in one day.** Each one is a first
  impression you get once. Stagger them and fix what the first audience tells
  you before facing the second.
- **Do not pay for traffic yet.** You do not know which of the six sections
  people actually want. Paid traffic buys you a number, not that answer.
