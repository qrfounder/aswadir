/**
 * Local HTML preview of deliverables/google-sheets/*.xlsx
 * Run: npm run preview:sheets
 */
import XLSX from "xlsx";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SHEETS_DIR = join(__dirname, "..", "deliverables", "google-sheets");
const OUT_DIR = join(__dirname, "..", "deliverables", "preview");

const WORKBOOKS = [
  { id: "bundle", label: "الباقة الكاملة", file: "massar-bundle-ar.xlsx" },
  { id: "habits", label: "متتبع العادات", file: "massar-habits-ar.xlsx" },
  { id: "tasks", label: "متتبع المهام", file: "massar-tasks-ar.xlsx" },
];

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function sheetToHtml(ws, title) {
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
  const maxRows = Math.min(rows.length, 22);
  const body = rows
    .slice(0, maxRows)
    .map((row, ri) => {
      const tag = ri === 0 ? "th" : "td";
      const cells = row
        .slice(0, 14)
        .map((c) => `<${tag}>${escapeHtml(c)}</${tag}>`)
        .join("");
      const more =
        row.length > 14
          ? `<td class="muted" colspan="2">… +${row.length - 14} عمود</td>`
          : "";
      return `<tr>${cells}${more}</tr>`;
    })
    .join("");

  return `
    <section class="sheet">
      <h2>${escapeHtml(title)}</h2>
      <div class="wrap"><table><tbody>${body}</tbody></table></div>
    </section>`;
}

mkdirSync(OUT_DIR, { recursive: true });

let nav = "";
let articles = "";

for (const wb of WORKBOOKS) {
  const path = join(SHEETS_DIR, wb.file);
  if (!existsSync(path)) {
    console.warn(`Skip missing: ${path}`);
    continue;
  }
  const book = XLSX.readFile(path);
  nav += `<a href="#${wb.id}">${escapeHtml(wb.label)}</a>`;
  let sheets = "";
  for (const name of book.SheetNames) {
    sheets += sheetToHtml(book.Sheets[name], name);
  }
  articles += `<article id="${wb.id}" class="workbook"><h1>${escapeHtml(wb.label)}</h1>${sheets}</article>`;
}

const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>معاينة مسار — Google Sheets</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;800&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; }
    body { font-family: Cairo, system-ui; background: #0a0e1a; color: #e8e8e8; margin: 0; padding: 24px; }
    h1 { color: #D4AF37; font-size: 1.5rem; }
    h2 { color: #F5E17A; font-size: 1rem; margin: 1.25rem 0 0.5rem; }
    nav { display: flex; gap: 10px; flex-wrap: wrap; margin: 16px 0 28px; }
    nav a { color: #D4AF37; text-decoration: none; padding: 8px 14px; border: 1px solid rgba(212,175,55,.35); border-radius: 8px; font-weight: 700; }
    nav a:hover { background: rgba(212,175,55,.12); }
    .workbook { margin-bottom: 3rem; padding-bottom: 2rem; border-bottom: 1px solid rgba(212,175,55,.2); }
    .wrap { overflow-x: auto; border: 1px solid rgba(212,175,55,.15); border-radius: 12px; background: rgba(0,0,0,.25); }
    table { border-collapse: collapse; font-size: 11px; width: max-content; min-width: 100%; }
    th, td { border: 1px solid rgba(255,255,255,.08); padding: 5px 7px; text-align: right; white-space: nowrap; max-width: 200px; overflow: hidden; text-overflow: ellipsis; }
    th { background: #1a2235; color: #D4AF37; position: sticky; top: 0; }
    tr:nth-child(even) td { background: rgba(255,255,255,.02); }
    .muted { color: #888; font-style: italic; }
    .note { color: #9ca3af; font-size: 13px; margin-bottom: 8px; }
    .dl { margin-top: 12px; }
    .dl a { color: #93c5fd; font-size: 13px; }
  </style>
</head>
<body>
  <p class="note">معاينة محلية — المنتج النهائي يُسلّم من Google Drive (رابط /copy)، مو من موقع الدفع.</p>
  <nav>${nav}</nav>
  ${articles}
  <p class="dl">ملفات Excel للرفع على Drive:
    <a href="../google-sheets/massar-bundle-ar.xlsx">الباقة</a> ·
    <a href="../google-sheets/massar-habits-ar.xlsx">عادات</a> ·
    <a href="../google-sheets/massar-tasks-ar.xlsx">مهام</a>
  </p>
</body>
</html>`;

const outPath = join(OUT_DIR, "index.html");
writeFileSync(outPath, html);
console.log(`Preview: ${outPath}`);
console.log("Run: npm run preview:sheets (starts server on :4177)");
