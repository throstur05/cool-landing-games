// Spades_v2_01.jsx — Claude House Edition
// Light background, refined card-table aesthetic
// Human (South) vs 3 AIs (West, North, East)

import React, { useEffect, useMemo, useRef, useState } from "react";

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const SUITS = ["S", "H", "D", "C"];
const SUIT_SYMBOL = { S: "♠", H: "♥", D: "♦", C: "♣" };
const RANKS = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
const RANK_VALUE = Object.fromEntries(RANKS.map((r,i) => [r, i+2]));
const NAMES = ["You", "West", "North", "East"];
const PARTNER = { 0:2, 1:3, 2:0, 3:1 };

/* ─────────────────────────────────────────────
   CARD / DECK UTILITIES
───────────────────────────────────────────── */
function newDeck() {
  let id = 0, deck = [];
  for (const s of SUITS) for (const r of RANKS) deck.push({ id: id++, suit: s, rank: r });
  return deck;
}
function shuffle(a) {
  const arr = a.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function sortHand(hand) {
  const order = { S:0, H:1, D:2, C:3 };
  return hand.slice().sort((a,b) =>
    order[a.suit] !== order[b.suit]
      ? order[a.suit] - order[b.suit]
      : RANK_VALUE[a.rank] - RANK_VALUE[b.rank]
  );
}
function deal(deck) {
  const hands = [[],[],[],[]];
  for (let i = 0; i < 52; i++) hands[i % 4].push(deck[i]);
  return hands.map(sortHand);
}
function sameCard(a,b) { return a && b && a.id === b.id; }
function cardToText(card) { return `${card.rank}${SUIT_SYMBOL[card.suit]}`; }

/* ─────────────────────────────────────────────
   GAME LOGIC
───────────────────────────────────────────── */
function legalPlays(hand, trick, leadSuit, spadesBroken) {
  const haveLead = leadSuit && hand.some(c => c.suit === leadSuit);
  if (trick.length === 0) {
    const onlySpades = hand.every(c => c.suit === "S");
    if (!spadesBroken && !onlySpades) return hand.filter(c => c.suit !== "S");
    return hand.slice();
  } else if (haveLead) {
    return hand.filter(c => c.suit === leadSuit);
  }
  return hand.slice();
}

function trickWinner(trick, leadSuit) {
  const spades = trick.filter(t => t.card.suit === "S");
  const pool = spades.length > 0 ? spades : trick.filter(t => t.card.suit === leadSuit);
  let w = pool[0];
  for (const t of pool) if (RANK_VALUE[t.card.rank] > RANK_VALUE[w.card.rank]) w = t;
  return w.player;
}

function nextPlayer(i) { return (i+1) & 3; }
function teamIndex(i) { return i % 2; }

function estimateTricksForBid(hand, opts) {
  const spades = hand.filter(c => c.suit === "S");
  const highSpades = spades.reduce((acc,c) => acc + (["A","K","Q","J"].includes(c.rank)?1:0), 0);
  let topOthers = 0;
  for (const suit of ["H","D","C"]) {
    const sc = hand.filter(c => c.suit === suit);
    const tops = sc.reduce((acc,c) => acc + (["A","K"].includes(c.rank)?1:0), 0);
    topOthers += sc.length >= 2 ? tops : tops * 0.7;
  }
  let base = highSpades + Math.max(0, spades.length - 3) * 0.4 + topOthers * 0.7;
  if (opts.allowNil && base < 2.2) return 0;
  return Math.max(0, Math.min(13, Math.round(base)));
}

function pickCardAI(state, idx) {
  const { hands, trick, leadSuit, spadesBroken, options, bids, taken, tricksThisHand } = state;
  const hand = hands[idx];
  const legal = legalPlays(hand, trick, leadSuit, spadesBroken);
  if (legal.length === 1) return legal[0];
  const strength = options.aiStrength ?? 4;

  const needTricks = (() => {
    if (options.mode === "partnership") {
      const myTeam = teamIndex(idx);
      const teamBid = bids.filter((_,i) => teamIndex(i)===myTeam).reduce((a,b) => a+(b?.type==="number"?b.value:0), 0);
      const teamTaken = tricksThisHand.filter(w => teamIndex(w)===myTeam).length;
      return Math.max(0, teamBid - teamTaken);
    } else {
      const myBid = bids[idx]?.type==="number" ? bids[idx].value : 0;
      const myTaken = tricksThisHand.filter(w => w===idx).length;
      return Math.max(0, myBid - myTaken);
    }
  })();

  const isNil = bids[idx]?.type === "nil";

  function score(card) {
    let s = 0;
    const value = RANK_VALUE[card.rank];
    if (leadSuit && card.suit === leadSuit) s += 5;
    if (!leadSuit && card.suit === "S" && !spadesBroken) s -= 2;
    if (isNil) { s -= value * 0.8; if (card.suit==="S") s -= 3; return s; }
    if (needTricks > 0) {
      if (leadSuit) {
        if (card.suit===leadSuit) s += value * 0.35;
        else if (card.suit==="S") s += value * 0.4;
      } else {
        if (card.suit==="S") s += (value*0.25) - (strength<5?3:0);
        else s += value * 0.15;
      }
    } else {
      s -= value * 0.2;
      if (card.suit==="S") s -= 2;
    }
    if (leadSuit && card.suit !== leadSuit) s += 1.5;
    s += (strength - 4) * 0.6;
    return s;
  }

  const considered = legal.map(c => ({ card:c, s:score(c) }));
  considered.sort((a,b) => b.s - a.s);
  return considered[0].card;
}

/* ─────────────────────────────────────────────
   INLINE STYLES (no CSS file dependency)
───────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --cream: #faf8f4;
  --felt: #e8ede6;
  --felt-dark: #d4dbd1;
  --ivory: #f5f2eb;
  --card-bg: #ffffff;
  --card-border: #ddd8cc;
  --shadow-card: 0 2px 8px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06);
  --shadow-panel: 0 4px 20px rgba(0,0,0,0.08);
  --ink: #1a1814;
  --ink-mid: #4a4540;
  --ink-light: #8a8078;
  --red: #c0392b;
  --black-suit: #1a1814;
  --gold: #b8960c;
  --gold-light: #e8c84a;
  --accent: #2c5f8a;
  --accent-light: #e8f0f8;
  --green-win: #2d6a4f;
  --border: #ddd8cc;
  --table-line: rgba(0,0,0,0.06);
}

html, body { height: 100%; background: var(--cream); }

.sp2-root {
  min-height: 100vh;
  background: var(--cream);
  background-image:
    radial-gradient(circle at 20% 50%, rgba(184,150,12,0.04) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(44,95,138,0.04) 0%, transparent 50%);
  font-family: 'DM Sans', sans-serif;
  color: var(--ink);
  display: flex;
  flex-direction: column;
}

/* ── TOPBAR ── */
.sp2-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px 12px;
  border-bottom: 1px solid var(--border);
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(8px);
  position: sticky;
  top: 0;
  z-index: 10;
}
.sp2-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}
.sp2-logo-icon {
  font-size: 24px;
  line-height: 1;
}
.sp2-logo h1 {
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: var(--ink);
}
.sp2-logo span {
  font-size: 11px;
  font-weight: 500;
  color: var(--ink-light);
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-left: 2px;
  display: block;
  line-height: 1;
}
.sp2-topbar-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* ── BUTTONS ── */
.btn2 {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  padding: 7px 14px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: #fff;
  color: var(--ink-mid);
  cursor: pointer;
  letter-spacing: 0.2px;
  transition: all 0.15s ease;
}
.btn2:hover { border-color: #b8b0a0; background: var(--ivory); color: var(--ink); }
.btn2:active { transform: translateY(1px); }
.btn2-primary {
  background: var(--ink);
  color: #fff;
  border-color: var(--ink);
}
.btn2-primary:hover { background: #2d2a26; border-color: #2d2a26; color: #fff; }
.btn2-gold {
  background: var(--gold);
  color: #fff;
  border-color: var(--gold);
}
.btn2-gold:hover { background: #a07d08; border-color: #a07d08; color: #fff; }
.btn2:disabled { opacity: 0.42; cursor: default; pointer-events: none; }

/* ── SCOREBAR ── */
.sp2-scorebar {
  display: flex;
  justify-content: center;
  gap: 32px;
  padding: 10px 20px;
  background: var(--ivory);
  border-bottom: 1px solid var(--border);
}
.score-team {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.score-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: var(--ink-light);
}
.score-value {
  font-family: 'Playfair Display', serif;
  font-size: 22px;
  font-weight: 700;
  color: var(--ink);
}
.score-bags {
  font-size: 11px;
  color: var(--ink-light);
}
.score-divider {
  width: 1px;
  background: var(--border);
}

/* ── STATUS BAR ── */
.sp2-status {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 8px 20px;
  font-size: 12px;
  font-weight: 500;
  color: var(--ink-light);
  letter-spacing: 0.3px;
  flex-wrap: wrap;
}
.sp2-status strong { color: var(--ink-mid); }
.status-pip {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: var(--border);
  align-self: center;
}

/* ── TABLE LAYOUT ── */
.sp2-table {
  flex: 1;
  display: grid;
  grid-template-areas:
    ". north ."
    "west center east"
    ". south .";
  grid-template-columns: 1fr 2fr 1fr;
  grid-template-rows: auto 1fr auto;
  gap: 10px;
  padding: 12px 16px;
  position: relative;
}

.sp2-seat-north { grid-area: north; }
.sp2-seat-west  { grid-area: west; }
.sp2-seat-east  { grid-area: east; }
.sp2-seat-south { grid-area: south; }
.sp2-center     { grid-area: center; }

/* ── PLAYER PANELS ── */
.sp2-player {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 10px 12px;
  box-shadow: var(--shadow-panel);
}
.sp2-player.is-turn {
  border-color: var(--gold);
  box-shadow: 0 0 0 2px var(--gold-light), var(--shadow-panel);
}
.sp2-player-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.sp2-player-name {
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.2px;
  color: var(--ink);
}
.sp2-player-bid {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 20px;
  background: var(--felt);
  color: var(--ink-mid);
}
.sp2-player-bid.nil { background: #fef3c7; color: #92400e; }
.sp2-player-bid.made { background: #d1fae5; color: var(--green-win); }
.sp2-cards-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

/* ── CARDS ── */
.sp2-card {
  width: 42px; height: 60px;
  border-radius: 8px;
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  cursor: default;
  user-select: none;
  box-shadow: var(--shadow-card);
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  position: relative;
}
.sp2-card.playable {
  cursor: pointer;
}
.sp2-card.playable:hover {
  transform: translateY(-6px) scale(1.04);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  border-color: var(--gold);
  z-index: 2;
}
.sp2-card.legal-hint {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
.sp2-card.legal-hint.playable:hover {
  outline-color: var(--gold);
}
.sp2-card .c-rank {
  font-family: 'Playfair Display', serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
}
.sp2-card .c-suit {
  font-size: 15px;
  line-height: 1;
}
.sp2-card.red-suit { color: var(--red); }
.sp2-card.black-suit { color: var(--black-suit); }
.sp2-card.card-back {
  background: repeating-linear-gradient(
    45deg,
    #c8d8e8 0px, #c8d8e8 5px,
    #dde8f0 5px, #dde8f0 10px
  );
  border-color: #aabfce;
}
.sp2-card.card-back::after {
  content: "♠";
  font-size: 20px;
  color: rgba(44,95,138,0.3);
}
.sp2-card.highlight-pulse {
  animation: cardPulse 0.7s ease;
}
@keyframes cardPulse {
  0%   { box-shadow: 0 0 0 0 rgba(184,150,12,0.6); }
  100% { box-shadow: 0 0 0 14px rgba(184,150,12,0); }
}

/* ── CENTER AREA ── */
.sp2-center {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: stretch;
}
.sp2-trick-area {
  flex: 1;
  background: var(--felt);
  border: 1px solid var(--felt-dark);
  border-radius: 16px;
  position: relative;
  min-height: 160px;
  display: grid;
  grid-template-areas:
    ". north ."
    "west  .  east"
    ". south .";
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  padding: 8px;
  gap: 4px;
}
.sp2-trick-area::before {
  content: '';
  position: absolute;
  inset: 16px;
  border: 1px dashed rgba(0,0,0,0.12);
  border-radius: 10px;
  pointer-events: none;
}
.trick-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
}
.trick-cell.tc-north { grid-area: north; }
.trick-cell.tc-west  { grid-area: west; }
.trick-cell.tc-east  { grid-area: east; }
.trick-cell.tc-south { grid-area: south; }
.trick-player-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--ink-mid);
  letter-spacing: 0.5px;
}
.trick-waiting {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--ink-light);
  font-style: italic;
}

.sp2-info-row {
  display: flex;
  gap: 8px;
}
.sp2-info-box {
  flex: 1;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 12px;
}
.sp2-info-box-title {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--ink-light);
  margin-bottom: 4px;
}
.sp2-info-val {
  font-weight: 600;
  color: var(--ink);
  font-size: 13px;
}

.sp2-hint-row {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--accent-light);
  border: 1px solid #bdd0e4;
  border-radius: 10px;
  padding: 8px 12px;
}
.hint-suggest {
  font-size: 13px;
  font-weight: 500;
  color: var(--accent);
}
.hint-card-name {
  font-family: 'Playfair Display', serif;
  font-weight: 700;
}

