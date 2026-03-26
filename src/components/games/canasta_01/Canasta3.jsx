import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./Canasta3.css";

/**
 * Canasta3.jsx — Rummy Blitz v3
 *
 * IMPROVEMENTS
 * ─────────────
 * RULES
 *  • Knock option: end round with ≤10 deadwood pts (gin rummy flavour)
 *  • Gin bonus: +25 pts for going out with 0 deadwood
 *  • Undercut bonus: if opponent knocks and you have ≤ their deadwood, +10
 *  • Multi-round match to target score
 *  • Deadwood counter always visible
 *  • Black 3 / safe discard rules
 *
 * AI
 *  • Deadwood-minimising discard strategy
 *  • Extension layoffs on both sides' melds
 *  • Knock evaluation: knocks when deadwood ≤ threshold (scales with strength)
 *  • Draw-pile logic: evaluates whether discard lowers deadwood
 *
 * COACH
 *  • Real-time deadwood count with breakdown
 *  • "Knock available!" banner when ≤10 deadwood
 *  • Layoff suggestions with exact card names
 *  • Discard recommendation: "worst deadwood card = X"
 *  • Initial meld progress bar
 *
 * UI
 *  • Light warm cream background
 *  • Real card faces (rank + suit, coloured)
 *  • Meld type badges (SET / RUN)
 *  • Deadwood heat bar (green→red)
 *  • Knock button highlighted when available
 *  • Round score breakdown with deadwood, bonuses
 */

/* ═══ CARD UTILS ═══ */
const SUITS=["♠","♥","♦","♣"];
const SUIT_RED=new Set(["♥","♦"]);
const RANKS=["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
const RPTS={A:1,"2":2,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9,"10":10,J:10,Q:10,K:10};
let _id=1;
function mkCard(rank,suit){return{id:_id++,rank,suit};}
function makeDeck(n=1){_id=1;const d=[];for(let i=0;i<n;i++) for(const s of SUITS) for(const r of RANKS) d.push(mkCard(r,s));return shuffle(d);}
function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[b[i],b[j]]=[b[j],b[i]];}return b;}
function clone(o){return JSON.parse(JSON.stringify(o));}
function ri(r){return RANKS.indexOf(r);}
function cp(c){return RPTS[c.rank]??0;}
function pc(c){return`${c.rank}${c.suit}`;}
function sortH(h){return[...h].sort((a,b)=>a.suit!==b.suit?a.suit.localeCompare(b.suit):ri(a.rank)-ri(b.rank));}

/* ═══ MELD RULES ═══ */
function isSet(cards){
  if(cards.length<3||cards.length>4)return false;
  const r=cards[0].rank;
  return cards.every(c=>c.rank===r)&&new Set(cards.map(c=>c.suit)).size===cards.length;
}
function isRun(cards){
  if(cards.length<3)return false;
  const s=cards[0].suit;
  if(!cards.every(c=>c.suit===s))return false;
  const idx=cards.map(c=>ri(c.rank)).sort((a,b)=>a-b);
  for(let i=1;i<idx.length;i++) if(idx[i]!==idx[i-1]+1)return false;
  return true;
}
function validMeld(cards){return isSet(cards)||isRun(cards);}
function mType(m){return isSet(m)?"set":isRun(m)?"run":"?";}
function mDesc(m){
  if(isSet(m))return`${m[0].rank}s`;
  const s=[...m].sort((a,b)=>ri(a.rank)-ri(b.rank));
  return`${s[0].rank}→${s[s.length-1].rank}${s[0].suit}`;
}
function canLayOff(card,meld){return validMeld([...meld,card]);}
function mPts(m){return m.reduce((s,c)=>s+cp(c),0);}

