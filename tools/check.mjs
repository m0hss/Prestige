#!/usr/bin/env node
// Release gate: runs every mechanical item of the acceptance checklist (spec 14) and the
// build-time validation table (3.6). Development and CI only; nothing here ships.
//   node tools/check.mjs               static, build and fixture checks (needs Hugo extended)
//   node tools/check.mjs --browser     also Chromium checks: axe-core, overflow, no-JS, toggle
//   node tools/check.mjs --grep 3.6    only checks whose id or name contains the text
// HUGO picks the binary (default `hugo` on PATH). Each check names the spec item it enforces;
// a failing check prints what it found. Exit status is 1 when any check fails.
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SPEC = path.join(REPO, "stitch_markdown_prestige_system_designer", "prestige_design.md");
const HUGO = process.env.HUGO || "hugo";
const ORIGIN = "https://prestige.test";
const argv = process.argv.slice(2);
const BROWSER = argv.includes("--browser");
const GREP = argv.includes("--grep") ? argv[argv.indexOf("--grep") + 1] : "";
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "prestige-check-"));
const RES = path.join(TMP, "resources"); // one image cache for every build below

const read = (f) => fs.readFileSync(path.resolve(REPO, f), "utf8");
const walk = (dir, ext = "") => fs.readdirSync(dir, { recursive: true, withFileTypes: true }).filter((d) => d.isFile() && d.name.endsWith(ext)).map((d) => path.join(d.parentPath ?? d.path, d.name));
const rel = (f) => path.relative(REPO, f).split(path.sep).join("/");

// ---------- runner ----------
const checks = [];
const check = (id, name, fn) => checks.push({ id, name, fn });

function exec(cmd, args, opts = {}) {
  return new Promise((resolve) => {
    const p = spawn(cmd, args, { env: { ...process.env, HUGO_RESOURCEDIR: RES, ...opts.env }, cwd: opts.cwd || REPO });
    let out = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (out += d));
    p.on("error", (e) => resolve({ code: 127, out: String(e) }));
    p.on("close", (code) => resolve({ code, out }));
  });
}
const warnings = (out) => out.split("\n").filter((l) => /^(WARN|ERROR)\b/.test(l.trim()));

// A copy of exampleSite whose module replacement points at this checkout.
function site(name, edit) {
  const dir = path.join(TMP, name);
  fs.cpSync(path.join(REPO, "exampleSite"), dir, { recursive: true, filter: (s) => !/[\\/](public|resources)$/.test(s) });
  const cfg = path.join(dir, "hugo.toml");
  const repo = REPO.split(path.sep).join("/");
  fs.writeFileSync(cfg, fs.readFileSync(cfg, "utf8").replace("-> ../..", `-> ${repo}`));
  const f = (p) => path.join(dir, p);
  edit?.({
    dir,
    sub(file, from, to) {
      const s = fs.readFileSync(f(file), "utf8");
      const t = s.replace(from, to);
      if (s === t) throw new Error(`fixture is stale: ${from} not found in exampleSite/${file}`);
      fs.writeFileSync(f(file), t);
    },
    rm: (p) => fs.rmSync(f(p), { recursive: true, force: true }),
    write: (p, s) => (fs.mkdirSync(path.dirname(f(p)), { recursive: true }), fs.writeFileSync(f(p), s)),
  });
  return dir;
}
function build(dir, args = [], dest) {
  const out = dest ? ["--destination", dest] : ["--renderToMemory"];
  return exec(HUGO, ["--source", dir, "--printI18nWarnings", "--printPathWarnings", ...out, ...args]);
}

// ---------- HTML helpers (built output is minified, so attribute quotes are optional) ----------
const ATTR = (name) => new RegExp(`\\s${name}=("([^"]*)"|'([^']*)'|([^\\s>]+))`, "gi");
const attrs = (html, name) => [...html.matchAll(ATTR(name))].map((m) => m[2] ?? m[3] ?? m[4]);
const tags = (html, tag) => html.match(new RegExp(`<${tag}\\b[^>]*>`, "gi")) || [];
const attr = (tag, name) => { const m = ATTR(name).exec(tag); return m && (m[2] ?? m[3] ?? m[4]); };
const urls = (html) => [
  ...attrs(html, "href"), ...attrs(html, "src"), ...attrs(html, "poster"),
  ...attrs(html, "srcset").flatMap((s) => s.split(",").map((c) => c.trim().split(/\s+/)[0])),
].filter(Boolean);
const htmlFiles = (root) => walk(root, ".html");
const fileFor = (root, prefix, url) => {
  let p = decodeURIComponent(url.split("#")[0].split("?")[0]);
  if (!p.startsWith(prefix)) return null;
  p = path.join(root, p.slice(prefix.length));
  if (p.endsWith(path.sep) || p.endsWith("/")) p = path.join(p, "index.html");
  else if (!path.extname(p)) p = path.join(p, "index.html");
  return p;
};

