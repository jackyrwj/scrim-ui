# The public demo

`demo/ai-chat/` is not an application. It is the set of files that differ
between the AI Chat template and the copy of it running at the public demo
URL — six files laid over the twenty-four in `templates/ai-chat/`.

## Why an overlay instead of a second app

`src/lib/template-files.server.ts` walks `templates/<dir>/` and ships every
file it finds: into the zip a buyer downloads, into the shadcn registry
payload at `/r/pro/template-ai-chat.json`, and into the file list on the
template page. A demo-only file placed in there would be sold as part of the
template — and a rate limiter wired to my Upstash instance is not something
anyone paid for.

The other direction matters just as much. A demo maintained as a separate
copy of the app drifts from the template within a month, and then the thing
being demonstrated is no longer the thing being sold, which is the only job
the demo has. Keeping the difference to six files makes the drift visible: if
this directory grows past a dozen files, the demo has become a fork and
should be reconsidered rather than extended.

## What differs, and why

| File | Why it differs |
|---|---|
| `app/api/chat/route.ts` | Per-IP rate limit, input caps, `maxOutputTokens`, a shorter step ceiling, and a system prompt that knows it is a demo. |
| `lib/rate-limit.ts` | New. Upstash over REST, no dependency. **Fails closed** — see below. |
| `lib/models.ts` | Two cheap models instead of four. The switcher is one of the things being demonstrated, so it must serve what it offers rather than quietly downgrade. |
| `app/page.tsx` | Adds the banner above `<Chat />`, and overrides its `h-dvh`. |
| `components/demo-banner.tsx` | New. Says what this is and links back to the template page. |
| `.env.example` | Adds the two Upstash variables. |

## Fails closed, unlike the rest of the site

`src/lib/license-store.server.ts` rate-limits licence verification and fails
**open**: a Redis outage there would lock paying customers out of source they
already own, which is worse than a brief window of unlimited verify attempts.

`demo/ai-chat/lib/rate-limit.ts` fails **closed**, and in production refuses
to serve at all when Upstash is unconfigured. The asymmetry is the point: an
outage here costs a few visitors a demo, while skipping the check leaves an AI
gateway key answering the open internet with no ceiling.

## Building and deploying

```
node scripts/build-demo.mjs          # assembles .demo-build/
cd .demo-build && npm install
cp .env.example .env.local           # AI_GATEWAY_API_KEY + both UPSTASH vars
npm run dev
```

The script prints which overlay files **replaced** a template file and which
are **new**. A file you expected under "replaced" showing up under "new" means
its path is wrong — it copied fine, nothing imports it, and the demo is
running the template's uncapped route. That listing is the check.

`.demo-build/` is gitignored. Deploy it as its own Vercel project with the
root directory pointed at it, or `vercel deploy` from inside it.

## Before the first deploy

- Confirm the per-token price of both ids in `lib/models.ts` at
  vercel.com/ai-gateway. Prices move.
- Point `UPSTASH_REDIS_REST_URL` / `_TOKEN` at a database. The same one the
  main site uses is fine — these keys are namespaced under `demo:`.
- Set a spend cap on the gateway key itself. The limits in this overlay are
  the first line, not the last one: they are per-IP, and an attacker with a
  proxy pool has as many IPs as they care to pay for.