/* ── YOUR HAND PANEL (south) ── */
.sp2-your-hand {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 12px 14px;
  box-shadow: var(--shadow-panel);
}
.sp2-your-hand .sp2-player-header { margin-bottom: 10px; }
.sp2-your-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
}
.sp2-your-hand .sp2-card {
  width: 48px;
  height: 68px;
}
.sp2-your-hand .c-rank { font-size: 16px; }
.sp2-your-hand .c-suit { font-size: 17px; }

/* ── OPTIONS PAGE ── */
.sp2-options-page {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 860px;
  margin: 0 auto;
  width: 100%;
}
.sp2-options-hero {
  text-align: center;
  padding: 20px 0 8px;
}
.sp2-options-hero h2 {
  font-family: 'Playfair Display', serif;
  font-size: 32px;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 6px;
}
.sp2-options-hero p {
  font-size: 14px;
  color: var(--ink-light);
}
.sp2-options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}
.sp2-opt-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px;
  box-shadow: var(--shadow-panel);
}
.sp2-opt-card h4 {
  font-family: 'Playfair Display', serif;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--ink);
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}
.sp2-opt-card label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--ink-mid);
  padding: 4px 0;
  cursor: pointer;
}
.sp2-opt-card input[type="radio"],
.sp2-opt-card input[type="checkbox"] {
  accent-color: var(--ink);
  width: 15px; height: 15px;
  cursor: pointer;
}
.sp2-opt-card select,
.sp2-opt-card input[type="number"] {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  padding: 5px 8px;
  border-radius: 7px;
  border: 1px solid var(--border);
  background: var(--ivory);
  color: var(--ink);
  cursor: pointer;
  width: 100%;
  margin-top: 4px;
}
.sp2-opt-card input[type="range"] {
  width: 100%;
  accent-color: var(--ink);
  cursor: pointer;
}
.strength-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.strength-label {
  font-family: 'Playfair Display', serif;
  font-size: 22px;
  font-weight: 700;
  color: var(--ink);
}
.strength-desc {
  font-size: 12px;
  color: var(--ink-light);
  margin-top: 4px;
}
.sp2-opt-wide {
  grid-column: 1 / -1;
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

/* ── BIDDING PAGE ── */
.sp2-bid-page {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 860px;
  margin: 0 auto;
  width: 100%;
}
.sp2-bid-panel {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px;
  box-shadow: var(--shadow-panel);
}
.sp2-bid-panel h3 {
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--ink);
}
.sp2-bid-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}
.sp2-bid-number {
  display: flex;
  align-items: center;
  gap: 8px;
}
.sp2-bid-number label {
  font-size: 13px;
  color: var(--ink-mid);
}
.sp2-bid-number input {
  width: 64px;
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
  padding: 4px 6px;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--ink);
  background: var(--ivory);
}
.sp2-hand-preview {
  background: var(--felt);
  border: 1px solid var(--felt-dark);
  border-radius: 12px;
  padding: 12px;
}
.sp2-hand-preview h4 {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--ink-light);
  margin-bottom: 8px;
}
.bid-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.bid-table th {
  text-align: left;
  font-weight: 600;
  color: var(--ink-light);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  padding: 4px 8px;
  border-bottom: 1px solid var(--border);
}
.bid-table td {
  padding: 6px 8px;
  border-bottom: 1px solid var(--table-line);
  color: var(--ink-mid);
}
.bid-table td.bid-val {
  font-family: 'Playfair Display', serif;
  font-size: 16px;
  font-weight: 700;
  color: var(--ink);
}
.bid-table td.bid-pending {
  color: var(--ink-light);
  font-style: italic;
}

