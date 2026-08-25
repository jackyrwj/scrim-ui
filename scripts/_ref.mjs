import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 1100 } });
await p.goto("https://www.shadcnblocks.com/components/data-table", { waitUntil: "networkidle", timeout: 60000 });
await p.evaluate(() => window.scrollTo(0, 700));
await p.waitForTimeout(2500);
await p.screenshot({ path: process.argv[2] });
// what interactive bits sit on a component card?
console.log(await p.evaluate(() => {
  const card = document.querySelectorAll('[class*="group"],article,[data-slot]');
  const labels = [...document.querySelectorAll("button,a[role=button],[role=tab]")]
    .map(e => (e.getAttribute("aria-label") || e.textContent || "").trim())
    .filter(s => s && s.length < 30);
  return [...new Set(labels)].slice(0, 40);
}));
await b.close();
