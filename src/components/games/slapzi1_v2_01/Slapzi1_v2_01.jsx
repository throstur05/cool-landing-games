import React, { useEffect, useMemo, useRef, useState } from "react";
import "./Slapzi1_v2_01.css";

/**
 * Slapzi1_v2_01.jsx — Claude's House Edition
 * Anthropic-branded aesthetic: warm cream/white background,
 * Claude-orange (#D97757) accents, refined typography,
 * polished card interactions, immersive prompt zone.
 *
 * Features:
 *  - Full Human vs AI gameplay
 *  - Freeze AI power-up (streak ≥ 2)
 *  - Explain Mode with coach feedback
 *  - AI difficulty 1–8
 *  - Keyboard shortcuts: 1–9 slap, F freeze, R rules, N new, Q quit
 */

const DEFAULT_SETTINGS = {
  difficulty: 4,
  showAI: true,
  sfx: true,
  explain: true,
};

const ALL_TILES = [
  { id: 1,  emoji: "🍎", text: "Apple",       categories: ["food","plant"],       colors: ["red","green"],           size: 1, habitats: [],                          materials: [],                  actions: ["eat"],        props: ["edible","round"] },
  { id: 2,  emoji: "🚗", text: "Car",         categories: ["transport"],          colors: ["red","blue","black","white"], size: 3, habitats: ["land"],              materials: ["metal"],           actions: ["drive"],      props: ["wheels"] },
  { id: 3,  emoji: "🐶", text: "Dog",         categories: ["animal"],             colors: ["brown","black","white"],  size: 2, habitats: ["land"],                    materials: [],                  actions: ["run"],        props: ["living"] },
  { id: 4,  emoji: "🦋", text: "Butterfly",   categories: ["animal"],             colors: ["blue","orange","yellow"], size: 1, habitats: ["air","garden"],            materials: [],                  actions: ["fly"],        props: ["living","flies"] },
  { id: 5,  emoji: "⚽", text: "Soccer Ball", categories: ["sport","toy"],        colors: ["black","white"],          size: 1, habitats: ["field"],                   materials: ["leather","plastic"],actions: ["kick"],      props: ["round"] },
  { id: 6,  emoji: "🧊", text: "Ice Cube",    categories: ["thing","food"],       colors: ["clear","blue"],           size: 1, habitats: ["freezer"],                 materials: ["water"],           actions: ["cool"],       props: ["cold"] },
  { id: 7,  emoji: "📱", text: "Phone",       categories: ["electronics"],        colors: ["black","white"],          size: 1, habitats: ["home","school","office"],  materials: ["glass","metal"],   actions: ["call","text"],props: ["screen","buttons"] },
  { id: 8,  emoji: "🧠", text: "Brain",       categories: ["biology"],            colors: ["pink"],                   size: 1, habitats: ["body"],                    materials: [],                  actions: ["think"],      props: ["living"] },
  { id: 9,  emoji: "🌲", text: "Pine Tree",   categories: ["plant","nature"],     colors: ["green","brown"],          size: 4, habitats: ["forest"],                  materials: ["wood"],            actions: ["grow"],       props: ["living"] },
  { id: 10, emoji: "✈️", text: "Airplane",    categories: ["transport"],          colors: ["white","silver","blue"],  size: 5, habitats: ["air"],                     materials: ["metal"],           actions: ["fly"],        props: ["wings","flies"] },
  { id: 11, emoji: "🧀", text: "Cheese",      categories: ["food"],               colors: ["yellow"],                 size: 1, habitats: [],                          materials: ["dairy"],           actions: ["eat"],        props: ["edible"] },
  { id: 12, emoji: "🍌", text: "Banana",      categories: ["food","plant"],       colors: ["yellow"],                 size: 1, habitats: ["tropical"],                materials: [],                  actions: ["eat"],        props: ["edible"] },
  { id: 13, emoji: "🕶️", text: "Sunglasses",  categories: ["clothing"],           colors: ["black"],                  size: 1, habitats: ["beach","sunny"],           materials: ["plastic"],         actions: ["wear"],       props: ["wearable"] },
  { id: 14, emoji: "🧥", text: "Jacket",      categories: ["clothing"],           colors: ["blue","black","red"],     size: 2, habitats: ["cold"],                    materials: ["fabric"],          actions: ["wear"],       props: ["wearable","warm"] },
  { id: 15, emoji: "🎸", text: "Guitar",      categories: ["instrument"],         colors: ["brown","black"],          size: 2, habitats: ["stage","home"],            materials: ["wood"],            actions: ["play"],       props: ["noisy"] },
  { id: 16, emoji: "🖥️", text: "Computer",    categories: ["electronics"],        colors: ["black","silver"],         size: 2, habitats: ["home","school","office"],  materials: ["metal","glass","plastic"], actions: ["compute"], props: ["screen","buttons"] },
  { id: 17, emoji: "🚲", text: "Bicycle",     categories: ["transport","sport"],  colors: ["red","blue","green","black"], size: 2, habitats: ["land"],              materials: ["metal"],           actions: ["ride"],       props: ["wheels"] },
  { id: 18, emoji: "🍕", text: "Pizza",       categories: ["food"],               colors: ["yellow","red","brown"],   size: 1, habitats: ["kitchen"],                 materials: ["dough","cheese"],  actions: ["eat"],        props: ["edible"] },
  { id: 19, emoji: "🧪", text: "Beaker",      categories: ["science","thing"],    colors: ["clear"],                  size: 1, habitats: ["lab"],                     materials: ["glass"],           actions: ["mix"],        props: ["transparent"] },
  { id: 20, emoji: "🔧", text: "Wrench",      categories: ["tool"],               colors: ["silver"],                 size: 1, habitats: ["garage"],                  materials: ["metal"],           actions: ["turn"],       props: ["metal"] },
  { id: 21, emoji: "🕰️", text: "Clock",       categories: ["thing"],              colors: ["brown","white","black","gold"], size: 1, habitats: ["home","school"],  materials: ["metal","wood"],    actions: ["tick"],       props: ["round","buttons"] },
  { id: 22, emoji: "🧼", text: "Soap",        categories: ["thing"],              colors: ["white","pink","blue"],    size: 1, habitats: ["bathroom"],                materials: ["soap"],            actions: ["clean"],      props: [] },
  { id: 23, emoji: "📚", text: "Books",       categories: ["school","thing"],     colors: ["multicolor"],             size: 2, habitats: ["library","school","home"], materials: ["paper"],           actions: ["read"],       props: [] },
  { id: 24, emoji: "🧩", text: "Puzzle",      categories: ["toy","thing"],        colors: ["blue","red","green","yellow"], size: 1, habitats: ["home","school"],   materials: ["cardboard","plastic"], actions: ["fit"],   props: [] },
  { id: 25, emoji: "🪁",  text: "Kite",        categories: ["toy","sport"],        colors: ["multicolor"],             size: 2, habitats: ["park","beach"],            materials: ["fabric"],          actions: ["fly"],        props: ["flies"] },
  { id: 26, emoji: "🪀", text: "Yo-Yo",       categories: ["toy"],                colors: ["red","blue","green"],     size: 1, habitats: ["home"],                    materials: ["plastic"],         actions: ["spin"],       props: ["round"] },
  { id: 27, emoji: "🧲", text: "Magnet",      categories: ["science","thing"],    colors: ["red","blue"],             size: 1, habitats: ["lab"],                     materials: ["metal"],           actions: ["attract"],    props: [] },
  { id: 28, emoji: "🍓", text: "Strawberry",  categories: ["food","plant"],       colors: ["red","green"],            size: 1, habitats: ["garden"],                  materials: [],                  actions: ["eat"],        props: ["edible","seeds"] },
  { id: 29, emoji: "🐟", text: "Fish",        categories: ["animal"],             colors: ["blue","silver"],          size: 1, habitats: ["water"],                   materials: [],                  actions: ["swim"],       props: ["living"] },
  { id: 30, emoji: "🦅", text: "Eagle",       categories: ["animal"],             colors: ["brown","white"],          size: 3, habitats: ["air","mountain"],          materials: [],                  actions: ["fly"],        props: ["living","flies"] },
  { id: 31, emoji: "🚀", text: "Rocket",      categories: ["transport","space"],  colors: ["white","red"],            size: 5, habitats: ["space"],                   materials: ["metal"],           actions: ["fly","launch"],props: ["flies"] },
  { id: 32, emoji: "🍩", text: "Donut",       categories: ["food"],               colors: ["brown","pink"],           size: 1, habitats: ["bakery"],                  materials: ["dough"],           actions: ["eat"],        props: ["edible","round","sweet"] },
  { id: 33, emoji: "⛵", text: "Sailboat",    categories: ["transport"],          colors: ["white"],                  size: 3, habitats: ["water"],                   materials: ["wood","fabric"],   actions: ["sail"],       props: [] },
  { id: 34, emoji: "🥕", text: "Carrot",      categories: ["food","plant"],       colors: ["orange","green"],         size: 1, habitats: ["garden"],                  materials: [],                  actions: ["eat"],        props: ["edible"] },
  { id: 35, emoji: "🎧", text: "Headphones",  categories: ["electronics"],        colors: ["black","white"],          size: 1, habitats: ["home","school"],           materials: ["plastic","metal"], actions: ["listen"],     props: [] },
  { id: 36, emoji: "🌊", text: "Wave",        categories: ["nature"],             colors: ["blue"],                   size: 4, habitats: ["water","beach"],           materials: ["water"],           actions: ["crash"],      props: [] },
  { id: 37, emoji: "🦁", text: "Lion",        categories: ["animal"],             colors: ["brown","yellow"],         size: 4, habitats: ["land","savanna"],          materials: [],                  actions: ["run"],        props: ["living"] },
  { id: 38, emoji: "🏔️", text: "Mountain",    categories: ["nature"],             colors: ["brown","white","grey"],   size: 5, habitats: ["land","forest"],           materials: ["rock"],            actions: [],             props: [] },
  { id: 39, emoji: "🎯", text: "Dartboard",   categories: ["sport","toy","thing"],colors: ["red","black","white"],    size: 1, habitats: ["home","pub"],              materials: ["plastic","wood"],  actions: ["throw"],      props: ["round"] },
  { id: 40, emoji: "💡", text: "Lightbulb",   categories: ["electronics","thing"],colors: ["clear","white","yellow"], size: 1, habitats: ["home","school","office"],  materials: ["glass","metal"],   actions: ["light"],      props: ["screen"] },
];

