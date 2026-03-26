import React, { useEffect, useRef, useState } from "react";
import "./Solitaire_v2_01.css";

/**
 * Solitaire_v2_01.jsx — Klondike (Turn 1 / Turn 3) · Claude House Edition
 * Light felt-green background, Playfair Display + DM Mono typography.
 * Features: New Game modal, Rules, Quit, Undo/Redo, Hint, Auto,
 *           Score/Moves/Timer, Win detection, AI Race board,
 *           seeded shuffle, double-click to foundation.
 */
export default function Solitaire_v2_01({ onQuit }) {
  // ── Default options ────────────────────────────────────────────────
  const defaultOpts = {
    drawCount: 3,
    scoring: "standard",
    timed: true,
    allowUnlimitedRedeals: true,
    raceVsAI: false,
    aiStrength: 4,
    autoMoveToFoundation: true,
    showHints: true,
    seed: "",
  };

  const [options, setOptions]     = useState(defaultOpts);
  const [showNewGame, setShowNewGame] = useState(true);
  const [showRules,   setShowRules]   = useState(false);

  const [game,    setGame]    = useState(null);
  const [aiGame,  setAiGame]  = useState(null);
  const [selected, setSelected] = useState(null); // { zone, pileIndex, cardIndex }
  const [hint,    setHint]    = useState(null);
  const [history, setHistory] = useState([]);
  const [future,  setFuture]  = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const [aiElapsed, setAiElapsed] = useState(0);
  const [running, setRunning] = useState(false);

  const timerRef      = useRef(null);
  const aiTimerRef    = useRef(null);
  const aiLoopRef     = useRef(null);

  // ── Suit helpers ──────────────────────────────────────────────────
  const SUITS = ["♠", "♥", "♦", "♣"];
  const isRed = (s) => s === "♥" || s === "♦";

  function rankLabel(r) {
    return r === 1 ? "A" : r === 11 ? "J" : r === 12 ? "Q" : r === 13 ? "K" : String(r);
  }
  function formatTime(s) {
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }

  // ── Seeded RNG ────────────────────────────────────────────────────
  function mulberry32(a) {
    return () => {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function seededShuffle(arr, seedStr = "") {
    const seed = seedStr
      ? [...seedStr].reduce((a, c) => a + c.charCodeAt(0), 0)
      : Math.floor(Math.random() * 1e9);
    const rand = mulberry32(seed);
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function newDeck() {
    const cards = [];
    let id = 0;
    for (const s of SUITS) {
      for (let r = 1; r <= 13; r++) {
        cards.push({ id: id++, suit: s, rank: r, color: isRed(s) ? "red" : "black", faceUp: false });
      }
    }
    return cards;
  }

  // ── Deal ──────────────────────────────────────────────────────────
  function deal(opts) {
    const deck = seededShuffle(newDeck(), opts.seed);
    const tableaus = Array.from({ length: 7 }, () => []);
    const foundations = [[], [], [], []];
    let idx = 0;
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j <= i; j++) {
        const c = deck[idx++];
        c.faceUp = j === i;
        tableaus[i].push(c);
      }
    }
    return {
      tableaus, foundations,
      stock: deck.slice(idx),
      waste: [],
      moves: 0, score: 0, redeals: 0,
      drawCount: opts.drawCount,
      scoring: opts.scoring,
      allowUnlimitedRedeals: opts.allowUnlimitedRedeals,
      autoMove: opts.autoMoveToFoundation,
      won: false,
    };
  }

  // ── Rules ─────────────────────────────────────────────────────────
  const topOf = (a) => (a.length ? a[a.length - 1] : null);

  function canOnTableau(card, destTop) {
    if (!destTop) return card.rank === 13;
    return destTop.color !== card.color && destTop.rank === card.rank + 1;
  }
  function canOnFoundation(card, fTop) {
    if (!fTop) return card.rank === 1;
    return fTop.suit === card.suit && fTop.rank + 1 === card.rank;
  }
  function flipTop(pile) {
    if (pile.length && !pile[pile.length - 1].faceUp) {
      pile[pile.length - 1].faceUp = true;
      return true;
    }
    return false;
  }
  function addScore(state, delta) {
    if (state.scoring !== "vegas") state.score += delta;
  }
  function pushTop(from, to) { to.push(from.pop()); }

  // ── Move helpers ──────────────────────────────────────────────────
  function doMoveToFoundation(st, from, fi) {
    const fTop = topOf(st.foundations[fi]);
    if (from.zone === "waste") {
      const c = topOf(st.waste); if (!c) return false;
      if (!canOnFoundation(c, fTop)) return false;
      pushTop(st.waste, st.foundations[fi]);
      addScore(st, 10);
      return true;
    }
    if (from.zone === "tableau") {
      const pile = st.tableaus[from.pileIndex]; if (!pile.length) return false;
      const c = topOf(pile);
      if (!canOnFoundation(c, fTop)) return false;
      pushTop(pile, st.foundations[fi]);
      addScore(st, 10);
      if (flipTop(pile)) addScore(st, 5);
      return true;
    }
    return false;
  }

  function doMoveToTableau(st, from, di) {
    const dest = st.tableaus[di];
    if (from.zone === "waste") {
      const c = topOf(st.waste); if (!c) return false;
      if (!canOnTableau(c, topOf(dest))) return false;
      pushTop(st.waste, dest);
      addScore(st, 5);
      return true;
    }
    if (from.zone === "tableau") {
      const src = st.tableaus[from.pileIndex];
      const seq = src.slice(from.cardIndex);
      if (!seq[0]?.faceUp) return false;
      if (!canOnTableau(seq[0], topOf(dest))) return false;
      st.tableaus[from.pileIndex] = src.slice(0, from.cardIndex);
      dest.push(...seq);
      if (flipTop(st.tableaus[from.pileIndex])) addScore(st, 5);
      return true;
    }
    return false;
  }

  function autoOnce(st) {
    const w = topOf(st.waste);
    if (w) {
      for (let f = 0; f < 4; f++) {
        if (canOnFoundation(w, topOf(st.foundations[f]))) {
          pushTop(st.waste, st.foundations[f]); addScore(st, 10); return true;
        }
      }
    }
    for (let t = 0; t < 7; t++) {
      const top = topOf(st.tableaus[t]);
      if (top?.faceUp) {
        for (let f = 0; f < 4; f++) {
          if (canOnFoundation(top, topOf(st.foundations[f]))) {
            pushTop(st.tableaus[t], st.foundations[f]);
            addScore(st, 10);
            if (flipTop(st.tableaus[t])) addScore(st, 5);
            return true;
          }
        }
      }
    }
    return false;
  }

  function isWin(st) {
    return st.foundations.reduce((s, f) => s + f.length, 0) === 52;
  }

  function doDraw(st) {
    if (st.stock.length === 0) {
      if (!st.allowUnlimitedRedeals && st.drawCount === 3 && st.redeals >= 3) return false;
      st.redeals += 1;
      while (st.waste.length) {
        const c = st.waste.pop(); c.faceUp = false; st.stock.push(c);
      }
    } else {
      for (let i = 0; i < st.drawCount && st.stock.length; i++) {
        const c = st.stock.pop(); c.faceUp = true; st.waste.push(c);
      }
      if (st.scoring === "standard") st.score -= 1;
    }
    return true;
  }

  // ── Hint ──────────────────────────────────────────────────────────
  function findHint(st) {
    const w = topOf(st.waste);
    if (w) {
      for (let f = 0; f < 4; f++) {
        if (canOnFoundation(w, topOf(st.foundations[f])))
          return { from: { zone: "waste" }, to: { zone: "foundation", index: f } };
      }
    }
    for (let t = 0; t < 7; t++) {
      const top = topOf(st.tableaus[t]);
      if (top?.faceUp) {
        for (let f = 0; f < 4; f++) {
          if (canOnFoundation(top, topOf(st.foundations[f])))
            return { from: { zone: "tableau", pileIndex: t, cardIndex: st.tableaus[t].length - 1 }, to: { zone: "foundation", index: f } };
        }
      }
    }
    if (w) {
      for (let t = 0; t < 7; t++) {
        if (canOnTableau(w, topOf(st.tableaus[t])))
          return { from: { zone: "waste" }, to: { zone: "tableau", index: t } };
      }
    }
    for (let src = 0; src < 7; src++) {
      const pile = st.tableaus[src];
      for (let i = 0; i < pile.length; i++) {
        if (!pile[i].faceUp) continue;
        for (let dst = 0; dst < 7; dst++) {
          if (dst === src) continue;
          if (canOnTableau(pile[i], topOf(st.tableaus[dst])))
            return { from: { zone: "tableau", pileIndex: src, cardIndex: i }, to: { zone: "tableau", index: dst } };
        }
      }
    }
    if (st.stock.length > 0) return { from: { zone: "stock" }, to: null };
    return null;
  }

  // ── History ───────────────────────────────────────────────────────
  function snapshot() {
    setHistory(h => [...h, JSON.stringify(game)]);
    setFuture([]);
  }
  function undo() {
    if (!history.length) return;
    setFuture(f => [JSON.stringify(game), ...f]);
    setGame(JSON.parse(history[history.length - 1]));
    setHistory(h => h.slice(0, -1));
    setSelected(null); setHint(null);
  }
  function redo() {
    if (!future.length) return;
    setHistory(h => [...h, JSON.stringify(game)]);
    setGame(JSON.parse(future[0]));
    setFuture(f => f.slice(1));
    setSelected(null); setHint(null);
  }

  // ── Interactions ──────────────────────────────────────────────────
  function onCardClick(zone, pileIndex, cardIndex) {
    if (!game || game.won) return;
    setHint(null);
    const st = JSON.parse(JSON.stringify(game));

    if (!selected) {
      if (zone === "waste") { if (!st.waste.length) return; setSelected({ zone, pileIndex: null, cardIndex: st.waste.length - 1 }); return; }
      if (zone === "tableau") {
        const c = st.tableaus[pileIndex][cardIndex];
        if (!c.faceUp) return;
        setSelected({ zone, pileIndex, cardIndex });
        return;
      }
      return;
    }

    // try to move
    snapshot();
    let moved = false;
    if (zone === "foundation") {
      moved = doMoveToFoundation(st, selected, pileIndex);
    } else if (zone === "tableau") {
      moved = doMoveToTableau(st, selected, pileIndex);
    }

    if (moved) {
      st.moves += 1;
      if (st.autoMove) { let g = 0; while (autoOnce(st) && g++ < 20) {} }
      if (isWin(st)) { st.won = true; setRunning(false); }
      setGame(st);
    } else {
      setHistory(h => h.slice(0, -1));
    }
    setSelected(null);
  }

  function onCardDblClick(zone, pileIndex, cardIndex) {
    if (!game || game.won) return;
    const st = JSON.parse(JSON.stringify(game));
    const from = zone === "waste" ? { zone: "waste" } :
                 (zone === "tableau" && cardIndex === st.tableaus[pileIndex].length - 1)
                   ? { zone: "tableau", pileIndex, cardIndex } : null;
    if (!from) return;
    for (let f = 0; f < 4; f++) {
      if (doMoveToFoundation(st, from, f)) {
        snapshot();
        st.moves += 1;
        if (isWin(st)) { st.won = true; setRunning(false); }
        setGame(st); setSelected(null); setHint(null);
        return;
      }
    }
  }

  function onFoundationClick(fi) {
    if (!game || game.won || !selected) return;
    const st = JSON.parse(JSON.stringify(game));
    snapshot();
    if (doMoveToFoundation(st, selected, fi)) {
      st.moves += 1;
      if (st.autoMove) { let g = 0; while (autoOnce(st) && g++ < 20) {} }
      if (isWin(st)) { st.won = true; setRunning(false); }
      setGame(st);
    } else {
      setHistory(h => h.slice(0, -1));
    }
    setSelected(null);
  }

  function onTableauEmptyClick(pi) {
    if (!game || game.won || !selected) return;
    const st = JSON.parse(JSON.stringify(game));
    snapshot();
    if (doMoveToTableau(st, selected, pi)) {
      st.moves += 1;
      if (isWin(st)) { st.won = true; setRunning(false); }
      setGame(st);
    } else {
      setHistory(h => h.slice(0, -1));
    }
    setSelected(null);
  }

  function onDrawClick() {
    if (!game || game.won) return;
    const st = JSON.parse(JSON.stringify(game));
    if (doDraw(st)) { snapshot(); st.moves += 1; setGame(st); }
  }

  function onAuto() {
    if (!game || game.won) return;
    const st = JSON.parse(JSON.stringify(game));
    let g = 0; while (autoOnce(st) && g++ < 52) { st.moves += 1; }
    if (isWin(st)) { st.won = true; setRunning(false); }
    setGame(st);
  }

  function onHint() {
    if (!game || game.won) return;
    setHint(findHint(game));
  }

  // ── New Game ──────────────────────────────────────────────────────
  function startGame(opts) {
    const g  = deal(opts);
    const ai = opts.raceVsAI ? deal(opts) : null;
    setGame(g); setAiGame(ai);
    setSelected(null); setHint(null);
    setHistory([]); setFuture([]);
    setElapsed(0); setAiElapsed(0);
    setRunning(true);
    setShowNewGame(false);
  }

  // ── Timers ────────────────────────────────────────────────────────
  useEffect(() => {
    clearInterval(timerRef.current);
    if (running) timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [running]);

  useEffect(() => {
    clearInterval(aiTimerRef.current);
    clearInterval(aiLoopRef.current);
    if (!options.raceVsAI || !aiGame) return;

    aiTimerRef.current = setInterval(() => setAiElapsed(e => e + 1), 1000);
    const delay = Math.max(100, 900 - options.aiStrength * 90);
    aiLoopRef.current = setInterval(() => {
      setAiGame(prev => {
        if (!prev || prev.won) return prev;
        const st = JSON.parse(JSON.stringify(prev));
        if (!aiStep(st, options.aiStrength)) doDraw(st);
        if (isWin(st)) st.won = true;
        return st;
      });
    }, delay);

    return () => { clearInterval(aiTimerRef.current); clearInterval(aiLoopRef.current); };
  }, [options.raceVsAI, aiGame, options.aiStrength]);

  function aiStep(st, strength) {
    if (autoOnce(st)) { st.moves += 1; return true; }
    if (strength >= 5) {
      for (let src = 0; src < 7; src++) {
        const pile = st.tableaus[src];
        const fdIdx = pile.findIndex(c => !c.faceUp);
        if (fdIdx >= 0) {
          for (let i = fdIdx + 1; i < pile.length; i++) {
            if (!pile[i].faceUp) continue;
            for (let dst = 0; dst < 7; dst++) {
              if (dst === src) continue;
              if (canOnTableau(pile[i], topOf(st.tableaus[dst]))) {
                const seq = pile.slice(i);
                st.tableaus[src] = pile.slice(0, i);
                st.tableaus[dst].push(...seq);
                if (flipTop(st.tableaus[src])) addScore(st, 5);
                st.moves += 1; return true;
              }
            }
          }
        }
      }
    }
    const w = topOf(st.waste);
    if (w) {
      for (let t = 0; t < 7; t++) {
        if (canOnTableau(w, topOf(st.tableaus[t]))) {
          pushTop(st.waste, st.tableaus[t]); addScore(st, 5); st.moves += 1; return true;
        }
      }
    }
    for (let src = 0; src < 7; src++) {
      const pile = st.tableaus[src];
      for (let i = 0; i < pile.length; i++) {
        if (!pile[i].faceUp) continue;
        for (let dst = 0; dst < 7; dst++) {
          if (dst === src) continue;
          if (canOnTableau(pile[i], topOf(st.tableaus[dst]))) {
            const seq = pile.slice(i);
            st.tableaus[src] = pile.slice(0, i);
            st.tableaus[dst].push(...seq);
            if (flipTop(st.tableaus[src])) addScore(st, 5);
            st.moves += 1; return true;
          }
        }
      }
    }
    return false;
  }

  // ── Card component ────────────────────────────────────────────────
  function SolCard({ card, isSelected, isHint, onClick, onDoubleClick }) {
    const cls = [
      "sol-card",
      card.faceUp ? "face-up" : "face-down",
      card.faceUp ? card.color : "",
      isSelected ? "selected" : "",
      isHint     ? "hint-glow" : "",
    ].filter(Boolean).join(" ");

    return (
      <div className={cls} onClick={onClick} onDoubleClick={onDoubleClick}>
        {card.faceUp ? (
          <>
            <span className="c-rank-tl">{rankLabel(card.rank)}</span>
            <span className="c-suit-tl">{card.suit}</span>
            <span className="c-center">{card.suit}</span>
            <span className="c-rank-br">{rankLabel(card.rank)}</span>
            <span className="c-suit-br">{card.suit}</span>
          </>
        ) : (
          <div className="card-back-pattern" />
        )}
      </div>
    );
  }

  // ── Board component ───────────────────────────────────────────────
  function Board({ g, isAI }) {
    if (!g) return null;
    const canDraw = g.stock.length > 0 || g.allowUnlimitedRedeals || g.redeals < 3;

    return (
      <div className="sol-board">
        {/* TOP ROW */}
        <div className="sol-top-row">
          {/* Stock */}
          <div>
            <div
              className={"sol-stock-pile" + (g.stock.length === 0 ? " empty" : "")}
              onClick={!isAI ? onDrawClick : undefined}
              title={g.stock.length === 0 ? "Click to redeal" : "Click to draw"}
            >
              {g.stock.length > 0
                ? <>
                    <span className="sol-stock-icon">🂠</span>
                    <span className="sol-stock-count">{g.stock.length}</span>
                  </>
                : <>
                    <span className="sol-stock-icon">↺</span>
                    <span className="sol-stock-count">Redeal</span>
                  </>
              }
            </div>
          </div>

          {/* Waste */}
          <div className="sol-pile" style={{ minHeight: 132, minWidth: 96 }}>
            <span className="sol-pile-label">Waste</span>
            {g.waste.map((c, i) => (
              <div key={c.id} className="sol-stacked" style={{ top: Math.min(i, g.waste.length - 1) * 2 }}>
                {i === g.waste.length - 1 && (
                  <SolCard
                    card={c}
                    isSelected={!isAI && selected?.zone === "waste"}
                    isHint={!isAI && hint?.from?.zone === "waste"}
                    onClick={!isAI ? () => onCardClick("waste", null, i) : undefined}
                    onDoubleClick={!isAI ? () => onCardDblClick("waste", null, i) : undefined}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Draw controls */}
          {!isAI && (
            <div className="sol-draw-area">
              <button className="sol-btn sol-draw-btn" onClick={onDrawClick} disabled={!canDraw}>
                Draw {g.drawCount}
              </button>
              <span style={{ fontSize: 11, color: "var(--ink-faint)" }}>
                {g.allowUnlimitedRedeals ? "∞ redeals" : `Redeals: ${g.redeals}/3`}
              </span>
            </div>
          )}
          {isAI && <div />}

          {/* Foundations */}
          {g.foundations.map((f, fi) => (
            <div
              key={fi}
              className="sol-pile"
              style={{ minWidth: 96, minHeight: 132 }}
              onClick={!isAI ? () => onFoundationClick(fi) : undefined}
            >
              <span className="sol-pile-label">{["♠", "♥", "♦", "♣"][fi]}<br />Found.</span>
              {f.map((c, i) => (
                <div key={c.id} className="sol-stacked" style={{ top: i * 2 }}>
                  {i === f.length - 1 && (
                    <SolCard
                      card={c}
                      isHint={!isAI && hint?.to?.zone === "foundation" && hint.to.index === fi}
                      onClick={() => {}}
                      onDoubleClick={() => {}}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* TABLEAUS */}
        <div className="sol-tableaus">
          {g.tableaus.map((pile, pi) => (
            <div
              key={pi}
              className="sol-pile"
              style={{ minHeight: 340 }}
              onClick={() => !isAI && pile.length === 0 && onTableauEmptyClick(pi)}
            >
              {pile.length === 0 && <span className="sol-pile-label">K</span>}
              {pile.map((c, i) => (
                <div key={c.id} className="sol-fan" style={{ top: i * (c.faceUp ? 24 : 16) }}>
                  <SolCard
                    card={c}
                    isSelected={!isAI && selected?.zone === "tableau" && selected.pileIndex === pi && selected.cardIndex === i}
                    isHint={!isAI && (
                      (hint?.from?.zone === "tableau" && hint.from.pileIndex === pi && hint.from.cardIndex === i) ||
                      (hint?.to?.zone === "tableau" && hint.to.index === pi && i === pile.length - 1)
                    )}
                    onClick={!isAI ? () => onCardClick("tableau", pi, i) : undefined}
                    onDoubleClick={!isAI ? () => onCardDblClick("tableau", pi, i) : undefined}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Controls (human only) */}
        {!isAI && (
          <div className="sol-controls">
            <button className="sol-btn" onClick={undo} disabled={!history.length}>↩ Undo</button>
            <button className="sol-btn" onClick={redo} disabled={!future.length}>↪ Redo</button>
            <button className="sol-btn" onClick={onHint} disabled={!options.showHints}>💡 Hint</button>
            <button className="sol-btn" onClick={onAuto}>⬆ Auto</button>
          </div>
        )}

        {/* Win */}
        {g.won && (
          <div className="sol-win-wrap">
            <div className="sol-win">
              <span className="sol-win-trophy">🏆</span>
              <div>
                <div className="sol-win-msg">{isAI ? "AI Wins!" : "You Win!"}</div>
                <div className="sol-win-sub">{g.moves} moves · {isAI ? aiElapsed : elapsed}s · Score {g.score}</div>
              </div>
              {!isAI && <button className="sol-btn primary" onClick={() => setShowNewGame(true)}>New Game</button>}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── New Game Modal ────────────────────────────────────────────────
  function NewGameModal() {
    const [local, setLocal] = useState(options);
    const set = (k, v) => setLocal(o => ({ ...o, [k]: v }));

    return (
      <div className="sol-backdrop">
        <div className="sol-modal">
          <h2>New Game</h2>
          <div className="sol-opts">
            <div className="sol-opt">
              <label>Draw count</label>
              <select value={local.drawCount} onChange={e => set("drawCount", Number(e.target.value))}>
                <option value={1}>Turn 1</option>
                <option value={3}>Turn 3</option>
              </select>
            </div>
            <div className="sol-opt">
              <label>Scoring</label>
              <select value={local.scoring} onChange={e => set("scoring", e.target.value)}>
                <option value="standard">Standard</option>
                <option value="vegas">Vegas</option>
              </select>
            </div>
            <div className="sol-opt">
              <label>Timed game</label>
              <input type="checkbox" checked={local.timed} onChange={e => set("timed", e.target.checked)} />
            </div>
            <div className="sol-opt">
              <label>Unlimited redeals</label>
              <input type="checkbox" checked={local.allowUnlimitedRedeals} onChange={e => set("allowUnlimitedRedeals", e.target.checked)} />
            </div>
            <div className="sol-opt">
              <label>Auto-move to foundations</label>
              <input type="checkbox" checked={local.autoMoveToFoundation} onChange={e => set("autoMoveToFoundation", e.target.checked)} />
            </div>
            <div className="sol-opt">
              <label>Show hints</label>
              <input type="checkbox" checked={local.showHints} onChange={e => set("showHints", e.target.checked)} />
            </div>
            <div className="sol-opt">
              <label>Race vs AI</label>
              <input type="checkbox" checked={local.raceVsAI} onChange={e => set("raceVsAI", e.target.checked)} />
            </div>
            <div className="sol-opt">
              <label>AI Strength</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="range" min="1" max="8" value={local.aiStrength}
                  onChange={e => set("aiStrength", Number(e.target.value))} />
                <span className="sol-range-val">{local.aiStrength}</span>
              </div>
            </div>
            <div className="sol-opt" style={{ gridColumn: "1 / -1" }}>
              <label>Seed (optional)</label>
              <input type="text" value={local.seed} onChange={e => set("seed", e.target.value)}
                placeholder="e.g. lucky-42" style={{ width: 200 }} />
            </div>
          </div>

          <p className="sol-protip">
            Pro tip: enter the same seed to replay an identical shuffle — great for rematch vs AI.
          </p>

          <div className="sol-modal-actions">
            <button className="sol-btn" onClick={() => setShowNewGame(false)}>Cancel</button>
            <button className="sol-btn primary" onClick={() => { setOptions(local); startGame(local); }}>
              Deal Cards
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Rules Modal ───────────────────────────────────────────────────
  function RulesModal() {
    return (
      <div className="sol-backdrop">
        <div className="sol-modal">
          <h2>Rules — Klondike Solitaire</h2>
          <div className="sol-rules-scroll">
            <h3>Objective</h3>
            <p>Build all four Foundations from Ace up to King, one pile per suit.</p>
            <h3>Setup</h3>
            <ul>
              <li>7 Tableau piles (1–7 cards each, only top card face-up).</li>
              <li>Remaining cards form the face-down Stock.</li>
              <li>Drawn cards go to the Waste (face-up); only the top Waste card is playable.</li>
              <li>Four Foundations begin empty.</li>
            </ul>
            <h3>Tableau moves</h3>
            <ul>
              <li>Place cards in <strong>descending rank, alternating color</strong> (e.g. red 9 on black 10).</li>
              <li>Move whole face-up sequences together.</li>
              <li>Empty column accepts only a King (or King-led sequence).</li>
            </ul>
            <h3>Foundation</h3>
            <ul>
              <li>Start with Ace, then 2, 3 … K in the same suit.</li>
              <li>Double-click a card to auto-send to foundations.</li>
            </ul>
            <h3>Stock & Waste</h3>
            <ul>
              <li>Click Stock (or <em>Draw</em> button) to reveal 1 or 3 cards to Waste.</li>
              <li>When Stock is empty, click to redeal the Waste (redeals may be limited).</li>
            </ul>
            <h3>Scoring (Standard)</h3>
            <ul>
              <li>+10 → Foundation, +5 → flip a face-down card, −1 → draw from stock.</li>
            </ul>
            <h3>Controls</h3>
            <ul>
              <li><strong>Click</strong> to select, click destination to move.</li>
              <li><strong>Double-click</strong> top card to send to foundation.</li>
              <li><strong>Undo / Redo</strong> — step through move history.</li>
              <li><strong>Hint</strong> — highlight a suggested move (gold glow).</li>
              <li><strong>Auto</strong> — sweep obvious cards to foundations.</li>
              <li><strong>Race vs AI</strong> — same shuffle, competing AI board.</li>
            </ul>
          </div>
          <div className="sol-modal-actions">
            <button className="sol-btn primary" onClick={() => setShowRules(false)}>Got it</button>
          </div>
        </div>
      </div>
    );
  }

  // ── HUD ───────────────────────────────────────────────────────────
  function Hud() {
    return (
      <div className="sol-hud">
        <div className="sol-hud-left">
          <button className="sol-btn" onClick={() => setShowRules(true)}>Rules</button>
          <button className="sol-btn" onClick={() => setShowNewGame(true)}>New Game</button>
          {onQuit && <button className="sol-btn" onClick={onQuit}>Quit</button>}
        </div>

        <div className="sol-hud-center">
          <div className="sol-title">Soli<span>taire</span></div>
          {game && (
            <div className="sol-stats">
              <div className="sol-stat">
                <span>{game.score}</span>
                <span className="sol-stat-label">Score</span>
              </div>
              <div className="sol-stat">
                <span>{game.moves}</span>
                <span className="sol-stat-label">Moves</span>
              </div>
              {options.timed && (
                <div className="sol-stat">
                  <span>{formatTime(elapsed)}</span>
                  <span className="sol-stat-label">Time</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="sol-hud-right">
          {options.raceVsAI && (
            <span className="sol-ai-badge">AI ×{options.aiStrength}</span>
          )}
        </div>
      </div>
    );
  }

  // ── Layout ────────────────────────────────────────────────────────
  return (
    <div className="sol-root">
      <Hud />

      <div className={"sol-arena " + (options.raceVsAI ? "two-col" : "one-col")}>
        {/* Human panel */}
        <div className="sol-panel">
          <div className="sol-panel-header">
            <span className="sol-panel-title">Your Board</span>
          </div>
          {game
            ? <Board g={game} isAI={false} />
            : <div className="sol-empty-panel">
                <span className="sol-empty-icon">🂠</span>
                <span>Press <strong>New Game</strong> to start</span>
              </div>
          }
        </div>

        {/* AI panel */}
        {options.raceVsAI && (
          <div className="sol-panel">
            <div className="sol-panel-header">
              <span className="sol-panel-title">AI Board</span>
              <span className="sol-ai-badge">Strength {options.aiStrength}</span>
            </div>
            {aiGame
              ? <>
                  <Board g={aiGame} isAI={true} />
                  <div className="sol-ai-stats">
                    <div className="sol-ai-stat">
                      <span>{aiGame.score}</span>
                      <span className="sol-ai-stat-label">Score</span>
                    </div>
                    <div className="sol-ai-stat">
                      <span>{aiGame.moves}</span>
                      <span className="sol-ai-stat-label">Moves</span>
                    </div>
                    <div className="sol-ai-stat">
                      <span>{formatTime(aiElapsed)}</span>
                      <span className="sol-ai-stat-label">Time</span>
                    </div>
                    {aiGame.won && (
                      <div className="sol-ai-stat" style={{ color: "var(--gold)" }}>
                        <span>✓</span>
                        <span className="sol-ai-stat-label">Finished</span>
                      </div>
                    )}
                  </div>
                </>
              : <div className="sol-empty-panel"><span className="sol-empty-icon">🤖</span><span>AI board</span></div>
            }
          </div>
        )}
      </div>

      {showNewGame && <NewGameModal />}
      {showRules   && <RulesModal />}
    </div>
  );
}
