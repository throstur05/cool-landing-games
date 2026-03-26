import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Hearts_v2.jsx — Claude House Edition
 * Self-contained: all styles are injected via a <style> tag.
 * 4 players: 1 Human + 3 AI
 * AI difficulty selectable 1..8, Teaching Mode, Hints, full rule-set
 * Usage: <Hearts2 onQuit={() => navigateBack()} />
 */

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lora:ital,wght@0,400;0,500;1,400&display=swap');

:root {
  --cream:   #faf7f2;
  --parchment: #f3ede2;
  --warm-white: #fffcf7;
  --ink:     #2a1f14;
  --ink-muted: #7a6550;
  --terra:   #c85a2a;
  --terra-light: #f0d5c8;
  --terra-pale:  #fdf0ea;
  --amber:   #d97c2b;
  --gold:    #b8953a;
  --sage:    #5a7a5a;
  --sage-pale: #eaf2ea;
  --ruby:    #9e2a2b;
  --border:  #e0d4c0;
  --border-strong: #c8b89a;
  --shadow-sm: 0 2px 8px rgba(42,31,20,0.07);
  --shadow-md: 0 6px 24px rgba(42,31,20,0.12);
  --shadow-lg: 0 16px 48px rgba(42,31,20,0.16);
  --r-sm: 8px;
  --r-md: 14px;
  --r-lg: 20px;
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body: 'Lora', Georgia, serif;
}

*, *::before, *::after { box-sizing: border-box; }

.h2-root {
  min-height: 100vh;
  background: var(--cream);
  background-image:
    radial-gradient(ellipse at 20% 0%, rgba(200,90,42,0.06) 0%, transparent 55%),
    radial-gradient(ellipse at 80% 100%, rgba(184,149,58,0.07) 0%, transparent 55%);
  font-family: var(--font-body);
  color: var(--ink);
}

/* ── TOPBAR ── */
.h2-topbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 24px;
  background: var(--warm-white);
  border-bottom: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  position: sticky; top: 0; z-index: 10;
}
.h2-logo {
  font-family: var(--font-display);
  font-size: 22px; font-weight: 700;
  color: var(--ink);
  display: flex; align-items: center; gap: 10px;
  letter-spacing: -0.3px;
}
.h2-logo-heart {
  width: 32px; height: 32px; background: var(--terra);
  border-radius: 50%; display: grid; place-items: center;
  color: #fff; font-size: 16px; flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(200,90,42,0.35);
}
.h2-topbar-btns { display: flex; gap: 8px; align-items: center; }

