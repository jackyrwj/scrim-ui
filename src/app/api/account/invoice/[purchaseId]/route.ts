import { auth } from "@clerk/nextjs/server";
import { getInvoiceForUser } from "@/lib/account-store.server";
import { getStripe } from "@/lib/stripe-client.server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ purchaseId: string }> },
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Sign in required." }, { status: 401 });
  const { purchaseId } = await params;
  const id = Number(purchaseId);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return Response.json({ error: "Invalid purchase." }, { status: 400 });
  }

  const invoiceId = await getInvoiceForUser(userId, id);
  if (!invoiceId) return Response.json({ error: "Invoice not found." }, { status: 404 });
  const invoice = await getStripe().invoices.retrieve(invoiceId);
  if (!invoice.hosted_invoice_url) {
    return Response.json({ error: "Invoice is not available yet." }, { status: 404 });
  }
  return Response.redirect(invoice.hosted_invoice_url, 303);
}