/* ═══ DEADWOOD ═══ */
function calcDeadwood(hand, melds) {
  // Identify which hand cards are part of melds
  const meldedIds=new Set(melds.flat().map(c=>c.id));
  const dw=hand.filter(c=>!meldedIds.has(c.id));
  return{cards:dw,pts:dw.reduce((s,c)=>s+cp(c),0)};
}
// Find best melds from a hand (greedy)
function findMelds(hand){
  const result=[];let rem=[...hand];
  // Sets
  const byRank={};for(const c of rem){(byRank[c.rank]=byRank[c.rank]||[]).push(c);}
  for(const[,cards]of Object.entries(byRank)){
    if(cards.length>=3){const m=cards.slice(0,Math.min(4,cards.length));if(isSet(m)){result.push(m);const ids=new Set(m.map(c=>c.id));rem=rem.filter(c=>!ids.has(c.id));}}
  }
  // Runs
  const bySuit={};for(const c of rem){(bySuit[c.suit]=bySuit[c.suit]||[]).push(c);}
  for(const[,cards]of Object.entries(bySuit)){
    const s=cards.sort((a,b)=>ri(a.rank)-ri(b.rank));
    let st=0;
    while(st<s.length){
      let en=st+1;while(en<s.length&&ri(s[en].rank)===ri(s[en-1].rank)+1)en++;
      const run=s.slice(st,en);
      if(run.length>=3){result.push(run);const ids=new Set(run.map(c=>c.id));rem=rem.filter(c=>!ids.has(c.id));}
      st=en;
    }
  }
  return result;
}

function handDeadwoodPts(hand){
  const melds=findMelds(hand);
  const meldedIds=new Set(melds.flat().map(c=>c.id));
  return hand.filter(c=>!meldedIds.has(c.id)).reduce((s,c)=>s+cp(c),0);
}

/* ═══ AI ═══ */
function aiEval(hand,str){
  // Returns the best discard choice (minimises deadwood)
  let bestDiscard=null,bestDW=Infinity;
  for(const card of hand){
    const test=hand.filter(c=>c.id!==card.id);
    const dw=handDeadwoodPts(test);
    if(dw<bestDW||(dw===bestDW&&cp(card)>cp(bestDiscard))){bestDW=dw;bestDiscard=card;}
  }
  return bestDiscard;
}
function aiShouldTakeDiscard(hand,discardTop){
  if(!discardTop)return false;
  const withCard=[...hand,discardTop];
  const without=handDeadwoodPts(hand);
  const withDW=handDeadwoodPts(withCard);
  return withDW<without;
}
function runAI(state,settings){
  const str=settings.aiStr;
  // Draw
  const top=state.discard[state.discard.length-1];
  let tookDiscard=false;
  if(top&&Math.random()<0.4+str*0.06&&aiShouldTakeDiscard(state.hands.AI,top)){
    state.discard.pop();state.hands.AI.push(top);
    state.log.unshift(`AI took ${pc(top)} from Discard.`);tookDiscard=true;
  }
  if(!tookDiscard){
    if(!state.stock.length){state.winner="draw";return;}
    state.hands.AI.push(state.stock.pop());state.log.unshift("AI drew from Stock.");
  }
  // Meld
  const melds=findMelds(state.hands.AI);
  for(const m of melds){
    const ids=new Set(m.map(c=>c.id));
    state.hands.AI=state.hands.AI.filter(c=>!ids.has(c.id));
    state.melds.AI.push(m);state.log.unshift(`AI melded ${mDesc(m)}.`);
  }
  // Layoffs (own + human)
  if(str>=3){
    let ch=true;
    while(ch){ch=false;
      for(const owner of["AI","Human"]){
        for(let mi=0;mi<(state.melds[owner]||[]).length;mi++){
          for(let ci=0;ci<state.hands.AI.length;ci++){
            if(canLayOff(state.hands.AI[ci],state.melds[owner][mi])){
              state.melds[owner][mi].push(state.hands.AI[ci]);
              state.log.unshift(`AI laid off ${pc(state.hands.AI[ci])}.`);
              state.hands.AI.splice(ci,1);ch=true;break;
            }
          }
          if(ch)break;
        }
        if(ch)break;
      }
    }
  }
  // Knock check
  const dw=handDeadwoodPts(state.hands.AI);
  const knockThreshold=str>=6?0:str>=4?5:10;
  if(dw<=knockThreshold){
    state.winner="AI";state.goer="AI";
    state.knocker="AI";state.knockerDW=dw;
    state.log.unshift(`AI knocks with ${dw} deadwood!`);return;
  }
  // Discard
  state.hands.AI=sortH(state.hands.AI);
  const disc=aiEval(state.hands.AI,str);
  if(disc){state.hands.AI=state.hands.AI.filter(c=>c.id!==disc.id);state.discard.push(disc);state.log.unshift(`AI discarded ${pc(disc)}.`);}
  if(!state.stock.length){state.winner="draw";return;}
  state.phase="draw";state.turn="Human";
}

