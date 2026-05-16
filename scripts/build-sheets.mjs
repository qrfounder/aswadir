/**
 * Builds styled Massar habit/task workbooks (Excel → Google Sheets).
 * Layout inspired by premium habit dashboards: monthly grid + weekly planner.
 */
import ExcelJS from "exceljs";
import { mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { COLORS, FONTS } from "./sheet-theme.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "deliverables", "google-sheets");

const HABIT_ROWS = 10;
const FIRST_DAY_COL = 3; // C
const LAST_DAY_COL = FIRST_DAY_COL + 30; // 31 days → col AG
const HABIT_FIRST_ROW = 7;
const ANALYSIS_COL = 2; // B
const HABIT_NAME_COL = 34; // habit labels (right side in RTL view)

const HABITS = [
  { icon: "⏰", name: "الاستيقاظ مبكراً" },
  { icon: "💪", name: "النادي الرياضي" },
  { icon: "📖", name: "القراءة" },
  { icon: "📋", name: "تخطيط اليوم (مسار)" },
  { icon: "🎯", name: "عمل على المشروع" },
  { icon: "🚫", name: "بدون كحول" },
  { icon: "📵", name: "ساعة سوشيال فقط" },
  { icon: "📝", name: "يومية الامتنان" },
  { icon: "🚿", name: "شاور بارد" },
  { icon: "🕌", name: "ورد قرآن" },
];

const WEEK_DAYS_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

function colLetter(n) {
  let s = "";
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function fillStyle(argb) {
  return { type: "pattern", pattern: "solid", fgColor: { argb } };
}

function thinBorder(color = COLORS.grid) {
  const side = { style: "thin", color: { argb: color } };
  return { top: side, bottom: side, left: side, right: side };
}

function applyHeader(cell, text, { mergeTo } = {}) {
  cell.value = text;
  cell.font = { name: FONTS.nameAr, bold: true, size: 11, color: { argb: COLORS.white } };
  cell.fill = fillStyle(COLORS.navy);
  cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  if (mergeTo) {
    return { from: cell.address, to: mergeTo };
  }
  return null;
}

function setCheckboxCell(cell) {
  cell.dataValidation = {
    type: "list",
    allowBlank: true,
    formulae: ['"TRUE","FALSE"'],
    showErrorMessage: false,
  };
  cell.alignment = { horizontal: "center", vertical: "middle" };
  cell.fill = fillStyle(COLORS.white);
  cell.border = thinBorder();
}

function monthNameAr() {
  const months = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
  ];
  return months[new Date().getMonth()];
}

/** Monthly habit dashboard (screenshot 1 style) */
function buildMonthlyHabitsSheet(wb, sheetName = "لوحة العادات") {
  const ws = wb.addWorksheet(sheetName, {
    views: [{ rightToLeft: true, showGridLines: false }],
    properties: { defaultRowHeight: 22 },
  });

  ws.columns = [
    { width: 14 },
    ...Array.from({ length: 31 }, () => ({ width: 3.8 })),
    { width: 22 },
    { width: 12 },
  ];

  for (let r = 1; r <= 45; r++) {
    for (let c = 1; c <= 34; c++) {
      const cell = ws.getCell(r, c);
      cell.fill = fillStyle(COLORS.cream);
    }
  }

  // ── Top header band ──
  ws.mergeCells(1, 1, 2, 8);
  const title = ws.getCell(1, 1);
  title.value = `مسار · Massar\nمتتبع العادات`;
  title.font = { name: FONTS.nameAr, bold: true, size: 16, color: { argb: COLORS.white } };
  title.fill = fillStyle(COLORS.navy);
  title.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  ws.getRow(1).height = 28;
  ws.getRow(2).height = 28;

  ws.mergeCells(1, 9, 2, 20);
  const monthCell = ws.getCell(1, 9);
  monthCell.value = monthNameAr();
  monthCell.font = { name: FONTS.nameAr, bold: true, size: 28, color: { argb: COLORS.gold } };
  monthCell.fill = fillStyle(COLORS.navy);
  monthCell.alignment = { horizontal: "center", vertical: "middle" };

  const kpis = [
    { label: "نسبة التقدم %", col: 22, formula: null },
    { label: "العادات المكتملة", col: 25, formula: null },
    { label: "عدد العادات", col: 28, formula: String(HABITS.length) },
  ];

  kpis.forEach((kpi, i) => {
    const labelCell = ws.getCell(1, kpi.col);
    labelCell.value = kpi.label;
    labelCell.font = { name: FONTS.nameAr, size: 9, color: { argb: COLORS.white } };
    labelCell.fill = fillStyle(COLORS.navyLight);
    labelCell.alignment = { horizontal: "center" };

    const valCell = ws.getCell(2, kpi.col);
    if (kpi.formula) valCell.value = { formula: kpi.formula };
    else if (kpi.col === 28) valCell.value = kpi.formula;
    else valCell.value = "—";
    valCell.font = { name: FONTS.nameAr, bold: true, size: 14, color: { argb: COLORS.orangeLight } };
    valCell.fill = fillStyle(COLORS.navyLight);
    valCell.alignment = { horizontal: "center" };
  });

  // Progress % formula (after grid exists — set later row reference)
  const summaryRow = HABIT_FIRST_ROW + HABITS.length + 1;
  const firstDayL = colLetter(FIRST_DAY_COL);
  const lastDayL = colLetter(LAST_DAY_COL);

  ws.getCell(2, 22).value = {
    formula: `IFERROR(ROUND(COUNTIF(${firstDayL}${HABIT_FIRST_ROW}:${lastDayL}${HABIT_FIRST_ROW + HABITS.length - 1},TRUE)/(COUNTA(${colLetter(HABIT_NAME_COL)}${HABIT_FIRST_ROW}:${colLetter(HABIT_NAME_COL)}${HABIT_FIRST_ROW + HABITS.length - 1})*31)*100,1),0)&"%"`,
  };

  ws.getCell(2, 25).value = {
    formula: `COUNTIF(${firstDayL}${HABIT_FIRST_ROW}:${lastDayL}${HABIT_FIRST_ROW + HABITS.length - 1},TRUE)`,
  };

  // ── Analysis column header ──
  ws.mergeCells(4, ANALYSIS_COL, 5, ANALYSIS_COL);
  const analysisHdr = ws.getCell(4, ANALYSIS_COL);
  analysisHdr.value = "التحليل";
  analysisHdr.font = { name: FONTS.nameAr, bold: true, color: { argb: COLORS.white } };
  analysisHdr.fill = fillStyle(COLORS.navy);
  analysisHdr.alignment = { horizontal: "center", vertical: "middle" };

  // ── Day headers ──
  ws.mergeCells(4, FIRST_DAY_COL, 4, LAST_DAY_COL);
  ws.getCell(4, FIRST_DAY_COL).value = "الأسابيع";
  ws.getCell(4, FIRST_DAY_COL).font = { name: FONTS.nameAr, bold: true, color: { argb: COLORS.white } };
  ws.getCell(4, FIRST_DAY_COL).fill = fillStyle(COLORS.navyLight);
  ws.getCell(4, FIRST_DAY_COL).alignment = { horizontal: "center" };

  for (let d = 0; d < 31; d++) {
    const c = FIRST_DAY_COL + d;
    const hdr = ws.getCell(5, c);
    hdr.value = d + 1;
    hdr.font = { bold: true, size: 9, color: { argb: COLORS.textDark } };
    hdr.fill = fillStyle(COLORS.creamDark);
    hdr.alignment = { horizontal: "center" };
    hdr.border = thinBorder();
  }

  ws.mergeCells(4, HABIT_NAME_COL, 5, HABIT_NAME_COL);
  const habitHdr = ws.getCell(4, HABIT_NAME_COL);
  habitHdr.value = "العادات";
  habitHdr.font = { name: FONTS.nameAr, bold: true, color: { argb: COLORS.white } };
  habitHdr.fill = fillStyle(COLORS.navy);
  habitHdr.alignment = { horizontal: "center", vertical: "middle" };

  // ── Habit rows ──
  HABITS.forEach((habit, idx) => {
    const row = HABIT_FIRST_ROW + idx;
    ws.getRow(row).height = 26;

    const nameCell = ws.getCell(row, HABIT_NAME_COL);
    nameCell.value = `${habit.icon}  ${habit.name}`;
    nameCell.font = { name: FONTS.nameAr, size: 11, bold: true };
    nameCell.fill = fillStyle(COLORS.white);
    nameCell.alignment = { horizontal: "right", vertical: "middle" };
    nameCell.border = thinBorder();

    const dayStart = colLetter(FIRST_DAY_COL);
    const dayEnd = colLetter(LAST_DAY_COL);
    const analysisCell = ws.getCell(row, ANALYSIS_COL);
    analysisCell.value = {
      formula: `REPT("█",MIN(10,ROUND(COUNTIF(${dayStart}${row}:${dayEnd}${row},TRUE)/31*10,0)))&" "&COUNTIF(${dayStart}${row}:${dayEnd}${row},TRUE)&"/31"`,
    };
    analysisCell.font = { name: FONTS.name, size: 9, color: { argb: COLORS.orange } };
    analysisCell.fill = fillStyle(COLORS.creamDark);
    analysisCell.alignment = { horizontal: "left", vertical: "middle" };

    for (let d = 0; d < 31; d++) {
      setCheckboxCell(ws.getCell(row, FIRST_DAY_COL + d));
    }
  });

  // ── Daily summary rows (orange band) ──
  const summaryLabels = [
    { ar: "نسبة التقدم", key: "pct" },
    { ar: "مكتمل", key: "done" },
    { ar: "غير مكتمل", key: "not" },
  ];

  summaryLabels.forEach((sl, i) => {
    const row = summaryRow + i;
    ws.getRow(row).height = 20;
    const labelCell = ws.getCell(row, HABIT_NAME_COL);
    labelCell.value = sl.ar;
    labelCell.font = { name: FONTS.nameAr, bold: true, color: { argb: COLORS.white } };
    labelCell.fill = fillStyle(COLORS.orange);
    labelCell.alignment = { horizontal: "right", vertical: "middle" };

    ws.getCell(row, ANALYSIS_COL).fill = fillStyle(COLORS.orange);

    for (let d = 0; d < 31; d++) {
      const c = FIRST_DAY_COL + d;
      const cl = colLetter(c);
      const cell = ws.getCell(row, c);
      cell.fill = fillStyle(COLORS.orangeLight);
      cell.font = { size: 8, bold: true, color: { argb: COLORS.textDark } };
      cell.alignment = { horizontal: "center" };
      cell.border = thinBorder(COLORS.orange);

      const hr = HABIT_FIRST_ROW;
      const lr = HABIT_FIRST_ROW + HABITS.length - 1;
      if (sl.key === "pct") {
        cell.value = {
          formula: `IFERROR(ROUND(COUNTIF(${cl}${hr}:${cl}${lr},TRUE)/${HABITS.length}*100,0),0)&"%"`,
        };
      } else if (sl.key === "done") {
        cell.value = { formula: `COUNTIF(${cl}${hr}:${cl}${lr},TRUE)` };
      } else {
        cell.value = { formula: `${HABITS.length}-COUNTIF(${cl}${hr}:${cl}${lr},TRUE)` };
      }
    }
  });

  // ── Mental state block ──
  const mentalStart = summaryRow + 4;
  ws.mergeCells(mentalStart, 1, mentalStart, LAST_DAY_COL + 1);
  const mentalHdr = ws.getCell(mentalStart, 1);
  mentalHdr.value = "الحالة الذهنية · Mental State";
  mentalHdr.font = { name: FONTS.nameAr, bold: true, size: 12, color: { argb: COLORS.white } };
  mentalHdr.fill = fillStyle(COLORS.navy);
  mentalHdr.alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(mentalStart).height = 24;

  const mentalRows = [
    { label: "الطاقة", emoji: "⚡" },
    { label: "المزاج", emoji: "😊" },
    { label: "التحفيز", emoji: "🔥" },
  ];

  mentalRows.forEach((mr, i) => {
    const row = mentalStart + 1 + i;
    const lbl = ws.getCell(row, HABIT_NAME_COL);
    lbl.value = `${mr.emoji} ${mr.label}`;
    lbl.font = { name: FONTS.nameAr, bold: true };
    lbl.fill = fillStyle(COLORS.blueChart);
    lbl.alignment = { horizontal: "right" };

    for (let d = 0; d < 31; d++) {
      const cell = ws.getCell(row, FIRST_DAY_COL + d);
      cell.fill = fillStyle("FFE8F4FC");
      cell.border = thinBorder();
      cell.alignment = { horizontal: "center" };
      cell.font = { size: 10 };
      if (d % 3 === 0) cell.value = 5 + (d % 5);
    }
  });

  ws.mergeCells(mentalStart + 5, 1, mentalStart + 5, 8);
  ws.getCell(mentalStart + 5, 1).value =
    "💡 في Google Sheets: حدّد خلايا العادات → إدراج → مربع اختيار لتفعيل ✓ تلقائي";
  ws.getCell(mentalStart + 5, 1).font = {
    name: FONTS.nameAr,
    size: 9,
    italic: true,
    color: { argb: COLORS.textMuted },
  };

  return ws;
}

/** Weekly planner (screenshot 2 style — green) */
function buildWeeklyPlannerSheet(wb) {
  const ws = wb.addWorksheet("المهام الأسبوعية", {
    views: [{ rightToLeft: true, showGridLines: false }],
  });

  const green = COLORS.green;
  const greenPale = COLORS.greenPale;

  for (let c = 1; c <= 28; c++) ws.getColumn(c).width = c === 1 ? 16 : 14;

  // Title row
  ws.mergeCells(1, 1, 1, 14);
  const t = ws.getCell(1, 1);
  t.value = "مسار · Massar — المخطط الأسبوعي";
  t.font = { name: FONTS.nameAr, bold: true, size: 14, color: { argb: COLORS.white } };
  t.fill = fillStyle(green);
  t.alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(1).height = 32;

  // Habit tracker block (top)
  ws.mergeCells(2, 1, 2, 7);
  ws.getCell(2, 1).value = "متتبع العادات";
  ws.getCell(2, 1).font = { name: FONTS.nameAr, bold: true, color: { argb: COLORS.white } };
  ws.getCell(2, 1).fill = fillStyle(green);
  ws.getCell(2, 1).alignment = { horizontal: "center" };

  ws.mergeCells(2, 8, 2, 14);
  ws.getCell(2, 8).value = "التقدم الإجمالي";
  ws.getCell(2, 8).font = { name: FONTS.nameAr, bold: true, color: { argb: COLORS.white } };
  ws.getCell(2, 8).fill = fillStyle(green);
  ws.getCell(2, 8).alignment = { horizontal: "center" };

  const weekHabits = HABITS.slice(0, 8);
  let row = 3;
  ws.getCell(row, 1).value = "العادة";
  ws.getCell(row, 1).fill = fillStyle(greenPale);
  ws.getCell(row, 1).font = { bold: true, name: FONTS.nameAr };

  for (let d = 0; d < 7; d++) {
    const c = ws.getCell(row, 2 + d);
    c.value = WEEK_DAYS_AR[d];
    c.fill = fillStyle(greenPale);
    c.font = { bold: true, size: 9, name: FONTS.nameAr };
    c.alignment = { horizontal: "center" };
  }
  ws.getCell(row, 9).value = "التقدم";
  ws.getCell(row, 9).fill = fillStyle(greenPale);
  ws.getCell(row, 9).font = { bold: true, name: FONTS.nameAr };

  row++;
  weekHabits.forEach((h, hi) => {
    const r = row + hi;
    ws.getCell(r, 1).value = `${h.icon} ${h.name}`;
    ws.getCell(r, 1).font = { name: FONTS.nameAr, size: 10 };
    ws.getCell(r, 1).alignment = { horizontal: "right" };
    ws.getCell(r, 1).border = thinBorder();

    for (let d = 0; d < 7; d++) setCheckboxCell(ws.getCell(r, 2 + d));

    const ds = colLetter(2);
    const de = colLetter(8);
    ws.getCell(r, 9).value = {
      formula: `REPT("▓",ROUND(COUNTIF(${ds}${r}:${de}${r},TRUE)/7*8,0))&" "&ROUND(COUNTIF(${ds}${r}:${de}${r},TRUE)/7*100,0)&"%"`,
    };
    ws.getCell(r, 9).font = { color: { argb: green }, size: 9 };
  });

  row += weekHabits.length + 1;

  // Overall stats placeholder
  ws.mergeCells(3, 10, 3 + weekHabits.length, 14);
  const overall = ws.getCell(3, 10);
  overall.value = {
    formula: `ROUND(COUNTIF(B4:H${3 + weekHabits.length},TRUE)/(7*${weekHabits.length})*100,0)&"%\nمكتمل"`,
  };
  overall.font = { name: FONTS.nameAr, bold: true, size: 18, color: { argb: green } };
  overall.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  overall.fill = fillStyle(greenPale);

  // Daily task columns (below habit block)
  const dayHeaderRow = row + 1;
  const pctRow = dayHeaderRow + 1;
  const tasksLabelRow = pctRow + 1;
  const taskStartRow = tasksLabelRow + 1;
  const sampleTasks = [
    ["أهم مهمة اليوم", "مراجعة البريد", "تمرين", "متابعة مشروع", "تخطيط الغد", "وقت عائلة", "مراجعة مسار"],
    ["شراء مستلزمات", "—", "شرب ماء", "—", "قراءة", "—", "تأمل"],
    ["مكالمة مهمة", "—", "—", "محتوى سوشيال", "—", "—", "—"],
  ];

  for (let d = 0; d < 7; d++) {
    const col = 1 + d * 2;
    ws.mergeCells(dayHeaderRow, col, dayHeaderRow, col + 1);
    const hdr = ws.getCell(dayHeaderRow, col);
    hdr.value = `${WEEK_DAYS_AR[d]}`;
    hdr.font = { name: FONTS.nameAr, bold: true, color: { argb: COLORS.white } };
    hdr.fill = fillStyle(green);
    hdr.alignment = { horizontal: "center" };

    ws.mergeCells(pctRow, col, pctRow, col + 1);
    const pctCell = ws.getCell(pctRow, col);
    const tCol = colLetter(col);
    const tEnd = colLetter(col + 1);
    const tFirst = taskStartRow;
    const tLast = taskStartRow + sampleTasks.length - 1;
    pctCell.value = {
      formula: `IFERROR(ROUND(COUNTIF(${tCol}${tFirst}:${tEnd}${tLast},TRUE)/COUNTA(${tCol}${tFirst}:${tEnd}${tLast})*100,0),0)&"%"`,
    };
    pctCell.font = { bold: true, size: 14, color: { argb: green } };
    pctCell.fill = fillStyle(greenPale);
    pctCell.alignment = { horizontal: "center" };

    ws.mergeCells(tasksLabelRow, col, tasksLabelRow, col + 1);
    ws.getCell(tasksLabelRow, col).value = "المهام";
    ws.getCell(tasksLabelRow, col).font = { bold: true, size: 9, name: FONTS.nameAr };
    ws.getCell(tasksLabelRow, col).fill = fillStyle(COLORS.creamDark);
    ws.getCell(tasksLabelRow, col).alignment = { horizontal: "center" };

    sampleTasks.forEach((tasks, ti) => {
      const tr = taskStartRow + ti;
      ws.mergeCells(tr, col, tr, col + 1);
      const taskCell = ws.getCell(tr, col);
      taskCell.value = tasks[d];
      taskCell.font = { name: FONTS.nameAr, size: 9 };
      taskCell.alignment = { horizontal: "right", wrapText: true };
      taskCell.border = thinBorder();
      if (tasks[d] !== "—") setCheckboxCell(taskCell);
    });
  }

  return ws;
}

function buildGuideSheet(wb, productLabel) {
  const ws = wb.addWorksheet("📖 الدليل", { views: [{ rightToLeft: true }] });
  ws.getColumn(1).width = 6;
  ws.getColumn(2).width = 62;

  const lines = [
    ["📖 دليل مسار — " + productLabel],
    [""],
    ["هذا ملف Excel جاهز للرفع على Google Drive."],
    [""],
    ["✅ بعد الرفع على Google Sheets:"],
    ["1", "ملف → إنشاء نسخة (نسختك الخاصة)"],
    ["2", "لوحة العادات: حدّد شبكة العادات → إدراج → مربع اختيار"],
    ["3", "غيّر أسماء العادات في العمود الأيمن"],
    ["4", "سجّل كل مساء — 5 دقايق"],
    [""],
    ["🎨 للوصول لمظهر الرسوم البيانية مثل القوالب الاحترافية:"],
    ["•", "أضف مخطط مساحي من صف «نسبة التقدم» اليومية"],
    ["•", "أضف مخطط دائري من خلية «التقدم الإجمالي»"],
    [""],
    ["© مسار · Massar — support@aswadir.store"],
  ];

  lines.forEach((line, i) => {
    const row = i + 1;
    if (line.length === 1) {
      ws.getCell(row, 1).value = line[0];
      ws.mergeCells(row, 1, row, 2);
      ws.getCell(row, 1).font = {
        name: FONTS.nameAr,
        bold: row === 1,
        size: row === 1 ? 14 : 11,
        color: { argb: row === 1 ? COLORS.navy.replace("FF", "") : COLORS.textDark },
      };
    } else {
      ws.getCell(row, 1).value = line[0];
      ws.getCell(row, 2).value = line[1];
      ws.getCell(row, 2).font = { name: FONTS.nameAr, size: 10 };
    }
  });

  return ws;
}

async function writeWorkbook(filename, buildFn) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Massar";
  wb.created = new Date();
  await buildFn(wb);
  const path = join(OUT_DIR, filename);
  await wb.xlsx.writeFile(path);
  console.log(`✓ ${path}`);
}

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

await writeWorkbook("massar-habits-ar.xlsx", async (wb) => {
  buildMonthlyHabitsSheet(wb);
  buildGuideSheet(wb, "متتبع العادات");
});

await writeWorkbook("massar-tasks-ar.xlsx", async (wb) => {
  buildWeeklyPlannerSheet(wb);
  buildGuideSheet(wb, "متتبع المهام");
});

await writeWorkbook("massar-bundle-ar.xlsx", async (wb) => {
  buildMonthlyHabitsSheet(wb, "لوحة العادات");
  buildWeeklyPlannerSheet(wb);
  buildGuideSheet(wb, "الباقة الكاملة");
});

console.log(`
Done — open in Excel/Sheets, then upload to Google Drive.
Tip: In Google Sheets use Insert → Checkbox on habit cells for ✓ like the reference designs.
`);
