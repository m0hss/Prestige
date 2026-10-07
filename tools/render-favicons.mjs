#!/usr/bin/env node
// Rasterises static/favicon.svg into the PNG icons linked from layouts/_partials/head/meta.html.
// Development only. Requires Playwright with Chromium. Rerun after changing favicon.svg.
//   node tools/render-favicons.mjs
// Writes static/favicon-32.png and static/apple-touch-icon.png (180x180). The SVG is a
// full-bleed square, so no padding is added.
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const svg = fs.readFileSync(path.join(repo, "static/favicon.svg"), "utf8");
const icons = [["favicon-32.png", 32], ["apple-touch-icon.png", 180]];

const executablePath = process.env.CHROMIUM || (fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);
const browser = await chromium.launch(executablePath ? { executablePath } : {});
const page = await browser.newPage();
for (const [name, size] of icons) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<!doctype html><style>html,body{margin:0}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`);
  await page.screenshot({ path: path.join(repo, "static", name), omitBackground: true });
  console.log(`static/${name} (${size}x${size})`);
}
await browser.close();