// Resolves every same-site link, image and fragment in a built site (14.5 "every link resolves").
function brokenLinks(root, prefix, origin) {
  const ids = new Map();
  const idsOf = (f) => {
    if (!ids.has(f)) ids.set(f, new Set(fs.existsSync(f) ? attrs(fs.readFileSync(f, "utf8"), "id") : []));
    return ids.get(f);
  };
  const bad = [];
  for (const file of htmlFiles(root)) {
    const html = fs.readFileSync(file, "utf8");
    const page = "/" + path.relative(root, file).split(path.sep).join("/").replace(/index\.html$/, "");
    for (let u of urls(html)) {
      if (u === "#" || /^(mailto|tel|data):/.test(u)) continue;
      if (origin && u.startsWith(origin)) u = u.slice(origin.length);
      else if (/^([a-z]+:)?\/\//i.test(u)) continue;
      if (u.startsWith("#")) u = prefix + page.slice(1) + u;
      else if (!u.startsWith("/")) u = new URL(u, "http://x" + prefix + page.slice(1)).pathname;
      const target = fileFor(root, prefix, u);
      if (!target) { bad.push(`${rel(file)}: ${u} is outside ${prefix}`); continue; }
      if (!fs.existsSync(target)) { bad.push(`${path.relative(root, file)}: ${u} does not exist`); continue; }
      const frag = u.split("#")[1];
      if (frag && target.endsWith(".html") && !idsOf(target).has(decodeURIComponent(frag))) bad.push(`${path.relative(root, file)}: ${u} has no element with that id`);
    }
  }
  return [...new Set(bad)];
}

// ---------- 6.2 colour, from the spec tables and tokens.css ----------
function lum(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const PALETTES = ["Performance · Light", "Performance · Dark", "Backstage · Light", "Backstage · Dark"];
function specColour() {
  const s = read(SPEC);
  const sec = s.slice(s.indexOf("### 6.2 Colour"), s.indexOf("### 6.3"));
  const tokens = {};
  for (const m of sec.matchAll(/^\| `(\w+)` \| `(--[\w-]+)` \|[^|]*\| `(#\w{6})` \| `(#\w{6})` \| `(#\w{6})` \| `(#\w{6})` \|$/gm))
    tokens[m[1]] = { css: m[2], hex: m.slice(3, 7).map((h) => h.toUpperCase()) };
  const pairs = [];
  for (const m of sec.matchAll(/^\| (\d+) \| (.*) \| (text 4\.5:1|UI 3:1) \| ([\d.]+):1 \| ([\d.]+):1 \| ([\d.]+):1 \| ([\d.]+):1 \|$/gm)) {
    const p = [...m[2].matchAll(/\(`(\w+)` on `(\w+)`\)/g)].pop();
    pairs.push({ n: +m[1], fg: p[1], bg: p[2], min: m[3].startsWith("text") ? 4.5 : 3, stated: m.slice(4, 8).map(Number) });
  }
  return { tokens, pairs };
}
function cssColour() {
  const css = read("assets/css/tokens.css");
  const main = css.slice(0, css.indexOf("@supports not"));
  const fallback = css.slice(css.indexOf("@supports not"), css.indexOf("/* ---------- Typefaces"));
  const block = (src, mode) => {
    const at = src.indexOf(`[data-mode="${mode}"] {`);
    return src.slice(at, src.indexOf("}", at));
  };
  const pal = {};
  for (const [i, mode] of ["performance", "backstage"].entries()) {
    for (const m of block(main, mode).matchAll(/(--[\w-]+):\s*light-dark\((#\w+),\s*(#\w+)\)/g)) {
      (pal[m[1]] ||= [])[i * 2] = m[2].toUpperCase();
      pal[m[1]][i * 2 + 1] = m[3].toUpperCase();
    }
  }
  const fb = {};
  for (const [i, mode] of ["performance", "backstage"].entries())
    for (const m of block(fallback, mode).matchAll(/(--[\w-]+):\s*(#\w+);/g)) (fb[m[1]] ||= [])[i] = m[2].toUpperCase();
  return { pal, fb };
}

// =====================================================================================
// Static checks: the repository itself, no build needed.
// =====================================================================================
check("14.1", "theme.toml has every catalogue field and an [author] table", () => {
  const t = read("theme.toml");
  const missing = ["name", "license", "licenselink", "description", "homepage", "demosite", "tags", "features", "min_version"].filter((k) => !new RegExp(`^${k}\\s*=`, "m").test(t));
  if (!/^\[author\]\s*\n\s*name\s*=/m.test(t)) missing.push("[author] name");
  return missing.map((k) => `missing ${k}`);
});

check("14.1", "Hugo minimum version agrees across theme.toml, exampleSite and Netlify", () => {
  const theme = read("theme.toml").match(/^min_version\s*=\s*"([^"]+)"/m)?.[1];
  const ex = read("exampleSite/hugo.toml").match(/min\s*=\s*"([^"]+)"/)?.[1];
  const net = read("netlify.toml").match(/HUGO_VERSION\s*=\s*"([^"]+)"/)?.[1];
  const v = (s) => s.split(".").map(Number).reduce((a, n) => a * 1000 + n, 0);
  const p = [];
  if (theme !== ex) p.push(`theme.toml min_version ${theme} but exampleSite/hugo.toml min ${ex}`);
  if (net && v(net) < v(theme)) p.push(`netlify.toml builds with ${net}, below the minimum ${theme}`);
  return p;
});

check("14.1", "catalogue images are 1500x1000, 900x600 and 1200x630", () => {
  const dims = (f) => { const b = fs.readFileSync(path.join(REPO, f)); return `${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`; };
  return [["images/screenshot.png", "1500x1000"], ["images/tn.png", "900x600"], ["assets/img/og-default.png", "1200x630"]]
    .filter(([f, want]) => dims(f) !== want).map(([f, want]) => `${f} is ${dims(f)}, expected ${want}`);
});

check("14.1", "LICENSE is MIT and every font has its OFL text and README credit", () => {
  const p = [];
  if (!/^MIT License/m.test(read("LICENSE"))) p.push("LICENSE is not the MIT text");
  const fonts = fs.readdirSync(path.join(REPO, "assets/fonts"));
  const readme = read("README.md");
  for (const fam of new Set(fonts.filter((f) => f.endsWith(".woff2")).map((f) => f.split("-")[0]))) {
    if (!fonts.some((f) => f.startsWith("OFL-") && f.includes(fam))) p.push(`no OFL licence text for ${fam}`);
    const words = fam.replace(/([a-z])([A-Z])/g, "$1 $2").replace("Plex Mono", "IBM Plex Mono");
    if (!readme.includes(words)) p.push(`README does not credit ${words}`);
  }
  return p;
});

check("14.8", "tokens.css carries exactly the 6.2 hex values in all four palettes", () => {
  const { tokens } = specColour();
  const { pal, fb } = cssColour();
  const p = [];
  if (Object.keys(tokens).length < 20) p.push(`could only read ${Object.keys(tokens).length} tokens from spec 6.2`);
  for (const [name, { css, hex }] of Object.entries(tokens)) {
    hex.forEach((h, i) => { if (pal[css]?.[i] !== h) p.push(`${css} ${PALETTES[i]}: tokens.css ${pal[css]?.[i]}, spec ${h}`); });
    [0, 2].forEach((i) => { if (fb[css]?.[i / 2] !== hex[i]) p.push(`${css} ${PALETTES[i]} fallback: tokens.css ${fb[css]?.[i / 2]}, spec ${hex[i]}`); });
    if (!name) p.push("unnamed token");
  }
  return p;
});

check("14.8", "all 28 contrast pairs meet their ratio in all four palettes (112 checks)", () => {
  const { tokens, pairs } = specColour();
  const { pal } = cssColour();
  const p = [];
  if (pairs.length !== 28) p.push(`expected 28 pairs in spec 6.2, read ${pairs.length}`);
  for (const pr of pairs) {
    const fg = pal[tokens[pr.fg]?.css], bg = pal[tokens[pr.bg]?.css];
    if (!fg || !bg) { p.push(`pair ${pr.n}: unknown token ${pr.fg} or ${pr.bg}`); continue; }
    PALETTES.forEach((name, i) => {
      const r = ratio(fg[i], bg[i]);
      if (r < pr.min) p.push(`pair ${pr.n} (${pr.fg} on ${pr.bg}) ${name}: ${r.toFixed(2)}:1 is below ${pr.min}:1`);
      else if (Math.abs(r - pr.stated[i]) > 0.011) p.push(`pair ${pr.n} (${pr.fg} on ${pr.bg}) ${name}: measures ${r.toFixed(2)}:1, spec table says ${pr.stated[i]}:1`);
    });
  }
  return p;
});

check("14.8", "no colour value in assets/css outside tokens.css", () =>
  walk(path.join(REPO, "assets/css"), ".css").filter((f) => !f.endsWith("tokens.css")).flatMap((f) =>
    read(f).replace(/\/\*[\s\S]*?\*\//g, "").split("\n").flatMap((l, i) =>
      /#[0-9a-f]{3,8}\b(?![\w-]*\s*[{,])|\b(rgba?|hsla?|oklch|lab|lch|hwb)\(/i.test(l) ? [`${rel(f)}:${i + 1}: ${l.trim().slice(0, 80)}`] : [])));

check("13", "anti-patterns: no source matches a detection rule of section 13", () => {
  const p = [];
  const scan = (dirs, ext, re, why) => {
    for (const d of dirs) for (const f of walk(path.join(REPO, d), ext)) {
      read(f).replace(/\/\*[\s\S]*?\*\//g, "").split("\n").forEach((l, i) => { if (re.test(l)) p.push(`${rel(f)}:${i + 1}: ${why}: ${l.trim().slice(0, 70)}`); });
    }
  };
  scan(["layouts", "assets/css"], "", /role=["']?progressbar|<meter\b|\b(ratings?|proficien\w*|skills?)\b/i, "proficiency display");
  scan(["layouts", "assets"], "", /carousel|swiper|slick|testimonial|marquee|autoplay/i, "carousel or testimonial");
  scan(["assets/js"], ".js", /\bsetInterval\b|\bIntersectionObserver\b/, "auto-advance or scroll trigger");
  scan(["assets/js", "layouts"], "", /document\.cookie/, "cookie write");
  scan(["assets/css"], ".css", /repeat\(\s*auto-fi(ll|t)/, "equal card grid");
  scan(["assets/css"], ".css", /radial-gradient|conic-gradient|(?<!repeating-)linear-gradient\(/, "smooth gradient");
  scan(["assets/css"], ".css", /background(-image)?\s*:[^;]*url\(|scroll-timeline|animation-timeline|view-timeline/, "texture or scroll effect");
  scan(["assets/css"], ".css", /:hover[^{]*\{[^}]*\b(display|visibility)\s*:/, "hover-gated content");
  scan(["layouts"], ".html", /type=["']?range|draggable/, "before/after slider");
  for (const f of walk(path.join(REPO, "assets/css"), ".css")) {
    const css = read(f);
    for (const m of css.matchAll(/(box|text)-shadow\s*:\s*([^;}]+)/g)) {
      for (const sh of m[2].split(/,(?![^(]*\))/)) {
        const lens = sh.trim().split(/\s+/).filter((t) => /^-?[\d.]+(px|rem|em)?$/.test(t) || /^var\(--(bw|shadow)/.test(t));
        if (lens.length >= 3 && !/^0(px|rem|em)?$/.test(lens[2])) p.push(`${rel(f)}: ${m[1]}-shadow with blur: ${m[2].trim()}`);
      }
    }
    for (const m of css.matchAll(/@keyframes\s+[\w-]+\s*\{([\s\S]*?\}\s*)\}/g)) if (/\b(width|content)\s*:/.test(m[1])) p.push(`${rel(f)}: @keyframes animates width or content`);
    for (const m of css.matchAll(/([^{}]*\.intro[^{}]*)\{([^}]*)\}/g)) if (/text-align\s*:\s*center/.test(m[2])) p.push(`${rel(f)}: centred home intro (${m[1].trim()})`);
  }
  return p;
});

check("11.8", "every i18n key a template names exists, and every key is used", () => {
  const keys = new Set([...read("i18n/en.toml").matchAll(/^([a-z0-9_]+)\s*=/gm)].map((m) => m[1]));
  for (const m of read("i18n/en.toml").matchAll(/^\[([a-z0-9_]+)\]/gm)) keys.add(m[1]);
  const src = walk(path.join(REPO, "layouts"), ".html").map(read).join("\n");
  const used = new Set([...src.matchAll(/\b(?:i18n|T)\s+"([a-z0-9_]+)"/g)].map((m) => m[1]));
  const prefixes = [...src.matchAll(/\b(?:i18n|T)\s+\(printf\s+"([a-z0-9_]*)%[sdv]"/g)].map((m) => m[1]);
  const p = [...used].filter((k) => !keys.has(k)).map((k) => `layouts name i18n key ${k}, which en.toml lacks`);
  const listed = ["failures_empty"]; // in the 11.8 table; the template uses its _title and _body halves
  for (const k of keys) if (!used.has(k) && !listed.includes(k) && !prefixes.some((x) => x && k.startsWith(x)) && !src.includes(`"${k}"`)) p.push(`en.toml key ${k} is never used`);
  return p;
});

// =====================================================================================
// The demo site, built once with a known origin.
// =====================================================================================
const PUB = path.join(TMP, "public");
let mainBuild;
const demo = () => (mainBuild ||= build(site("demo"), ["--gc", "--minify", "--baseURL", ORIGIN + "/"], PUB));
const page = (p) => fs.readFileSync(path.join(PUB, p), "utf8");
const SIX = ["index.html", "work/ledger-cutover/index.html", "trapdoor/index.html", "about/index.html", "disciplines/backend/index.html", "404.html"];

check("14.1", "exampleSite builds with zero warnings and zero errors", async () => {
  const { code, out } = await demo();
  return code ? [`hugo exited ${code}`, ...warnings(out)] : warnings(out);
});

check("14.2", "CSS and JS budgets (tools/check-budgets.sh)", async () => {
  const { code, out } = await exec("sh", [path.join(REPO, "tools/check-budgets.sh")], { env: { HUGO } });
  return code ? out.trim().split("\n") : [];
});

check("14.2", "no request to another origin and no cookie on any page", async () => {
  await demo();
  const p = [];
  for (const f of htmlFiles(PUB)) {
    const html = fs.readFileSync(f, "utf8");
    const fetched = [...tags(html, "script"), ...tags(html, "img"), ...tags(html, "source"), ...tags(html, "iframe"), ...tags(html, "video"), ...tags(html, "audio"),
      ...tags(html, "link").filter((t) => !/rel=["']?(canonical|alternate|me)\b/i.test(t))];
    for (const t of fetched) for (const u of urls(t)) if (/^([a-z]+:)?\/\//i.test(u) && !u.startsWith(ORIGIN)) p.push(`${path.relative(PUB, f)}: ${u}`);
    if (/document\.cookie\s*=/.test(html)) p.push(`${path.relative(PUB, f)}: writes document.cookie`);
  }
  for (const f of walk(PUB, ".css")) for (const m of fs.readFileSync(f, "utf8").matchAll(/url\(\s*["']?((?:[a-z]+:)?\/\/[^)"']+)/gi)) if (!m[1].startsWith(ORIGIN)) p.push(`${path.relative(PUB, f)}: ${m[1]}`);
  return [...new Set(p)];
});

check("14.2", "the six page types are complete documents without JavaScript", async () => {
  await demo();
  const p = [];
  for (const f of SIX) {
    if (!fs.existsSync(path.join(PUB, f))) { p.push(`${f} was not built`); continue; }
    const h = page(f);
    if (!/<\/html>\s*$/.test(h)) p.push(`${f}: document does not end with </html>`);
    if (!/<html[^>]*\slang=/.test(h)) p.push(`${f}: <html> has no lang`);
    if (!/<main\b[^>]*\sid=["']?content\b/.test(h)) p.push(`${f}: no <main id=content>`);
    if (tags(h, "h1").length !== 1) p.push(`${f}: ${tags(h, "h1").length} <h1> elements`);
    if (!/<title>[^<]+<\/title>/.test(h)) p.push(`${f}: empty <title>`);
  }
  return p;
});

check("14.5", "every internal link, image and fragment resolves", async () => (await demo(), brokenLinks(PUB, "/", ORIGIN)));

check("10", "ids are unique, images have alt, and the skip link targets #content", async () => {
  await demo();
  const p = [];
  for (const f of htmlFiles(PUB)) {
    const h = fs.readFileSync(f, "utf8"), r = path.relative(PUB, f);
    if (/http-equiv=["']?refresh/i.test(h)) continue; // alias redirect
    const seen = new Set();
    for (const id of attrs(h.replace(/<svg[\s\S]*?<\/svg>/g, ""), "id")) { if (seen.has(id)) p.push(`${r}: duplicate id ${id}`); seen.add(id); }
    for (const t of tags(h, "img")) if (attr(t, "alt") === null) p.push(`${r}: <img> without alt: ${t.slice(0, 80)}`);
    const firstLink = tags(h, "a")[0] || "";
    if (!/skip-link/.test(firstLink) || attr(firstLink, "href") !== "#content") p.push(`${r}: first link is not the skip link to #content`);
  }
  return p;
});

check("14.5", "no control is visible before the script runs; the mode switch is never disabled", async () => {
  await demo();
  const p = [];
  for (const f of htmlFiles(PUB)) {
    const h = fs.readFileSync(f, "utf8"), r = path.relative(PUB, f);
    if (/<fieldset[^>]*\sdisabled/.test(h)) p.push(`${r}: fieldset[disabled]`);
    // Every button and form control sits inside an element that carries `hidden` until html.js.
    const stack = [];
    for (const m of h.matchAll(/<(\/?)([a-z][\w-]*)\b([^>]*)>/gi)) {
      const [, close, name, rest] = m;
      const tag = name.toLowerCase();
      if (["br", "img", "input", "meta", "link", "source", "hr", "wbr", "path", "rect", "use"].includes(tag) || rest.endsWith("/")) {
        if (tag === "input" && !stack.includes(true) && !/\shidden\b/.test(rest)) p.push(`${r}: visible <input> without JavaScript`);
        continue;
      }
      if (close) { stack.pop(); continue; }
      const hidden = /\shidden\b/.test(rest);
      if ((tag === "button" || tag === "select") && !hidden && !stack.includes(true)) p.push(`${r}: visible <${tag}> without JavaScript: <${tag}${rest.slice(0, 60)}>`);
      stack.push(hidden);
    }
  }
  return [...new Set(p)];
});

check("14.5", "case study: Performance, Backstage, Trapdoor in reading order, steps expanded", async () => {
  await demo();
  const h = page("work/ledger-cutover/index.html");
  const at = (id) => h.search(new RegExp(`\\sid=["']?${id}\\b`));
  const p = [];
  const [pf, bs, td] = ["performance", "backstage", "trapdoor"].map(at);
  if (!(pf >= 0 && pf < bs && bs < td)) p.push(`layer order is performance@${pf}, backstage@${bs}, trapdoor@${td}`);
  const steps = tags(h, "li").filter((t) => /class=["']?step\b/.test(t));
  if (steps.length !== 6) p.push(`expected 6 steps, found ${steps.length}`);
  for (const s of steps) if (!/data-open=["']?true/.test(s)) p.push(`step not expanded without JavaScript: ${s}`);
  return p;
});

check("9.4", "a Performance-only case study shows its notice and has no step area", async () => {
  await demo();
  const h = page("work/pickup-point-finder/index.html");
  const p = [];
  if (!/class=["']?notice po-notice/.test(h)) p.push("no Performance-only notice");
  if (/class=["']?step\b/.test(h)) p.push("renders step markup");
  return p;
});

check("9.6", "home: both faces of every card are in the document", async () => {
  await demo();
  const h = page("index.html");
  const front = (h.match(/stage-row__front\b/g) || []).length, back = (h.match(/stage-row__back\b/g) || []).length;
  const n = fs.readdirSync(path.join(REPO, "exampleSite/content/work"), { withFileTypes: true }).filter((d) => d.isDirectory()).length;
  return front >= n && back >= n ? [] : [`${n} case studies but ${front} front and ${back} back faces`];
});

check("14.3", "barcodes are stable per ref, distinct across refs, identical between builds", async () => {
  await demo();
  const again = path.join(TMP, "public-again");
  await build(site("demo-again"), ["--gc", "--minify", "--baseURL", ORIGIN + "/"], again);
  const collect = (root) => {
    const map = new Map();
    for (const f of htmlFiles(root)) for (const m of fs.readFileSync(f, "utf8").matchAll(/<svg[^>]*barcode__bars[^>]*>([\s\S]*?)<\/svg>[\s\S]*?barcode__ref[^>]*>([^<]+)</g)) {
      const ref = m[2].trim();
      (map.get(ref) || map.set(ref, new Set()).get(ref)).add(m[1]);
    }
    return map;
  };
  const a = collect(PUB), b = collect(again), p = [];
  if (a.size < 2) p.push(`only ${a.size} barcode refs found`);
  for (const [ref, bars] of a) {
    if (bars.size !== 1) p.push(`${ref} draws ${bars.size} different barcodes`);
    if ([...bars][0] !== [...(b.get(ref) || [])][0]) p.push(`${ref} differs between two builds`);
  }
  const seen = new Map();
  for (const [ref, bars] of a) { const k = [...bars][0]; if (seen.has(k)) p.push(`${ref} and ${seen.get(k)} draw the same bars`); seen.set(k, ref); }
  return p;
});

check("14.3", "taxonomy pages exist and list exactly their own pages", async () => {
  await demo();
  const p = [];
  const urlize = (s) => s.toLowerCase().replace(/\s+/g, "-");
  const expect = new Map();
  const content = path.join(REPO, "exampleSite/content");
  for (const f of walk(content, ".md")) {
    const fm = fs.readFileSync(f, "utf8").split(/^---$/m)[1] || "";
    if (/^draft:\s*true/m.test(fm)) continue;
    const r = path.relative(content, f).split(path.sep);
    if (!["work", "trapdoor"].includes(r[0]) || r[1].startsWith("_")) continue;
    if (r[0] === "work" && r[2] !== "index.md") continue;
    const url = `/${r[0]}/${r[1].replace(/\.md$/, "")}/`;
    for (const tax of ["disciplines", "stack", "lessons"]) {
      const list = fm.match(new RegExp(`^${tax}:\\s*\\[(.*)\\]`, "m"));
      for (const t of list ? JSON.parse(`[${list[1]}]`) : []) {
        const k = `${tax}/${urlize(t)}`;
        (expect.get(k) || expect.set(k, new Set()).get(k)).add(url);
      }
    }
  }
  for (const tax of ["disciplines", "stack", "lessons"]) if (!fs.existsSync(path.join(PUB, tax, "index.html"))) p.push(`/${tax}/ was not built`);
  for (const [k, want] of expect) {
    const f = path.join(PUB, k, "index.html");
    if (!fs.existsSync(f)) { p.push(`/${k}/ was not built`); continue; }
    // The term's own list, without the "related failures" section that follows it.
    const main = (fs.readFileSync(f, "utf8").split(/<main\b/)[1]?.split(/<\/main>/)[0] || "").replace(/<section class=["']?related\b[\s\S]*?<\/section>/, "");
    // Only the row titles: a row may also link its related failure or case study.
    const rows = tags(main, "a").filter((t) => /class=["']?(prow__link|failure__stretch)["'\s>]/.test(t)).map((t) => attr(t, "href"));
    const got = new Set(rows.map((u) => u.replace(ORIGIN, "")));
    const w = [...want].sort().join(" "), g = [...got].sort().join(" ");
    if (w !== g) p.push(`/${k}/ lists ${g || "nothing"}; expected ${w}`);
  }
  return p;
});

// =====================================================================================
// Fixtures: a changed copy of exampleSite per row of the 3.6 validation table (14.3).
// Each expects the build to stop with a message naming the file, or to warn and finish.
// =====================================================================================
const L = "content/work/ledger-cutover/";
const S = (n) => `${L}steps/${n}.md`;
const TD = "content/trapdoor/cohort-posted-twice.md";
const fixtures = [
  ["cover.alt empty", (s) => s.sub(L + "index.md", /^  alt: ".*"$/m, '  alt: ""'), { error: /"cover\.alt" is required in \S*ledger-cutover.index\.md/ }],
  ["summary missing", (s) => s.sub(L + "index.md", /^summary: .*\n/m, ""), { error: /"summary" is required in \S*ledger-cutover.index\.md/ }],
  ["brief missing", (s) => s.sub(L + "index.md", /^brief: .*\n/m, ""), { error: /"brief" is required in \S*ledger-cutover.index\.md/ }],
  ["role missing", (s) => s.sub(L + "index.md", /^role: .*\n/m, ""), { error: /"role" is required in \S*ledger-cutover.index\.md/ }],
  ["disciplines missing", (s) => s.sub(L + "index.md", /^disciplines: .*\n/m, ""), { error: /"disciplines" needs at least one entry in \S*ledger-cutover/ }],
  ["cover.image not in bundle", (s) => s.sub(L + "index.md", 'image: "cover.jpg"', 'image: "nope.jpg"'), { error: /cover\.image "nope\.jpg" is not a file in the bundle of \S*ledger-cutover/ }],
  ["cover.focus not an anchor", (s) => s.sub(L + "index.md", 'focus: "TopLeft"', 'focus: "Upward"'), { error: /cover\.focus "Upward" is not a Hugo anchor/ }],
  ["barcode.duration missing", (s) => s.sub(L + "index.md", /^  duration: .*\n/m, ""), { error: /"barcode\.duration" is required in \S*ledger-cutover/ }],
  ["barcode.team missing", (s) => s.sub(L + "index.md", /^  team: .*\n/m, ""), { error: /"barcode\.team" is required in \S*ledger-cutover/ }],
  ["barcode.team fractional", (s) => s.sub(L + "index.md", /^  team: .*$/m, "  team: 4.5"), { error: /"barcode\.team" must be a whole number or a string/ }],
  ["barcode.outcome.value missing", (s) => s.sub(L + "index.md", /^    value: "−93"\n/m, ""), { error: /"barcode\.outcome\.value" is required/ }],
  ["barcode.outcome.label missing", (s) => s.sub(L + "index.md", /^    label: "reconciliation time"\n/m, ""), { error: /"barcode\.outcome\.label" is required/ }],
  ["result.headline missing", (s) => s.sub(L + "index.md", /^  headline: .*\n/m, ""), { error: /"result\.headline" is required/ }],
  ["result.outcome missing", (s) => s.sub(L + "index.md", /^  outcome: \|$/m, "  outcome_draft: |"), { error: /"result\.outcome" is required/ }],
  ["result.metrics empty", (s) => s.sub(L + "index.md", /^  metrics:$/m, "  metrics: []\n  metrics_draft:"), { error: /"result\.metrics" needs 1 to 3 entries, found 0/ }],
  ["result.metrics has 4", (s) => s.sub(L + "index.md", /^  metrics:\n/m, '  metrics:\n    - value: "1"\n      label: "Extra"\n'), { error: /"result\.metrics" needs 1 to 3 entries, found 4/ }],
  ["links kind unknown", (s) => s.sub(L + "index.md", 'kind: "writeup"', 'kind: "blog"'), { error: /links\[0\]\.kind must be live, repo or writeup/ }],
  ["steps without backstage.teaser", (s) => s.sub(L + "index.md", /^backstage:\n  teaser: .*\n/m, ""), { error: /"backstage\.teaser" is required when steps\/ has files/ }],
  ["in-progress without planned", (s) => s.sub(L + "backstage.md", "status: complete", "status: in-progress"), { error: /"planned" is required when status is in-progress in \S*backstage\.md/ }],
  ["step kind not in the enum", (s) => s.sub(S("01-problem"), "kind: problem", "kind: problme"), { error: /step kind "problme" is not one of .* in \S*01-problem\.md/ }],
  ["step title missing", (s) => s.sub(S("04-rejected"), /^title: .*\n/m, ""), { error: /"title" is required in \S*04-rejected\.md/ }],
  ["step gist missing", (s) => s.sub(S("04-rejected"), /^gist: .*\n/m, ""), { error: /"gist" is required in \S*04-rejected\.md/ }],
  ["problem without statement", (s) => s.sub(S("01-problem"), /^statement: .*\n/m, ""), { error: /a problem step needs "statement" in \S*01-problem\.md/ }],
  ["constraint type unknown", (s) => s.sub(S("02-constraints"), 'type: "soft"', 'type: "squishy"'), { error: /constraint type must be hard, soft or assumed in \S*02-constraints\.md/ }],
  ["hypothesis verdict unknown", (s) => s.sub(S("03-hypotheses"), 'verdict: "refuted"', 'verdict: "maybe"'), { error: /hypothesis verdict must be .* in \S*03-hypotheses\.md/ }],
  ["rejected revisit unknown", (s) => s.sub(S("04-rejected"), 'revisit: "medium"', 'revisit: "never"'), { error: /revisit must be low, medium or high in \S*04-rejected\.md/ }],
  ["result step without verdict", (s) => s.sub(S("06-result"), /^verdict: .*\n/m, ""), { error: /a result step needs "verdict" in \S*06-result\.md/ }],
  ["result metric not a number", (s) => s.sub(S("06-result"), "before: 190", 'before: "190"'), { error: /"before" and "after" must be numbers in \S*06-result\.md/ }],
  ["result metric better unknown", (s) => s.sub(S("06-result"), 'better: "lower"', 'better: "smaller"'), { error: /"better" must be lower or higher in \S*06-result\.md/ }],
  ["step n duplicated", (s) => s.sub(S("02-constraints"), /^n: 2$/m, "n: 1"), { error: /step numbers must be unique and contiguous from 1/ }],
  ["step n not contiguous", (s) => s.sub(S("06-result"), /^n: 6$/m, "n: 7"), { error: /step numbers must be unique and contiguous from 1; expected n: 6/ }],
  ["ba-image points at a missing file", (s) => s.sub(S("05-implementation"), 'before="shots/dashboard-before.png"', 'before="shots/missing.png"'), { error: /ba-image: "shots\/missing\.png" not found/ }],
  ["ba-code points at a missing file", (s) => s.sub(S("05-implementation"), 'before="snippets/match-before.sql"', 'before="snippets/missing.sql"'), { error: /snippets\/missing\.sql/ }],
  ["second headliner warns, first by weight wins", (s) => s.sub("content/work/festival-door/index.md", /^weight: (\d+)$/m, "weight: $1\nheadliner: true"), { warn: /2 case studies set headliner: true; "work.ledger-cutover.index\.md" is used/ }],
  ["metrics without a result step warn (P1)", (s) => s.rm(S("06-result")), { warn: /ledger-cutover\S* shows result metrics but no step has kind: result/ }],
  ["untested hypothesis in the last step warns", (s) => {
    s.sub(S("03-hypotheses"), /^n: 3$/m, "n: 6");
    s.sub(S("03-hypotheses"), 'verdict: "confirmed"', 'verdict: "untested"');
    s.sub(S("06-result"), /^n: 6$/m, "n: 3");
  }, { warn: /hypothesis H1 is untested in the last step/ }],
  ["failure whose case matches nothing warns", (s) => s.sub(TD, 'case: "ledger-cutover"', 'case: "no-such-case"'), { warn: /case "no-such-case" in \S*cohort-posted-twice\.md matches no case study/ }],
  ["failure without case is accepted silently", (s) => s.sub(TD, /^case: .*\n/m, ""), { ok: true }],
  ["failure without what", (s) => s.sub(TD, /^what: .*\n/m, ""), { error: /"what" is required in \S*cohort-posted-twice\.md/ }],
  ["failure severity unknown", (s) => s.sub(TD, 'severity: "minor"', 'severity: "meh"'), { error: /"severity" must be minor, major or critical/ }],
  ["failure ref malformed", (s) => s.sub(TD, 'ref: "TD-001"', 'ref: "X1"'), { error: /"ref" must look like TD-001/ }],
  ["two failures share a ref", (s) => s.write("content/trapdoor/zz-copy.md", fs.readFileSync(path.join(s.dir, TD), "utf8")), { error: /reference TD-001 is used by both/ }],
  ["metric shortcode without label", (s) => s.sub(L + "index.md", /^## What shipped$/m, '{{< metric value="3" >}}\n\n## What shipped'), { error: /metric: "value" and "label" are required/ }],
];
fixtures.forEach(([name, edit, want], i) => {
  check("3.6", name, async () => {
    const dir = site(`fx-${i}`, edit);
    const { code, out } = await build(dir, ["--baseURL", "/"]);
    const w = warnings(out);
    if (want.error) {
      if (!code) return [`build succeeded; expected it to stop with ${want.error}`];
      return want.error.test(out) ? [] : [`build stopped, but not with ${want.error}:`, ...w.slice(0, 4)];
    }
    if (code) return [`build failed:`, ...w.slice(0, 4)];
    if (want.ok) return w;
    const other = w.filter((l) => !want.warn.test(l) && !/no step has kind: result/.test(l));
    return want.warn.test(out) ? (other.length ? ["unexpected warnings:", ...other] : []) : [`no warning matching ${want.warn}`, ...w];
  });
});

const homeTitle = (h) => (h.match(/id=["']?stage-title["']?>([^<]*)</) || [])[1];
check("9.7", "a portfolio of two reads \"Double bill\"; of one, \"Solo performance\"", async () => {
  const p = [];
  for (const [n, rm, want] of [[2, ["pickup-point-finder"], "Double bill"], [1, ["pickup-point-finder", "festival-door"], "Solo performance"]]) {
    const out = path.join(TMP, `small-${n}`);
    const r = await build(site(`small-${n}`, (s) => rm.forEach((d) => s.rm(`content/work/${d}`))), ["--baseURL", "/"], out);
    if (r.code) { p.push(`${n} case studies: build failed`, ...warnings(r.out)); continue; }
    p.push(...warnings(r.out).map((l) => `${n} case studies: ${l}`));
    const got = homeTitle(fs.readFileSync(path.join(out, "index.html"), "utf8"));
    if (got !== want) p.push(`${n} case studies: stage title is ${JSON.stringify(got)}, expected ${want}`);
    p.push(...brokenLinks(out, "/", "").map((l) => `${n} case studies: ${l}`));
  }
  return p;
});

check("14.2", "a site with an empty content directory builds and shows the empty stage", async () => {
  const out = path.join(TMP, "empty");
  const r = await build(site("empty", (s) => { s.rm("content"); s.write("content/.keep", ""); }), ["--baseURL", "/"], out);
  if (r.code) return ["build failed", ...warnings(r.out)];
  const h = fs.readFileSync(path.join(out, "index.html"), "utf8");
  return [...(/stage__empty/.test(h) ? [] : ["home has no empty state"]), ...brokenLinks(out, "/", "")];
});

check("14.2", "a site under https://example.org/sub/ keeps every link, font and image inside /sub/", async () => {
  const out = path.join(TMP, "sub");
  const r = await build(site("sub"), ["--minify", "--baseURL", "https://example.org/sub/"], out);
  if (r.code) return ["build failed", ...warnings(r.out)];
  const p = brokenLinks(out, "/sub/", "https://example.org");
  for (const f of walk(out, ".css")) for (const m of fs.readFileSync(f, "utf8").matchAll(/url\(\s*["']?(\/[^)"']*)/g)) if (!m[1].startsWith("/sub/")) p.push(`${path.relative(out, f)}: url(${m[1]})`);
  return p;
});

check("14.9", "a scratch site exercising every component leaves no template unused", async () => {
  const dir = site("coverage", (s) => {
    s.write(`${L}steps/07-note.md`, '---\ntitle: "A detour"\nn: 7\nparams:\n  kind: note\ngist: "A step of kind note."\n---\n\nNote body.\n');
    s.write("content/notes/_index.md", '---\ntitle: "Notes"\n---\n\nA section without its own layout.\n');
    s.write("content/notes/kitchen-sink.md", [
      "---", 'title: "Kitchen sink"', "date: 2025-01-01", "---", "",
      '{{< metric value="14" unit="min" label="Month-end reconciliation" context="Was 3 h 10 min." >}}', "",
      "| Constraint | Limit |", "|---|---|", "| Downtime | 0 min |", "",
      "```go", "func main() {}", "```", "", "```", "no language", "```", "",
    ].join("\n"));
  });
  const { code, out } = await build(dir, ["--baseURL", "/", "--printUnusedTemplates"]);
  if (code) return ["build failed", ...warnings(out)];
  return warnings(out);
});

// =====================================================================================
// Browser checks (--browser): Chromium against the built demo, served locally.
// =====================================================================================
if (BROWSER) {
  const http = await import("node:http");
  const { createRequire } = await import("node:module");
  const require = createRequire(import.meta.url);
  let pw, axePath;
  try { pw = await import("playwright"); axePath = require.resolve("axe-core/axe.min.js"); }
  catch { console.error("--browser needs playwright and axe-core: run `npm install` in the repository."); process.exit(2); }
  const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".woff2": "font/woff2", ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".xml": "application/xml" };
  const SERVED = path.join(TMP, "served");
  let ready;
  const serve = () => (ready ||= (async () => {
    const r = await build(site("served"), ["--minify", "--baseURL", "/"], SERVED);
    if (r.code) throw new Error("build for the browser failed");
    const server = http.createServer((req, res) => {
      let f = path.join(SERVED, decodeURIComponent(req.url.split("?")[0]));
      if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
      if (!fs.existsSync(f)) { res.statusCode = 404; f = path.join(SERVED, "404.html"); }
      res.setHeader("content-type", types[path.extname(f)] || "application/octet-stream");
      fs.createReadStream(f).pipe(res);
    }).listen(0);
    const browser = await pw.chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
    cleanup.push(() => browser.close(), () => server.close());
    return { browser, base: `http://localhost:${server.address().port}` };
  })());
  const URLS = ["/", "/work/ledger-cutover/", "/trapdoor/", "/about/", "/disciplines/backend/", "/no-such-page/"];
  async function open(url, { mode = "performance", scheme = "light", width = 1280, js = true, init } = {}) {
    const { browser, base } = await serve();
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: scheme, reducedMotion: "reduce", javaScriptEnabled: js });
    // Seed the stored mode once per tab, so navigation within a test keeps what the page stored.
    await ctx.addInitScript((m) => { try { if (!sessionStorage.getItem("seeded")) { localStorage.setItem("prestige.mode", m); sessionStorage.setItem("seeded", "1"); } } catch (e) {} }, mode);
    if (init) await ctx.addInitScript(init);
    const page = await ctx.newPage();
    const errors = [], foreign = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (m) => m.type() === "error" && !/404/.test(m.text()) && errors.push(m.text()));
    page.on("request", (r) => { if (!r.url().startsWith(base) && !r.url().startsWith("data:")) foreign.push(r.url()); });
    await page.goto(base + url, { waitUntil: "load" });
    return { ctx, page, errors, foreign };
  }

  // WCAG 2.0 to 2.2 A and AA rules (spec 10). AXE_BEST_PRACTICE=1 adds axe's advisory rules.
  const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", ...(process.env.AXE_BEST_PRACTICE ? ["best-practice"] : [])];
  check("14.10", "axe-core: zero violations on six page types x two modes x two schemes", async () => {
    const p = [];
    for (const url of URLS) for (const mode of ["performance", "backstage"]) for (const scheme of ["light", "dark"]) {
      const { ctx, page, errors, foreign } = await open(url, { mode, scheme });
      await page.addScriptTag({ path: axePath });
      const res = await page.evaluate((runOnly) => window.axe.run(document, { runOnly }), AXE_TAGS);
      for (const v of res.violations) p.push(`${url} ${mode}/${scheme}: ${v.id} (${v.nodes.length}): ${v.nodes[0].target.join(" ")}`);
      p.push(...errors.map((e) => `${url} ${mode}/${scheme}: console: ${e}`), ...foreign.map((u) => `${url}: request to ${u}`));
      if ((await ctx.cookies()).length) p.push(`${url}: a cookie was set`);
      await ctx.close();
    }
    return p;
  });

  check("14.7", "no page-level horizontal scroll from 320 to 1920 px in either mode", async () => {
    const p = [];
    for (const width of [320, 360, 768, 959, 960, 1280, 1920]) for (const mode of ["performance", "backstage"]) for (const url of URLS) {
      const { ctx, page } = await open(url, { mode, width });
      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (over > 0) p.push(`${url} ${mode} at ${width}px scrolls ${over}px sideways`);
      await ctx.close();
    }
    return p;
  });

  check("14.5", "without JavaScript: every page readable, no visible control, every step open", async () => {
    const p = [];
    for (const url of URLS) for (const width of [360, 1280]) {
      const { ctx, page } = await open(url, { js: false, width });
      const r = await page.evaluate(() => {
        const vis = (e) => e.getClientRects().length > 0 && getComputedStyle(e).visibility !== "hidden";
        return {
          controls: [...document.querySelectorAll("button, input, select, fieldset")].filter(vis).map((e) => e.outerHTML.slice(0, 70)),
          closed: [...document.querySelectorAll(".step__panel")].filter((e) => !vis(e)).length,
          layers: [...document.querySelectorAll("[data-layer]")].filter((e) => !vis(e)).map((e) => e.dataset.layer),
        };
      });
      p.push(...r.controls.map((c) => `${url} at ${width}px: visible control ${c}`));
      if (r.closed) p.push(`${url} at ${width}px: ${r.closed} step panels not visible`);
      p.push(...r.layers.map((l) => `${url} at ${width}px: layer ${l} not visible`));
      await ctx.close();
    }
    return p;
  });

  check("14.4", "toggle: a fragment overrides the mode for one load; storage is left alone", async () => {
    const p = [];
    for (const [hash, want] of [["#step-3", "backstage"], ["#result", "performance"]]) {
      const stored = want === "backstage" ? "performance" : "backstage";
      const { ctx, page, errors } = await open("/work/ledger-cutover/" + hash, { mode: stored });
      const r = await page.evaluate(() => ({ mode: document.documentElement.dataset.mode, stored: localStorage.getItem("prestige.mode") }));
      if (r.mode !== want) p.push(`${hash} with ${stored} stored opens in ${r.mode}`);
      if (r.stored !== stored) p.push(`${hash} overwrote the stored mode with ${r.stored}`);
      p.push(...errors);
      await ctx.close();
    }
    return p;
  });

  check("14.4", "toggle: selecting Backstage switches and persists; works without localStorage", async () => {
    const p = [];
    {
      const { ctx, page, errors } = await open("/", { mode: "performance" });
      await page.locator(".curtain label", { hasText: /backstage/i }).first().click();
      if ((await page.evaluate(() => document.documentElement.dataset.mode)) !== "backstage") p.push("click on Backstage did not switch the mode");
      await page.goto(page.url().replace(/\/$/, "/about/"));
      if ((await page.evaluate(() => document.documentElement.dataset.mode)) !== "backstage") p.push("Backstage did not survive navigation");
      p.push(...errors);
      await ctx.close();
    }
    {
      const block = () => Object.defineProperty(window, "localStorage", { get() { throw new DOMException("blocked", "SecurityError"); } });
      const { ctx, page, errors } = await open("/", { init: block });
      await page.locator(".curtain label", { hasText: /backstage/i }).first().click();
      if ((await page.evaluate(() => document.documentElement.dataset.mode)) !== "backstage") p.push("without localStorage the toggle does not switch");
      p.push(...errors.map((e) => `without localStorage: ${e}`));
      await ctx.close();
    }
    return p;
  });

  check("14.10", "the skip link is the first focusable element and moves focus to #content", async () => {
    const p = [];
    for (const url of URLS) {
      const { ctx, page } = await open(url);
      await page.keyboard.press("Tab");
      const first = await page.evaluate(() => document.activeElement.className);
      if (!/skip-link/.test(first)) p.push(`${url}: first Tab lands on .${first}`);
      await page.keyboard.press("Enter");
      const now = await page.evaluate(() => document.activeElement.id);
      if (now !== "content") p.push(`${url}: skip link moves focus to #${now}`);
      await ctx.close();
    }
    return p;
  });
}

// ---------- run ----------
const cleanup = [];
const todo = checks.filter((c) => !GREP || `${c.id} ${c.name}`.includes(GREP));
const { stdout } = process;
const tty = stdout.isTTY;
const paint = (code, s) => (tty ? `\x1b[${code}m${s}\x1b[0m` : s);
const v = await exec(HUGO, ["version"]);
if (v.code) { console.error(`Cannot run ${HUGO}: install Hugo extended 0.146.0 or later, or set HUGO.`); process.exit(2); }
console.log(`Prestige release gate · ${v.out.trim().split(" ")[1]} · ${todo.length} checks${BROWSER ? " (with browser)" : ""}\n`);
const t0 = Date.now();
const results = new Array(todo.length);
let next = 0, failed = 0;
const width = Math.max(os.availableParallelism?.() || os.cpus().length, 2);
async function worker() {
  while (next < todo.length) {
    const i = next++, c = todo[i], t = Date.now();
    let problems;
    try { problems = (await c.fn()) || []; } catch (e) { problems = [`threw: ${e.stack || e}`]; }
    results[i] = { c, problems, ms: Date.now() - t };
  }
}
await Promise.all(Array.from({ length: width }, worker));
for (const { c, problems, ms } of results) {
  const ok = !problems.length;
  if (!ok) failed++;
  console.log(`${ok ? paint(32, "✓") : paint(31, "✗")} ${c.id.padEnd(5)} ${c.name} ${paint(2, `${ms} ms`)}`);
  for (const pr of problems.slice(0, 12)) console.log(`        ${pr}`);
  if (problems.length > 12) console.log(`        … and ${problems.length - 12} more`);
}
for (const f of cleanup) await f();
console.log(`\n${todo.length - failed} passed, ${failed} failed in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
if (!process.env.KEEP) fs.rmSync(TMP, { recursive: true, force: true });
else console.log(`Kept ${TMP}`);
process.exit(failed ? 1 : 0);
