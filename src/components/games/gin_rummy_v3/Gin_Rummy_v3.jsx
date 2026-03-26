import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";

// ============================================================
//  GIN RUMMY v3 — Claude House Edition
//  Light felt-green + cream card aesthetic, no external deps
// ============================================================

// ── Inline styles ─────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');

:root {
  --felt:   #2d5a3d;
  --felt2:  #234831;
  --felt3:  #1a3626;
  --cream:  #faf6ee;
  --cream2: #f2ead8;
  --ink:    #1a1a18;
  --muted:  #5a5a50;
  --red:    #c0392b;
  --gold:   #c9a84c;
  --gold2:  #f0d070;
  --blue:   #2c5f8a;
  --shadow: 0 4px 20px rgba(0,0,0,0.22);
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.14);
  --r: 12px;
  --card-w: 62px;
  --card-h: 90px;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: var(--felt3);
  color: var(--cream);
  font-family: 'DM Sans', sans-serif;
  min-height: 100vh;
}

/* ── App Shell ── */
.gr3 {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(ellipse at 20% 20%, rgba(255,255,255,0.04) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 80%, rgba(0,0,0,0.15) 0%, transparent 60%),
    repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(255,255,255,0.012) 60px, rgba(255,255,255,0.012) 61px),
    repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(255,255,255,0.012) 60px, rgba(255,255,255,0.012) 61px),
    var(--felt2);
}

/* ── Header ── */
.gr3-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: var(--felt3);
  border-bottom: 1px solid rgba(201,168,76,0.3);
  box-shadow: 0 2px 12px rgba(0,0,0,0.3);
  position: sticky; top: 0; z-index: 100;
  gap: 12px;
}
.gr3-logo {
  font-family: 'Playfair Display', serif;
  font-size: 22px;
  color: var(--gold2);
  letter-spacing: .03em;
  white-space: nowrap;
  flex-shrink: 0;
}
.gr3-logo span { color: var(--cream); font-size: 13px; display: block; font-family: 'DM Sans', sans-serif; font-weight: 500; letter-spacing: .12em; text-transform: uppercase; opacity: .7; }
.gr3-scores {
  display: flex; align-items: center; gap: 18px;
  background: rgba(0,0,0,0.25); border: 1px solid rgba(201,168,76,0.25);
  border-radius: 999px; padding: 6px 18px;
}
.gr3-score-item { text-align: center; }
.gr3-score-item .label { font-size: 10px; text-transform: uppercase; letter-spacing: .12em; opacity: .6; }
.gr3-score-item .val { font-family: 'Playfair Display', serif; font-size: 20px; color: var(--gold2); line-height: 1; }
.gr3-score-sep { width: 1px; height: 32px; background: rgba(201,168,76,0.3); }
.gr3-hbtns { display: flex; gap: 8px; flex-shrink: 0; }

