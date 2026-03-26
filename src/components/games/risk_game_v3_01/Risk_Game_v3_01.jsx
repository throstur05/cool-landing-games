import React, { useEffect, useRef, useState } from "react";

/**
 * Risk_Game_v3_01.jsx
 * Claude's House Edition — "Cartographer's Table"
 * Light parchment aesthetic • 18 territories • 6 continents
 * Draft → Attack → Fortify • Human vs 1-4 AI
 */

// ─── Storage keys ────────────────────────────────────────────────────────────
const SK_SETTINGS = "risk_v3_settings";
const SK_SAVE     = "risk_v3_save";

// ─── Phases ──────────────────────────────────────────────────────────────────
const PH = { DRAFT: "DRAFT", ATTACK: "ATTACK", FORTIFY: "FORTIFY" };

// ─── Colors (muted ink palette) ──────────────────────────────────────────────
const COLORS = [
  "#2d6a4f", // Forest Green  — Human
  "#9b2226", // Crimson       — AI 1
  "#005f73", // Deep Teal     — AI 2
  "#7b4f12", // Burnt Umber   — AI 3
  "#6a0572", // Plum          — AI 4
];

// ─── Map: 18 territories, 6 continents (3 each), SVG 1080×580 ────────────────
const CONTINENTS = {
  NW: { name: "Northmarch",  bonus: 3, lx: 165, ly: 36  },
  NE: { name: "Eastmoor",    bonus: 4, lx: 915, ly: 36  },
  SW: { name: "Southvale",   bonus: 3, lx: 165, ly: 554 },
  SE: { name: "Redshore",    bonus: 4, lx: 915, ly: 554 },
  CN: { name: "Midlands",    bonus: 5, lx: 540, ly: 36  },
  CS: { name: "Heartwood",   bonus: 5, lx: 540, ly: 554 },
};

const TERR = [
  // NW — Northmarch
  { id:0,  c:"NW", name:"Irongate",    x:120, y:110, n:[1,2,6]        },
  { id:1,  c:"NW", name:"Coldveil",    x:210, y:220, n:[0,2,3,7]      },
  { id:2,  c:"NW", name:"Ashford",     x:100, y:330, n:[0,1,8]        },
  // CN — Midlands
  { id:3,  c:"CN", name:"Thornbury",   x:380, y:110, n:[1,4,5,7]      },
  { id:4,  c:"CN", name:"Greycroft",   x:540, y:140, n:[3,5,9,10]     },
  { id:5,  c:"CN", name:"Millhaven",   x:700, y:110, n:[3,4,6,11]     },
  // NE — Eastmoor
  { id:6,  c:"NE", name:"Stormheld",   x:880, y:110, n:[5,0,11,12]   },
  { id:7,  c:"NE", name:"Ravenpass",   x:960, y:220, n:[6,1,3,13]    },
  { id:8,  c:"NE", name:"Duskwall",    x:880, y:330, n:[7,2,13,14]   },
  // CS — Heartwood
  { id:9,  c:"CS", name:"Fernholt",    x:380, y:470, n:[4,10,11,14]  },
  { id:10, c:"CS", name:"Cinderfen",   x:540, y:440, n:[4,9,11,15]   },
  { id:11, c:"CS", name:"Brookmere",   x:700, y:470, n:[5,9,10,6,16] },
  // SW — Southvale
  { id:12, c:"SW", name:"Saltmarsh",   x:120, y:460, n:[2,8,13]      },
  { id:13, c:"SW", name:"Gilded Bay",  x:210, y:350, n:[7,8,12,14]   },
  { id:14, c:"SW", name:"Coppergate",  x:330, y:370, n:[8,9,13,15]   },
  // SE — Redshore
  { id:15, c:"SE", name:"Redport",     x:760, y:370, n:[11,14,16,17] },
  { id:16, c:"SE", name:"Dunstone",    x:880, y:450, n:[6,11,15,17]  },
  { id:17, c:"SE", name:"Tidemark",    x:950, y:340, n:[8,15,16,7]   },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function rollDice(n) {
  return Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 6)).sort((a, b) => b - a);
}

function battle(aArmies, dArmies) {
  const ad = Math.max(1, Math.min(3, aArmies - 1));
  const dd = Math.max(1, Math.min(2, dArmies));
  const A = rollDice(ad), D = rollDice(dd);
  let aL = 0, dL = 0;
  for (let i = 0; i < Math.min(A.length, D.length); i++) {
    if (A[i] > D[i]) dL++; else aL++;
  }
  return { A, D, aL, dL };
}

function calcReinforce(pid, owners, settings) {
  const owned = TERR.filter(t => owners[t.id] === pid);
  const base = Math.max(3, Math.floor(owned.length / 3));
  const byC = owned.reduce((m, t) => ((m[t.c] = (m[t.c] || 0) + 1), m), {});
  let bonus = 0;
  for (const code of Object.keys(CONTINENTS)) {
    if ((byC[code] || 0) === 3) bonus += CONTINENTS[code].bonus;
  }
  return base + bonus + (settings.reinforceMod || 0);
}