/* ── BUTTONS ── */
.h2-btn {
  font-family: var(--font-body);
  font-size: 13px; font-weight: 500;
  padding: 8px 16px; border-radius: var(--r-sm);
  border: 1px solid var(--border-strong);
  background: var(--warm-white); color: var(--ink);
  cursor: pointer; transition: all 0.15s ease;
  letter-spacing: 0.2px;
}
.h2-btn:hover { background: var(--parchment); box-shadow: var(--shadow-sm); transform: translateY(-1px); }
.h2-btn:active { transform: translateY(0); }
.h2-btn-primary {
  background: var(--terra); color: #fff; border-color: var(--terra);
  box-shadow: 0 2px 10px rgba(200,90,42,0.3);
}
.h2-btn-primary:hover { background: #b54d22; box-shadow: 0 4px 16px rgba(200,90,42,0.4); }
.h2-btn-quit { border-color: #e8c4b8; color: var(--ruby); background: #fff5f3; }
.h2-btn-quit:hover { background: #fde8e1; }
.h2-btn:disabled { opacity: 0.38; cursor: not-allowed; transform: none; box-shadow: none; }

/* ── MAIN LAYOUT ── */
.h2-table {
  max-width: 1100px; margin: 0 auto; padding: 20px 20px 40px;
  display: flex; flex-direction: column; gap: 14px;
}

/* ── STATUS BAR ── */
.h2-status {
  display: flex; flex-wrap: wrap; gap: 8px; align-items: center; justify-content: space-between;
  padding: 10px 16px; background: var(--warm-white);
  border: 1px solid var(--border); border-radius: var(--r-md);
  box-shadow: var(--shadow-sm); font-size: 13px; color: var(--ink-muted);
}
.h2-status b { color: var(--ink); font-weight: 600; }
.h2-status-pill {
  display: inline-flex; align-items: center; gap: 5px;
  background: var(--terra-pale); color: var(--terra);
  border: 1px solid var(--terra-light); border-radius: 999px;
  padding: 3px 10px; font-size: 12px; font-weight: 500;
}

/* ── OPPONENTS ── */
.h2-opponents {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
}
.h2-opp {
  background: var(--warm-white); border: 1px solid var(--border);
  border-radius: var(--r-md); padding: 12px; box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s;
}
.h2-opp.active { border-color: var(--amber); box-shadow: 0 0 0 2px rgba(217,124,43,0.2), var(--shadow-sm); }
.h2-opp-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.h2-opp-name { font-family: var(--font-display); font-size: 14px; font-weight: 600; }
.h2-opp-score { font-size: 12px; color: var(--ink-muted); }
.h2-opp-cards { display: flex; gap: 4px; flex-wrap: wrap; min-height: 50px; align-items: flex-start; }
.h2-card-back {
  width: 32px; height: 46px; border-radius: 5px;
  background: linear-gradient(145deg, var(--parchment) 0%, var(--border) 100%);
  border: 1px solid var(--border-strong);
  box-shadow: 0 1px 3px rgba(42,31,20,0.1);
  position: relative; overflow: hidden;
}
.h2-card-back::after {
  content: ''; position: absolute; inset: 3px;
  border: 1px solid var(--border-strong); border-radius: 3px; opacity: 0.5;
}

/* ── TRICK CENTER ── */
.h2-trick {
  position: relative; height: 170px;
  background: var(--warm-white); border: 1px solid var(--border);
  border-radius: var(--r-lg); box-shadow: var(--shadow-sm);
  display: grid; place-items: center;
  overflow: hidden;
}
.h2-trick::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(ellipse at center, rgba(200,90,42,0.04) 0%, transparent 70%);
}
.h2-trick-slot {
  position: absolute; text-align: center; z-index: 2;
}
.h2-trick-slot.tp0 { bottom: 12px; left: 50%; transform: translateX(-50%); }
.h2-trick-slot.tp1 { top: 12px; left: 50%; transform: translateX(-50%); }
.h2-trick-slot.tp2 { right: 18px; top: 50%; transform: translateY(-50%); }
.h2-trick-slot.tp3 { left: 18px; top: 50%; transform: translateY(-50%); }
.h2-trick-name { font-size: 11px; color: var(--ink-muted); margin-top: 4px; font-family: var(--font-display); }
.h2-trick-empty {
  color: var(--border-strong); font-family: var(--font-display);
  font-size: 16px; font-style: italic; position: relative; z-index: 1;
}

/* ── PLAYING CARDS ── */
.h2-card {
  width: 54px; height: 76px; border-radius: 8px;
  background: var(--warm-white); border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 2px; user-select: none; cursor: default;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  position: relative;
}
.h2-card-rank { font-family: var(--font-display); font-size: 17px; font-weight: 700; line-height: 1; }
.h2-card-suit { font-size: 14px; line-height: 1; }
.h2-card.red .h2-card-rank, .h2-card.red .h2-card-suit { color: var(--ruby); }
.h2-card.black .h2-card-rank, .h2-card.black .h2-card-suit { color: var(--ink); }

/* hand cards */
.h2-card.playable {
  cursor: pointer; border-color: var(--border-strong);
}
.h2-card.playable:hover {
  transform: translateY(-8px) scale(1.04);
  box-shadow: 0 12px 28px rgba(42,31,20,0.18);
  border-color: var(--amber); z-index: 2;
}
.h2-card.dimmed { opacity: 0.30; cursor: not-allowed; }
.h2-card.hinted {
  border: 2px solid var(--sage); box-shadow: 0 0 0 3px rgba(90,122,90,0.2), var(--shadow-md);
}
.h2-card.hinted::after {
  content: '✓'; position: absolute; top: -8px; right: -8px;
  background: var(--sage); color: #fff; border-radius: 50%;
  width: 18px; height: 18px; font-size: 10px;
  display: grid; place-items: center; font-family: sans-serif;
}
.h2-card.pass-selected {
  border: 2px solid var(--terra); box-shadow: 0 0 0 3px rgba(200,90,42,0.2);
  transform: translateY(-6px);
}

/* ── HAND ROW ── */
.h2-hand {
  background: var(--warm-white); border: 1px solid var(--border);
  border-radius: var(--r-lg); padding: 14px 16px;
  display: flex; flex-wrap: wrap; gap: 8px; min-height: 100px;
  box-shadow: var(--shadow-sm);
  align-items: flex-end;
}
.h2-hand-label {
  font-family: var(--font-display); font-size: 13px; font-weight: 600;
  color: var(--ink-muted); width: 100%; margin-bottom: 2px;
}

/* ── PASS PANEL ── */
.h2-pass {
  background: var(--terra-pale); border: 1px solid var(--terra-light);
  border-radius: var(--r-md); padding: 14px 16px;
  display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
}
.h2-pass-label { font-size: 14px; color: var(--ink); font-family: var(--font-display); font-weight: 600; }
.h2-pass-pills { display: flex; gap: 6px; flex: 1; flex-wrap: wrap; }
.h2-pill {
  background: #fff; border: 1px solid var(--terra-light); color: var(--terra);
  padding: 4px 12px; border-radius: 999px; font-size: 13px; font-family: var(--font-display); font-weight: 600;
}

/* ── TEACHING BAR ── */
.h2-teach {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 14px; background: var(--sage-pale);
  border: 1px solid #c8dcb8; border-radius: var(--r-md);
  font-size: 13px; color: var(--sage);
}

/* ── SCOREBOARD ── */
.h2-score {
  background: var(--warm-white); border: 1px solid var(--border);
  border-radius: var(--r-md); padding: 14px; box-shadow: var(--shadow-sm);
}
.h2-score-title {
  font-family: var(--font-display); font-size: 16px; font-weight: 700;
  color: var(--ink); margin-bottom: 10px;
}
.h2-score table { width: 100%; border-collapse: collapse; font-size: 14px; }
.h2-score th {
  text-align: left; padding: 8px 10px;
  font-family: var(--font-display); font-size: 12px; font-weight: 600;
  color: var(--ink-muted); text-transform: uppercase; letter-spacing: 0.6px;
  border-bottom: 1px solid var(--border);
}
.h2-score td { padding: 8px 10px; border-bottom: 1px solid var(--border); }
.h2-score tr.current td { background: var(--terra-pale); font-weight: 500; }
.h2-score tr:last-child td { border-bottom: none; }
.h2-score-bar {
  height: 4px; border-radius: 2px; background: var(--border); margin-top: 4px; overflow: hidden;
}
.h2-score-fill { height: 100%; border-radius: 2px; background: var(--terra); transition: width 0.6s ease; }
.h2-score-fill.winning { background: var(--sage); }
.h2-score-actions { margin-top: 12px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.h2-winner-badge {
  padding: 8px 18px; background: linear-gradient(135deg, var(--gold), var(--amber));
  color: #fff; border-radius: 999px; font-family: var(--font-display); font-weight: 600; font-size: 15px;
  box-shadow: 0 4px 14px rgba(184,149,58,0.35);
}

/* ── LOG ── */
.h2-log {
  background: var(--warm-white); border: 1px solid var(--border);
  border-radius: var(--r-md); overflow: hidden; box-shadow: var(--shadow-sm);
}
.h2-log-head {
  padding: 9px 14px; font-family: var(--font-display); font-size: 13px; font-weight: 600;
  border-bottom: 1px solid var(--border); background: var(--parchment); color: var(--ink-muted);
  display: flex; align-items: center; gap: 6px;
}
.h2-log-body { max-height: 130px; overflow-y: auto; padding: 8px 14px; }
.h2-log-line { padding: 3px 0; font-size: 13px; color: var(--ink-muted); border-bottom: 1px solid var(--border); }
.h2-log-line:last-child { border-bottom: none; }
.h2-log-line::before { content: '→ '; color: var(--terra); }

/* ── MODAL ── */
.h2-backdrop {
  position: fixed; inset: 0; background: rgba(42,31,20,0.35);
  backdrop-filter: blur(3px);
  display: grid; place-items: center; z-index: 50;
  animation: h2-fade-in 0.2s ease;
}
@keyframes h2-fade-in { from { opacity: 0; } to { opacity: 1; } }
.h2-modal {
  width: min(860px, 95vw); max-height: 90vh;
  background: var(--warm-white); border-radius: var(--r-lg);
  border: 1px solid var(--border); box-shadow: var(--shadow-lg);
  display: flex; flex-direction: column; overflow: hidden;
  animation: h2-slide-up 0.22s ease;
}
@keyframes h2-slide-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
.h2-modal-head {
  padding: 20px 24px 16px; border-bottom: 1px solid var(--border);
  background: var(--parchment);
}
.h2-modal-head h2 {
  margin: 0; font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--ink);
}
.h2-modal-head p { margin: 4px 0 0; font-size: 13px; color: var(--ink-muted); }
.h2-modal-body { padding: 20px 24px; overflow-y: auto; flex: 1; }
.h2-modal-foot {
  padding: 14px 24px; border-top: 1px solid var(--border);
  display: flex; justify-content: flex-end; gap: 10px; background: var(--parchment);
}

/* settings grid */
.h2-settings {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;
}
.h2-field { display: flex; flex-direction: column; gap: 6px; }
.h2-field label {
  font-family: var(--font-display); font-size: 12px; font-weight: 600;
  color: var(--ink-muted); text-transform: uppercase; letter-spacing: 0.5px;
}
.h2-field input[type="number"],
.h2-field select {
  padding: 8px 10px; border: 1px solid var(--border-strong);
  border-radius: var(--r-sm); background: #fff; color: var(--ink);
  font-family: var(--font-body); font-size: 14px;
}
.h2-field input[type="range"] { accent-color: var(--terra); width: 100%; }
.h2-field-range-val {
  display: inline-block; background: var(--terra-pale); color: var(--terra);
  padding: 2px 10px; border-radius: 999px; font-size: 13px; font-weight: 600;
  border: 1px solid var(--terra-light); min-width: 32px; text-align: center;
}
.h2-checkbox-row { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.h2-checkbox-row input { accent-color: var(--terra); width: 16px; height: 16px; }
.h2-checkbox-row span { font-size: 14px; color: var(--ink); }

/* rules */
.h2-rules-body ol, .h2-rules-body ul { padding-left: 18px; }
.h2-rules-body li { padding: 5px 0; font-size: 14px; line-height: 1.65; }
.h2-rules-body h3 {
  font-family: var(--font-display); font-size: 16px; margin: 20px 0 8px;
  color: var(--terra); border-bottom: 1px solid var(--terra-light); padding-bottom: 4px;
}
.h2-section-divider {
  border: none; border-top: 1px solid var(--border); margin: 16px 0;
}

/* ── MENU SCREEN ── */
.h2-menu-screen {
  min-height: calc(100vh - 60px);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 40px 20px; gap: 32px; text-align: center;
}
.h2-menu-hero {
  display: flex; flex-direction: column; align-items: center; gap: 16px;
}
.h2-menu-icon {
  width: 80px; height: 80px; background: var(--terra); border-radius: 50%;
  display: grid; place-items: center; color: #fff; font-size: 38px;
  box-shadow: 0 8px 30px rgba(200,90,42,0.35);
}
.h2-menu-title {
  font-family: var(--font-display); font-size: 44px; font-weight: 700;
  color: var(--ink); line-height: 1; letter-spacing: -1px;
}
.h2-menu-subtitle { font-size: 16px; color: var(--ink-muted); font-style: italic; }
.h2-menu-card {
  background: var(--warm-white); border: 1px solid var(--border);
  border-radius: var(--r-lg); padding: 28px 32px; width: min(480px, 100%);
  box-shadow: var(--shadow-md); text-align: left;
}
.h2-menu-card h3 {
  font-family: var(--font-display); font-size: 17px; font-weight: 700;
  margin: 0 0 16px; color: var(--ink);
}
.h2-menu-actions { display: flex; gap: 10px; justify-content: center; width: min(480px, 100%); flex-wrap: wrap; }
`;

// ─── Utility ──────────────────────────────────────────────────
const SUITS = ["♣", "♦", "♥", "♠"];
const RANKS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
const prettyRank = (r) => (r <= 10 ? String(r) : { 11: "J", 12: "Q", 13: "K", 14: "A" }[r]);
const makeDeck = () => {
  const deck = [];
  for (const s of SUITS) for (const r of RANKS)
    deck.push({ suit: s, rank: r, code: `${prettyRank(r)}${s}` });
  return deck;
};
const clone = (x) => JSON.parse(JSON.stringify(x));
const sortHand = (hand) =>
  [...hand].sort((a, b) => {
    const si = SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit);
    return si !== 0 ? si : a.rank - b.rank;
  });
const pointsOfTrick = (cards) =>
  cards.reduce((acc, c) => acc + (c.suit === "♥" ? 1 : c.suit === "♠" && c.rank === 12 ? 13 : 0), 0);
const cardEquals = (a, b) => a && b && a.suit === b.suit && a.rank === b.rank;
const isRed = (card) => card.suit === "♥" || card.suit === "♦";

// ─── Card component ───────────────────────────────────────────
function HCard({ card, className = "", onClick, style }) {
  return (
    <div
      className={`h2-card ${isRed(card) ? "red" : "black"} ${className}`}
      onClick={onClick}
      style={style}
      title={card.code}
      role={onClick ? "button" : undefined}
    >
      <span className="h2-card-rank">{prettyRank(card.rank)}</span>
      <span className="h2-card-suit">{card.suit}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
const DEFAULT_OPTS = {
  targetScore: 100,
  aiLevel: 5,
  teachingMode: true,
  showLegalOnly: true,
  confirmPlays: false,
  trickSpeedMs: 700,
  passCycle: "standard",
  moonMode: "others+26",
  queenBreaksHearts: false,
};

export default function Hearts2({ onQuit }) {
  const [options, setOptions] = useState(DEFAULT_OPTS);
  const [players, setPlayers] = useState(() => [
    { id: 0, name: "You", isHuman: true, hand: [], pile: [], score: 0 },
    { id: 1, name: "North", isHuman: false, hand: [], pile: [], score: 0 },
    { id: 2, name: "East", isHuman: false, hand: [], pile: [], score: 0 },
    { id: 3, name: "West", isHuman: false, hand: [], pile: [], score: 0 },
  ]);
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState("menu");
  const [passDir, setPassDir] = useState("hold");
  const [passes, setPasses] = useState([[], [], [], []]);
  const [heartsBroken, setHeartsBroken] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [leader, setLeader] = useState(0);
  const [trick, setTrick] = useState([]);
  const [leadSuit, setLeadSuit] = useState(null);
  const [log, setLog] = useState([]);
  const [showRules, setShowRules] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hintCard, setHintCard] = useState(null);
  const aiTimerRef = useRef(null);

  // Inject styles once
  useEffect(() => {
    const id = "h2-styles";
    if (!document.getElementById(id)) {
      const el = document.createElement("style");
      el.id = id; el.textContent = STYLES;
      document.head.appendChild(el);
    }
    return () => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };
  }, []);

  // ── pass cycle ──
  const passCycleForRound = (r, opt) => {
    if (opt.passCycle === "off") return "hold";
    if (opt.passCycle === "random") return ["left", "right", "across", "hold"][Math.floor(Math.random() * 4)];
    return ["left", "right", "across", "hold"][(r + 1) % 4];
  };

  // ── deal ──
  const dealRound = (opt = options, currentRound = round, currentPlayers = players) => {
    const deck = makeDeck();
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    const hands = [[], [], [], []];
    for (let i = 0; i < 52; i++) hands[i % 4].push(deck[i]);
    const np = currentPlayers.map((p, i) => ({ ...p, hand: sortHand(hands[i]), pile: [] }));
    const pd = passCycleForRound(currentRound, opt);
    const twoClubs = np.findIndex((p) => p.hand.some((c) => c.suit === "♣" && c.rank === 2));
    setPassDir(pd);
    setHeartsBroken(false);
    setPasses([[], [], [], []]);
    setPlayers(np);
    setTrick([]);
    setLeadSuit(null);
    setHintCard(null);
    setLeader(twoClubs);
    setCurrentPlayer(twoClubs);
    setPhase(pd === "hold" ? "play" : "pass");
    setLog((l) => [...l, { t: Date.now(), msg: `Round ${currentRound + 1} — Pass: ${pd.toUpperCase()}` }]);
  };

  const startNewGame = (override = {}) => {
    const newOpts = { ...options, ...override };
    setOptions(newOpts);
    const freshPlayers = players.map((p) => ({ ...p, score: 0, pile: [], hand: [] }));
    setPlayers(freshPlayers);
    setRound(0);
    setLog([{ t: Date.now(), msg: "New game started." }]);
    dealRound(newOpts, 0, freshPlayers);
  };

  // ── passing ──
  const passIndex = (i) => {
    if (passDir === "left") return (i + 1) % 4;
    if (passDir === "right") return (i + 3) % 4;
    if (passDir === "across") return (i + 2) % 4;
    return i;
  };

  const toggleSelectPass = (card) => {
    if (phase !== "pass") return;
    setPasses((pp) => {
      const mine = pp[0] || [];
      const exists = mine.find((c) => cardEquals(c, card));
      let nextMine;
      if (exists) nextMine = mine.filter((c) => !cardEquals(c, card));
      else if (mine.length < 3) nextMine = [...mine, card];
      else nextMine = mine;
      const out = clone(pp);
      out[0] = nextMine;
      return out;
    });
  };

  const autoSelectPassForAI = (hand) => {
    const pick = [];
    const hasQS = hand.some((c) => c.suit === "♠" && c.rank === 12);
    if (hasQS) {
      const highSpades = hand.filter((c) => c.suit === "♠").sort((a, b) => b.rank - a.rank);
      for (const c of highSpades) { if (pick.length < 3) pick.push(c); }
    }
    if (pick.length < 3) {
      const highHearts = hand.filter((c) => c.suit === "♥").sort((a, b) => b.rank - a.rank);
      for (const c of highHearts) { if (pick.length < 3) pick.push(c); }
    }
    if (pick.length < 3) {
      const bySuit = SUITS.map((s) => hand.filter((c) => c.suit === s));
      const suitSizes = bySuit.map((arr, si) => ({ si, n: arr.length })).sort((a, b) => a.n - b.n);
      for (const ss of suitSizes) {
        const sorted = bySuit[ss.si].slice().sort((a, b) => b.rank - a.rank);
        for (const c of sorted) { if (pick.length < 3) pick.push(c); }
        if (pick.length >= 3) break;
      }
    }
    const unique = [];
    for (const c of pick) {
      if (!unique.some((u) => cardEquals(u, c))) unique.push(c);
      if (unique.length === 3) break;
    }
    // last resort
    if (unique.length < 3) {
      for (const c of hand) {
        if (!unique.some((u) => cardEquals(u, c))) unique.push(c);
        if (unique.length === 3) break;
      }
    }
    return unique;
  };

  const submitPass = () => {
    if (passDir === "hold") { setPhase("play"); return; }
    if ((passes[0] || []).length !== 3) return;
    let np = clone(players);
    const aiPasses = np.map((p, i) => i === 0 ? passes[0] : autoSelectPassForAI(p.hand));
    np = np.map((p, i) => ({ ...p, hand: p.hand.filter((c) => !aiPasses[i].some((r) => cardEquals(r, c))) }));
    np = np.map((p, i) => {
      const fromIdx = [0, 1, 2, 3].find((k) => passIndex(k) === i);
      return { ...p, hand: sortHand([...p.hand, ...aiPasses[fromIdx]]) };
    });
    setPlayers(np);
    setPasses([[], [], [], []]);
    setPhase("play");
    setLog((l) => [...l, { t: Date.now(), msg: `Cards passed (${passDir}). 2♣ leads.` }]);
  };

  // ── legal moves ──
  const hasSuit = (hand, suit) => hand.some((c) => c.suit === suit);
  const legalMoves = (hand, trickArg = trick, leadSuitArg = leadSuit, hbArg = heartsBroken) => {
    if (trickArg.length === 0) {
      if (hand.some((c) => c.suit === "♣" && c.rank === 2)) return hand.filter((c) => c.suit === "♣" && c.rank === 2);
      const nonHearts = hand.filter((c) => c.suit !== "♥");
      if (!hbArg && nonHearts.length > 0) return nonHearts;
      return hand;
    } else {
      if (hasSuit(hand, leadSuitArg)) return hand.filter((c) => c.suit === leadSuitArg);
      const isFirstTrick = players.reduce((a, p) => a + p.pile.length, 0) === 0 && trickArg.length > 0;
      if (isFirstTrick) {
        const nonPts = hand.filter((c) => !(c.suit === "♥" || (c.suit === "♠" && c.rank === 12)));
        return nonPts.length ? nonPts : hand;
      }
      return hand;
    }
  };

  // ── AI ──
  const chooseAiCard = (hand, level, trickArg = trick, leadSuitArg = leadSuit, hbArg = heartsBroken) => {
    const legal = legalMoves(hand, trickArg, leadSuitArg, hbArg);
    if (level <= 1) return legal[Math.floor(Math.random() * legal.length)];
    const isPoints = (c) => c.suit === "♥" || (c.suit === "♠" && c.rank === 12);
    const highestInTrickOfSuit = (suit) =>
      Math.max(...trickArg.filter((t) => t.card.suit === suit).map((t) => t.card.rank), -Infinity);
    const canWin = (c) => {
      if (trickArg.length === 0) return true;
      if (c.suit !== leadSuitArg) return false;
      return c.rank > highestInTrickOfSuit(leadSuitArg);
    };
    const lowest = (arr) => arr.slice().sort((a, b) => a.rank - b.rank)[0];
    const highest = (arr) => arr.slice().sort((a, b) => b.rank - a.rank)[0];
    const duckers = legal.filter((c) => !canWin(c));
    const winners = legal.filter((c) => canWin(c));
    const trickHasPoints = trickArg.some((t) => isPoints(t.card));
    const idxInTrick = trickArg.length;

    if (level === 2) {
      if (trickHasPoints && duckers.length) return lowest(duckers);
      return lowest(legal);
    }
    if (leadSuitArg && !hasSuit(hand, leadSuitArg)) {
      const dumpQS = legal.find((c) => c.suit === "♠" && c.rank === 12);
      if (dumpQS && idxInTrick >= (level >= 6 ? 1 : 2)) return dumpQS;
      const highHearts = legal.filter((c) => c.suit === "♥").sort((a, b) => b.rank - a.rank);
      if (highHearts.length && idxInTrick >= (level >= 6 ? 1 : 2)) return highHearts[0];
      return highest(legal);
    }
    if (leadSuitArg && hasSuit(hand, leadSuitArg)) {
      if (trickHasPoints && duckers.length) return lowest(duckers);
      if (idxInTrick < 3) return lowest(legal);
      if (trickHasPoints && duckers.length) return lowest(duckers);
      return lowest(winners.length ? winners : legal);
    }
    const nonHearts = legal.filter((c) => c.suit !== "♥");
    if (nonHearts.length) {
      const groups = SUITS
        .map((s) => ({ s, cards: legal.filter((c) => c.suit === s).sort((a, b) => a.rank - b.rank) }))
        .filter((g) => g.cards.length)
        .sort((a, b) => a.cards.length - b.cards.length || a.cards[0].rank - b.cards[0].rank);
      return groups[0].cards[0];
    }
    return lowest(legal);
  };

  // ── play card ──
  const playCard = (playerIndex, card) => {
    const p = players[playerIndex];
    const legal = legalMoves(p.hand);
    if (!legal.some((c) => cardEquals(c, card))) return;

    const nextPlayers = players.map((pl, i) =>
      i === playerIndex ? { ...pl, hand: pl.hand.filter((c) => !cardEquals(c, card)) } : pl
    );
    const nextTrick = [...trick, { player: playerIndex, card }];
    const isLead = trick.length === 0;
    const nextLeadSuit = isLead ? card.suit : leadSuit;

    let nextHB = heartsBroken;
    if (!nextHB && card.suit === "♥") nextHB = true;
    if (!nextHB && options.queenBreaksHearts && card.suit === "♠" && card.rank === 12) nextHB = true;

    setPlayers(nextPlayers);
    setTrick(nextTrick);
    setHeartsBroken(nextHB);
    if (isLead) setLeadSuit(nextLeadSuit);
    setHintCard(null);

    if (nextTrick.length < 4) {
      setCurrentPlayer((playerIndex + 1) % 4);
    } else {
      window.setTimeout(() => {
        const led = nextTrick.filter((x) => x.card.suit === nextLeadSuit);
        const winnerIdx = led.reduce((a, b) => (a.card.rank > b.card.rank ? a : b)).player;
        const pts = pointsOfTrick(nextTrick.map((t) => t.card));
        const updated = nextPlayers.map((pl, i) =>
          i === winnerIdx ? { ...pl, pile: [...pl.pile, ...nextTrick.map((t) => t.card)] } : pl
        );
        setPlayers(updated);
        setLog((l) => [...l, { t: Date.now(), msg: `${players[winnerIdx]?.name || `P${winnerIdx}`} won trick${pts ? ` (+${pts}pts)` : ""}.` }]);
        setTrick([]);
        setLeadSuit(null);
        setCurrentPlayer(winnerIdx);
        setLeader(winnerIdx);
        if (updated.reduce((a, p) => a + p.hand.length, 0) === 0) scoreRound(updated);
      }, Math.max(200, options.trickSpeedMs));
    }
  };

  const scoreRound = (pl) => {
    const pts = pl.map((p) => pointsOfTrick(p.pile));
    const shooter = pts.findIndex((x) => x === 26);
    let delta = pts.slice();
    if (shooter !== -1) {
      if (options.moonMode === "others+26") delta = delta.map((v, i) => (i === shooter ? 0 : 26));
      else delta = delta.map((v, i) => (i === shooter ? -26 : 0));
      setLog((l) => [...l, { t: Date.now(), msg: `${pl[shooter].name} SHOT THE MOON! (${options.moonMode})` }]);
    }
    const np = pl.map((p, i) => ({ ...p, score: p.score + delta[i], pile: [] }));
    setPlayers(np);
    if (np.some((p) => p.score >= options.targetScore)) {
      setPhase("gameover");
      setLog((l) => [...l, { t: Date.now(), msg: "Game over — target score reached." }]);
    } else {
      setPhase("scoring");
    }
  };

  const continueNextRound = () => {
    const nr = round + 1;
    setRound(nr);
    dealRound(options, nr, players);
  };

  // ── human interaction ──
  const onCardClick = (card) => {
    if (phase === "pass") { toggleSelectPass(card); return; }
    if (phase !== "play" || currentPlayer !== 0) return;
    if (options.confirmPlays && !window.confirm(`Play ${card.code}?`)) return;
    playCard(0, card);
  };

  const computeHint = () => {
    if (phase !== "play" || currentPlayer !== 0) return;
    const c = chooseAiCard(players[0].hand, options.aiLevel);
    setHintCard(c);
  };

  // ── AI driver ──
  useEffect(() => {
    if (phase !== "play" || currentPlayer === 0) return;
    clearTimeout(aiTimerRef.current);
    aiTimerRef.current = setTimeout(() => {
      const ai = players[currentPlayer];
      if (!ai || ai.hand.length === 0) return;
      const card = chooseAiCard(ai.hand, options.aiLevel);
      playCard(currentPlayer, card);
    }, Math.max(220, options.trickSpeedMs));
    return () => clearTimeout(aiTimerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentPlayer, players, trick, leadSuit, heartsBroken]);

  // ── legal for human ──
  const legalForHuman = useMemo(
    () => (phase === "play" && currentPlayer === 0 ? legalMoves(players[0].hand) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [phase, currentPlayer, players, trick, leadSuit, heartsBroken]
  );
  const isLegal = (card) => options.showLegalOnly ? legalForHuman.some((c) => cardEquals(c, card)) : true;

  const dirLabel = { left: "← Left", right: "Right →", across: "↕ Across", hold: "No pass" };
  const passCount = (passes[0] || []).length;

  // ─── RENDER ──────────────────────────────────────────────────
  // Menu screen
  if (phase === "menu") {
    return (
      <div className="h2-root">
        <div className="h2-menu-screen">
          <div className="h2-menu-hero">
            <div className="h2-menu-icon">♥</div>
            <div className="h2-menu-title">Hearts</div>
            <div className="h2-menu-subtitle">Claude House Edition</div>
          </div>
          <div className="h2-menu-card">
            <h3>Quick Settings</h3>
            <div className="h2-settings" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="h2-field">
                <label>Target Score</label>
                <input type="number" min={30} max={300} value={options.targetScore}
                  onChange={(e) => setOptions({ ...options, targetScore: Number(e.target.value) || 100 })} />
              </div>
              <div className="h2-field">
                <label>AI Level: <span className="h2-field-range-val">{options.aiLevel}</span></label>
                <input type="range" min={1} max={8} value={options.aiLevel}
                  onChange={(e) => setOptions({ ...options, aiLevel: Number(e.target.value) })} />
              </div>
            </div>
          </div>
          <div className="h2-menu-actions">
            <button className="h2-btn h2-btn-primary" style={{ fontSize: 16, padding: "12px 32px" }}
              onClick={() => startNewGame()}>
              Deal Cards
            </button>
            <button className="h2-btn" onClick={() => setShowRules(true)}>How to Play</button>
            {onQuit && <button className="h2-btn h2-btn-quit" onClick={onQuit}>Quit</button>}
          </div>
        </div>
        {showRules && <RulesModal onClose={() => setShowRules(false)} />}
      </div>
    );
  }

  const lowestScore = Math.min(...players.map((p) => p.score));

  return (
    <div className="h2-root">
      {/* Topbar */}
      <header className="h2-topbar">
        <div className="h2-logo">
          <div className="h2-logo-heart">♥</div>
          Hearts
        </div>
        <div className="h2-topbar-btns">
          <button className="h2-btn" onClick={() => setShowRules(true)}>Rules</button>
          <button className="h2-btn" onClick={() => setShowSettings(true)}>Settings</button>
          <button className="h2-btn" onClick={() => startNewGame()}>New Game</button>
          <button className="h2-btn h2-btn-quit" onClick={() => (onQuit ? onQuit() : setPhase("menu"))}>Quit</button>
        </div>
      </header>

      {/* Table */}
      <div className="h2-table">
        {/* Status */}
        <div className="h2-status">
          <div>
            Round <b>{round + 1}</b> &nbsp;·&nbsp;
            Pass: <b>{dirLabel[passDir] || passDir}</b> &nbsp;·&nbsp;
            Hearts: <b>{heartsBroken ? "💔 Broken" : "🩶 Intact"}</b>
          </div>
          {phase === "play" && (
            <span className="h2-status-pill">
              {currentPlayer === 0 ? "Your turn" : `${players[currentPlayer]?.name}'s turn`}
              {leadSuit ? ` · Lead: ${leadSuit}` : ""}
            </span>
          )}
          {phase === "pass" && (
            <span className="h2-status-pill">Select 3 cards to pass {dirLabel[passDir]}</span>
          )}
          {phase === "scoring" && <span className="h2-status-pill">Round complete</span>}
          {phase === "gameover" && <span className="h2-status-pill" style={{ background: "#fff8e1", borderColor: "#f5d97a", color: "#9a6e00" }}>🏆 Game Over</span>}
        </div>

        {/* Opponents */}
        <div className="h2-opponents">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h2-opp${currentPlayer === i && phase === "play" ? " active" : ""}`}>
              <div className="h2-opp-header">
                <span className="h2-opp-name">{players[i].name}</span>
                <span className="h2-opp-score">
                  Score: <b>{players[i].score}</b>
                  {pointsOfTrick(players[i].pile) > 0 && ` (this round: +${pointsOfTrick(players[i].pile)})`}
                </span>
              </div>
              <div className="h2-opp-cards">
                {players[i].hand.map((_, idx) => <div key={idx} className="h2-card-back" />)}
              </div>
            </div>
          ))}
        </div>

        {/* Trick center */}
        <div className="h2-trick">
          {trick.length === 0 ? (
            <div className="h2-trick-empty">
              {phase === "play" ? "Waiting for first card…" : ""}
            </div>
          ) : (
            trick.map((t) => (
              <div key={`${t.player}-${t.card.code}`} className={`h2-trick-slot tp${t.player}`}>
                <HCard card={t.card} />
                <div className="h2-trick-name">{players[t.player]?.name}</div>
              </div>
            ))
          )}
        </div>

        {/* Human hand */}
        <div className="h2-hand">
          <div className="h2-hand-label">Your Hand — {players[0].name} · Score: {players[0].score}</div>
          {players[0].hand.map((c) => {
            const legal = isLegal(c);
            const selected = (passes[0] || []).some((s) => cardEquals(s, c));
            const isHint = hintCard && cardEquals(hintCard, c);
            let cls = "";
            if (phase === "pass") { cls = selected ? "pass-selected playable" : "playable"; }
            else if (phase === "play" && currentPlayer === 0) {
              cls = legal ? "playable" : "dimmed";
            }
            if (isHint) cls += " hinted";
            return (
              <HCard
                key={`${c.suit}${c.rank}`}
                card={c}
                className={cls}
                onClick={() => (phase === "pass" || (phase === "play" && currentPlayer === 0 && legal)) ? onCardClick(c) : undefined}
              />
            );
          })}
        </div>

        {/* Pass panel */}
        {phase === "pass" && (
          <div className="h2-pass">
            <div className="h2-pass-label">
              Pass {dirLabel[passDir]} — {passCount}/3 selected
            </div>
            <div className="h2-pass-pills">
              {(passes[0] || []).map((c, i) => <span key={i} className="h2-pill">{c.code}</span>)}
              {Array.from({ length: 3 - passCount }).map((_, i) => (
                <span key={`empty-${i}`} className="h2-pill" style={{ opacity: 0.35, color: "var(--ink-muted)" }}>—</span>
              ))}
            </div>
            <button className="h2-btn h2-btn-primary" onClick={submitPass} disabled={passCount !== 3}>
              Pass Cards
            </button>
          </div>
        )}

        {/* Teaching / hint bar */}
        {options.teachingMode && (
          <div className="h2-teach">
            <button
              className="h2-btn"
              style={{ background: "var(--sage-pale)", borderColor: "#c8dcb8", color: "var(--sage)" }}
              disabled={!(phase === "play" && currentPlayer === 0)}
              onClick={computeHint}
            >
              Hint
            </button>
            <span>
              {phase === "play" && currentPlayer === 0
                ? hintCard
                  ? <>Suggestion: <b>{hintCard.code}</b> (AI level {options.aiLevel})</>
                  : "Click Hint for a card suggestion."
                : "Teaching mode is on. It's not your turn."}
            </span>
          </div>
        )}

        {/* Scoreboard */}
        <div className="h2-score">
          <div className="h2-score-title">Scoreboard</div>
          <table>
            <thead>
              <tr>
                <th>Player</th>
                <th>Total</th>
                <th>This Round</th>
                <th style={{ width: 140 }}>Progress</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p, i) => (
                <tr key={i} className={i === currentPlayer && phase === "play" ? "current" : ""}>
                  <td style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>{p.name}</td>
                  <td><b>{p.score}</b></td>
                  <td style={{ color: pointsOfTrick(p.pile) > 0 ? "var(--ruby)" : "var(--ink-muted)" }}>
                    {pointsOfTrick(p.pile) > 0 ? `+${pointsOfTrick(p.pile)}` : "—"}
                  </td>
                  <td>
                    <div className="h2-score-bar">
                      <div
                        className={`h2-score-fill${p.score === lowestScore ? " winning" : ""}`}
                        style={{ width: `${Math.min(100, (p.score / options.targetScore) * 100)}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {phase === "scoring" && (
            <div className="h2-score-actions">
              <button className="h2-btn h2-btn-primary" onClick={continueNextRound}>Deal Next Round</button>
            </div>
          )}
          {phase === "gameover" && (
            <div className="h2-score-actions">
              <span className="h2-winner-badge">
                🏆 {players.slice().sort((a, b) => a.score - b.score)[0].name} wins!
              </span>
              <button className="h2-btn h2-btn-primary" onClick={() => startNewGame()}>Play Again</button>
              <button className="h2-btn" onClick={() => setPhase("menu")}>Main Menu</button>
            </div>
          )}
        </div>

        {/* Log */}
        <div className="h2-log">
          <div className="h2-log-head">📜 Game Log</div>
          <div className="h2-log-body">
            {log.slice().reverse().map((l, i) => (
              <div key={i} className="h2-log-line">{l.msg}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
      {showSettings && (
        <SettingsModal
          options={options}
          setOptions={setOptions}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

// ─── Rules Modal ──────────────────────────────────────────────
function RulesModal({ onClose }) {
  return (
    <div className="h2-backdrop" onClick={onClose}>
      <div className="h2-modal" onClick={(e) => e.stopPropagation()}>
        <div className="h2-modal-head">
          <h2>How to Play Hearts</h2>
          <p>The classic trick-taking card game</p>
        </div>
        <div className="h2-modal-body h2-rules-body">
          <h3>Objective</h3>
          <p>Have the <b>lowest score</b> when any player reaches the target (default 100 pts).</p>
          <h3>Setup & Dealing</h3>
          <ol>
            <li>52 cards dealt evenly — 13 per player.</li>
            <li>Before each round, pass 3 cards: <b>Left → Right → Across → Hold</b> (no pass), repeating.</li>
          </ol>
          <h3>Playing</h3>
          <ol>
            <li>The player holding <b>2♣</b> leads the first trick with it.</li>
            <li>No point cards (hearts, Q♠) may be played on the first trick if avoidable.</li>
            <li>You must <b>follow suit</b> if you can.</li>
            <li>You may not lead ♥ until hearts are <b>broken</b> (a heart was played to a trick).</li>
            <li>Highest card of the <i>lead suit</i> wins the trick.</li>
          </ol>
          <h3>Scoring</h3>
          <ul>
            <li>Each ♥ = <b>+1 point</b></li>
            <li>Q♠ = <b>+13 points</b></li>
            <li><b>Shooting the Moon:</b> Take all 26 points → everyone else +26 <i>(or you −26, toggle in Settings)</i>.</li>
          </ul>
          <h3>Strategy Tips</h3>
          <ul>
            <li>Pass cards to void a suit — then dump point cards when that suit is led.</li>
            <li>Beware holding the Q♠ without enough spades to protect her.</li>
            <li>Watch the scores — if someone is low, they may be attempting to shoot the moon.</li>
            <li>Use <b>Hint</b> (teaching mode) to see what the AI would suggest.</li>
          </ul>
        </div>
        <div className="h2-modal-foot">
          <button className="h2-btn h2-btn-primary" onClick={onClose}>Got it</button>
        </div>
      </div>
    </div>
  );
}

// ─── Settings Modal ───────────────────────────────────────────
function SettingsModal({ options, setOptions, onClose }) {
  const [local, setLocal] = useState({ ...options });
  const set = (k, v) => setLocal((o) => ({ ...o, [k]: v }));

  return (
    <div className="h2-backdrop" onClick={onClose}>
      <div className="h2-modal" onClick={(e) => e.stopPropagation()}>
        <div className="h2-modal-head">
          <h2>Settings</h2>
          <p>Changes take effect on the next new game.</p>
        </div>
        <div className="h2-modal-body">
          <div className="h2-settings">
            <div className="h2-field">
              <label>Target Score</label>
              <input type="number" min={30} max={300} value={local.targetScore}
                onChange={(e) => set("targetScore", Number(e.target.value) || 100)} />
            </div>
            <div className="h2-field">
              <label>AI Difficulty: <span className="h2-field-range-val">{local.aiLevel}</span></label>
              <input type="range" min={1} max={8} value={local.aiLevel}
                onChange={(e) => set("aiLevel", Number(e.target.value))} />
            </div>
            <div className="h2-field">
              <label>Pass Cycle</label>
              <select value={local.passCycle} onChange={(e) => set("passCycle", e.target.value)}>
                <option value="standard">Standard (L, R, Across, Hold)</option>
                <option value="random">Random each round</option>
                <option value="off">No passing</option>
              </select>
            </div>
            <div className="h2-field">
              <label>Shooting the Moon</label>
              <select value={local.moonMode} onChange={(e) => set("moonMode", e.target.value)}>
                <option value="others+26">Others +26</option>
                <option value="shooter-26">Shooter −26</option>
              </select>
            </div>
            <div className="h2-field">
              <label>Trick Speed (ms)</label>
              <input type="number" min={150} max={2000} step={50} value={local.trickSpeedMs}
                onChange={(e) => set("trickSpeedMs", Number(e.target.value) || 700)} />
            </div>
          </div>
          <hr className="h2-section-divider" />
          <div className="h2-settings" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {[
              ["teachingMode", "Teaching mode (hints, tips)"],
              ["showLegalOnly", "Highlight legal moves only"],
              ["confirmPlays", "Confirm before playing"],
              ["queenBreaksHearts", "Q♠ breaks hearts (variant)"],
            ].map(([key, label]) => (
              <label key={key} className="h2-checkbox-row">
                <input type="checkbox" checked={local[key]}
                  onChange={(e) => set(key, e.target.checked)} />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="h2-modal-foot">
          <button className="h2-btn" onClick={onClose}>Cancel</button>
          <button className="h2-btn h2-btn-primary" onClick={() => { setOptions(local); onClose(); }}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
