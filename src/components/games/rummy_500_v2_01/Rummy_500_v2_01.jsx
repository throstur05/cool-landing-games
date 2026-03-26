import React, { useEffect, useMemo, useState, useCallback } from "react";

/**
 * Rummy 500 — House Edition v2
 * Anthropic-style clean light UI
 * Self-contained: CSS-in-JS via <style> tag injected once
 */

const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
const RANK_ORDER = { A:1,"2":2,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9,"10":10,J:11,Q:12,K:13 };

const SCORE_VALUE = (rank, isJoker=false) => {
  if (isJoker) return 15;
  if (rank === "A") return 15;
  if (["10","J","Q","K"].includes(rank)) return 10;
  return 5;
};

const LS_OPTIONS_KEY = "r500v2_options";
const LS_SAVE_KEY    = "r500v2_save";

// ─── Utilities ────────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length-1; i > 0; i--) {
    const j = (Math.random()*(i+1))|0;
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}
function makeDeck(numJokers=0) {
  const deck = [];
  for (const s of SUITS)
    for (const r of RANKS)
      deck.push({ id:`${r}${s}-${Math.random().toString(36).slice(2)}`, rank:r, suit:s, joker:false });
  for (let i=0;i<numJokers;i++)
    deck.push({ id:`JKR-${i}-${Math.random().toString(36).slice(2)}`, rank:"JOKER", suit:null, joker:true });
  return deck;
}
function sortHand(cards, mode="rank") {
  return cards.slice().sort((a,b) => {
    if (a.joker && b.joker) return 0;
    if (a.joker) return 1;
    if (b.joker) return -1;
    if (mode==="suit") {
      if (a.suit!==b.suit) return SUITS.indexOf(a.suit)-SUITS.indexOf(b.suit);
      return RANK_ORDER[a.rank]-RANK_ORDER[b.rank];
    }
    if (a.rank!==b.rank) return RANK_ORDER[a.rank]-RANK_ORDER[b.rank];
    return SUITS.indexOf(a.suit)-SUITS.indexOf(b.suit);
  });
}
const clone = o => JSON.parse(JSON.stringify(o));
const cardLabel = c => c.joker ? "★" : `${c.rank}${c.suit}`;
const scoreCards = cards => cards.reduce((s,c)=>s+SCORE_VALUE(c.rank,c.joker),0);

// ─── Meld Logic ───────────────────────────────────────────────────────────────
function gapsNeeded(sortedNums) {
  let gaps = 0;
  for (let i=1;i<sortedNums.length;i++) {
    const d = sortedNums[i]-sortedNums[i-1];
    if (d===0) return null;
    if (d>1) gaps += d-1;
  }
  return gaps;
}
function isSet(cards) {
  if (cards.length<3||cards.length>4) return false;
  const nonJ = cards.filter(c=>!c.joker);
  if (!nonJ.length) return false;
  return nonJ.every(c=>c.rank===nonJ[0].rank);
}
function isRun(cards) {
  if (cards.length<3) return false;
  const nonJ = cards.filter(c=>!c.joker);
  const suit = nonJ[0]?.suit;
  if (!suit || !cards.every(c=>c.joker||c.suit===suit)) return false;
  if (nonJ.some((c,i)=>i>0&&nonJ[i-1].rank===c.rank)) return false;
  const jokers = cards.length-nonJ.length;
  const sorted = nonJ.slice().sort((a,b)=>RANK_ORDER[a.rank]-RANK_ORDER[b.rank]);
  const low = sorted.map(c=>RANK_ORDER[c.rank]);
  const high = sorted.map(c=>RANK_ORDER[c.rank]===1?14:RANK_ORDER[c.rank]);
  const gL = gapsNeeded(low), gH = gapsNeeded(high);
  return (gL!==null&&gL<=jokers)||(gH!==null&&gH<=jokers);
}
function isValidMeld(cards) { return isSet(cards)||isRun(cards); }
function validateMeld(cards) {
  if (cards.length<3) return {ok:false,reason:"Need at least 3 cards."};
  if (isSet(cards)) return {ok:true,type:"set"};
  const nonJ=cards.filter(c=>!c.joker);
  const suit=nonJ[0]?.suit;
  if (!suit||!cards.every(c=>c.joker||c.suit===suit)) return {ok:false,reason:"Runs must be the same suit."};
  if (nonJ.some((c,i)=>i>0&&nonJ[i-1].rank===c.rank)) return {ok:false,reason:"Runs can't have duplicate ranks."};
  if (!isRun(cards)) return {ok:false,reason:"Cards don't form a valid sequence."};
  return {ok:true,type:"run"};
}
function canAddToMeld(meld, card) {
  if (meld.type==="set") {
    const base=meld.cards.find(c=>!c.joker)?.rank??card.rank;
    return (card.joker||card.rank===base)&&meld.cards.length<4;
  }
  if (card.joker) return true;
  const suit=meld.cards.find(c=>!c.joker)?.suit;
  if (!suit||card.suit!==suit) return false;
  const nonJ=meld.cards.filter(c=>!c.joker).sort((a,b)=>RANK_ORDER[a.rank]-RANK_ORDER[b.rank]);
  const lo=nonJ[0],hi=nonJ[nonJ.length-1];
  return RANK_ORDER[lo.rank]-RANK_ORDER[card.rank]===1||RANK_ORDER[card.rank]-RANK_ORDER[hi.rank]===1;
}

