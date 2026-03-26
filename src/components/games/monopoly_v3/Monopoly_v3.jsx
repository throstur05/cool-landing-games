import React, { useEffect, useRef, useState } from "react";

/* =========================================================
   CLAUDE MONOPOLY v3 — Anthropic-themed
   Light background, warm cream/sand palette
   Font: Georgia serif display + system sans body
   ========================================================= */

/* ---- Color tokens ---- */
const C = {
  bg: "#fdf8f3",
  surface: "#ffffff",
  surfaceAlt: "#fef6ed",
  border: "#e8ddd0",
  borderStrong: "#c9b89e",
  text: "#2d1f0e",
  textMid: "#6b4f35",
  textLight: "#a08060",
  accent: "#c96b2e",
  accentLight: "#f0a96a",
  accentDark: "#8c3d12",
  blue: "#2c5f8a",
  blueLight: "#d4e8f7",
  green: "#2d6a4f",
  greenLight: "#d4eddf",
  red: "#b03030",
  redLight: "#f5d4d4",
  yellow: "#b8860b",
  yellowLight: "#fef9d4",
  shadow: "rgba(100,60,20,0.12)",
  shadowMd: "rgba(100,60,20,0.2)",
};

/* ---- Group color bands on tiles ---- */
const GROUP_COLOR = {
  brown: "#7b4b2a",
  "light-blue": "#5aa8d8",
  pink: "#d96fa0",
  orange: "#e07830",
  red: "#c83030",
  yellow: "#d4a017",
  green: "#2e7d52",
  "dark-blue": "#1e3a6e",
  railroad: "#444",
  utility: "#8855aa",
};

/* ---- Monopoly board data ---- */
const BOARD = [
  { name: "GO", type: "start" },
  { name: "Mediterranean Ave", type: "property", group: "brown", price: 60, rent: 2 },
  { name: "Community Chest", type: "card" },
  { name: "Baltic Ave", type: "property", group: "brown", price: 60, rent: 4 },
  { name: "Income Tax", type: "tax", cost: 200 },
  { name: "Reading Railroad", type: "railroad", price: 200, rent: 25, group: "railroad" },
  { name: "Oriental Ave", type: "property", group: "light-blue", price: 100, rent: 6 },
  { name: "Chance", type: "card" },
  { name: "Vermont Ave", type: "property", group: "light-blue", price: 100, rent: 6 },
  { name: "Connecticut Ave", type: "property", group: "light-blue", price: 120, rent: 8 },
  { name: "Jail", type: "jail" },
  { name: "St. Charles Place", type: "property", group: "pink", price: 140, rent: 10 },
  { name: "Electric Co.", type: "utility", price: 150, rent: 4, group: "utility" },
  { name: "States Ave", type: "property", group: "pink", price: 140, rent: 10 },
  { name: "Virginia Ave", type: "property", group: "pink", price: 160, rent: 12 },
  { name: "Penn. Railroad", type: "railroad", price: 200, rent: 25, group: "railroad" },
  { name: "St. James Place", type: "property", group: "orange", price: 180, rent: 14 },
  { name: "Community Chest", type: "card" },
  { name: "Tennessee Ave", type: "property", group: "orange", price: 180, rent: 14 },
  { name: "New York Ave", type: "property", group: "orange", price: 200, rent: 16 },
  { name: "Free Parking", type: "free-parking" },
  { name: "Kentucky Ave", type: "property", group: "red", price: 220, rent: 18 },
  { name: "Chance", type: "card" },
  { name: "Indiana Ave", type: "property", group: "red", price: 220, rent: 18 },
  { name: "Illinois Ave", type: "property", group: "red", price: 240, rent: 20 },
  { name: "B&O Railroad", type: "railroad", price: 200, rent: 25, group: "railroad" },
  { name: "Atlantic Ave", type: "property", group: "yellow", price: 260, rent: 22 },
  { name: "Ventnor Ave", type: "property", group: "yellow", price: 260, rent: 22 },
  { name: "Water Works", type: "utility", price: 150, rent: 4, group: "utility" },
  { name: "Marvin Gardens", type: "property", group: "yellow", price: 280, rent: 24 },
  { name: "Go to Jail", type: "go-to-jail" },
  { name: "Pacific Ave", type: "property", group: "green", price: 300, rent: 26 },
  { name: "North Carolina Ave", type: "property", group: "green", price: 300, rent: 26 },
  { name: "Community Chest", type: "card" },
  { name: "Pennsylvania Ave", type: "property", group: "green", price: 320, rent: 28 },
  { name: "Short Line", type: "railroad", price: 200, rent: 25, group: "railroad" },
  { name: "Chance", type: "card" },
  { name: "Park Place", type: "property", group: "dark-blue", price: 350, rent: 35 },
  { name: "Luxury Tax", type: "tax", cost: 100 },
  { name: "Boardwalk", type: "property", group: "dark-blue", price: 400, rent: 50 },
];

const COMMUNITY_CARDS = [
  { text: "Bank error in your favor. Collect $200.", amount: 200, type: "money" },
  { text: "Doctor's fee. Pay $50.", amount: -50, type: "money" },
  { text: "Go to Jail. Do not pass GO.", position: 10, type: "move" },
  { text: "Income tax refund. Collect $20.", amount: 20, type: "money" },
  { text: "From sale of stock you get $50.", amount: 50, type: "money" },
];

