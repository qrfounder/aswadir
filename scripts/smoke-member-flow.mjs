/**
 * Smoke test: simulate purchase → register → dashboard
 * Run: node scripts/smoke-member-flow.mjs [baseUrl]
 * Default baseUrl: http://127.0.0.1:3000
 */
const base = process.argv[2] || "http://127.0.0.1:3000";

async function req(path, options = {}) {
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text.slice(0, 200) };
  }
  if (!res.ok) {
    const err = new Error(`${path} → ${res.status}`);
    err.data = json;
    throw err;
  }
  return { json, headers: res.headers };
}

async function main() {
  console.log(`Smoke test → ${base}\n`);

  const health = await req("/api/health");
  console.log("✓ health", health.json);

  const sim = await req("/api/dev/simulate-order", {
    method: "POST",
    body: JSON.stringify({
      productId: "bundle",
      customerName: "Smoke Test",
      customerEmail: `smoke_${Date.now()}@test.local`,
      whatsapp: "512345678",
    }),
  });
  const pi = sim.json.paymentIntentId;
  const email = `smoke_${Date.now()}@test.local`;
  console.log("✓ simulate-order", pi);

  const cookieJar = [];
  const registerRes = await fetch(`${base}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password: "testpass1234",
      name: "Smoke Test",
      paymentIntentId: pi,
    }),
  });
  const setCookie = registerRes.headers.getSetCookie?.() || [];
  for (const c of setCookie) cookieJar.push(c.split(";")[0]);
  const regBody = await registerRes.json();
  if (!registerRes.ok) {
    console.error("✗ register", regBody);
    process.exit(1);
  }
  console.log("✓ register", regBody.user?.email);

  const cookieHeader = cookieJar.join("; ");
  const meRes = await fetch(`${base}/api/auth/me`, {
    headers: { Cookie: cookieHeader },
  });
  const me = await meRes.json();
  if (!meRes.ok) {
    console.error("✗ me", me);
    process.exit(1);
  }
  console.log("✓ me", me.user?.name, "entitlements:", me.entitlements?.length);

  const dashRes = await fetch(`${base}/api/member/dashboard`, {
    headers: { Cookie: cookieHeader },
  });
  const dash = await dashRes.json();
  if (!dashRes.ok) {
    console.error("✗ dashboard", dash);
    process.exit(1);
  }
  console.log("✓ dashboard", "updates:", dash.updates?.length);

  console.log("\nAll smoke checks passed.");
}

main().catch((e) => {
  console.error("\nSmoke test failed:", e.message, e.data || "");
  console.error("\nStart API first: npm run dev:server  (or npm run dev:all)");
  process.exit(1);
});