// ─── Hints ────────────────────────────────────────────────────────────────────
function combinations(arr, k) {
  const res=[];
  function go(start,cur){
    if(cur.length===k){res.push(cur.slice());return;}
    if(res.length>200) return;
    for(let i=start;i<arr.length;i++){cur.push(arr[i]);go(i+1,cur);cur.pop();}
  }
  go(0,[]);
  return res;
}
function findMelds(hand) {
  const found=[];
  const N=Math.min(hand.length,12);
  const idx=[...Array(N).keys()];
  for(let k=3;k<=Math.min(5,N);k++){
    for(const c of combinations(idx,k)){
      const meld=c.map(i=>hand[i]);
      if(isValidMeld(meld)){found.push(meld);}
      if(found.length>12) return found;
    }
  }
  return found;
}
function suggestDiscard(hand) {
  const bySuit={};
  for(const c of hand){if(!bySuit[c.suit])bySuit[c.suit]=[];bySuit[c.suit].push(c);}
  for(const s in bySuit) bySuit[s].sort((a,b)=>RANK_ORDER[a.rank]-RANK_ORDER[b.rank]);
  let best=null,bestPen=-Infinity;
  for(const c of hand){
    if(c.joker) continue;
    let pen=0;
    if(hand.filter(x=>x.rank===c.rank&&!x.joker).length>=2) pen+=10;
    const sa=bySuit[c.suit]||[];
    const idx=sa.findIndex(x=>x.id===c.id);
    if((idx>0&&Math.abs(RANK_ORDER[sa[idx-1].rank]-RANK_ORDER[c.rank])===1)||
       (idx<sa.length-1&&Math.abs(RANK_ORDER[sa[idx+1].rank]-RANK_ORDER[c.rank])===1)) pen+=8;
    if(pen>bestPen){bestPen=pen;best=c;}
  }
  return best??hand.find(c=>!c.joker)??hand[0];
}

// ─── AI ───────────────────────────────────────────────────────────────────────
function aiTurn(state, pi, strength=4) {
  const S=clone(state);
  const top=S.discard[S.discard.length-1];
  let from="stock";
  if(top){
    const try1=sortHand(S.hands[pi].concat([top]),S.options.sortMode);
    if(findMelds(try1).some(m=>m.some(c=>c.id===top.id))){
      S.hands[pi]=try1; S.discard.pop(); from="discard";
    }
  }
  if(from==="stock"){
    const c=S.deck.pop();
    if(c) S.hands[pi]=sortHand(S.hands[pi].concat([c]),S.options.sortMode);
  }
  let passes=Math.min(1+Math.floor(strength/2),5);
  while(passes-->0){
    const m=findMelds(S.hands[pi]);
    if(!m.length) break;
    let best=null,bsc=-1;
    for(const mm of m){
      const sc=scoreCards(mm);
      if(!S.firstMeldDone[pi]&&S.options.initialMeldPoints>0&&sc<S.options.initialMeldPoints) continue;
      if(sc>bsc){bsc=sc;best=mm;}
    }
    if(!best) break;
    const ids=new Set(best.map(c=>c.id));
    S.hands[pi]=S.hands[pi].filter(c=>!ids.has(c.id));
    S.meldsByPlayer[pi].push({type:isSet(best)?"set":"run",cards:best});
    S.firstMeldDone[pi]=true;
  }
  const targets=S.meldsByPlayer.flatMap((arr,pp)=>arr.map((mm,idx)=>({pp,idx,mm})));
  let lp=Math.min(strength,6);
  while(lp-->0){
    let did=false;
    outer: for(let i=0;i<S.hands[pi].length;i++){
      const c=S.hands[pi][i];
      if(c.joker) continue;
      for(const t of targets){
        if(canAddToMeld(t.mm,c)){
          t.mm.cards=[...t.mm.cards,c];
          S.hands[pi].splice(i,1);
          did=true; break outer;
        }
      }
    }
    if(!did) break;
  }
  const disc=suggestDiscard(S.hands[pi]);
  S.hands[pi]=S.hands[pi].filter(c=>c.id!==disc.id);
  S.discard.push(disc);
  return {state:S, log:`${S.players[pi]} drew from ${from}, discarded ${cardLabel(disc)}${S.hands[pi].length===0?" — went out!":""}`};
}

// ─── CSS (injected once) ──────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Sans:wght@300;400;500;600&display=swap');

:root {
  --bg:       #f8f6f1;
  --surface:  #ffffff;
  --felt:     #e8f0e8;
  --felt-2:   #d6e8d6;
  --border:   #ddd8ce;
  --ink:      #1a1814;
  --ink-2:    #6b665e;
  --ink-3:    #9b968d;
  --red:      #c0392b;
  --accent:   #2c5f2e;
  --accent-l: #e8f0e8;
  --gold:     #b8860b;
  --gold-l:   #fdf8e8;
  --shadow-s: 0 1px 3px rgba(0,0,0,.08);
  --shadow-m: 0 4px 16px rgba(0,0,0,.10);
  --shadow-l: 0 12px 40px rgba(0,0,0,.14);
  --r:        10px;
}

.r5-root {
  font-family: 'DM Sans', sans-serif;
  background: var(--bg);
  min-height: 100vh;
  max-width: 1080px;
  margin: 0 auto;
  padding: 16px 16px 96px;
  color: var(--ink);
}