const CHANCE_CARDS = [
  { text: "Advance to GO. Collect $200.", position: 0, type: "move" },
  { text: "Advance to Illinois Ave. If you pass GO, collect $200.", position: 24, type: "move" },
  { text: "Pay poor tax of $15.", amount: -15, type: "money" },
  { text: "Go back 3 spaces.", spaces: -3, type: "move" },
  { text: "Elected Chairman. Pay each player $50.", amount: -50, type: "money" },
];

const TOKENS = ["🚗", "🚢", "🎩", "🐶", "👞", "💼", "💰"];
const AI_NAMES = ["Opus", "Sonnet", "Haiku", "Claude-3", "Aria", "Nova", "Byte"];

/* =========================================================
   Dice SVG
   ========================================================= */
const DICE_FACES = [
  <svg key={1} viewBox="0 0 36 36" fill="none"><rect width="36" height="36" rx="6" fill="#fdf8f3" stroke={C.borderStrong} strokeWidth="1.5"/><circle cx="18" cy="18" r="3.5" fill={C.accent}/></svg>,
  <svg key={2} viewBox="0 0 36 36" fill="none"><rect width="36" height="36" rx="6" fill="#fdf8f3" stroke={C.borderStrong} strokeWidth="1.5"/><circle cx="10" cy="10" r="3" fill={C.accent}/><circle cx="26" cy="26" r="3" fill={C.accent}/></svg>,
  <svg key={3} viewBox="0 0 36 36" fill="none"><rect width="36" height="36" rx="6" fill="#fdf8f3" stroke={C.borderStrong} strokeWidth="1.5"/><circle cx="10" cy="10" r="3" fill={C.accent}/><circle cx="18" cy="18" r="3" fill={C.accent}/><circle cx="26" cy="26" r="3" fill={C.accent}/></svg>,
  <svg key={4} viewBox="0 0 36 36" fill="none"><rect width="36" height="36" rx="6" fill="#fdf8f3" stroke={C.borderStrong} strokeWidth="1.5"/><circle cx="10" cy="10" r="3" fill={C.accent}/><circle cx="10" cy="26" r="3" fill={C.accent}/><circle cx="26" cy="10" r="3" fill={C.accent}/><circle cx="26" cy="26" r="3" fill={C.accent}/></svg>,
  <svg key={5} viewBox="0 0 36 36" fill="none"><rect width="36" height="36" rx="6" fill="#fdf8f3" stroke={C.borderStrong} strokeWidth="1.5"/><circle cx="10" cy="10" r="3" fill={C.accent}/><circle cx="10" cy="26" r="3" fill={C.accent}/><circle cx="18" cy="18" r="3" fill={C.accent}/><circle cx="26" cy="10" r="3" fill={C.accent}/><circle cx="26" cy="26" r="3" fill={C.accent}/></svg>,
  <svg key={6} viewBox="0 0 36 36" fill="none"><rect width="36" height="36" rx="6" fill="#fdf8f3" stroke={C.borderStrong} strokeWidth="1.5"/><circle cx="10" cy="10" r="3" fill={C.accent}/><circle cx="10" cy="18" r="3" fill={C.accent}/><circle cx="10" cy="26" r="3" fill={C.accent}/><circle cx="26" cy="10" r="3" fill={C.accent}/><circle cx="26" cy="18" r="3" fill={C.accent}/><circle cx="26" cy="26" r="3" fill={C.accent}/></svg>,
];

/* =========================================================
   Small reusable components
   ========================================================= */
const Btn = ({ children, onClick, disabled, variant = "primary", size = "md", style: extra = {} }) => {
  const base = {
    fontFamily: "system-ui, sans-serif",
    fontWeight: 700,
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all .18s",
    lineHeight: 1,
    opacity: disabled ? .55 : 1,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  };
  const sizes = { sm: { padding: "7px 14px", fontSize: 12, borderRadius: 8 }, md: { padding: "10px 20px", fontSize: 14, borderRadius: 10 }, lg: { padding: "14px 28px", fontSize: 16, borderRadius: 12 } };
  const variants = {
    primary: { background: C.accent, color: "#fff", boxShadow: `0 2px 8px ${C.shadow}` },
    secondary: { background: C.surface, color: C.text, border: `1.5px solid ${C.border}` },
    ghost: { background: "transparent", color: C.textMid },
    blue: { background: C.blue, color: "#fff", boxShadow: `0 2px 8px rgba(44,95,138,.2)` },
    green: { background: C.green, color: "#fff", boxShadow: `0 2px 8px rgba(45,106,79,.2)` },
    red: { background: C.red, color: "#fff", boxShadow: `0 2px 8px rgba(176,48,48,.2)` },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...sizes[size], ...variants[variant], ...extra }}
    >
      {children}
    </button>
  );
};

const Card = ({ children, style: extra = {} }) => (
  <div style={{
    background: C.surface,
    borderRadius: 16,
    border: `1.5px solid ${C.border}`,
    boxShadow: `0 4px 24px ${C.shadow}`,
    padding: 24,
    ...extra,
  }}>
    {children}
  </div>
);

const Tag = ({ children, color = C.accent }) => (
  <span style={{
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    background: color + "18",
    color: color,
    border: `1px solid ${color}33`,
    fontFamily: "system-ui, sans-serif",
  }}>
    {children}
  </span>
);

