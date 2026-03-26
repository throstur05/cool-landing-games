import React, { useEffect, useState, useRef } from "react";

// ── Inline CSS ────────────────────────────────────────────────────────────────
const RUMMIKUB_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --felt: #2d5a27;
  --felt-light: #356b2e;
  --felt-dark: #1e3d1b;
  --cream: #fdf6e3;
  --tile-bg: #fffef5;
  --tile-border: #d4c5a0;
  --tile-shadow: 0 2px 6px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.12);
  --tile-shadow-selected: 0 0 0 3px #f5c842, 0 4px 12px rgba(0,0,0,0.3);
  --red: #c0392b;
  --blue: #1a5276;
  --green: #1e8449;
  --orange: #d35400;
  --joker-bg: linear-gradient(135deg, #6c3483, #1a5276, #1e8449, #c0392b);
  --ui-bg: #f0ebe0;
  --panel: #fdf6e3;
  --border: #c4b89a;
  --text: #2c1810;
  --text-muted: #7a6a55;
  --accent: #c8860a;
  --accent-light: #fcebc5;
  --danger: #c0392b;
  --success: #1e8449;
  --btn-bg: #fdf6e3;
  --btn-border: #c4b89a;
  --btn-hover: #2c1810;
  --btn-hover-text: #fdf6e3;
  --meld-bg: rgba(255,255,255,0.55);
  --meld-border: rgba(196,184,154,0.7);
  --meld-selected-bg: rgba(252,235,197,0.8);
  --meld-selected-border: #c8860a;
  --shadow-panel: 0 4px 20px rgba(44,24,16,0.1);
  --radius: 12px;
  --radius-sm: 8px;
  --radius-tile: 7px;
}

body {
  background: var(--ui-bg);
  color: var(--text);
  font-family: 'DM Sans', sans-serif;
  min-height: 100vh;
}

/* ── Layout ─────────────────────────────────────────────── */
.rk-root { min-height: 100vh; display: flex; flex-direction: column; }

.rk-header {
  background: var(--felt-dark);
  color: var(--cream);
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 3px solid #c8860a;
  flex-shrink: 0;
}
.rk-header h1 {
  font-family: 'Playfair Display', serif;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 1px;
  color: #f5d98b;
}
.rk-header .pool-info {
  font-family: 'DM Mono', monospace;
  font-size: 13px;
  color: rgba(253,246,227,0.7);
}