/* ── Topbar ── */
.r5-topbar {
  display: flex; align-items: center; gap: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r);
  padding: 10px 16px;
  box-shadow: var(--shadow-s);
  position: sticky; top: 8px; z-index: 10;
  margin-bottom: 12px;
}
.r5-brand {
  font-family: 'Playfair Display', serif;
  font-size: 18px; font-weight: 700; letter-spacing: .4px;
  color: var(--accent);
}
.r5-brand span { color: var(--gold); }
.r5-spacer { flex: 1; }
.r5-btn {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px; font-weight: 500;
  padding: 7px 14px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface);
  color: var(--ink);
  cursor: pointer;
  transition: border-color .15s, background .15s, box-shadow .15s;
}
.r5-btn:hover { border-color: var(--accent); background: var(--accent-l); }
.r5-btn.primary { background: var(--accent); border-color: var(--accent); color: #fff; }
.r5-btn.primary:hover { background: #1e4620; }
.r5-btn.danger { border-color: #d9534f; color: #d9534f; }
.r5-btn.danger:hover { background: #fff0f0; }
.r5-btn:disabled { opacity: .35; cursor: not-allowed; }
.r5-coach-toggle {
  display: flex; align-items: center; gap: 5px;
  font-size: 13px; font-weight: 500; cursor: pointer; user-select: none;
}
.r5-coach-toggle input { accent-color: var(--accent); }

/* ── Nudge ── */
.r5-nudge {
  background: var(--gold-l);
  border: 1px dashed var(--gold);
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13px;
  margin-bottom: 10px;
  animation: pulseNudge 2s ease-in-out infinite;
}
@keyframes pulseNudge { 0%,100%{opacity:1} 50%{opacity:.7} }

/* ── Scoreboard ── */
.r5-scores {
  display: flex; align-items: stretch; gap: 8px;
  margin-bottom: 12px; flex-wrap: wrap;
}
.r5-score {
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  padding: 8px 14px;
  box-shadow: var(--shadow-s);
  min-width: 90px;
  transition: border-color .15s;
}
.r5-score.active { border-color: var(--accent); background: var(--accent-l); }
.r5-score-name { font-weight: 600; font-size: 13px; }
.r5-score-pts { font-size: 22px; font-weight: 700; font-family: 'Playfair Display', serif; color: var(--accent); }
.r5-round-info {
  margin-left: auto;
  display: flex; flex-direction: column; align-items: flex-end; justify-content: center;
  gap: 2px; font-size: 12px; color: var(--ink-2);
}

/* ── Table (piles) ── */
.r5-table {
  display: flex; gap: 20px; align-items: flex-end;
  background: var(--felt);
  border: 1.5px solid var(--felt-2);
  border-radius: 14px;
  padding: 16px 20px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-s) inset;
}
.r5-pile { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.r5-pile-label { font-size: 11px; font-weight: 600; letter-spacing: .5px; text-transform: uppercase; color: var(--ink-2); }
.r5-stock {
  width: 72px; height: 102px;
  border-radius: 9px;
  border: 2px dashed var(--border);
  background: repeating-linear-gradient(45deg,#e0ead0,#e0ead0 5px,#d8e2c8 5px,#d8e2c8 10px);
  box-shadow: var(--shadow-s);
  cursor: pointer;
  transition: transform .12s, box-shadow .12s;
}
.r5-stock:hover:not(:disabled) { transform: translateY(-2px); box-shadow: var(--shadow-m); }
.r5-stock:disabled { cursor: not-allowed; opacity: .5; }
.r5-discard-pile {
  position: relative;
  width: 80px; height: 112px;
  border-radius: 9px;
  border: 1.5px solid var(--border);
  background: var(--surface);
  overflow: hidden;
  box-shadow: var(--shadow-s);
  cursor: pointer;
  transition: box-shadow .12s, transform .12s;
}
.r5-discard-pile.clickable:hover { transform: translateY(-2px); box-shadow: var(--shadow-m); outline: 2px solid var(--gold); }
.r5-discard-card { position: absolute; inset: 4px; }

/* ── Playing Card ── */
.r5-card {
  width: 64px; height: 90px;
  border-radius: 9px;
  border: 1.5px solid #d0ccc4;
  background: var(--surface);
  display: flex; flex-direction: column;
  justify-content: space-between;
  padding: 5px 6px;
  box-shadow: var(--shadow-s);
  cursor: pointer;
  user-select: none;
  position: relative;
  transition: transform .1s, box-shadow .1s, outline .08s;
}
.r5-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-m); }
.r5-card.selected {
  outline: 2.5px solid var(--accent);
  transform: translateY(-6px);
  box-shadow: 0 8px 20px rgba(44,95,46,.25);
  background: #f4fbf4;
}
.r5-card.joker { background: var(--gold-l); border-color: var(--gold); }
.r5-card .top { font-size: 14px; font-weight: 700; line-height: 1; }
.r5-card .btm { font-size: 14px; font-weight: 700; line-height: 1; align-self: flex-end; transform: rotate(180deg); }
.r5-card .center { font-size: 22px; line-height: 1; text-align: center; margin: auto 0; }
.r5-card .red-suit { color: var(--red); }
.r5-card-sm {
  width: 46px; height: 64px; border-radius: 7px; font-size: 11px; padding: 3px 4px;
}
.r5-card-sm .center { font-size: 15px; }

/* ── Melds ── */
.r5-melds {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px;
  margin-bottom: 12px;
}
.r5-meld-col {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r);
  padding: 8px 10px;
  box-shadow: var(--shadow-s);
}
.r5-meld-col-title { font-size: 11px; font-weight: 600; letter-spacing: .4px; text-transform: uppercase; color: var(--ink-2); margin-bottom: 6px; }
.r5-meld-group {
  display: inline-flex; gap: 3px; flex-wrap: wrap;
  border: 1.5px solid var(--border);
  border-radius: 8px; padding: 4px 5px;
  margin: 3px; cursor: pointer;
  background: #fafaf8;
  transition: border-color .12s, background .12s;
}
.r5-meld-group.targeted { border-color: var(--accent); background: var(--accent-l); }
.r5-meld-group:hover { border-color: var(--gold); }
.r5-meld-tag {
  font-size: 10px; font-weight: 700;
  padding: 1px 5px; border-radius: 999px;
  letter-spacing: .3px;
}
.r5-meld-tag.set { background: #e8f0e8; color: var(--accent); }
.r5-meld-tag.run { background: var(--gold-l); color: var(--gold); }
.r5-empty-meld { font-size: 12px; color: var(--ink-3); padding: 4px; }

/* ── Hand ── */
.r5-hand-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r);
  padding: 10px 12px;
  box-shadow: var(--shadow-s);
  margin-bottom: 12px;
}
.r5-hand-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.r5-hand-title { font-family: 'Playfair Display', serif; font-weight: 700; font-size: 16px; }
.r5-hand-count { font-size: 12px; color: var(--ink-2); }
.r5-hand {
  display: flex; flex-wrap: wrap; gap: 6px;
  background: var(--felt);
  border: 1px solid var(--felt-2);
  border-radius: 10px;
  padding: 10px;
  min-height: 110px;
}

/* ── Coach ── */
.r5-coach {
  margin-top: 10px;
  background: var(--gold-l);
  border: 1px solid #e8d89a;
  border-radius: 9px;
  padding: 8px 12px;
}
.r5-coach-title { font-size: 12px; font-weight: 700; letter-spacing: .4px; text-transform: uppercase; color: var(--gold); margin-bottom: 6px; }
.r5-coach-meld { display: flex; align-items: center; gap: 6px; margin: 3px 0; font-size: 13px; }
.r5-coach-badge { font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 999px; background: var(--gold-l); border: 1px solid var(--gold); color: var(--gold); }
.r5-coach-pts { color: var(--accent); font-weight: 600; }
.r5-coach-disc { margin-top: 6px; font-size: 13px; color: var(--ink-2); }

/* ── Action Dock ── */
.r5-dock {
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 20;
  background: rgba(255,255,255,.97);
  backdrop-filter: blur(8px);
  border-top: 1px solid var(--border);
  box-shadow: 0 -6px 24px rgba(0,0,0,.08);
  display: flex; gap: 8px; padding: 10px 16px;
  justify-content: center; flex-wrap: wrap;
}
.r5-dock-btn {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px; font-weight: 600;
  padding: 10px 18px;
  border-radius: 9px;
  border: 1.5px solid var(--border);
  background: var(--surface);
  color: var(--ink);
  cursor: pointer;
  transition: all .12s;
  min-width: 110px;
  letter-spacing: .2px;
}
.r5-dock-btn:hover:not(:disabled) { border-color: var(--accent); background: var(--accent-l); transform: translateY(-1px); }
.r5-dock-btn.prime { background: var(--accent); border-color: var(--accent); color: #fff; }
.r5-dock-btn.prime:hover:not(:disabled) { background: #1e4620; }
.r5-dock-btn:disabled { opacity: .3; cursor: not-allowed; transform: none; }

/* ── Log ── */
.r5-log {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r);
  overflow: hidden;
  box-shadow: var(--shadow-s);
}
.r5-log-head { font-size: 11px; font-weight: 700; letter-spacing: .5px; text-transform: uppercase; padding: 6px 12px; border-bottom: 1px solid var(--border); color: var(--ink-2); background: #fafaf8; }
.r5-log-body { max-height: 130px; overflow-y: auto; padding: 6px 12px; }
.r5-log-line { font-size: 12px; color: var(--ink-2); padding: 2px 0; border-bottom: 1px solid #f2f0eb; }
.r5-log-line:last-child { border: none; }

/* ── Overlays ── */
.r5-overlay {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(26,24,20,.6);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
}
.r5-dialog {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
  max-width: 540px; width: 100%;
  box-shadow: var(--shadow-l);
  max-height: 85vh;
  overflow-y: auto;
}
.r5-dialog h3 {
  font-family: 'Playfair Display', serif;
  font-size: 22px; margin: 0 0 16px;
  color: var(--accent);
}
.r5-dialog-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
}
.r5-field { display: flex; flex-direction: column; gap: 4px; }
.r5-field label { font-size: 12px; font-weight: 600; letter-spacing: .3px; text-transform: uppercase; color: var(--ink-2); }
.r5-field select, .r5-field input[type=number] {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px; padding: 7px 10px;
  border: 1px solid var(--border);
  border-radius: 7px; background: var(--surface);
  color: var(--ink);
}
.r5-field input[type=range] { accent-color: var(--accent); width: 100%; }
.r5-field .sublabel { font-size: 11px; color: var(--ink-3); }
.r5-checkbox-field { display: flex; align-items: center; gap: 8px; margin: 4px 0; }
.r5-checkbox-field input { accent-color: var(--accent); width: 16px; height: 16px; }
.r5-checkbox-field span { font-size: 13px; font-weight: 500; }
.r5-dialog-actions { display: flex; align-items: center; gap: 8px; margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--border); }
.r5-dialog-spacer { flex: 1; }
.r5-results { display: flex; flex-direction: column; gap: 8px; margin: 12px 0; }
.r5-result-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px; }
.r5-result-row.winner { border-color: var(--gold); background: var(--gold-l); }
.r5-result-name { font-weight: 600; }
.r5-result-pts { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: var(--accent); }
.r5-rules-body { font-size: 13.5px; line-height: 1.65; }
.r5-rules-body li { margin: 6px 0; }
.r5-rules-body strong { color: var(--accent); }
`;

function injectCSS() {
  if (document.getElementById("r500v2-style")) return;
  const el = document.createElement("style");
  el.id = "r500v2-style";
  el.textContent = CSS;
  document.head.appendChild(el);
}

// ─── Card Components ──────────────────────────────────────────────────────────
function PlayCard({ card, selected, small, onClick, onDoubleClick }) {
  const isRed = card.suit==="♥"||card.suit==="♦";
  const cls = ["r5-card", selected?"selected":"", card.joker?"joker":"", small?"r5-card-sm":""].filter(Boolean).join(" ");
  return (
    <div className={cls} onClick={onClick} onDoubleClick={onDoubleClick} title={cardLabel(card)} role="button" tabIndex={0}>
      <div className={`top ${isRed?"red-suit":""}`}>{card.joker?"★":card.rank}</div>
      <div className={`center ${isRed?"red-suit":""}`}>{card.joker?"☆":card.suit}</div>
      <div className={`btm ${isRed?"red-suit":""}`}>{card.joker?"★":card.rank}</div>
    </div>
  );
}

// ─── Default Options ──────────────────────────────────────────────────────────
const DEFAULT_OPTIONS = {
  aiPlayers: 1, aiStrength: 4, includeJokers: true, numJokers: 2,
  handSize: 7, targetScore: 500, initialMeldPoints: 30, sortMode: "rank",
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Rummy_500_v2_01({ onQuit }) {
  useEffect(() => { injectCSS(); }, []);

  const [opts, setOpts] = useState(() => {
    try { return {...DEFAULT_OPTIONS, ...JSON.parse(localStorage.getItem(LS_OPTIONS_KEY)||"{}")}; }
    catch { return DEFAULT_OPTIONS; }
  });
  const [players, setPlayers] = useState(() => ["You","AI 1","AI 2","AI 3"].slice(0,1+opts.aiPlayers));
  useEffect(() => { setPlayers(["You","AI 1","AI 2","AI 3"].slice(0,1+opts.aiPlayers)); }, [opts.aiPlayers]);
  useEffect(() => { localStorage.setItem(LS_OPTIONS_KEY, JSON.stringify(opts)); }, [opts]);

  const [deck, setDeck] = useState([]);
  const [discard, setDiscard] = useState([]);
  const [hands, setHands] = useState([]);
  const [meldsByPlayer, setMeldsByPlayer] = useState([]);
  const [scores, setScores] = useState([]);
  const [firstMeld, setFirstMeld] = useState([]);
  const [curPlayer, setCurPlayer] = useState(0);
  const [phase, setPhase] = useState("idle");
  const [round, setRound] = useState(1);
  const [log, setLog] = useState([]);
  const [selection, setSelection] = useState(new Set());
  const [meldTarget, setMeldTarget] = useState(null);
  const [coachOn, setCoachOn] = useState(true);
  const [showOpts, setShowOpts] = useState(true);
  const [showRules, setShowRules] = useState(false);

  const isHuman = curPlayer===0 && (phase==="draw"||phase==="play");
  const canDraw = isHuman && phase==="draw";
  const canPlay = isHuman && phase==="play";

  function addLog(msg) { setLog(l=>[...l, msg]); }

  // ── Start / Round ──
  function startGame(o=opts) {
    const P=1+o.aiPlayers;
    const plrs=["You","AI 1","AI 2","AI 3"].slice(0,P);
    const d=shuffle(makeDeck(o.includeJokers?o.numJokers:0));
    const H=Array.from({length:P},()=>[]);
    for(let i=0;i<o.handSize;i++) for(let p=0;p<P;p++) H[p].push(d.pop());
    for(let p=0;p<P;p++) H[p]=sortHand(H[p],o.sortMode);
    const disc=[d.pop()];
    setDeck(d); setDiscard(disc); setHands(H);
    setMeldsByPlayer(Array.from({length:P},()=>[]));
    setScores(Array.from({length:P},()=>0));
    setFirstMeld(Array.from({length:P},()=>false));
    setCurPlayer(0); setRound(1); setPhase("draw");
    setLog([`New game — target ${o.targetScore} pts.`]);
    setSelection(new Set()); setMeldTarget(null);
    setPlayers(plrs); setOpts(o);
    localStorage.removeItem(LS_SAVE_KEY);
  }

  function nextRound(newScores, roundN) {
    const P=players.length;
    const d=shuffle(makeDeck(opts.includeJokers?opts.numJokers:0));
    const H=Array.from({length:P},()=>[]);
    for(let i=0;i<opts.handSize;i++) for(let p=0;p<P;p++) H[p].push(d.pop());
    for(let p=0;p<P;p++) H[p]=sortHand(H[p],opts.sortMode);
    setDeck(d); setDiscard([d.pop()]); setHands(H);
    setMeldsByPlayer(Array.from({length:P},()=>[]));
    setFirstMeld(Array.from({length:P},()=>false));
    setCurPlayer(roundN%P); setRound(roundN+1); setPhase("draw");
    setScores(newScores);
    setSelection(new Set()); setMeldTarget(null);
    addLog(`Round ${roundN+1} started.`);
  }

  function doRoundEnd(handsSnap, meldSnap, scoresSnap) {
    const P=players.length;
    const delta=Array.from({length:P},(_,i)=>{
      const mpt=meldSnap[i].reduce((s,m)=>s+scoreCards(m.cards),0);
      return mpt-scoreCards(handsSnap[i]);
    });
    const newTotals=scoresSnap.map((t,i)=>t+delta[i]);
    setScores(newTotals);
    const msg=delta.map((d,i)=>`${players[i]} ${d>=0?"+":""}${d}`).join("  |  ");
    addLog(`Round over. ${msg}`);
    if(newTotals.some(s=>s>=opts.targetScore)) { setPhase("game_end"); setScores(newTotals); }
    else { setPhase("round_end"); }
    return newTotals;
  }

  // ── Human Actions ──
  function toggleCard(id) {
    if (!isHuman) return;
    const s=new Set(selection);
    s.has(id)?s.delete(id):s.add(id);
    setSelection(s);
  }
  function doDraw(fromDiscard) {
    if (!canDraw) return;
    if (fromDiscard) {
      if (!discard.length) return;
      const c=discard[discard.length-1];
      const nd=discard.slice(0,-1);
      const nh=hands.slice(); nh[0]=sortHand(hands[0].concat([c]),opts.sortMode);
      setDiscard(nd); setHands(nh); setPhase("play");
      addLog(`You took ${cardLabel(c)} from discard.`);
    } else {
      if (!deck.length) return;
      const c=deck[deck.length-1];
      const nd=deck.slice(0,-1);
      const nh=hands.slice(); nh[0]=sortHand(hands[0].concat([c]),opts.sortMode);
      setDeck(nd); setHands(nh); setPhase("play");
      addLog(`You drew from stock.`);
    }
  }
  function doMeld() {
    if (!canPlay) return;
    const chosen=hands[0].filter(c=>selection.has(c.id));
    const v=validateMeld(chosen);
    if (!v.ok) { alert(v.reason); return; }
    if (!firstMeld[0]&&opts.initialMeldPoints>0) {
      const sc=scoreCards(chosen);
      if (sc<opts.initialMeldPoints) { alert(`First meld needs ${opts.initialMeldPoints} pts (yours: ${sc}).`); return; }
    }
    const ids=new Set(chosen.map(c=>c.id));
    const nh=hands.slice(); nh[0]=hands[0].filter(c=>!ids.has(c.id));
    const nm=meldsByPlayer.slice(); nm[0]=[...nm[0],{type:v.type,cards:chosen}];
    const nf=firstMeld.slice(); nf[0]=true;
    setHands(nh); setMeldsByPlayer(nm); setFirstMeld(nf); setSelection(new Set());
    addLog(`You melded: ${chosen.map(cardLabel).join(" ")}`);
    if (nh[0].length===0) { doRoundEnd(nh,nm,scores); }
  }
  function doLayoff() {
    if (!canPlay||!meldTarget) return;
    const {pi,idx}=meldTarget;
    const chosen=hands[0].filter(c=>selection.has(c.id));
    if (chosen.length!==1) { alert("Select exactly one card to lay off."); return; }
    const card=chosen[0];
    if (!canAddToMeld(meldsByPlayer[pi][idx],card)) { alert("That card can't go on that meld."); return; }
    const nm=meldsByPlayer.map((arr,pIdx)=>pIdx===pi?arr.map((m,i)=>i===idx?{...m,cards:[...m.cards,card]}:m):arr);
    const nh=hands.slice(); nh[0]=hands[0].filter(c=>c.id!==card.id);
    setMeldsByPlayer(nm); setHands(nh); setSelection(new Set()); setMeldTarget(null);
    addLog(`You laid ${cardLabel(card)} on ${players[pi]}'s meld.`);
    if (nh[0].length===0) { doRoundEnd(nh,nm,scores); }
  }
  function doDiscard(forceCard=null) {
    if (!canPlay) return;
    let card=forceCard;
    if (!card) {
      const sel=hands[0].filter(c=>selection.has(c.id));
      if (sel.length===1) card=sel[0];
      else if (sel.length===0) card=suggestDiscard(hands[0]);
      else { alert("Select exactly one card to discard."); return; }
    }
    const nh=hands.slice(); nh[0]=hands[0].filter(c=>c.id!==card.id);
    const nd=[...discard,card];
    setHands(nh); setDiscard(nd); setSelection(new Set());
    addLog(`You discarded ${cardLabel(card)}.`);
    if (nh[0].length===0) { doRoundEnd(nh,meldsByPlayer,scores); return; }
    setCurPlayer((curPlayer+1)%players.length); setPhase("draw"); setMeldTarget(null);
  }

  // ── AI Driver ──
  useEffect(()=>{
    if (phase==="draw"&&curPlayer!==0) {
      const r=aiTurn({options:opts,players,deck,discard,hands,meldsByPlayer,scores,firstMeldDone:firstMeld,curPlayer,phase,round},curPlayer,opts.aiStrength);
      setDeck(r.state.deck); setDiscard(r.state.discard); setHands(r.state.hands);
      setMeldsByPlayer(r.state.meldsByPlayer); setFirstMeld(r.state.firstMeldDone);
      addLog(r.log);
      if (r.state.hands[curPlayer].length===0) {
        doRoundEnd(r.state.hands,r.state.meldsByPlayer,scores); return;
      }
      setCurPlayer((curPlayer+1)%players.length); setPhase("draw");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[phase,curPlayer]);

  // ── Coach ──
  const coach = useMemo(()=>{
    if (!coachOn||!hands[0]?.length) return null;
    return { melds: findMelds(hands[0]).slice(0,3), discard: suggestDiscard(hands[0]) };
  },[coachOn,hands]);

  const topDiscard = discard[discard.length-1];

  // ── Render ──
  return (
    <div className="r5-root">
      {/* Topbar */}
      <div className="r5-topbar">
        <div className="r5-brand">Rummy <span>500</span></div>
        <div className="r5-spacer" />
        <label className="r5-coach-toggle">
          <input type="checkbox" checked={coachOn} onChange={e=>setCoachOn(e.target.checked)} />
          Coach
        </label>
        <button className="r5-btn" onClick={()=>setShowRules(true)}>Rules</button>
        <button className="r5-btn" onClick={()=>setShowOpts(true)}>New Game</button>
        {onQuit && <button className="r5-btn danger" onClick={onQuit}>Quit</button>}
      </div>

      {canDraw && (
        <div className="r5-nudge">🃏 Your turn — draw from <strong>Stock</strong> or <strong>Discard</strong> to begin.</div>
      )}

      {/* Scoreboard */}
      <div className="r5-scores">
        {players.map((p,i)=>(
          <div key={i} className={`r5-score ${i===curPlayer?"active":""}`}>
            <div className="r5-score-name">{p}</div>
            <div className="r5-score-pts">{scores[i]??0}</div>
          </div>
        ))}
        <div className="r5-round-info">
          <span>Round {round}</span>
          <span>Target: {opts.targetScore}</span>
          <span style={{textTransform:"capitalize"}}>{phase}</span>
        </div>
      </div>

      {/* Piles */}
      <div className="r5-table">
        <div className="r5-pile">
          <div className="r5-pile-label">Stock ({deck.length})</div>
          <button className="r5-stock" disabled={!canDraw} onClick={()=>doDraw(false)} title="Draw from stock" />
        </div>
        <div className="r5-pile">
          <div className="r5-pile-label">Discard ({discard.length})</div>
          <div className={`r5-discard-pile ${canDraw&&discard.length?"clickable":""}`} onClick={()=>canDraw&&doDraw(true)}>
            {topDiscard && (
              <div className="r5-discard-card">
                <PlayCard card={topDiscard} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Melds */}
      <div className="r5-melds">
        {players.map((p,pi)=>(
          <div key={pi} className="r5-meld-col">
            <div className="r5-meld-col-title">{p}'s melds</div>
            {meldsByPlayer[pi]?.length ? meldsByPlayer[pi].map((m,idx)=>(
              <div key={idx} className={`r5-meld-group ${meldTarget?.pi===pi&&meldTarget?.idx===idx?"targeted":""}`}
                onClick={()=>isHuman&&setMeldTarget({pi,idx})}
                title="Click to target for Lay Off">
                <div className={`r5-meld-tag ${m.type}`}>{m.type.toUpperCase()}</div>
                {m.cards.map(c=><PlayCard key={c.id} card={c} small />)}
              </div>
            )) : <div className="r5-empty-meld">No melds yet</div>}
          </div>
        ))}
      </div>

      {/* Hand */}
      <div className="r5-hand-panel">
        <div className="r5-hand-header">
          <div className="r5-hand-title">Your Hand</div>
          <div className="r5-hand-count">{hands[0]?.length??0} cards · Sort: {opts.sortMode}</div>
        </div>
        <div className="r5-hand">
          {hands[0]?.map(c=>(
            <PlayCard key={c.id} card={c} selected={selection.has(c.id)}
              onClick={()=>toggleCard(c.id)}
              onDoubleClick={()=>{ if(canPlay){setSelection(new Set([c.id]));doDiscard(c);}}} />
          ))}
        </div>
        {coach&&(
          <div className="r5-coach">
            <div className="r5-coach-title">Coach</div>
            {coach.melds.length ? coach.melds.map((m,i)=>(
              <div key={i} className="r5-coach-meld">
                <span className="r5-coach-badge">{isSet(m)?"SET":"RUN"}</span>
                {m.map(cardLabel).join(" ")}
                <span className="r5-coach-pts">+{scoreCards(m)}</span>
              </div>
            )) : <div style={{fontSize:12,color:"#9b968d"}}>No obvious melds in hand.</div>}
            <div className="r5-coach-disc">💡 Suggested discard: <strong>{coach.discard?cardLabel(coach.discard):"—"}</strong></div>
          </div>
        )}
      </div>

      {/* Action Dock */}
      <div className="r5-dock">
        <button className="r5-dock-btn" disabled={!canDraw} onClick={()=>doDraw(false)}>Draw Stock</button>
        <button className="r5-dock-btn" disabled={!canDraw||!discard.length} onClick={()=>doDraw(true)}>Draw Discard</button>
        <button className="r5-dock-btn" disabled={!canPlay} onClick={doMeld}>Meld Selected</button>
        <button className="r5-dock-btn" disabled={!canPlay||!meldTarget} onClick={doLayoff}>Lay Off →</button>
        <button className="r5-dock-btn prime" disabled={!canPlay} onClick={()=>doDiscard()}>Discard</button>
      </div>

      {/* Log */}
      <div className="r5-log">
        <div className="r5-log-head">Game Log</div>
        <div className="r5-log-body">
          {[...log].reverse().map((l,i)=><div key={i} className="r5-log-line">· {l}</div>)}
        </div>
      </div>

      {/* Options Modal */}
      {showOpts && <OptionsModal opts={opts} onClose={()=>setShowOpts(false)} onStart={o=>{setShowOpts(false);startGame(o);}} />}

      {/* Rules Modal */}
      {showRules && <RulesModal onClose={()=>setShowRules(false)} />}

      {/* Round End */}
      {phase==="round_end" && (
        <div className="r5-overlay">
          <div className="r5-dialog">
            <h3>Round {round} Complete</h3>
            <div className="r5-results">
              {players.map((p,i)=>(
                <div key={i} className="r5-result-row">
                  <span className="r5-result-name">{p}</span>
                  <span className="r5-result-pts">{scores[i]} pts</span>
                </div>
              ))}
            </div>
            <div className="r5-dialog-actions">
              <div className="r5-dialog-spacer" />
              <button className="r5-btn primary" onClick={()=>nextRound(scores, round)}>Next Round →</button>
            </div>
          </div>
        </div>
      )}

      {/* Game End */}
      {phase==="game_end" && (
        <div className="r5-overlay">
          <div className="r5-dialog">
            <h3>Game Over</h3>
            <div className="r5-results">
              {[...players.map((p,i)=>({p,s:scores[i],i}))].sort((a,b)=>b.s-a.s).map(({p,s,i},rank)=>(
                <div key={i} className={`r5-result-row ${rank===0?"winner":""}`}>
                  <span className="r5-result-name">{rank===0?"🏆 ":""}{p}</span>
                  <span className="r5-result-pts">{s} pts</span>
                </div>
              ))}
            </div>
            <div className="r5-dialog-actions">
              <div className="r5-dialog-spacer" />
              <button className="r5-btn" onClick={()=>setShowOpts(true)}>New Game</button>
              {onQuit && <button className="r5-btn danger" onClick={onQuit}>Quit</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Options Modal ────────────────────────────────────────────────────────────
function OptionsModal({ opts, onClose, onStart }) {
  const [local, setLocal] = useState(opts);
  const set = (k,v) => setLocal(p=>({...p,[k]:v}));
  return (
    <div className="r5-overlay">
      <div className="r5-dialog">
        <h3>New Game</h3>
        <div className="r5-dialog-grid">
          <div className="r5-field">
            <label>AI Players</label>
            <select value={local.aiPlayers} onChange={e=>set("aiPlayers",+e.target.value)}>
              <option value={1}>1</option><option value={2}>2</option><option value={3}>3</option>
            </select>
          </div>
          <div className="r5-field">
            <label>AI Strength (Level {local.aiStrength})</label>
            <input type="range" min={1} max={8} value={local.aiStrength} onChange={e=>set("aiStrength",+e.target.value)} />
            <div className="sublabel">{["","Novice","Beginner","Easy","Casual","Medium","Hard","Expert","Master"][local.aiStrength]}</div>
          </div>
          <div className="r5-field">
            <label>Hand Size</label>
            <input type="number" min={5} max={13} value={local.handSize} onChange={e=>set("handSize",Math.max(5,Math.min(13,+e.target.value||7)))} />
          </div>
          <div className="r5-field">
            <label>Target Score</label>
            <input type="number" min={100} max={1000} step={50} value={local.targetScore} onChange={e=>set("targetScore",+e.target.value||500)} />
          </div>
          <div className="r5-field">
            <label>Initial Meld Threshold</label>
            <select value={local.initialMeldPoints} onChange={e=>set("initialMeldPoints",+e.target.value)}>
              <option value={0}>None</option><option value={15}>15 pts</option>
              <option value={30}>30 pts</option><option value={50}>50 pts</option>
            </select>
          </div>
          <div className="r5-field">
            <label>Sort Hand By</label>
            <select value={local.sortMode} onChange={e=>set("sortMode",e.target.value)}>
              <option value="rank">Rank</option><option value="suit">Suit</option>
            </select>
          </div>
        </div>
        <div style={{marginTop:12}}>
          <div className="r5-checkbox-field">
            <input type="checkbox" checked={local.includeJokers} onChange={e=>set("includeJokers",e.target.checked)} />
            <span>Include Jokers</span>
          </div>
          {local.includeJokers && (
            <div className="r5-field" style={{marginTop:6,maxWidth:160}}>
              <label>Number of Jokers</label>
              <input type="number" min={1} max={4} value={local.numJokers} onChange={e=>set("numJokers",Math.max(1,Math.min(4,+e.target.value||2)))} />
            </div>
          )}
        </div>
        <div className="r5-dialog-actions">
          <button className="r5-btn" onClick={onClose}>Cancel</button>
          <div className="r5-dialog-spacer" />
          <button className="r5-btn primary" onClick={()=>onStart(local)}>Start Game</button>
        </div>
      </div>
    </div>
  );
}

// ─── Rules Modal ──────────────────────────────────────────────────────────────
function RulesModal({ onClose }) {
  return (
    <div className="r5-overlay" onClick={onClose}>
      <div className="r5-dialog" onClick={e=>e.stopPropagation()}>
        <h3>How to Play</h3>
        <div className="r5-rules-body">
          <ol>
            <li><strong>Goal:</strong> First player to reach the target score wins.</li>
            <li><strong>Your Turn:</strong> Draw one card (Stock pile or top of Discard), then play melds/lay-offs, then discard one card.</li>
            <li><strong>Sets:</strong> 3–4 cards of the same rank. Jokers are wild.</li>
            <li><strong>Runs:</strong> 3+ consecutive cards of the same suit. Ace can be low or high (no wrap). Jokers fill gaps.</li>
            <li><strong>Lay Off:</strong> Add a single card to any existing meld on the table. Click the meld to target it, select your card, then press Lay Off.</li>
            <li><strong>First Meld Threshold:</strong> If set, your very first meld must total at least that many points.</li>
            <li><strong>Scoring:</strong> 2–9 = 5 pts, 10/J/Q/K = 10 pts, Ace/Joker = 15 pts. Your melds score positive; cards left in hand score negative.</li>
            <li><strong>Round End:</strong> When a player empties their hand. All players score (melds minus deadwood). Scores accumulate across rounds.</li>
            <li><strong>Coach Mode:</strong> Highlights playable melds in your hand and suggests a discard each turn.</li>
          </ol>
          <p style={{marginTop:12,color:"#6b665e",fontSize:12}}>💡 Tip: Double-click any card in your hand to instantly discard it during your play phase.</p>
        </div>
        <div className="r5-dialog-actions">
          <div className="r5-dialog-spacer" />
          <button className="r5-btn primary" onClick={onClose}>Got it</button>
        </div>
      </div>
    </div>
  );
}
