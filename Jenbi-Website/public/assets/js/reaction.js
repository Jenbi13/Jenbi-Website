import { KEYS, safeGet } from "./storage.js";

export function init(){
  const pad = document.getElementById("rt-pad");
  const lastEl = document.getElementById("rt-last");
  const bestEl = document.getElementById("rt-best");
  const reset = document.getElementById("rt-reset");

  let state = "idle"; // idle | ready | go
  let tId = null, start = 0;
  const stored = Number(safeGet(KEYS.rt, "0"));
  if (stored>0 && bestEl) bestEl.textContent = stored;

  const setPad = (cls, text) => {
    if (!pad) return;
    pad.className = "rt-pad " + cls;
    pad.textContent = text;
  };

  const arm = () => {
    state = "ready";
    setPad("rt-ready","Warte …");
    tId = setTimeout(()=>{
      state = "go";
      start = performance.now();
      setPad("rt-go","JETZT!");
    }, 700 + Math.random()*2300);
  };

  pad?.addEventListener("click", ()=>{
    if (state === "idle") arm();
    else if (state === "ready"){
      clearTimeout(tId); state="idle"; setPad("rt-wait","Zu früh! Klick zum Neustart …");
    } else if (state === "go"){
      const t = Math.round(performance.now() - start);
      if (lastEl) lastEl.textContent = t;
      const best = Number(bestEl?.textContent) || Infinity;
      if (t < best && bestEl){ bestEl.textContent = t; localStorage.setItem(KEYS.rt, String(t)); }
      state = "idle"; setPad("rt-wait","Klick zum Starten …");
    }
  });

  reset?.addEventListener("click", ()=>{
    localStorage.removeItem(KEYS.rt);
    if (bestEl) bestEl.textContent = "–";
  });

  setPad("rt-wait","Klick zum Starten …");
}
