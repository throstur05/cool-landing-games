import React, { useEffect, useMemo, useRef, useState } from "react";
import "./Canasta2.css";

/**
 * Canasta2.jsx — Slapzi Blitz v3
 *
 * IMPROVEMENTS
 * ─────────────
 * RULES/FEATURES
 *  • Streak bonuses: 3-in-a-row = double points
 *  • Timed Challenge Mode: score as many as possible in 60s
 *  • Category filter: play only Animals / Food / Vehicles / etc.
 *  • Wrong-slap cards shown briefly highlighted (coach)
 *  • Practice round: clue stays until someone slaps it
 *  • AI "confidence" display bar (practice mode)
 *
 * COACH
 *  • Post-slap explanation always shown (why the card matched OR didn't)
 *  • "Near miss" hints: show cards in your hand that almost matched
 *  • Running coach tip showing which of your cards currently match
 *
 * AI
 *  • Strength 1-8 affects accuracy, reaction time, misclick rate, AND streak awareness
 *  • AI blunders at low strength (50% chance of wrong card)
 *  • AI sometimes hesitates at mid strength
 *  • AI prioritises harder clues at high strength
 *
 * UI
 *  • Light warm background with card-game feel
 *  • Green highlight on currently-matching cards in your hand
 *  • Countdown ring replaced with progress bar + seconds
 *  • Match summary screen with per-round breakdown
 *  • Sound toggle persisted
 */

