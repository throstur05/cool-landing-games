import { useState, useCallback, useRef, useEffect } from "react";

// ─── Math Helpers ──────────────────────────────────────────────────────────
function factorial(n) {
  if (n < 0 || !Number.isInteger(n) || n > 12) return Infinity;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function solve(nums, target) {
  const results = new Set();
  function go(arr, exprs) {
    if (arr.length === 1) {
      if (Math.abs(arr[0] - target) < 1e-9) results.add(exprs[0]);
      return;
    }
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length; j++) {
        if (i === j) continue;
        const rn = arr.filter((_, k) => k !== i && k !== j);
        const re = exprs.filter((_, k) => k !== i && k !== j);
        const [a, b, ea, eb] = [arr[i], arr[j], exprs[i], exprs[j]];
        const ops = [
          [a + b, `(${ea}+${eb})`],
          [a - b, `(${ea}-${eb})`],
          [a * b, `(${ea}*${eb})`],
          ...(b !== 0 ? [[a / b, `(${ea}/${eb})`]] : []),
          ...(a === Math.floor(a) && a >= 0 && a <= 12 ? [[factorial(a), `${ea}!`]] : []),
        ];
        for (const [v, e] of ops) {
          if (isFinite(v)) go([v, ...rn], [e, ...re]);
        }
      }
    }
  }
  go(nums, nums.map(String));
  return [...results];
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const DIFFS = {
  Easy:   { range: [1, 9],  label: "Easy",   desc: "1-9",  color: "#16a34a", bg: "rgba(22,163,74,0.1)" },
  Medium: { range: [1, 13], label: "Medium", desc: "1-13", color: "#d97706", bg: "rgba(217,119,6,0.1)" },
  Hard:   { range: [1, 20], label: "Hard",   desc: "1-20", color: "#dc2626", bg: "rgba(220,38,38,0.1)" },
};

// Load saved settings from localStorage
function loadSettings() {
  try {
    const s = localStorage.getItem("tf_settings");
    if (s) return JSON.parse(s);
  } catch {}
  return { diff: "Medium", target: 24, numCount: 4 };
}

function saveSettings(s) {
  try { localStorage.setItem("tf_settings", JSON.stringify(s)); } catch {}
}

function genNums(diff, target, count) {
  const [lo, hi] = DIFFS[diff].range;
  let nums, sols, tries = 0;
  do {
    nums = Array.from({ length: count }, () => randInt(lo, hi));
    sols = solve(nums, target);
    tries++;
  } while (sols.length === 0 && tries < 500);
  return { nums, sols };
}

function evalExpr(expr) {
  let s = expr.replace(/(\d+)!/g, (_, n) => factorial(Number(n)));
  s = s.replace(/x/g, "*").replace(/:/g, "/").replace(/\^/g, "**");
  try { return Function('"use strict"; return (' + s + ')')(); }
  catch { return null; }
}

