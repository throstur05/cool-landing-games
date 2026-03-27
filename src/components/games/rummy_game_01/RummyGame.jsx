import React, { useState, useEffect, useRef, useCallback } from 'react';

/* ─── Constants ─────────────────────────────────────────────────────────── */
const SUITS  = ['Spades','Hearts','Diamonds','Clubs'];
const VALUES = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const SUIT_SYM = { Spades:'♠', Hearts:'♥', Diamonds:'♦', Clubs:'♣', Joker:'✦' };
const RED_SUITS = new Set(['Hearts','Diamonds']);

/* ─── Pure helpers ──────────────────────────────────────────────────────── */
const cardNum   = c => ({ A:1,J:11,Q:12,K:13,Joker:0 }[c.value] ?? +c.value);
const cardPts   = c => { if (c.isWild) return 0; if (['J','Q','K'].includes(c.value)) return 10; if (c.value==='A') return 1; return +c.value; };
const suitColor = s => RED_SUITS.has(s) ? '#c0392b' : s==='Joker' ? '#7d3cbf' : '#1a1a2e';

const shuffle = arr => {
  const a=[...arr]; for(let i=a.length-1;i>0;i--){ const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]; } return a;
};

const sortHand = (hand, mode='suit') => [...hand].sort((a,b) =>
  mode==='rank'
    ? (cardNum(a)!==cardNum(b) ? cardNum(a)-cardNum(b) : SUITS.indexOf(a.suit)-SUITS.indexOf(b.suit))
    : (SUITS.indexOf(a.suit)!==SUITS.indexOf(b.suit) ? SUITS.indexOf(a.suit)-SUITS.indexOf(b.suit) : cardNum(a)-cardNum(b))
);

const isValidSet = cards => {
  const nw = cards.filter(c=>!c.isWild);
  if (!nw.length) return cards.length>=3;
  const r = nw[0].value;
  return nw.every(c=>c.value===r);
};

const isValidRun = cards => {
  const nw = cards.filter(c=>!c.isWild);
  if (!nw.length) return cards.length>=3;
  const suit = nw[0].suit;
  if (!nw.every(c=>c.suit===suit)) return false;
  const sorted = [...nw].sort((a,b)=>cardNum(a)-cardNum(b));
  for(let i=1;i<sorted.length;i++) if(cardNum(sorted[i])===cardNum(sorted[i-1])) return false;
  const wilds = cards.length - nw.length;
  const span  = cardNum(sorted[sorted.length-1]) - cardNum(sorted[0]);
  if (span > cards.length-1) return false;
  let gaps=0;
  for(let i=1;i<sorted.length;i++) gaps += cardNum(sorted[i])-cardNum(sorted[i-1])-1;
  return gaps<=wilds;
};

const isValidMeld = cards => cards.length>=3 && (isValidSet(cards)||isValidRun(cards));
const meldPts     = cards => cards.reduce((s,c)=>s+cardPts(c),0);

const combos = (arr,k) => {
  if(k===1) return arr.map(x=>[x]);
  if(k>arr.length) return [];
  const out=[];
  arr.forEach((x,i)=>combos(arr.slice(i+1),k-1).forEach(rest=>out.push([x,...rest])));
  return out;
};

const allMelds = hand => {
  const out=[];
  for(let k=3;k<=hand.length;k++) combos(hand,k).forEach(c=>{ if(isValidMeld(c)) out.push(c); });
  return out;
};

const bestDiscard = (hand, minPts) => {
  return [...hand].sort((a,b)=>{
    if(a.isWild) return 1; if(b.isWild) return -1;
    const aMelds = allMelds(hand.filter(c=>c.id!==a.id)).filter(m=>meldPts(m)>=minPts).length;
    const bMelds = allMelds(hand.filter(c=>c.id!==b.id)).filter(m=>meldPts(m)>=minPts).length;
    if(aMelds!==bMelds) return bMelds-aMelds;
    return cardPts(b)-cardPts(a);
  })[hand.length-1];
};