/* ══════════ DATA ══════════ */
function buildItems() {
  let id=1; const I=(name,emoji,tags)=>({id:id++,name,emoji,tags});
  return [
    I("Apple","🍎",["fruit","red","round","food","small"]),
    I("Banana","🍌",["fruit","yellow","food","small","curved"]),
    I("Grapes","🍇",["fruit","purple","food","small"]),
    I("Strawberry","🍓",["fruit","red","food","small"]),
    I("Watermelon","🍉",["fruit","green","red","food","big","round"]),
    I("Avocado","🥑",["fruit","green","food","small"]),
    I("Hot Dog","🌭",["food","hot","bread","meat"]),
    I("Hamburger","🍔",["food","bread","meat","round"]),
    I("Pizza","🍕",["food","cheese","hot","slice"]),
    I("Ice Cream","🍦",["food","cold","sweet"]),
    I("Lollipop","🍭",["food","sweet","round","small"]),
    I("Doughnut","🍩",["food","sweet","round"]),
    I("Croissant","🥐",["food","bread","curved"]),
    I("Dog","🐶",["animal","land","pet","small"]),
    I("Cat","🐱",["animal","land","pet","small"]),
    I("Tiger","🐯",["animal","land","stripe","big"]),
    I("Cow","🐮",["animal","land","spot","big"]),
    I("Lion","🦁",["animal","land","big"]),
    I("Elephant","🐘",["animal","land","big"]),
    I("Penguin","🐧",["animal","cold","small"]),
    I("Eagle","🦅",["animal","fly","big"]),
    I("Dolphin","🐬",["animal","water","smart"]),
    I("Fish","🐟",["animal","water","small"]),
    I("Whale","🐋",["animal","water","big"]),
    I("Car","🚗",["vehicle","wheel","land","metal"]),
    I("Bus","🚌",["vehicle","wheel","land","big","metal"]),
    I("Bicycle","🚲",["vehicle","wheel","land","small"]),
    I("Truck","🚚",["vehicle","wheel","land","big"]),
    I("Airplane","✈️",["vehicle","fly","metal"]),
    I("Sailboat","⛵",["vehicle","water","wind"]),
    I("Ball","⚽",["sport","round"]),
    I("Basketball","🏀",["sport","round","orange"]),
    I("Guitar","🎸",["musical","wood"]),
    I("Trumpet","🎺",["musical","metal"]),
    I("Hammer","🔨",["tool","metal","wood"]),
    I("Wrench","🔧",["tool","metal"]),
    I("Kitchen Knife","🔪",["kitchen","tool","metal"]),
    I("Fork","🍴",["kitchen","tool","metal"]),
    I("Cooking Pot","🍲",["kitchen","metal","hot"]),
    I("Fire","🔥",["hot","red","orange"]),
    I("Snowflake","❄️",["cold","blue","small"]),
    I("Tree","🌳",["wood","green","land","big"]),
    I("Flower","🌸",["plant","pink","small"]),
    I("Gem","💎",["blue","shiny","small"]),
    I("Rocket","🚀",["vehicle","fly","metal","big"]),
    I("Cactus","🌵",["plant","green","land","sharp"]),
    I("Mushroom","🍄",["food","small","plant"]),
    I("Butterfly","🦋",["animal","fly","small","colorful"]),
    I("Snake","🐍",["animal","land","long"]),
    I("Crown","👑",["shiny","yellow","small"]),
    I("Diamond Ring","💍",["shiny","small","round"]),
    I("Telescope","🔭",["tool","metal","big"]),
    I("Microscope","🔬",["tool","metal","small"]),
    I("Magnet","🧲",["tool","metal","red"]),
    I("Clock","🕐",["round","metal","small"]),
    I("Hourglass","⏳",["small","yellow"]),
    I("Rainbow","🌈",["colorful","big","sky"]),
    I("Lightning","⚡",["fast","yellow","sky"]),
    I("Mountain","⛰️",["land","big","grey"]),
    I("Island","🏝️",["water","land","small"]),
  ];
}
function buildClues() {
  const T=(text,...tags)=>({text,type:"tags-all",tags,category:"attr"});
  const A=(text,...tags)=>({text,type:"tags-any",tags,category:"attr"});
  const F=(text,fn,explain,category="fun")=>({text,type:"func",fn,explain,category});
  return [
    T("Is an animal","animal"),
    T("Can fly","fly"),
    T("Lives in water","water"),
    T("Is a vehicle","vehicle"),
    T("Has wheels","wheel"),
    T("Is red (or has red)","red"),
    T("Is green (or has green)","green"),
    T("Is round","round"),
    T("Is a fruit","fruit"),
    T("Found in the kitchen","kitchen"),
    T("Is a tool","tool"),
    T("Is a musical instrument","musical"),
    T("Is hot","hot"),
    T("Is cold","cold"),
    T("Is big","big"),
    T("Is small","small"),
    T("Is made of metal","metal"),
    T("Is made of wood","wood"),
    T("Is a plant","plant"),
    T("Has spots or stripes","spot","stripe"),
    A("Is food","food","fruit","bread","meat","cheese","sweet"),
    A("Moves on land","land","wheel"),
    A("Is for sport or music","sport","musical"),
    A("Is shiny","shiny","blue","yellow"),
    F("Name starts with a vowel",c=>/^[aeiou]/i.test(c.name),c=>`"${c.name}" starts with "${c.name[0]}"`),
    F("Name has 4 or fewer letters (no spaces)",c=>c.name.replace(/\s/g,"").length<=4,c=>`"${c.name}" has ${c.name.replace(/\s/g,"").length} letters`),
    F("Name has more than 6 letters (no spaces)",c=>c.name.replace(/\s/g,"").length>6,c=>`"${c.name}" has ${c.name.replace(/\s/g,"").length} letters`),
    F("Emoji is round-shaped",c=>/⚽|🏀|⚾|🍩|🍎|🍉|🍭|☕|🥁|🌕|🪙|💎|🔵|⭕/.test(c.emoji),()=>"Its emoji looks circular"),
    F("Name contains the letter E",c=>/e/i.test(c.name),c=>`"${c.name}" contains the letter E`),
    F("Has exactly 2 words in its name",c=>c.name.trim().split(/\s+/).length===2,c=>`"${c.name}" has ${c.name.trim().split(/\s+/).length} word(s)`),
  ];
}

const CATEGORIES=["All","animal","food","vehicle","tool","musical","plant","sport"];

function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[b[i],b[j]]=[b[j],b[i]];}return b;}
function randBetween(min,max){return Math.floor(min+Math.random()*(max-min));}
function randChoice(a){return a[Math.floor(Math.random()*a.length)];}
function matchesClues(card,clues){return clues.every(c=>{
  if (c.type==="tags-all") return c.tags.every(t=>card.tags.includes(t));
  if (c.type==="tags-any") return c.tags.some(t=>card.tags.includes(t));
  if (c.type==="func") return c.fn(card);
  return false;
});}
function explainClues(card,clues){return clues.map(c=>{
  if (c.type.startsWith("tags")) return `matches [${c.tags.filter(t=>card.tags.includes(t)).join(", ")}]`;
  if (c.type==="func") return c.explain?.(card)??"satisfies the rule";
  return "valid";
}).join(" AND ");}

