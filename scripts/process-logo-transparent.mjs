/**
 * Install logo PNGs into public/.
 * - Pass a real transparent PNG → trim + write variants (preferred).
 * - Legacy: checkerboard JPEG exports → strips fake transparency grid.
 */
import sharp from "sharp";
import path from "node:path";
import { existsSync } from "node:fs";
import { renameSync } from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DEFAULT_CANDIDATES = [
  path.join(ROOT, "assets/logo.png"),
  path.join(
    ROOT,
    "../../.cursor/projects/Users-mac-Downloads-masar-habit-flow/assets/logo_off-32bd9f64-81ce-4ef9-b8ee-186ef19507a9.png",
  ),
];

function resolveSrc() {
  const arg = process.argv[2];
  if (arg) {
    const p = path.isAbsolute(arg) ? arg : path.join(process.cwd(), arg);
    if (!existsSync(p)) {
      console.error(`File not found: ${p}`);
      process.exit(1);
    }
    return p;
  }
  for (const candidate of DEFAULT_CANDIDATES) {
    if (existsSync(candidate)) return candidate;
  }
  console.error(
    "Usage: node scripts/process-logo-transparent.mjs <path-to-transparent-logo.png>",
  );
  process.exit(1);
}

const SRC = resolveSrc();
const PUB = path.join(ROOT, "public");

function isCheckerBg(r, g, b) {
  if (r > 248 && g > 248 && b > 248) return true;
  if (Math.abs(r - g) < 12 && Math.abs(g - b) < 12) {
    const lum = (r + g + b) / 3;
    if (lum >= 175 && lum <= 250) {
      if (r > g + 25 && r > b + 15) return false; // gold
      if (g > r + 8 && b > r + 5) return false; // teal
      return true;
    }
  }
  return false;
}

async function toTransparentPng(inputPath, outputPath, { cropSquare = false } = {}) {
  let pipeline = sharp(inputPath);
  const meta = await pipeline.metadata();
  if (cropSquare && meta.width && meta.height) {
    const side = Math.min(meta.width, meta.height);
    pipeline = pipeline.extract({ left: 0, top: 0, width: side, height: side });
  }

  const { data, info } = await pipeline.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (isCheckerBg(r, g, b)) {
      data[i + 3] = 0;
    }
  }

  let out = sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).png();

  const trimmed = await out.trim().toBuffer();
  await sharp(trimmed).png({ compressionLevel: 9 }).toFile(outputPath);
  const final = await sharp(outputPath).metadata();
  console.log(outputPath, `${final.width}x${final.height}`, "RGBA");
}

const src = SRC;
console.log("Source:", src);
const meta = await sharp(src).metadata();
const hasAlpha = meta.hasAlpha === true;

async function writeNativeTransparent(inputPath) {
  const trimmed = await sharp(inputPath).trim().png({ compressionLevel: 9 }).toBuffer();
  await sharp(trimmed).toFile(path.join(PUB, "logo-wide.png"));
  await sharp(trimmed).toFile(path.join(PUB, "logo.png"));
  const m = await sharp(trimmed).metadata();
  console.log("logo-wide.png", `${m.width}x${m.height}`, "RGBA");

  const side = m.height;
  const icon = await sharp(trimmed)
    .extract({ left: 0, top: 0, width: side, height: side })
    .png()
    .toBuffer();
  await sharp(icon)
    .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(PUB, "logo-512.png"));
  await sharp(icon)
    .resize(64, 64, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(PUB, "favicon.png"));
  console.log("favicon.png + logo-512.png written");
}

if (hasAlpha) {
  await writeNativeTransparent(src);
} else {
  await toTransparentPng(src, path.join(PUB, "logo-wide.png"));
  await toTransparentPng(src, path.join(PUB, "logo.png"));
  await toTransparentPng(src, path.join(PUB, "favicon.png"), { cropSquare: true });

  const faviconSrc = path.join(PUB, "favicon.png");
  const icon512 = path.join(PUB, "logo-512.png");
  const faviconOut = path.join(PUB, "favicon-64.png");

  await sharp(faviconSrc)
    .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(icon512);
  await sharp(faviconSrc)
    .resize(64, 64, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(faviconOut);

  renameSync(faviconOut, faviconSrc);
}

console.log("Logos written to public/");