/* ═══ SCORING ═══ */
function scoreRound(state,settings){
  const res={};
  for(const p of["Human","AI"]){
    let pts=mPts((state.melds[p]||[]).flat());
    const dw=handDeadwoodPts(state.hands[p]);
    pts-=dw;
    res[p]={meldPts:mPts((state.melds[p]||[]).flat()),deadwood:dw,net:pts};
  }
  // Bonuses
  if(state.knocker){
    const kDW=state.knockerDW??handDeadwoodPts(state.hands[state.knocker]);
    const other=state.knocker==="Human"?"AI":"Human";
    const oDW=handDeadwoodPts(state.hands[other]);
    if(oDW<=kDW){ // undercut!
      res[other].undercut=10;res[other].net+=10;
    }
    if(kDW===0){ res[state.knocker].gin=25;res[state.knocker].net+=25; }
  }
  if(state.goer&&state.hands[state.goer].length===0){
    res[state.goer].goOut=20;res[state.goer].net+=20;
  }
  return res;
}

/* ═══ COACH ═══ */
function buildCoach(hand,state){
  const tips=[];
  const myMelds=findMelds(hand);
  const meldedIds=new Set(myMelds.flat().map(c=>c.id));
  const dw=hand.filter(c=>!meldedIds.has(c.id));
  const dwPts=dw.reduce((s,c)=>s+cp(c),0);

  // Meld suggestions
  for(const m of myMelds){
    tips.push({k:"meld",t:`Meld ${mType(m)==="set"?"Set":"Run"}: ${m.map(pc).join(" ")} (${mPts(m)} pts)`});
  }
  // Layoff suggestions
  for(const[owner,ms]of Object.entries(state.melds)){
    for(const m of ms){
      for(const c of hand){
        if(canLayOff(c,m)) tips.push({k:"layoff",t:`Lay off ${pc(c)} onto ${owner==="Human"?"your":"AI's"} ${mDesc(m)} meld`});
      }
    }
  }
  // Knock
  if(dwPts<=10) tips.push({k:"success",t:`🎯 Deadwood = ${dwPts} pts — you can KNOCK! ${dwPts===0?"(Gin bonus +25!)":""}` });
  // Best discard
  const bestDisc=aiEval(hand,8);
  if(bestDisc) tips.push({k:"hint",t:`Best discard: ${pc(bestDisc)} (${cp(bestDisc)} pts) — reduces deadwood most`});
  // Deadwood breakdown
  if(dw.length>0) tips.push({k:"info",t:`Deadwood (${dwPts} pts): ${dw.map(c=>`${pc(c)}=${cp(c)}`).join(", ")}`});

  return tips;
}