/* ── Buttons ── */
.btn {
  padding: 8px 14px; border-radius: 8px; font-family: 'DM Sans', sans-serif;
  font-weight: 600; font-size: 13px; cursor: pointer; border: none;
  transition: filter .12s ease, transform .06s ease, box-shadow .12s ease;
  white-space: nowrap;
}
.btn:active { transform: translateY(1px); }
.btn:disabled { opacity: .4; cursor: not-allowed; }
.btn-ghost { background: transparent; border: 1px solid rgba(250,246,238,0.25); color: var(--cream); }
.btn-ghost:hover:not(:disabled) { background: rgba(255,255,255,0.08); }
.btn-gold { background: linear-gradient(135deg, var(--gold), #a07820); color: #1a1200; }
.btn-gold:hover:not(:disabled) { filter: brightness(1.1); box-shadow: 0 0 14px rgba(201,168,76,0.4); }
.btn-action { background: var(--cream2); color: var(--ink); }
.btn-action:hover:not(:disabled) { filter: brightness(1.05); box-shadow: var(--shadow-sm); }
.btn-danger { background: rgba(192,57,43,0.15); border: 1px solid rgba(192,57,43,0.4); color: #ff8a80; }
.btn-danger:hover:not(:disabled) { background: rgba(192,57,43,0.25); }
.btn-knock { background: linear-gradient(135deg, #2c5f8a, #1a3c5a); color: #a8d4ff; border: 1px solid rgba(168,212,255,0.3); }
.btn-knock:hover:not(:disabled) { filter: brightness(1.1); box-shadow: 0 0 14px rgba(44,95,138,0.5); }
.btn-gin { background: linear-gradient(135deg, #8b1a1a, #c0392b); color: #ffd5cc; border: 1px solid rgba(255,140,120,0.3); }
.btn-gin:hover:not(:disabled) { filter: brightness(1.1); box-shadow: 0 0 14px rgba(192,57,43,0.5); }

/* ── Action Bar ── */
.gr3-action-bar {
  display: flex; flex-wrap: wrap; gap: 8px; align-items: center;
  padding: 10px 20px;
  background: rgba(0,0,0,0.2);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.gr3-action-bar .sep { width: 1px; height: 28px; background: rgba(255,255,255,0.12); margin: 0 2px; }

/* ── Board ── */
.gr3-board {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 220px 1fr;
  gap: 16px;
  padding: 16px 20px;
  max-width: 1300px;
  margin: 0 auto;
  width: 100%;
}

/* ── Panel ── */
.panel {
  background: rgba(0,0,0,0.2);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: var(--r);
  padding: 14px;
  display: flex; flex-direction: column; gap: 12px;
}
.panel-title {
  font-family: 'Playfair Display', serif;
  font-size: 16px; color: var(--gold2);
  border-bottom: 1px solid rgba(201,168,76,0.2);
  padding-bottom: 8px;
}
.deadwood-badge {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 999px; padding: 4px 12px; font-size: 13px; font-weight: 600;
}
.deadwood-badge .dw-num { color: var(--gold2); font-family: 'Playfair Display', serif; font-size: 18px; }

/* ── Hand ── */
.hand-area {
  display: flex; flex-wrap: wrap; gap: 6px;
  background: rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.07);
  border-radius: 10px; padding: 10px; min-height: calc(var(--card-h) + 20px);
}

/* ── Cards ── */
.card {
  width: var(--card-w); height: var(--card-h);
  background: var(--cream);
  border: 1.5px solid #d4c9a8;
  border-radius: 8px;
  display: flex; flex-direction: column; align-items: center; justify-content: space-between;
  padding: 5px 4px;
  cursor: pointer; user-select: none;
  color: var(--ink);
  position: relative;
  transition: transform .1s ease, box-shadow .1s ease, border-color .1s ease;
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
}
.card:hover { transform: translateY(-4px); box-shadow: 0 8px 20px rgba(0,0,0,0.3); }
.card.selected {
  border-color: var(--gold); background: #fffbee;
  transform: translateY(-8px);
  box-shadow: 0 10px 24px rgba(201,168,76,0.4);
}
.card.selected::after {
  content: '';
  position: absolute; inset: -3px;
  border-radius: 10px;
  border: 2px solid var(--gold);
  pointer-events: none;
}
.card-corner { font-size: 12px; font-weight: 700; line-height: 1; text-align: center; }
.card-corner .c-suit { font-size: 10px; }
.card-center { font-size: 22px; line-height: 1; }
.card.red-card { color: var(--red); border-color: #f0c0b0; }
.card.joker-card { background: linear-gradient(135deg, #fffde7, #fff8e1); border-color: var(--gold); }
.card.back {
  background: linear-gradient(135deg, #1e4060, #0d2440);
  border-color: #2a5580;
  cursor: default;
}
.card.back::after {
  content: '';
  position: absolute; inset: 6px;
  border-radius: 4px;
  border: 1px solid rgba(100,160,220,0.3);
  background:
    repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0, rgba(255,255,255,0.04) 2px, transparent 0, transparent 50%),
    transparent;
  background-size: 8px 8px;
}
.card.back:hover { transform: none; box-shadow: var(--shadow-sm); }
.card.big { width: calc(var(--card-w)*1.25); height: calc(var(--card-h)*1.25); }
.card.big .card-corner { font-size: 14px; }
.card.big .card-center { font-size: 28px; }
.card.tiny { width: 44px; height: 62px; }
.card.tiny .card-corner { font-size: 10px; }
.card.tiny .card-center { font-size: 16px; }
.card.empty-pile {
  background: rgba(0,0,0,0.15); border: 2px dashed rgba(255,255,255,0.15);
  cursor: default; color: rgba(255,255,255,0.3); font-size: 12px;
  display: flex; align-items: center; justify-content: center;
}
.card.empty-pile:hover { transform: none; box-shadow: none; }

/* ── Center Column ── */
.center-col { display: flex; flex-direction: column; gap: 14px; }
.piles-row { display: flex; gap: 12px; justify-content: center; }
.pile-wrap { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.pile-label { font-size: 11px; text-transform: uppercase; letter-spacing: .1em; opacity: .6; }
.pile-count { font-size: 11px; opacity: .5; }

.msg-box {
  background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px; padding: 10px 12px;
  font-size: 13px; line-height: 1.5; color: var(--cream2);
  min-height: 52px;
}
.msg-box strong { color: var(--gold2); }

/* ── Melds ── */
.melds-section { display: flex; flex-direction: column; gap: 8px; }
.melds-section h4 { font-size: 12px; text-transform: uppercase; letter-spacing: .1em; opacity: .55; }
.meld-row {
  display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
  background: rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.07);
  border-radius: 8px; padding: 6px 8px;
}
.meld-tag {
  font-size: 10px; text-transform: uppercase; letter-spacing: .08em;
  background: rgba(201,168,76,0.15); border: 1px solid rgba(201,168,76,0.3);
  color: var(--gold2); border-radius: 4px; padding: 2px 6px; flex-shrink: 0;
}
.meld-undo { margin-left: auto; }

/* ── Modal ── */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(8,18,14,0.75);
  display: flex; align-items: center; justify-content: center;
  z-index: 200; padding: 20px;
  backdrop-filter: blur(4px);
}
.modal-box {
  background: var(--cream);
  color: var(--ink);
  border-radius: 16px;
  width: min(640px, 100%);
  max-height: 88vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  display: flex; flex-direction: column;
}
.modal-box.wide { width: min(820px, 100%); }
.modal-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e8e0cc;
  background: linear-gradient(135deg, #f8f4ea, #f0e8d0);
}
.modal-header h2 {
  font-family: 'Playfair Display', serif;
  font-size: 22px; color: var(--felt3);
}
.modal-header p { font-size: 13px; color: #666; margin-top: 4px; }
.modal-body { padding: 20px 24px; overflow-y: auto; flex: 1; }
.modal-footer { padding: 16px 24px; border-top: 1px solid #e8e0cc; display: flex; gap: 10px; justify-content: flex-end; }
.modal-footer .btn-felt { background: var(--felt2); color: var(--cream); }
.modal-footer .btn-felt:hover { background: var(--felt3); }

/* Modal form */
.form-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; }
.form-field { display: flex; flex-direction: column; gap: 5px; }
.form-field label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .08em; color: #444; }
.form-field input, .form-field select {
  padding: 8px 10px; border: 1px solid #d4c9a8; border-radius: 8px;
  font-family: 'DM Sans', sans-serif; font-size: 14px; background: #faf6ee;
  color: var(--ink);
}
.form-field input:focus, .form-field select:focus { outline: 2px solid var(--felt); border-color: var(--felt); }

/* Round end */
.round-result { text-align: center; padding: 12px 0; }
.round-result .big-msg {
  font-family: 'Playfair Display', serif;
  font-size: 28px; color: var(--felt3); margin-bottom: 10px;
}
.score-table { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 14px 0; }
.score-cell {
  background: #f0e8d0; border-radius: 10px; padding: 12px;
  text-align: center;
}
.score-cell .who { font-size: 12px; text-transform: uppercase; letter-spacing: .1em; color: #666; }
.score-cell .pts { font-family: 'Playfair Display', serif; font-size: 32px; color: var(--felt3); line-height: 1.1; }

/* Rules */
.rules-body h3 { font-family: 'Playfair Display', serif; font-size: 16px; margin: 14px 0 6px; color: var(--felt3); }
.rules-body h3:first-child { margin-top: 0; }
.rules-body p, .rules-body li { font-size: 14px; line-height: 1.6; color: #333; }
.rules-body ul, .rules-body ol { padding-left: 20px; margin-bottom: 8px; }
.rules-body li { margin-bottom: 4px; }

/* AI thinking pulse */
@keyframes pulse { 0%,100%{opacity:.6} 50%{opacity:1} }
.ai-thinking { animation: pulse 1.2s ease-in-out infinite; color: var(--gold2); font-size: 12px; }

/* Highlight drawable discard */
.card.draw-hint { box-shadow: 0 0 0 3px var(--gold), 0 6px 18px rgba(201,168,76,0.4); }

@media (max-width: 900px) {
  .gr3-board { grid-template-columns: 1fr; }
  .center-col { order: -1; }
}
`;

// ── Card utilities ──────────────────────────────────────────
const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
const RANK_VAL = { A:1,J:11,Q:12,K:13 };
for (let n=2;n<=10;n++) RANK_VAL[n+""] = n;

const isJoker = c => c && c.suit === "JOKER";
const isRed   = c => c && (c.suit === "♥" || c.suit === "♦");

const cardPoints = c => {
  if (isJoker(c)) return 0;
  const r = c.rank;
  if (r==="A") return 1;
  if (r==="J"||r==="Q"||r==="K") return 10;
  return parseInt(r,10);
};

const cardLabel = c => {
  if (isJoker(c)) return "🃏";
  return c.rank + c.suit;
};

const makeDeck = (numJokers=0) => {
  const d = [];
  let uid = 0;
  for (const s of SUITS) for (const r of RANKS) d.push({ suit:s, rank:r, id:`${r}${s}-${uid++}` });
  for (let j=1; j<=Math.min(4, Math.max(0, numJokers)); j++) d.push({ suit:"JOKER", rank:"*", id:`JKR-${j}` });
  return d;
};

const shuffle = arr => {
  const a = arr.slice();
  for (let i=a.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
};

const sortHand = (hand, mode="suit") => {
  return hand.slice().sort((a,b)=>{
    const rA = isJoker(a) ? 99 : RANK_VAL[a.rank];
    const rB = isJoker(b) ? 99 : RANK_VAL[b.rank];
    const suitOrd = s => ({"♠":0,"♥":1,"♦":2,"♣":3}[s] ?? 9);
    const sA = isJoker(a) ? 9 : suitOrd(a.suit);
    const sB = isJoker(b) ? 9 : suitOrd(b.suit);
    if (mode==="rank") { if (rA!==rB) return rA-rB; return sA-sB; }
    if (sA!==sB) return sA-sB;
    return rA-rB;
  });
};

// ── Meld analysis ───────────────────────────────────────────
const isValidSet = (cards, jokersWild=true) => {
  if (cards.length < 3) return false;
  const nat = cards.filter(c=>!isJoker(c));
  if (!nat.length) return false;
  const rank = nat[0].rank;
  return nat.every(c=>c.rank===rank);
};

const isValidRun = (cards, jokersWild=true) => {
  if (cards.length < 3) return false;
  const nat = cards.filter(c=>!isJoker(c));
  if (!nat.length) return false;
  const suit = nat[0].suit;
  if (suit==="JOKER") return false;
  if (!nat.every(c=>c.suit===suit)) return false;
  const vals = nat.map(c=>RANK_VAL[c.rank]).sort((a,b)=>a-b);
  let gaps = 0;
  for (let i=1;i<vals.length;i++) {
    const d = vals[i]-vals[i-1];
    if (d<1) return false; // duplicate
    gaps += d-1;
  }
  const jokers = cards.length - nat.length;
  return jokersWild ? gaps <= jokers : gaps===0;
};

const isValidMeld = (cards, jokersWild=true) =>
  isValidSet(cards, jokersWild) || isValidRun(cards, jokersWild);

// Best meld layout (greedy, two-pass)
const bestMeldLayout = (hand, jokersWild=true) => {
  const tryLayout = (runFirst) => {
    const used = new Set();
    const melds = [];
    const jokerIds = hand.filter(isJoker).map(c=>c.id);
    let jokerPool = [...jokerIds];

    const trySet = () => {
      const byRank = {};
      for (const c of hand) if (!isJoker(c) && !used.has(c.id)) {
        (byRank[c.rank] = byRank[c.rank]||[]).push(c);
      }
      for (const r of RANKS) {
        const arr = (byRank[r]||[]).filter(c=>!used.has(c.id));
        if (arr.length>=3) {
          const g = arr.slice(0, Math.min(4, arr.length));
          melds.push({type:"set", cards:g});
          g.forEach(c=>used.add(c.id));
        } else if (arr.length===2 && jokersWild && jokerPool.length) {
          const jid = jokerPool.shift();
          const jcard = hand.find(c=>c.id===jid);
          melds.push({type:"set", cards:[...arr, jcard]});
          arr.forEach(c=>used.add(c.id)); used.add(jid);
        }
      }
    };

    const tryRun = () => {
      for (const suit of SUITS) {
        const inSuit = hand
          .filter(c=>!isJoker(c) && c.suit===suit && !used.has(c.id))
          .sort((a,b)=>RANK_VAL[a.rank]-RANK_VAL[b.rank]);
        let i=0;
        while (i<inSuit.length) {
          let seq = [inSuit[i]];
          let k=i, localJokers=[];
          while (k+1<inSuit.length) {
            const gap = RANK_VAL[inSuit[k+1].rank]-RANK_VAL[inSuit[k].rank];
            if (gap===0) { k++; continue; }
            if (gap===1) { seq.push(inSuit[k+1]); k++; }
            else {
              const need=gap-1;
              if (jokersWild && jokerPool.length>=need) {
                for (let t=0;t<need;t++) localJokers.push(jokerPool.shift());
                seq.push(inSuit[k+1]); k++;
              } else break;
            }
          }
          const totalLen = seq.length + localJokers.length;
          if (totalLen>=3) {
            const jCards = localJokers.map(id=>hand.find(c=>c.id===id));
            melds.push({type:"run", cards:[...seq, ...jCards]});
            seq.forEach(c=>used.add(c.id));
            localJokers.forEach(id=>used.add(id));
          } else {
            localJokers.forEach(id=>{ if(!jokerPool.includes(id)) jokerPool.unshift(id); });
          }
          i=k+1;
        }
      }
    };

    if (runFirst) { tryRun(); trySet(); }
    else { trySet(); tryRun(); }

    const deadwood = hand.filter(c=>!used.has(c.id));
    const points = deadwood.reduce((s,c)=>s+cardPoints(c), 0);
    return { melds, deadwood, points };
  };

  const a = tryLayout(true);
  const b = tryLayout(false);
  return a.points <= b.points ? a : b;
};

// Deadwood after explicit meld arrays
const deadwoodPoints = (hand, melds) => {
  const usedIds = new Set(melds.flat().map(c=>c.id));
  return hand.filter(c=>!usedIds.has(c.id)).reduce((s,c)=>s+cardPoints(c),0);
};

// Layoff
const canLayoff = (card, meld, jokersWild=true) => {
  if (isValidSet(meld, jokersWild)) {
    const base = meld.find(c=>!isJoker(c))?.rank;
    if (!base) return false;
    return isJoker(card) ? jokersWild : card.rank===base;
  }
  if (isValidRun(meld, jokersWild)) {
    const suit = meld.find(c=>!isJoker(c))?.suit;
    if (!suit) return false;
    if (!isJoker(card) && card.suit!==suit) return false;
    const nonJ = meld.filter(c=>!isJoker(c)).sort((a,b)=>RANK_VAL[a.rank]-RANK_VAL[b.rank]);
    const lo = RANK_VAL[nonJ[0].rank];
    const hi = RANK_VAL[nonJ[nonJ.length-1].rank];
    if (isJoker(card)) return jokersWild;
    const v = RANK_VAL[card.rank];
    return v===lo-1 || v===hi+1;
  }
  return false;
};

// ── AI ──────────────────────────────────────────────────────
const aiChoose = (aiHand, topDiscard, strength, jokersWild) => {
  const evalWith = (extra) => {
    const h = extra ? [...aiHand, extra] : aiHand;
    const layout = bestMeldLayout(h, jokersWild);
    // choose discard: pick card that maximizes meld quality after removal
    let bestDw = Infinity, bestDiscard = null;
    for (const c of h) {
      const after = h.filter(x=>x.id!==c.id);
      const dw = bestMeldLayout(after, jokersWild).points;
      if (dw < bestDw) { bestDw = dw; bestDiscard = c; }
    }
    return { dw: bestDw, discard: bestDiscard };
  };

  const withDiscard = topDiscard ? evalWith(topDiscard) : { dw: Infinity };
  const withStock   = evalWith(null); // heuristic: current hand minus worst card

  const improvement = withStock.dw - withDiscard.dw;
  const threshold   = strength>=6 ? 0 : strength>=3 ? 2 : 4;
  const takeDiscard = topDiscard && (improvement > threshold || (improvement>0 && Math.random()<strength/10));

  return { takeDiscard };
};

// ── Card component ──────────────────────────────────────────
function CardView({ card, selected, onClick, size="normal", showBack=false, hint=false }) {
  if (!card) return null;
  if (showBack) return <div className="card back" style={size==="big"?{width:"calc(var(--card-w)*1.25)",height:"calc(var(--card-h)*1.25)"}:{}} />;

  const cls = [
    "card",
    isJoker(card) ? "joker-card" : (isRed(card) ? "red-card" : ""),
    selected ? "selected" : "",
    size==="big"  ? "big"  : "",
    size==="tiny" ? "tiny" : "",
    hint ? "draw-hint" : "",
  ].filter(Boolean).join(" ");

  if (isJoker(card)) return (
    <div className={cls} onClick={onClick}>
      <div className="card-corner"><div className="c-rank">🃏</div></div>
      <div className="card-center">🃏</div>
      <div className="card-corner"><div className="c-rank">🃏</div></div>
    </div>
  );

  return (
    <div className={cls} onClick={onClick}>
      <div className="card-corner">
        <div className="c-rank">{card.rank}</div>
        <div className="c-suit">{card.suit}</div>
      </div>
      <div className="card-center">{card.suit}</div>
      <div className="card-corner" style={{transform:"rotate(180deg)"}}>
        <div className="c-rank">{card.rank}</div>
        <div className="c-suit">{card.suit}</div>
      </div>
    </div>
  );
}

// ── Defaults ────────────────────────────────────────────────
const DEFAULT_OPTIONS = {
  aiStrength: 4,
  handSize: 10,
  numJokers: 2,
  jokersWild: true,
  knockThreshold: 10,
  ginBonus: 25,
  undercutBonus: 25,
  sortMode: "suit",
  targetScore: 100,
  allowLayoffOnJokerMeld: false,
};

const STORAGE_KEY = "gr3_options_v1";

// ── Main ────────────────────────────────────────────────────
export default function Gin_Rummy_v3({ onQuit }) {
  // ── Options ──
  const [options, setOptions] = useState(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); return s ? { ...DEFAULT_OPTIONS, ...JSON.parse(s) } : DEFAULT_OPTIONS; }
    catch { return DEFAULT_OPTIONS; }
  });
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(options)); } catch {}
  }, [options]);

  // ── Modal state ──
  const [showSetup, setShowSetup]   = useState(true);
  const [showRules, setShowRules]   = useState(false);
  const [roundResult, setRoundResult] = useState(null); // {msg, humanPts, aiPts}

  // ── Score ──
  const [scores, setScores] = useState([0, 0]);
  const [roundNum, setRoundNum] = useState(1);

  // ── Game state ──
  const [stock, setStock]     = useState([]);
  const [discard, setDiscard] = useState([]);
  const [humanHand, setHumanHand] = useState([]);
  const [aiHand,    setAiHand]    = useState([]);
  const [humanMelds, setHumanMelds] = useState([]); // [[card,...],...]
  const [aiMelds,    setAiMelds]    = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [phase, setPhase] = useState("idle"); // idle | draw | discard | ai | over
  const [turn,  setTurn]  = useState("human");
  const [hasDrawn, setHasDrawn] = useState(false);
  const [msg, setMsg] = useState("Welcome! Set up a new game to begin.");
  const aiTimerRef = useRef(null);

  // ── Derived ──
  const humanDw = useMemo(() => deadwoodPoints(humanHand, humanMelds), [humanHand, humanMelds]);
  const aiDw    = useMemo(() => deadwoodPoints(aiHand, aiMelds), [aiHand, aiMelds]);
  const topDiscard = discard.length ? discard[discard.length-1] : null;

  const canKnock = phase==="discard" && turn==="human" && humanDw <= options.knockThreshold;
  const canGin   = phase==="discard" && turn==="human" && humanDw === 0;

  // ── Start game ──
  const startGame = useCallback(() => {
    const deck = shuffle(makeDeck(options.numJokers));
    const hs = Math.max(7, Math.min(11, options.handSize));
    const h0 = deck.slice(0, hs);
    const h1 = deck.slice(hs, hs*2);
    const top = deck[hs*2];
    const rest = deck.slice(hs*2+1);
    setHumanHand(sortHand(h0, options.sortMode));
    setAiHand(sortHand(h1, options.sortMode));
    setHumanMelds([]); setAiMelds([]);
    setDiscard([top]); setStock(rest);
    setSelectedIds(new Set());
    setHasDrawn(false);
    setPhase("draw"); setTurn("human");
    setMsg("Your turn — draw from Stock or Discard.");
    setShowSetup(false);
    setRoundResult(null);
  }, [options]);

  const newGameReset = () => { setScores([0,0]); setRoundNum(1); setShowSetup(true); };

  // ── Selection ──
  const toggleSelect = (card) => {
    if (turn!=="human" || phase==="idle") return;
    const n = new Set(selectedIds);
    n.has(card.id) ? n.delete(card.id) : n.add(card.id);
    setSelectedIds(n);
  };

  // ── Draw ──
  const drawFrom = (src) => {
    if (phase!=="draw" || turn!=="human") return;
    if (src==="discard" && !topDiscard) { setMsg("Discard pile is empty."); return; }
    if (src==="stock"   && !stock.length) { setMsg("Stock is empty!"); return; }
    const card = src==="discard" ? topDiscard : stock[0];
    setHumanHand(prev => sortHand([...prev, card], options.sortMode));
    if (src==="discard") setDiscard(prev => prev.slice(0,-1));
    else setStock(prev => prev.slice(1));
    setHasDrawn(true);
    setPhase("discard");
    setMsg(`Drew ${cardLabel(card)}. Now discard a card (or Knock/Gin).`);
  };

  // ── Discard (human) ──
  const discardSelected = () => {
    if (phase!=="discard" || turn!=="human") return;
    const sel = humanHand.filter(c=>selectedIds.has(c.id));
    if (sel.length!==1) { setMsg("Select exactly 1 card to discard."); return; }
    const card = sel[0];
    setHumanHand(prev => prev.filter(c=>c.id!==card.id));
    setDiscard(prev => [...prev, card]);
    setSelectedIds(new Set());
    setHasDrawn(false);
    setPhase("ai"); setTurn("ai");
    setMsg(`You discarded ${cardLabel(card)}. AI thinking…`);
  };

  // ── Meld actions ──
  const makeMeld = () => {
    if (turn!=="human") return;
    const sel = humanHand.filter(c=>selectedIds.has(c.id));
    if (sel.length<3) { setMsg("Select 3 or more cards to make a meld."); return; }
    if (!isValidMeld(sel, options.jokersWild)) { setMsg("That selection is not a valid set or run."); return; }
    setHumanHand(prev => sortHand(prev.filter(c=>!selectedIds.has(c.id)), options.sortMode));
    setHumanMelds(prev => [...prev, sel]);
    setSelectedIds(new Set());
    setMsg("Meld created. Keep playing or Knock/Gin when ready.");
  };

  const undoMeld = (idx) => {
    const m = humanMelds[idx];
    setHumanMelds(prev => prev.filter((_,i)=>i!==idx));
    setHumanHand(prev => sortHand([...prev, ...m], options.sortMode));
  };

  const suggestMelds = () => {
    const layout = bestMeldLayout(humanHand, options.jokersWild);
    if (!layout.melds.length) { setMsg("No melds found in your current hand."); return; }
    const usedIds = new Set(layout.melds.flatMap(m=>m.cards.map(c=>c.id)));
    setHumanHand(prev => sortHand(prev.filter(c=>!usedIds.has(c.id)), options.sortMode));
    setHumanMelds(prev => [...prev, ...layout.melds.map(m=>m.cards)]);
    setSelectedIds(new Set());
    setMsg(`Auto-grouped ${layout.melds.length} meld(s). Deadwood: ${layout.points}.`);
  };

  // ── Knock / Gin ──
  const doKnock = () => {
    if (!canKnock && !canGin) { setMsg("Cannot knock right now."); return; }
    resolveRound("human", humanDw===0);
  };

  const resolveRound = (knocker, isGin) => {
    const knockerMelds = knocker==="human" ? humanMelds.map(m=>m.slice()) : aiMelds.map(m=>m.slice());
    let oppHand = knocker==="human" ? aiHand.slice() : humanHand.slice();

    if (!isGin) {
      // Layoff loop
      let changed = true;
      while (changed) {
        changed = false;
        for (let i=oppHand.length-1; i>=0; i--) {
          for (let m=0; m<knockerMelds.length; m++) {
            if (canLayoff(oppHand[i], knockerMelds[m], options.jokersWild)) {
              knockerMelds[m].push(oppHand[i]);
              oppHand.splice(i,1);
              changed=true; break;
            }
          }
        }
      }
    }

    const knockerDw = knocker==="human" ? humanDw : aiDw;
    const oppDw = oppHand.reduce((s,c)=>s+cardPoints(c), 0);

    let humanGain=0, aiGain=0, resultMsg="";

    if (knocker==="human") {
      if (isGin) {
        humanGain = options.ginBonus + oppDw;
        resultMsg = `🥇 GIN! You score ${options.ginBonus} bonus + ${oppDw} opponent deadwood = ${humanGain}`;
      } else if (knockerDw < oppDw) {
        humanGain = oppDw - knockerDw;
        resultMsg = `🔔 Knock! You score ${humanGain} (deadwood difference)`;
      } else {
        aiGain = options.undercutBonus + (knockerDw - oppDw);
        resultMsg = `Undercut! AI scores ${aiGain} — your deadwood wasn't lower`;
      }
    } else {
      if (isGin) {
        aiGain = options.ginBonus + oppDw;
        resultMsg = `AI went GIN! AI scores ${aiGain}`;
      } else if (knockerDw < oppDw) {
        aiGain = oppDw - knockerDw;
        resultMsg = `AI knocks and scores ${aiGain}`;
      } else {
        humanGain = options.undercutBonus + (knockerDw - oppDw);
        resultMsg = `Undercut! You score ${humanGain} — AI's deadwood was higher`;
      }
    }

    const newScores = [scores[0]+humanGain, scores[1]+aiGain];
    setScores(newScores);
    setPhase("over");
    setRoundResult({ msg: resultMsg, humanPts: newScores[0], aiPts: newScores[1] });
  };

  const nextRound = () => {
    if (scores[0] >= options.targetScore || scores[1] >= options.targetScore) {
      newGameReset(); return;
    }
    setRoundNum(r=>r+1);
    setRoundResult(null);
    startGame();
  };

  // ── AI turn ──
  useEffect(() => {
    if (phase!=="ai" || turn!=="ai") return;
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);

    const delay = 400 + options.aiStrength * 80;
    aiTimerRef.current = setTimeout(() => {
      // 1. Draw
      const { takeDiscard } = aiChoose(aiHand, topDiscard, options.aiStrength, options.jokersWild);
      let drawnCard = null;
      let newAiHand = [...aiHand];
      let newDiscard = [...discard];
      let newStock = [...stock];

      if (takeDiscard && topDiscard) {
        drawnCard = newDiscard.pop();
        newAiHand.push(drawnCard);
      } else if (newStock.length) {
        drawnCard = newStock.shift();
        newAiHand.push(drawnCard);
      }

      // 2. Rebuild melds
      const layout = bestMeldLayout(newAiHand, options.jokersWild);
      const meldCards = layout.melds.map(m=>m.cards);
      const usedIds = new Set(layout.melds.flatMap(m=>m.cards.map(c=>c.id)));
      const remaining = newAiHand.filter(c=>!usedIds.has(c.id));

      // 3. Check gin / knock
      const aiDwNow = layout.points;
      const knockBias = options.aiStrength>=6 ? 0.9 : options.aiStrength>=3 ? 0.7 : 0.5;

      if (aiDwNow===0 && meldCards.length) {
        setAiHand(sortHand(remaining, options.sortMode));
        setAiMelds(meldCards);
        setDiscard(newDiscard); setStock(newStock);
        resolveRound("ai", true);
        return;
      }
      if (aiDwNow<=options.knockThreshold && Math.random()<knockBias) {
        setAiHand(sortHand(remaining, options.sortMode));
        setAiMelds(meldCards);
        setDiscard(newDiscard); setStock(newStock);
        resolveRound("ai", false);
        return;
      }

      // 4. Choose discard from remaining
      let worstCard = remaining[0];
      let maxPts = -1;
      for (const c of remaining) {
        const pts = cardPoints(c);
        if (pts > maxPts) { maxPts=pts; worstCard=c; }
      }
      const afterDiscard = remaining.filter(c=>c.id!==worstCard?.id);

      setAiHand(sortHand(afterDiscard, options.sortMode));
      setAiMelds(meldCards);
      if (worstCard) newDiscard.push(worstCard);
      setDiscard(newDiscard);
      setStock(newStock);
      setPhase("draw"); setTurn("human");
      setMsg(`AI discarded ${worstCard ? cardLabel(worstCard) : "a card"}. Your turn.`);
    }, delay);

    return () => clearTimeout(aiTimerRef.current);
  }, [phase, turn]);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const onKey = e => {
      if (showSetup || showRules || roundResult) return;
      const k = e.key.toLowerCase();
      if (k==="d" && phase==="draw" && turn==="human") drawFrom("stock");
      if (k==="f" && phase==="draw" && turn==="human") drawFrom("discard");
      if (k==="x" && phase==="discard" && turn==="human") discardSelected();
      if (k==="m") makeMeld();
      if (k==="k" && canKnock) doKnock();
      if (k==="g" && canGin) doKnock();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // ── Render ──
  return (
    <>
      <style>{CSS}</style>
      <div className="gr3">
        {/* Header */}
        <header className="gr3-header">
          <div className="gr3-logo">
            Gin Rummy
            <span>Claude House Edition</span>
          </div>
          <div className="gr3-scores">
            <div className="gr3-score-item">
              <div className="label">You</div>
              <div className="val">{scores[0]}</div>
            </div>
            <div className="gr3-score-sep"/>
            <div className="gr3-score-item">
              <div className="label">Round</div>
              <div className="val">{roundNum}</div>
            </div>
            <div className="gr3-score-sep"/>
            <div className="gr3-score-item">
              <div className="label">AI</div>
              <div className="val">{scores[1]}</div>
            </div>
          </div>
          <div className="gr3-hbtns">
            <button className="btn btn-ghost" onClick={()=>setShowRules(true)}>Rules</button>
            <button className="btn btn-ghost" onClick={()=>setShowSetup(true)}>⚙ Setup</button>
            {onQuit && <button className="btn btn-ghost" onClick={onQuit}>Quit</button>}
          </div>
        </header>

        {/* Action Bar */}
        <div className="gr3-action-bar">
          <button className="btn btn-action"
            disabled={phase!=="draw" || turn!=="human" || !stock.length}
            onClick={()=>drawFrom("stock")}
            title="D">⤵ Draw Stock (D)</button>
          <button className="btn btn-action"
            disabled={phase!=="draw" || turn!=="human" || !topDiscard}
            onClick={()=>drawFrom("discard")}
            title="F">⤴ Draw Discard (F)</button>
          <div className="sep"/>
          <button className="btn btn-action"
            disabled={turn!=="human"}
            onClick={makeMeld}
            title="M">♦ Make Meld (M)</button>
          <button className="btn btn-action"
            disabled={turn!=="human"}
            onClick={suggestMelds}>✨ Auto-Meld</button>
          <button className="btn btn-danger"
            disabled={phase!=="discard" || turn!=="human"}
            onClick={discardSelected}
            title="X">🗑 Discard (X)</button>
          <div className="sep"/>
          <button className="btn btn-knock"
            disabled={!canKnock}
            onClick={doKnock}
            title="K">🔔 Knock (K) ≤{options.knockThreshold}</button>
          <button className="btn btn-gin"
            disabled={!canGin}
            onClick={doKnock}
            title="G">🥇 Gin (G)</button>
        </div>

        {/* Board */}
        <div className="gr3-board">
          {/* Player col */}
          <div className="panel">
            <div className="panel-title">Your Hand</div>
            <div className="hand-area">
              {humanHand.map(c => (
                <CardView key={c.id} card={c}
                  selected={selectedIds.has(c.id)}
                  onClick={()=>toggleSelect(c)} />
              ))}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div className="deadwood-badge">
                Deadwood: <span className="dw-num">{humanDw}</span>
              </div>
              {humanDw <= options.knockThreshold && phase==="discard" && turn==="human" && (
                <span style={{fontSize:12, color:"var(--gold2)", opacity:.9}}>Knock available!</span>
              )}
            </div>
            <div className="melds-section">
              <h4>Your Melds ({humanMelds.length})</h4>
              {humanMelds.map((m, idx) => (
                <div key={idx} className="meld-row">
                  <span className="meld-tag">{isValidSet(m,options.jokersWild)?"Set":"Run"}</span>
                  {m.map(c=>(
                    <CardView key={c.id} card={c} size="tiny" />
                  ))}
                  <button className="btn btn-ghost meld-undo" style={{fontSize:11,padding:"3px 8px"}}
                    onClick={()=>undoMeld(idx)}>Undo</button>
                </div>
              ))}
              {humanMelds.length===0 && <div style={{fontSize:12,opacity:.5}}>No melds yet</div>}
            </div>
          </div>

          {/* Center col */}
          <div className="center-col">
            <div className="panel">
              <div className="piles-row">
                <div className="pile-wrap">
                  <div className="pile-label">Stock</div>
                  {stock.length ? (
                    <CardView card={stock[0]} showBack size="big" />
                  ) : (
                    <div className="card big empty-pile">Empty</div>
                  )}
                  <div className="pile-count">{stock.length} cards</div>
                </div>
                <div className="pile-wrap">
                  <div className="pile-label">Discard</div>
                  {topDiscard ? (
                    <CardView card={topDiscard} size="big"
                      hint={phase==="draw" && turn==="human"} />
                  ) : (
                    <div className="card big empty-pile">Empty</div>
                  )}
                  <div className="pile-count">{discard.length} cards</div>
                </div>
              </div>
            </div>
            <div className="msg-box">
              {turn==="ai" && phase==="ai" ? (
                <span className="ai-thinking">🤖 AI is thinking…</span>
              ) : msg}
            </div>
            <div className="panel" style={{padding:"10px 14px", fontSize:12, opacity:.7, lineHeight:1.6}}>
              <div style={{fontWeight:600, marginBottom:4, opacity:1}}>Shortcuts</div>
              D = Draw Stock · F = Draw Discard · X = Discard · M = Meld · K = Knock · G = Gin
            </div>
          </div>

          {/* AI col */}
          <div className="panel">
            <div className="panel-title">AI Hand</div>
            <div className="hand-area">
              {aiHand.map(c => <CardView key={c.id} card={c} showBack />)}
            </div>
            <div className="deadwood-badge">
              Est. Deadwood: <span className="dw-num">{aiDw}</span>
            </div>
            <div className="melds-section">
              <h4>AI Melds ({aiMelds.length})</h4>
              {aiMelds.map((m, idx) => (
                <div key={idx} className="meld-row">
                  <span className="meld-tag">{isValidSet(m,options.jokersWild)?"Set":"Run"}</span>
                  {m.map(c=><div key={c.id} className="card tiny back"/>)}
                </div>
              ))}
              {aiMelds.length===0 && <div style={{fontSize:12,opacity:.5}}>Nothing revealed yet</div>}
            </div>
          </div>
        </div>

        {/* Setup Modal */}
        {showSetup && (
          <div className="modal-backdrop">
            <div className="modal-box wide">
              <div className="modal-header">
                <h2>New Game — Settings</h2>
                <p>Configure your Gin Rummy rules before dealing.</p>
              </div>
              <div className="modal-body">
                <div className="form-grid">
                  {[
                    { label:"AI Strength (1–8)", key:"aiStrength", type:"number", min:1, max:8 },
                    { label:"Hand Size (7–11)", key:"handSize", type:"number", min:7, max:11 },
                    { label:"Jokers in Deck (0–4)", key:"numJokers", type:"number", min:0, max:4 },
                    { label:"Knock Threshold", key:"knockThreshold", type:"number", min:0, max:15 },
                    { label:"Gin Bonus", key:"ginBonus", type:"number", min:0, max:100 },
                    { label:"Undercut Bonus", key:"undercutBonus", type:"number", min:0, max:100 },
                    { label:"Target Score", key:"targetScore", type:"number", min:50, max:500, step:50 },
                  ].map(f=>(
                    <div key={f.key} className="form-field">
                      <label>{f.label}</label>
                      <input type={f.type} min={f.min} max={f.max} step={f.step||1}
                        value={options[f.key]}
                        onChange={e=>setOptions(o=>({...o,[f.key]:parseInt(e.target.value)||0}))}/>
                    </div>
                  ))}
                  <div className="form-field">
                    <label>Jokers Are Wild</label>
                    <select value={options.jokersWild?"yes":"no"} onChange={e=>setOptions(o=>({...o,jokersWild:e.target.value==="yes"}))}>
                      <option value="yes">Yes</option><option value="no">No</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Sort Mode</label>
                    <select value={options.sortMode} onChange={e=>setOptions(o=>({...o,sortMode:e.target.value}))}>
                      <option value="suit">By Suit then Rank</option>
                      <option value="rank">By Rank then Suit</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                {!showSetup || phase!=="idle" ? <button className="btn btn-ghost" style={{color:300}} onClick={()=>setShowSetup(false)}>Cancel</button> : null}
                <button className="btn btn-felt" onClick={startGame}>Deal Cards</button>
              </div>
            </div>
          </div>
        )}

        {/* Rules Modal */}
        {showRules && (
          <div className="modal-backdrop" onClick={()=>setShowRules(false)}>
            <div className="modal-box wide" onClick={e=>e.stopPropagation()}>
              <div className="modal-header">
                <h2>Gin Rummy — Rules</h2>
              </div>
              <div className="modal-body">
                <div className="rules-body">
                  <h3>Objective</h3>
                  <p>Form melds (sets & runs) in your hand to reduce <strong>deadwood</strong> — unmelded cards. Be the first to reach the target score.</p>
                  <h3>Card Values</h3>
                  <ul>
                    <li><strong>Ace</strong> = 1 point · <strong>2–9</strong> = face value · <strong>10/J/Q/K</strong> = 10 points</li>
                    <li><strong>Jokers</strong> (optional) = 0 points, wild in any meld</li>
                  </ul>
                  <h3>On Your Turn</h3>
                  <ol>
                    <li><strong>Draw</strong> one card from the Stock or take the top Discard.</li>
                    <li>Optionally <strong>Make Melds</strong> to organize your hand and show deadwood.</li>
                    <li><strong>Knock</strong> (if deadwood ≤ threshold) or <strong>Discard</strong> one card.</li>
                  </ol>
                  <h3>Knocking</h3>
                  <ul>
                    <li>Knock when deadwood ≤ knock threshold (default 10).</li>
                    <li>Opponent may <strong>lay off</strong> unmelded cards onto your melds.</li>
                    <li>If opponent deadwood ≥ yours → you score the difference.</li>
                    <li><strong>Undercut</strong>: If opponent deadwood ≤ yours → opponent scores bonus + difference.</li>
                  </ul>
                  <h3>Gin</h3>
                  <p>Knock with 0 deadwood. Opponent cannot lay off. You score gin bonus (default 25) + all opponent deadwood.</p>
                  <h3>Round Scoring</h3>
                  <ul>
                    <li>Successful knock → deadwood difference</li>
                    <li>Gin → gin bonus + opponent deadwood</li>
                    <li>Undercut → undercut bonus + difference (to opponent)</li>
                  </ul>
                  <h3>Auto-Meld</h3>
                  <p>Click <strong>Auto-Meld</strong> to have the engine find the best grouping automatically. You can always undo individual melds.</p>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-felt" onClick={()=>setShowRules(false)}>Got it</button>
              </div>
            </div>
          </div>
        )}

        {/* Round End Modal */}
        {roundResult && (
          <div className="modal-backdrop">
            <div className="modal-box">
              <div className="modal-header">
                <h2>Round {roundNum} Complete</h2>
              </div>
              <div className="modal-body">
                <div className="round-result">
                  <div className="big-msg">{roundResult.msg}</div>
                  <div className="score-table">
                    <div className="score-cell">
                      <div className="who">You</div>
                      <div className="pts">{roundResult.humanPts}</div>
                    </div>
                    <div className="score-cell">
                      <div className="who">AI</div>
                      <div className="pts">{roundResult.aiPts}</div>
                    </div>
                  </div>
                  {(roundResult.humanPts>=options.targetScore||roundResult.aiPts>=options.targetScore) && (
                    <p style={{color:"var(--felt3)", fontWeight:700, fontSize:18, marginTop:8}}>
                      {roundResult.humanPts>=options.targetScore ? "🏆 You win the game!" : "AI wins the game!"}
                    </p>
                  )}
                  <p style={{fontSize:13, color:"#666", marginTop:6}}>Target: {options.targetScore}</p>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" style={{color:300, background:"#f0e8d0", border:"1px solid #d4c9a8", color:"#333"}} onClick={newGameReset}>New Game</button>
                <button className="btn btn-felt" onClick={nextRound}>
                  {roundResult.humanPts>=options.targetScore||roundResult.aiPts>=options.targetScore ? "Play Again" : "Next Round →"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
