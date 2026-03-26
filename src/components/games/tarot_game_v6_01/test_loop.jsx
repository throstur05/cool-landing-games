import { useState } from "react";

const CARDS = [
  { id:"c1", name:"The Strike",     power:7, tags:["action","power"] },
  { id:"c2", name:"The Spiral",     power:6, tags:["recursion","integration"] },
  { id:"c3", name:"The Mirror",     power:6, tags:["reflection","wisdom"] },
  { id:"c4", name:"The Collapse",   power:6, tags:["collapse","challenge"] },
  { id:"c5", name:"The Rebirth",    power:8, tags:["rebirth","renewal","healing"] },
  { id:"c6", name:"The Integration",power:7, tags:["integration","coherence","healing"] },
];
const THEMES = ["Intention","Challenge","Action","Integration","Healing","Wisdom"];

function deal(n) {
  const d = [...CARDS, ...CARDS, ...CARDS, ...CARDS].slice();
  const hand = [];
  for(let i=0;i<n;i++) hand.push({...d[i], uid: i+"-"+Math.random()});
  return hand;
}

export default function TestLoop() {
  const [phase, setPhase] = useState("roll");   // "roll" | "play" | "end"
  const [round, setRound] = useState(0);
  const [hand, setHand] = useState(() => deal(6));
  const [played, setPlayed] = useState(null);
  const [score, setScore] = useState(0);
  const [log, setLog] = useState([]);

  const theme = THEMES[round % 6];
  const addLog = (msg) => setLog(l => [msg, ...l].slice(0,20));

  const doRoll = () => {
    if (phase !== "roll") return;
    const roll = Math.ceil(Math.random() * 6);
    addLog(`Rolled ${roll}`);
    setPhase("play");
  };

  const doPlay = (card) => {
    if (phase !== "play") return;
    const sc = card.power + (card.tags.includes(theme.toLowerCase()) ? 3 : 0);
    setPlayed({ ...card, sc });
    setHand(h => h.filter(c => c.uid !== card.uid));
    addLog(`Played ${card.name} for ${sc}`);
    setPhase("end");
  };

  const doEndTurn = () => {
    if (phase !== "end" || !played) return;
    setScore(s => s + played.sc);
    setPlayed(null);
    const newCard = { ...CARDS[round % CARDS.length], uid: round+"-new" };
    setHand(h => [...h, newCard]);
    addLog(`AI played for ${5 + Math.ceil(Math.random()*4)}`);
    setRound(r => r + 1);
    setPhase("roll");
  };

  return (
    <div style={{fontFamily:"sans-serif",padding:20,maxWidth:600}}>
      <h2>Loop Test — Round {round+1} · Theme: {theme}</h2>
      <div style={{marginBottom:10}}>
        Score: <b>{score}</b> · Phase: <b style={{color: phase==="roll"?"#7c5cbf":phase==="play"?"#0e8f8f":"#e07c2a"}}>{phase}</b>
      </div>

      {phase === "roll" && (
        <button onClick={doRoll}
          style={{padding:"10px 24px",background:"#7c5cbf",color:"#fff",border:"none",borderRadius:8,cursor:"pointer",fontSize:15}}>
          🎲 Roll Dice
        </button>
      )}

      {phase === "play" && (
        <div>
          <div style={{marginBottom:8,color:"#555"}}>Select a card to play:</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {hand.map(card => (
              <button key={card.uid} onClick={() => doPlay(card)}
                style={{padding:"8px 14px",background:"#fff",border:"2px solid #7c5cbf",borderRadius:8,cursor:"pointer"}}>
                <b>{card.name}</b> P{card.power}<br/>
                <span style={{fontSize:11,color:"#888"}}>{card.tags.join(" ")}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === "end" && played && (
        <div>
          <div style={{marginBottom:8}}>Played: <b>{played.name}</b> for <b>{played.sc}</b> pts</div>
          <button onClick={doEndTurn}
            style={{padding:"10px 24px",background:"#0e8f8f",color:"#fff",border:"none",borderRadius:8,cursor:"pointer",fontSize:15}}>
            End Turn ▶
          </button>
        </div>
      )}

      <div style={{marginTop:20,fontSize:12,color:"#666"}}>
        <b>Hand ({hand.length} cards):</b> {hand.map(c=>c.name).join(", ")}
      </div>

      <div style={{marginTop:12,fontSize:12,background:"#f5f2ed",padding:10,borderRadius:8,maxHeight:150,overflow:"auto"}}>
        {log.map((l,i) => <div key={i}>{l}</div>)}
      </div>
    </div>
  );
}