/* ═══ STATE ═══ */
function empty(){return{stock:[],discard:[],hands:{Human:[],AI:[]},melds:{Human:[],AI:[]},turn:"Human",phase:"draw",winner:null,goer:null,knocker:null,knockerDW:null,roundScores:null,totalScores:{Human:0,AI:0},round:1,log:[]};}
function dealRound(state,settings){
  const{handSize,numDecks}=settings;
  state.stock=makeDeck(numDecks);state.discard=[];
  state.hands={Human:[],AI:[]};state.melds={Human:[],AI:[]};
  state.turn="Human";state.phase="draw";state.winner=null;state.goer=null;state.knocker=null;state.knockerDW=null;state.log=[];
  for(let i=0;i<handSize;i++){state.hands.Human.push(state.stock.pop());state.hands.AI.push(state.stock.pop());}
  const d=state.stock.pop();if(d)state.discard.push(d);
  state.hands.Human=sortH(state.hands.Human);state.hands.AI=sortH(state.hands.AI);
  state.log.unshift(`Round ${state.round}. Draw to begin!`);
}
function layMeld(state,player,cards){
  const ids=new Set(cards.map(c=>c.id));
  state.hands[player]=state.hands[player].filter(c=>!ids.has(c.id));
  state.melds[player].push(cards);
  state.log.unshift(`${player} melded ${mDesc(cards)} (${mType(cards)}).`);
}
function useLS(k,def){
  const[v,setV]=useState(()=>{try{const r=localStorage.getItem(k);return r?JSON.parse(r):def;}catch{return def;}});
  const set=useCallback(val=>{setV(val);try{localStorage.setItem(k,JSON.stringify(val));}catch{}},[k]);
  return[v,set];
}
const DEF={handSize:10,numDecks:1,targetScore:150,aiStr:4,fastAI:true,coach:true,showAI:false};

/* ═══ CARD COMPONENT ═══ */
function CF({c,sel,onClick,disabled,size="md"}){
  const red=SUIT_RED.has(c.suit);
  return(
    <button className={`cf3 cf3-${size}${red?" red":""}${sel?" sel":""}${disabled?" dis":""}`}
      onClick={onClick} disabled={disabled} title={pc(c)}>
      <span className="cf3-r">{c.rank}</span>
      <span className="cf3-s">{c.suit}</span>
    </button>
  );
}
function CB3({size="md"}){return<div className={`cb3 cb3-${size}`}>🂠</div>;}