// ─── Theme ────────────────────────────────────────────────────────────────
function theme(light) {
  return {
    pageBg:          light ? "#f1f5f9"   : "#080c14",
    pageGrad:        light
      ? "radial-gradient(ellipse at 30% 0%, #e0f2fe 0%, transparent 55%), radial-gradient(ellipse at 70% 100%, #ede9fe 0%, transparent 55%)"
      : "radial-gradient(ellipse at 30% 0%, #0f1e3a 0%, transparent 55%), radial-gradient(ellipse at 70% 100%, #1a0f2e 0%, transparent 55%)",
    cardBg:          light ? "#ffffff"   : "rgba(255,255,255,0.03)",
    cardBorder:      light ? "#e2e8f0"   : "rgba(255,255,255,0.07)",
    cardShadow:      light ? "0 8px 40px rgba(0,0,0,0.08)" : "0 8px 40px rgba(0,0,0,0.4)",
    titleColor:      light ? "#0f172a"   : "#f1f5f9",
    subtitleColor:   light ? "#475569"   : "#64748b",
    taglineColor:    light ? "#94a3b8"   : "#475569",
    labelColor:      light ? "#64748b"   : "#475569",
    textMuted:       light ? "#64748b"   : "#64748b",
    inputBg:         light ? "#f8fafc"   : "rgba(0,0,0,0.3)",
    inputBorder:     light ? "#cbd5e1"   : "rgba(255,255,255,0.15)",
    inputColor:      light ? "#d97706"   : "#f59e0b",
    exprBg:          light ? "#f8fafc"   : "rgba(0,0,0,0.35)",
    exprBorder:      light ? "#e2e8f0"   : "rgba(255,255,255,0.1)",
    exprText:        light ? "#1e293b"   : "#e2e8f0",
    exprPlaceholder: light ? "#cbd5e1"   : "#334155",
    opBg:            light ? "#f1f5f9"   : "rgba(255,255,255,0.04)",
    opBorder:        light ? "#e2e8f0"   : "rgba(255,255,255,0.09)",
    opColor:         light ? "#475569"   : "#94a3b8",
    iconBg:          light ? "#f1f5f9"   : "rgba(255,255,255,0.05)",
    iconBorder:      light ? "#e2e8f0"   : "rgba(255,255,255,0.1)",
    iconColor:       light ? "#64748b"   : "#94a3b8",
    statBg:          light ? "#f8fafc"   : "rgba(255,255,255,0.04)",
    statBorder:      light ? "#e2e8f0"   : "rgba(255,255,255,0.07)",
    statVal:         light ? "#d97706"   : "#f59e0b",
    chipBg:          light ? "#f1f5f9"   : "rgba(255,255,255,0.05)",
    chipBorder:      light ? "#e2e8f0"   : "rgba(255,255,255,0.1)",
    chipColor:       light ? "#64748b"   : "#94a3b8",
    skipColor:       light ? "#94a3b8"   : "#475569",
    solItemColor:    light ? "#7c3aed"   : "#a78bfa",
    solItemBgAlt:    light ? "#f8fafc"   : "rgba(255,255,255,0.02)",
    solItemBorder:   light ? "#e2e8f0"   : "rgba(255,255,255,0.04)",
    solCountColor:   light ? "#94a3b8"   : "#64748b",
    streakColor:     light ? "#64748b"   : "#64748b",
    scoreColor:      light ? "#d97706"   : "#f59e0b",
    targetColor:     light ? "#d97706"   : "#f59e0b",
    targetShadow:    light ? "0 0 20px rgba(217,119,6,0.25)" : "0 0 30px rgba(245,158,11,0.5)",
    toggleBg:        light ? "#1e293b"   : "#f1f5f9",
    toggleColor:     light ? "#f1f5f9"   : "#1e293b",
    diffBorderOff:   light ? "#e2e8f0"   : "rgba(255,255,255,0.08)",
    diffColorOff:    light ? "#94a3b8"   : "#64748b",
    divider:         light ? "#e2e8f0"   : "rgba(255,255,255,0.07)",
    savedBadge:      light ? "#dcfce7"   : "rgba(22,163,74,0.15)",
    savedBadgeText:  light ? "#16a34a"   : "#4ade80",
  };
}

function makeCss(light) {
  return `
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
    @keyframes shake { 0%,100%{transform:translateX(0)} 25%,75%{transform:translateX(-7px)} 50%{transform:translateX(7px)} }
    @keyframes fadeInUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    @keyframes savedPop { 0%{opacity:0;transform:scale(0.8)} 60%{transform:scale(1.1)} 100%{opacity:1;transform:scale(1)} }
    .shake { animation: shake 0.35s ease; }
    .fade-up { animation: fadeInUp 0.25s ease; }
    .saved-pop { animation: savedPop 0.3s ease; }
    .num-tile:hover { transform: translateY(-3px) scale(1.05) !important; }
    .num-tile:active { transform: scale(0.92) !important; }
    .op-btn:hover { background: ${light ? "rgba(217,119,6,0.1)" : "rgba(245,158,11,0.12)"} !important; border-color: ${light ? "rgba(217,119,6,0.5)" : "rgba(245,158,11,0.4)"} !important; color: #d97706 !important; }
    .op-btn:active { transform: scale(0.9); }
    .check-btn:hover { filter: brightness(1.08); transform: translateY(-1px); }
    .check-btn:active { transform: scale(0.97); }
    .start-btn:hover { filter: brightness(1.08); transform: translateY(-1px); }
    .start-btn:active { transform: scale(0.97); }
    .icon-btn:hover { background: ${light ? "#e2e8f0" : "rgba(255,255,255,0.1)"} !important; color: ${light ? "#1e293b" : "#e2e8f0"} !important; }
    .chip:hover { opacity: 0.8; }
    .diff-btn:hover { opacity: 0.85; }
    .count-btn:hover { opacity: 0.85; }
    .apply-btn:hover { filter: brightness(1.08); transform: translateY(-1px); }
    .apply-btn:active { transform: scale(0.97); }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-thumb { background: rgba(245,158,11,0.4); border-radius: 3px; }
  `;
}

