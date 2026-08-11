#!/usr/bin/env tsx
/**
 * Batch-generate QR codes for public intake URLs.
 *
 * Usage:
 *   npm run qr:generate -- --product <uuid> --batch <uuid> [--loc <facility-uuid>] [--out ./qr-output]
 *
 * Or CSV mode (product_id,batch_id,outlet_id optional):
 *   npm run qr:generate -- --csv ./batches.csv --out ./qr-output
 */

import fs from "node:fs";
import path from "node:path";
import QRCode from "qrcode";

type Args = {
  product?: string;
  batch?: string;
  loc?: string;
  csv?: string;
  out: string;
  base: string;
};

function parseArgs(argv: string[]): Args {
  const args: Args = {
    out: "./qr-output",
    // Must include basePath (/complain). Absolute /r/... paths drop the path segment.
    base: process.env.NEXT_PUBLIC_APP_URL || "https://hinza.app/complain",
  };

  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    const val = argv[i + 1];
    if (key === "--product") args.product = val;
    if (key === "--batch") args.batch = val;
    if (key === "--loc") args.loc = val;
    if (key === "--csv") args.csv = val;
    if (key === "--out") args.out = val;
    if (key === "--base") args.base = val;
  }
  return args;
}

function buildUrl(base: string, productId: string, batchId: string, loc?: string): string {
  // Join relative to the app base so /complain is preserved (URL() absolute paths replace pathname).
  const url = new URL(`r/${productId}/${batchId}`, `${base.replace(/\/$/, "")}/`);
  url.searchParams.set("src", "qr");
  if (loc) url.searchParams.set("loc", loc);
  return url.toString();
}

async function writeQr(fileBase: string, url: string) {
  await QRCode.toFile(`${fileBase}.png`, url, {
    type: "png",
    width: 512,
    margin: 2,
    errorCorrectionLevel: "M",
  });
  await QRCode.toFile(`${fileBase}.svg`, url, {
    type: "svg",
    width: 512,
    margin: 2,
    errorCorrectionLevel: "M",
  });
  await fs.promises.writeFile(`${fileBase}.txt`, `${url}\n`, "utf8");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  await fs.promises.mkdir(args.out, { recursive: true });

  const rows: Array<{ product: string; batch: string; loc?: string }> = [];

  if (args.csv) {
    const raw = await fs.promises.readFile(args.csv, "utf8");
    const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const start = lines[0]?.toLowerCase().includes("product") ? 1 : 0;
    for (let i = start; i < lines.length; i++) {
      const [product, batch, loc] = lines[i].split(",").map((c) => c.trim());
      if (!product || !batch) continue;
      rows.push({ product, batch, loc: loc || undefined });
    }
  } else if (args.product && args.batch) {
    rows.push({ product: args.product, batch: args.batch, loc: args.loc });
  } else {
    console.error(
      "Provide --product and --batch, or --csv path/to.csv\n" +
        "Example: npm run qr:generate -- --product UUID --batch UUID --out ./qr-output",
    );
    process.exit(1);
  }

  for (const row of rows) {
    const url = buildUrl(args.base, row.product, row.batch, row.loc);
    const fileBase = path.join(
      args.out,
      `${row.product.slice(0, 8)}_${row.batch.slice(0, 8)}${row.loc ? `_${row.loc.slice(0, 8)}` : ""}`,
    );
    await writeQr(fileBase, url);
    console.log(`Wrote ${fileBase}.png/.svg  →  ${url}`);
  }

  console.log(`Done. ${rows.length} QR set(s) in ${path.resolve(args.out)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