const Modal = ({ children, onClose }) => (
  <div
    onClick={onClose}
    style={{
      position: "fixed", inset: 0,
      background: "rgba(45,31,14,.55)",
      backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 9999, padding: 16,
    }}
  >
    <div
      onClick={e => e.stopPropagation()}
      style={{
        background: C.surface,
        borderRadius: 20,
        padding: 32,
        width: "min(680px,94vw)",
        maxHeight: "90vh",
        overflow: "auto",
        position: "relative",
        boxShadow: `0 32px 80px ${C.shadowMd}`,
        border: `1.5px solid ${C.border}`,
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute", right: 16, top: 16,
          width: 32, height: 32, borderRadius: 8,
          border: `1.5px solid ${C.border}`,
          background: C.bg,
          cursor: "pointer",
          fontSize: 14, color: C.textMid, fontWeight: 700,
        }}
      >✕</button>
      {children}
    </div>
  </div>
);

/* =========================================================
   Board component
   ========================================================= */
function Board({ players }) {
  const tokensAt = (idx) => {
    const here = players.filter(p => p.position === idx);
    if (!here.length) return null;
    return (
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexWrap: "wrap", gap: 1,
        pointerEvents: "none", zIndex: 5,
      }}>
        {here.map(p => (
          <span key={p.id} style={{ fontSize: 14, lineHeight: 1 }}>{p.token}</span>
        ))}
      </div>
    );
  };

  const CornerTile = ({ space, idx, style: extra = {} }) => (
    <div style={{
      background: C.surfaceAlt,
      border: `1.5px solid ${C.borderStrong}`,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      textAlign: "center",
      position: "relative",
      padding: 4,
      fontSize: 9,
      fontFamily: "Georgia, serif",
      fontWeight: 700,
      color: C.text,
      ...extra,
    }}>
      <span style={{ lineHeight: 1.2 }}>{space.name}</span>
      {tokensAt(idx)}
    </div>
  );

  const EdgeTile = ({ space, idx, dir }) => {
    const color = GROUP_COLOR[space.group] || C.border;
    const band = dir === "top" || dir === "bottom"
      ? { width: "100%", height: 8, background: color, flexShrink: 0 }
      : { height: "100%", width: 8, background: color, flexShrink: 0 };

    return (
      <div style={{
        background: "#fff",
        border: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: dir === "top" || dir === "bottom" ? "column" : "row",
        alignItems: "center",
        justifyContent: "space-between",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        fontSize: 7,
        fontFamily: "system-ui, sans-serif",
        color: C.textMid,
      }}>
        {(dir === "top" || dir === "left") && space.group && <div style={band} />}
        <div style={{ flex: 1, padding: "2px 3px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.2 }}>
          <span style={{ fontWeight: 600 }}>{space.name}</span>
          {space.price && <span style={{ fontSize: 6, color: C.textLight, marginTop: 1 }}>${space.price}</span>}
        </div>
        {(dir === "bottom" || dir === "right") && space.group && <div style={band} />}
        {tokensAt(idx)}
      </div>
    );
  };

  const tileSize = 46;
  const cornerSize = 62;
  const edgeH = tileSize;
  const edgeW = cornerSize + 9 * tileSize + cornerSize;

  const containerStyle = {
    display: "grid",
    gridTemplateColumns: `${cornerSize}px repeat(9, ${tileSize}px) ${cornerSize}px`,
    gridTemplateRows: `${cornerSize}px repeat(9, ${tileSize}px) ${cornerSize}px`,
    background: "#d6e8d0",
    border: `3px solid ${C.borderStrong}`,
    borderRadius: 14,
    overflow: "hidden",
    boxShadow: `0 8px 32px ${C.shadowMd}`,
    flexShrink: 0,
  };

  return (
    <div style={containerStyle}>
      {/* Corner: Go to Jail (top-left) */}
      <CornerTile space={BOARD[30]} idx={30} style={{ gridColumn: 1, gridRow: 1 }} />
      {/* Corner: Free Parking (top-right) */}
      <CornerTile space={BOARD[20]} idx={20} style={{ gridColumn: 11, gridRow: 1 }} />
      {/* Corner: Jail (bottom-left) */}
      <CornerTile space={BOARD[10]} idx={10} style={{ gridColumn: 1, gridRow: 11 }} />
      {/* Corner: GO (bottom-right) */}
      <CornerTile space={BOARD[0]} idx={0} style={{
        gridColumn: 11, gridRow: 11,
        background: "#c8e6c0", fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 900, color: C.green,
      }} />

      {/* Top row: spaces 21–29 reversed */}
      {BOARD.slice(21, 30).reverse().map((space, i) => {
        const idx = 29 - i;
        return (
          <div key={idx} style={{ gridColumn: i + 2, gridRow: 1 }}>
            <EdgeTile space={space} idx={idx} dir="top" />
          </div>
        );
      })}

      {/* Bottom row: spaces 1–9 */}
      {BOARD.slice(1, 10).map((space, i) => {
        const idx = i + 1;
        return (
          <div key={idx} style={{ gridColumn: 10 - i, gridRow: 11 }}>
            <EdgeTile space={space} idx={idx} dir="bottom" />
          </div>
        );
      })}

      {/* Left column: spaces 31–39 */}
      {BOARD.slice(31, 40).map((space, i) => {
        const idx = i + 31;
        return (
          <div key={idx} style={{ gridColumn: 1, gridRow: i + 2 }}>
            <EdgeTile space={space} idx={idx} dir="left" />
          </div>
        );
      })}

      {/* Right column: spaces 11–19 reversed */}
      {BOARD.slice(11, 20).reverse().map((space, i) => {
        const idx = 19 - i;
        return (
          <div key={idx} style={{ gridColumn: 11, gridRow: i + 2 }}>
            <EdgeTile space={space} idx={idx} dir="right" />
          </div>
        );
      })}

      {/* Center */}
      <div style={{
        gridColumn: "2 / 11", gridRow: "2 / 11",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg, #e8f5e4 0%, #d6e8d0 100%)",
        gap: 8,
        padding: 12,
      }}>
        {/* Claude logo mark */}
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: C.accent, display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 4px 16px ${C.accent}66`,
        }}>
          <span style={{ fontSize: 28, userSelect: "none" }}>✦</span>
        </div>
        <div style={{ fontFamily: "Georgia, serif", fontWeight: 900, fontSize: 22, color: C.accentDark, textAlign: "center", lineHeight: 1.1 }}>
          CLAUDE<br/>
          <span style={{ fontSize: 11, fontWeight: 400, letterSpacing: 4, color: C.textMid }}>MONOPOLY</span>
        </div>
        <div style={{ fontFamily: "system-ui, sans-serif", fontSize: 10, color: C.textLight, textAlign: "center", maxWidth: 160 }}>
          Powered by Anthropic
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN GAME COMPONENT
   ========================================================= */
export default function MonopolyV3() {
  const [gameState, setGameState] = useState("setup");
  const [players, setPlayers] = useState([]);
  const [boardState, setBoardState] = useState(BOARD.map(s => ({ ...s, owner: null })));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [dice, setDice] = useState([1, 1]);
  const [message, setMessage] = useState("");
  const [numAI, setNumAI] = useState(1);
  const [aiStrength, setAiStrength] = useState(3);
  const [startMoney, setStartMoney] = useState(1500);
  const [goSalary, setGoSalary] = useState(200);
  const [isRolling, setIsRolling] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [currentCard, setCurrentCard] = useState(null);
  const [showRules, setShowRules] = useState(false);
  const [parkingPot, setParkingPot] = useState(0);
  const [jackpotRule, setJackpotRule] = useState(true);
  const [eventLog, setEventLog] = useState([]);
  const [diceAnim, setDiceAnim] = useState(false);
  const timers = useRef([]);

  const log = (msg) => setEventLog(p => [msg, ...p].slice(0, 30));
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.current.push(t); };

  /* ---- helpers ---- */
  const updMoney = (arr, idx, amt) => arr.map((p, i) => i === idx ? { ...p, money: p.money + amt } : p);

  const movePlayer = (arr, idx, steps) => {
    const from = arr[idx].position;
    const rawTo = from + steps;
    const to = ((rawTo % 40) + 40) % 40;
    const wraps = Math.floor(rawTo / 40);
    let next = arr.map((p, i) => i === idx ? { ...p, position: to } : p);
    if (wraps > 0) {
      next = updMoney(next, idx, goSalary * wraps);
      log(`${arr[idx].name} passed GO → +$${goSalary * wraps}`);
    }
    return next;
  };

  const applyCard = (card, pidx, pArr, bArr) => {
    let ps = [...pArr];
    let bs = [...bArr];
    let msg = "";
    let pot = parkingPot;

    if (card.type === "money") {
      if (card.text.includes("each player")) {
        const total = card.amount * (ps.length - 1);
        if (ps[pidx].money + total >= 0) {
          ps = updMoney(ps, pidx, total);
          ps.forEach((_, i) => { if (i !== pidx) ps = updMoney(ps, i, -card.amount); });
          msg = `${pArr[pidx].name} paid $${Math.abs(card.amount)} to each player.`;
        } else {
          ps = ps.filter((_, i) => i !== pidx);
          msg = `${pArr[pidx].name} went bankrupt!`;
        }
      } else {
        if (card.amount < 0 && jackpotRule) {
          pot += Math.abs(card.amount);
          setParkingPot(pot);
        }
        ps = updMoney(ps, pidx, card.amount);
        msg = `${pArr[pidx].name} ${card.amount > 0 ? "collected" : "paid"} $${Math.abs(card.amount)}.`;
      }
    } else if (card.type === "move") {
      if (typeof card.spaces === "number") {
        ps = movePlayer(ps, pidx, card.spaces);
      } else {
        const oldPos = ps[pidx].position;
        ps[pidx] = { ...ps[pidx], position: card.position };
        if (card.position < oldPos) {
          ps = updMoney(ps, pidx, goSalary);
          log(`${pArr[pidx].name} passed GO → +$${goSalary}`);
        }
        if (/advance to go/i.test(card.text) && !(card.position < oldPos)) {
          ps = updMoney(ps, pidx, goSalary);
        }
      }
      if (ps[pidx] && BOARD[ps[pidx].position]?.type === "go-to-jail") {
        ps[pidx] = { ...ps[pidx], position: 10, inJail: true };
      }
      msg = `${pArr[pidx].name}: ${card.text}`;
    }

    return { ps, bs, msg, pot };
  };

  const buyProperty = (spaceIdx, pidx, pArr, bArr) => {
    const prop = bArr[spaceIdx];
    const player = pArr[pidx];
    if (!prop || prop.owner || player.money < prop.price) return null;
    const newP = updMoney(pArr, pidx, -prop.price).map((p, i) =>
      i === pidx ? { ...p, properties: [...p.properties, { ...prop, boardIndex: spaceIdx }] } : p
    );
    const newB = bArr.map((s, i) => i === spaceIdx ? { ...s, owner: player.id } : s);
    log(`${player.name} bought ${prop.name} for $${prop.price}`);
    return { newP, newB };
  };

  const payRent = (prop, pidx, pArr, bArr) => {
    const player = pArr[pidx];
    const owner = pArr.find(p => p.id === prop.owner);
    if (!owner) return { newP: pArr, msg: "No owner." };
    const oidx = pArr.findIndex(p => p.id === prop.owner);
    if (player.money < prop.rent) {
      const newP = pArr.filter((_, i) => i !== pidx);
      const newB = bArr.map(s => s.owner === player.id ? { ...s, owner: null } : s);
      log(`${player.name} went bankrupt (can't pay rent)`);
      return { newP, newB, msg: `${player.name} is bankrupt!`, bankrupt: true };
    }
    let np = updMoney(pArr, pidx, -prop.rent);
    np = updMoney(np, oidx, prop.rent);
    log(`${player.name} paid $${prop.rent} rent to ${owner.name}`);
    return { newP: np, newB: bArr, msg: `${player.name} paid $${prop.rent} to ${owner.name}.` };
  };

  /* ---- resolution after landing ---- */
  const resolveSpace = (pos, pidx, pArr, bArr, isAI = false) => {
    const space = BOARD[pos];
    const liveBoard = bArr;
    const tile = liveBoard[pos];

    if (space.type === "go-to-jail") {
      const np = pArr.map((p, i) => i === pidx ? { ...p, position: 10, inJail: true } : p);
      setPlayers(np);
      setMessage(`${pArr[pidx].name} went to Jail!`);
      return "next";
    }

    if (space.type === "free-parking") {
      if (jackpotRule && parkingPot > 0) {
        const pot = parkingPot;
        const np = updMoney(pArr, pidx, pot);
        setPlayers(np);
        setParkingPot(0);
        setMessage(`${pArr[pidx].name} collected $${pot} from Free Parking!`);
        log(`${pArr[pidx].name} collected $${pot} Free Parking jackpot`);
      } else {
        setMessage(`${pArr[pidx].name} landed on Free Parking. Nothing happens.`);
      }
      return "next";
    }

    if (space.type === "tax") {
      const cost = space.cost;
      const np = updMoney(pArr, pidx, -cost);
      if (jackpotRule) setParkingPot(p => p + cost);
      setPlayers(np);
      setMessage(`${pArr[pidx].name} paid $${cost} tax.`);
      log(`${pArr[pidx].name} paid $${cost} tax`);
      return "next";
    }

    if (space.type === "card") {
      const deck = space.name.includes("Chance") ? CHANCE_CARDS : COMMUNITY_CARDS;
      const card = deck[Math.floor(Math.random() * deck.length)];
      if (isAI) {
        const { ps, bs, msg } = applyCard(card, pidx, pArr, bArr);
        setPlayers(ps);
        setBoardState(bs);
        setMessage(msg || `${pArr[pidx].name} drew a card.`);
        return "next";
      } else {
        setCurrentCard(card);
        setShowCard(true);
        setMessage(`${pArr[pidx].name} drew a card…`);
        return "card";
      }
    }

    if ((space.type === "property" || space.type === "railroad" || space.type === "utility") && tile.owner && tile.owner !== pArr[pidx].id) {
      const { newP, newB, msg, bankrupt } = payRent(tile, pidx, pArr, bArr);
      setPlayers(newP);
      setBoardState(newB);
      setMessage(msg);
      return "next";
    }

    if ((space.type === "property") && !tile.owner) {
      if (isAI) {
        const willBuy = Math.random() < (aiStrength / 6);
        if (willBuy) {
          const result = buyProperty(pos, pidx, pArr, bArr);
          if (result) { setPlayers(result.newP); setBoardState(result.newB); }
          return "next";
        }
        setMessage(`${pArr[pidx].name} passed on ${space.name}.`);
        return "next";
      }
      setMessage(`You landed on ${space.name} ($${space.price}). Buy it?`);
      return "buy";
    }

    setMessage(`${pArr[pidx].name} landed on ${space.name}.`);
    return "next";
  };

  /* ---- AI turn ---- */
  const runAiTurn = () => {
    const player = players[currentIdx];
    if (!player || !player.isAI) return;

    if (player.inJail) {
      const np = players.map((p, i) => i === currentIdx ? { ...p, inJail: false } : p);
      setPlayers(np);
      setMessage(`${player.name} is released from Jail.`);
      later(advanceTurn, 600);
      return;
    }

    setIsRolling(true);
    setDiceAnim(true);
    later(() => setDiceAnim(false), 300);

    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    setDice([d1, d2]);

    let np = movePlayer(players, currentIdx, d1 + d2);
    const pos = np[currentIdx].position;
    setPlayers(np);

    later(() => {
      const result = resolveSpace(pos, currentIdx, np, boardState, true);
      setIsRolling(false);
      later(advanceTurn, 800);
    }, 400);
  };

  /* ---- Human roll ---- */
  const handleRoll = () => {
    if (isRolling || showCard) return;
    const player = players[currentIdx];
    if (!player || player.isAI) return;

    if (player.inJail) {
      const np = players.map((p, i) => i === currentIdx ? { ...p, inJail: false } : p);
      setPlayers(np);
      setMessage("Released from Jail. Roll again next turn!");
      return;
    }

    setIsRolling(true);
    setDiceAnim(true);
    later(() => setDiceAnim(false), 300);

    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    setDice([d1, d2]);

    let np = movePlayer(players, currentIdx, d1 + d2);
    const pos = np[currentIdx].position;
    setPlayers(np);

    later(() => {
      const result = resolveSpace(pos, currentIdx, np, boardState, false);
      setIsRolling(false);
    }, 400);
  };

  /* ---- Card close ---- */
  const handleCardClose = () => {
    const { ps, bs, msg } = applyCard(currentCard, currentIdx, players, boardState);
    setPlayers(ps);
    setBoardState(bs);
    setMessage(msg);
    setShowCard(false);
    setCurrentCard(null);
    later(advanceTurn, 400);
  };

  /* ---- Buy / Decline ---- */
  const handleBuy = () => {
    const pos = players[currentIdx].position;
    const result = buyProperty(pos, currentIdx, players, boardState);
    if (result) { setPlayers(result.newP); setBoardState(result.newB); }
    advanceTurn();
  };

  /* ---- Advance turn ---- */
  const advanceTurn = () => {
    setPlayers(prev => {
      const alive = prev.filter(p => p.money > 0 || p.properties.length > 0);
      if (alive.length <= 1) {
        setGameState("finished");
        return alive;
      }
      const next = (currentIdx + 1) % alive.length;
      setCurrentIdx(next);
      setMessage(`It's ${alive[next].name}'s turn.`);
      return alive;
    });
  };

  /* ---- Setup ---- */
  const startGame = (e) => {
    e.preventDefault();
    const init = [
      { id: `human-${Date.now()}`, name: "You", money: startMoney, position: 0, properties: [], isAI: false, token: TOKENS[0] },
    ];
    for (let i = 0; i < numAI; i++) {
      init.push({
        id: `ai-${i}`, name: `${AI_NAMES[i % AI_NAMES.length]}`, money: startMoney,
        position: 0, properties: [], isAI: true, token: TOKENS[i + 1],
      });
    }
    setBoardState(BOARD.map(s => ({ ...s, owner: null })));
    setPlayers(init);
    setCurrentIdx(0);
    setParkingPot(0);
    setEventLog([]);
    setMessage("Game started! Roll the dice.");
    setGameState("playing");
  };

  const resetGame = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setGameState("setup");
    setPlayers([]);
    setIsRolling(false);
    setShowCard(false);
    setCurrentCard(false);
    setDice([1, 1]);
    setEventLog([]);
  };

  /* ---- AI auto-trigger ---- */
  useEffect(() => {
    if (gameState !== "playing" || !players.length) return;
    const cp = players[currentIdx];
    if (cp?.isAI) {
      const t = setTimeout(runAiTurn, 700);
      timers.current.push(t);
      return () => clearTimeout(t);
    }
  }, [currentIdx, gameState]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  /* =========================================================
     RENDER: SETUP
     ========================================================= */
  if (gameState === "setup") {
    return (
      <div style={{
        minHeight: "100vh", background: C.bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24, fontFamily: "system-ui, sans-serif",
      }}>
        <div style={{ width: "min(560px,96vw)" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: C.accent, display: "inline-flex", alignItems: "center",
              justifyContent: "center", marginBottom: 16,
              boxShadow: `0 8px 24px ${C.accent}55`,
            }}>
              <span style={{ fontSize: 36 }}>✦</span>
            </div>
            <h1 style={{
              margin: 0, fontFamily: "Georgia, serif", fontWeight: 900,
              fontSize: 38, color: C.text, letterSpacing: -1,
            }}>
              Claude <span style={{ color: C.accent }}>Monopoly</span>
            </h1>
            <p style={{ margin: "8px 0 0", color: C.textMid, fontSize: 14 }}>
              The AI-powered property trading game
            </p>
          </div>

          <Card>
            <form onSubmit={startGame} style={{ display: "grid", gap: 20 }}>
              {/* AI players */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 6 }}>
                  AI OPPONENTS
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  {[1,2,3,4,5,6].map(n => (
                    <button key={n} type="button" onClick={() => setNumAI(n)}
                      style={{
                        flex: 1, padding: "10px 0", borderRadius: 10, border: "1.5px solid",
                        borderColor: numAI === n ? C.accent : C.border,
                        background: numAI === n ? C.accent + "18" : C.surface,
                        color: numAI === n ? C.accent : C.textMid,
                        fontWeight: 700, fontSize: 14, cursor: "pointer",
                      }}
                    >{n}</button>
                  ))}
                </div>
              </div>

              {/* AI strength */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 6 }}>
                  AI STRENGTH — <span style={{ color: C.accent }}>{["", "Passive", "Easy", "Balanced", "Smart", "Hard", "Expert"][aiStrength]}</span>
                </label>
                <input type="range" min={1} max={6} value={aiStrength}
                  onChange={e => setAiStrength(+e.target.value)}
                  style={{ width: "100%", accentColor: C.accent }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.textLight, marginTop: 4 }}>
                  <span>Passive (buys often)</span><span>Expert (selective)</span>
                </div>
              </div>

              {/* Starting money */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 6 }}>
                  STARTING MONEY
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  {[500, 1000, 1500, 2000, 2500].map(n => (
                    <button key={n} type="button" onClick={() => setStartMoney(n)}
                      style={{
                        flex: 1, padding: "8px 4px", borderRadius: 8, border: "1.5px solid",
                        borderColor: startMoney === n ? C.green : C.border,
                        background: startMoney === n ? C.green + "18" : C.surface,
                        color: startMoney === n ? C.green : C.textMid,
                        fontWeight: 700, fontSize: 11, cursor: "pointer",
                      }}
                    >${n}</button>
                  ))}
                </div>
              </div>

              {/* Go salary */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 6 }}>
                  GO SALARY
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  {[100, 200, 400].map(n => (
                    <button key={n} type="button" onClick={() => setGoSalary(n)}
                      style={{
                        flex: 1, padding: "10px 0", borderRadius: 8, border: "1.5px solid",
                        borderColor: goSalary === n ? C.blue : C.border,
                        background: goSalary === n ? C.blue + "18" : C.surface,
                        color: goSalary === n ? C.blue : C.textMid,
                        fontWeight: 700, fontSize: 13, cursor: "pointer",
                      }}
                    >${n}</button>
                  ))}
                </div>
              </div>

              {/* Jackpot rule */}
              <label style={{ display: "flex", gap: 12, alignItems: "center", cursor: "pointer", padding: "12px 14px", borderRadius: 10, background: C.surfaceAlt, border: `1.5px solid ${C.border}` }}>
                <input type="checkbox" checked={jackpotRule} onChange={e => setJackpotRule(e.target.checked)} style={{ accentColor: C.accent, width: 16, height: 16 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>Free Parking Jackpot</div>
                  <div style={{ fontSize: 11, color: C.textLight }}>Taxes & card fees go into a pot. Land on Free Parking to collect it.</div>
                </div>
              </label>

              <Btn size="lg" style={{ borderRadius: 12, width: "100%" }}>
                Start Game ✦
              </Btn>
            </form>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
              <Btn variant="secondary" onClick={() => setShowRules(true)}>How to Play</Btn>
            </div>
          </Card>
        </div>

        {showRules && (
          <Modal onClose={() => setShowRules(false)}>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 900, color: C.text, margin: "0 0 16px", textAlign: "center" }}>
              How to Play
            </h2>
            <div style={{ color: C.textMid, fontSize: 14, lineHeight: 1.7 }}>
              <p>Each player starts with <strong>${startMoney}</strong>. Roll dice on your turn to move.</p>
              <p><strong>Passing GO</strong> earns you <strong>${goSalary}</strong>.</p>
              <p><strong>Unowned property?</strong> Choose to buy it.</p>
              <p><strong>Owned property?</strong> Pay the listed rent to the owner.</p>
              <p><strong>Cards & Tax</strong> trigger effects described on the card or tile.</p>
              <p><strong>Jail</strong> — you skip one turn and are released.</p>
              <p>The last player with money wins!</p>
            </div>
          </Modal>
        )}
      </div>
    );
  }

  /* =========================================================
     RENDER: FINISHED
     ========================================================= */
  if (gameState === "finished") {
    const winner = players[0];
    return (
      <div style={{
        minHeight: "100vh", background: C.bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24, fontFamily: "system-ui, sans-serif",
      }}>
        <Card style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🏆</div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 30, fontWeight: 900, color: C.text, margin: "0 0 8px" }}>
            {winner?.name === "You" ? "You Win!" : `${winner?.name} Wins!`}
          </h1>
          <p style={{ color: C.textMid, marginBottom: 24 }}>
            Final balance: <strong style={{ color: C.green }}>${winner?.money}</strong> · {winner?.properties?.length} properties
          </p>
          <Btn size="lg" onClick={resetGame}>Play Again</Btn>
        </Card>
      </div>
    );
  }

  /* =========================================================
     RENDER: PLAYING
     ========================================================= */
  const cp = players[currentIdx];
  const cpTile = cp ? boardState[cp.position] : null;
  const landedName = cp ? BOARD[cp.position]?.name : "";
  const canBuy = cp && !cp.isAI && cpTile?.type === "property" && !cpTile?.owner && cp.money >= cpTile?.price && message.includes("Buy it?");
  const isHumanTurn = cp && !cp.isAI;

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      fontFamily: "system-ui, sans-serif",
      padding: "20px 16px",
      color: C.text,
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gap: 16 }}>

        {/* ---- Header bar ---- */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <h1 style={{
            fontFamily: "Georgia, serif", fontWeight: 900, fontSize: 26,
            color: C.text, margin: 0, display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ color: C.accent }}>✦</span> Claude Monopoly
          </h1>
          <div style={{ display: "flex", gap: 8 }}>
            {jackpotRule && (
              <Tag color={C.yellow}>🅿 Pot: ${parkingPot}</Tag>
            )}
            <Btn variant="ghost" size="sm" onClick={() => setShowRules(true)}>Rules</Btn>
            <Btn variant="secondary" size="sm" onClick={resetGame}>New Game</Btn>
          </div>
        </div>

        {/* ---- Message bar ---- */}
        <div style={{
          background: C.surfaceAlt,
          border: `1.5px solid ${C.border}`,
          borderRadius: 12,
          padding: "12px 18px",
          fontSize: 14,
          color: C.textMid,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}>
          <span style={{ fontSize: 18 }}>{cp?.token}</span>
          <span>{message}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "start" }}>

          {/* ---- Left: Board + Controls ---- */}
          <div style={{ display: "grid", gap: 14 }}>

            {/* Controls */}
            <Card style={{ padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                {/* Dice */}
                <div style={{ display: "flex", gap: 10 }}>
                  {[dice[0], dice[1]].map((d, i) => (
                    <div key={i} style={{
                      width: 40, height: 40,
                      transform: diceAnim ? "rotate(15deg) scale(1.1)" : "none",
                      transition: "transform .15s",
                    }}>
                      {DICE_FACES[d - 1]}
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {cp?.isAI ? (
                    <Btn disabled variant="secondary">AI thinking…</Btn>
                  ) : cp?.inJail ? (
                    <Btn onClick={handleRoll} disabled={isRolling}>Release from Jail</Btn>
                  ) : (
                    <Btn onClick={handleRoll} disabled={isRolling || showCard}>
                      {isRolling ? "Rolling…" : "🎲 Roll Dice"}
                    </Btn>
                  )}

                  {canBuy && (
                    <>
                      <Btn variant="green" onClick={handleBuy}>Buy ${cpTile.price}</Btn>
                      <Btn variant="secondary" onClick={advanceTurn}>Decline</Btn>
                    </>
                  )}

                  {isHumanTurn && !isRolling && !canBuy && !showCard && !message.includes("Roll") && (
                    <Btn variant="secondary" onClick={advanceTurn}>Next Turn →</Btn>
                  )}
                </div>
              </div>
            </Card>

            {/* Board */}
            <div style={{ overflowX: "auto" }}>
              <Board players={players} />
            </div>
          </div>

          {/* ---- Right: Player cards + log ---- */}
          <div style={{ display: "grid", gap: 12, width: 220 }}>

            {/* Players */}
            {players.map((p, i) => (
              <div key={p.id} style={{
                background: i === currentIdx ? C.accentLight + "22" : C.surface,
                border: `1.5px solid ${i === currentIdx ? C.accent : C.border}`,
                borderRadius: 12,
                padding: "12px 14px",
                transition: "all .2s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 20 }}>{p.token}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{p.name}</div>
                    {i === currentIdx && <Tag color={C.accent}>Current</Tag>}
                  </div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.green, fontFamily: "Georgia, serif" }}>
                  ${p.money}
                </div>
                <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>
                  {p.properties.length} {p.properties.length === 1 ? "property" : "properties"}
                  {p.inJail ? <span style={{ color: C.red, fontWeight: 700, marginLeft: 6 }}>In Jail</span> : null}
                </div>
              </div>
            ))}

            {/* Event log */}
            <Card style={{ padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                Event Log
              </div>
              <div style={{ maxHeight: 200, overflow: "auto", display: "grid", gap: 5 }}>
                {eventLog.length === 0
                  ? <div style={{ fontSize: 12, color: C.textLight }}>No events yet.</div>
                  : eventLog.map((e, i) => (
                    <div key={i} style={{ fontSize: 11, color: C.textMid, lineHeight: 1.4, paddingBottom: 4, borderBottom: `1px solid ${C.border}` }}>
                      {e}
                    </div>
                  ))
                }
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* ---- Card modal ---- */}
      {showCard && currentCard && (
        <Modal onClose={handleCardClose}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>
              {currentCard.type === "money" ? (currentCard.amount > 0 ? "💰" : "💸") : "🎴"}
            </div>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 900, color: C.text, margin: "0 0 16px" }}>
              Card Drawn
            </h2>
            <div style={{
              background: C.surfaceAlt, borderRadius: 12, padding: "18px 20px",
              border: `1.5px solid ${C.border}`, marginBottom: 20,
              fontSize: 16, color: C.text, fontStyle: "italic",
            }}>
              "{currentCard.text}"
            </div>
            <Btn size="lg" onClick={handleCardClose} style={{ width: "100%" }}>
              OK, got it
            </Btn>
          </div>
        </Modal>
      )}

      {/* ---- Rules modal ---- */}
      {showRules && (
        <Modal onClose={() => setShowRules(false)}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 900, color: C.text, margin: "0 0 16px", textAlign: "center" }}>
            Game Rules
          </h2>
          <div style={{ color: C.textMid, fontSize: 14, lineHeight: 1.7 }}>
            <p>Each player starts with <strong>${startMoney}</strong>. Roll dice to move around the 40-space board.</p>
            <p><strong>Passing GO</strong> earns <strong>${goSalary}</strong>.</p>
            <p><strong>Unowned property</strong> — buy it or pass.</p>
            <p><strong>Owned property</strong> — pay rent to the owner.</p>
            <p><strong>Railroads & Utilities</strong> — purchasable; flat rent applies.</p>
            <p><strong>Chance / Community Chest</strong> — draw a card and follow its instructions.</p>
            <p><strong>Income Tax / Luxury Tax</strong> — pay the listed amount. {jackpotRule ? "Fees go into the Free Parking pot." : ""}</p>
            <p><strong>Jail</strong> — skip one turn, then release automatically.</p>
            <p><strong>Go to Jail</strong> — sent directly to Jail.</p>
            {jackpotRule && <p><strong>Free Parking Jackpot</strong> — all fines and taxes fill a pot. Land here to claim it!</p>}
            <p style={{ fontWeight: 700, color: C.text }}>Last player solvent wins. 🏆</p>
          </div>
          <Btn onClick={() => setShowRules(false)} style={{ marginTop: 8, width: "100%" }}>Got it!</Btn>
        </Modal>
      )}
    </div>
  );
}