.rk-body { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

.rk-main { flex: 1; overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 16px; }

/* ── Buttons ────────────────────────────────────────────── */
.btn {
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  font-size: 13px;
  padding: 7px 14px;
  border-radius: var(--radius-sm);
  border: 2px solid var(--btn-border);
  background: var(--btn-bg);
  color: var(--text);
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s, transform 0.1s, box-shadow 0.15s;
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
.btn:hover:not(:disabled) {
  background: var(--btn-hover);
  color: var(--btn-hover-text);
  border-color: var(--btn-hover);
  box-shadow: 0 3px 8px rgba(0,0,0,0.15);
}
.btn:active:not(:disabled) { transform: scale(0.97); }
.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.btn.primary {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}
.btn.primary:hover:not(:disabled) {
  background: #a86f08;
  border-color: #a86f08;
  color: #fff;
}
.btn.danger { border-color: var(--danger); color: var(--danger); }
.btn.danger:hover:not(:disabled) { background: var(--danger); color: #fff; border-color: var(--danger); }
.btn.success { border-color: var(--success); color: var(--success); }
.btn.success:hover:not(:disabled) { background: var(--success); color: #fff; border-color: var(--success); }

.btn-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }

/* ── Tiles ──────────────────────────────────────────────── */
.tile {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 38px;
  height: 48px;
  padding: 0 8px;
  margin: 3px;
  border-radius: var(--radius-tile);
  border: 2px solid var(--tile-border);
  background: var(--tile-bg);
  font-family: 'DM Mono', monospace;
  font-size: 16px;
  font-weight: 500;
  box-shadow: var(--tile-shadow);
  cursor: default;
  user-select: none;
  transition: box-shadow 0.12s, transform 0.1s, border-color 0.12s;
  position: relative;
}
.tile.clickable { cursor: pointer; }
.tile.clickable:hover { transform: translateY(-3px); box-shadow: 0 5px 14px rgba(0,0,0,0.2); }
.tile.selected {
  box-shadow: var(--tile-shadow-selected);
  transform: translateY(-5px);
  border-color: #f5c842;
}
.tile[data-color="red"]    { color: var(--red); }
.tile[data-color="blue"]   { color: var(--blue); }
.tile[data-color="green"]  { color: var(--green); }
.tile[data-color="orange"] { color: var(--orange); }
.tile[data-color="joker"]  {
  background: var(--tile-bg);
  border-color: #9b59b6;
  color: #6c3483;
  font-size: 18px;
}

/* ── Rack ──────────────────────────────────────────────── */
.rack-panel {
  background: var(--felt);
  border-radius: var(--radius);
  padding: 14px 16px;
  border: 3px solid var(--felt-dark);
  box-shadow: inset 0 2px 8px rgba(0,0,0,0.2), 0 3px 10px rgba(0,0,0,0.15);
}
.rack-label {
  font-family: 'Playfair Display', serif;
  font-size: 13px;
  color: rgba(253,246,227,0.6);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 10px;
}
.rack-tiles { display: flex; flex-wrap: wrap; min-height: 54px; align-items: center; }

/* ── Table ─────────────────────────────────────────────── */
.table-panel {
  background: var(--felt-light);
  border-radius: var(--radius);
  padding: 14px 16px;
  border: 3px solid var(--felt-dark);
  box-shadow: inset 0 2px 8px rgba(0,0,0,0.15);
  min-height: 100px;
}
.table-label {
  font-family: 'Playfair Display', serif;
  font-size: 13px;
  color: rgba(253,246,227,0.6);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 10px;
}
.melds-row { display: flex; flex-wrap: wrap; gap: 8px; }

.meld {
  display: inline-flex;
  flex-direction: column;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  background: var(--meld-bg);
  border: 2px solid var(--meld-border);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
  backdrop-filter: blur(4px);
}
.meld:hover { background: rgba(255,255,255,0.75); box-shadow: 0 3px 10px rgba(0,0,0,0.15); }
.meld.selected {
  background: var(--meld-selected-bg);
  border-color: var(--meld-selected-border);
  box-shadow: 0 0 0 2px var(--meld-selected-border);
}
.meld-meta {
  font-size: 10px;
  font-family: 'DM Mono', monospace;
  color: rgba(44,24,16,0.55);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.meld-tiles { display: flex; flex-wrap: wrap; }
.meld .tile { height: 40px; min-width: 34px; font-size: 14px; margin: 2px; }

/* ── Status Bar ─────────────────────────────────────────── */
.status-bar {
  background: var(--panel);
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  box-shadow: var(--shadow-panel);
}
.status-turn {
  font-family: 'Playfair Display', serif;
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
}
.status-info {
  display: flex;
  gap: 16px;
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  color: var(--text-muted);
}
.status-info span strong { color: var(--text); font-weight: 500; }
.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 11px;
  font-family: 'DM Mono', monospace;
  font-weight: 500;
}
.badge.your-turn { background: #fcebc5; color: #a86f08; border: 1px solid #f5c842; }
.badge.ai-turn { background: #dce9f9; color: #1a5276; border: 1px solid #aec9ee; }
.badge.opened { background: #d5f0e0; color: #1e8449; border: 1px solid #8ed4a8; }
.badge.not-opened { background: #fde8e8; color: #c0392b; border: 1px solid #f0a8a8; }

/* ── Controls Row ──────────────────────────────────────── */
.controls-panel {
  background: var(--panel);
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 10px 16px;
  box-shadow: var(--shadow-panel);
}

/* ── Log ────────────────────────────────────────────────── */
.log-panel {
  background: var(--panel);
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  box-shadow: var(--shadow-panel);
}
.log-header {
  padding: 8px 14px;
  border-bottom: 1px solid var(--border);
  font-family: 'Playfair Display', serif;
  font-size: 13px;
  color: var(--text-muted);
  letter-spacing: 1px;
}
.log-body {
  max-height: 120px;
  overflow-y: auto;
  padding: 8px 14px;
}
.log-entry {
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  padding: 2px 0;
  color: var(--text-muted);
  border-bottom: 1px dashed rgba(196,184,154,0.3);
}
.log-entry:first-child { color: var(--text); font-weight: 500; }
.log-entry::before { content: '›  '; color: var(--accent); }

/* ── Players sidebar ────────────────────────────────────── */
.players-strip {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.player-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 20px;
  border: 2px solid var(--border);
  background: var(--panel);
  font-size: 12px;
  font-family: 'DM Mono', monospace;
}
.player-chip.active { border-color: var(--accent); background: var(--accent-light); }
.player-chip .pip { width: 8px; height: 8px; border-radius: 50%; background: var(--border); }
.player-chip.active .pip { background: var(--accent); }

/* ── Winner Banner ──────────────────────────────────────── */
.winner-banner {
  background: linear-gradient(135deg, #f5d98b, #f5c842, #f5d98b);
  border: 3px solid #c8860a;
  border-radius: var(--radius);
  padding: 20px 24px;
  text-align: center;
  box-shadow: 0 6px 24px rgba(200,134,10,0.3);
  animation: winnerPop 0.4s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes winnerPop {
  from { transform: scale(0.85); opacity: 0; }
  to   { transform: scale(1);    opacity: 1; }
}
.winner-banner h2 {
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  color: var(--felt-dark);
  margin-bottom: 12px;
}

/* ── Setup Form ─────────────────────────────────────────── */
.setup-page {
  min-height: 100vh;
  background: var(--ui-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.setup-card {
  width: min(520px, 100%);
  background: var(--panel);
  border: 2px solid var(--border);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(44,24,16,0.12);
  overflow: hidden;
}
.setup-card-header {
  background: var(--felt-dark);
  padding: 24px 28px;
  border-bottom: 3px solid var(--accent);
}
.setup-card-header h1 {
  font-family: 'Playfair Display', serif;
  font-size: 32px;
  font-weight: 900;
  color: #f5d98b;
  letter-spacing: 1px;
}
.setup-card-header p {
  font-size: 14px;
  color: rgba(253,246,227,0.6);
  margin-top: 4px;
}
.setup-card-body { padding: 24px 28px; }
.field-group { margin-bottom: 18px; }
.field-group label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 6px;
}
.field-group input[type=range] { width: 100%; accent-color: var(--accent); }
.field-group .range-val {
  font-family: 'DM Mono', monospace;
  font-size: 18px;
  font-weight: 500;
  color: var(--accent);
  float: right;
  margin-top: -24px;
}
.setup-card-footer {
  padding: 16px 28px 24px;
  border-top: 1px solid var(--border);
  display: flex;
  gap: 10px;
}

/* ── Modal ──────────────────────────────────────────────── */
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(44,24,16,0.45);
  display: flex; align-items: center; justify-content: center;
  padding: 16px; z-index: 1000;
  backdrop-filter: blur(3px);
}
.modal {
  width: min(680px,100%); max-height: 85vh;
  background: var(--panel);
  border: 2px solid var(--border);
  border-radius: 18px;
  box-shadow: 0 16px 48px rgba(44,24,16,0.25);
  display: flex; flex-direction: column;
  overflow: hidden;
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; border-bottom: 2px solid var(--border);
  background: var(--felt-dark);
}
.modal-header h3 {
  font-family: 'Playfair Display', serif;
  color: #f5d98b; font-size: 20px;
}
.modal-body { padding: 20px; overflow-y: auto; }
.modal-body h4 {
  font-family: 'Playfair Display', serif;
  font-size: 16px; color: var(--accent); margin: 16px 0 6px;
}
.modal-body h4:first-child { margin-top: 0; }
.modal-body p, .modal-body li { font-size: 14px; line-height: 1.6; color: var(--text); }
.modal-body ul, .modal-body ol { padding-left: 20px; }
.modal-body li { margin-bottom: 4px; }
.modal-footer {
  padding: 14px 20px; border-top: 2px solid var(--border);
  display: flex; justify-content: flex-end;
}

/* ── Animations ──────────────────────────────────────────── */
@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
.rk-main > * { animation: fadeSlideIn 0.2s ease both; }

/* ── Scrollbar ───────────────────────────────────────────── */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
`;

function ensureStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("rummikub-v2-styles")) return;
  const s = document.createElement("style");
  s.id = "rummikub-v2-styles";
  s.textContent = RUMMIKUB_CSS;
  document.head.appendChild(s);
}

// ── Constants ─────────────────────────────────────────────────────────────────
const COLORS = ["red", "blue", "green", "orange"];
const MIN_N = 1, MAX_N = 13, JOKERS = 2;
const DEFAULT_THRESHOLD = 30;
const COLOR_ORDER = { red: 0, blue: 1, green: 2, orange: 3, joker: 4 };

// ── Utilities ─────────────────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2, 10); }
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function sum(arr) { return arr.reduce((s, x) => s + x, 0); }
function clampInt(v, lo, hi) {
  const n = parseInt(v, 10);
  return isNaN(n) ? lo : Math.max(lo, Math.min(hi, n));
}
function tileCmp(a, b) {
  const ca = a.isJoker ? "joker" : a.color;
  const cb = b.isJoker ? "joker" : b.color;
  if (ca !== cb) return COLOR_ORDER[ca] - COLOR_ORDER[cb];
  return (a.isJoker ? 99 : a.value) - (b.isJoker ? 99 : b.value);
}
function sortRack(st) {
  if (st?.players?.[0]?.rack) st.players[0].rack.sort(tileCmp);
}

// ── Tile set ──────────────────────────────────────────────────────────────────
function makeFullTileSet() {
  const tiles = [];
  for (let copy = 0; copy < 2; copy++)
    for (const color of COLORS)
      for (let v = MIN_N; v <= MAX_N; v++)
        tiles.push({ id: uid(), value: v, color, isJoker: false });
  for (let j = 0; j < JOKERS; j++)
    tiles.push({ id: uid(), value: 0, color: "joker", isJoker: true });
  return tiles;
}

// ── Validation ────────────────────────────────────────────────────────────────
function checkSet(tiles) {
  const n = tiles.length;
  if (n < 3 || n > 4) return { valid: false };
  const real = tiles.filter(t => !t.isJoker);
  if (!real.length) return { valid: false };
  const val = real[0].value;
  if (!real.every(t => t.value === val)) return { valid: false };
  const colors = new Set(real.map(t => t.color));
  if (colors.size !== real.length) return { valid: false };
  const score = sum(tiles.map(t => t.isJoker ? val : t.value));
  return { valid: true, kind: "set", score, assignedValues: tiles.map(t => t.isJoker ? val : t.value) };
}

function checkRun(tiles) {
  if (tiles.length < 3) return { valid: false };
  const real = tiles.filter(t => !t.isJoker);
  if (!real.length) return { valid: false };
  const color = real[0].color;
  if (!real.every(t => t.color === color)) return { valid: false };
  const vals = real.map(t => t.value).sort((a, b) => a - b);
  for (let i = 1; i < vals.length; i++) if (vals[i] === vals[i - 1]) return { valid: false };
  const L = tiles.length;
  const jokerCt = tiles.length - real.length;
  let best = null;
  for (let s = 1; s <= MAX_N - L + 1; s++) {
    const win = new Set(Array.from({ length: L }, (_, k) => s + k));
    if (!real.every(t => win.has(t.value))) continue;
    if (L - real.length <= jokerCt) { best = s; break; }
  }
  if (best == null) return { valid: false };
  const needed = new Set(Array.from({ length: L }, (_, k) => best + k));
  for (const t of real) needed.delete(t.value);
  const neededArr = [...needed].sort((a, b) => a - b);
  const assignedValues = tiles.map(t => t.isJoker ? neededArr.shift() : t.value);
  return { valid: true, kind: "run", color, score: sum(assignedValues), assignedValues };
}

function checkMeld(tiles) {
  const r = checkRun(tiles); if (r.valid) return r;
  const s = checkSet(tiles); if (s.valid) return s;
  return { valid: false };
}

function tryLayoff(meldTiles, tile) {
  // Try appending at end, at start, or at any position for flexibility
  const candidates = [
    [...meldTiles, tile],
    [tile, ...meldTiles],
  ];
  // Also try inserting in the middle for runs
  for (let i = 1; i < meldTiles.length; i++) {
    candidates.push([...meldTiles.slice(0, i), tile, ...meldTiles.slice(i)]);
  }
  for (const c of candidates) {
    const res = checkMeld(c);
    if (res.valid) return { ...res, tiles: c };
  }
  return null;
}

// ── AI ────────────────────────────────────────────────────────────────────────
function aiTakeTurn(state, pi) {
  const me = state.players[pi];
  const TH = state.initialMeldThreshold ?? DEFAULT_THRESHOLD;
  const strength = me.aiStrength ?? 2;

  const applyActs = (st, acts) => {
    const next = JSON.parse(JSON.stringify(st));
    for (const act of acts) {
      if (act.type === "NEW_MELD") {
        next.tableMelds.push({ id: uid(), tiles: act.tiles, meta: act.meta });
        next.players[pi].rack = next.players[pi].rack.filter(t => !act.tiles.some(x => x.id === t.id));
      } else if (act.type === "LAYOFF") {
        const m = next.tableMelds.find(m => m.id === act.meldId);
        if (!m) continue;
        m.tiles = act.newTiles;
        m.meta = act.meta;
        next.players[pi].rack = next.players[pi].rack.filter(t => t.id !== act.tile.id);
      }
    }
    return next;
  };

  function findAllMelds(rack) {
    const results = [];
    const jokers = rack.filter(t => t.isJoker);
    // Sets
    const byVal = new Map();
    for (const t of rack.filter(t => !t.isJoker)) {
      if (!byVal.has(t.value)) byVal.set(t.value, []);
      byVal.get(t.value).push(t);
    }
    for (const [, arr] of byVal) {
      const uniq = [];
      const seen = new Set();
      for (const t of arr) if (!seen.has(t.color)) { uniq.push(t); seen.add(t.color); }
      for (let need = 3; need <= 4; need++) {
        if (uniq.length + jokers.length >= need) {
          const take = uniq.slice(0, Math.min(uniq.length, need));
          const missing = need - take.length;
          const cand = [...take, ...jokers.slice(0, Math.max(0, missing))];
          const chk = checkSet(cand);
          if (chk.valid) results.push({ tiles: cand, meta: chk });
        }
      }
    }
    // Runs
    for (const color of COLORS) {
      const same = rack.filter(t => !t.isJoker && t.color === color);
      for (let L = Math.min(same.length + jokers.length, MAX_N); L >= 3; L--) {
        for (let s = 1; s <= MAX_N - L + 1; s++) {
          const inWin = same.filter(t => t.value >= s && t.value < s + L);
          const uniq = new Map();
          for (const t of inWin) if (!uniq.has(t.value)) uniq.set(t.value, t);
          const take = [...uniq.values()];
          const missing = L - take.length;
          if (missing >= 0 && missing <= jokers.length) {
            const cand = [...take, ...jokers.slice(0, missing)];
            const chk = checkRun(cand);
            if (chk.valid) results.push({ tiles: cand, meta: chk });
          }
        }
      }
    }
    return results;
  }

  // Opening
  if (!me.opened) {
    const all = findAllMelds(me.rack).sort((a, b) => b.meta.score - a.meta.score);
    // Single meld
    for (const m of all) {
      if (m.meta.score >= TH) {
        const next = applyActs(state, [{ type: "NEW_MELD", ...m }]);
        next.players[pi].opened = true;
        next.log.push(`AI${pi} opened with ${m.meta.kind} (${m.meta.score} pts)`);
        return next;
      }
    }
    // Combo
    for (let i = 0; i < all.length; i++) {
      for (let j = i + 1; j < all.length; j++) {
        const idsI = new Set(all[i].tiles.map(t => t.id));
        if (all[j].tiles.some(t => idsI.has(t.id))) continue;
        const total = all[i].meta.score + all[j].meta.score;
        if (total >= TH) {
          const next = applyActs(state, [{ type: "NEW_MELD", ...all[i] }, { type: "NEW_MELD", ...all[j] }]);
          next.players[pi].opened = true;
          next.log.push(`AI${pi} opened with two melds (${total} pts)`);
          return next;
        }
      }
    }
  }

  // Layoffs (smarter: try every tile on every meld)
  if (me.opened) {
    let cur = JSON.parse(JSON.stringify(state));
    let improved = true;
    let layoffCount = 0;
    while (improved && layoffCount < 5 + strength) {
      improved = false;
      const rack = cur.players[pi].rack;
      for (const tile of rack) {
        for (const meld of cur.tableMelds) {
          const res = tryLayoff(meld.tiles, tile);
          if (res) {
            cur = applyActs(cur, [{ type: "LAYOFF", tile, meldId: meld.id, newTiles: res.tiles, meta: res }]);
            cur.log.push(`AI${pi} laid off ${tile.isJoker ? "★" : tile.value} (${tile.isJoker ? "joker" : tile.color})`);
            improved = true;
            layoffCount++;
            break;
          }
        }
        if (improved) break;
      }
    }
    if (layoffCount > 0) {
      // Also try new melds after layoffs
      const newMelds = findAllMelds(cur.players[pi].rack);
      if (newMelds.length) {
        const best = newMelds[0];
        cur = applyActs(cur, [{ type: "NEW_MELD", ...best }]);
        cur.log.push(`AI${pi} also played ${best.meta.kind} (${best.meta.score} pts)`);
      }
      return cur;
    }
  }

  // New meld
  const melds = findAllMelds(me.rack).sort((a, b) => b.meta.score - a.meta.score);
  if (melds.length && (me.opened || melds[0].meta.score >= TH)) {
    const best = melds[0];
    const next = applyActs(state, [{ type: "NEW_MELD", ...best }]);
    if (!me.opened) next.players[pi].opened = true;
    next.log.push(`AI${pi} played ${best.meta.kind} (${best.meta.score} pts)`);
    return next;
  }

  // Draw or pass
  if (state.pool.length > 0) {
    const next = JSON.parse(JSON.stringify(state));
    const drawn = next.pool.pop();
    next.players[pi].rack.push(drawn);
    next.log.push(`AI${pi} drew a tile`);
    return next;
  }
  const next = JSON.parse(JSON.stringify(state));
  next.log.push(`AI${pi} passed (no moves)`);
  return next;
}

// ── Components ────────────────────────────────────────────────────────────────
function TileView({ tile, selected, onClick }) {
  const color = tile.isJoker ? "joker" : tile.color;
  return (
    <button
      className={`tile${selected ? " selected" : ""}${onClick ? " clickable" : ""}`}
      data-color={color}
      onClick={onClick}
      title={tile.isJoker ? "Joker (★)" : `${tile.value} · ${tile.color}`}
      style={{ fontFamily: "'DM Mono', monospace" }}
    >
      {tile.isJoker ? "★" : tile.value}
    </button>
  );
}

function MeldView({ meld, selected, onSelect }) {
  const kindColor = meld.meta.kind === "run" ? meld.meta.color : null;
  const label = meld.meta.kind === "run"
    ? `run · ${kindColor} · ${meld.meta.score}`
    : `set · ${meld.meta.score}`;
  return (
    <div className={`meld${selected ? " selected" : ""}`} onClick={onSelect}>
      <div className="meld-meta">{label}</div>
      <div className="meld-tiles">
        {meld.tiles.map(t => <TileView key={t.id} tile={t} selected={false} />)}
      </div>
    </div>
  );
}

function RulesModal({ onClose, threshold }) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h3>How to Play Rummikub</h3>
          <button className="btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <h4>Goal</h4>
          <p>Be the first player to empty your rack by forming and playing valid melds.</p>
          <h4>The Tiles</h4>
          <ul>
            <li>Numbers <strong>1–13</strong> in four colors (<span style={{color:'#c0392b'}}>red</span>, <span style={{color:'#1a5276'}}>blue</span>, <span style={{color:'#1e8449'}}>green</span>, <span style={{color:'#d35400'}}>orange</span>), two copies each.</li>
            <li>Two <strong>★ Jokers</strong> that substitute any missing tile.</li>
          </ul>
          <h4>Valid Melds</h4>
          <ul>
            <li><strong>Run:</strong> 3 or more consecutive numbers of the <em>same color</em> (e.g., blue 5–6–7). Jokers fill gaps.</li>
            <li><strong>Set:</strong> 3 or 4 tiles of the <em>same number</em> in <em>different colors</em>. Jokers fill missing colors.</li>
          </ul>
          <h4>Opening Requirement</h4>
          <p>Your first play must total at least <strong>{threshold} points</strong> (sum of tile face values played that turn). Jokers count as their assigned number.</p>
          <h4>Your Turn</h4>
          <ol>
            <li>Select tiles from your rack and click <strong>Meld Selected</strong> to play a new meld.</li>
            <li>Select one tile from your rack + a meld on the table, then click <strong>Lay Off</strong> to extend it.</li>
            <li>Click <strong>Draw</strong> if you cannot play.</li>
            <li>Click <strong>End Turn</strong> when done.</li>
          </ol>
          <h4>Tips</h4>
          <ul>
            <li>You can play multiple actions before ending your turn.</li>
            <li>Click a meld on the table to select it (highlighted in gold) before laying off.</li>
            <li>You must lay off before ending turn if it creates a valid meld.</li>
          </ul>
        </div>
        <div className="modal-footer">
          <button className="btn primary" onClick={onClose}>Got it!</button>
        </div>
      </div>
    </div>
  );
}

// ── Setup Screen ──────────────────────────────────────────────────────────────
function SetupScreen({ onStart }) {
  const [cfg, setCfg] = useState({ numAI: 1, handSize: 14, aiStrength: 3, threshold: 30 });
  return (
    <div className="setup-page">
      <div className="setup-card">
        <div className="setup-card-header">
          <h1>Rummikub</h1>
          <p>Classic tile rummy — jokers shown as ★</p>
        </div>
        <div className="setup-card-body">
          {[
            { key: "numAI",     label: "AI Opponents",          min: 1, max: 3 },
            { key: "handSize",  label: "Starting Tiles",        min: 10, max: 16 },
            { key: "aiStrength",label: "AI Strength",           min: 1, max: 5 },
            { key: "threshold", label: "Opening Meld Minimum",  min: 0, max: 60 },
          ].map(({ key, label, min, max }) => (
            <div className="field-group" key={key}>
              <label>{label}</label>
              <input
                type="range" min={min} max={max}
                value={cfg[key]}
                onChange={e => setCfg(c => ({ ...c, [key]: clampInt(e.target.value, min, max) }))}
              />
              <span className="range-val">{cfg[key]}</span>
            </div>
          ))}
        </div>
        <div className="setup-card-footer">
          <button className="btn primary" style={{ flex: 1, padding: "10px" }} onClick={() => onStart(cfg)}>
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Game ─────────────────────────────────────────────────────────────────
function GameScreen({ cfg, onQuit }) {
  const [state, setState] = useState(() => initGame(cfg));
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedMeldId, setSelectedMeldId] = useState(null);
  const [showRules, setShowRules] = useState(false);
  const logRef = useRef(null);

  function initGame(c) {
    const pool = shuffle(makeFullTileSet());
    const players = [];
    const total = 1 + c.numAI;
    for (let p = 0; p < total; p++) {
      const rack = pool.splice(-c.handSize);
      players.push({ id: p, type: p === 0 ? "human" : "ai", rack, opened: false, aiStrength: p === 0 ? null : c.aiStrength });
    }
    const st = { pool, players, tableMelds: [], initialMeldThreshold: c.threshold, currentPlayer: 0, winner: null, log: ["Game started — good luck!"] };
    sortRack(st);
    return st;
  }

  // AI turn loop
  useEffect(() => {
    if (!state || state.winner != null) return;
    const cur = state.currentPlayer;
    const player = state.players[cur];
    if (player.rack.length === 0) { setState(s => ({ ...s, winner: cur })); return; }
    if (player.type !== "ai") return;
    const timer = setTimeout(() => {
      const after = aiTakeTurn(state, cur);
      const rackLen = after.players[cur].rack.length;
      setState({ ...after, winner: rackLen === 0 ? cur : null, currentPlayer: (cur + 1) % state.players.length });
    }, 350);
    return () => clearTimeout(timer);
  }, [state]);

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = 0;
  }, [state?.log?.length]);

  const isHumanTurn = state && state.currentPlayer === 0 && state.winner == null;
  const human = state?.players[0];
  const TH = state?.initialMeldThreshold ?? DEFAULT_THRESHOLD;

  function toggleTile(tile) {
    if (!isHumanTurn) return;
    setSelectedIds(ids => ids.includes(tile.id) ? ids.filter(x => x !== tile.id) : [...ids, tile.id]);
  }
  function selectMeld(id) {
    if (!isHumanTurn) return;
    setSelectedMeldId(prev => prev === id ? null : id);
  }
  function clearSel() { setSelectedIds([]); setSelectedMeldId(null); }

  function humanMeld() {
    if (!isHumanTurn) return;
    const tiles = human.rack.filter(t => selectedIds.includes(t.id));
    const chk = checkMeld(tiles);
    if (!chk.valid) { alert("Not a valid meld — needs a set (3–4 same number, different colors) or run (3+ consecutive, same color)."); return; }
    if (!human.opened && chk.score < TH) { alert(`Opening meld must be at least ${TH} points. This scores ${chk.score}.`); return; }
    const next = JSON.parse(JSON.stringify(state));
    next.tableMelds.push({ id: uid(), tiles, meta: chk });
    next.players[0].rack = next.players[0].rack.filter(t => !selectedIds.includes(t.id));
    next.players[0].opened = true;
    sortRack(next);
    next.log.unshift(`You played a ${chk.kind} (${chk.score} pts)`);
    clearSel();
    setState(next);
  }

  function humanLayoff() {
    if (!isHumanTurn) return;
    if (!selectedMeldId) { alert("Click a meld on the table to select it first."); return; }
    const picked = human.rack.filter(t => selectedIds.includes(t.id));
    if (picked.length !== 1) { alert("Select exactly one tile from your rack to lay off."); return; }
    const tile = picked[0];
    const meld = state.tableMelds.find(m => m.id === selectedMeldId);
    if (!meld) return;
    const res = tryLayoff(meld.tiles, tile);
    if (!res) { alert(`${tile.isJoker ? "★" : tile.value} doesn't fit on that meld.`); return; }
    const next = JSON.parse(JSON.stringify(state));
    const m = next.tableMelds.find(x => x.id === selectedMeldId);
    m.tiles = res.tiles; m.meta = res;
    next.players[0].rack = next.players[0].rack.filter(t => t.id !== tile.id);
    sortRack(next);
    next.log.unshift(`You laid off ${tile.isJoker ? "★" : tile.value + " " + tile.color}`);
    clearSel();
    setState(next);
  }

  function humanDraw() {
    if (!isHumanTurn) return;
    if (!state.pool.length) { alert("Pool is empty — pass your turn."); return; }
    const next = JSON.parse(JSON.stringify(state));
    const drawn = next.pool.pop();
    next.players[0].rack.push(drawn);
    sortRack(next);
    next.log.unshift("You drew a tile");
    clearSel();
    setState(next);
  }

  function endTurn() {
    if (!isHumanTurn) return;
    clearSel();
    setState(s => ({ ...s, currentPlayer: (s.currentPlayer + 1) % s.players.length }));
  }

  function restart() { clearSel(); setState(initGame(cfg)); }

  if (!state) return null;

  const aiPlaying = state.currentPlayer !== 0 && state.winner == null;

  return (
    <div className="rk-root">
      {showRules && <RulesModal onClose={() => setShowRules(false)} threshold={TH} />}

      <header className="rk-header">
        <h1>Rummikub</h1>
        <div className="btn-row">
          <button className="btn" style={{ background: "transparent", color: "rgba(253,246,227,0.75)", borderColor: "rgba(253,246,227,0.3)", fontSize: 12 }} onClick={() => setShowRules(true)}>Rules</button>
          <button className="btn" style={{ background: "transparent", color: "rgba(253,246,227,0.75)", borderColor: "rgba(253,246,227,0.3)", fontSize: 12 }} onClick={restart}>New Game</button>
          <button className="btn" style={{ background: "transparent", color: "rgba(253,246,227,0.75)", borderColor: "rgba(253,246,227,0.3)", fontSize: 12 }} onClick={onQuit}>Quit</button>
        </div>
        <div className="pool-info">Pool: {state.pool.length} · Min: {TH} pts</div>
      </header>

      <div className="rk-body">
        <div className="rk-main">

          {/* Winner banner */}
          {state.winner != null && (
            <div className="winner-banner">
              <h2>{state.winner === 0 ? "🎉 You Win!" : `AI ${state.winner} Wins!`}</h2>
              <div className="btn-row" style={{ justifyContent: "center" }}>
                <button className="btn primary" onClick={restart}>Play Again</button>
                <button className="btn" onClick={onQuit}>Quit to Menu</button>
              </div>
            </div>
          )}

          {/* Status */}
          {state.winner == null && (
            <div className="status-bar">
              <div>
                <div className="status-turn">
                  {state.currentPlayer === 0 ? "Your Turn" : `AI ${state.currentPlayer} is thinking…`}
                </div>
                <div style={{ marginTop: 4 }}>
                  <span className={`badge ${state.currentPlayer === 0 ? "your-turn" : "ai-turn"}`}>
                    {state.currentPlayer === 0 ? "● YOUR TURN" : "● AI PLAYING"}
                  </span>
                  {" "}
                  <span className={`badge ${human.opened ? "opened" : "not-opened"}`}>
                    {human.opened ? "✓ OPENED" : `NEED ${TH} PTS`}
                  </span>
                </div>
              </div>
              <div className="status-info">
                {state.players.map((p, i) => (
                  <span key={i}>
                    <strong>{i === 0 ? "You" : `AI${i}`}:</strong> {p.rack.length} tiles
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Table */}
          <div className="table-panel">
            <div className="table-label">Table · {state.tableMelds.length} meld{state.tableMelds.length !== 1 ? "s" : ""}</div>
            {state.tableMelds.length === 0
              ? <div style={{ color: "rgba(253,246,227,0.4)", fontSize: 14, fontFamily: "'DM Mono', monospace" }}>No melds yet — be the first to play!</div>
              : (
                <div className="melds-row">
                  {state.tableMelds.map(m => (
                    <MeldView key={m.id} meld={m} selected={selectedMeldId === m.id} onSelect={() => selectMeld(m.id)} />
                  ))}
                </div>
              )
            }
          </div>

          {/* Rack */}
          <div className="rack-panel">
            <div className="rack-label">Your Rack · {human.rack.length} tiles {selectedIds.length > 0 ? `· ${selectedIds.length} selected` : ""}</div>
            <div className="rack-tiles">
              {human.rack.length === 0
                ? <div style={{ color: "rgba(253,246,227,0.5)", fontSize: 14 }}>Empty rack!</div>
                : human.rack.map(t => (
                  <TileView key={t.id} tile={t} selected={selectedIds.includes(t.id)} onClick={isHumanTurn ? () => toggleTile(t) : null} />
                ))
              }
            </div>
          </div>

          {/* Controls */}
          {state.winner == null && (
            <div className="controls-panel">
              <div className="btn-row">
                <button className="btn success" disabled={!isHumanTurn || selectedIds.length < 3} onClick={humanMeld}>
                  Meld Selected ({selectedIds.length})
                </button>
                <button className="btn" disabled={!isHumanTurn || selectedIds.length !== 1 || !selectedMeldId} onClick={humanLayoff}>
                  Lay Off
                </button>
                <button className="btn" disabled={!isHumanTurn} onClick={humanDraw}>
                  Draw
                </button>
                <button className="btn primary" disabled={!isHumanTurn} onClick={endTurn}>
                  End Turn →
                </button>
                {selectedIds.length > 0 || selectedMeldId ? (
                  <button className="btn danger" onClick={clearSel}>Clear Selection</button>
                ) : null}
              </div>
              {isHumanTurn && (
                <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
                  {!human.opened && `Opening requires ${TH} pts · `}
                  {selectedIds.length > 0 && selectedMeldId && `Lay off: 1 tile + 1 meld selected · `}
                  {selectedIds.length >= 3 && !selectedMeldId && `Meld: ${selectedIds.length} tiles selected · `}
                  Tip: click tiles to select, click meld to target
                </div>
              )}
            </div>
          )}

          {/* Log */}
          <div className="log-panel">
            <div className="log-header">Game Log</div>
            <div className="log-body" ref={logRef}>
              {state.log.map((line, i) => (
                <div key={i} className="log-entry">{line}</div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Error Boundary ────────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { err: false }; }
  static getDerivedStateFromError() { return { err: true }; }
  componentDidCatch(e, i) { console.error("Rummikub error:", e, i); }
  render() {
    if (this.state.err) return (
      <div style={{ padding: 24, fontFamily: "sans-serif" }}>
        <h2>Something went wrong</h2>
        <button onClick={() => this.setState({ err: false })} style={{ marginTop: 12, padding: "8px 16px" }}>Try Again</button>
        <button onClick={this.props.onQuit || (() => {})} style={{ marginTop: 12, marginLeft: 8, padding: "8px 16px" }}>Back to Menu</button>
      </div>
    );
    return this.props.children;
  }
}

// ── Root Export ───────────────────────────────────────────────────────────────
export default function Rummikub({ onQuit }) {
  ensureStyles();
  const [screen, setScreen] = useState("setup");
  const [cfg, setCfg] = useState(null);

  function handleStart(c) { setCfg(c); setScreen("game"); }
  function handleQuit() {
    setScreen("setup");
    setCfg(null);
    if (typeof onQuit === "function") onQuit();
  }

  return (
    <ErrorBoundary onQuit={handleQuit}>
      {screen === "setup"
        ? <SetupScreen onStart={handleStart} />
        : <GameScreen cfg={cfg} onQuit={handleQuit} />
      }
    </ErrorBoundary>
  );
}
