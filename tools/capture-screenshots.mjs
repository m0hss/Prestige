#!/usr/bin/env node
// Captures the catalogue images of spec 12.7 from a fresh build of exampleSite.
// Development only. Requires Hugo extended, Playwright with Chromium, and ImageMagick.
//   node tools/capture-screenshots.mjs
// Writes images/screenshot.png (1500x1000, the top of the homepage, header included),
// images/tn.png (900x600, the same frame downscaled) and
// assets/img/og-default.png (1200x630). The curtain is frozen mid-raise: a staged
// frame documented in the README, not a state a visitor sees at rest (decision 38).
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "prestige-shots-"));
const out = path.join(tmp, "public");
execFileSync(process.env.HUGO || "hugo", ["--source", path.join(repo, "exampleSite"), "--destination", out, "--baseURL", "/"], { stdio: "inherit" });

const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".woff2": "font/woff2", ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml" };
const server = http.createServer((req, res) => {
  let f = path.join(out, decodeURIComponent(req.url.split("?")[0]));
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
  if (!fs.existsSync(f)) { res.statusCode = 404; return res.end(); }
  res.setHeader("content-type", types[path.extname(f)] || "application/octet-stream");
  fs.createReadStream(f).pipe(res);
}).listen(0);
const base = `http://localhost:${server.address().port}/`;

const FREEZE = `html { --curtain-lift: calc(-100% + 176px) !important; }
.drape, .stage-row__back { transition: none !important; }`;

async function capture(height) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1500, height }, deviceScaleFactor: 1, colorScheme: "light", reducedMotion: "reduce" });
  await ctx.addInitScript(() => { try { localStorage.setItem("prestige.mode", "backstage"); } catch (e) {} });
  const page = await ctx.newPage();
  await page.goto(base);
  await page.addStyleTag({ content: FREEZE });
  await page.evaluate(async () => {
    await document.fonts.ready;
    document.querySelectorAll("img[loading=lazy]").forEach((i) => { i.loading = "eager"; });
    await Promise.all(Array.from(document.images).map((i) => i.complete || new Promise((r) => { i.onload = i.onerror = r; })));
  });
  await page.waitForTimeout(200);
  return { browser, page };
}

const shots = path.join(repo, "images");
{
  const { browser, page } = await capture(1000);
  await page.screenshot({ path: path.join(shots, "screenshot.png") });
  await browser.close();
}
// The thumbnail is the whole screenshot scaled down (both are 3:2), never a crop:
// a crop starts mid-word in the catalogue grid and reads as a rendering bug.
execFileSync("convert", [path.join(shots, "screenshot.png"), "-filter", "Lanczos", "-resize", "900x600", path.join(shots, "tn.png")]);
{
  const { browser, page } = await capture(1100);
  const top = await page.evaluate(() => Math.round(document.querySelector(".stage__body").getBoundingClientRect().top + window.scrollY));
  await page.screenshot({ path: path.join(repo, "assets", "img", "og-default.png"), fullPage: true, clip: { x: 150, y: top, width: 1200, height: 630 } });
  await browser.close();
}
server.close();
fs.rmSync(tmp, { recursive: true, force: true });
console.log("Wrote images/screenshot.png, images/tn.png and assets/img/og-default.png");
