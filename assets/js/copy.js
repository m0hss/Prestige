// "Copy address" in contact blocks (8.5).
import { $$, announce } from "./util.js";

export function initCopy() {
  $$("[data-copy]").forEach((btn) => {
    const block = btn.closest(".contact");
    const error = block && block.querySelector(".contact__error");
    const link = block && block.querySelector(".contact__email");
    const t = btn.dataset;
    btn.hidden = false;
    btn.addEventListener("click", async () => {
      if (btn.getAttribute("aria-disabled") === "true") return;
      btn.setAttribute("aria-disabled", "true");
      btn.textContent = t.tBusy;
      if (error) error.hidden = true;
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.textContent = t.tDone;
        announce(document.getElementById("live"), t.tAnnounce);
        window.setTimeout(() => { btn.textContent = t.tIdle; }, 2000);
      } catch (e) {
        btn.textContent = t.tFail;
        if (link) {
          const range = document.createRange();
          range.selectNodeContents(link);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        }
        if (error) error.hidden = false;
      } finally {
        btn.removeAttribute("aria-disabled");
      }
    });
  });
}
