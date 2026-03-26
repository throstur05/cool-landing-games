import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./Canasta1.css";

/**
 * Canasta1.jsx — Classic Canasta, Teaching Edition (v3)
 *
 * NEW vs previous versions
 * ────────────────────────
 * RULES  Draw-phase lock · Frozen pile (wild on top needs 2 naturals)
 *        Going-out requires ≥1 canasta · Proper layoff onto AI melds
 *        Natural canasta +500, Mixed +300 · Red-3 draws replacement
 *        Black 3 blocks discard pile · Multi-round match to target score
 *
 * AI     Avoids gifting opponent meld ranks · Uses discard intelligently
 *        Evaluates going-out · Lays off on human melds at higher strength
 *        Strength 1-8 scales speed, accuracy, wild use, layoff aggression
 *
 * COACH  Colour-coded tip tiles (green=meld, amber=warn, red=danger, blue=info)
 *        Warns if discarding a wild · Warns if top discard feeds opponent
 *        Shows "you can go out!" banner · Explains why pile is frozen
 *        Initial-meld progress bar
 *
 * UI     Light cream background · Real card faces (big rank + coloured suit)
 *        Fanned discard pile (top 3) · Canasta flash animation
 *        Phase pill: Draw → Act → Discard · Keyboard: D=draw, Space=discard
 *        Round score breakdown modal · Match winner screen
 */

/* ═══════════ CONSTANTS ═══════════ */
const SUITS = ["♠","♥","♦","♣"];
const SUIT_RED = new Set(["♥","♦"]);
const RANKS = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
const JK = "JOKER";
const PTS = { JOKER:50,"2":20,A:20,K:10,Q:10,J:10,"10":10,"9":10,"8":10,"7":5,"6":5,"5":5,"4":5,"3":5 };
const NAT_CAN = 500, MIX_CAN = 300, RED3_BONUS = 100, GOOUT_BONUS = 100;

/* ═══════════ CARD UTILS ═══════════ */
let _uid = 1;
function card(rank, suit) {
  return { id: _uid++, rank, suit,
    isJoker: rank===JK, isWild: rank==="2"||rank===JK,
    isRedThree: rank==="3"&&SUIT_RED.has(suit),
    isBlackThree: rank==="3"&&!SUIT_RED.has(suit) };
}
function makeDeck({ numDecks=2, jokers=true }) {
  _uid = 1;
  const d = [];
  for (let i=0;i<numDecks;i++) {
    for (const s of SUITS) for (const r of RANKS) d.push(card(r,s));
    if (jokers) { d.push(card(JK,"★")); d.push(card(JK,"★")); }
  }
  return shuffle(d);
}
function shuffle(a) {
  const b=[...a];
  for (let i=b.length-1;i>0;i--) { const j=(Math.random()*(i+1))|0; [b[i],b[j]]=[b[j],b[i]]; }
  return b;
}
function clone(o) { return JSON.parse(JSON.stringify(o)); }
function cp(c) { return c.isJoker ? PTS.JOKER : (PTS[c.rank]??0); }
function nat(c) { return !c.isWild&&!c.isJoker; }
function pc(c) { return c.isJoker ? "★Jkr" : `${c.rank}${c.suit}`; }
function sortH(hand) {
  const O=[...RANKS,JK];
  return [...hand].sort((a,b) => {
    if (a.isWild!==b.isWild) return a.isWild?1:-1;
    const ri=O.indexOf(a.rank)-O.indexOf(b.rank);
    return ri!==0 ? ri : SUITS.indexOf(a.suit)-SUITS.indexOf(b.suit);
  });
}
function byRank(cards) {
  const g={};
  for (const c of cards) { const k=c.isJoker?JK:c.rank; (g[k]=g[k]||[]).push(c); }
  return g;
}

/* ═══════════ MELD RULES ═══════════ */
function validMeld(cards) {
  if (!cards||cards.length<3) return false;
  const nats=cards.filter(nat), wilds=cards.filter(c=>c.isWild);
  if (nats.length<2||wilds.length>nats.length) return false;
  const ranks=new Set(nats.map(c=>c.rank));
  if (ranks.size!==1) return false;
  const r=[...ranks][0];
  if (r==="3"||r===JK) return false;
  return true;
}
function isCanasta(m) { return m&&m.length>=7; }
function isNatCan(m) { return isCanasta(m)&&m.every(nat); }
function meldRank(m) { return m.find(nat)?.rank; }
function mPts(cards) { return cards.reduce((s,c)=>s+cp(c),0); }
function hPen(cards) { return cards.reduce((s,c)=>s+cp(c),0); }

/* ═══════════ PILE RULES ═══════════ */
function frozen(discard) { const t=discard[discard.length-1]; return !!t&&t.isWild; }
function canTake(state, player) {
  const top=state.discard[state.discard.length-1];
  if (!top||top.isWild||top.isBlackThree) return false;
  const rank=top.rank;
  const hasMeld=(state.melds[player]||[]).some(m=>meldRank(m)===rank);
  if (hasMeld) return true;
  const nInHand=state.hands[player].filter(c=>nat(c)&&c.rank===rank).length;
  return nInHand>=2;
}