function buildPrompts() {
  const prompts = [];
  const push = (p) => prompts.push({ id: `${p.type}-${p.value}-${prompts.length+1}`, ...p });
  ["red","blue","green","yellow","black","white","brown","pink","silver","orange"].forEach(c =>
    push({ text: `Is ${c}`, type: "color", value: c })
  );
  ["animal","food","transport","electronics","clothing","tool","sport","plant","nature","toy","science","instrument"].forEach(cat =>
    push({ text: `Is a ${cat}`, type: "category", value: cat })
  );
  [2,3,4].forEach(n => push({ text: `Size at least ${n}`, type: "sizeAtLeast", value: n }));
  [1,2].forEach(n => push({ text: `Size at most ${n}`, type: "sizeAtMost", value: n }));
  ["water","air","land","forest","home","school","office","space","kitchen","beach","park"].forEach(h =>
    push({ text: `Found in/at ${h}`, type: "habitat", value: h })
  );
  ["metal","wood","glass","plastic","paper","leather","fabric","water"].forEach(m =>
    push({ text: `Made of ${m}`, type: "material", value: m })
  );
  ["fly","swim","drive","ride","play","eat","wear","read","mix","cool","listen"].forEach(a =>
    push({ text: `Can ${a}`, type: "action", value: a })
  );
  [
    ["wheels","Has wheels"],["flies","Can fly"],["edible","Is edible"],
    ["wearable","You can wear it"],["round","Is round"],["screen","Has a screen"],
    ["buttons","Has buttons"],["cold","Is cold"],["living","Is a living thing"],
    ["sweet","Is sweet"],["noisy","Makes noise"],
  ].forEach(([prop, label]) => push({ text: label, type: "prop", value: prop }));
  ["A","B","C","D","E","F","G","P","S","T"].forEach(L =>
    push({ text: `Starts with "${L}"`, type: "startsWith", value: L })
  );
  return prompts;
}
const ALL_PROMPTS = buildPrompts();

