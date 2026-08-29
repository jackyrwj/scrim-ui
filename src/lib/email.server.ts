/**
 * Transactional email, server side.
 *
 * Resend's REST API through plain `fetch` — one HTTP call does not justify an
 * SDK.
 *
 * The important property here is not the template, it is what happens when a
 * send fails. The email is a *notification*, never the record: the purchase is
 * already in the database and on the dashboard by the time this runs. So a
 * send failure is logged loudly and swallowed, because the alternative —
 * throwing, failing the webhook, and letting Stripe retry — would re-run the
 * fulfilment path for the same order on every retry.
 */

import { SITE_NAME, SITE_URL } from "./site";

if (typeof window !== "undefined") {
  throw new Error("lib/email.server.ts was imported into client code.");
}

const RESEND_KEY = process.env.RESEND_API_KEY ?? "";
const FROM = process.env.LICENSE_EMAIL_FROM ?? "";

export function emailConfigured(): boolean {
  return Boolean(RESEND_KEY && FROM);
}

export async function sendAccountPurchaseEmail(to: string): Promise<boolean> {
  const dashboardUrl = `${SITE_URL}/dashboard`;
  const text = `Thanks for buying ${SITE_NAME} Pro.

Your Pro access is now active on your ${SITE_NAME} account (${to}).

Open your dashboard:
  ${dashboardUrl}

Sign in with the same email address you used at checkout. From the dashboard you can view purchases, download invoices, and create an API token for the CLI.`;

  return send(
    to,
    `Your ${SITE_NAME} Pro access is ready`,
    text,
    layout(
      `Your ${SITE_NAME} Pro access is ready`,
      `<p style="font-size:14px;line-height:1.6">Your Pro access is now active on the account for <strong>${escapeHtml(to)}</strong>.</p>
  <p style="margin:24px 0"><a href="${dashboardUrl}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;border-radius:8px;padding:11px 16px;font-size:14px;font-weight:600">Open dashboard</a></p>
  <p style="font-size:13px;line-height:1.6;color:#555">Sign in with the same email address you used at checkout. Your dashboard contains purchase history, invoice links, and CLI API-token management.</p>`,
    ),
  );
}

async function send(to: string, subject: string, text: string, html: string): Promise<boolean> {
  if (!emailConfigured()) {
    console.warn(`[email] Not configured; would have sent to ${to}:\n${text}`);
    return false;
  }
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${RESEND_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to, subject, text, html }),
    });
    if (!response.ok) {
      console.error(`[email] Resend rejected the send: ${response.status} ${await response.text()}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[email] Send failed:", error);
    return false;
  }
}

function layout(heading: string, body: string): string {
  return `<div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#111">
  <h1 style="font-size:20px;margin:0 0 16px">${heading}</h1>
  ${body}
  <p style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e5e5;font-size:12px;color:#666">
    ${SITE_NAME} — <a href="${SITE_URL}" style="color:#666">${SITE_URL.replace(/^https?:\/\//, "")}</a>
  </p>
</div>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]!);
}