/* ═══════════ SCORING ═══════════ */
function scoreRound(state, goer, settings) {
  const res={};
  for (const p of ["Human","AI"]) {
    let pts=0;
    for (const m of (state.melds[p]||[])) {
      pts+=mPts(m);
      if (isNatCan(m)) pts+=NAT_CAN;
      else if (isCanasta(m)) pts+=MIX_CAN;
    }
    if (settings.red3s) pts+=RED3_BONUS*(state.red3s[p]||0);
    if (p===goer) pts+=GOOUT_BONUS;
    pts-=hPen(state.hands[p]);
    res[p]=pts;
  }
  return res;
}

/* ═══════════ AI ═══════════ */
function aiFindMelds(hand, str) {
  const melds=[];
  let rem=[...hand];
  const wilds=rem.filter(c=>c.isWild);
  const usedW=[];
  const groups=byRank(rem.filter(c=>!c.isJoker&&!c.isBlackThree&&!c.isRedThree));

  for (const [rank, cards] of Object.entries(groups)) {
    if (rank==="3") continue;
    const ns=cards.filter(nat);
    if (ns.length<2) continue;
    const avail=wilds.filter(w=>!usedW.includes(w.id));
    const maxW=Math.min(ns.length, avail.length, str>=6?99:str>=4?2:1);
    const total=ns.length+maxW;
    if (total>=3) {
      const use=avail.slice(0,maxW);
      use.forEach(w=>usedW.push(w.id));
      melds.push([...ns,...use]);
      const ids=new Set([...ns,...use].map(c=>c.id));
      rem=rem.filter(c=>!ids.has(c.id));
    }
  }
  return melds;
}

function aiLayoff(state, str) {
  if (str<3) return;
  let changed=true;
  while (changed) {
    changed=false;
    for (const owner of ["AI","Human"]) {
      for (let mi=0;mi<(state.melds[owner]||[]).length;mi++) {
        const meld=state.melds[owner][mi];
        const rank=meldRank(meld);
        if (!rank) continue;
        for (let ci=0;ci<state.hands.AI.length;ci++) {
          const c=state.hands.AI[ci];
          if ((nat(c)&&c.rank===rank)||c.isWild) {
            const combined=[...meld,c];
            if (validMeld(combined)) {
              const wasCan=isCanasta(meld);
              state.melds[owner][mi]=combined;
              if (!wasCan&&isCanasta(combined)) state.canastas[owner]=(state.canastas[owner]||0)+1;
              state.hands.AI.splice(ci,1);
              state.log.unshift(`AI laid off ${pc(c)}.`);
              changed=true; break;
            }
          }
        }
        if (changed) break;
      }
      if (changed) break;
    }
  }
}

function aiDiscard(hand, str, oppMelds) {
  const oppRanks=new Set((oppMelds||[]).map(meldRank).filter(Boolean));
  const safe=hand.filter(c=>!c.isWild&&!c.isBlackThree&&!c.isRedThree)
    .sort((a,b)=>cp(a)-cp(b));
  if (str>=5) {
    const groups=byRank(safe);
    const loners=safe.filter(c=>!oppRanks.has(c.rank)&&(groups[c.rank]||[]).length===1);
    if (loners.length) return loners[0];
  }
  const nonOpp=safe.filter(c=>!oppRanks.has(c.rank));
  if (nonOpp.length) return nonOpp[0];
  return safe[0]||hand.sort((a,b)=>cp(a)-cp(b))[0];
}

