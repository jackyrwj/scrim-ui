/**
 * Documents to try it on.
 *
 * Three, chosen to fail in different ways — a template that only ships the
 * clean case teaches nothing about the day the extraction goes wrong.
 */

export type Sample = { name: string; hint: string; text: string };

export const SAMPLES: Sample[] = [
  {
    name: "Clean invoice",
    hint: "Everything present and consistent",
    text: `NORTHWIND LTD
17 Fleet Street, London EC4Y 1AA

INVOICE  NW-2026-0418
Issued: 14 March 2026
Due: 13 April 2026

Bill to: Scrim UI

Description                     Qty   Unit      Amount
Design system audit               1   2,400.00  2,400.00
Component implementation         12     180.00  2,160.00
Documentation pass                6     120.00    720.00

                              Subtotal  GBP 5,280.00
                            VAT (20%)   GBP 1,056.00
                                 Total  GBP 6,336.00`,
  },
  {
    name: "Missing due date",
    hint: "A field that is genuinely absent — watch the confidence",
    text: `ACME SUPPLY CO
Invoice #A-9931
Date: 2026-01-07

2 x Widget assembly @ 45.00 ......... 90.00
1 x Rush handling @ 25.00 ........... 25.00

Subtotal ............ 115.00
Sales tax (8.25%) ..... 9.49
TOTAL USD ........... 124.49

Payment terms: on receipt.`,
  },
  {
    name: "Numbers that do not add up",
    hint: "Schema-valid and wrong — see the discrepancy warnings",
    text: `Studio Mercator
Rechnung 2026-0042 · 22.02.2026 · fällig 24.03.2026

Positionen
Fotoproduktion, 2 Tage à 1.250,00 EUR ....... 2.500,00
Retusche, 14 Bilder à 60,00 EUR ............... 840,00
Lizenz, 12 Monate ........................... 1.200,00

Zwischensumme .............................. 4.540,00
USt. 19% ..................................... 862,60
Gesamt ..................................... 5.302,60`,
  },
];