function shuffle(arr){ const a=arr.slice(); for(let i=a.length-1;i>0;i--){const j=(Math.random()*(i+1))|0; [a[i],a[j]]=[a[j],a[i]];} return a; }
function randBetween(a,b){ return a + Math.random()*(b-a); }

function tileMatchesPrompt(tile, prompt){
  const t = prompt.type, v = prompt.value;
  switch(t){
    case "color":      return tile.colors.includes(v);
    case "category":   return tile.categories.includes(v);
    case "sizeAtLeast":return tile.size >= v;
    case "sizeAtMost": return tile.size <= v;
    case "habitat":    return tile.habitats.includes(v);
    case "material":   return tile.materials.includes(v);
    case "action":     return tile.actions.includes(v);
    case "prop":       return tile.props.includes(v);
    case "startsWith": return tile.text.toUpperCase().startsWith(String(v).toUpperCase());
    default: return false;
  }
}

function reasonForMatch(tile, prompt){
  const t = prompt.type, v = prompt.value;
  const yes = tileMatchesPrompt(tile, prompt);
  const head = yes ? "✓ Match" : "✗ No match";
  const wrap = (why) => `${head} — ${tile.text}: ${why}`;
  switch(t){
    case "color":      return wrap(`${yes ? "has" : "doesn't have"} color "${v}".`);
    case "category":   return wrap(`${yes ? "is" : "isn't"} a "${v}".`);
    case "sizeAtLeast":return wrap(`size ${tile.size} ${yes ? "≥" : "<"} ${v}.`);
    case "sizeAtMost": return wrap(`size ${tile.size} ${yes ? "≤" : ">"} ${v}.`);
    case "habitat":    return wrap(`${yes ? "found in" : "not in"} "${v}".`);
    case "material":   return wrap(`${yes ? "made of" : "not made of"} "${v}".`);
    case "action":     return wrap(`${yes ? "can" : "cannot"} "${v}".`);
    case "prop":       return wrap(`${yes ? "has" : "doesn't have"} property "${v}".`);
    case "startsWith": return wrap(`${yes ? "starts with" : "doesn't start with"} "${v}".`);
    default: return wrap("unknown rule.");
  }
}