function runAI(state, settings) {
  const str=settings.aiStr;
  // Draw
  const top=state.discard[state.discard.length-1];
  let tookDiscard=false;
  if (canTake(state,"AI")&&top) {
    const rank=top.rank;
    const testH=[...state.hands.AI,top];
    const helps=aiFindMelds(testH,str).some(m=>m.some(c=>c.rank===rank));
    if (helps&&Math.random()<0.45+str*0.07) {
      const c=state.discard.pop();
      state.hands.AI.push(c);
      state.log.unshift(`AI took ${pc(c)} from Discard.`);
      tookDiscard=true;
    }
  }
  if (!tookDiscard) {
    if (!state.stock.length) { state.winner="draw"; state.log.unshift("Stock empty."); return; }
    state.hands.AI.push(state.stock.pop());
    state.log.unshift("AI drew from Stock.");
  }
  // Red 3s
  autoRed3(state,"AI",settings);
  // Meld
  const melds=aiFindMelds(state.hands.AI,str);
  const initNeed=settings.initPts;
  const metInit=state.metInit.AI;
  if (melds.length) {
    const totalPts=melds.reduce((s,m)=>s+mPts(m),0);
    if (!metInit&&totalPts<initNeed) {
      const best=[...melds].sort((a,b)=>mPts(b)-mPts(a))[0];
      if (best&&mPts(best)>=initNeed) { layMeld(state,"AI",best); state.metInit.AI=true; }
    } else {
      for (const m of melds) layMeld(state,"AI",m);
      if (!metInit) state.metInit.AI=true;
    }
  }
  // Layoff
  aiLayoff(state,str);
  // Can go out?
  const cans=state.canastas.AI||0;
  if (cans>=1&&state.hands.AI.length<=2) {
    // Discard last and go out
    const disc=aiDiscard(state.hands.AI,str,state.melds.Human);
    if (disc) {
      state.hands.AI=state.hands.AI.filter(c=>c.id!==disc.id);
      state.discard.push(disc);
    }
    state.winner="AI"; state.goer="AI";
    state.log.unshift("AI went out!"); return;
  }
  // Discard
  state.hands.AI=sortH(state.hands.AI);
  const disc=aiDiscard(state.hands.AI,str,state.melds.Human);
  if (disc) {
    state.hands.AI=state.hands.AI.filter(c=>c.id!==disc.id);
    state.discard.push(disc);
    state.log.unshift(`AI discarded ${pc(disc)}.`);
  }
  if (!state.stock.length) { state.winner="draw"; state.log.unshift("Stock empty."); return; }
  state.phase="draw"; state.turn="Human";
}

/* ═══════════ STATE ═══════════ */
function empty() {
  return { stock:[],discard:[],hands:{Human:[],AI:[]},melds:{Human:[],AI:[]},
    red3s:{Human:0,AI:0},canastas:{Human:0,AI:0},metInit:{Human:false,AI:false},
    turn:"Human",phase:"draw",winner:null,goer:null,roundScores:null,
    totalScores:{Human:0,AI:0},round:1,log:[] };
}
function autoRed3(state,player,settings) {
  if (!settings.red3s) return;
  const keep=[],found=[];
  for (const c of state.hands[player]) (c.isRedThree?found:keep).push(c);
  state.hands[player]=keep;
  state.red3s[player]=(state.red3s[player]||0)+found.length;
  for (const c of found) {
    if (state.stock.length) state.hands[player].push(state.stock.pop());
    state.log.unshift(`${player} laid Red 3 (${pc(c)}).`);
  }
}
function layMeld(state,player,cards) {
  const ids=new Set(cards.map(c=>c.id));
  state.hands[player]=state.hands[player].filter(c=>!ids.has(c.id));
  state.melds[player].push(cards);
  if (isCanasta(cards)) {
    state.canastas[player]=(state.canastas[player]||0)+1;
    state.log.unshift(`🎉 ${player} made a CANASTA!`);
  } else state.log.unshift(`${player} melded ${meldRank(cards)}s (${cards.length}).`);
}
function dealRound(state, settings) {
  const { handSize, numDecks, jokers } = settings;
  state.stock=makeDeck({numDecks,jokers});
  state.discard=[]; state.hands={Human:[],AI:[]}; state.melds={Human:[],AI:[]};
  state.red3s={Human:0,AI:0}; state.canastas={Human:0,AI:0};
  state.metInit={Human:false,AI:false};
  state.turn="Human"; state.phase="draw"; state.winner=null; state.goer=null; state.log=[];
  for (let i=0;i<handSize;i++) {
    state.hands.Human.push(state.stock.pop());
    state.hands.AI.push(state.stock.pop());
  }
  let top; do { top=state.stock.pop(); } while (top&&top.isWild);
  if (top) state.discard.push(top);
  autoRed3(state,"Human",settings); autoRed3(state,"AI",settings);
  state.hands.Human=sortH(state.hands.Human); state.hands.AI=sortH(state.hands.AI);
  state.log.unshift(`Round ${state.round} started!`);
}

