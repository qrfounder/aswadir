import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const logs = [];
page.on("console", (msg) => logs.push(`${msg.type()}: ${msg.text()}`));
page.on("pageerror", (err) => logs.push(`pageerror: ${err.message}`));

await page.goto("http://localhost:5173/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(3000);
const text = await page.locator("body").innerText();
const html = await page.content();
console.log("TEXT_LEN", text.length);
console.log("TEXT_SAMPLE", text.slice(0, 200));
console.log("HAS_ROOT", html.includes('id="root"'));
console.log("LOGS", logs.slice(0, 10).join("\n"));
await page.screenshot({ path: ".preview-screenshots/home-en.png", fullPage: true });
await browser.close();