// ─── Die face SVG ─────────────────────────────────────────────────────────────
function DieFace({ value, color = "#2d6a4f" }) {
  const dots = {
    1: [[14,14]],
    2: [[6,6],[22,22]],
    3: [[6,6],[14,14],[22,22]],
    4: [[6,6],[22,6],[6,22],[22,22]],
    5: [[6,6],[22,6],[14,14],[6,22],[22,22]],
    6: [[6,6],[22,6],[6,14],[22,14],[6,22],[22,22]],
  };
  return (
    <svg width="30" height="30" viewBox="0 0 28 28" style={{ display: "inline-block", verticalAlign: "middle", margin: "0 2px" }}>
      <rect x="1" y="1" width="26" height="26" rx="5" fill="#fffdf7" stroke={color} strokeWidth="1.5" />
      {(dots[value] || []).map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="2.8" fill={color} />
      ))}
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Risk_Game_v3_01({ onQuit }) {
  // Settings
  const [settings, setSettings] = useState(() => {
    try { const s = localStorage.getItem(SK_SETTINGS); return s ? JSON.parse(s) : defaultSettings(); }
    catch { return defaultSettings(); }
  });

  function defaultSettings() {
    return { numAI: 1, aiStrength: 4, reinforceMod: 0, rememberLast: true, fogOfWar: false };
  }

  // Game state
  const [players,   setPlayers]   = useState([]);
  const [owners,    setOwners]    = useState({});
  const [armies,    setArmies]    = useState({});
  const [current,   setCurrent]   = useState(0);
  const [phase,     setPhase]     = useState(PH.DRAFT);
  const [reinf,     setReinf]     = useState(0);
  const [fromId,    setFromId]    = useState(null);
  const [toId,      setToId]      = useState(null);
  const [log,       setLog]       = useState([]);
  const [diceView,  setDiceView]  = useState(null);
  const [winner,    setWinner]    = useState(null);
  const [showRules, setShowRules] = useState(false);
  const [showNew,   setShowNew]   = useState(true);
  const [hovered,   setHovered]   = useState(null);

  const logRef = useRef(null);
  const human = 0;
  const isHuman = current === human && players.length > 0;

  // Persist settings
  useEffect(() => {
    localStorage.setItem(SK_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  // Autosave
  useEffect(() => {
    if (!players.length) return;
    localStorage.setItem(SK_SAVE, JSON.stringify({ players, owners, armies, current, phase, reinf, log, winner }));
  }, [players, owners, armies, current, phase, reinf, log, winner]);

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  // Resume
  useEffect(() => {
    if (!settings.rememberLast) return;
    try {
      const raw = localStorage.getItem(SK_SAVE);
      if (raw) {
        const s = JSON.parse(raw);
        setPlayers(s.players); setOwners(s.owners); setArmies(s.armies);
        setCurrent(s.current); setPhase(s.phase); setReinf(s.reinf);
        setLog(s.log || []); setWinner(s.winner ?? null);
        setShowNew(false);
      }
    } catch {}
  }, []);

  // ── New game setup ──────────────────────────────────────────────────────────
  function newGame(opts = settings) {
    const total = 1 + Math.max(1, Math.min(4, Number(opts.numAI || 1)));
    const pls = Array.from({ length: total }, (_, i) => ({
      id: i, name: i === 0 ? "You" : `AI ${i}`,
      isAI: i !== 0, color: COLORS[i % COLORS.length],
      strength: i === 0 ? 0 : Number(opts.aiStrength || 4),
    }));

    const order = shuffle(TERR.map(t => t.id));
    const o = {}, a = {};
    for (let i = 0; i < order.length; i++) { o[order[i]] = i % total; a[order[i]] = 1; }

    const extra = Array(total).fill(20);
    for (const tid of order) extra[o[tid]]--;
    for (let p = 0; p < total; p++) {
      const mine = order.filter(tid => o[tid] === p);
      let k = 0;
      while (extra[p] > 0) { a[mine[k % mine.length]] += 1; extra[p]--; k++; }
    }

    setPlayers(pls); setOwners(o); setArmies(a);
    setCurrent(0); setPhase(PH.DRAFT);
    setReinf(calcReinforce(0, o, opts));
    setFromId(null); setToId(null);
    setLog([{ t: Date.now(), m: "⚔ New game — Good luck!" }]);
    setWinner(null); setDiceView(null);
  }

  function quickStart() { newGame(); setShowNew(false); }

  // ── Checks ──────────────────────────────────────────────────────────────────
  function checkVictory(o) {
    if (!players.length) return false;
    const first = o[TERR[0].id];
    if (TERR.every(t => o[t.id] === first)) {
      setWinner(first);
      addLog(`🏆 ${players[first]?.name} conquers the realm!`);
      return true;
    }
    return false;
  }

  function addLog(m) { setLog(L => [...L.slice(-200), { t: Date.now(), m }]); }

  // ── Phase controls ──────────────────────────────────────────────────────────
  function endDraft() {
    if (reinf <= 0) { setPhase(PH.ATTACK); setFromId(null); setToId(null); }
  }
  function endAttack() { setPhase(PH.FORTIFY); setFromId(null); setToId(null); }
  function endTurn() {
    const next = (current + 1) % players.length;
    setCurrent(next); setPhase(PH.DRAFT);
    setReinf(calcReinforce(next, owners, settings));
    setFromId(null); setToId(null); setDiceView(null);
  }

  // ── Click handler ───────────────────────────────────────────────────────────
  function handleClick(tid) {
    if (winner != null || !players.length) return;

    if (phase === PH.DRAFT && isHuman) {
      if (owners[tid] === human && reinf > 0) {
        setArmies(a => ({ ...a, [tid]: a[tid] + 1 }));
        setReinf(r => r - 1);
      }
      return;
    }
    if (!isHuman) return;

    if (phase === PH.ATTACK) {
      if (fromId == null) {
        if (owners[tid] === human && armies[tid] > 1) setFromId(tid);
      } else if (tid === fromId) {
        setFromId(null); setToId(null);
      } else {
        const isNeighbor = TERR[fromId].n.includes(tid);
        if (isNeighbor && owners[tid] !== human) {
          setToId(tid);
        } else if (owners[tid] === human && armies[tid] > 1) {
          setFromId(tid); setToId(null);
        }
      }
      return;
    }

    if (phase === PH.FORTIFY) {
      if (fromId == null) {
        if (owners[tid] === human && armies[tid] > 1) setFromId(tid);
      } else if (toId == null) {
        if (owners[tid] === human && tid !== fromId && TERR[fromId].n.includes(tid)) setToId(tid);
      } else {
        setFromId(null); setToId(null);
      }
    }
  }

  // ── Combat ──────────────────────────────────────────────────────────────────
  function doAttack(fId = fromId, tId = toId, pid = current) {
    if (fId == null || tId == null) return false;
    const a0 = armies[fId], d0 = armies[tId];
    if (owners[fId] !== pid || owners[tId] === pid || a0 <= 1) return false;
    const { A, D, aL, dL } = battle(a0, d0);
    setDiceView({ A, D });
    const nA = Math.max(1, a0 - aL), nD = Math.max(0, d0 - dL);
    if (nD <= 0) {
      const move = Math.max(1, Math.min(nA - 1, 3));
      setArmies(prev => ({ ...prev, [fId]: nA - move, [tId]: move }));
      setOwners(o => {
        const no = { ...o, [tId]: pid };
        setTimeout(() => checkVictory(no), 0);
        return no;
      });
      addLog(`⚔ ${players[pid]?.name}: ${TERR[fId].name} → ${TERR[tId].name} — CAPTURED! [A:${A} D:${D}]`);
      setFromId(fId); setToId(null);
      return true;
    } else {
      setArmies(prev => ({ ...prev, [fId]: nA, [tId]: nD }));
      addLog(`⚔ ${TERR[fId].name}→${TERR[tId].name} A:${A.join(",")} D:${D.join(",")} (−${aL}/−${dL})`);
      return false;
    }
  }

  function blitz() {
    let guard = 60;
    function step() {
      if (guard-- <= 0) return;
      if (fromId == null || toId == null) return;
      if (owners[toId] === current || armies[fromId] <= 1) return;
      const captured = doAttack();
      if (!captured) setTimeout(step, 280);
    }
    step();
  }

  function fortify(amt = 1) {
    if (fromId == null || toId == null) return;
    if (!TERR[fromId].n.includes(toId)) return;
    const can = armies[fromId] - 1;
    const mv = Math.max(1, Math.min(amt, can));
    setArmies(a => ({ ...a, [fromId]: a[fromId] - mv, [toId]: a[toId] + mv }));
    addLog(`↪ Fortify: ${TERR[fromId].name} → ${TERR[toId].name} (+${mv})`);
  }

  // ── AI ──────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!players.length || winner != null) return;
    const me = players[current];
    if (!me?.isAI) return;
    const t = setTimeout(() => aiTurn(me), 450);
    return () => clearTimeout(t);
  }, [players, current, phase, reinf, owners, armies, winner]);

  function aiTurn(me) {
    const pid = me.id;

    if (phase === PH.DRAFT) {
      if (reinf > 0) {
        const my = TERR.filter(t => owners[t.id] === pid);
        const borders = my.filter(t => t.n.some(n => owners[n] !== pid));
        const target = (borders.length ? borders : my)
          .sort((a, b) => (armies[a.id] ?? 0) - (armies[b.id] ?? 0))[0];
        if (target) {
          setArmies(a => ({ ...a, [target.id]: a[target.id] + 1 }));
          setReinf(r => r - 1);
        }
      } else {
        setPhase(PH.ATTACK);
      }
      return;
    }

    if (phase === PH.ATTACK) {
      const my = TERR.filter(t => owners[t.id] === pid && armies[t.id] > 1);
      let best = null;
      for (const t of my) {
        for (const n of t.n) {
          if (owners[n] !== pid) {
            const ratio = (armies[t.id] - 1) / Math.max(1, armies[n]);
            if (!best || ratio > best.ratio) best = { from: t.id, to: n, ratio };
          }
        }
      }
      const threshold = 1.2 - (me.strength - 1) * 0.025;
      if (best && best.ratio >= threshold) {
        const a0 = armies[best.from], d0 = armies[best.to];
        const { A, D, aL, dL } = battle(a0, d0);
        const nA = Math.max(1, a0 - aL), nD = Math.max(0, d0 - dL);
        if (nD <= 0) {
          const move = Math.max(1, Math.min(nA - 1, 3));
          setArmies(prev => ({ ...prev, [best.from]: nA - move, [best.to]: move }));
          setOwners(o => {
            const no = { ...o, [best.to]: pid };
            setTimeout(() => checkVictory(no), 0);
            return no;
          });
          addLog(`⚔ ${me.name} captured ${TERR[best.to].name}`);
        } else {
          setArmies(prev => ({ ...prev, [best.from]: nA, [best.to]: nD }));
          addLog(`⚔ ${me.name} attacked ${TERR[best.to].name}`);
        }
      }
      setPhase(PH.FORTIFY);
      return;
    }

    if (phase === PH.FORTIFY) {
      const my = TERR.filter(t => owners[t.id] === pid);
      const borders = my.filter(t => t.n.some(n => owners[n] !== pid));
      const interior = my.filter(t => !borders.some(b => b.id === t.id));
      const src = interior.sort((a, b) => (armies[b.id] ?? 0) - (armies[a.id] ?? 0))[0];
      const dst = borders.sort((a, b) => (armies[a.id] ?? 0) - (armies[b.id] ?? 0))[0];
      if (src && dst && armies[src.id] > 1 && src.n.includes(dst.id)) {
        const mv = Math.min(2, armies[src.id] - 1);
        setArmies(prev => ({ ...prev, [src.id]: prev[src.id] - mv, [dst.id]: prev[dst.id] + mv }));
      }
      setTimeout(() => endTurn(), 300);
    }
  }

  // ── Fog of war ──────────────────────────────────────────────────────────────
  function visible(tid) {
    if (!settings.fogOfWar || !players.length) return true;
    if (owners[tid] === human) return true;
    return TERR[tid].n.some(n => owners[n] === human);
  }

  // ── Territory highlight logic ───────────────────────────────────────────────
  function getTerritoryState(tid) {
    if (!players.length) return "neutral";
    if (tid === fromId) return "selected-from";
    if (tid === toId) return "selected-to";
    const owned = owners[tid];
    if (phase === PH.ATTACK && fromId != null && owned !== current && TERR[fromId].n.includes(tid)) return "attackable";
    if (phase === PH.FORTIFY && fromId != null && owned === current && tid !== fromId && TERR[fromId].n.includes(tid)) return "fortifiable";
    if (owned === current) return "owned";
    return "enemy";
  }

  const ownerColor = (tid) => players[owners[tid]]?.color || "#b8b0a0";

  // ── Scoreboard ──────────────────────────────────────────────────────────────
  const scoreData = players.map(p => {
    const owned = TERR.filter(t => owners[t.id] === p.id);
    const totalArmies = owned.reduce((s, t) => s + (armies[t.id] || 0), 0);
    return { ...p, ownedCount: owned.length, totalArmies };
  }).sort((a, b) => b.ownedCount - a.ownedCount);

  const phaseLabel = { DRAFT: "📜 Draft", ATTACK: "⚔ Attack", FORTIFY: "🏰 Fortify" };

  // ──────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────────────
  const styles = getStyles();

  return (
    <div style={styles.root}>
      {/* ── Top Bar ── */}
      <header style={styles.topbar}>
        <div style={styles.brand}>
          <span style={styles.brandIcon}>⚑</span>
          <span style={styles.brandText}>Risk</span>
          <span style={styles.brandSub}>House Edition</span>
        </div>
        <div style={styles.topbarActions}>
          <button style={styles.btn} onClick={() => setShowNew(true)}>New Game</button>
          <button style={{ ...styles.btn, ...styles.btnGhost }} onClick={() => setShowRules(s => !s)}>
            {showRules ? "Close Rules" : "Rules"}
          </button>
          <button style={{ ...styles.btn, ...styles.btnDanger }}
            onClick={() => { if (onQuit) onQuit(); else window.location.hash = "#/"; }}>
            Quit
          </button>
        </div>
      </header>

      <div style={styles.layout}>
        {/* ── Left Panel ── */}
        <aside style={styles.panel}>
          {/* Current player */}
          {players.length > 0 && (
            <div style={styles.sec}>
              <div style={styles.secLabel}>Current Player</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ ...styles.colorDot, background: players[current]?.color }} />
                <span style={{ fontWeight: 700, fontSize: 16 }}>{players[current]?.name || "—"}</span>
              </div>
            </div>
          )}

          {/* Phase */}
          {players.length > 0 && (
            <div style={styles.sec}>
              <div style={styles.secLabel}>Phase</div>
              <div style={styles.phaseBadge}>{phaseLabel[phase]}</div>
            </div>
          )}

          {/* Draft controls */}
          {phase === PH.DRAFT && players.length > 0 && (
            <div style={styles.sec}>
              <div style={styles.secLabel}>Reinforcements</div>
              <div style={styles.bigNumber}>{reinf}</div>
              {isHuman && (
                <>
                  <div style={styles.hint}>Click your territories to place troops.</div>
                  <button style={{ ...styles.btn, ...styles.btnWide, marginTop: 8 }}
                    onClick={endDraft} disabled={reinf > 0}>
                    Continue →
                  </button>
                </>
              )}
            </div>
          )}

          {/* Attack controls */}
          {phase === PH.ATTACK && isHuman && (
            <div style={styles.sec}>
              <div style={styles.secLabel}>Attack</div>
              <div style={styles.selRow}>
                <span style={styles.selLabel}>From</span>
                <span style={styles.selVal}>{fromId != null ? TERR[fromId].name : "—"}</span>
              </div>
              <div style={styles.selRow}>
                <span style={styles.selLabel}>Target</span>
                <span style={styles.selVal}>{toId != null ? TERR[toId].name : "—"}</span>
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                <button style={styles.btn} disabled={fromId == null || toId == null}
                  onClick={() => doAttack()}>Roll Once</button>
                <button style={{ ...styles.btn, background: "#9b2226" }}
                  disabled={fromId == null || toId == null} onClick={blitz}>Blitz!</button>
                <button style={{ ...styles.btn, ...styles.btnGhost }} onClick={endAttack}>Skip →</button>
              </div>
              {diceView && (
                <div style={styles.diceRow}>
                  <div style={styles.diceGroup}>
                    <span style={{ color: players[current]?.color, fontSize: 11, fontWeight: 700 }}>ATT</span>
                    {diceView.A?.map((v, i) => <DieFace key={i} value={v} color={players[current]?.color} />)}
                  </div>
                  <div style={styles.diceGroup}>
                    <span style={{ color: "#555", fontSize: 11, fontWeight: 700 }}>DEF</span>
                    {diceView.D?.map((v, i) => <DieFace key={i} value={v} color="#666" />)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Fortify controls */}
          {phase === PH.FORTIFY && isHuman && (
            <div style={styles.sec}>
              <div style={styles.secLabel}>Fortify (adjacent)</div>
              <div style={styles.selRow}>
                <span style={styles.selLabel}>From</span>
                <span style={styles.selVal}>{fromId != null ? TERR[fromId].name : "—"}</span>
              </div>
              <div style={styles.selRow}>
                <span style={styles.selLabel}>To</span>
                <span style={styles.selVal}>{toId != null ? TERR[toId].name : "—"}</span>
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <button style={styles.btn} disabled={!fromId || !toId} onClick={() => fortify(1)}>Move 1</button>
                <button style={styles.btn} disabled={!fromId || !toId}
                  onClick={() => fortify(Math.min(5, (armies[fromId] || 1) - 1))}>Move Max</button>
                <button style={{ ...styles.btn, ...styles.btnGhost }} onClick={endTurn}>End Turn</button>
              </div>
            </div>
          )}

          {/* Scoreboard */}
          {players.length > 0 && (
            <div style={{ ...styles.sec, flexGrow: 1 }}>
              <div style={styles.secLabel}>Standings</div>
              {scoreData.map(p => (
                <div key={p.id} style={{ ...styles.scoreRow, opacity: p.ownedCount === 0 ? 0.4 : 1 }}>
                  <div style={{ ...styles.colorDot, background: p.color }} />
                  <span style={{ fontSize: 13, flex: 1, fontWeight: p.id === current ? 700 : 400 }}>{p.name}</span>
                  <span style={{ fontSize: 12, color: "#666" }}>{p.ownedCount} 🏔 {p.totalArmies} ⚔</span>
                </div>
              ))}
            </div>
          )}

          {/* Tips */}
          <div style={styles.sec}>
            <div style={styles.secLabel}>Quick Guide</div>
            <ul style={styles.tips}>
              <li>Draft: click your territory to place a troop.</li>
              <li>Attack: select yours → enemy neighbor → Roll or Blitz.</li>
              <li>Fortify: move troops between adjacent territories.</li>
            </ul>
          </div>
        </aside>

        {/* ── Map ── */}
        <main style={styles.boardWrap}>
          <svg style={styles.map} viewBox="0 0 1080 580" role="img" aria-label="Risk Map">
            <defs>
              {/* Parchment gradient */}
              <radialGradient id="parchment" cx="50%" cy="50%" r="70%">
                <stop offset="0%" stopColor="#fffdf5" />
                <stop offset="100%" stopColor="#f5ede0" />
              </radialGradient>
              {/* Soft shadow */}
              <filter id="dropshadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.18" />
              </filter>
              {/* Selection glow */}
              <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              {/* Hatching for fog */}
              <pattern id="fog" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="6" stroke="#ccc" strokeWidth="2" />
              </pattern>
            </defs>

            {/* Background */}
            <rect x="0" y="0" width="1080" height="580" fill="url(#parchment)" />
            {/* Subtle grid texture */}
            <rect x="0" y="0" width="1080" height="580" fill="none" opacity="0.04"
              stroke="#8b7355" strokeWidth="0.5"
              strokeDasharray="1 40" />
            {/* Frame */}
            <rect x="4" y="4" width="1072" height="572" fill="none" stroke="#c4a882" strokeWidth="3" rx="6" opacity="0.6" />

            {/* Continent banners */}
            {Object.entries(CONTINENTS).map(([code, info]) => (
              <text key={code} x={info.lx} y={info.ly}
                textAnchor="middle" fontSize="13" fontFamily="Georgia, serif"
                fill="#8b6f47" fontStyle="italic" opacity="0.75">
                {info.name} (+{info.bonus})
              </text>
            ))}

            {/* Roads (edges) */}
            {TERR.flatMap(t =>
              t.n.filter(n => n > t.id).map(n => {
                const u = TERR[n];
                const sameContinent = t.c === u.c;
                return (
                  <line key={`e-${t.id}-${n}`}
                    x1={t.x} y1={t.y} x2={u.x} y2={u.y}
                    stroke={sameContinent ? "#c4a882" : "#d4c4a8"}
                    strokeWidth={sameContinent ? 2 : 1.5}
                    strokeDasharray={sameContinent ? "none" : "4 5"}
                    opacity="0.65" />
                );
              })
            )}

            {/* Territories */}
            {TERR.map(t => {
              const vis = visible(t.id);
              const state = getTerritoryState(t.id);
              const col = vis ? ownerColor(t.id) : "#c8c0b0";
              const armyCount = armies[t.id] ?? 0;
              const isHov = hovered === t.id;

              const outerR = state === "selected-from" || state === "selected-to" ? 30
                : state === "attackable" || state === "fortifiable" ? 27
                : isHov ? 26 : 24;

              const strokeCol = state === "selected-from" ? "#f4d03f"
                : state === "selected-to" ? "#e74c3c"
                : state === "attackable" ? "#e74c3c"
                : state === "fortifiable" ? "#2ecc71"
                : "rgba(0,0,0,0.3)";
              const strokeW = ["selected-from","selected-to","attackable","fortifiable"].includes(state) ? 3 : 1.5;

              return (
                <g key={t.id}
                  style={{ cursor: "pointer", transition: "all 0.15s" }}
                  onClick={() => handleClick(t.id)}
                  onMouseEnter={() => setHovered(t.id)}
                  onMouseLeave={() => setHovered(null)}
                  filter={state === "selected-from" ? "url(#glow)" : "url(#dropshadow)"}>

                  {/* Territory circle */}
                  <circle cx={t.x} cy={t.y} r={outerR}
                    fill={vis ? col : "url(#fog)"}
                    stroke={strokeCol} strokeWidth={strokeW}
                    opacity={vis ? 1 : 0.6} />

                  {/* Inner highlight */}
                  {vis && <circle cx={t.x - 6} cy={t.y - 6} r={outerR * 0.45}
                    fill="rgba(255,255,255,0.18)" />}

                  {/* Army badge */}
                  <rect x={t.x + 14} y={t.y - 26} width={armyCount >= 10 ? 30 : 26} height={20}
                    rx={5} fill="rgba(255,253,245,0.93)" stroke={col} strokeWidth={1.5} />
                  <text x={t.x + (armyCount >= 10 ? 29 : 27)} y={t.y - 11}
                    textAnchor="middle" fontSize={11} fontWeight="800" fill="#1a1a1a"
                    fontFamily="ui-monospace, monospace">
                    {armyCount}
                  </text>

                  {/* Territory name */}
                  <text x={t.x} y={t.y + outerR + 13}
                    textAnchor="middle" fontSize={10} fontWeight="600"
                    fill="rgba(0,0,0,0.65)" fontFamily="Georgia, serif">
                    {t.name}
                  </text>
                </g>
              );
            })}

            {/* Compass rose */}
            <g transform="translate(52, 530)" opacity="0.3">
              <circle r="20" fill="none" stroke="#8b6f47" strokeWidth="1" />
              <path d="M0,-18 L3,0 L0,18 L-3,0 Z" fill="#8b6f47" />
              <path d="M-18,0 L0,3 L18,0 L0,-3 Z" fill="#8b6f47" />
              <text y="-22" textAnchor="middle" fontSize="10" fill="#8b6f47" fontFamily="Georgia,serif">N</text>
            </g>

            {/* Legend */}
            <g transform="translate(900, 540)">
              <text fontSize="10" fill="#8b6f47" fontFamily="Georgia, serif" fontStyle="italic">
                — same continent  ╌ cross-continent
              </text>
            </g>
          </svg>

          {/* Rules drawer */}
          {showRules && (
            <div style={styles.rulesDrawer}>
              <div style={styles.rulesInner}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h2 style={styles.rulesH2}>Rules — House Edition</h2>
                  <button style={{ ...styles.btn, ...styles.btnGhost, padding: "4px 10px" }}
                    onClick={() => setShowRules(false)}>✕</button>
                </div>

                <p><strong>Goal:</strong> Control all 18 territories to win!</p>
                <p>The map has 18 territories across 6 continents (3 each). Control an entire continent to earn a bonus every turn.</p>

                <h3 style={styles.rulesH3}>Turn Phases</h3>
                <ol style={{ lineHeight: 1.7 }}>
                  <li><strong>📜 Draft</strong>: Gain max(3, ⌊owned÷3⌋) + continent bonuses + modifier reinforcements. Click your territories to place troops.</li>
                  <li><strong>⚔ Attack</strong>: Select one of your border territories (&gt;1 troop), then an adjacent enemy. Roll Once for a single combat, or Blitz to fight repeatedly until you capture or retreat.</li>
                  <li><strong>🏰 Fortify</strong>: Move troops between two <em>adjacent</em> owned territories. Then End Turn.</li>
                </ol>

                <h3 style={styles.rulesH3}>Combat</h3>
                <ul style={{ lineHeight: 1.7 }}>
                  <li>Attacker rolls up to 3 dice (max troops−1). Defender rolls up to 2 dice.</li>
                  <li>Compare highest vs highest, then next vs next. Ties go to the defender.</li>
                  <li>When defender reaches 0, attacker captures the territory and moves 1–3 troops in automatically.</li>
                </ul>

                <h3 style={styles.rulesH3}>Continents & Bonuses</h3>
                <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
                  <thead>
                    <tr>
                      {["Continent","Bonus","Territories"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "4px 8px", borderBottom: "1px solid #ddd" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(CONTINENTS).map(([code, info]) => {
                      const terrs = TERR.filter(t => t.c === code).map(t => t.name).join(", ");
                      return (
                        <tr key={code}>
                          <td style={{ padding: "4px 8px" }}>{info.name}</td>
                          <td style={{ padding: "4px 8px" }}>+{info.bonus}</td>
                          <td style={{ padding: "4px 8px", color: "#666" }}>{terrs}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <h3 style={styles.rulesH3}>AI Strength (1–8)</h3>
                <p>Higher = more aggressive attacks and smarter fortification. Still readable for learning purposes.</p>

                <h3 style={styles.rulesH3}>House Rule Ideas</h3>
                <ul style={{ lineHeight: 1.7 }}>
                  <li><strong>Mercy Rule</strong>: +2 reinforcements if you own ≤ 4 territories.</li>
                  <li><strong>Pacifist Round</strong>: Every 5th turn, no attacks allowed.</li>
                  <li><strong>Chain Fortify</strong>: Allow moving armies along a connected path of owned territories.</li>
                  <li><strong>Fog Tournament</strong>: Play with Fog of War; compare final territory counts after 30 turns.</li>
                </ul>

                <p style={{ color: "#999", fontSize: 12, marginTop: 16 }}>v3.0 — Claude's House Edition ⚑</p>
              </div>
            </div>
          )}
        </main>

        {/* ── Right Panel (Log) ── */}
        <aside style={{ ...styles.panel, minWidth: 220 }}>
          <div style={styles.sec}>
            <div style={styles.secLabel}>Event Log</div>
            <div ref={logRef} style={styles.log}>
              {log.length === 0 && <div style={{ color: "#aaa", fontSize: 12 }}>Start a new game.</div>}
              {log.slice(-200).map((e, i) => (
                <div key={i} style={styles.logLine}>{e.m}</div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ── Winner Banner ── */}
      {winner != null && (
        <div style={styles.overlay}>
          <div style={styles.winnerCard}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>⚑</div>
            <h2 style={{ margin: "0 0 8px", fontFamily: "Georgia, serif" }}>
              {players[winner]?.name} Conquers the Realm!
            </h2>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
              <button style={styles.btn} onClick={() => { newGame(); setShowNew(false); }}>Play Again</button>
              <button style={{ ...styles.btn, ...styles.btnGhost }} onClick={() => setShowNew(true)}>Change Settings</button>
            </div>
          </div>
        </div>
      )}

      {/* ── New Game Modal ── */}
      {showNew && (
        <div style={styles.overlay} onClick={() => { if (players.length) setShowNew(false); }}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: "0 0 16px", fontFamily: "Georgia, serif" }}>⚑ New Game</h2>

            <div style={styles.modalGrid}>
              <label style={styles.modalLabel}>
                Number of AI (1–4)
                <input type="number" min={1} max={4} style={styles.input}
                  value={settings.numAI}
                  onChange={e => setSettings({ ...settings, numAI: Number(e.target.value) })} />
              </label>

              <label style={styles.modalLabel}>
                AI Strength (1–8)
                <input type="range" min={1} max={8} style={{ width: "100%" }}
                  value={settings.aiStrength}
                  onChange={e => setSettings({ ...settings, aiStrength: Number(e.target.value) })} />
                <span style={{ fontWeight: 700, color: "#2d6a4f" }}>{settings.aiStrength} / 8</span>
              </label>

              <label style={styles.modalLabel}>
                Reinforce Modifier (−2 to +2)
                <input type="number" min={-2} max={2} style={styles.input}
                  value={settings.reinforceMod}
                  onChange={e => setSettings({ ...settings, reinforceMod: Number(e.target.value) })} />
              </label>

              <label style={{ ...styles.modalLabel, flexDirection: "row", alignItems: "center", gap: 10 }}>
                <input type="checkbox" checked={settings.fogOfWar}
                  onChange={e => setSettings({ ...settings, fogOfWar: e.target.checked })} />
                Fog of War
              </label>

              <label style={{ ...styles.modalLabel, flexDirection: "row", alignItems: "center", gap: 10 }}>
                <input type="checkbox" checked={settings.rememberLast}
                  onChange={e => setSettings({ ...settings, rememberLast: e.target.checked })} />
                Save & resume last game
              </label>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={quickStart}>Start Game</button>
              {players.length > 0 && (
                <button style={{ ...styles.btn, ...styles.btnGhost }} onClick={() => setShowNew(false)}>Resume</button>
              )}
            </div>
            <div style={{ color: "#999", fontSize: 12, marginTop: 10 }}>
              Your last game is saved and will resume automatically if "Save & resume" is on.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Inline Styles ────────────────────────────────────────────────────────────
function getStyles() {
  return {
    root: {
      minHeight: "100vh",
      background: "#fafaf7",
      color: "#1a1a1a",
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    },
    topbar: {
      position: "sticky", top: 0, zIndex: 10,
      background: "#fffdf5",
      borderBottom: "1px solid #e8dece",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 18px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    },
    brand: { display: "flex", alignItems: "baseline", gap: 8 },
    brandIcon: { fontSize: 22, color: "#2d6a4f" },
    brandText: { fontFamily: "Georgia, serif", fontWeight: 800, fontSize: 22, letterSpacing: "0.03em" },
    brandSub: { fontSize: 12, color: "#8b7355", fontStyle: "italic" },
    topbarActions: { display: "flex", gap: 8 },

    btn: {
      background: "#2d4a3e", color: "#fff",
      border: "none", borderRadius: 7, padding: "7px 14px",
      cursor: "pointer", fontWeight: 600, fontSize: 13,
      transition: "filter 0.15s",
    },
    btnGhost: { background: "transparent", color: "#2d4a3e", border: "1.5px solid #2d4a3e" },
    btnDanger: { background: "#7a1f1f" },
    btnWide: { width: "100%", textAlign: "center" },
    btnPrimary: { background: "#2d6a4f", padding: "9px 20px", fontSize: 14 },

    layout: {
      display: "grid",
      gridTemplateColumns: "270px 1fr 220px",
      gap: 10, padding: 10,
    },
    panel: {
      background: "#fffdf5",
      border: "1px solid #e8dece",
      borderRadius: 12,
      padding: 12,
      minHeight: 580,
      display: "flex", flexDirection: "column", gap: 0,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    },
    sec: {
      paddingBottom: 12, marginBottom: 12,
      borderBottom: "1px dashed #e0d5c5",
    },
    secLabel: {
      fontSize: 10, color: "#8b7355", textTransform: "uppercase",
      letterSpacing: "0.1em", marginBottom: 7, fontWeight: 600,
    },
    phaseBadge: {
      display: "inline-block", background: "#f0e8d8",
      border: "1px solid #d4c4a8", borderRadius: 6,
      padding: "5px 10px", fontWeight: 700, fontSize: 14,
    },
    bigNumber: { fontSize: 36, fontWeight: 800, color: "#2d6a4f", lineHeight: 1 },
    hint: { fontSize: 12, color: "#8b7355", marginTop: 4 },
    selRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
    selLabel: { fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: "0.05em" },
    selVal: { fontWeight: 700, fontSize: 13 },
    diceRow: { marginTop: 10, display: "flex", flexDirection: "column", gap: 4 },
    diceGroup: { display: "flex", alignItems: "center", gap: 2 },
    colorDot: { width: 12, height: 12, borderRadius: "50%", flexShrink: 0 },
    scoreRow: { display: "flex", alignItems: "center", gap: 6, marginBottom: 5 },
    tips: { margin: "4px 0 0 16px", padding: 0, fontSize: 12, color: "#8b7355", lineHeight: 1.7 },

    boardWrap: {
      position: "relative", background: "#fffdf5",
      border: "1px solid #e8dece", borderRadius: 12,
      overflow: "hidden", minHeight: 580,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    },
    map: { display: "block", width: "100%", height: "100%" },

    rulesDrawer: {
      position: "absolute", right: 0, top: 0, bottom: 0,
      width: "min(500px, 100%)",
      background: "rgba(255,253,245,0.97)",
      borderLeft: "1px solid #e8dece",
      boxShadow: "-8px 0 20px rgba(0,0,0,0.06)",
      display: "flex", overflow: "hidden",
    },
    rulesInner: { padding: 16, overflowY: "auto", overflowX: "auto", flex: 1 },
    rulesH2: { fontFamily: "Georgia, serif", margin: "0 0 12px" },
    rulesH3: { fontFamily: "Georgia, serif", margin: "16px 0 6px", fontSize: 15 },

    log: {
      overflowY: "auto", maxHeight: 480,
      background: "#f5f0e8", borderRadius: 8,
      padding: 8, fontSize: 11, lineHeight: 1.55,
    },
    logLine: { marginBottom: 3, color: "#3a3328" },

    overlay: {
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
      display: "grid", placeItems: "center", zIndex: 20,
    },
    winnerCard: {
      background: "#fffdf5", borderRadius: 16,
      padding: "32px 40px", textAlign: "center",
      boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
      border: "2px solid #c4a882",
    },
    modal: {
      background: "#fffdf5", borderRadius: 14,
      padding: "24px 28px", width: "min(580px, 92vw)",
      boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      border: "1px solid #e8dece",
    },
    modalGrid: {
      display: "grid", gridTemplateColumns: "1fr 1fr",
      gap: "12px 20px",
    },
    modalLabel: {
      display: "flex", flexDirection: "column",
      fontSize: 13, gap: 6, fontWeight: 500,
    },
    input: {
      padding: "6px 10px", borderRadius: 7,
      border: "1px solid #d4c4a8", background: "#fffdf5",
      fontSize: 14,
    },
  };
}