/* ═══════════ COACH ═══════════ */
function buildCoach(hand, state, settings) {
  const tips=[];
  const dTop=state.discard[state.discard.length-1];
  const isFrozen=frozen(state.discard);
  const cans=state.canastas.Human||0;
  const metInit=state.metInit.Human;
  const initNeed=settings.initPts;
  const oppMelds=state.melds.AI||[];
  const groups=byRank(hand.filter(c=>!c.isJoker&&!c.isBlackThree&&!c.isRedThree));
  const wilds=hand.filter(c=>c.isWild);

  // Meld opps
  for (const [rank,cards] of Object.entries(groups)) {
    if (rank==="3") continue;
    const ns=cards.filter(nat);
    if (ns.length<2) { if (ns.length===1) tips.push({k:"hint",t:`Pair up: one ${rank} — need 1 more natural.`}); continue; }
    const maxW=Math.min(ns.length,wilds.length);
    const pts=mPts([...ns,...wilds.slice(0,maxW)]);
    const ok=metInit||pts>=initNeed;
    tips.push({k:ok?"meld":"warn", t:`Meld ${rank}s: ${ns.length} natural${ns.length>1?"s":""}${maxW?` + ${maxW} wild`:""}  =  ${pts} pts${!metInit?` (need ${initNeed})`:""}` });
  }
  // Layoff opps
  for (const [owner,ms] of Object.entries(state.melds)) {
    for (const m of ms) {
      const rank=meldRank(m); if (!rank) continue;
      const matching=hand.filter(c=>(nat(c)&&c.rank===rank)||c.isWild);
      if (matching.length) {
        const combined=[...m,matching[0]];
        if (validMeld(combined)) tips.push({k:"layoff",t:`Lay ${pc(matching[0])} onto ${owner==="Human"?"your":"AI's"} ${rank} meld${isCanasta(combined)?" → CANASTA!":""}`});
      }
    }
  }
  // Discard pile
  if (isFrozen) tips.push({k:"info",t:"Discard pile is FROZEN (wild on top). Need 2 naturals of top rank to take it."});
  if (dTop&&!dTop.isWild) {
    const oppHas=oppMelds.some(m=>meldRank(m)===dTop.rank);
    if (oppHas) tips.push({k:"danger",t:`⚠️ Don't discard ${dTop.rank}s — AI has a meld of that rank!`});
  }
  // Wild discard check (done when selecting)
  // Going out
  if (cans>=1&&hand.length<=5) tips.push({k:"success",t:`✓ You have ${cans} canasta${cans>1?"s":""}. You CAN go out — meld everything, then discard your last card!`});
  else if (!cans) tips.push({k:"info",t:"Need ≥1 canasta (7+ cards of one rank) before going out."});
  // Init bar
  if (!metInit&&initNeed>0) {
    const best=Object.values(groups).reduce((best,cards)=>{
      const ns=cards.filter(nat);
      if (ns.length<2) return best;
      const w=Math.min(ns.length,wilds.length);
      const pts=mPts([...ns,...wilds.slice(0,w)]);
      return pts>best?pts:best;
    },0);
    tips.push({k:"hint",t:`Best single meld: ~${best} pts of the ${initNeed} pts needed to open.`});
  }
  return tips;
}

/* ═══════════ CARD COMPONENT ═══════════ */
function CF({ c, sel, onClick, disabled, size="md" }) {
  const red=c.isJoker?false:SUIT_RED.has(c.suit);
  const rank=c.isJoker?"★":c.rank;
  const suit=c.isJoker?"JKR":c.suit;
  return (
    <button className={`cf cf-${size}${red?" red":""}${sel?" sel":""}${disabled?" dis":""}${c.isWild?" wild":""}`}
      onClick={onClick} disabled={disabled} title={pc(c)}>
      <span className="cf-r">{rank}</span>
      <span className="cf-s">{suit}</span>
    </button>
  );
}
function CB({ size="md" }) { return <div className={`cb cb-${size}`}>🂠</div>; }

/* ═══════════ SETTINGS ═══════════ */
const DEF = { handSize:11,numDecks:2,jokers:true,red3s:true,initPts:50,targetScore:5000,aiStr:4,fastAI:true,coach:true,showAI:false };
function useLS(k,def) {
  const [v,setV]=useState(()=>{try{const r=localStorage.getItem(k);return r?JSON.parse(r):def;}catch{return def;}});
  const set=useCallback(val=>{setV(val);try{localStorage.setItem(k,JSON.stringify(val));}catch{}},[k]);
  return [v,set];
}