/* ── HAND END / GAME OVER ── */
.sp2-result-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}
.sp2-result-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
  box-shadow: var(--shadow-panel);
  text-align: center;
}
.sp2-result-card h2 {
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}
.sp2-result-table {
  margin: 16px auto;
  width: 100%;
  border-collapse: collapse;
  font-size: 15px;
}
.sp2-result-table th {
  color: var(--ink-light);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  padding: 6px;
  border-bottom: 2px solid var(--border);
}
.sp2-result-table td {
  padding: 8px 6px;
  border-bottom: 1px solid var(--table-line);
}
.sp2-result-table td.result-score {
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  font-weight: 700;
  color: var(--ink);
}
.sp2-result-table tr.winner-row td {
  background: #fefce8;
}
.winner-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  background: #fef08a;
  color: #78350f;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin-left: 6px;
}
.sp2-result-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 12px;
}

/* ── LOG PANEL ── */
.sp2-log {
  border-top: 1px solid var(--border);
  background: var(--ivory);
  padding: 10px 16px;
}
.sp2-log-title {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--ink-light);
  margin-bottom: 6px;
}
.sp2-log-body {
  max-height: 120px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.sp2-log-line {
  font-size: 12px;
  color: var(--ink-mid);
  padding: 2px 0;
  border-bottom: 1px dashed rgba(0,0,0,0.05);
}
.sp2-log-line:first-child { font-weight: 600; color: var(--ink); }
.sp2-log-line.section { color: var(--gold); font-weight: 600; font-style: italic; }

/* ── MODAL (RULES) ── */
.sp2-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(26,24,20,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 100;
  backdrop-filter: blur(3px);
}
.sp2-modal {
  width: min(820px, 96vw);
  max-height: 88vh;
  background: #fff;
  border-radius: 16px;
  border: 1px solid var(--border);
  box-shadow: 0 24px 60px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.sp2-modal-head {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--ivory);
}
.sp2-modal-head h2 {
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  font-weight: 700;
}
.sp2-modal-body {
  padding: 20px;
  overflow: auto;
  line-height: 1.6;
  font-size: 14px;
  color: var(--ink-mid);
}
.sp2-modal-body h3 {
  font-family: 'Playfair Display', serif;
  font-size: 17px;
  font-weight: 600;
  color: var(--ink);
  margin: 18px 0 8px;
}
.sp2-modal-body h3:first-child { margin-top: 0; }
.sp2-modal-body ul, .sp2-modal-body ol {
  padding-left: 20px;
  margin: 6px 0 12px;
}
.sp2-modal-body li { margin: 4px 0; }
.sp2-modal-body p { margin-bottom: 8px; }
`;

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
function Spades2({ onQuit }) {
  const [phase, setPhase] = useState("options");
  const [options, setOptions] = useState({
    mode: "partnership",
    targetScore: 300,
    allowNil: true,
    allowBlindNil: true,
    bagsPenaltyPer10: 100,
    aiStrength: 4,
    teachingMode: true,
    showAIHands: false,
  });

  const [hands, setHands] = useState([[],[],[],[]]);
  const [bids, setBids] = useState([null,null,null,null]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [trick, setTrick] = useState([]);
  const [leadSuit, setLeadSuit] = useState(null);
  const [spadesBroken, setSpadesBroken] = useState(false);
  const [dealer, setDealer] = useState(0);
  const [tricksThisHand, setTricksThisHand] = useState([]);
  const [taken, setTaken] = useState([0,0,0,0]);
  const [scores, setScores] = useState([0,0]);
  const [bags, setBags] = useState([0,0]);
  const [roundNumber, setRoundNumber] = useState(1);
  const [log, setLog] = useState([]);
  const [prevPhase, setPrevPhase] = useState(null);
  const [hintCardId, setHintCardId] = useState(null);

  const modalBodyRef = useRef(null);

  // Inject CSS once
  useEffect(() => {
    const id = "sp2-styles";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = CSS;
      document.head.appendChild(style);
    }
  }, []);

  function startHand(nextDealer = dealer) {
    const deck = shuffle(newDeck());
    const dealt = deal(deck);
    setHands(dealt);
    setBids([null,null,null,null]);
    const lead = (nextDealer + 1) & 3;
    setDealer(nextDealer);
    setCurrentPlayer(lead);
    setTrick([]);
    setLeadSuit(null);
    setSpadesBroken(false);
    setTricksThisHand([]);
    setTaken([0,0,0,0]);
    setPhase("bidding");
    setLog(l => [`— New hand ${roundNumber}. Dealer: ${NAMES[nextDealer]} —`, ...l]);
  }

  function startNewGame() {
    setScores([0,0]);
    setBags([0,0]);
    setRoundNumber(1);
    startHand(0);
  }

  // ── BIDDING AI EFFECT ──
  useEffect(() => {
    if (phase !== "bidding") return;
    const idx = currentPlayer;
    if (idx === 0) return;
    const t = setTimeout(() => {
      const bidVal = estimateTricksForBid(hands[idx], options);
      const bid = (options.allowNil && bidVal === 0)
        ? { type: "nil" }
        : { type: "number", value: Math.max(0, Math.min(13, bidVal)) };
      setBids(old => { const nb = old.slice(); nb[idx] = bid; return nb; });
      setLog(l => [`${NAMES[idx]} bids ${bid.type==="number"?bid.value:bid.type.toUpperCase()}`, ...l]);
      const next = nextPlayer(idx);
      const newBids = [...bids];
      newBids[idx] = bid;
      const done = newBids.filter(Boolean).length >= 4 || (idx === ((dealer+1)&3) - 1 + 4) % 4;
      // Check if all 4 have bid
      const allDone = newBids.every((b,i) => i===idx ? true : !!b) && idx !== 0;
      // simpler: count non-null after this one
      const countAfter = newBids.filter(Boolean).length;
      if (countAfter >= 4) {
        setPhase("play");
        setCurrentPlayer((dealer + 1) & 3);
      } else {
        setCurrentPlayer(next);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [phase, currentPlayer]); // eslint-disable-line

  function submitHumanBid(bid) {
    if (phase !== "bidding" || currentPlayer !== 0) return;
    setBids(b => { const nb = b.slice(); nb[0] = bid; return nb; });
    setLog(l => [`You bid ${bid.type==="number"?bid.value:bid.type.toUpperCase()}`, ...l]);
    setCurrentPlayer(nextPlayer(0));
  }

  // ── AI PLAY EFFECT ──
  useEffect(() => {
    if (phase !== "play") return;
    if (currentPlayer === 0) return;
    const t = setTimeout(() => {
      const state = { hands, trick, leadSuit, spadesBroken, options, bids, taken, tricksThisHand };
      const card = pickCardAI(state, currentPlayer);
      doPlayCard(currentPlayer, card);
    }, 500);
    return () => clearTimeout(t);
  }, [phase, currentPlayer, hands, trick, leadSuit, spadesBroken]); // eslint-disable-line

  function doPlayCard(idx, card) {
    const hand = hands[idx];
    const legal = legalPlays(hand, trick, leadSuit, spadesBroken);
    if (!legal.some(c => sameCard(c, card))) return;

    const newHands = hands.map((h,i) => i===idx ? h.filter(c => !sameCard(c,card)) : h);
    const newTrick = [...trick, { player:idx, card }];
    const newLead = leadSuit ?? card.suit;
    const spBroken = spadesBroken || card.suit === "S";

    setHands(newHands);
    setTrick(newTrick);
    setLeadSuit(newLead);
    if (!spadesBroken && spBroken) setSpadesBroken(true);

    if (newTrick.length < 4) {
      setCurrentPlayer(nextPlayer(idx));
    } else {
      const w = trickWinner(newTrick, newLead);
      setLog(l => [`${NAMES[w]} wins trick (${cardToText(newTrick.find(t=>t.player===w).card)})`, ...l]);
      setTricksThisHand(t => [...t, w]);
      setTaken(tk => { const nt=tk.slice(); nt[w]+=1; return nt; });
      setTimeout(() => {
        setTrick([]);
        setLeadSuit(null);
        setCurrentPlayer(w);
        if (newHands.every(h=>h.length===0)) doScoreHand();
      }, 600);
    }
  }

  function handleHumanPlay(card) {
    if (phase !== "play" || currentPlayer !== 0) return;
    doPlayCard(0, card);
    setHintCardId(null);
  }

  function doScoreHand() {
    setTaken(takenSnap => {
      setBids(bidsSnap => {
        const teamTricks = [0,0];
        for (let i=0;i<4;i++) teamTricks[teamIndex(i)] += takenSnap[i];
        const teamBids = [0,0];
        const nilFlags = [false,false,false,false];
        const blindFlags = [false,false,false,false];
        for (let i=0;i<4;i++) {
          const b = bidsSnap[i];
          if (b?.type==="number") teamBids[teamIndex(i)] += b.value;
          if (b?.type==="nil") nilFlags[i]=true;
          if (b?.type==="blindnil") { nilFlags[i]=true; blindFlags[i]=true; }
        }
        let delta = [0,0];
        setBags(bagsOld => {
          let newBags = bagsOld.slice();
          for (let t=0;t<2;t++) {
            if (teamBids[t]>0) {
              if (teamTricks[t] >= teamBids[t]) {
                delta[t] += teamBids[t]*10;
                const over = teamTricks[t] - teamBids[t];
                newBags[t] += over;
                delta[t] += over;
              } else {
                delta[t] -= teamBids[t]*10;
              }
            }
          }
          for (let i=0;i<4;i++) {
            if (!nilFlags[i]) continue;
            const took = takenSnap[i];
            const team = teamIndex(i);
            const val = blindFlags[i] ? 200 : 100;
            if (took===0) delta[team]+=val; else delta[team]-=val;
          }
          for (let t=0;t<2;t++) {
            while (newBags[t] >= 10) {
              newBags[t] -= 10;
              delta[t] -= options.bagsPenaltyPer10;
            }
          }
          setScores(old => {
            const ns = [old[0]+delta[0], old[1]+delta[1]];
            setLog(l => [
              `— Scored: NS ${delta[0]>0?'+':''}${delta[0]} | WE ${delta[1]>0?'+':''}${delta[1]} —`,
              `Tricks: NS ${teamTricks[0]}/${teamBids[0]} WE ${teamTricks[1]}/${teamBids[1]}`,
              ...l
            ]);
            const target = options.targetScore;
            if (Math.max(...ns) >= target) { setPhase("game_over"); }
            else { setPhase("hand_end"); }
            return ns;
          });
          return newBags;
        });
        return bidsSnap;
      });
      return takenSnap;
    });
  }

  function getHint() {
    const state = { hands, trick, leadSuit, spadesBroken, options, bids, taken, tricksThisHand };
    const card = pickCardAI(state, 0);
    setHintCardId(card?.id ?? null);
    return card;
  }

  const teachingLegal = useMemo(() => {
    if (!options.teachingMode || phase!=="play" || currentPlayer!==0) return [];
    return legalPlays(hands[0], trick, leadSuit, spadesBroken).map(c=>c.id);
  }, [options.teachingMode, phase, currentPlayer, hands, trick, leadSuit, spadesBroken]);

  const hintCard = useMemo(() => {
    if (!hintCardId) return null;
    return hands[0].find(c => c.id === hintCardId) ?? null;
  }, [hintCardId, hands]);

  const teamBids = [0,0];
  bids.forEach((b,i) => { if (b?.type==="number") teamBids[teamIndex(i)] += b.value; });

  const strengthLabels = ["","Novice","Easy","Casual","Moderate","Balanced","Tactical","Strong","Expert"];

  /* ── SUBCOMPONENTS ── */

  function PlayingCard({ card, faceUp=true, playable=false, legalHint=false, isHint=false, onClick }) {
    const cls = [
      "sp2-card",
      faceUp ? ((card.suit==="H"||card.suit==="D") ? "red-suit" : "black-suit") : "card-back",
      playable ? "playable" : "",
      legalHint ? "legal-hint" : "",
      isHint ? "highlight-pulse" : "",
    ].filter(Boolean).join(" ");

    return (
      <div className={cls} onClick={onClick} title={faceUp?cardToText(card):undefined}>
        {faceUp ? (<>
          <div className="c-rank">{card.rank}</div>
          <div className="c-suit">{SUIT_SYMBOL[card.suit]}</div>
        </>) : null}
      </div>
    );
  }

  function AIPlayerPanel({ idx }) {
    const h = hands[idx];
    const b = bids[idx];
    const isTurn = currentPlayer === idx && phase === "play";
    const tricksTaken = taken[idx];
    const bidVal = b?.type==="number" ? b.value : b?.type ?? "—";
    const made = b?.type==="number" && tricksTaken >= b.value;
    const areaNames = { 1:"west", 2:"north", 3:"east" };
    const showCards = options.showAIHands && options.teachingMode;

    return (
      <div
        className={`sp2-player sp2-seat-${areaNames[idx]} ${isTurn?"is-turn":""}`}
        style={{ gridArea: areaNames[idx] }}
      >
        <div className="sp2-player-header">
          <div className="sp2-player-name">
            {isTurn && "▶ "}{NAMES[idx]}
            {idx===PARTNER[0] && <span style={{fontSize:10,color:"var(--gold)",marginLeft:4}}>partner</span>}
          </div>
          {b && (
            <div className={`sp2-player-bid ${b.type==="nil"||b.type==="blindnil"?"nil":""} ${made?"made":""}`}>
              {b.type==="number" ? `Bid ${b.value} · Got ${tricksTaken}` : b.type.toUpperCase()}
            </div>
          )}
        </div>
        <div className="sp2-cards-row">
          {showCards
            ? h.map(card => <PlayingCard key={card.id} card={card} faceUp={true} />)
            : h.map(card => <PlayingCard key={card.id} card={card} faceUp={false} />)
          }
        </div>
      </div>
    );
  }

  function TrickArea() {
    const SEAT = { 0:"south", 1:"west", 2:"north", 3:"east" };
    const byPlayer = {};
    for (const t of trick) byPlayer[t.player] = t.card;
    const slots = [2,1,3,0]; // north, west, east, south order in grid
    return (
      <div className="sp2-trick-area">
        {[0,1,2,3].map(idx => (
          <div key={idx} className={`trick-cell tc-${SEAT[idx]}`}>
            {byPlayer[idx]
              ? <>
                  <PlayingCard card={byPlayer[idx]} faceUp={true} />
                  <div className="trick-player-label">{NAMES[idx]}</div>
                </>
              : null
            }
          </div>
        ))}
        {trick.length === 0 && (
          <div className="trick-waiting">
            {phase==="play" ? `Waiting for ${NAMES[currentPlayer]}…` : ""}
          </div>
        )}
      </div>
    );
  }

  function ScoreBar() {
    return (
      <div className="sp2-scorebar">
        <div className="score-team">
          <div className="score-label">NS</div>
          <div className="score-value">{scores[0]}</div>
          <div className="score-bags">({bags[0]} bags)</div>
        </div>
        <div className="score-divider" />
        <div style={{fontSize:12,color:"var(--ink-light)",alignSelf:"center"}}>
          First to {options.targetScore}
        </div>
        <div className="score-divider" />
        <div className="score-team">
          <div className="score-label">WE</div>
          <div className="score-value">{scores[1]}</div>
          <div className="score-bags">({bags[1]} bags)</div>
        </div>
      </div>
    );
  }

  function LogPanel() {
    return (
      <div className="sp2-log">
        <div className="sp2-log-title">Game Log</div>
        <div className="sp2-log-body">
          {log.map((line, i) => (
            <div key={i} className={`sp2-log-line ${line.startsWith("—")?"section":""}`}>{line}</div>
          ))}
        </div>
      </div>
    );
  }

  function RulesModal({ onClose }) {
    return (
      <div className="sp2-modal-overlay" onClick={onClose}>
        <div className="sp2-modal" onClick={e=>e.stopPropagation()}>
          <div className="sp2-modal-head">
            <h2>♠ Rules & Strategy Guide</h2>
            <div style={{display:"flex",gap:8}}>
              <button className="btn2 btn2-primary" onClick={onClose}>Close</button>
            </div>
          </div>
          <div className="sp2-modal-body" ref={modalBodyRef}>
            <h3>Objective</h3>
            <p>Win tricks to meet (but not greatly exceed) your team's bid. Spades are always trump.</p>
            <h3>Setup</h3>
            <ul>
              <li>4 players. <b>Partnership</b>: South+North vs West+East. <b>Solo</b>: each player for themselves.</li>
              <li>52 cards, 13 per player. ♠ Spades are always trump.</li>
            </ul>
            <h3>Bidding</h3>
            <ul>
              <li>Each player bids the number of tricks they expect to win (0–13). In partnership, bids are summed.</li>
              <li><b>Nil (0)</b>: Aim to take no tricks. +100 if successful, −100 if not.</li>
              <li><b>Blind Nil</b>: Bid Nil without seeing your hand. ±200 points.</li>
            </ul>
            <h3>Play</h3>
            <ul>
              <li>Left of dealer leads the first trick. You must follow suit if able.</li>
              <li>Spades cannot be led until "broken" (a player discards a spade), unless you hold only spades.</li>
              <li>Trick winner: highest spade if any spades played; otherwise highest card of the led suit.</li>
            </ul>
            <h3>Scoring</h3>
            <ul>
              <li>Make your bid: +10 × bid. Overtricks (bags): +1 each.</li>
              <li>Fail bid: −10 × bid.</li>
              <li>Every 10 accumulated bags costs −{options.bagsPenaltyPer10} points.</li>
            </ul>
            <h3>Teaching Mode</h3>
            <ul>
              <li>Blue outlines show your legal cards. The <b>Hint</b> button suggests the best card using the AI heuristic.</li>
              <li>"Reveal AI Hands" lets you see all cards for practice and study.</li>
            </ul>
            <h3>Strategy Tips</h3>
            <ol>
              <li>Count spades played — know when trump is exhausted.</li>
              <li>Lead short side suits to create trump opportunities.</li>
              <li>Protect a partner's Nil by overtaking dangerous tricks.</li>
              <li>Avoid unnecessary overtricks once your bid is made.</li>
              <li>Higher AI strength means more aggressive, greedier AI opponents.</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  function openRules() {
    setPrevPhase(phase);
    setPhase("rules");
  }
  function closeRules() {
    setPhase(prevPhase ?? "play");
    setPrevPhase(null);
  }

  /* ── RENDER PHASES ── */

  if (phase === "options") {
    return (
      <div className="sp2-root">
        <div className="sp2-topbar">
          <div className="sp2-logo">
            <div className="sp2-logo-icon">♠</div>
            <div>
              <h1>Spades</h1>
              <span>Claude Edition</span>
            </div>
          </div>
          <div className="sp2-topbar-actions">
            <button className="btn2" onClick={openRules}>Rules</button>
            <button className="btn2" onClick={() => onQuit ? onQuit() : window.history.back()}>Quit</button>
          </div>
        </div>

        <div className="sp2-options-page">
          <div className="sp2-options-hero">
            <h2>♠ New Game</h2>
            <p>Configure your game and deal the cards.</p>
          </div>

          <div className="sp2-options-grid">
            <div className="sp2-opt-card">
              <h4>Game Mode</h4>
              <label>
                <input type="radio" name="mode" checked={options.mode==="partnership"}
                  onChange={()=>setOptions(o=>({...o,mode:"partnership"}))}/>
                Partnership (2 vs 2)
              </label>
              <label>
                <input type="radio" name="mode" checked={options.mode==="solo"}
                  onChange={()=>setOptions(o=>({...o,mode:"solo"}))}/>
                Solo / Cutthroat
              </label>
            </div>

            <div className="sp2-opt-card">
              <h4>Target Score</h4>
              <select value={options.targetScore} onChange={e=>setOptions(o=>({...o,targetScore:Number(e.target.value)}))}>
                <option value={200}>200 points</option>
                <option value={300}>300 points</option>
                <option value={500}>500 points</option>
              </select>
            </div>

            <div className="sp2-opt-card">
              <h4>AI Strength</h4>
              <div className="strength-row">
                <div style={{fontSize:13,color:"var(--ink-mid)"}}>Level</div>
                <div className="strength-label">{options.aiStrength}</div>
              </div>
              <input type="range" min="1" max="8" value={options.aiStrength}
                onChange={e=>setOptions(o=>({...o,aiStrength:Number(e.target.value)}))}/>
              <div className="strength-desc">{strengthLabels[options.aiStrength]}</div>
            </div>

            <div className="sp2-opt-card">
              <h4>Special Bids</h4>
              <label>
                <input type="checkbox" checked={options.allowNil}
                  onChange={e=>setOptions(o=>({...o,allowNil:e.target.checked}))}/>
                Allow Nil (±100)
              </label>
              <label>
                <input type="checkbox" checked={options.allowBlindNil}
                  onChange={e=>setOptions(o=>({...o,allowBlindNil:e.target.checked}))}/>
                Allow Blind Nil (±200)
              </label>
              <div style={{marginTop:10,fontSize:13,color:"var(--ink-mid)"}}>Bags penalty per 10:</div>
              <input type="number" min="0" step="10" value={options.bagsPenaltyPer10}
                onChange={e=>setOptions(o=>({...o,bagsPenaltyPer10:Number(e.target.value||0)}))}/>
            </div>

            <div className="sp2-opt-card">
              <h4>Teaching & Display</h4>
              <label>
                <input type="checkbox" checked={options.teachingMode}
                  onChange={e=>setOptions(o=>({...o,teachingMode:e.target.checked}))}/>
                Teaching Mode (hints + highlights)
              </label>
              <label>
                <input type="checkbox" checked={options.showAIHands}
                  onChange={e=>setOptions(o=>({...o,showAIHands:e.target.checked}))}/>
                Reveal AI Hands (practice)
              </label>
            </div>

            <div className="sp2-opt-card sp2-opt-wide">
              <h4 style={{marginBottom:0,border:"none",paddingBottom:0}}>Ready to play?</h4>
              <button className="btn2 btn2-primary" style={{fontSize:15,padding:"10px 24px"}} onClick={startNewGame}>
                Deal Cards ♠
              </button>
              <button className="btn2" onClick={openRules}>Read Rules</button>
            </div>
          </div>
        </div>

        {phase === "rules" && <RulesModal onClose={closeRules}/>}
      </div>
    );
  }

  if (phase === "bidding") {
    const myBid = bids[0];
    const pendingAI = bids.slice(1).filter(b=>!b).length;
    const suggestedBid = estimateTricksForBid(hands[0], options);

    return (
      <div className="sp2-root">
        <div className="sp2-topbar">
          <div className="sp2-logo">
            <div className="sp2-logo-icon">♠</div>
            <div><h1>Spades</h1><span>Bidding</span></div>
          </div>
          <div className="sp2-topbar-actions">
            <button className="btn2" onClick={openRules}>Rules</button>
            <button className="btn2" onClick={() => onQuit ? onQuit() : window.history.back()}>Quit</button>
          </div>
        </div>

        <ScoreBar />

        <div className="sp2-bid-page">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div className="sp2-bid-panel">
              <h3>Your Bid</h3>
              {myBid ? (
                <div style={{fontSize:15,color:"var(--green-win)",fontWeight:600}}>
                  ✓ Bid placed: <span style={{fontFamily:"Playfair Display,serif",fontSize:20}}>
                    {myBid.type==="number" ? myBid.value : myBid.type.toUpperCase()}
                  </span>
                </div>
              ) : (
                <>
                  <div className="sp2-bid-controls">
                    {options.allowNil && (
                      <button className="btn2" onClick={()=>submitHumanBid({type:"nil"})}>Nil (0)</button>
                    )}
                    {options.allowBlindNil && (
                      <button className="btn2" onClick={()=>submitHumanBid({type:"blindnil"})}>Blind Nil</button>
                    )}
                    <div className="sp2-bid-number">
                      <label>Tricks:</label>
                      <input id="bid-input" type="number" min="0" max="13" defaultValue={suggestedBid}/>
                      <button className="btn2 btn2-primary" onClick={()=>{
                        const v = Number(document.getElementById("bid-input")?.value ?? suggestedBid);
                        submitHumanBid({type:"number", value: Math.max(0,Math.min(13,v))});
                      }}>Bid</button>
                    </div>
                  </div>
                  {options.teachingMode && (
                    <div style={{marginTop:10,fontSize:12,color:"var(--ink-light)"}}>
                      Suggested: <b style={{color:"var(--accent)"}}>{suggestedBid}</b>
                      {suggestedBid===0 && options.allowNil ? " (consider Nil)" : ""}
                    </div>
                  )}
                </>
              )}
              {pendingAI > 0 && (
                <div style={{marginTop:8,fontSize:12,color:"var(--ink-light)",fontStyle:"italic"}}>
                  Waiting for {pendingAI} AI player{pendingAI>1?"s":""} to bid…
                </div>
              )}
            </div>

            <div className="sp2-bid-panel">
              <h3>Bids This Hand</h3>
              <table className="bid-table">
                <thead><tr><th>Player</th><th>Bid</th><th>Partner</th></tr></thead>
                <tbody>
                  {[0,1,2,3].map(i => (
                    <tr key={i}>
                      <td>{NAMES[i]}{i===0?" (You)":""}</td>
                      <td className={bids[i] ? "bid-val" : "bid-pending"}>
                        {bids[i]
                          ? (bids[i].type==="number" ? bids[i].value : bids[i].type.toUpperCase())
                          : "…"}
                      </td>
                      <td style={{fontSize:11,color:"var(--ink-light)"}}>{NAMES[PARTNER[i]]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="sp2-hand-preview">
            <h4>Your Hand</h4>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {hands[0].map(card => (
                <PlayingCard key={card.id} card={card} faceUp={true} />
              ))}
            </div>
          </div>
        </div>

        <LogPanel />
        {phase === "rules" && <RulesModal onClose={closeRules}/>}
      </div>
    );
  }

  if (phase === "play" || phase === "rules") {
    const myBid = bids[0];
    const myTaken = taken[0];

    return (
      <div className="sp2-root">
        <div className="sp2-topbar">
          <div className="sp2-logo">
            <div className="sp2-logo-icon">♠</div>
            <div><h1>Spades</h1><span>Round {roundNumber}</span></div>
          </div>
          <div className="sp2-topbar-actions">
            {options.teachingMode && currentPlayer===0 && (
              <button className="btn2 btn2-gold" onClick={getHint}>Hint ✦</button>
            )}
            <button className="btn2" onClick={openRules}>Rules</button>
            <button className="btn2" onClick={() => onQuit ? onQuit() : window.history.back()}>Quit</button>
          </div>
        </div>

        <ScoreBar />

        <div className="sp2-status">
          <div>Dealer: <strong>{NAMES[dealer]}</strong></div>
          <div className="status-pip"/>
          <div>Turn: <strong>{NAMES[currentPlayer]}</strong></div>
          <div className="status-pip"/>
          <div>♠ Broken: <strong>{spadesBroken ? "Yes" : "No"}</strong></div>
          <div className="status-pip"/>
          <div>Mode: <strong>{options.mode==="partnership"?"Partnership":"Solo"}</strong></div>
        </div>

        <div className="sp2-table">
          <AIPlayerPanel idx={2} />
          <AIPlayerPanel idx={1} />
          <AIPlayerPanel idx={3} />

          <div className="sp2-center">
            <TrickArea />

            <div className="sp2-info-row">
              <div className="sp2-info-box">
                <div className="sp2-info-box-title">NS Bid / Taken</div>
                <div className="sp2-info-val">{teamBids[0]} / {taken[0]+taken[2]}</div>
              </div>
              <div className="sp2-info-box">
                <div className="sp2-info-box-title">WE Bid / Taken</div>
                <div className="sp2-info-val">{teamBids[1]} / {taken[1]+taken[3]}</div>
              </div>
              <div className="sp2-info-box">
                <div className="sp2-info-box-title">Your Bid / Got</div>
                <div className="sp2-info-val">
                  {myBid?.type==="number" ? myBid.value : (myBid?.type?.toUpperCase() ?? "—")} / {myTaken}
                </div>
              </div>
            </div>

            {options.teachingMode && hintCard && currentPlayer===0 && (
              <div className="sp2-hint-row">
                <span style={{fontSize:16}}>✦</span>
                <span className="hint-suggest">
                  Hint: play <span className="hint-card-name">{cardToText(hintCard)}</span>
                </span>
                <button className="btn2" style={{marginLeft:"auto",fontSize:11}} onClick={()=>setHintCardId(null)}>Dismiss</button>
              </div>
            )}
          </div>

          <div className="sp2-seat-south sp2-your-hand">
            <div className="sp2-player-header">
              <div className="sp2-player-name">
                {currentPlayer===0 && phase==="play" ? "▶ " : ""}
                {NAMES[0]} (South)
                {currentPlayer===0 && phase==="play"
                  ? <span style={{fontSize:11,color:"var(--gold)",marginLeft:6,fontWeight:400}}>your turn</span>
                  : ""}
              </div>
              {myBid && (
                <div className={`sp2-player-bid ${myBid.type==="nil"||myBid.type==="blindnil"?"nil":""}
                  ${myBid.type==="number" && myTaken>=myBid.value ? "made" : ""}`}>
                  {myBid.type==="number" ? `Bid ${myBid.value} · Got ${myTaken}` : myBid.type.toUpperCase()}
                </div>
              )}
            </div>
            <div className="sp2-your-cards">
              {hands[0].map(card => (
                <PlayingCard
                  key={card.id}
                  card={card}
                  faceUp={true}
                  playable={currentPlayer===0 && phase==="play"}
                  legalHint={teachingLegal.includes(card.id)}
                  isHint={card.id === hintCardId}
                  onClick={()=>handleHumanPlay(card)}
                />
              ))}
            </div>
          </div>
        </div>

        <LogPanel />
        {phase === "rules" && <RulesModal onClose={closeRules}/>}
      </div>
    );
  }

  if (phase === "hand_end") {
    const nsTeamTricks = taken[0]+taken[2];
    const weTeamTricks = taken[1]+taken[3];
    return (
      <div className="sp2-root">
        <div className="sp2-topbar">
          <div className="sp2-logo">
            <div className="sp2-logo-icon">♠</div>
            <div><h1>Spades</h1><span>Hand {roundNumber} Results</span></div>
          </div>
          <div className="sp2-topbar-actions">
            <button className="btn2" onClick={openRules}>Rules</button>
            <button className="btn2" onClick={() => onQuit ? onQuit() : window.history.back()}>Quit</button>
          </div>
        </div>
        <ScoreBar />
        <div className="sp2-result-page">
          <div className="sp2-result-card">
            <h2>Hand {roundNumber} Complete</h2>
            <table className="sp2-result-table">
              <thead>
                <tr><th>Team</th><th>Bid</th><th>Tricks</th><th>Score</th><th>Bags</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>NS</b> (You + North)</td>
                  <td>{teamBids[0]}</td>
                  <td>{nsTeamTricks}</td>
                  <td className="result-score">{scores[0]}</td>
                  <td>{bags[0]}</td>
                </tr>
                <tr>
                  <td><b>WE</b> (West + East)</td>
                  <td>{teamBids[1]}</td>
                  <td>{weTeamTricks}</td>
                  <td className="result-score">{scores[1]}</td>
                  <td>{bags[1]}</td>
                </tr>
              </tbody>
            </table>
            <div className="sp2-result-actions">
              <button className="btn2 btn2-primary" onClick={()=>{
                setRoundNumber(r=>r+1);
                startHand((dealer+1)&3);
              }}>Next Hand ♠</button>
              <button className="btn2" onClick={openRules}>Rules</button>
            </div>
          </div>
        </div>
        <LogPanel />
        {phase === "rules" && <RulesModal onClose={closeRules}/>}
      </div>
    );
  }

  if (phase === "game_over") {
    const winner = scores[0] === scores[1] ? "Tie" : (scores[0] > scores[1] ? "NS" : "WE");
    const youWon = winner === "NS";
    return (
      <div className="sp2-root">
        <div className="sp2-topbar">
          <div className="sp2-logo">
            <div className="sp2-logo-icon">♠</div>
            <div><h1>Spades</h1><span>Game Over</span></div>
          </div>
          <div className="sp2-topbar-actions">
            <button className="btn2" onClick={() => onQuit ? onQuit() : window.history.back()}>Quit</button>
          </div>
        </div>
        <ScoreBar />
        <div className="sp2-result-page">
          <div className="sp2-result-card">
            <div style={{fontSize:40,marginBottom:8}}>{youWon ? "🏆" : scores[0]===scores[1] ? "🤝" : "♠"}</div>
            <h2>{youWon ? "Victory!" : winner==="Tie" ? "It's a Tie" : "Defeat"}</h2>
            <p style={{color:"var(--ink-light)",fontSize:14,marginTop:4}}>
              {youWon ? "NS wins the game!" : winner==="Tie" ? "Both teams finish equal." : "WE wins the game."}
            </p>
            <table className="sp2-result-table">
              <thead>
                <tr><th>Team</th><th>Final Score</th><th>Bags</th></tr>
              </thead>
              <tbody>
                <tr className={winner==="NS"?"winner-row":""}>
                  <td><b>NS</b> (You + North) {winner==="NS" && <span className="winner-badge">WINNER</span>}</td>
                  <td className="result-score">{scores[0]}</td>
                  <td>{bags[0]}</td>
                </tr>
                <tr className={winner==="WE"?"winner-row":""}>
                  <td><b>WE</b> (West + East) {winner==="WE" && <span className="winner-badge">WINNER</span>}</td>
                  <td className="result-score">{scores[1]}</td>
                  <td>{bags[1]}</td>
                </tr>
              </tbody>
            </table>
            <div className="sp2-result-actions">
              <button className="btn2 btn2-primary" onClick={()=>setPhase("options")}>New Game</button>
              <button className="btn2" onClick={openRules}>Rules</button>
            </div>
          </div>
        </div>
        <LogPanel />
        {phase === "rules" && <RulesModal onClose={closeRules}/>}
      </div>
    );
  }

  return null;

  function PlayingCard({ card, faceUp=true, playable=false, legalHint=false, isHint=false, onClick }) {
    const cls = [
      "sp2-card",
      faceUp ? ((card.suit==="H"||card.suit==="D") ? "red-suit" : "black-suit") : "card-back",
      playable ? "playable" : "",
      legalHint ? "legal-hint" : "",
      isHint ? "highlight-pulse" : "",
    ].filter(Boolean).join(" ");
    return (
      <div className={cls} onClick={onClick}>
        {faceUp ? (<><div className="c-rank">{card.rank}</div><div className="c-suit">{SUIT_SYMBOL[card.suit]}</div></>) : null}
      </div>
    );
  }
}

export default Spades2;