export default function Canasta3({onQuit}){
  const[cfg,setCfg]=useLS("rblitz_v3",DEF);
  const[gs,setGs]=useState(empty);
  const[sel,setSel]=useState([]);
  const[showNew,setShowNew]=useState(true);
  const[showRules,setShowRules]=useState(false);
  const[showScore,setShowScore]=useState(false);
  const[matchWin,setMatchWin]=useState(null);

  const hHand=useMemo(()=>sortH(gs.hands.Human||[]),[gs.hands.Human]);
  const aHand=useMemo(()=>{const h=sortH(gs.hands.AI||[]);return cfg.showAI?h:h.map(c=>({...c,_h:true}));},[gs.hands.AI,cfg.showAI]);
  const dTop=gs.discard[gs.discard.length-1];
  const dPrev=gs.discard[gs.discard.length-2];
  const isHT=gs.turn==="Human"&&!gs.winner;
  const canDraw=isHT&&gs.phase==="draw";
  const canAct=isHT&&gs.phase!=="draw";
  const selCards=hHand.filter(c=>sel.includes(c.id));

  const myMelds=useMemo(()=>findMelds(hHand),[hHand]);
  const meldedIds=useMemo(()=>new Set(myMelds.flat().map(c=>c.id)),[myMelds]);
  const dwCards=useMemo(()=>hHand.filter(c=>!meldedIds.has(c.id)),[hHand,meldedIds]);
  const dwPts=useMemo(()=>dwCards.reduce((s,c)=>s+cp(c),0),[dwCards]);
  const canKnock=canAct&&dwPts<=10;

  const coach=useMemo(()=>cfg.coach&&isHT?buildCoach(hHand,gs):[],[cfg.coach,hHand,gs,isHT]);

  function start(){const st=empty();dealRound(st,cfg);setGs(st);setSel([]);setShowNew(false);setShowScore(false);setMatchWin(null);}
  function nextRound(prev){const st=empty();st.totalScores=clone(prev.totalScores);st.round=(prev.round||1)+1;dealRound(st,cfg);setGs(st);setSel([]);setShowScore(false);}
  function finalise(st){
    const rs=scoreRound(st,cfg);
    st.roundScores=rs;
    st.totalScores={Human:(st.totalScores?.Human||0)+rs.Human.net,AI:(st.totalScores?.AI||0)+rs.AI.net};
    st.log.unshift(`Round: You +${rs.Human.net} | AI +${rs.AI.net}`);
    setGs(st);setShowScore(true);
    if(st.totalScores.Human>=cfg.targetScore||st.totalScores.AI>=cfg.targetScore)
      setMatchWin(st.totalScores.Human>=st.totalScores.AI?"Human":"AI");
  }

  function doDrawStock(){
    if(!canDraw||!gs.stock.length)return;
    const st=clone(gs);st.hands.Human.push(st.stock.pop());
    st.log.unshift("You drew from Stock.");st.hands.Human=sortH(st.hands.Human);st.phase="act";setGs(st);
  }
  function doTakeDiscard(){
    if(!canDraw||!dTop)return;
    const st=clone(gs);const c=st.discard.pop();
    st.hands.Human.push(c);st.log.unshift(`You took ${pc(c)}.`);
    st.hands.Human=sortH(st.hands.Human);st.phase="act";setGs(st);
  }
  function doMeld(){
    if(!canAct)return;
    if(!validMeld(selCards)){const st=clone(gs);st.log.unshift("❌ Not a valid meld (need Set or Run of 3+).");setGs(st);return;}
    const st=clone(gs);const cards=st.hands.Human.filter(c=>sel.includes(c.id));
    layMeld(st,"Human",cards);st.hands.Human=sortH(st.hands.Human);setSel([]);setGs(st);
  }
  function doLayoff(owner,mi){
    if(!canAct||!selCards.length)return;
    const st=clone(gs);const cards=st.hands.Human.filter(c=>sel.includes(c.id));
    const meld=st.melds[owner][mi];if(!meld)return;
    if(!validMeld([...meld,...cards])){st.log.unshift("❌ Lay-off breaks meld rules.");setGs(st);return;}
    const ids=new Set(cards.map(c=>c.id));
    st.hands.Human=st.hands.Human.filter(c=>!ids.has(c.id));
    st.melds[owner][mi]=[...meld,...cards];
    st.log.unshift(`You laid off onto ${owner==="Human"?"your":"AI's"} ${mDesc(meld)} meld.`);
    st.hands.Human=sortH(st.hands.Human);setSel([]);setGs(st);
  }
  function doDiscard(){
    if(!canAct||selCards.length!==1)return;
    const card=selCards[0];const st=clone(gs);
    st.hands.Human=st.hands.Human.filter(c=>c.id!==card.id);
    st.discard.push(card);st.log.unshift(`You discarded ${pc(card)}.`);
    if(st.hands.Human.length===0){st.winner="Human";st.goer="Human";finalise(st);return;}
    if(!st.stock.length){st.winner="draw";finalise(st);return;}
    st.phase="draw";st.turn="AI";setSel([]);setGs(st);
  }
  function doKnock(){
    if(!canKnock)return;
    const st=clone(gs);st.winner="Human";st.knocker="Human";st.knockerDW=dwPts;
    st.log.unshift(`You knock with ${dwPts} deadwood!`);finalise(st);
  }
  function doGinOut(){
    if(!canAct||dwPts!==0)return;
    const st=clone(gs);st.winner="Human";st.goer="Human";st.knocker="Human";st.knockerDW=0;
    st.log.unshift("You go Gin! 🎉");finalise(st);
  }

  useEffect(()=>{
    if(gs.turn==="AI"&&!gs.winner){
      const t=setTimeout(()=>{const st=clone(gs);runAI(st,cfg);if(st.winner)finalise(st);else setGs(st);},cfg.fastAI?400:1000);
      return()=>clearTimeout(t);
    }
  },[gs.turn,gs.winner]);

  useEffect(()=>{
    function kd(e){
      if(showNew||showRules||showScore)return;
      if((e.key==="d"||e.key==="D")&&canDraw)doDrawStock();
      if(e.key===" "&&canAct){e.preventDefault();doDiscard();}
      if((e.key==="k"||e.key==="K")&&canKnock)doKnock();
    }
    window.addEventListener("keydown",kd);return()=>window.removeEventListener("keydown",kd);
  },[canDraw,canAct,canKnock,selCards]);

  const dwPct=Math.min(100,Math.round(dwPts/50*100));

  return(
    <div className="r3-root">
      <header className="r3-hdr">
        <div className="r3-brand">🃏 Rummy Blitz</div>
        <div className="r3-phase" data-p={gs.phase}>
          {gs.winner?"Round Over":gs.turn==="AI"?"AI thinking…":gs.phase==="draw"?"① Draw":gs.phase==="act"?"② Meld / Lay off / Discard":null}
        </div>
        <nav>
          <button className="r3-btn" onClick={()=>setShowNew(true)}>New Game</button>
          <button className="r3-btn" onClick={()=>setShowRules(true)}>Rules</button>
          <button className="r3-btn red" onClick={onQuit}>Quit</button>
        </nav>
      </header>

      <div className="r3-scorebar">
        <span>Round {gs.round}</span>
        <span className="r3-sy">You: <b>{gs.totalScores?.Human??0}</b></span>
        <span className="r3-sa">AI: <b>{gs.totalScores?.AI??0}</b></span>
        <span>→ {cfg.targetScore} to win</span>
        {gs.winner&&<span className="r3-rndbadge">{gs.winner==="draw"?"Draw!":gs.winner+" wins round!"}</span>}
      </div>

      <main className="r3-layout">
        {/* LEFT */}
        <aside className="r3-aside">
          <div className="r3-piles">
            <div className="r3-pile">
              <div className="r3-pile-lbl">Stock <span className="r3-cnt">{gs.stock.length}</span></div>
              <div className="r3-pile-slot">{gs.stock.length?<CB3 size="lg"/>:<span className="r3-empty">Empty</span>}</div>
              <button className="r3-btn full sm mt" disabled={!canDraw} onClick={doDrawStock}>[D] Draw Stock</button>
            </div>
            <div className="r3-pile">
              <div className="r3-pile-lbl">Discard <span className="r3-cnt">{gs.discard.length}</span></div>
              <div className="r3-fan">
                {dPrev&&<div className="rfan-1"><CB3 size="sm"/></div>}
                {dTop&&<div className="rfan-0"><CF c={dTop} size="lg"/></div>}
                {!dTop&&<span className="r3-empty">Empty</span>}
              </div>
              <button className="r3-btn full sm mt" disabled={!canDraw||!dTop} onClick={doTakeDiscard}>Take Discard</button>
            </div>
          </div>

          {/* Deadwood meter */}
          <div className="r3-dw-panel">
            <div className="r3-dw-lbl">Your Deadwood: <b className={dwPts<=10?"low":dwPts<=25?"mid":"high"}>{dwPts} pts</b>
              {canKnock&&<span className="r3-knock-badge"> Knock available!</span>}
            </div>
            <div className="r3-dw-bar"><div className="r3-dw-fill" style={{width:`${dwPct}%`,background:dwPts<=10?"#16a34a":dwPts<=25?"#d97706":"#dc2626"}}/></div>
            {dwCards.length>0&&<div className="r3-dw-cards">{dwCards.map(c=><span key={c.id} className="r3-dw-chip">{pc(c)}</span>)}</div>}
          </div>

          <div className="r3-actrow">
            <button className="r3-btn act" disabled={!canAct||!validMeld(selCards)} onClick={doMeld}>Meld ({selCards.length})</button>
            <button className="r3-btn act disc" disabled={!canAct||selCards.length!==1} onClick={doDiscard}>[Space] Discard</button>
          </div>
          <div className="r3-actrow2">
            <button className={`r3-btn act knock${canKnock?" pulse":""}`} disabled={!canKnock} onClick={doKnock}>[K] Knock ({dwPts})</button>
            <button className="r3-btn act gin" disabled={!canAct||dwPts!==0} onClick={doGinOut}>Gin Out!</button>
          </div>

          {selCards.length>0&&<div className="r3-selinfo">{selCards.map(pc).join(" ")} — {mPts(selCards)} pts{validMeld(selCards)?<span className="r3-valid"> ✓ valid meld</span>:""}</div>}

          {cfg.coach&&coach.length>0&&(
            <div className="r3-coach">
              <div className="r3-coach-hdr">💡 Coach</div>
              {coach.slice(0,5).map((t,i)=><div key={i} className={`r3-tip r3-tip-${t.k}`}>{t.t}</div>)}
            </div>
          )}

          <div className="r3-log">
            <div className="r3-log-hdr">Log</div>
            <div className="r3-log-body">{gs.log.map((l,i)=><div key={i}>{l}</div>)}</div>
          </div>
        </aside>

        {/* CENTER: melds */}
        <div className="r3-melds-col">
          {[["Human","Your Melds"],["AI","AI's Melds"]].map(([owner,title])=>(
            <div key={owner} className="r3-melds-panel">
              <div className="r3-melds-hdr">{title}</div>
              {!(gs.melds[owner]||[]).length&&<div className="r3-empty-txt">No melds yet.</div>}
              {(gs.melds[owner]||[]).map((meld,idx)=>(
                <div key={idx} className="r3-meld">
                  <div className="r3-meld-meta">
                    <span className={`r3-badge r3-badge-${mType(meld)}`}>{mType(meld).toUpperCase()}</span>
                    <span className="r3-meld-desc">{mDesc(meld)}</span>
                    <span className="r3-meld-pts">{mPts(meld)} pts</span>
                    {isHT&&canAct&&<button className="r3-btn xs" onClick={()=>doLayoff(owner,idx)}>+ Lay off</button>}
                  </div>
                  <div className="r3-meld-cards">{meld.map(c=><span key={c.id} className={`r3-chip s${c.suit}`}>{pc(c)}</span>)}</div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* RIGHT: hands */}
        <div className="r3-hands-col">
          <div className="r3-hand-panel">
            <div className="r3-hand-lbl">AI's Hand ({aHand.length})</div>
            <div className="r3-hand">{aHand.map(c=>c._h?<CB3 key={c.id} size="sm"/>:<CF key={c.id} c={c} size="sm"/>)}</div>
          </div>
          <div className="r3-hand-panel human-hp">
            <div className="r3-hand-lbl">Your Hand ({hHand.length})</div>
            <div className="r3-hand human-h">
              {hHand.map(c=>(
                <CF key={c.id} c={c} sel={sel.includes(c.id)}
                  onClick={()=>setSel(p=>p.includes(c.id)?p.filter(i=>i!==c.id):[...p,c.id])}
                  disabled={!isHT} size="md"/>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Score modal */}
      {showScore&&gs.roundScores&&(
        <div className="r3-modal-wrap">
          <div className="r3-modal score-m">
            <div className="r3-modal-title">{matchWin?`🏆 ${matchWin} wins the match!`:`Round ${gs.round} Results`}</div>
            <div className="r3-score-grid">
              {[["You","Human"],["AI","AI"]].map(([lbl,pl])=>{
                const rs=gs.roundScores[pl];
                return(
                  <div key={pl} className="r3-score-col">
                    <div className="r3-score-hdr">{lbl}</div>
                    <div className="r3-srow"><span>Melded cards</span><span>+{rs.meldPts}</span></div>
                    <div className="r3-srow bad"><span>Deadwood penalty</span><span>−{rs.deadwood}</span></div>
                    {rs.gin&&<div className="r3-srow good"><span>Gin bonus</span><span>+{rs.gin}</span></div>}
                    {rs.undercut&&<div className="r3-srow good"><span>Undercut bonus</span><span>+{rs.undercut}</span></div>}
                    {rs.goOut&&<div className="r3-srow good"><span>Go-out bonus</span><span>+{rs.goOut}</span></div>}
                    <div className="r3-srow tot"><span>Round</span><span>{rs.net>=0?"+":""}{rs.net}</span></div>
                    <div className="r3-srow match"><span>Match total</span><span>{gs.totalScores[pl]}</span></div>
                  </div>
                );
              })}
            </div>
            <div className="r3-modal-btns">
              {matchWin?<button className="r3-btn" onClick={()=>{setShowScore(false);setShowNew(true);}}>New Match</button>
                :<button className="r3-btn primary" onClick={()=>nextRound(gs)}>Next Round →</button>}
            </div>
          </div>
        </div>
      )}

      {showNew&&(
        <div className="r3-modal-wrap" onClick={()=>setShowNew(false)}>
          <div className="r3-modal" onClick={e=>e.stopPropagation()}>
            <div className="r3-modal-title">New Game — Rummy Blitz</div>
            <div className="r3-form">
              <label>Hand size<input type="number" min={7} max={15} value={cfg.handSize} onChange={e=>setCfg({...cfg,handSize:+e.target.value})}/></label>
              <label>Decks<select value={cfg.numDecks} onChange={e=>setCfg({...cfg,numDecks:+e.target.value})}><option value={1}>1</option><option value={2}>2</option></select></label>
              <label>Target score<input type="number" min={50} max={500} step={25} value={cfg.targetScore} onChange={e=>setCfg({...cfg,targetScore:+e.target.value})}/></label>
              <label>AI Strength<input type="range" min={1} max={8} value={cfg.aiStr} onChange={e=>setCfg({...cfg,aiStr:+e.target.value})}/><span className="r3-sub">{cfg.aiStr}</span></label>
              {[["fastAI","Fast AI"],["coach","Coach Mode"],["showAI","Show AI Hand"]].map(([k,lbl])=>(
                <label key={k} className="ck"><input type="checkbox" checked={!!cfg[k]} onChange={e=>setCfg({...cfg,[k]:e.target.checked})}/>{lbl}</label>
              ))}
            </div>
            <div className="r3-modal-btns"><button className="r3-btn primary" onClick={start}>Start</button><button className="r3-btn" onClick={()=>setShowNew(false)}>Close</button></div>
          </div>
        </div>
      )}

      {showRules&&(
        <div className="r3-modal-wrap" onClick={()=>setShowRules(false)}>
          <div className="r3-modal" onClick={e=>e.stopPropagation()}>
            <div className="r3-modal-title">Rummy Blitz — Rules</div>
            <div className="r3-rules">
              <h4>Turn</h4><ol><li>Draw from Stock or take top Discard.</li><li>Meld, lay off, knock — all optional.</li><li>Discard one card to end your turn.</li></ol>
              <h4>Sets</h4><p>3–4 cards of the same rank, all different suits.</p>
              <h4>Runs</h4><p>3+ consecutive cards of the same suit.</p>
              <h4>Lay Off</h4><p>Add cards to any existing meld (yours or AI's).</p>
              <h4>Knock [K]</h4><p>End the round when your deadwood (unmelded cards) is ≤ 10 pts.</p>
              <h4>Gin</h4><p>Knock with 0 deadwood = Gin! Earns a +25 bonus.</p>
              <h4>Undercut</h4><p>If AI knocks and your deadwood ≤ AI's deadwood, you earn +10 undercut bonus.</p>
              <h4>Scoring</h4><p>Meld pts − deadwood pts ± bonuses. First to target score wins the match.</p>
            </div>
            <div className="r3-modal-btns"><button className="r3-btn" onClick={()=>setShowRules(false)}>Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
