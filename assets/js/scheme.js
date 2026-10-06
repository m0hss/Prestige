// Footer Auto / Light / Dark switch, independent of the mode (8.6).
import { $, $$, store } from "./util.js";

const root = document.documentElement;

function apply(value) {
  if (value === "light" || value === "dark") root.setAttribute("data-scheme", value);
  else root.removeAttribute("data-scheme");
}

export function initScheme() {
  const fieldset = $(".scheme");
  if (!fieldset) return;
  const radios = $$("input[name=scheme]", fieldset);
  const sync = () => {
    const cur = root.getAttribute("data-scheme") || "auto";
    radios.forEach((r) => { r.checked = r.value === cur; });
  };
  fieldset.hidden = false;
  sync();
  fieldset.addEventListener("change", (e) => {
    const v = e.target.value;
    store("prestige.scheme", v === "auto" ? null : v);
    apply(v);
  });
  window.addEventListener("storage", (e) => {
    if (e.key === "prestige.scheme") { apply(e.newValue); sync(); }
  });
}