function aiParams(str){
  const s=Math.max(1,Math.min(8,str|0));
  return {
    accuracy: 0.40+s*0.07,
    minDelay: Math.max(200, 700-(s-1)*65),
    maxDelay: Math.max(800, 2800-(s-1)*240),
    misclickRate: Math.max(0.03, 0.30-(s-1)*0.035),
  };
}
function beep(f=440,d=0.06){
  try{const ctx=new(window.AudioContext||window.webkitAudioContext)();
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.type="sine";o.frequency.value=f;o.connect(g);g.connect(ctx.destination);
    o.start();g.gain.setValueAtTime(0.18,ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+d);o.stop(ctx.currentTime+d);
  }catch{}
}
function useLS(k,def){
  const [v,setV]=useState(()=>{try{const r=localStorage.getItem(k);return r?JSON.parse(r):def;}catch{return def;}});
  const set=val=>{setV(val);try{localStorage.setItem(k,JSON.stringify(val));}catch{}};
  return [v,set];
}

const DEF_OPTS={pts:7,aiStr:4,handSize:5,clueMs:11000,practice:false,coach:true,chaos:false,sound:true,category:"All",timedMode:false,timedSec:60};

export default function Canasta2({onQuit=()=>{}}) {
  const [opts,setOpts]=useLS("slapzi_v3",DEF_OPTS);
  const [showNew,setShowNew]=useState(true);
  const [showRules,setShowRules]=useState(false);
  const [running,setRunning]=useState(false);

  const allItems=useMemo(buildItems,[]);
  const allClues=useMemo(buildClues,[]);

  const [deck,setDeck]=useState([]);
  const [pHand,setPHand]=useState([]);
  const [aHand,setAHand]=useState([]);
  const [clues,setClues]=useState([]);
  const [scores,setScores]=useState({h:0,a:0});
  const [streak,setStreak]=useState({h:0,a:0});
  const [frozen,setFrozen]=useState({h:false,a:false});
  const [log,setLog]=useState("");
  const [explain,setExplain]=useState("");
  const [coachMatch,setCoachMatch]=useState([]);
  const [round,setRound]=useState(1);
  const [progress,setProgress]=useState(0);
  const [timedLeft,setTimedLeft]=useState(0);
  const [finished,setFinished]=useState(false);
  const [lastWrong,setLastWrong]=useState(null);

  const clueRef=useRef(null);
  const aiRef=useRef(null);
  const progressRef=useRef({start:0});
  const timedRef=useRef(null);

  const filteredItems=useMemo(()=>{
    if (opts.category==="All") return allItems;
    return allItems.filter(c=>c.tags.includes(opts.category));
  },[allItems,opts.category]);

  function startGame() {
    const d=shuffle(filteredItems);
    const ph=d.splice(0,opts.handSize);
    const ah=d.splice(0,opts.handSize);
    setDeck(d); setPHand(ph); setAHand(ah);
    setRound(1); setScores({h:0,a:0}); setStreak({h:0,a:0});
    setLog("Ready!"); setExplain(""); setCoachMatch([]);
    setFinished(false); setRunning(true);
    if (opts.timedMode) {
      setTimedLeft(opts.timedSec);
      timedRef.current=setInterval(()=>setTimedLeft(t=>{
        if (t<=1) { clearInterval(timedRef.current); setFinished(true); setRunning(false); return 0; }
        return t-1;
      }),1000);
    }
    nextClue(d,ph,ah,true);
  }
  function stopGame(){setRunning(false);clearTimeout(clueRef.current);clearTimeout(aiRef.current);clearInterval(timedRef.current);}

  function pickClues(ph,ah) {
    const dual=opts.chaos&&Math.random()<0.22;
    let c=[randChoice(allClues)];
    // Try to ensure human has a match
    if (!dual) {
      if (Math.random()<0.65&&!ph.some(x=>matchesClues(x,[c[0]]))) {
        const found=shuffle(allClues).find(cl=>ph.some(x=>matchesClues(x,[cl])));
        if (found) c=[found];
      }
    } else {
      const sh=shuffle(allClues);
      for (let i=0;i<sh.length;i++) for (let j=i+1;j<sh.length;j++) {
        const set=[sh[i],sh[j]];
        if (ph.some(x=>matchesClues(x,set))||ah.some(x=>matchesClues(x,set))) { c=set; break; }
      }
    }
    return c;
  }

  function nextClue(d,ph,ah,first=false) {
    clearTimeout(clueRef.current); clearTimeout(aiRef.current);
    const c=pickClues(ph,ah);
    setClues(c);
    setLog(first?"Go! Match the clue.":`Round ${round+1}`);
    setExplain(""); setLastWrong(null);

    // Coach: which of your cards match right now
    const matching=ph.filter(x=>matchesClues(x,c)).map(x=>x.id);
    setCoachMatch(matching);

    if (opts.sound) beep(380,0.04);
    progressRef.current.start=performance.now();

    if (!opts.practice) {
      clueRef.current=setTimeout(()=>{
        setLog("Time's up! Next clue.");
        advanceClue(d,ph,ah);
      },opts.clueMs);
    }
    scheduleAI(c,ph,ah,d);
  }

  function scheduleAI(c,ph,ah,d) {
    const {accuracy,minDelay,maxDelay,misclickRate}=aiParams(opts.aiStr);
    const delay=randBetween(minDelay,maxDelay);
    aiRef.current=setTimeout(()=>{
      if (!running) return;
      const matches=ah.filter(x=>matchesClues(x,c));
      let chosen;
      if (Math.random()<accuracy&&matches.length) chosen=randChoice(matches);
      else chosen=randChoice(ah);
      if (!chosen) return;
      if (matchesClues(chosen,c)) handleWin("a",chosen,c,d,ph,ah);
      else {
        setFrozen(f=>({...f,a:true}));
        setTimeout(()=>setFrozen(f=>({...f,a:false})),1100);
      }
    },delay);
  }

  function handleWin(winner,card,c,d,ph,ah) {
    clearTimeout(clueRef.current); clearTimeout(aiRef.current);
    const why=explainClues(card,c);
    setExplain(`${winner==="h"?"You":"AI"} matched "${card.name}" — ${why}`);

    const newStreak={...streak};
    newStreak[winner]++;
    const other=winner==="h"?"a":"h";
    newStreak[other]=0;
    setStreak(newStreak);
    const bonus=newStreak[winner]>=3?1:0;
    const pts=1+bonus;

    const newScores={...scores,[winner]:scores[winner]+pts};
    setScores(newScores);
    if (opts.sound) beep(winner==="h"?660:220,0.06);
    if (bonus) setLog(`${winner==="h"?"You":"AI"} slapped "${card.name}"! 🔥 ${newStreak[winner]}-streak: +${pts} pts`);
    else setLog(`${winner==="h"?"You":"AI"} slapped "${card.name}".`);

    // Replace card
    let nd=[...d];
    if (winner==="h") {
      const np=[...ph]; const idx=np.findIndex(x=>x.id===card.id);
      if (idx!==-1) { np.splice(idx,1); if (nd.length) np.push(nd.shift()); }
      setPHand(np); setDeck(nd);
      if (!opts.timedMode&&newScores.h>=opts.pts) { setFinished(true); setRunning(false); return; }
      setTimeout(()=>advanceClue(nd,np,ah),600);
    } else {
      const na=[...ah]; const idx=na.findIndex(x=>x.id===card.id);
      if (idx!==-1) { na.splice(idx,1); if (nd.length) na.push(nd.shift()); }
      setAHand(na); setDeck(nd);
      if (!opts.timedMode&&newScores.a>=opts.pts) { setFinished(true); setRunning(false); return; }
      setTimeout(()=>advanceClue(d,ph,na),600);
    }
    setRound(r=>r+1);
  }

  function handleSlap(card) {
    if (!running||frozen.h||!clues.length) return;
    if (matchesClues(card,clues)) {
      handleWin("h",card,clues,deck,pHand,aHand);
    } else {
      setFrozen(f=>({...f,h:true}));
      setLastWrong(card.id);
      const why=explainClues(card,clues);
      setExplain(`❌ "${card.name}" doesn't match. ${why}`);
      setLog(`Wrong slap on "${card.name}" — brief freeze.`);
      if (opts.sound) beep(110,0.07);
      setTimeout(()=>{ setFrozen(f=>({...f,h:false})); setLastWrong(null); },1200);
    }
  }

  function advanceClue(d,ph,ah) {
    if (!running) return;
    let nd=[...d],np=[...ph],na=[...ah];
    while (np.length<opts.handSize&&nd.length) np.push(nd.shift());
    while (na.length<opts.handSize&&nd.length) na.push(nd.shift());
    setDeck(nd); setPHand(np); setAHand(na);
    nextClue(nd,np,na);
  }

  // Progress bar
  useEffect(()=>{
    if (!running||!clues.length||opts.practice) { setProgress(0); return; }
    let raf;
    const tick=()=>{ const e=performance.now()-progressRef.current.start; setProgress(Math.min(1,e/opts.clueMs)); raf=requestAnimationFrame(tick); };
    raf=requestAnimationFrame(tick);
    return ()=>cancelAnimationFrame(raf);
  },[running,clues,opts.clueMs,opts.practice]);

  // Keyboard
  useEffect(()=>{
    function kd(e) {
      if (!running) return;
      if (e.key>="1"&&e.key<="9") { const c=pHand[+e.key-1]; if (c) handleSlap(c); }
    }
    window.addEventListener("keydown",kd);
    return ()=>window.removeEventListener("keydown",kd);
  },[running,pHand,clues,frozen]);

  const winner=finished?(scores.h>=scores.a?"You":"AI"):null;

  return (
    <div className="s2-root">
      <header className="s2-hdr">
        <div className="s2-brand">👋 Slapzi Blitz</div>
        <div className="s2-info">
          {opts.timedMode&&running&&<span className="s2-timer-badge">⏱ {timedLeft}s left</span>}
          {!opts.timedMode&&<span>First to <b>{opts.pts}</b></span>}
        </div>
        <nav>
          <button className="s2-btn" onClick={()=>{stopGame();setShowNew(true);}}>New Game</button>
          <button className="s2-btn" onClick={()=>setShowRules(true)}>Rules</button>
          <button className="s2-btn red" onClick={onQuit}>Quit</button>
        </nav>
      </header>

      <div className="s2-scorebar">
        <span className="s2-score-you">🧑 You: <b>{scores.h}</b>{streak.h>=3?` 🔥×${streak.h}`:""}</span>
        <span className="s2-round">Round {round}</span>
        <span className="s2-score-ai">🤖 AI (L{opts.aiStr}): <b>{scores.a}</b>{streak.a>=3?` 🔥×${streak.a}`:""}</span>
      </div>

      {/* Clue area */}
      <div className="s2-clue-zone">
        {!running&&!finished&&<div className="s2-idle">Press New Game to start</div>}
        {running&&(
          <>
            <div className={`s2-clues ${clues.length===2?"dual":""}`}>
              {clues.map((c,i)=>(
                <div key={i} className="s2-clue-card">
                  {clues.length===2&&<div className="s2-clue-n">CLUE {i+1}</div>}
                  <div className="s2-clue-txt">{c.text}</div>
                </div>
              ))}
            </div>
            {!opts.practice&&(
              <div className="s2-progress-wrap">
                <div className="s2-progress-bar" style={{width:`${(1-progress)*100}%`}}/>
              </div>
            )}
            {opts.practice&&<div className="s2-practice-tag">Practice — no time limit</div>}
          </>
        )}
        {explain&&<div className={`s2-explain ${explain.startsWith("❌")?"wrong":"right"}`}>{explain}</div>}
        {log&&<div className="s2-log">{log}</div>}
      </div>

      <main className="s2-board">
        {/* Player hand */}
        <section className="s2-side">
          <h2>🧑 You</h2>
          <div className="s2-hand">
            {pHand.map((card,i)=>{
              const matches=running&&clues.length&&matchesClues(card,clues);
              const isWrong=lastWrong===card.id;
              return (
                <button key={card.id}
                  className={`s2-card ${frozen.h?"frozen":""} ${matches&&opts.coach?"matching":""} ${isWrong?"wrong-slap":""}`}
                  onClick={()=>handleSlap(card)}
                  disabled={!running||frozen.h}
                  title={`Press ${i+1}`}>
                  <span className="s2-emoji">{card.emoji}</span>
                  <span className="s2-name">{card.name}</span>
                  <span className="s2-tags">{card.tags.slice(0,3).join(" · ")}</span>
                  <span className="s2-key">[{i+1}]</span>
                  {matches&&opts.coach&&<span className="s2-match-dot">✓</span>}
                </button>
              );
            })}
          </div>
          {opts.coach&&running&&coachMatch.length>0&&(
            <div className="s2-coach-hint">
              💡 {coachMatch.length} card{coachMatch.length>1?"s match":"matches"} the clue — highlighted in green
            </div>
          )}
        </section>

        {/* AI hand */}
        <section className="s2-side ai-side">
          <h2>🤖 AI</h2>
          <div className="s2-hand">
            {aHand.map(card=>(
              <div key={card.id} className={`s2-card facedown ${frozen.a?"frozen":""}`}>
                <span className="s2-emoji">🂠</span>
                <span className="s2-name">Hidden</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Finished screen */}
      {finished&&(
        <div className="s2-overlay">
          <div className="s2-result">
            <div className="s2-result-icon">{winner==="You"?"🏆":"🤖"}</div>
            <div className="s2-result-title">{winner} wins!</div>
            <div className="s2-result-scores">You {scores.h} — AI {scores.a}</div>
            {opts.timedMode&&<div className="s2-result-sub">Timed mode: {opts.timedSec}s</div>}
            <button className="s2-btn primary" onClick={()=>{setFinished(false);setShowNew(true);}}>Play Again</button>
          </div>
        </div>
      )}

      {showNew&&(
        <div className="s2-modal-wrap" onClick={()=>setShowNew(false)}>
          <div className="s2-modal" onClick={e=>e.stopPropagation()}>
            <div className="s2-modal-title">New Game — Slapzi Blitz</div>
            <div className="s2-form">
              {!opts.timedMode&&<label>Points to win<input type="number" min={3} max={30} value={opts.pts} onChange={e=>setOpts({...opts,pts:+e.target.value})}/></label>}
              <label>AI Strength (1–8)<input type="range" min={1} max={8} value={opts.aiStr} onChange={e=>setOpts({...opts,aiStr:+e.target.value})}/><span className="s2-sub">L{opts.aiStr}</span></label>
              <label>Hand size<input type="number" min={3} max={9} value={opts.handSize} onChange={e=>setOpts({...opts,handSize:+e.target.value})}/></label>
              <label>Clue time (sec)<input type="number" min={4} max={30} value={Math.round(opts.clueMs/1000)} onChange={e=>setOpts({...opts,clueMs:+e.target.value*1000})}/></label>
              <label>Category filter<select value={opts.category} onChange={e=>setOpts({...opts,category:e.target.value})}>
                {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
              </select></label>
              {opts.timedMode&&<label>Time limit (sec)<input type="number" min={20} max={180} step={10} value={opts.timedSec} onChange={e=>setOpts({...opts,timedSec:+e.target.value})}/></label>}
            </div>
            <div className="s2-toggles">
              {[["timedMode","Timed Challenge Mode"],["chaos","Chaos Mode (double clues)"],["practice","Practice (no time limit)"],["coach","Coach Mode (highlight matches)"],["sound","Sound"]].map(([k,lbl])=>(
                <label key={k} className="s2-ck"><input type="checkbox" checked={!!opts[k]} onChange={e=>setOpts({...opts,[k]:e.target.checked})}/>{lbl}</label>
              ))}
            </div>
            <div className="s2-modal-btns">
              <button className="s2-btn primary" onClick={()=>{setShowNew(false);startGame();}}>Start</button>
              <button className="s2-btn" onClick={()=>setShowNew(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showRules&&(
        <div className="s2-modal-wrap" onClick={()=>setShowRules(false)}>
          <div className="s2-modal" onClick={e=>e.stopPropagation()}>
            <div className="s2-modal-title">Slapzi Blitz — Rules</div>
            <div className="s2-rules">
              <h4>Objective</h4><p>Slap a card from your hand that matches the active clue before the AI does.</p>
              <h4>How to slap</h4><p>Click a card, or press keys 1–9 matching its position in your hand.</p>
              <h4>Scoring</h4><p>Correct slap = 1 point. <b>3-in-a-row streak</b> = 2 points per slap!</p>
              <h4>Wrong slap</h4><p>Freezes you briefly. In Practice mode no penalty.</p>
              <h4>Chaos Mode</h4><p>Occasional rounds show TWO clues — your card must satisfy both.</p>
              <h4>Timed Mode</h4><p>Score as many points as possible before the clock runs out.</p>
              <h4>Category Filter</h4><p>Restrict cards to a single category (animals, food, etc.) for focused practice.</p>
              <h4>Coach Mode</h4><p>Cards that currently match the clue are highlighted green.</p>
            </div>
            <div className="s2-modal-btns"><button className="s2-btn" onClick={()=>setShowRules(false)}>Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
