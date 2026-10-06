// The Backstage step-through: an accordion over server-rendered, expanded steps (8.2).
import { $, $$, store, announce } from "./util.js";

let list, steps = [], allBtn, showAll = false;

const byN = (n) => steps.find((li) => li.dataset.n === String(n));
const toggleOf = (li) => $(".step__toggle", li);

function setOpen(li, open) {
  const body = $(".step__body", li);
  const panel = $(".step__panel", li);
  li.dataset.open = String(open);
  toggleOf(li).setAttribute("aria-expanded", String(open));
  if (open) {
    body.removeAttribute("hidden");
    return;
  }
  // Hide from the tab order once collapsed, but keep it findable (hidden="until-found").
  const done = () => { if (li.dataset.open === "false") body.setAttribute("hidden", "until-found"); };
  panel.addEventListener("transitionend", done, { once: true });
  window.setTimeout(done, 400);
}

function only(target) {
  steps.forEach((li) => setOpen(li, showAll || li === target));
}

export function openStep(n, { focus = false, report = false } = {}) {
  if (!list) return;
  let li = byN(n);
  if (!li) {
    li = steps[0];
    if (report && li) reportMissing(n);
  }
  if (!li) return;
  if (li.dataset.open !== "true" || !showAll) only(li);
  if (focus) {
    li.scrollIntoView({ behavior: "auto" });
    toggleOf(li).focus({ preventScroll: true });
  }
}

function reportMissing(n) {
  const msg = (list.dataset.missing || "").replace("%N%", n);
  const panel = document.createElement("p");
  panel.className = "error-panel steps__error";
  panel.setAttribute("role", "status");
  panel.innerHTML = '<span aria-hidden="true">⚠</span> <strong></strong> ';
  panel.querySelector("strong").textContent = list.dataset.errorPrefix || "";
  panel.append(msg);
  list.before(panel);
  announce($("#live"), msg);
  window.setTimeout(() => panel.remove(), 6000);
}

function setShowAll(on) {
  showAll = on;
  allBtn.setAttribute("aria-pressed", String(on));
  store("prestige.steps", on ? "all" : "one");
  if (on) steps.forEach((li) => setOpen(li, true));
  else {
    const focused = document.activeElement && document.activeElement.closest(".step");
    only(focused || steps[0]);
  }
}

function onKey(e) {
  const i = steps.indexOf(e.currentTarget.closest(".step"));
  let j = null;
  if (e.key === "ArrowDown") j = Math.min(i + 1, steps.length - 1);
  else if (e.key === "ArrowUp") j = Math.max(i - 1, 0);
  else if (e.key === "Home") j = 0;
  else if (e.key === "End") j = steps.length - 1;
  if (j === null) return;
  e.preventDefault();
  toggleOf(steps[j]).focus();
}

export function initSteps() {
  list = $(".steps");
  if (!list) return;
  steps = $$(".step", list);
  allBtn = $(".steps-controls__all");
  list.dataset.errorPrefix = list.dataset.errorPrefix || "";

  steps.forEach((li) => {
    const inner = $(".step__head-inner", li);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "step__head-inner step__toggle";
    btn.setAttribute("aria-controls", li.id + "-body");
    while (inner.firstChild) btn.appendChild(inner.firstChild);
    inner.replaceWith(btn);
    btn.addEventListener("click", () => {
      if (li.dataset.open === "true") setOpen(li, false);
      else if (showAll) setOpen(li, true);
      else only(li);
    });
    btn.addEventListener("keydown", onKey);
    $(".step__body", li).addEventListener("beforematch", () => openStep(li.dataset.n));
    const nav = $(".step__nav", li);
    if (nav) nav.hidden = false;
  });

  list.addEventListener("click", (e) => {
    const go = e.target.closest("[data-goto]");
    if (go) openStep(go.dataset.goto, { focus: true });
  });

  if (allBtn) {
    allBtn.hidden = false;
    allBtn.addEventListener("click", () => setShowAll(allBtn.getAttribute("aria-pressed") !== "true"));
  }

  showAll = store("prestige.steps") === "all";
  if (allBtn) allBtn.setAttribute("aria-pressed", String(showAll));
  const m = window.location.hash.match(/^#step-(\d+)$/);
  only(showAll ? null : (m && byN(m[1])) || steps[0]);
  steps.forEach((li) => toggleOf(li).setAttribute("aria-expanded", li.dataset.open));
  list.setAttribute("data-enhanced", "");

  // Print the whole account, expanded (decision 41).
  window.addEventListener("beforeprint", () => steps.forEach((li) => $(".step__body", li).removeAttribute("hidden")));
  window.addEventListener("afterprint", () => steps.forEach((li) => { if (li.dataset.open === "false") $(".step__body", li).setAttribute("hidden", "until-found"); }));
}
