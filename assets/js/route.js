// Fragment routing (8.4): a fragment forces a mode for this page load only.
import { $ } from "./util.js";
import { currentMode, setMode } from "./mode.js";
import { openStep } from "./steps.js";

export function route(onLoad) {
  const h = window.location.hash;
  let m = null;
  if (/^#(backstage|trapdoor|step-\d+)$/.test(h)) m = "backstage";
  else if (/^#(performance|result)$/.test(h)) m = "performance";
  if (!m) return;
  if (m !== currentMode()) setMode(m, { speak: !onLoad });
  const step = h.match(/^#step-(\d+)$/);
  if (step) { openStep(Number(step[1]), { focus: true, report: true }); return; }
  const target = $(h);
  if (target) target.scrollIntoView({ behavior: "auto" });
}

export function initRoute() {
  window.addEventListener("hashchange", () => route(false));
  // A stepref pointing at the current fragment does not fire hashchange.
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-stepref]");
    if (a && a.getAttribute("href") === window.location.hash) { e.preventDefault(); route(false); }
  });
  route(true);
}