/* ═══════════ MAIN ═══════════ */
export default function Canasta1({ onQuit }) {
  const [cfg,setCfg]=useLS("c1v3",DEF);
  const [gs,setGs]=useState(empty);
  const [sel,setSel]=useState([]);
  const [showNew,setShowNew]=useState(true);
  const [showRules,setShowRules]=useState(false);
  const [showScore,setShowScore]=useState(false);
  const [flash,setFlash]=useState("");
  const prevCans=useRef({Human:0,AI:0});

  useEffect(()=>{
    const h=gs.canastas.Human||0, a=gs.canastas.AI||0;
    const ph=prevCans.current.Human||0, pa=prevCans.current.AI||0;
    if (h>ph) { setFlash("🎉 CANASTA!"); setTimeout(()=>setFlash(""),1800); }
    else if (a>pa) { setFlash("🤖 AI CANASTA!"); setTimeout(()=>setFlash(""),1800); }
    prevCans.current={Human:h,AI:a};
  },[gs.canastas.Human,gs.canastas.AI]);

  const hHand=useMemo(()=>sortH(gs.hands.Human||[]),[gs.hands.Human]);
  const aHand=useMemo(()=>{
    const h=sortH(gs.hands.AI||[]);
    return cfg.showAI?h:h.map(c=>({...c,_h:true}));
  },[gs.hands.AI,cfg.showAI]);

  const dTop=gs.discard[gs.discard.length-1];
  const dPrev=gs.discard[gs.discard.length-2];
  const dPrev2=gs.discard[gs.discard.length-3];
  const isFrozen=frozen(gs.discard);
  const isHT=gs.turn==="Human"&&!gs.winner;
  const canDraw=isHT&&gs.phase==="draw";
  const canAct=isHT&&gs.phase!=="draw";
  const selCards=hHand.filter(c=>sel.includes(c.id));

  const coach=useMemo(()=>{
    if (!cfg.coach||!isHT) return [];
    return buildCoach(hHand,gs,cfg);
  },[cfg.coach,hHand,gs,isHT]);

  function start() {
    const st=empty();
    dealRound(st,cfg);
    setGs(st); setSel([]); setShowNew(false); setShowScore(false);
  }
  function nextRound(prev) {
    const st=empty();
    st.totalScores=clone(prev.totalScores);
    st.round=(prev.round||1)+1;
    dealRound(st,cfg);
    setGs(st); setSel([]); setShowScore(false);
  }
  function finalise(st) {
    const rs=scoreRound(st,st.goer,cfg);
    st.roundScores=rs;
    st.totalScores={ Human:(st.totalScores?.Human||0)+rs.Human, AI:(st.totalScores?.AI||0)+rs.AI };
    st.log.unshift(`Round: You ${rs.Human>=0?"+":""}${rs.Human} | AI ${rs.AI>=0?"+":""}${rs.AI}`);
    setGs(st); setShowScore(true);
  }

  function doDrawStock() {
    if (!canDraw||!gs.stock.length) return;
    const st=clone(gs);
    st.hands.Human.push(st.stock.pop());
    st.log.unshift("You drew from Stock.");
    autoRed3(st,"Human",cfg);
    st.hands.Human=sortH(st.hands.Human);
    st.phase="act"; setGs(st);
  }
  function doTakeDiscard() {
    if (!canDraw||!canTake(gs,"Human")) return;
    const st=clone(gs);
    const c=st.discard.pop();
    st.hands.Human.push(c);
    st.log.unshift(`You took ${pc(c)} from Discard.`);
    st.hands.Human=sortH(st.hands.Human);
    st.phase="act"; setGs(st);
  }
  function doMeld() {
    if (!canAct) return;
    if (!validMeld(selCards)) { const st=clone(gs); st.log.unshift("❌ Invalid meld. Need ≥3 cards, same rank, ≥2 naturals, naturals≥wilds."); setGs(st); return; }
    const st=clone(gs);
    if (!st.metInit.Human) {
      const pts=mPts(selCards);
      if (pts<cfg.initPts) { st.log.unshift(`❌ Need ≥${cfg.initPts} pts to open (got ${pts}).`); setGs(st); return; }
      st.metInit.Human=true;
    }
    const cards=st.hands.Human.filter(c=>sel.includes(c.id));
    layMeld(st,"Human",cards);
    st.hands.Human=sortH(st.hands.Human);
    setSel([]); setGs(st);
  }
  function doLayoff(owner,mi) {
    if (!canAct||!selCards.length) return;
    const st=clone(gs);
    const meld=st.melds[owner][mi]; if (!meld) return;
    const cards=st.hands.Human.filter(c=>sel.includes(c.id));
    const combined=[...meld,...cards];
    if (!validMeld(combined)) { st.log.unshift("❌ Lay-off breaks meld rules."); setGs(st); return; }
    const ids=new Set(cards.map(c=>c.id));
    st.hands.Human=st.hands.Human.filter(c=>!ids.has(c.id));
    const wasCan=isCanasta(meld);
    st.melds[owner][mi]=combined;
    if (!wasCan&&isCanasta(combined)) {
      st.canastas[owner]=(st.canastas[owner]||0)+1;
      st.log.unshift(`🎉 ${owner==="Human"?"Your":"AI's"} ${meldRank(meld)} meld became a CANASTA!`);
    } else st.log.unshift(`You laid off onto ${owner==="Human"?"your":"AI's"} ${meldRank(meld)} meld.`);
    st.hands.Human=sortH(st.hands.Human);
    setSel([]); setGs(st);
  }
  function doDiscard() {
    if (!canAct||selCards.length!==1) return;
    const card=selCards[0];
    const st=clone(gs);
    st.hands.Human=st.hands.Human.filter(c=>c.id!==card.id);
    st.discard.push(card);
    st.log.unshift(`You discarded ${pc(card)}.`);
    if (st.hands.Human.length===0) {
      if ((st.canastas.Human||0)<1) {
        st.hands.Human=[...st.hands.Human,card]; st.discard.pop();
        st.log.unshift("❌ Need ≥1 canasta before going out!"); setGs(st); return;
      }
      st.winner="Human"; st.goer="Human";
      st.log.unshift("You went out! 🎉"); finalise(st); return;
    }
    if (!st.stock.length) { st.winner="draw"; finalise(st); return; }
    st.phase="draw"; st.turn="AI"; setSel([]); setGs(st);
  }

  useEffect(()=>{
    if (gs.turn==="AI"&&!gs.winner) {
      const delay=cfg.fastAI?400:1100;
      const t=setTimeout(()=>{
        const st=clone(gs); runAI(st,cfg);
        if (st.winner) finalise(st); else setGs(st);
      },delay);
      return ()=>clearTimeout(t);
    }
  },[gs.turn,gs.winner]);

  useEffect(()=>{
    function kd(e) {
      if (showNew||showRules||showScore) return;
      if ((e.key==="d"||e.key==="D")&&canDraw) doDrawStock();
      if (e.key===" "&&canAct) { e.preventDefault(); doDiscard(); }
    }
    window.addEventListener("keydown",kd);
    return ()=>window.removeEventListener("keydown",kd);
  },[canDraw,canAct,selCards]);

  const matchWin=gs.totalScores&&cfg.targetScore&&
    (gs.totalScores.Human>=cfg.targetScore?"Human":gs.totalScores.AI>=cfg.targetScore?"AI":null);

  const initPct=useMemo(()=>{
    if (gs.metInit.Human||!cfg.initPts) return 100;
    const groups=byRank(hHand.filter(c=>!c.isJoker&&!c.isBlackThree&&!c.isRedThree));
    const wilds=hHand.filter(c=>c.isWild);
    let best=0;
    for (const [rank,cards] of Object.entries(groups)) {
      if (rank==="3") continue;
      const ns=cards.filter(nat);
      if (ns.length<2) continue;
      const w=Math.min(ns.length,wilds.length);
      best=Math.max(best,mPts([...ns,...wilds.slice(0,w)]));
    }
    return Math.min(100,Math.round(best/cfg.initPts*100));
  },[hHand,gs.metInit.Human,cfg.initPts]);

  return (
    <div className="c1-root">
      {flash&&<div className="c1-flash">{flash}</div>}

      <header className="c1-hdr">
        <div className="c1-brand">♣ Classic Canasta</div>
        <div className="c1-phase" data-p={gs.phase}>
          {gs.winner?"Round Over":gs.turn==="AI"?"AI thinking…":
           gs.phase==="draw"?"① Draw a card":gs.phase==="act"?"② Meld / Lay off":null}
        </div>
        <nav className="c1-nav">
          <button className="c1-btn" onClick={()=>setShowNew(true)}>New Game</button>
          <button className="c1-btn" onClick={()=>setShowRules(true)}>Rules</button>
          <button className="c1-btn red" onClick={onQuit}>Quit</button>
        </nav>
      </header>

      <div className="c1-scores">
        <span className="c1-score-tag">Round {gs.round}</span>
        <span className="c1-score-you">You: <b>{gs.totalScores?.Human??0}</b></span>
        <span className="c1-score-ai">AI: <b>{gs.totalScores?.AI??0}</b></span>
        <span className="c1-score-tag">→ {cfg.targetScore} to win</span>
        <span className="c1-cans">Canastas — You: {gs.canastas.Human||0} · AI: {gs.canastas.AI||0}</span>
        {gs.winner&&<span className="c1-rndbadge">{gs.winner==="draw"?"Draw!":gs.winner+" wins round!"}</span>}
      </div>

      <main className="c1-layout">
        {/* LEFT */}
        <aside className="c1-aside">
          <div className="c1-piles">
            {/* Stock */}
            <div className="c1-pile">
              <div className="c1-pile-lbl">Stock <span className="c1-cnt">{gs.stock.length}</span></div>
              <div className="c1-pile-slot">{gs.stock.length?<CB size="lg"/>:<span className="c1-empty">Empty</span>}</div>
              <button className="c1-btn full sm mt" disabled={!canDraw} onClick={doDrawStock}>[D] Draw Stock</button>
            </div>
            {/* Discard */}
            <div className={`c1-pile${isFrozen?" c1-frozen":""}`}>
              <div className="c1-pile-lbl">Discard <span className="c1-cnt">{gs.discard.length}</span>{isFrozen&&<span className="c1-fztag">FROZEN</span>}</div>
              <div className="c1-fan">
                {dPrev2&&<div className="fan-2"><CB size="sm"/></div>}
                {dPrev&&<div className="fan-1"><CB size="sm"/></div>}
                {dTop&&<div className="fan-0"><CF c={dTop} size="lg"/></div>}
                {!dTop&&<span className="c1-empty">Empty</span>}
              </div>
              <button className="c1-btn full sm mt" disabled={!canDraw||!canTake(gs,"Human")}
                title={canTake(gs,"Human")?"Take discard pile":isFrozen?"Frozen — need 2 naturals of top rank":"Need 2 naturals of top rank or an existing meld"}
                onClick={doTakeDiscard}>Take Discard</button>
            </div>
          </div>

          <div className="c1-actrow">
            <button className="c1-btn act" disabled={!canAct||!validMeld(selCards)} onClick={doMeld}>
              Meld Selected ({selCards.length})
            </button>
            <button className="c1-btn act red" disabled={!canAct||selCards.length!==1} onClick={doDiscard}>
              [Space] Discard
            </button>
          </div>

          {selCards.length>0&&(
            <div className="c1-selinfo">
              {selCards.map(pc).join(", ")} — {mPts(selCards)} pts
              {validMeld(selCards)&&<span className="c1-valid"> ✓ valid meld</span>}
              {selCards.some(c=>c.isWild)&&<span className="c1-wildwarn"> ⚠ wild selected</span>}
            </div>
          )}

          {/* Initial meld progress */}
          {!gs.metInit.Human&&cfg.initPts>0&&(
            <div className="c1-initbar">
              <div className="c1-initbar-lbl">Opening meld progress ({cfg.initPts} pts needed)</div>
              <div className="c1-bar"><div className="c1-bar-fill" style={{width:`${initPct}%`}}/></div>
            </div>
          )}

          {/* Coach */}
          {cfg.coach&&coach.length>0&&(
            <div className="c1-coach">
              <div className="c1-coach-hdr">💡 Coach</div>
              {coach.slice(0,6).map((t,i)=>(
                <div key={i} className={`c1-tip c1-tip-${t.k}`}>{t.t}</div>
              ))}
            </div>
          )}

          {/* Log */}
          <div className="c1-log">
            <div className="c1-log-hdr">Game Log</div>
            <div className="c1-log-body">
              {gs.log.map((l,i)=><div key={i} className="c1-log-line">{l}</div>)}
            </div>
          </div>
        </aside>

        {/* CENTER: Melds */}
        <div className="c1-melds-col">
          {[["Human","Your Melds"],["AI","AI's Melds"]].map(([owner,title])=>(
            <div key={owner} className="c1-melds-panel">
              <div className="c1-melds-hdr">{title}</div>
              {!(gs.melds[owner]||[]).length&&<div className="c1-empty-txt">No melds yet.</div>}
              {(gs.melds[owner]||[]).map((meld,idx)=>{
                const can=isCanasta(meld), ntcan=isNatCan(meld), rank=meldRank(meld);
                return (
                  <div key={idx} className={`c1-meld${can?(ntcan?" natcan":" mixcan"):""}`}>
                    <div className="c1-meld-meta">
                      <span className="c1-meld-rank">{rank}</span>
                      <span className="c1-meld-n">{meld.length} cards</span>
                      {can&&<span className="c1-can-badge">{ntcan?"★ Natural":"⚑ Mixed"} Canasta</span>}
                      {isHT&&canAct&&<button className="c1-btn xs" onClick={()=>doLayoff(owner,idx)}>+ Lay off</button>}
                    </div>
                    <div className="c1-meld-cards">
                      {meld.map(c=><span key={c.id} className={`c1-chip${c.isWild?" wild":""}`}>{pc(c)}</span>)}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          {cfg.red3s&&(
            <div className="c1-red3">
              <span>🔴 Red 3s: You {gs.red3s?.Human||0} (+{(gs.red3s?.Human||0)*100}) · AI {gs.red3s?.AI||0} (+{(gs.red3s?.AI||0)*100})</span>
            </div>
          )}
        </div>

        {/* RIGHT: Hands */}
        <div className="c1-hands-col">
          <div className="c1-hand-panel">
            <div className="c1-hand-lbl">AI's Hand ({aHand.length})</div>
            <div className="c1-hand ai-h">
              {aHand.map(c=>c._h?<CB key={c.id} size="sm"/>:<CF key={c.id} c={c} size="sm"/>)}
            </div>
          </div>
          <div className="c1-hand-panel human-hp">
            <div className="c1-hand-lbl">Your Hand ({hHand.length})
              {!gs.metInit.Human&&cfg.initPts>0&&<span className="c1-initnote"> — open with ≥{cfg.initPts} pts</span>}
            </div>
            <div className="c1-hand human-h">
              {hHand.map(c=>(
                <CF key={c.id} c={c} sel={sel.includes(c.id)} onClick={()=>setSel(p=>p.includes(c.id)?p.filter(i=>i!==c.id):[...p,c.id])} disabled={!isHT} size="md"/>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* ── ROUND SCORE MODAL ── */}
      {showScore&&gs.roundScores&&(
        <div className="c1-modal-wrap">
          <div className="c1-modal score-modal">
            <div className="c1-modal-title">{matchWin?`🏆 ${matchWin} wins the match!`:`Round ${gs.round} Results`}</div>
            <div className="score-grid">
              {[["You","Human"],["AI","AI"]].map(([lbl,pl])=>{
                const ms=gs.melds[pl]||[];
                const mT=ms.reduce((s,m)=>s+mPts(m),0);
                const cT=ms.filter(isNatCan).length*NAT_CAN+ms.filter(m=>isCanasta(m)&&!isNatCan(m)).length*MIX_CAN;
                const r3=cfg.red3s?(gs.red3s?.[pl]||0)*RED3_BONUS:0;
                const go=gs.goer===pl?GOOUT_BONUS:0;
                const pen=hPen(gs.hands[pl]);
                return (
                  <div key={pl} className="score-col">
                    <div className="score-col-hdr">{lbl}</div>
                    <div className="score-row"><span>Melded cards</span><span>+{mT}</span></div>
                    {cT>0&&<div className="score-row"><span>Canasta bonuses</span><span>+{cT}</span></div>}
                    {r3>0&&<div className="score-row"><span>Red 3s</span><span>+{r3}</span></div>}
                    {go>0&&<div className="score-row"><span>Going out</span><span>+{go}</span></div>}
                    {pen>0&&<div className="score-row bad"><span>Hand penalty</span><span>−{pen}</span></div>}
                    <div className="score-row tot"><span>Round</span><span>{gs.roundScores[pl]>=0?"+":""}{gs.roundScores[pl]}</span></div>
                    <div className="score-row match"><span>Match total</span><span>{gs.totalScores[pl]}</span></div>
                  </div>
                );
              })}
            </div>
            <div className="c1-modal-btns">
              {matchWin
                ?<button className="c1-btn" onClick={()=>{setShowScore(false);setShowNew(true);}}>New Match</button>
                :<button className="c1-btn primary" onClick={()=>nextRound(gs)}>Next Round →</button>}
            </div>
          </div>
        </div>
      )}

      {/* ── NEW GAME ── */}
      {showNew&&(
        <div className="c1-modal-wrap" onClick={()=>setShowNew(false)}>
          <div className="c1-modal" onClick={e=>e.stopPropagation()}>
            <div className="c1-modal-title">New Game — Classic Canasta</div>
            <div className="c1-form">
              <label>Hand size<input type="number" min={7} max={15} value={cfg.handSize} onChange={e=>setCfg({...cfg,handSize:+e.target.value})}/></label>
              <label>Decks<select value={cfg.numDecks} onChange={e=>setCfg({...cfg,numDecks:+e.target.value})}><option value={1}>1</option><option value={2}>2 (Classic)</option><option value={3}>3</option></select></label>
              <label>Opening meld pts<select value={cfg.initPts} onChange={e=>setCfg({...cfg,initPts:+e.target.value})}>{[0,15,50,90,120].map(v=><option key={v} value={v}>{v}</option>)}</select></label>
              <label>Target score (match)<input type="number" min={1000} max={15000} step={500} value={cfg.targetScore} onChange={e=>setCfg({...cfg,targetScore:+e.target.value})}/></label>
              <label>AI Strength (1–8)<input type="range" min={1} max={8} value={cfg.aiStr} onChange={e=>setCfg({...cfg,aiStr:+e.target.value})}/><span className="c1-sub">{cfg.aiStr}</span></label>
              {[["jokers","Include Jokers"],["red3s","Red 3 bonuses"],["fastAI","Fast AI"],["coach","Coach Mode"],["showAI","Show AI Hand"]].map(([k,lbl])=>(
                <label key={k} className="ck"><input type="checkbox" checked={!!cfg[k]} onChange={e=>setCfg({...cfg,[k]:e.target.checked})}/>{lbl}</label>
              ))}
            </div>
            <div className="c1-modal-btns">
              <button className="c1-btn primary" onClick={start}>Start</button>
              <button className="c1-btn" onClick={()=>setShowNew(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── RULES ── */}
      {showRules&&(
        <div className="c1-modal-wrap" onClick={()=>setShowRules(false)}>
          <div className="c1-modal rules-m" onClick={e=>e.stopPropagation()}>
            <div className="c1-modal-title">Classic Canasta — Rules</div>
            <div className="c1-rules">
              <h4>Your Turn</h4>
              <ol><li><b>Draw</b> one card from Stock, or take the top Discard (conditions apply).</li>
              <li><b>Meld/Lay off</b> — optional: create melds or add cards to existing ones.</li>
              <li><b>Discard</b> exactly one card to end your turn.</li></ol>
              <h4>Melds</h4><p>3+ cards of the same rank. ≥2 naturals. Naturals ≥ wilds (2s and Jokers).</p>
              <h4>Canasta = 7+ cards of the same rank</h4>
              <p>Natural (no wilds): +500 pts. Mixed (wilds ok): +300 pts.</p>
              <h4>Taking the Discard Pile</h4>
              <p>Need 2 naturals of top card's rank in hand, OR an existing meld of that rank.</p>
              <p><b>Frozen pile</b> (wild on top): same conditions apply — 2 naturals always works.</p>
              <h4>Going Out</h4><p>Need ≥1 canasta first. Empty your hand by discarding your last card.</p>
              <h4>Scoring</h4>
              <ul><li>Melded card values + Natural canasta +500 + Mixed +300</li>
              <li>Red 3 each +100 · Going out +100</li>
              <li>Minus value of cards left in hand</li></ul>
              <h4>Card Values</h4>
              <p>Joker 50 · 2/A 20 · 8–K 10 · 4–7 5 · 3 5</p>
            </div>
            <div className="c1-modal-btns"><button className="c1-btn" onClick={()=>setShowRules(false)}>Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
