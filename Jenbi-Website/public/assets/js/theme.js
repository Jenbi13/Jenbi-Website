const KEY = "jenbi.theme";

export function init() {
  const btn = document.getElementById("themeToggle");
  const saved = localStorage.getItem(KEY);
  document.documentElement.setAttribute("data-theme",
    (saved === "light" || saved === "dark") ? saved : "auto"
  );
  btn?.addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme");
    const next = cur === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(KEY, next);
  });
}
