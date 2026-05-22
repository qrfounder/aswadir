/**
 * Full route scan: SPA shell + console/page errors per public route.
 * Usage: node scripts/scan-all-pages.mjs [baseUrl]
 * Default: http://127.0.0.1:5173
 */
import { chromium } from "playwright";

const base = (process.argv[2] || "http://127.0.0.1:5173").replace(/\/$/, "");

const ROUTES = [
  { path: "/", name: "Product (landing)" },
  { path: "/checkout", name: "Checkout" },
  { path: "/checkout?product=bundle", name: "Checkout bundle" },
  { path: "/checkout?product=habit", name: "Checkout habit" },
  { path: "/checkout?product=task", name: "Checkout task" },
  { path: "/checkout/success", name: "Checkout success" },
  { path: "/thank-you", name: "Thank you" },
  { path: "/setup-account?productId=bundle&product=Full+Bundle", name: "Setup account" },
  { path: "/login", name: "Login" },
  { path: "/dashboard", name: "Dashboard (may redirect)" },
  { path: "/mojourney/login", name: "Admin login" },
  { path: "/mojourney", name: "Admin dashboard (may redirect)" },
  { path: "/does-not-exist", name: "404" },
];

async function scanRoute(page, route) {
  const errors = [];
  const onConsole = (msg) => {
    if (msg.type() === "error") {
      const t = msg.text();
      if (
        !t.includes("favicon") &&
        !t.includes("DevTools") &&
        !/401.*Unauthorized/.test(t)
      ) {
        errors.push(t);
      }
    }
  };
  const onPageError = (err) => errors.push(err.message);

  page.on("console", onConsole);
  page.on("pageerror", onPageError);

  const url = `${base}${route.path}`;
  let status = 0;
  try {
    const res = await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
    status = res?.status() ?? 0;
    await page.waitForTimeout(800);
  } catch (err) {
    errors.push(`navigation: ${err.message}`);
  }

  page.off("console", onConsole);
  page.off("pageerror", onPageError);

  const bodyText = await page.locator("body").innerText().catch(() => "");
  const boundary = bodyText.includes("Could not load the app");
  const hasRoot = (await page.locator("#root").count()) > 0;

  return {
    ...route,
    url,
    status,
    hasRoot,
    boundary,
    errors: [...new Set(errors)].slice(0, 8),
    ok: hasRoot && !boundary && errors.length === 0,
  };
}

async function main() {
  console.log(`Page scan → ${base}\n`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const results = [];
  for (const route of ROUTES) {
    const r = await scanRoute(page, route);
    results.push(r);
    const icon = r.ok ? "✓" : "✗";
    console.log(`${icon} ${r.name} (${r.path})`);
    if (r.status) console.log(`   HTTP ${r.status}`);
    if (r.boundary) console.log("   Error boundary visible");
    for (const e of r.errors) console.log(`   · ${e.slice(0, 120)}`);
  }

  await browser.close();

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} routes clean`);
  if (failed.length) {
    console.log("\nFailed:");
    for (const f of failed) console.log(`  - ${f.name}: ${f.errors.join(" | ") || "boundary"}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
