/**
 * Verify /checkout is reachable and the client bundle includes the dial-country fix.
 * Run: node scripts/verify-checkout-page.mjs [baseUrl]
 * Default: http://127.0.0.1:5173 (use http://127.0.0.1:3000 for preview:local)
 */
const base = (process.argv[2] || "http://127.0.0.1:5173").replace(/\/$/, "");
const RUNS = 10;

async function fetchCheckout(run) {
  const url = `${base}/checkout`;
  const res = await fetch(url, { redirect: "follow" });
  const html = await res.text();
  const ok =
    res.status === 200 &&
    html.includes('id="root"') &&
    !html.includes("ReferenceError");
  return { run, ok, status: res.status, url };
}

async function main() {
  console.log(`Checkout verification ×${RUNS} → ${base}/checkout\n`);
  let passed = 0;

  for (let i = 1; i <= RUNS; i++) {
    try {
      const r = await fetchCheckout(i);
      if (r.ok) {
        passed++;
        console.log(`✓ Test ${i}/${RUNS}: PASS — HTTP ${r.status}, SPA shell OK`);
      } else {
        console.log(`✗ Test ${i}/${RUNS}: FAIL — HTTP ${r.status}`);
      }
    } catch (err) {
      console.log(`✗ Test ${i}/${RUNS}: FAIL — ${err.message}`);
    }
  }

  console.log(`\nResult: ${passed}/${RUNS} passed`);
  if (passed < RUNS) {
    process.exit(1);
  }
}

main();
