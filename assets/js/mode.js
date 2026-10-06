// The curtain toggle: Performance or Backstage for the whole site (8.1).
import { $, $$, mq, store, announce } from "./util.js";

const root = document.documentElement;
const MODES = ["performance", "backstage"];
const BACKSTAGE_HASH = /^#(backstage|trapdoor|step-\d+)$/;
const PERFORMANCE_HASH = /^#(performance|result)$/;

let valance, status, live, radios;

export const currentMode = () => root.getAttribute("data-mode") || "performance";

function syncControls() {
  const m = currentMode();
  radios.forEach((r) => { r.checked = r.value === m; });
  if (valance && status) status.textContent = valance.dataset[m === "backstage" ? "visB" : "visP"] || "";
}

function announceMode() {
  if (!valance) return;
  const m = currentMode();
  let key = m === "backstage" ? "msgB" : "msgP";
  if (!mq("(min-width: 60rem)") && valance.dataset[key + "Narrow"]) key += "Narrow";
  announce(live, valance.dataset[key]);
}

// Set the mode. persist: write storage. speak: announce the change.
export function setMode(m, { persist = false, speak = true } = {}) {
  if (!MODES.includes(m)) return;
  if (persist) store("prestige.mode", m);
  if (m === currentMode()) { syncControls(); return; }
  const drape = $(".drape");
  if (drape && mq("(min-width: 60rem)")) {
    drape.classList.add("is-moving");
    drape.addEventListener("transitionend", () => drape.classList.remove("is-moving"), { once: true });
  }
  root.classList.add("is-switching");
  window.setTimeout(() => root.classList.remove("is-switching"), 400);
  root.setAttribute("data-mode", m);
  syncControls();
  if (speak) announceMode();

  // A fragment that points at a layer which is now hidden is cleared.
  const h = window.location.hash;
  if ((m === "performance" && BACKSTAGE_HASH.test(h)) || (m === "backstage" && PERFORMANCE_HASH.test(h))) {
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  }

  // On a case study scrolled past its head, bring the newly shown layer to the top.
  const head = $(".case-head");
  if (head && head.getBoundingClientRect().bottom < 0) {
    const layer = m === "backstage" ? ($("#backstage") || $("#performance")) : $("#performance");
    if (layer) layer.scrollIntoView({ behavior: "auto" });
  }
  document.dispatchEvent(new CustomEvent("prestige:mode", { detail: m }));
}

export function initMode() {
  valance = $(".valance");
  status = $(".valance__status");
  live = $("#mode-status");
  const fieldset = $(".curtain");
  radios = fieldset ? $$("input[name=mode]", fieldset) : [];
  if (!fieldset) return;
  fieldset.hidden = false;
  if (status) status.hidden = false;
  syncControls(); // The initial state is shown, not announced.

  fieldset.addEventListener("change", (e) => setMode(e.target.value, { persist: true }));

  // Another tab changed the mode: mirror it without writing.
  window.addEventListener("storage", (e) => {
    if (e.key === "prestige.mode" && MODES.includes(e.newValue)) setMode(e.newValue);
  });

  // Mouse convenience: clicking the drape selects Backstage.
  const drape = $(".drape");
  const back = fieldset.querySelector("input[value=backstage]");
  if (drape && back) drape.addEventListener("click", () => { if (!back.checked) back.click(); });
}
