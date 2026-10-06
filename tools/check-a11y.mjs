#!/usr/bin/env node
// axe-core gate for spec 10.8 and 14.10. Development and CI only.
//   node tools/check-a11y.mjs <built-site-dir> [--best-practice]
// The directory is what `hugo` wrote, built with --baseURL /. The gate is WCAG 2.2 AA (axe
// tags wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa); --best-practice adds axe's
// best-practice rules (landmark structure and the like), which are advisory.
// Serves the build on localhost and runs axe on each page type in both modes (Performance,
// Backstage) and both schemes (light, dark). The site reads mode and scheme from
// localStorage before first paint (assets/js/head-init.js), so each run sets them the way
// a returning visitor would. Fails on any violation. Requires Playwright with Chromium.
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const args = process.argv.slice(2);
const bestPractice = args.includes("--best-practice");
const target = args.find((a) => !a.startsWith("--"));
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", ...(bestPractice ? ["best-practice"] : [])];
const dir = path.resolve(target || "");
if (!target || !fs.existsSync(path.join(dir, "index.html"))) {
  console.error("usage: check-a11y.mjs <built-site-dir> [--best-practice]");
  process.exit(2);
}

// Homepage, a case study, the case-study and failures lists, a failure report, About,
// a taxonomy index, a term page and the 404 (spec 10.8).
const PAGES = [
  "/",
  "/work/",
  "/work/ledger-cutover/",
  "/work/festival-door/",
  "/trapdoor/",
  "/trapdoor/cohort-posted-twice/",
  "/about/",
  "/disciplines/",
  "/disciplines/backend/",
  "/404.html",
];
const MODES = ["performance", "backstage"];
const SCHEMES = ["light", "dark"];

const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".woff2": "font/woff2", ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".xml": "application/xml", ".txt": "text/plain" };
const server = http.createServer((req, res) => {
  let f = path.join(dir, decodeURIComponent(req.url.split("?")[0]));
  if (!f.startsWith(dir)) { res.statusCode = 403; return res.end(); }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
  if (!fs.existsSync(f)) { res.statusCode = 404; return res.end(); }
  res.setHeader("content-type", types[path.extname(f)] || "application/octet-stream");
  fs.createReadStream(f).pipe(res);
}).listen(0);
const base = `http://localhost:${server.address().port}`;

const missing = PAGES.filter((p) => !fs.existsSync(path.join(dir, p.endsWith("/") ? p + "index.html" : p)));
if (missing.length) {
  console.error(`Not in the build (is it built with --baseURL /?): ${missing.join(", ")}`);
  process.exit(2);
}

// CHROMIUM_PATH points at an existing Chromium when Playwright's own download is not installed.
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
let runs = 0;
let failed = 0;
for (const scheme of SCHEMES) {
  for (const mode of MODES) {
    // reducedMotion keeps the curtain and step transitions from being caught mid-flight.
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: scheme, reducedMotion: "reduce" });
    await ctx.addInitScript(([m, s]) => {
      try { localStorage.setItem("prestige.mode", m); localStorage.setItem("prestige.scheme", s); } catch (e) {}
    }, [mode, scheme]);
    for (const p of PAGES) {
      const page = await ctx.newPage();
      await page.goto(base + p, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      const state = await page.evaluate(() => [document.documentElement.dataset.mode, document.documentElement.dataset.scheme]);
      if (state[0] !== mode || state[1] !== scheme) {
        console.error(`FAIL ${p} [${mode}, ${scheme}]: page did not take the requested state (got ${state.join(", ")})`);
        failed++;
        runs++;
        await page.close();
        continue;
      }
      const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      runs++;
      if (violations.length) {
        failed++;
        console.error(`FAIL ${p} [${mode}, ${scheme}]: ${violations.length} violation(s)`);
        for (const v of violations) {
          console.error(`  ${v.id} (${v.impact}): ${v.help}\n    ${v.helpUrl}`);
          for (const n of v.nodes.slice(0, 5)) console.error(`    - ${n.target.join(" ")}\n      ${(n.failureSummary || "").split("\n").join("\n      ")}`);
          if (v.nodes.length > 5) console.error(`    ... and ${v.nodes.length - 5} more`);
        }
      } else {
        console.log(`ok   ${p} [${mode}, ${scheme}]`);
      }
      await page.close();
    }
    await ctx.close();
  }
}
await browser.close();
server.close();

if (failed) { console.error(`\n${failed} of ${runs} runs failed.`); process.exit(1); }
console.log(`\naxe (${TAGS.join(", ")}): zero violations across ${runs} runs.`);