/* ─── Card component ────────────────────────────────────────────────────── */
const Card = React.memo(({ card, faceDown=false, selected=false, clickable=false,
  onClick, onDblClick, dim=false, size='md' }) => {
  const W = { sm:52, md:68, lg:84 }[size];
  const H = Math.round(W*1.44);
  const FS= { sm:11, md:14, lg:17 }[size];

  const base = {
    width:W, height:H, borderRadius:8, flexShrink:0,
    cursor:clickable?'pointer':'default',
    userSelect:'none', position:'relative',
    display:'flex', alignItems:'center', justifyContent:'center',
    transition:'transform .15s ease, box-shadow .15s ease, opacity .15s ease',
    opacity: dim ? 0.4 : 1,
  };

  if (faceDown) return (
    <div style={{ ...base,
      background:'linear-gradient(145deg,#0d1b2a,#112240)',
      border:'1.5px solid #1e3a5f',
      boxShadow:'0 4px 12px rgba(0,0,0,.55)',
    }} onClick={clickable?onClick:undefined}>
      <div style={{ width:W-14, height:H-14, borderRadius:5,
        border:'1px solid rgba(100,160,255,.12)',
        backgroundImage:'repeating-linear-gradient(45deg,rgba(100,149,237,.06) 0,rgba(100,149,237,.06) 1px,transparent 0,transparent 50%)',
        backgroundSize:'8px 8px', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span style={{ fontSize:FS+4, color:'rgba(100,149,237,.25)' }}>✦</span>
      </div>
    </div>
  );

  const col = suitColor(card.suit);
  return (
    <div
      style={{ ...base,
        background: card.suit==='Joker'
          ? 'linear-gradient(145deg,#1a0533,#2d0d52)'
          : 'linear-gradient(160deg,#ffffff,#f4f4f4)',
        border: selected ? '2.5px solid #ffe566' : '1.5px solid rgba(0,0,0,.12)',
        boxShadow: selected
          ? '0 0 0 1px #ffe56688, 0 0 16px rgba(255,229,102,.4), 0 6px 18px rgba(0,0,0,.5)'
          : '0 3px 10px rgba(0,0,0,.45)',
        transform: selected ? 'translateY(-12px) scale(1.07)' : 'translateY(0) scale(1)',
      }}
      onClick={clickable?onClick:undefined}
      onDoubleClick={clickable&&onDblClick?onDblClick:undefined}
      onContextMenu={e=>{ if(clickable&&onDblClick){ e.preventDefault(); onDblClick(); } }}
    >
      <div style={{ position:'absolute', top:4, left:5, lineHeight:1.15, color:col, fontWeight:700, fontSize:FS }}>
        <div>{card.value}</div>
        <div style={{ fontSize:FS-2 }}>{SUIT_SYM[card.suit]}</div>
      </div>
      <div style={{ fontSize:FS+14, color:col, lineHeight:1 }}>{SUIT_SYM[card.suit]}</div>
      <div style={{ position:'absolute', bottom:4, right:5, lineHeight:1.15, color:col, fontWeight:700, fontSize:FS, transform:'rotate(180deg)' }}>
        <div>{card.value}</div>
        <div style={{ fontSize:FS-2 }}>{SUIT_SYM[card.suit]}</div>
      </div>
      {card.isWild && card.value!=='Joker' && (
        <div style={{ position:'absolute', top:2, right:2, background:'#c77dff', color:'#fff', borderRadius:'50%', width:13, height:13, fontSize:8, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>W</div>
      )}
    </div>
  );
});

/* ─── Meld row ──────────────────────────────────────────────────────────── */
const MeldRow = ({ cards, index, color='#1a8f00' }) => (
  <div style={{ display:'flex', alignItems:'center', gap:4, padding:'5px 8px',
    background:`${color}10`, border:`1px solid ${color}40`,
    borderRadius:7, marginBottom:5 }}>
    <span style={{ fontSize:9, color, fontWeight:700, letterSpacing:1.5,
      marginRight:4, fontFamily:'monospace', textTransform:'uppercase' }}>
      {isValidSet(cards)?'Set':'Run'}{index+1}
    </span>
    {cards.map(c=><Card key={c.id} card={c} size="sm"/>)}
    <span style={{ marginLeft:'auto', fontSize:11, color:`${color}bb`, fontFamily:'monospace' }}>
      {meldPts(cards)}pts
    </span>
  </div>
);

/* ─── Pill ──────────────────────────────────────────────────────────────── */
const Pill = ({label, value, color}) => (
  <span style={{ fontSize:11, padding:'2px 8px', borderRadius:99,
    border:`1px solid ${color}44`, color, fontFamily:'monospace', letterSpacing:.5 }}>
    {label}: <strong>{value}</strong>
  </span>
);

/* ─── Divider ───────────────────────────────────────────────────────────── */
const Divider = ({label, color='#334155'}) => (
  <div style={{ display:'flex', alignItems:'center', gap:10, margin:'2px 0' }}>
    <div style={{ flex:1, height:1, background:color }}/>
    <span style={{ fontSize:9, color, fontFamily:'monospace', letterSpacing:2 }}>{label}</span>
    <div style={{ flex:1, height:1, background:color }}/>
  </div>
);

/* ════════════════════════════════════════════════════════════════════════ */
export default function RummyGame({ onQuit }) {
  const DEFAULTS = { jokers:2, minMeld:30, aiLevel:5, playerName:'Player', twosWild:false, canStealWild:false, canAddToOpponentMeld:false, handSize:10, sortMode:'suit', canTakeWholePile:false };

  /* config — load from localStorage, fall back to defaults */
  const [cfg, setCfg] = useState(() => {
    try {
      const saved = localStorage.getItem('rummy_cfg');
      return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS;
    } catch { return DEFAULTS; }
  });
  const [darkMode, setDarkMode] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rummy_dark') ?? 'false'); }
    catch { return false; }
  });

  /* persist whenever cfg or darkMode changes */
  useEffect(() => {
    try { localStorage.setItem('rummy_cfg', JSON.stringify(cfg)); } catch {}
  }, [cfg]);
  useEffect(() => {
    try { localStorage.setItem('rummy_dark', JSON.stringify(darkMode)); } catch {}
  }, [darkMode]);
  /* game */
  const [gs,  setGs]    = useState(null);
  const [phase, setPhase] = useState('idle');
  const [selected, setSelected] = useState([]);
  const [scores, setScores] = useState({ player:0, ai:0 });
  /* ui */
  const [msg,  setMsg]   = useState({ main:'', sub:'' });
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');
  const aiTimer   = useRef(null);
  const toastRef  = useRef(null);

  /* ── Sort helper (reads current cfg.sortMode) ── */
  const sort = useCallback((hand) => sortHand(hand, cfg.sortMode), [cfg.sortMode]);

  /* ── Apply sort to live hand immediately ── */
  const applySort = useCallback((mode) => {
    setCfg(p => ({ ...p, sortMode: mode }));
    setGs(prev => {
      if (!prev) return prev;
      return { ...prev, playerHand: sortHand(prev.playerHand, mode) };
    });
  }, []);

  /* ── Toast ── */
  const showToast = useCallback((t, ms=2400) => {
    setToast(t);
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(()=>setToast(''), ms);
  }, []);

  /* ── Deck builder ── */
  const buildDeck = useCallback(() => {
    const d=[];
    for(const suit of SUITS) for(const value of VALUES)
      d.push({ id:`${suit}-${value}`, suit, value, isWild: cfg.twosWild && value==='2' });
    for(let j=0;j<cfg.jokers;j++)
      d.push({ id:`Joker-${j}`, suit:'Joker', value:'Joker', isWild:true });
    return shuffle(d);
  }, [cfg.jokers, cfg.twosWild]);

  /* ── Hint ── */
  const makeHint = useCallback((hand, minPts) => {
    const vm = allMelds(hand).filter(m=>meldPts(m)>=minPts);
    if(vm.length){
      const best = vm.reduce((b,m)=>meldPts(m)>meldPts(b)?m:b);
      return `Hint ✦ Meldable: ${best.map(c=>c.value+SUIT_SYM[c.suit]).join(' ')} (${meldPts(best)}pts)`;
    }
    const wc = hand.filter(c=>!c.isWild).sort((a,b)=>cardPts(b)-cardPts(a));
    return wc.length ? `Hint ✦ No melds ready. Consider discarding ${wc[0].value}${SUIT_SYM[wc[0].suit]} (${cardPts(wc[0])}pts)` : '';
  }, []);

  /* ── End game ── */
  const endGame = useCallback((winner, loserHand) => {
    const penalty = loserHand.reduce((s,c)=>s+cardPts(c),0);
    setScores(p => winner==='player'
      ? { ...p, player: p.player+penalty }
      : { ...p, ai: p.ai+penalty }
    );
    setMsg({
      main: winner==='player'
        ? `🏆 You win! AI had ${penalty} penalty pts.`
        : `🤖 AI wins! You had ${penalty} penalty pts.`,
      sub:''
    });
    setPhase('gameover');
  }, []);

  /* ── Start game ── */
  const startGame = useCallback(() => {
    const deck = buildDeck();
    const n    = cfg.handSize;
    const ph   = sort(deck.slice(0, n));
    const ah   = sortHand(deck.slice(n, n * 2));
    const disc = [deck[n * 2]];
    const rem  = deck.slice(n * 2 + 1);
    setGs({ deck:rem, playerHand:ph, aiHand:ah, discardPile:disc, playerMelds:[], aiMelds:[] });
    setSelected([]);
    setPhase('draw');
    setMsg({ main:'Your turn — draw a card to begin.', sub:'' });
    setModal(null);
  }, [buildDeck, cfg.handSize, sort]);

  /* ── Draw from deck ── */
  const drawDeck = useCallback(() => {
    if(phase!=='draw'||!gs||!gs.deck.length) return;
    const card    = gs.deck[0];
    const newDeck = gs.deck.slice(1);
    const newHand = sort([...gs.playerHand, card]);
    setGs(p=>({ ...p, deck:newDeck, playerHand:newHand }));
    setPhase('meld');
    setMsg({ main:'Card drawn — form melds, then discard.', sub: makeHint(newHand, cfg.minMeld) });
  }, [phase, gs, cfg.minMeld, makeHint, sort]);

  /* ── Draw top card from discard ── */
  const drawDiscardTop = useCallback(() => {
    if(phase!=='draw'||!gs||!gs.discardPile.length) return;
    const card       = gs.discardPile[gs.discardPile.length-1];
    const newDiscard = gs.discardPile.slice(0,-1);
    const newHand    = sort([...gs.playerHand, card]);
    setGs(p=>({ ...p, discardPile:newDiscard, playerHand:newHand }));
    setPhase('meld');
    setMsg({ main:`Took ${card.value}${SUIT_SYM[card.suit]} — form melds, then discard.`, sub: makeHint(newHand, cfg.minMeld) });
  }, [phase, gs, cfg.minMeld, makeHint, sort]);

  /* ── Take the entire discard pile ── */
  const drawDiscardAll = useCallback(() => {
    if(phase!=='draw'||!gs||!gs.discardPile.length) return;
    const count   = gs.discardPile.length;
    const newHand = sort([...gs.playerHand, ...gs.discardPile]);
    setGs(p=>({ ...p, discardPile:[], playerHand:newHand }));
    setPhase('meld');
    setMsg({ main:`Took all ${count} cards from the pile! Form melds, then discard.`, sub: makeHint(newHand, cfg.minMeld) });
  }, [phase, gs, cfg.minMeld, makeHint, sort]);

  /* ── Toggle select ── */
  const toggleSel = useCallback((card) => {
    if(phase!=='meld') return;
    setSelected(p => p.some(c=>c.id===card.id) ? p.filter(c=>c.id!==card.id) : [...p, card]);
  }, [phase]);

  /* ── Form meld ── */
  const formMeld = useCallback(() => {
    if(!gs||selected.length<3) return;
    if(!isValidMeld(selected)){ showToast('✗ Invalid — need a set (same rank) or run (same suit, consecutive)'); return; }
    const pts = meldPts(selected);
    if(pts<cfg.minMeld){ showToast(`✗ Need ≥${cfg.minMeld}pts — this meld is only ${pts}pts`); return; }
    const ids    = new Set(selected.map(c=>c.id));
    const newHand  = gs.playerHand.filter(c=>!ids.has(c.id));
    const newMelds = [...gs.playerMelds, selected];
    setGs(p=>({ ...p, playerHand:newHand, playerMelds:newMelds }));
    setSelected([]);
    showToast(`✓ Meld! ${pts}pts`);
    if(!newHand.length){ endGame('player', gs.aiHand); return; }
    setMsg({ main:'Meld formed! Keep melding or discard.', sub: makeHint(newHand, cfg.minMeld) });
  }, [gs, selected, cfg.minMeld, endGame, showToast, makeHint]);

  /* ── Player discard ── */
  const discardCard = useCallback((card) => {
    if(phase!=='meld'||!gs) return;
    const newHand    = gs.playerHand.filter(c=>c.id!==card.id);
    const newDiscard = [...gs.discardPile, card];
    setGs(p=>({ ...p, playerHand:newHand, discardPile:newDiscard }));
    setSelected([]);
    if(!newHand.length){ endGame('player', gs.aiHand); return; }
    setPhase('ai');
    setMsg({ main:'AI is thinking…', sub:'' });
  }, [phase, gs, endGame]);

  /* ── Steal wild card from AI meld ── */
  // Player selects one card from hand (the real card to swap in) + clicks a wild in an AI meld
  const stealWild = useCallback((meldIdx, wildCardInMeld) => {
    if(!cfg.canStealWild||phase!=='meld'||!gs) return;
    // Find a matching real card in player's hand to swap for the wild
    const replacement = gs.playerHand.find(c =>
      !c.isWild && isValidMeld(
        gs.aiMelds[meldIdx].map(mc => mc.id===wildCardInMeld.id ? c : mc)
      )
    );
    if(!replacement){
      showToast('✗ You need a card in hand that fits into that meld to steal the wild.');
      return;
    }
    const newAiMeld = gs.aiMelds[meldIdx].map(mc => mc.id===wildCardInMeld.id ? replacement : mc);
    const newAiMelds = gs.aiMelds.map((m,i)=>i===meldIdx?newAiMeld:m);
    const newPlayerHand = gs.playerHand.filter(c=>c.id!==replacement.id);
    const newPlayerHand2 = [...newPlayerHand, wildCardInMeld]; // wild goes to player's hand
    setGs(p=>({ ...p, aiMelds:newAiMelds, playerHand:sort(newPlayerHand2) }));
    setSelected([]);
    showToast(`✓ Stole ${wildCardInMeld.value === 'Joker' ? 'Joker' : wildCardInMeld.value+'★'}!`);
    setMsg({ main:'Wild stolen! Keep melding or discard.', sub:'' });
  }, [cfg.canStealWild, phase, gs, showToast]);

  /* ── Add card(s) to an AI meld ── */
  // Player selects cards from hand then clicks an AI meld to extend it
  const addToOpponentMeld = useCallback((meldIdx) => {
    if(!cfg.canAddToOpponentMeld||phase!=='meld'||!gs) return;
    if(selected.length===0){ showToast('✗ Select cards from your hand first, then click an AI meld to extend it.'); return; }
    const extended = [...gs.aiMelds[meldIdx], ...selected];
    if(!isValidMeld(extended)){ showToast('✗ Selected cards don\'t extend that meld validly.'); return; }
    const ids = new Set(selected.map(c=>c.id));
    const newAiMelds = gs.aiMelds.map((m,i)=>i===meldIdx?extended:m);
    const newHand = gs.playerHand.filter(c=>!ids.has(c.id));
    setGs(p=>({ ...p, aiMelds:newAiMelds, playerHand:newHand }));
    setSelected([]);
    showToast(`✓ Extended AI meld with ${selected.length} card${selected.length>1?'s':''}!`);
    if(!newHand.length){ endGame('player', gs.aiHand); return; }
    setMsg({ main:'Cards added to AI meld! Keep melding or discard.', sub:'' });
  }, [cfg.canAddToOpponentMeld, phase, gs, selected, showToast, endGame]);

  /* ── Add card(s) to own meld ── */
  const addToOwnMeld = useCallback((meldIdx) => {
    if(phase!=='meld'||!gs) return;
    if(selected.length===0){ showToast('✗ Select cards from your hand first, then click your meld to extend it.'); return; }
    const extended = [...gs.playerMelds[meldIdx], ...selected];
    if(!isValidMeld(extended)){ showToast('✗ Selected cards don\'t extend that meld validly.'); return; }
    const ids = new Set(selected.map(c=>c.id));
    const newMelds = gs.playerMelds.map((m,i)=>i===meldIdx?extended:m);
    const newHand  = gs.playerHand.filter(c=>!ids.has(c.id));
    setGs(p=>({ ...p, playerMelds:newMelds, playerHand:newHand }));
    setSelected([]);
    showToast(`✓ Extended your meld with ${selected.length} card${selected.length>1?'s':''}!`);
    if(!newHand.length){ endGame('player', gs.aiHand); return; }
    setMsg({ main:'Meld extended! Keep melding or discard.', sub: makeHint(newHand, cfg.minMeld) });
  }, [phase, gs, selected, showToast, endGame, makeHint, cfg.minMeld]);

  /* ── Save / Load / Clear game ── */
  const SAVE_KEY = 'rummy_saved_game';

  const saveGame = useCallback(() => {
    if(!gs||phase==='gameover') return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ gs, phase, scores }));
      showToast('✓ Game saved!');
    } catch { showToast('✗ Could not save game.'); }
  }, [gs, phase, scores, showToast]);

  const loadGame = useCallback(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if(!raw){ showToast('✗ No saved game found.'); return; }
      const { gs:savedGs, phase:savedPhase, scores:savedScores } = JSON.parse(raw);
      setGs(savedGs);
      setPhase(savedPhase);
      setScores(savedScores);
      setSelected([]);
      setMsg({ main:'Game resumed — your turn!', sub:'' });
      setModal(null);
      showToast('✓ Game resumed!');
    } catch { showToast('✗ Could not load saved game.'); }
  }, [showToast]);

  const clearSave = useCallback(() => {
    localStorage.removeItem(SAVE_KEY);
    showToast('✓ Saved game cleared.');
  }, [showToast]);

  const hasSave = (() => { try { return !!localStorage.getItem(SAVE_KEY); } catch { return false; } })();

  useEffect(() => {
    if(phase!=='ai'||!gs) return;
    aiTimer.current = setTimeout(() => {
      setGs(prev => {
        if(!prev) return prev;
        let ah   = [...prev.aiHand];
        let disc = [...prev.discardPile];
        let deckArr = [...prev.deck];
        let am   = [...prev.aiMelds];
        const minP = cfg.minMeld;
        const lvl  = cfg.aiLevel;

        /* 1. Draw */
        const top = disc[disc.length-1];
        let drewDisc = false;
        if(top && lvl>=4){
          const withD    = allMelds([...ah, top]).filter(m=>meldPts(m)>=minP).length;
          const withoutD = allMelds(ah).filter(m=>meldPts(m)>=minP).length;
          if(withD > withoutD){ ah=sortHand([...ah,top]); disc=disc.slice(0,-1); drewDisc=true; }
        }
        if(!drewDisc && deckArr.length){ ah=sortHand([...ah,deckArr[0]]); deckArr=deckArr.slice(1); }

        /* 2. Meld greedily */
        let changed=true;
        while(changed && ah.length){
          changed=false;
          const possible=allMelds(ah).filter(m=>meldPts(m)>=minP);
          if(possible.length){
            const best=possible.reduce((b,m)=>meldPts(m)>meldPts(b)?m:b);
            const ids=new Set(best.map(c=>c.id));
            ah=ah.filter(c=>!ids.has(c.id)); am=[...am,best]; changed=true;
          }
        }

        /* 3. Win? */
        if(!ah.length){
          const penalty=prev.playerHand.reduce((s,c)=>s+cardPts(c),0);
          setTimeout(()=>{
            setScores(p=>({ ...p, ai:p.ai+penalty }));
            setMsg({ main:`🤖 AI wins! You had ${penalty} penalty pts.`, sub:'' });
            setPhase('gameover');
          },0);
          return { ...prev, aiHand:ah, aiMelds:am, deck:deckArr, discardPile:disc };
        }

        /* 4. Discard */
        const td = bestDiscard(ah, minP);
        ah = ah.filter(c=>c.id!==td.id);
        disc = [...disc, td];

        setTimeout(()=>{
          setPhase('draw');
          setMsg({ main:'Your turn — draw a card.', sub:'' });
        },0);

        return { ...prev, aiHand:ah, aiMelds:am, deck:deckArr, discardPile:disc };
      });
    }, 800+Math.random()*700);
    return ()=>clearTimeout(aiTimer.current);
  }, [phase]);

  /* ─── Theme ───────────────────────────────────────────────────────────── */
  const dk = darkMode;
  const G = dk ? '#e2b55a' : '#b8860b';
  const N = dk ? '#39ff14' : '#1a8f00';
  const R = dk ? '#ff4d6d' : '#c0392b';
  const B = dk ? '#4da6ff' : '#1a6bb5';
  const M = dk ? '#64748b' : '#6b7280';
  const BG   = dk ? '#070d14' : '#f5f6f8';
  const HDR  = dk ? 'linear-gradient(90deg,#06101a,#0b1a2c,#06101a)' : 'linear-gradient(90deg,#ffffff,#f0f2f5,#ffffff)';
  const HDR_BORDER = dk ? `${G}33` : '#d1d5db';
  const TEXT = dk ? '#e8e8e8' : '#1f2937';
  const PANEL_BG = dk ? 'rgba(255,255,255,.03)' : 'rgba(0,0,0,.03)';
  const PANEL_BORDER = dk ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.09)';
  const MODAL_BG = dk ? '#0c1825' : '#ffffff';
  const MODAL_BORDER = dk ? `${G}44` : '#d1d5db';
  const INPUT_BG = dk ? 'rgba(255,255,255,.05)' : '#f9fafb';
  const INPUT_BORDER = dk ? 'rgba(255,255,255,.12)' : '#d1d5db';
  const INPUT_COLOR = dk ? '#e8e8e8' : '#1f2937';
  const RULE_TEXT = dk ? '#94a3b8' : '#4b5563';
  const DIVIDER = dk ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.1)';
  const OVERLAY_BG = 'rgba(0,0,0,.75)';

  const panelStyle = (accent) => ({
    background: PANEL_BG,
    border:`1px solid ${accent||PANEL_BORDER}`,
    borderRadius:10, padding:'12px 14px',
  });

  const btnStyle = (v='ghost') => ({
    padding:'7px 16px', fontSize:12, fontWeight:700,
    fontFamily:'"Courier New",monospace', letterSpacing:.8,
    cursor:'pointer', border:'1px solid', borderRadius:6,
    transition:'all .15s', whiteSpace:'nowrap',
    ...(v==='gold'   ? { background:G+'22', borderColor:G+'99', color:G } :
        v==='neon'   ? { background:N+'18', borderColor:N+'99', color:N } :
        v==='red'    ? { background:R+'18', borderColor:R+'99', color:R } :
        v==='blue'   ? { background:B+'18', borderColor:B+'99', color:B } :
        v==='muted'  ? { background:'transparent', borderColor:M+'66', color:M } :
                       { background:'transparent', borderColor:PANEL_BORDER, color:M }),
  });

  /* ─── Derived ─────────────────────────────────────────────────────────── */
  const topDiscard = gs?.discardPile[gs.discardPile.length-1];
  const selPts     = meldPts(selected);
  const selValid   = selected.length>=3 && isValidMeld(selected);
  const selOk      = selValid && selPts>=cfg.minMeld;
  const selStatus  =
    selected.length===0 ? 'Select cards to form a meld, or double-click / right-click to discard' :
    selected.length<3   ? `Select ${3-selected.length} more card${3-selected.length>1?'s':''}` :
    !selValid           ? '✗ Not a valid meld (need set or run)' :
    !selOk              ? `✗ Meld needs ≥${cfg.minMeld}pts — only ${selPts}pts` :
                          `✓ Valid meld — ${selPts}pts`;
  const selCol = selOk ? N : selected.length>0&&(!selValid||!selOk) ? R : M;

  /* ─── Overlay wrapper ─────────────────────────────────────────────────── */
  const Overlay = ({children}) => (
    <div style={{ position:'fixed', inset:0, background:OVERLAY_BG,
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:16 }}
      onClick={()=>setModal(null)}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:MODAL_BG, border:`1px solid ${MODAL_BORDER}`,
        borderRadius:14, maxWidth:500, width:'100%',
        maxHeight:'88vh', overflow:'auto', padding:26,
        fontFamily:'"Helvetica Neue",Arial,sans-serif',
        boxShadow: dk ? 'none' : '0 20px 60px rgba(0,0,0,.15)' }}>
        {children}
      </div>
    </div>
  );

  /* ─── Modals ──────────────────────────────────────────────────────────── */
  const SetupModal = () => {
    const Toggle = ({cfgKey, label, description}) => (
      <div style={{ marginBottom:14 }}>
        <div style={{ fontSize:10, color:M, fontFamily:'"Courier New",monospace', letterSpacing:1.5, marginBottom:4 }}>{label}</div>
        {description && <div style={{ fontSize:11, color:RULE_TEXT, marginBottom:6, lineHeight:1.5 }}>{description}</div>}
        <div style={{ display:'flex', gap:8 }}>
          {[{l:'YES', v:true},{l:'NO', v:false}].map(opt=>(
            <button key={String(opt.v)}
              style={{ ...btnStyle(cfg[cfgKey]===opt.v ? (opt.v?'neon':'red') : 'muted'), flex:1 }}
              onClick={()=>setCfg(p=>({...p,[cfgKey]:opt.v}))}>
              {opt.l}
            </button>
          ))}
        </div>
      </div>
    );
    return (
    <Overlay>
      <div style={{ color:G, fontWeight:700, fontSize:17, marginBottom:18, fontFamily:'"Courier New",monospace', letterSpacing:1.5 }}>⚙ SETUP</div>
      <div style={{ marginBottom:14 }}>
        <div style={{ fontSize:10, color:M, fontFamily:'"Courier New",monospace', letterSpacing:1.5, marginBottom:5 }}>PLAYER NAME</div>
        <input style={{ width:'100%', background:INPUT_BG, border:`1px solid ${INPUT_BORDER}`,
          borderRadius:6, padding:'8px 10px', color:INPUT_COLOR, fontSize:14, boxSizing:'border-box' }}
          value={cfg.playerName} onChange={e=>setCfg(p=>({...p,playerName:e.target.value}))} />
      </div>
      {/* Hand size picker */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:10, color:M, fontFamily:'"Courier New",monospace', letterSpacing:1.5, marginBottom:8 }}>
          CARDS PER PLAYER: <strong style={{color:G}}>{cfg.handSize}</strong>
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {[6,7,8,9,10,11,12,13,14,15].map(n=>(
            <button key={n}
              style={{ ...btnStyle(cfg.handSize===n?'gold':'muted'), minWidth:36, padding:'5px 8px', fontSize:12 }}
              onClick={()=>setCfg(p=>({...p,handSize:n}))}>
              {n}
            </button>
          ))}
        </div>
      </div>
      {/* Sort mode picker */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:10, color:M, fontFamily:'"Courier New",monospace', letterSpacing:1.5, marginBottom:8 }}>HAND SORT ORDER</div>
        <div style={{ display:'flex', gap:8 }}>
          {[{label:'♠ SUIT → RANK', val:'suit'},{label:'A RANK → SUIT', val:'rank'}].map(opt=>(
            <button key={opt.val}
              style={{ ...btnStyle(cfg.sortMode===opt.val?'gold':'muted'), flex:1 }}
              onClick={()=>applySort(opt.val)}>
              {opt.label}
            </button>
          ))}
        </div>
        {gs && (
          <div style={{ fontSize:10, color:N, fontFamily:'"Courier New",monospace', marginTop:6 }}>
            ✓ Applied to your current hand instantly
          </div>
        )}
      </div>
      {[
        { key:'aiLevel',  label:`AI DIFFICULTY: ${cfg.aiLevel}`, min:1, max:10 },
        { key:'minMeld',  label:`MIN MELD POINTS: ${cfg.minMeld}`, min:0, max:60, step:10 },
        { key:'jokers',   label:`JOKERS IN DECK: ${cfg.jokers}`, min:0, max:4 },
      ].map(s=>(
        <div key={s.key} style={{ marginBottom:16 }}>
          <div style={{ fontSize:10, color:M, fontFamily:'"Courier New",monospace', letterSpacing:1.5, marginBottom:5 }}>{s.label}</div>
          <input type="range" min={s.min} max={s.max} step={s.step||1} value={cfg[s.key]}
            style={{ width:'100%', accentColor:G }}
            onChange={e=>setCfg(p=>({...p,[s.key]:+e.target.value}))} />
        </div>
      ))}

      <div style={{ borderTop:`1px solid ${PANEL_BORDER}`, paddingTop:14, marginBottom:14 }}>
        <div style={{ fontSize:10, color:G, fontFamily:'"Courier New",monospace', letterSpacing:2, marginBottom:12 }}>SPECIAL RULES</div>
        <Toggle cfgKey="twosWild"
          label="2s ARE WILD CARDS"
          description="All four 2s act as extra wild cards alongside Jokers." />
        <Toggle cfgKey="canStealWild"
          label="STEAL OPPONENT'S WILD CARDS"
          description="During your meld phase, replace a wild in an AI meld with the real card from your hand to take the wild." />
        <Toggle cfgKey="canAddToOpponentMeld"
          label="ADD CARDS TO OPPONENT'S MELDS"
          description="Select cards from your hand, then click an AI meld to extend it." />
        <Toggle cfgKey="canTakeWholePile"
          label="TAKE WHOLE DISCARD PILE"
          description="Instead of drawing just the top card, you can take the entire discard pile into your hand." />
      </div>

      {/* Theme toggle */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:10, color:M, fontFamily:'"Courier New",monospace', letterSpacing:1.5, marginBottom:8 }}>BACKGROUND THEME</div>
        <div style={{ display:'flex', gap:8 }}>
          {[{label:'☀ LIGHT', val:false},{label:'🌙 DARK', val:true}].map(opt=>(
            <button key={String(opt.val)}
              style={{ ...btnStyle(darkMode===opt.val ? 'gold' : 'muted'), flex:1 }}
              onClick={()=>setDarkMode(opt.val)}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display:'flex', gap:10, marginTop:20 }}>
        <button style={btnStyle('gold')} onClick={startGame}>▶ START GAME</button>
        <button style={btnStyle('neon')} onClick={()=>{
          // Re-sort live hand with current mode and close
          setGs(prev => prev ? { ...prev, playerHand: sortHand(prev.playerHand, cfg.sortMode) } : prev);
          setModal(null);
        }}>✓ APPLY</button>
        <button style={btnStyle()} onClick={()=>setModal(null)}>CANCEL</button>
      </div>
    </Overlay>
    );
  };

  const RulesModal = () => (
    <Overlay>
      <div style={{ color:G, fontWeight:700, fontSize:17, marginBottom:18, fontFamily:'"Courier New",monospace', letterSpacing:1.5 }}>? RULES</div>
      {[
        ['OBJECTIVE','Empty your hand before the AI by forming melds and discarding all cards.'],
        ['YOUR TURN','① Draw from the deck or top of discard pile\n② Form melds / use special actions (optional)\n③ Discard one card to end your turn'],
        ['SET','3+ cards of the same rank, e.g. 7♠ 7♥ 7♣'],
        ['RUN','3+ consecutive cards of the same suit, e.g. 5♣ 6♣ 7♣'],
        ['WILD CARDS','Jokers (✦) substitute any card in a meld. Optionally, 2s can also be wild (see Setup).'],
        ['STEAL WILD (optional)','During your meld phase, click "Steal" next to a wild card in an AI meld. You must have the real card in your hand that fits that position — it swaps in, and the wild comes to you.'],
        ['ADD TO AI MELD (optional)','Select cards from your hand, then click "+ Add" on an AI meld to extend it. The cards must keep the meld valid.'],
        ['DISCARDING','Double-click or right-click any card in your hand to discard it.'],
        ['SCORING','Loser scores penalty pts = sum of remaining hand (J/Q/K=10, A=1). Lower total wins.'],
      ].map(([h,t])=>(
        <div key={h} style={{ marginBottom:14 }}>
          <div style={{ fontSize:10, color:N, fontFamily:'"Courier New",monospace', letterSpacing:1.5, marginBottom:3 }}>{h}</div>
          <div style={{ fontSize:13, color:RULE_TEXT, lineHeight:1.7, whiteSpace:'pre-line' }}>{t}</div>
        </div>
      ))}
      <button style={{ ...btnStyle('gold'), marginTop:10 }} onClick={()=>setModal(null)}>GOT IT</button>
    </Overlay>
  );

  const GameOverModal = () => {
    const won = msg.main.startsWith('🏆');
    return (
      <Overlay>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:48, marginBottom:8 }}>{won?'🏆':'🤖'}</div>
          <div style={{ fontSize:19, fontWeight:700, letterSpacing:2,
            fontFamily:'"Courier New",monospace',
            color: won?G:R, marginBottom:8 }}>
            {won ? `${cfg.playerName.toUpperCase()} WINS` : 'AI WINS'}
          </div>
          <div style={{ fontSize:13, color:M, marginBottom:22 }}>{msg.main}</div>
          <div style={{ display:'flex', gap:16, justifyContent:'center', marginBottom:24 }}>
            {[{l:cfg.playerName,v:scores.player,c:N},{l:'AI',v:scores.ai,c:R}].map(({l,v,c})=>(
              <div key={l} style={{ background: dk ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.04)', border:`1px solid ${c}33`,
                borderRadius:10, padding:'12px 22px', textAlign:'center' }}>
                <div style={{ fontSize:10, color:M, fontFamily:'"Courier New",monospace', letterSpacing:1 }}>{l.toUpperCase()}</div>
                <div style={{ fontSize:26, fontWeight:700, color:c, fontFamily:'"Courier New",monospace' }}>{v}</div>
                <div style={{ fontSize:10, color:M }}>penalty pts</div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
            <button style={btnStyle('neon')} onClick={startGame}>▶ NEW GAME</button>
            <button style={btnStyle()} onClick={()=>{ setPhase('idle'); setModal(null); }}>CLOSE</button>
          </div>
        </div>
      </Overlay>
    );
  };

  /* ─── Render ──────────────────────────────────────────────────────────── */
  return (
    <div style={{ minHeight:'100vh', background:BG,
      fontFamily:'"Helvetica Neue",Arial,sans-serif', color:TEXT, position:'relative' }}>

      {/* scanlines — subtle in dark mode only */}
      {dk && <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:1,
        backgroundImage:'repeating-linear-gradient(0deg,transparent 0,transparent 1px,rgba(0,0,0,.06) 1px,rgba(0,0,0,.06) 2px)',
        backgroundSize:'100% 2px' }}/>}

      {/* ── Header ── */}
      <header style={{ background:HDR,
        borderBottom:`1px solid ${HDR_BORDER}`, padding:'10px 18px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        flexWrap:'wrap', gap:10, position:'relative', zIndex:10,
        boxShadow: dk ? 'none' : '0 1px 4px rgba(0,0,0,.08)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <span style={{ fontSize:19, fontWeight:700, color:G,
            fontFamily:'"Courier New",monospace', letterSpacing:3 }}>♠ RUMMY</span>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <Pill label={cfg.playerName} value={scores.player} color={N}/>
            <Pill label="AI" value={scores.ai} color={R}/>
            {gs && <Pill label="Deck" value={gs.deck.length} color={M}/>}
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button style={btnStyle('gold')} onClick={startGame}>▶ NEW</button>
          {gs && phase!=='gameover' && (
            <button style={btnStyle('blue')} onClick={saveGame}>💾 SAVE</button>
          )}
          <button style={btnStyle('blue')} onClick={()=>setModal('setup')}>⚙ SETUP</button>
          <button style={btnStyle('muted')} onClick={()=>setModal('rules')}>? RULES</button>
          <button style={btnStyle('muted')} onClick={()=>setDarkMode(d=>!d)} title="Toggle theme">
            {dk ? '☀' : '🌙'}
          </button>
          {onQuit && (
            <button style={btnStyle('red')} onClick={onQuit}>✕ QUIT</button>
          )}
        </div>
      </header>

      {/* ── Toast ── */}
      {toast && (
        <div style={{ position:'fixed', top:62, left:'50%', transform:'translateX(-50%)',
          background: dk ? '#0f1c2b' : '#ffffff',
          border:`1px solid ${toast.startsWith('✓')?N:R}`,
          color: toast.startsWith('✓')?N:R, borderRadius:8, padding:'8px 18px',
          fontSize:12, fontFamily:'"Courier New",monospace', fontWeight:700,
          letterSpacing:.8, zIndex:300, whiteSpace:'nowrap',
          boxShadow:`0 4px 20px ${toast.startsWith('✓')?N+'33':R+'33'}` }}>
          {toast}
        </div>
      )}

      {/* ── Idle splash ── */}
      {!gs ? (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
          height:'calc(100vh - 52px)', flexDirection:'column', gap:0 }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:60, color:G, marginBottom:4, fontFamily:'"Courier New",monospace',
              textShadow: dk ? `0 0 40px ${G}66` : 'none' }}>♠♥♦♣</div>
            <div style={{ fontSize:26, fontWeight:700, color:G,
              fontFamily:'"Courier New",monospace', letterSpacing:4, marginBottom:6 }}>RUMMY</div>
            <div style={{ fontSize:12, color:M, marginBottom:28, letterSpacing:1 }}>Classic card game — be first to empty your hand</div>
            {hasSave && (
              <div style={{ ...panelStyle(`${G}55`), marginBottom:20, display:'inline-block', padding:'12px 24px' }}>
                <div style={{ fontSize:12, color:G, fontFamily:'"Courier New",monospace', marginBottom:10, letterSpacing:1 }}>
                  💾 SAVED GAME FOUND
                </div>
                <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
                  <button style={btnStyle('gold')} onClick={loadGame}>▶ RESUME</button>
                  <button style={btnStyle('muted')} onClick={clearSave}>✕ DISCARD</button>
                </div>
              </div>
            )}
            <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
              <button style={{ ...btnStyle('gold'), fontSize:14, padding:'10px 26px' }} onClick={startGame}>▶ NEW GAME</button>
              <button style={btnStyle('blue')} onClick={()=>setModal('setup')}>⚙ SETUP</button>
              <button style={btnStyle('muted')} onClick={()=>setModal('rules')}>? RULES</button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10,
          padding:'12px 14px', maxWidth:1080, margin:'0 auto' }}>

          {/* Message bar */}
          <div style={{ ...panelStyle(`${G}44`), display:'flex',
            alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
            <div>
              <div style={{ fontWeight:600, fontSize:14, color:G }}>{msg.main}</div>
              {msg.sub && <div style={{ fontSize:11, color:M, marginTop:2, fontStyle:'italic' }}>{msg.sub}</div>}
            </div>
            <div style={{ fontSize:9, color:M, fontFamily:'"Courier New",monospace', letterSpacing:2 }}>
              {phase==='draw' && '── DRAW PHASE ──'}
              {phase==='meld' && '── MELD / DISCARD PHASE ──'}
              {phase==='ai'   && '── AI TURN ──'}
            </div>
          </div>

          {/* AI zone */}
          <div style={panelStyle(`${R}33`)}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, flexWrap:'wrap' }}>
              <span style={{ fontSize:10, color:R, fontFamily:'"Courier New",monospace',
                fontWeight:700, letterSpacing:1.5 }}>🤖 AI OPPONENT</span>
              <Pill label="cards" value={gs.aiHand.length} color={R}/>
              {gs.aiMelds.length>0 && <Pill label="melds" value={gs.aiMelds.length} color={N}/>}
            </div>
            {/* AI melds — with steal/extend buttons when rules allow */}
            {gs.aiMelds.map((m,i)=>(
              <div key={i}>
                <MeldRow cards={m} index={i} color={N}/>
                {phase==='meld' && (cfg.canStealWild||cfg.canAddToOpponentMeld) && (
                  <div style={{ display:'flex', gap:6, marginTop:-2, marginBottom:6, flexWrap:'wrap', paddingLeft:4 }}>
                    {cfg.canStealWild && m.some(c=>c.isWild) && m.filter(c=>c.isWild).map(wc=>(
                      <button key={wc.id} style={{ ...btnStyle('gold'), fontSize:10, padding:'3px 8px' }}
                        onClick={()=>stealWild(i,wc)}>
                        ✦ Steal {wc.value==='Joker'?'Joker':wc.value+'★'}
                      </button>
                    ))}
                    {cfg.canAddToOpponentMeld && selected.length>0 && (
                      <button style={{ ...btnStyle('blue'), fontSize:10, padding:'3px 8px' }}
                        onClick={()=>addToOpponentMeld(i)}>
                        ＋ Add {selected.length} card{selected.length>1?'s':''} here
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div style={{ display:'flex', flexWrap:'wrap', gap:5, minHeight:70 }}>
              {gs.aiHand.map(c=>(
                /* Show wild cards face-up when steal option is on so player can see them */
                <Card key={c.id} card={c}
                  faceDown={!(cfg.canStealWild && c.isWild) && phase!=='gameover'}
                  size="sm"/>
              ))}
            </div>
            {cfg.canStealWild && gs.aiHand.some(c=>c.isWild) && phase==='meld' && (
              <div style={{ fontSize:9, color:G, fontFamily:'"Courier New",monospace', marginTop:4 }}>
                ✦ Wild cards in AI hand shown — steal them via AI melds above
              </div>
            )}
          </div>

          {/* Table */}
          <div style={panelStyle()}>
            <Divider label="TABLE" color={DIVIDER}/>
            <div style={{ display:'flex', gap:20, alignItems:'flex-start', flexWrap:'wrap', marginTop:12 }}>

              {/* Draw pile */}
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:9, color:M, fontFamily:'"Courier New",monospace',
                  letterSpacing:1.5, marginBottom:6 }}>DECK ({gs.deck.length})</div>
                <Card card={{ id:'back', suit:'Spades', value:'A', isWild:false }}
                  faceDown clickable={phase==='draw'} onClick={drawDeck} size="md"/>
                {phase==='draw' && (
                  <div style={{ fontSize:9, color:B, marginTop:5,
                    fontFamily:'"Courier New",monospace', letterSpacing:.5 }}>CLICK TO DRAW</div>
                )}
              </div>

              {/* Discard pile */}
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:9, color:M, fontFamily:'"Courier New",monospace',
                  letterSpacing:1.5, marginBottom:6 }}>DISCARD ({gs.discardPile.length})</div>
                {topDiscard
                  ? <Card key={topDiscard.id} card={topDiscard}
                      clickable={phase==='draw'} onClick={drawDiscardTop} size="md"/>
                  : <div style={{ width:68, height:98, border:`2px dashed ${PANEL_BORDER}`, borderRadius:8 }}/>
                }
                {phase==='draw' && topDiscard && (
                  <div style={{ marginTop:6, display:'flex', flexDirection:'column', gap:4, alignItems:'center' }}>
                    <div style={{ fontSize:9, color:B, fontFamily:'"Courier New",monospace', letterSpacing:.5 }}>
                      CLICK CARD = TOP ONLY
                    </div>
                    {cfg.canTakeWholePile && gs.discardPile.length > 1 && (
                      <button style={{ ...btnStyle('gold'), fontSize:9, padding:'3px 8px' }}
                        onClick={drawDiscardAll}>
                        ＋ TAKE ALL {gs.discardPile.length}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Meld action panel */}
              {phase==='meld' && (
                <div style={{ flex:1, minWidth:180, display:'flex', flexDirection:'column',
                  justifyContent:'center', gap:8, paddingLeft:8 }}>
                  <div style={{ fontSize:11, color:selCol, fontFamily:'"Courier New",monospace',
                    fontWeight:700, minHeight:16, letterSpacing:.3 }}>
                    {selStatus}
                  </div>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {selected.length>=3 && (
                      <button style={btnStyle(selOk?'neon':'red')} onClick={formMeld}>
                        {selOk?'▶ FORM MELD':'✗ INVALID MELD'}
                      </button>
                    )}
                    {selected.length>0 && (
                      <button style={btnStyle('muted')} onClick={()=>setSelected([])}>CLEAR</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Player zone */}
          <div style={{ ...panelStyle(), border:`1px solid ${N}55` }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, flexWrap:'wrap' }}>
              <span style={{ fontSize:10, color:N, fontFamily:'"Courier New",monospace',
                fontWeight:700, letterSpacing:1.5 }}>🎮 {cfg.playerName.toUpperCase()}</span>
              <Pill label="cards" value={gs.playerHand.length} color={N}/>
              {gs.playerMelds.length>0 && <Pill label="melds" value={gs.playerMelds.length} color={G}/>}
              {selected.length>0 && <Pill label="selected" value={selected.length} color={G}/>}
            </div>

            {gs.playerMelds.map((m,i)=>(
              <div key={i}>
                <MeldRow cards={m} index={i} color={N}/>
                {phase==='meld' && selected.length>0 && (
                  <div style={{ marginTop:-2, marginBottom:6, paddingLeft:4 }}>
                    <button style={{ ...btnStyle('neon'), fontSize:10, padding:'3px 10px' }}
                      onClick={()=>addToOwnMeld(i)}>
                      ＋ Add {selected.length} card{selected.length>1?'s':''} to this meld
                    </button>
                  </div>
                )}
              </div>
            ))}

            <div style={{ display:'flex', flexWrap:'wrap', gap:6,
              minHeight:100, alignItems:'flex-end', paddingTop:4 }}>
              {gs.playerHand.map(card=>(
                <Card key={card.id} card={card}
                  selected={selected.some(s=>s.id===card.id)}
                  clickable={phase==='meld'}
                  dim={phase!=='meld'&&phase!=='idle'&&phase!=='gameover'}
                  onClick={()=>toggleSel(card)}
                  onDblClick={()=>discardCard(card)}
                  size="md"
                />
              ))}
            </div>

            {phase==='meld' && (
              <div style={{ fontSize:10, color:M, marginTop:8,
                fontFamily:'"Courier New",monospace', letterSpacing:.3 }}>
                Click to select → form new meld or extend existing &nbsp;|&nbsp; Double-click or right-click to discard
              </div>
            )}          </div>

        </div>
      )}

      {/* ── Modals ── */}
      {modal==='setup'         && <SetupModal/>}
      {modal==='rules'         && <RulesModal/>}
      {phase==='gameover'      && <GameOverModal/>}

    </div>
  );
}