function useLocalStorage(key, initialValue){
  const [state, set] = useState(() => {
    try{ const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : initialValue; }
    catch{ return initialValue; }
  });
  useEffect(()=>{ try{ localStorage.setItem(key, JSON.stringify(state)); } catch{} },[key,state]);
  return [state, set];
}

function aiProfile(diff){
  const d = Math.max(1, Math.min(8, diff));
  return {
    minMs: 1400 - (d-1)*140,
    maxMs: 2200 - (d-1)*160,
    accuracy: Math.min(0.98, 0.58 + (d-1)*0.055),
    falsePositive: Math.max(0.02, 0.18 - (d-1)*0.02),
  };
}

function useBeep(enabled=true){
  const ctxRef = useRef(null);
  useEffect(()=>{
    if(!enabled) return;
    try{
      if(!ctxRef.current){
        const A = window.AudioContext || window.webkitAudioContext;
        if(A) ctxRef.current = new A();
      }
    }catch{}
  },[enabled]);
  const play=(f=660,ms=90,type="square")=>{
    if(!enabled||!ctxRef.current) return;
    const ctx=ctxRef.current, osc=ctx.createOscillator(), g=ctx.createGain();
    osc.type=type; osc.frequency.value=f; g.gain.value=0.04;
    osc.connect(g); g.connect(ctx.destination); osc.start(); setTimeout(()=>osc.stop(),ms);
  };
  return {
    ok:()=>play(760,80,"sine"),
    bad:()=>play(180,140,"sawtooth"),
    win:()=>{ play(660,100,"sine"); setTimeout(()=>play(880,130,"sine"),110); setTimeout(()=>play(1100,160,"sine"),250); },
    prompt:()=>play(540,60,"triangle"),
    freeze:()=>play(320,170,"triangle"),
  };
}

