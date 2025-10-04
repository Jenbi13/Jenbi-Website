import { KEYS, safeGet } from "./storage.js";

const FALLBACK = [
  { q:'In welchem Jahr fiel die Berliner Mauer?', a:['1987','1989','1991','1993'], correct:1 },
  { q:'Was droppen Creeper?', a:['Knochen','Schwarzpulver','Fäden','Schleimball'], correct:1 },
  { q:'Min. Obsidian für ein Netherportal?', a:['8','10','12','14'], correct:1 },
  { q:'Hauptstadt von Australien?', a:['Sydney','Melbourne','Canberra','Perth'], correct:2 },
  { q:'Release-Jahr von Super Mario Odyssey?', a:['2015','2016','2017','2018'], correct:2 },
  { q:'Stackgröße Enderperlen?', a:['16','32','64','8'], correct:0 },
];

export function init(){
  const box = document.getElementById("quiz-box");
  const start = document.getElementById("quiz-start");
  const scoreEl = document.getElementById("quiz-score");
  const bestEl = document.getElementById("quiz-best");
  const reset = document.getElementById("quiz-reset");

  let pool = FALLBACK.slice();
  let idx = 0, score = 0;
  const storedBest = Number(safeGet(KEYS.quizBest, "0")) || 0;
  if (bestEl) bestEl.textContent = storedBest;

  const pickRandom = (arr, n) => {
    const c = arr.slice();
    for (let i=c.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [c[i],c[j]]=[c[j],c[i]]; }
    return c.slice(0,n);
  };
  let QUIZ = [];

  function render(){
    if (idx >= QUIZ.length) return finish();
    const { q, a, correct } = QUIZ[idx];
    box.innerHTML = "";
    const p = document.createElement("p"); p.textContent = q; box.appendChild(p);
    a.forEach((txt,i)=>{
      const b = document.createElement("button");
      b.className = "btn"; b.style.marginRight = "8px"; b.textContent = txt;
      b.addEventListener("click", ()=>{
        if (i===correct){ score++; scoreEl.textContent = String(score); }
        idx++; render();
      });
      box.appendChild(b);
    });
  }

  function finish(){
    box.innerHTML = `Fertig. Punkte: ${score}/${QUIZ.length}`;
    if (score > storedBest){
      localStorage.setItem(KEYS.quizBest, String(score));
      bestEl.textContent = String(score);
    }
  }

  start?.addEventListener("click", ()=>{
    score = 0; idx = 0; scoreEl.textContent = "0";
    QUIZ = pickRandom(pool, Math.min(5, pool.length));
    render();
  });

  reset?.addEventListener("click", ()=>{
    localStorage.removeItem(KEYS.quizBest);
    if (bestEl) bestEl.textContent = "0";
  });
}
