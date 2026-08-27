# Account commerce setup

Scrim UI now uses an account entitlement rather than issuing a licence key for
new purchases. Clerk owns identity, Neon/Postgres owns purchase and entitlement
records, Stripe owns payment, and Resend delivers the confirmation email.

## Production setup

1. Create a Clerk application and add its publishable and secret keys to Vercel.
2. Create a Neon Postgres database, run `db/migrations/001_accounts.sql`, and add
   its pooled connection string as `DATABASE_URL`.
3. In Stripe, copy the secret API key and the `price_...` id of the one-time
   US$49 Scrim UI Pro price into `STRIPE_SECRET_KEY` and `STRIPE_PRICE_ID`.
4. In the private `scrim-ui-pro` repository, run `npm run build` and upload the
   generated `dist/` directory to an origin protected by a server-side bearer
   token. Set its root URL as `PRO_ARTIFACT_BASE_URL` and the credential as
   `PRO_ARTIFACT_BEARER_TOKEN` in Vercel. Never use a `NEXT_PUBLIC_` prefix.
5. Configure the Stripe webhook endpoint as
   `https://scrimui.dev/api/checkout/webhook`. Listen for:
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
   and `charge.refunded`. Put its signing secret in `STRIPE_WEBHOOK_SECRET`.
6. Keep `RESEND_API_KEY` and a verified `LICENSE_EMAIL_FROM`. The variable name
   is retained for compatibility; new mail says account access is ready and
   links to `/dashboard`.
7. Redeploy after environment-variable changes.

The previous Payment Link should be deactivated only after the account flow is
verified. Upstash and old licence routes remain available for existing keys.

## Test-mode order

Use a Stripe test secret, test Price, and test webhook secret together. Sign in,
open `/pro`, choose Get Pro, and pay with Stripe card `4242 4242 4242 4242`, any
future expiry, any CVC, and any postal code. The redirect lands on `/dashboard`;
within a few seconds the plan changes to Pro. Confirm all four records/signals:

- Stripe shows a successful test Checkout Session and a 2xx webhook delivery.
- `purchases` contains one paid row and `entitlements` contains one active row.
- the dashboard exposes Pro content and lets the user create a CLI token.
- Resend shows the “Your Scrim UI Pro access is ready” email.

Retrying the same webhook is idempotent and does not resend the email. A full
refund emits `charge.refunded` and revokes the entitlement; a partial refund
does not.