// ─── Component ────────────────────────────────────────────────────────────
export default function App({ onQuit }) {
  const saved = loadSettings();

  // ── Applied (live) settings ──
  const [light, setLight]       = useState(true);
  const [diff, setDiff]         = useState(saved.diff);
  const [target, setTarget]     = useState(saved.target);
  const [numCount, setNumCount] = useState(saved.numCount);

  // ── Draft settings (staged in setup panel, not yet applied) ──
  const [draftDiff, setDraftDiff]           = useState(saved.diff);
  const [draftTarget, setDraftTarget]       = useState(saved.target);
  const [draftTargetInput, setDraftTargetInput] = useState(String(saved.target));
  const [draftCustomTarget, setDraftCustomTarget] = useState(false);
  const [draftNumCount, setDraftNumCount]   = useState(saved.numCount);
  const [draftCustomCount, setDraftCustomCount] = useState(false);
  const [draftCustomCountInput, setDraftCustomCountInput] = useState(String(saved.numCount));
  const [targetError, setTargetError]       = useState("");
  const [countError, setCountError]         = useState("");
  const [settingsSaved, setSettingsSaved]   = useState(false);

  // ── Game state ──
  const [screen, setScreen]   = useState("setup");
  const [nums, setNums]       = useState([]);
  const [sols, setSols]       = useState([]);
  const [expr, setExpr]       = useState("");
  const [feedback, setFeedback] = useState(null);
  const [shake, setShake]     = useState(false);
  const [solved, setSolved]   = useState(false);
  const [score, setScore]     = useState(0);
  const [streak, setStreak]   = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [roundsWon, setRoundsWon]     = useState(0);
  const solsRef = useRef(null);

  const t = theme(light);

  // ── Apply & save settings ──────────────────────────────────────
  const applySettings = useCallback(() => {
    // Validate target
    let finalTarget = draftTarget;
    if (draftCustomTarget) {
      const n = parseInt(draftTargetInput);
      if (isNaN(n) || n < 1 || n > 9999) { setTargetError("Enter 1–9999"); return; }
      finalTarget = n;
    }
    setTargetError("");

    // Validate count
    let finalCount = draftNumCount;
    if (draftCustomCount) {
      const c = parseInt(draftCustomCountInput);
      if (isNaN(c) || c < 2 || c > 8) { setCountError("Enter 2–8"); return; }
      finalCount = c;
    }
    setCountError("");

    setDiff(draftDiff);
    setTarget(finalTarget);
    setNumCount(finalCount);
    saveSettings({ diff: draftDiff, target: finalTarget, numCount: finalCount });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 1800);
  }, [draftDiff, draftTarget, draftCustomTarget, draftTargetInput, draftNumCount, draftCustomCount, draftCustomCountInput]);

  // ── Game logic ─────────────────────────────────────────────────
  const startGame = useCallback(() => {
    const { nums: n, sols: s } = genNums(diff, target, numCount);
    setNums(n); setSols(s); setExpr(""); setFeedback(null); setSolved(false); setScreen("game");
  }, [diff, target, numCount]);

  const newRound = useCallback(() => {
    const { nums: n, sols: s } = genNums(diff, target, numCount);
    setNums(n); setSols(s); setExpr(""); setFeedback(null); setSolved(false); setScreen("game");
  }, [diff, target, numCount]);

  const appendToExpr = (ch) => { if (solved) return; setExpr(e => e + ch); setFeedback(null); };
  const backspace = () => { setExpr(e => e.slice(0, -1)); setFeedback(null); };
  const clearExpr = () => { setExpr(""); setFeedback(null); };

  const checkAnswer = useCallback(() => {
    if (!expr.trim() || solved) return;
    const used = (expr.match(/\d+/g) || []).map(Number);
    const pool = [...nums];
    let valid = true;
    for (const n of used) {
      const idx = pool.indexOf(n);
      if (idx === -1) { valid = false; break; }
      pool.splice(idx, 1);
    }
    if (!valid) { setFeedback({ ok: false, msg: "Use only the given numbers!" }); setShake(true); setTimeout(() => setShake(false), 400); return; }
    const result = evalExpr(expr);
    if (result === null) { setFeedback({ ok: false, msg: "Invalid expression" }); setShake(true); setTimeout(() => setShake(false), 400); return; }
    if (Math.abs(result - target) < 1e-9) {
      const pts = 10 + streak * 3;
      setScore(s => s + pts);
      setStreak(s => { const ns = s + 1; setBestStreak(b => Math.max(b, ns)); return ns; });
      setRoundsWon(r => r + 1); setRoundsPlayed(r => r + 1); setSolved(true);
      setFeedback({ ok: true, msg: `Correct! +${pts} pts` });
    } else {
      setFeedback({ ok: false, msg: `= ${result.toFixed(result % 1 === 0 ? 0 : 4)} != ${target}` });
      setShake(true); setTimeout(() => setShake(false), 400);
    }
  }, [expr, nums, target, streak, solved]);

  useEffect(() => {
    if (screen !== "game") return;
    const handler = (e) => {
      if (e.key === "Enter") checkAnswer();
      else if (e.key === "Backspace") backspace();
      else if (e.key === "Escape") clearExpr();
      else if (/^[\d+\-*/().!^]$/.test(e.key)) appendToExpr(e.key);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [screen, checkAnswer]);

  const skipRound = () => { setStreak(0); setRoundsPlayed(r => r + 1); newRound(); };
  const dc = DIFFS[diff].color;

  // ── Shared styles ──────────────────────────────────────────────
  const pageStyle = {
    minHeight: "100vh", background: t.pageBg, backgroundImage: t.pageGrad,
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "20px 16px", fontFamily: "'DM Sans', sans-serif", transition: "background 0.3s",
  };
  const cardStyle = {
    width: "100%", maxWidth: 480, background: t.cardBg, border: `1px solid ${t.cardBorder}`,
    borderRadius: 28, padding: "28px 24px", backdropFilter: "blur(24px)",
    boxShadow: t.cardShadow, transition: "background 0.3s, border-color 0.3s",
  };
  const iconBtnStyle = {
    background: t.iconBg, border: `1px solid ${t.iconBorder}`, color: t.iconColor,
    borderRadius: 10, cursor: "pointer", fontSize: 16, transition: "all 0.15s",
    display: "flex", alignItems: "center", justifyContent: "center",
  };
  const labelStyle = { display: "block", fontSize: 10, letterSpacing: 4, color: t.labelColor, marginBottom: 10 };
  const sectionStyle = { marginBottom: 20 };
  const dividerStyle = { height: 1, background: t.divider, margin: "20px 0" };

  const ToggleBtn = () => (
    <button onClick={() => setLight(l => !l)} title={light ? "Dark mode" : "Light mode"} style={{
      width: 36, height: 36, borderRadius: 18,
      background: t.toggleBg, color: t.toggleColor, border: "none",
      cursor: "pointer", fontSize: 16,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)", transition: "all 0.25s", flexShrink: 0,
    }}>{light ? "🌙" : "☀️"}</button>
  );

  const toggleBtnEl = (
    <button onClick={() => setLight(l => !l)} title={light ? "Dark mode" : "Light mode"} style={{
      width: 36, height: 36, borderRadius: 18,
      background: t.toggleBg, color: t.toggleColor, border: "none",
      cursor: "pointer", fontSize: 16,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)", transition: "all 0.25s", flexShrink: 0,
    }}>{light ? "🌙" : "☀️"}</button>
  );

  // ── TARGET presets ─────────────────────────────────────────────
  const TARGET_PRESETS = [10, 24, 42, 100];
  const COUNT_PRESETS = [3, 4, 5];

  // ════════════════════════════════════════════════════════════════
  // SETUP SCREEN
  // ════════════════════════════════════════════════════════════════
  if (screen === "setup") return (
    <div style={pageStyle}>
      <style>{makeCss(light)}</style>
      <div style={cardStyle}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 5, color: t.taglineColor, marginBottom: 4 }}>MATH PUZZLE GAME</div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(24px,5vw,38px)", margin: "4px 0 0", color: t.titleColor, lineHeight: 1.1 }}>
              Twenty Four<br/><span style={{ color: t.targetColor }}>Game</span>
            </h1>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {onQuit && (
              <button onClick={onQuit} className="icon-btn" title="Back to menu" style={{ ...iconBtnStyle, width: 36, height: 36, fontSize: 14 }}>✕</button>
            )}
            {toggleBtnEl}
          </div>
        </div>

        <div style={dividerStyle} />

        {/* ── TARGET NUMBER ── */}
        <div style={sectionStyle}>
          <label style={labelStyle}>🎯 TARGET NUMBER</label>
          {/* Preset chips */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            {TARGET_PRESETS.map(n => (
              <button key={n} className="chip" onClick={() => { setDraftTarget(n); setDraftCustomTarget(false); setTargetError(""); }} style={{
                padding: "8px 16px", borderRadius: 10, cursor: "pointer",
                fontSize: 14, fontFamily: "'DM Mono', monospace", transition: "all 0.15s",
                fontWeight: (!draftCustomTarget && draftTarget === n) ? 700 : 400,
                background: (!draftCustomTarget && draftTarget === n) ? `${t.targetColor}22` : t.chipBg,
                border: `2px solid ${(!draftCustomTarget && draftTarget === n) ? t.targetColor : t.chipBorder}`,
                color: (!draftCustomTarget && draftTarget === n) ? t.targetColor : t.chipColor,
              }}>{n}</button>
            ))}
            {/* Custom chip */}
            <button className="chip" onClick={() => { setDraftCustomTarget(true); }} style={{
              padding: "8px 16px", borderRadius: 10, cursor: "pointer",
              fontSize: 14, fontFamily: "'DM Mono', monospace", transition: "all 0.15s",
              fontWeight: draftCustomTarget ? 700 : 400,
              background: draftCustomTarget ? `${t.targetColor}22` : t.chipBg,
              border: `2px solid ${draftCustomTarget ? t.targetColor : t.chipBorder}`,
              color: draftCustomTarget ? t.targetColor : t.chipColor,
            }}>Custom</button>
          </div>
          {/* Custom input */}
          {draftCustomTarget && (
            <div className="fade-up" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="number" min={1} max={9999} placeholder="e.g. 36"
                value={draftTargetInput}
                onChange={e => { setDraftTargetInput(e.target.value); setTargetError(""); }}
                autoFocus
                style={{
                  width: 110, height: 44, background: t.inputBg,
                  border: `2px solid ${targetError ? "#dc2626" : t.inputBorder}`,
                  borderRadius: 10, color: t.inputColor,
                  fontFamily: "'DM Serif Display', serif", fontSize: 22,
                  textAlign: "center", outline: "none", transition: "border-color 0.2s",
                }}
              />
              <span style={{ fontSize: 12, color: t.textMuted, fontFamily: "'DM Mono', monospace" }}>1 – 9999</span>
            </div>
          )}
          {targetError && <div style={{ color: "#dc2626", fontSize: 12, marginTop: 6 }}>{targetError}</div>}
        </div>

        {/* ── NUMBER COUNT ── */}
        <div style={sectionStyle}>
          <label style={labelStyle}>🔢 NUMBER OF CARDS</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {COUNT_PRESETS.map(c => (
              <button key={c} className="count-btn" onClick={() => { setDraftNumCount(c); setDraftCustomCount(false); setCountError(""); }} style={{
                padding: "8px 20px", borderRadius: 10, cursor: "pointer",
                fontSize: 14, fontFamily: "'DM Mono', monospace", transition: "all 0.15s",
                fontWeight: (!draftCustomCount && draftNumCount === c) ? 700 : 400,
                background: (!draftCustomCount && draftNumCount === c) ? `${t.targetColor}22` : t.chipBg,
                border: `2px solid ${(!draftCustomCount && draftNumCount === c) ? t.targetColor : t.chipBorder}`,
                color: (!draftCustomCount && draftNumCount === c) ? t.targetColor : t.chipColor,
              }}>{c}</button>
            ))}
            <button className="count-btn" onClick={() => setDraftCustomCount(true)} style={{
              padding: "8px 20px", borderRadius: 10, cursor: "pointer",
              fontSize: 14, fontFamily: "'DM Mono', monospace", transition: "all 0.15s",
              fontWeight: draftCustomCount ? 700 : 400,
              background: draftCustomCount ? `${t.targetColor}22` : t.chipBg,
              border: `2px solid ${draftCustomCount ? t.targetColor : t.chipBorder}`,
              color: draftCustomCount ? t.targetColor : t.chipColor,
            }}>Custom</button>
          </div>
          {draftCustomCount && (
            <div className="fade-up" style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
              <input
                type="number" min={2} max={8} placeholder="2-8"
                value={draftCustomCountInput}
                onChange={e => { setDraftCustomCountInput(e.target.value); setCountError(""); }}
                autoFocus
                style={{
                  width: 90, height: 44, background: t.inputBg,
                  border: `2px solid ${countError ? "#dc2626" : t.inputBorder}`,
                  borderRadius: 10, color: t.inputColor,
                  fontFamily: "'DM Serif Display', serif", fontSize: 22,
                  textAlign: "center", outline: "none",
                }}
              />
              <span style={{ fontSize: 12, color: t.textMuted, fontFamily: "'DM Mono', monospace" }}>2 – 8 numbers</span>
            </div>
          )}
          {countError && <div style={{ color: "#dc2626", fontSize: 12, marginTop: 6 }}>{countError}</div>}
        </div>

        {/* ── DIFFICULTY ── */}
        <div style={sectionStyle}>
          <label style={labelStyle}>⚡ DIFFICULTY (NUMBER RANGE)</label>
          <div style={{ display: "flex", gap: 8 }}>
            {Object.entries(DIFFS).map(([key, cfg]) => (
              <button key={key} className="diff-btn" onClick={() => setDraftDiff(key)} style={{
                flex: 1, padding: "10px 0", borderRadius: 12, cursor: "pointer", transition: "all 0.2s",
                border: `2px solid ${draftDiff === key ? cfg.color : t.diffBorderOff}`,
                background: draftDiff === key ? cfg.bg : "transparent",
                color: draftDiff === key ? cfg.color : t.diffColorOff, fontFamily: "'DM Mono', monospace",
              }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{cfg.label}</div>
                <div style={{ fontSize: 10, marginTop: 2, opacity: 0.7 }}>{cfg.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={dividerStyle} />

        {/* ── APPLY + saved badge ── */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
          <button className="apply-btn" onClick={applySettings} style={{
            flex: 1, height: 46,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#fff", border: "none", borderRadius: 12,
            fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 13, letterSpacing: 2,
            cursor: "pointer", boxShadow: "0 4px 18px rgba(99,102,241,0.35)", transition: "all 0.2s",
          }}>APPLY SETTINGS ✓</button>
          {settingsSaved && (
            <div className="saved-pop" style={{
              padding: "8px 14px", borderRadius: 10, fontSize: 12,
              background: t.savedBadge, color: t.savedBadgeText,
              fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap",
            }}>Saved!</div>
          )}
        </div>

        {/* Active settings summary */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            ["Target", target],
            ["Cards", numCount],
            ["Range", DIFFS[diff].desc],
          ].map(([l, v]) => (
            <div key={l} style={{ flex: 1, minWidth: 70, background: t.statBg, border: `1px solid ${t.statBorder}`, borderRadius: 10, padding: "8px", textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: t.statVal, fontFamily: "'DM Serif Display', serif" }}>{v}</div>
              <div style={{ fontSize: 9, color: t.textMuted, letterSpacing: 2 }}>{l.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {/* Score stats row */}
        {roundsPlayed > 0 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {[["Score", score], ["Streak", streak], ["Won", `${roundsWon}/${roundsPlayed}`]].map(([l, v]) => (
              <div key={l} style={{ flex: 1, background: t.statBg, border: `1px solid ${t.statBorder}`, borderRadius: 10, padding: "8px", textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: t.scoreColor }}>{v}</div>
                <div style={{ fontSize: 9, color: t.textMuted, letterSpacing: 2 }}>{l.toUpperCase()}</div>
              </div>
            ))}
          </div>
        )}

        <button className="start-btn" onClick={startGame} style={{
          width: "100%", height: 52, background: "linear-gradient(135deg, #f59e0b, #d97706)",
          color: "#fff", border: "none", borderRadius: 14, fontFamily: "'DM Mono', monospace",
          fontWeight: 700, fontSize: 15, letterSpacing: 2, cursor: "pointer",
          boxShadow: "0 6px 28px rgba(245,158,11,0.35)", transition: "all 0.2s",
        }}>{roundsPlayed > 0 ? "NEW GAME" : "START GAME"} →</button>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════
  // SOLUTIONS SCREEN
  // ════════════════════════════════════════════════════════════════
  if (screen === "solutions") return (
    <div style={pageStyle}>
      <style>{makeCss(light)}</style>
      <div style={{ ...cardStyle, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 5, color: t.taglineColor, marginBottom: 4 }}>SOLUTIONS</div>
            <h2 style={{ margin: 0, fontFamily: "'DM Serif Display', serif", fontSize: 22, color: t.titleColor }}>
              [{nums.join(", ")}] → {target}
            </h2>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {toggleBtnEl}
            <button className="icon-btn" onClick={() => setScreen("game")} style={{ ...iconBtnStyle, width: 38, height: 38 }}>✕</button>
          </div>
        </div>
        <div style={{ fontSize: 12, color: t.solCountColor, marginBottom: 12 }}>{sols.length} solution{sols.length !== 1 ? "s" : ""} found</div>
        <div style={{ overflowY: "auto", flex: 1 }} ref={solsRef}>
          {sols.length === 0
            ? <div style={{ color: "#dc2626", padding: 16 }}>No solutions exist for this puzzle!</div>
            : sols.map((s, i) => (
              <div key={i} style={{
                padding: "8px 12px", fontFamily: "'DM Mono', monospace", fontSize: 13, color: t.solItemColor,
                borderBottom: `1px solid ${t.solItemBorder}`,
                background: i % 2 === 0 ? t.solItemBgAlt : "transparent", borderRadius: 6,
              }}>{s}</div>
            ))}
        </div>
        <button className="start-btn" onClick={() => setScreen("game")} style={{
          width: "100%", height: 46, marginTop: 16, background: "linear-gradient(135deg, #f59e0b, #d97706)",
          color: "#fff", border: "none", borderRadius: 12, fontFamily: "'DM Mono', monospace",
          fontWeight: 700, fontSize: 13, letterSpacing: 2, cursor: "pointer",
          boxShadow: "0 4px 20px rgba(245,158,11,0.3)", transition: "all 0.2s",
        }}>← BACK TO GAME</button>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════
  // GAME SCREEN
  // ════════════════════════════════════════════════════════════════
  // Tile sizing: shrink tiles for more numbers
  const tileSize = numCount <= 4 ? 68 : numCount === 5 ? 58 : 50;
  const tileFontSize = numCount <= 4 ? 28 : numCount === 5 ? 22 : 18;

  return (
    <div style={pageStyle}>
      <style>{makeCss(light)}</style>
      <div style={cardStyle}>

        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="icon-btn" onClick={() => setScreen("setup")} style={{ ...iconBtnStyle, width: 38, height: 38, fontSize: 15 }} title="Settings">⚙</button>
            {onQuit && (
              <button className="icon-btn" onClick={onQuit} style={{ ...iconBtnStyle, width: 38, height: 38, fontSize: 13 }} title="Back to menu">✕</button>
            )}
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 9, letterSpacing: 5, color: t.taglineColor, marginBottom: 2 }}>TARGET</div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 40, lineHeight: 1, color: t.targetColor, textShadow: t.targetShadow }}>{target}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
            {toggleBtnEl}
            <div style={{ fontSize: 11, color: t.streakColor }}>🔥 {streak} streak</div>
            <div style={{ fontSize: 11, color: t.scoreColor }}>◆ {score} pts</div>
          </div>
        </div>

        {/* Difficulty / settings badge */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <span style={{
            background: DIFFS[diff].bg, color: dc,
            border: `1px solid ${dc}44`, borderRadius: 20,
            padding: "3px 12px", fontSize: 10, fontFamily: "'DM Mono', monospace", letterSpacing: 2,
          }}>{diff.toUpperCase()} • {numCount} CARDS • TARGET {target}</span>
        </div>

        {/* Number tiles */}
        <div style={{ display: "flex", gap: numCount > 5 ? 6 : 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 20 }}>
          {nums.map((n, i) => (
            <button key={i} className="num-tile" onClick={() => appendToExpr(String(n))} style={{
              width: tileSize, height: tileSize,
              background: `linear-gradient(135deg, ${dc}20, ${dc}08)`,
              border: `2px solid ${dc}66`, borderRadius: 16,
              fontSize: tileFontSize, fontFamily: "'DM Serif Display', serif",
              color: dc, cursor: "pointer",
              boxShadow: `0 4px 16px ${dc}22`, transition: "all 0.15s",
            }}>{n}</button>
          ))}
        </div>

        {/* Expression */}
        <div className={shake ? "shake" : ""} style={{
          minHeight: 56, background: t.exprBg,
          border: `2px solid ${feedback ? (feedback.ok ? "#16a34a55" : "#dc262655") : t.exprBorder}`,
          borderRadius: 14, padding: "10px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 8, transition: "border-color 0.3s, background 0.3s",
        }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 20, color: t.exprText, flex: 1, wordBreak: "break-all" }}>
            {expr || <span style={{ color: t.exprPlaceholder, fontSize: 14 }}>tap numbers & operators…</span>}
          </span>
          {expr && <button className="icon-btn" onClick={backspace} style={{ ...iconBtnStyle, width: 30, height: 30, fontSize: 14, marginLeft: 8 }}>⌫</button>}
        </div>

        {/* Feedback */}
        <div style={{ minHeight: 30, marginBottom: 8, textAlign: "center" }}>
          {feedback && (
            <div className="fade-up" style={{
              display: "inline-block", padding: "5px 14px",
              background: feedback.ok ? "rgba(22,163,74,0.12)" : "rgba(220,38,38,0.1)",
              color: feedback.ok ? "#16a34a" : "#dc2626",
              border: `1px solid ${feedback.ok ? "#16a34a30" : "#dc262630"}`,
              borderRadius: 20, fontSize: 13, fontFamily: "'DM Mono', monospace",
            }}>{feedback.msg}</div>
          )}
        </div>

        {/* Operators */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 7, marginBottom: 10 }}>
          {["+", "−", "×", "÷", "!", "^", "(", ")"].map(op => (
            <button key={op} className="op-btn" onClick={() => { const map = {"−":"-","×":"*","÷":"/"}; appendToExpr(map[op] || op); }} style={{
              height: 42, background: t.opBg, border: `1px solid ${t.opBorder}`, borderRadius: 10,
              color: t.opColor, fontSize: 17, cursor: "pointer",
              fontFamily: "'DM Serif Display', serif", transition: "all 0.15s",
            }}>{op}</button>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          {!solved ? (
            <>
              <button className="icon-btn" onClick={clearExpr} style={{ ...iconBtnStyle, width: 46, height: 46, fontSize: 11, fontFamily: "'DM Mono', monospace" }}>CLR</button>
              <button className="check-btn" onClick={checkAnswer} style={{
                flex: 1, height: 46, background: "linear-gradient(135deg, #f59e0b, #d97706)",
                color: "#fff", border: "none", borderRadius: 12, fontFamily: "'DM Mono', monospace",
                fontWeight: 700, fontSize: 13, letterSpacing: 2, cursor: "pointer",
                boxShadow: "0 4px 20px rgba(245,158,11,0.3)", transition: "all 0.2s",
              }}>CHECK ↵</button>
              <button className="icon-btn" onClick={() => setScreen("solutions")} style={{ ...iconBtnStyle, width: 46, height: 46, fontSize: 11, fontFamily: "'DM Mono', monospace" }}>SOL</button>
            </>
          ) : (
            <>
              <button className="check-btn" onClick={newRound} style={{
                flex: 1, height: 46, background: "linear-gradient(135deg, #16a34a, #059669)",
                color: "#fff", border: "none", borderRadius: 12, fontFamily: "'DM Mono', monospace",
                fontWeight: 700, fontSize: 13, letterSpacing: 2, cursor: "pointer",
                boxShadow: "0 4px 20px rgba(22,163,74,0.3)", transition: "all 0.2s",
              }}>NEXT ROUND →</button>
              <button className="icon-btn" onClick={() => setScreen("solutions")} style={{ ...iconBtnStyle, width: 46, height: 46, fontSize: 11, fontFamily: "'DM Mono', monospace" }}>SOL</button>
            </>
          )}
        </div>

        {!solved && (
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <button onClick={skipRound} style={{ background: "none", border: "none", color: t.skipColor, fontSize: 12, cursor: "pointer", fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
              skip this puzzle →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