export default function Slapzi1_v2_01({ onQuit }){
  const [settings, setSettings] = useLocalStorage("slapzi_ch_v1", DEFAULT_SETTINGS);
  const [seed, setSeed] = useState(1);
  const [showRules, setShowRules] = useState(false);
  const [winner, setWinner] = useState(null);
  const [lockHuman, setLockHuman] = useState(false);
  const [coachLine, setCoachLine] = useState("");
  const [coachOk, setCoachOk] = useState(true);
  const [streak, setStreak] = useState(0);
  const [freezeUntil, setFreezeUntil] = useState(0);
  const [flashPrompt, setFlashPrompt] = useState(false);
  const [slapEffect, setSlapEffect] = useState(null); // tileId that was just slapped

  const beep = useBeep(settings.sfx);

  const game = useMemo(()=>{
    const deck = shuffle(ALL_TILES);
    const prompts = shuffle(ALL_PROMPTS);
    return { humanHand: deck.slice(0,5), aiHand: deck.slice(5,10), promptDeck: prompts.slice(1), currentPrompt: prompts[0] };
  },[seed]);

  const [humanHand, setHumanHand] = useState(game.humanHand);
  const [aiHand, setAIHand]       = useState(game.aiHand);
  const [promptDeck, setPromptDeck] = useState(game.promptDeck);
  const [currentPrompt, setCurrentPrompt] = useState(game.currentPrompt);
  const [usedPrompts, setUsedPrompts] = useState([game.currentPrompt]);
  const aiTimer = useRef(null);

  useEffect(()=>{
    setHumanHand(game.humanHand); setAIHand(game.aiHand);
    setPromptDeck(game.promptDeck); setCurrentPrompt(game.currentPrompt);
    setUsedPrompts([game.currentPrompt]);
    setWinner(null); setLockHuman(false); setCoachLine("");
    setStreak(0); setFreezeUntil(0); setSlapEffect(null);
    cancelAITimer();
  },[game]);

  function cancelAITimer(){ if(aiTimer.current){ clearTimeout(aiTimer.current); aiTimer.current=null; } }

  function nextPrompt(sound=true){
    setFlashPrompt(true);
    setTimeout(()=>setFlashPrompt(false), 400);
    if(promptDeck.length===0){
      const r = shuffle(usedPrompts);
      setPromptDeck(r.slice(1)); setCurrentPrompt(r[0]); setUsedPrompts([r[0]]);
    } else {
      const [p,...rest]=promptDeck;
      setCurrentPrompt(p); setPromptDeck(rest); setUsedPrompts(u=>[...u,p]);
    }
    if(sound) beep.prompt();
  }

  const canFreeze = streak >= 2 && Date.now() > freezeUntil;
  function triggerFreeze(){
    if(!canFreeze) return;
    setFreezeUntil(Date.now()+3000); setStreak(0);
    setCoachLine("🧊 AI frozen for 3 seconds!"); setCoachOk(true);
    beep.freeze();
  }

  function handleHumanTry(tileId){
    if(winner||lockHuman) return;
    const tile = humanHand.find(t=>t.id===tileId);
    if(!tile) return;
    setSlapEffect(tileId);
    setTimeout(()=>setSlapEffect(null),350);
    const ok = tileMatchesPrompt(tile, currentPrompt);
    if(!ok){
      setLockHuman(true); beep.bad();
      if(settings.explain){ setCoachLine(reasonForMatch(tile,currentPrompt)); setCoachOk(false); }
      setStreak(0);
      setTimeout(()=>setLockHuman(false),700);
      return;
    }
    beep.ok();
    const newHand = humanHand.filter(t=>t.id!==tile.id);
    setHumanHand(newHand);
    if(settings.explain){ setCoachLine(reasonForMatch(tile,currentPrompt)); setCoachOk(true); }
    setStreak(s=>Math.min(3,s+1));
    if(newHand.length===0){ setWinner("human"); beep.win(); cancelAITimer(); return; }
    nextPrompt(true);
  }

  // AI
  useEffect(()=>{
    if(winner) return;
    cancelAITimer();
    const now = Date.now();
    if(now < freezeUntil){
      aiTimer.current = setTimeout(()=>{}, freezeUntil - now + 20);
      return;
    }
    const profile = aiProfile(Number(settings.difficulty||4));
    const matches = aiHand.filter(t=>tileMatchesPrompt(t,currentPrompt));
    const willTry = matches.length>0 || Math.random()<profile.falsePositive;
    if(!willTry) return;
    const ms = randBetween(profile.minMs, profile.maxMs);
    aiTimer.current = setTimeout(()=>{
      let chosen;
      if(matches.length>0){
        chosen = Math.random()<profile.accuracy
          ? matches.slice().sort((a,b)=>a.text.length-b.text.length)[0]
          : aiHand[(Math.random()*aiHand.length)|0];
      } else {
        chosen = aiHand[(Math.random()*aiHand.length)|0];
      }
      const ok = tileMatchesPrompt(chosen,currentPrompt);
      if(!ok){
        beep.bad();
        if(settings.explain){ setCoachLine(`🤖 ${reasonForMatch(chosen,currentPrompt)}`); setCoachOk(false); }
        return;
      }
      beep.ok();
      setAIHand(old=>{
        const next = old.filter(t=>t.id!==chosen.id);
        if(settings.explain){ setCoachLine(`🤖 ${reasonForMatch(chosen,currentPrompt)}`); setCoachOk(true); }
        setTimeout(()=>{
          if(next.length===0){ setWinner("ai"); beep.win(); cancelAITimer(); }
          else { nextPrompt(true); setStreak(0); }
        },0);
        return next;
      });
    }, ms);
    return cancelAITimer;
  },[currentPrompt, aiHand, settings.difficulty, winner, freezeUntil, settings.explain]);

  // keyboard
  useEffect(()=>{
    const onKey=(e)=>{
      if(winner) return;
      if(e.key>="1"&&e.key<="9"){ const i=Number(e.key)-1; if(i<humanHand.length) handleHumanTry(humanHand[i].id); }
      if(e.key==="r"||e.key==="R") setShowRules(v=>!v);
      if(e.key==="n"||e.key==="N"){ cancelAITimer(); setSeed(s=>s+1); }
      if(e.key==="q"||e.key==="Q") handleQuit();
      if(e.key==="f"||e.key==="F") triggerFreeze();
    };
    window.addEventListener("keydown",onKey);
    return()=>window.removeEventListener("keydown",onKey);
  },[humanHand,winner,canFreeze]);

  function handleQuit(){ if(typeof onQuit==="function") onQuit(); else window.history.back(); }
  function handleNewGame(){ cancelAITimer(); setSeed(s=>s+1); }

  const frozen = Date.now() < freezeUntil;

  return (
    <div className="ch-wrap" role="application" aria-label="Slapzi — Claude's House Edition">

      {/* HEADER */}
      <header className="ch-header">
        <div className="ch-brand">
          <div className="ch-brand-logo">
            <span className="ch-claude-mark">✦</span>
          </div>
          <div className="ch-brand-text">
            <span className="ch-brand-name">Slapzi</span>
            <span className="ch-brand-edition">Claude's House</span>
          </div>
        </div>
        <nav className="ch-nav">
          <button className="ch-nav-btn" onClick={()=>setShowRules(true)}>Rules</button>
          <button className="ch-nav-btn" onClick={handleNewGame}>New Game</button>
          <button className="ch-nav-btn ch-nav-quit" onClick={handleQuit}>Quit</button>
        </nav>
      </header>

      {/* SETTINGS STRIP */}
      <div className="ch-settings">
        <label className="ch-setting">
          <span className="ch-setting-label">Difficulty</span>
          <select className="ch-select" value={settings.difficulty}
            onChange={e=>setSettings({...settings,difficulty:Number(e.target.value)})}>
            {Array.from({length:8},(_,i)=>i+1).map(n=><option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        {[
          ["Show AI","showAI"],
          ["Sound","sfx"],
          ["Explain","explain"],
        ].map(([label,key])=>(
          <label key={key} className="ch-setting ch-toggle-wrap">
            <span className="ch-setting-label">{label}</span>
            <span className={`ch-toggle ${settings[key]?"on":""}`}
              onClick={()=>setSettings({...settings,[key]:!settings[key]})}
              role="switch" aria-checked={settings[key]} tabIndex={0}
              onKeyDown={e=>(e.key===" "||e.key==="Enter")&&setSettings({...settings,[key]:!settings[key]})}>
              <span className="ch-toggle-thumb"/>
            </span>
          </label>
        ))}
      </div>

      {/* BOARD */}
      <main className="ch-board">

        {/* HUMAN HAND */}
        <section className="ch-hand-section ch-hand-human">
          <div className="ch-hand-header">
            <h2 className="ch-hand-title">Your Tiles</h2>
            <div className="ch-badge ch-badge-human">{humanHand.length} left</div>
          </div>
          <div className={`ch-hand ${lockHuman?"ch-hand-locked":""}`}>
            {humanHand.map((tile,idx)=>(
              <button
                key={tile.id}
                className={`ch-tile ch-tile-human ${slapEffect===tile.id?"ch-tile-slap":""}`}
                onClick={()=>handleHumanTry(tile.id)}
                disabled={!!winner}
                title={`Press ${idx+1}`}
              >
                <span className="ch-tile-idx">{idx+1}</span>
                <span className="ch-tile-emoji">{tile.emoji}</span>
                <span className="ch-tile-label">{tile.text}</span>
              </button>
            ))}
            {humanHand.length===0 && <div className="ch-hand-empty">— empty —</div>}
          </div>
        </section>

        {/* CENTER */}
        <section className="ch-center">
          {/* Prompt card */}
          <div className={`ch-prompt ${flashPrompt?"ch-prompt-flash":""}`}>
            <div className="ch-prompt-eyebrow">Current Prompt</div>
            <div className="ch-prompt-text">{currentPrompt.text}</div>
            <div className="ch-prompt-sub">{currentPrompt.type}</div>
          </div>

          {/* Streak + freeze */}
          <div className="ch-powerup-row">
            <div className={`ch-streak-meter`}>
              <span className="ch-streak-label">Streak</span>
              {[0,1].map(i=>(
                <span key={i} className={`ch-streak-dot ${streak>i?"ch-streak-dot-on":""}`}/>
              ))}
              <span className="ch-streak-tip">→ Freeze</span>
            </div>
            <button
              className={`ch-freeze-btn ${canFreeze?"ch-freeze-ready":""} ${frozen?"ch-freeze-active":""}`}
              onClick={triggerFreeze} disabled={!canFreeze && !frozen}
              title="Press F">
              {frozen ? "🧊 Frozen!" : "❄ Freeze AI"}
            </button>
          </div>

          {/* Coach feedback */}
          {coachLine && settings.explain && (
            <div className={`ch-coach ${coachOk?"ch-coach-ok":"ch-coach-bad"}`} aria-live="polite">
              {coachLine}
            </div>
          )}

          {/* Winner banner */}
          {winner && (
            <div className={`ch-winner ${winner==="human"?"ch-winner-you":"ch-winner-ai"}`}>
              {winner==="human" ? (
                <><span className="ch-winner-icon">🎉</span><span>You win!</span></>
              ) : (
                <><span className="ch-winner-icon">🤖</span><span>AI wins!</span></>
              )}
              <button className="ch-winner-new" onClick={handleNewGame}>Play Again</button>
            </div>
          )}

          <div className="ch-shortcuts">
            <kbd>1–9</kbd> slap &nbsp;·&nbsp; <kbd>F</kbd> freeze &nbsp;·&nbsp; <kbd>R</kbd> rules &nbsp;·&nbsp; <kbd>N</kbd> new &nbsp;·&nbsp; <kbd>Q</kbd> quit
          </div>
        </section>

        {/* AI HAND */}
        <section className="ch-hand-section ch-hand-ai">
          <div className="ch-hand-header">
            <h2 className="ch-hand-title">AI Tiles</h2>
            <div className="ch-badge ch-badge-ai">{aiHand.length} left</div>
          </div>
          <div className="ch-hand">
            {settings.showAI ? (
              aiHand.map(tile=>(
                <div key={tile.id} className="ch-tile ch-tile-ai">
                  <span className="ch-tile-emoji">{tile.emoji}</span>
                  <span className="ch-tile-label">{tile.text}</span>
                </div>
              ))
            ) : (
              <div className="ch-ai-hidden">
                <span>Hidden</span>
                <span className="ch-ai-hidden-sub">enable "Show AI" to peek</span>
              </div>
            )}
            {aiHand.length===0 && <div className="ch-hand-empty">— empty —</div>}
          </div>
        </section>

      </main>

      {/* RULES MODAL */}
      {showRules && (
        <div className="ch-overlay" role="dialog" aria-modal="true" aria-label="Rules" onClick={e=>e.target===e.currentTarget&&setShowRules(false)}>
          <div className="ch-modal">
            <div className="ch-modal-header">
              <h2 className="ch-modal-title">How to Play Slapzi</h2>
              <button className="ch-modal-close" onClick={()=>setShowRules(false)} aria-label="Close">✕</button>
            </div>
            <div className="ch-modal-body">
              <h3>Core Rules</h3>
              <ol>
                <li>You and the AI each start with <strong>5 tiles</strong>.</li>
                <li>A <strong>prompt</strong> is shown in the center — e.g. "Is red" or "Has wheels".</li>
                <li>If one of your tiles matches, <strong>click it</strong> (or press <strong>1–9</strong>) to slap it.</li>
                <li>Correct slap → tile discarded, new prompt appears.</li>
                <li>Wrong slap → brief <strong>lockout penalty</strong>.</li>
                <li><strong>First to empty their hand wins.</strong></li>
              </ol>
              <h3>Power-Up — Freeze AI ❄</h3>
              <ul>
                <li>Land <strong>2 correct slaps in a row</strong> to charge the freeze.</li>
                <li>Press <kbd>F</kbd> or click <em>Freeze AI</em> to pause the AI for 3 seconds.</li>
              </ul>
              <h3>Explain Mode</h3>
              <ul>
                <li>After each slap, a one-line explanation shows why the tile matched (or didn't).</li>
                <li>Great for learning the category rules!</li>
              </ul>
              <h3>AI Difficulty (1–8)</h3>
              <ul>
                <li>Higher level = faster reaction + fewer mistakes.</li>
              </ul>
              <h3>Keyboard Shortcuts</h3>
              <p><kbd>1–9</kbd> slap · <kbd>F</kbd> freeze · <kbd>R</kbd> rules · <kbd>N</kbd> new game · <kbd>Q</kbd> quit</p>
            </div>
            <div className="ch-modal-footer">
              <button className="ch-modal-btn" onClick={()=>setShowRules(false)}>Got it!</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
