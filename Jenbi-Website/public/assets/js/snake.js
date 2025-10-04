import { KEYS, safeGet } from "./storage.js";

/**
 * Stabile Snake-Version mit echten States:
 * idle → running → paused → over
 * - Pause stoppt das Spiel wirklich (kein "innerlich weiterlaufen")
 * - Overlay klickbar: Start/Restart ohne Reset-Button
 */
export function init(refs){
  const { wrapper, canvas, overlay, overlayText, score, best, btnStart, btnPause, btnReset } = refs;
  const ctx = canvas.getContext("2d");
  const CELL = 16;
  const COLS = Math.floor(canvas.width / CELL);
  const ROWS = Math.floor(canvas.height / CELL);
  const TICK_MS = 110;

  // State
  let state = "idle"; // idle | running | paused | over
  let snake, dir, nextDir, food, curScore, bestScore, acc=0, lastTs;

  // Best laden
  bestScore = Number(safeGet(KEYS.snakeBest, "0")) || 0;
  if (best) best.textContent = bestScore;

  // Helpers
  const setClass = () => {
    wrapper.classList.toggle("is-idle",  state==="idle");
    wrapper.classList.toggle("is-paused",state==="paused");
    wrapper.classList.toggle("is-over",  state==="over");
    overlay.hidden = !(state==="idle" || state==="paused" || state==="over");
  };

  const rndCell = () => ({ x: Math.floor(Math.random()*COLS), y: Math.floor(Math.random()*ROWS) });
  const spawnFood = () => {
    let f;
    do { f = rndCell(); } while (snake.some(s=>s.x===f.x && s.y===f.y));
    food = f;
  };

  function reset(){
    snake = [{ x: Math.floor(COLS/2), y: Math.floor(ROWS/2) }];
    dir = {x:1,y:0};
    nextDir = {x:1,y:0};
    curScore = 0;
    score.textContent = "0";
    spawnFood();
    acc = 0; lastTs = undefined;
  }

  function start(){
    if (state === "running") return;
    reset();
    state = "running";
    overlayText.textContent = "";
    setClass();
    requestAnimationFrame(loop);
  }

  function pause(){
    if (state !== "running") return;
    state = "paused";
    overlayText.textContent = "⏸️ Pause – klick zum Fortsetzen";
    setClass();
  }

  function resume(){
    if (state !== "paused") return;
    state = "running";
    overlayText.textContent = "";
    setClass();
    requestAnimationFrame(loop);
  }

  function gameOver(){
    state = "over";
    overlayText.textContent = "💀 Game Over – Klicke zum Starten";
    setClass();
    // Best speichern
    if (curScore > bestScore){
      bestScore = curScore;
      best.textContent = bestScore;
      localStorage.setItem(KEYS.snakeBest, String(bestScore));
    }
  }

  function setDir(nx, ny){
    // nicht direkt umdrehen
    const opp = (dir.x === -nx && dir.y === -ny);
    if (opp) return;
    // nur 1 Turn pro Tick
    if (nextDir !== dir) return;
    nextDir = {x:nx,y:ny};
  }

  // Input
  window.addEventListener("keydown", (e)=>{
    const k = e.key.toLowerCase();
    if (["arrowup","arrowdown","arrowleft","arrowright"," "].includes(k)) e.preventDefault?.();

    if (k === "p"){
      if (state === "running") pause();
      else if (state === "paused") resume();
      return;
    }
    if (k === "r"){ state = "idle"; overlayText.textContent = "Klicke zum Starten"; setClass(); return; }

    if (state !== "running") return; // während idle/paused/over keine Richtungsänderung übernehmen
    if (k === "arrowup" || k === "w") setDir(0,-1);
    else if (k === "arrowdown" || k === "s") setDir(0, 1);
    else if (k === "arrowleft" || k === "a") setDir(-1,0);
    else if (k === "arrowright" || k === "d") setDir(1, 0);
  });

  btnStart?.addEventListener("click", ()=> state==="running" ? null : start());
  btnPause?.addEventListener("click", ()=> state==="running" ? pause() : state==="paused" ? resume() : null);
  btnReset?.addEventListener("click", ()=>{ state="idle"; overlayText.textContent = "Klicke zum Starten"; setClass(); });

  overlay.addEventListener("click", ()=>{
    if (state === "idle" || state === "over") start();
    else if (state === "paused") resume();
  });

  // Logic
  function step(){
    dir = nextDir; // eine Übernahme pro Tick

    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    // Wände
    if (head.x<0 || head.x>=COLS || head.y<0 || head.y>=ROWS) return gameOver();
    // Körper
    if (snake.some(s=>s.x===head.x && s.y===head.y)) return gameOver();

    snake.unshift(head);
    // Essen?
    if (head.x === food.x && head.y === food.y){
      curScore++;
      score.textContent = String(curScore);
      spawnFood();
    } else {
      snake.pop();
    }
  }

  function draw(){
    // Hintergrund
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--surface')?.trim() || '#0f172a';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // Food
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(food.x*CELL, food.y*CELL, CELL, CELL);

    // Snake
    ctx.fillStyle = "#22c55e";
    snake.forEach(p => ctx.fillRect(p.x*CELL, p.y*CELL, CELL, CELL));
  }

  function loop(ts){
    if (state !== "running") return; // echter Halt bei Pause/Idle/Over
    if (lastTs === undefined) lastTs = ts;
    const delta = ts - lastTs; lastTs = ts;
    acc += delta;

    while (acc >= TICK_MS){
      step();
      acc -= TICK_MS;
      if (state !== "running") return; // kann im step() gameOver werden
    }
    draw();
    requestAnimationFrame(loop);
  }

  // initial UI
  overlayText.textContent = "Klicke zum Starten";
  state = "idle"; setClass();
}
