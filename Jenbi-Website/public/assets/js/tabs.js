import { $$ } from "./ui.js";

export function init() {
  const tabs = $$(".tab");
  const activate = (i, pushHash = true) => {
    tabs.forEach((t, idx) => {
      const sel = idx === i;
      t.setAttribute("aria-selected", String(sel));
      t.tabIndex = sel ? 0 : -1;
      const panel = document.getElementById(t.getAttribute("aria-controls"));
      panel?.setAttribute("aria-hidden", String(!sel));
    });
    if (pushHash && tabs[i]) {
      const id = tabs[i].id.replace("tab-", "");
      history.replaceState(null, "", "#" + id);
    }
    tabs[i]?.focus({ preventScroll: true });
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => activate(i));
    tab.addEventListener("keydown", (e) => {
      const k = e.key;
      if (k === "ArrowRight" || k === "ArrowLeft") {
        e.preventDefault();
        const dir = k === "ArrowRight" ? 1 : -1;
        activate((i + dir + tabs.length) % tabs.length);
      }
      if (k === "Home") { e.preventDefault(); activate(0); }
      if (k === "End")  { e.preventDefault(); activate(tabs.length - 1); }
    });
  });

  const hash = location.hash.replace("#", "");
  const idx = tabs.findIndex(t => t.id === "tab-" + hash);
  activate(idx >= 0 ? idx : 0, false);
}
