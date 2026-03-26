import { useState, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
   QUANTUM IMPACT TOOL  v1.0
   Select instrument · Roll D6 for intensity · Roll D6/D20 for strokes
   Full Harmonic Field ceremonial display
═══════════════════════════════════════════════════════════════ */

const INSTRUMENTS = {
  CANE: {
    id: "CANE",
    name: "Cane",
    glyph: "|",
    color: "#6d4c41",
    accent: "#a1887f",
    light: "#efebe9",
    desc: "Precision · Single point · Clarity through sensation",
    cards: [
      { phase: 1, name: "The Strike",          power: 7, breath: "Exhale",                action: "Single firm strike",             field: "Opens the field with precision. One clear signal enters the nervous system along a single line. The exhale opens into the contact." },
      { phase: 2, name: "The Echo",             power: 6, breath: "Inhale",                action: "Stillness — feel the echo",      field: "The signal travels its pathway. The body reports back what just happened. Memory begins to encode at the point of contact." },
      { phase: 3, name: "The Recoil",           power: 5, breath: "Short inhale, hold",    action: "Pause — body contracts",         field: "Involuntary contraction. Not resistance — biology. The breath pulls away from the impact site before it can return." },
      { phase: 4, name: "The Stillness",        power: 5, breath: "Suspension",            action: "Complete stillness",             field: "The breath pauses between the strike's signal and the next breath. Silence between lightning and thunder." },
      { phase: 5, name: "The Spiral",           power: 6, breath: "Slow inhale",           action: "Breathe through the memory",     field: "Memory loops along the same pathway the signal traveled. The cane's spiral is clean and linear — one line, repeating." },
      { phase: 6, name: "The Mirror",           power: 6, breath: "Exhale with awareness", action: "Eye contact — reflect",          field: "The precision of impact means neither party can pretend otherwise. Both see the same clear signal reflected between them." },
      { phase: 7, name: "The Collapse",         power: 6, breath: "Long exhale",           action: "Release the bracing",            field: "The scaffolding held against impact — anticipatory tension, bracing — releases. Localized and clean." },
      { phase: 8, name: "The Integration",      power: 7, breath: "Full breath cycle",     action: "Rest — feel the coherence",      field: "The nervous system reorganizes around a clear memory. Coherence restored after a precise signal. Power through clarity." },
      { phase: 9, name: "The Rebirth",          power: 8, breath: "Deep inhale, slow exhale", action: "New geometry established",   field: "The body that emerges has a different nervous system map. The impact sites are alive, present, permanently encoded." },
    ],
  },
  TAWSE: {
    id: "TAWSE",
    name: "Tawse",
    glyph: "≡",
    color: "#4e342e",
    accent: "#8d6e63",
    light: "#efebe9",
    desc: "Duality · Split breath · Two signals simultaneously",
    cards: [
      { phase: 1, name: "The Split Breath",        power: 6, breath: "Inhale splits",           action: "First contact — two tines land",  field: "The field receives two simultaneous signals. Neither is as clean as a single line. The breath splits — the nervous system must hold two truths at once." },
      { phase: 2, name: "The Echo of Division",    power: 6, breath: "Inhale — draw both in",   action: "Stillness — sense both echoes",   field: "The echo travels two pathways simultaneously. The body remembers two points of contact as two separate timelines of sensation." },
      { phase: 3, name: "The Recoil of Memory",    power: 5, breath: "Asymmetric hold",         action: "Asymmetric contraction",          field: "The two impact points contract the breath unevenly. The body pulls away from two sources at once — complex, multi-directional." },
      { phase: 4, name: "The Stillness Between",   power: 5, breath: "The space between",       action: "Find the stillness between poles", field: "The stillness exists inside duality rather than after it. A stillness held between the two tines' simultaneous signals." },
      { phase: 5, name: "The Spiral of Duality",   power: 6, breath: "Looping inhale/exhale",   action: "Breathe through both pathways",   field: "Memory loops through two channels. The spiral carries both imprints, weaving them together until they begin to integrate." },
      { phase: 6, name: "The Mirror of the Split", power: 6, breath: "Exhale — release",        action: "See yourself in the other",       field: "To witness split impact from outside requires holding two perspectives simultaneously. The breath of genuine empathy." },
      { phase: 7, name: "The Collapse of Symmetry",power: 6, breath: "Long releasing exhale",   action: "Stop holding symmetry",           field: "The body's attempt to hold two impacts symmetrically breaks. The asymmetry is admitted. Structure releases." },
      { phase: 8, name: "The Integration of Two",  power: 7, breath: "Full unified breath",     action: "Feel the union",                  field: "Two streams finally meeting and merging into a single coherent field. Duality resolved into wholeness through breath." },
      { phase: 9, name: "The Rebirth of the Mirror",power: 8, breath: "Deep inhale, long exhale", action: "New mirror geometry",           field: "The new geometry holds duality as wholeness. The body can now experience two simultaneous truths as one unified field." },
    ],
  },
  BELT: {
    id: "BELT",
    name: "Belt",
    glyph: "◯",
    color: "#3e2723",
    accent: "#6d4c41",
    light: "#fbe9e7",
    desc: "Containment · Sovereignty · Breath inside boundaries",
    cards: [
      { phase: 1, name: "The Encircling Breath",    power: 6, breath: "Inhale into boundary",   action: "Belt wraps — boundary established", field: "Not a strike but an encirclement. The breath adjusts to the boundary rather than reacting to a signal. The field learns its container." },
      { phase: 2, name: "The Compression",          power: 6, breath: "Compressed inhale",      action: "Feel the pressure fully",            field: "Breath under pressure discovers its own stability. The paradox: containment can create inner strength. Breath compresses and becomes denser." },
      { phase: 3, name: "The Release",              power: 7, breath: "Explosive exhale",       action: "Resistance releases outward",        field: "When the belt comes off, the breath doesn't contract — it explodes outward. Freedom discovered through having known containment." },
      { phase: 4, name: "The Memory of Constriction",power:5, breath: "Careful, remembered",    action: "Hold the memory of boundary",        field: "The nervous system carries the imprint of the boundary even after release. The body remembers constraint as encoded geometry." },
      { phase: 5, name: "The Spiral of Containment",power: 6, breath: "Looping within limits",  action: "Spiral inside the remembered boundary", field: "The spiral doesn't expand freely — it loops within remembered limits. Each iteration finds the natural size of inner space." },
      { phase: 6, name: "The Mirror of the Belt",   power: 6, breath: "Honest exhale",          action: "See your relationship with boundary", field: "The mirror of containment reveals where the body resists boundaries and where it surrenders. Truth about sovereignty." },
      { phase: 7, name: "The Collapse of Control",  power: 6, breath: "Full releasing exhale",  action: "Release psychological scaffolding",   field: "The internal structure around containment — the management of being bounded — releases. Freedom from managing the experience." },
      { phase: 8, name: "The Integration of Freedom",power:7, breath: "Sovereign breath cycle", action: "Breathe with full sovereignty",       field: "Integrating what it means to be free after having been contained. Sovereignty — you know where you end and the world begins." },
      { phase: 9, name: "The Rebirth of Boundaries",power:8, breath: "Deep inhale, long exhale", action: "New geometry of sovereignty",        field: "The body that emerges knows its own boundaries from the inside. Sovereignty not as limitation but as self-knowledge." },
    ],
  },
  PADDLE: {
    id: "PADDLE",
    name: "Paddle",
    glyph: "▬",
    color: "#5d4037",
    accent: "#8d6e63",
    light: "#efebe9",
    desc: "Mass · Density · Embodiment through weight",
    cards: [
      { phase: 1, name: "The Solid Strike",         power: 7, breath: "Grounded exhale",        action: "Full surface contact — broad weight", field: "No single point. The paddle covers ground — broad, heavy, flat. The breath receives a weight, not a signal. The entire surface activates." },
      { phase: 2, name: "The Resonant Echo",        power: 6, breath: "Body inhale",            action: "Feel the resonance through tissue",   field: "The echo travels through the body — not along a nerve pathway but through muscle and tissue. Full-surface resonance." },
      { phase: 3, name: "The Recoil of Density",    power: 5, breath: "Slow pulling away",      action: "Body contracts from mass",            field: "Contraction from distributed mass is slower and broader than from precision. The body pulls away from weight, not a sharp signal." },
      { phase: 4, name: "The Stillness of Weight",  power: 5, breath: "Weight held in breath",  action: "Let the weight settle",               field: "Absorbed under mass. The breath pauses because weight has settled — not because a signal needs processing. The body simply holds it." },
      { phase: 5, name: "The Spiral of Compression",power: 6, breath: "Body-looping breath",    action: "Breathe through the body's memory",   field: "Memory loops through the body rather than a single pathway. The paddle's spiral is somatic — it lives in tissue, muscle, skin." },
      { phase: 6, name: "The Mirror of Mass",       power: 6, breath: "Grounded exhale",        action: "See your relationship with density",  field: "The mirror of mass reveals where the body holds against weight and where it absorbs. The truth of grounded embodiment." },
      { phase: 7, name: "The Collapse of Structure",power: 6, breath: "Full releasing exhale",  action: "Stop managing the mass",              field: "Under sustained broad impact the body stops managing and simply lets weight land. Structure collapses into full reception." },
      { phase: 8, name: "The Integration of Gravity",power:7, breath: "Gravity breath cycle",   action: "Breathe with gravity not against it",  field: "Integrating through gravity means finding groundedness rather than fighting weight. The body that moves with gravity not against it." },
      { phase: 9, name: "The Rebirth of Form",      power: 8, breath: "Deep embodied exhale",   action: "New geometry of presence in body",    field: "More form, not less. More present in physical existence, not removed from it. Embodiment as the destination of the arc." },
    ],
  },
  SLAP_ROUND: {
    id: "SLAP_ROUND",
    name: "Hand Slap Round",
    glyph: "⇌",
    color: "#b71c1c",
    accent: "#e53935",
    light: "#ffebee",
    desc: "Alternating polarity · Right then Left · Equilibrium through rhythm",
    cards: [
      { phase: 1, name: "The Right Hand of Initiation", power: 7, breath: "Exhale",                   action: "Firm slap — right hand",              field: "Opens the spiral with masculine force. The exhale opens into the strike. The right side is activated and encoded. One pole established." },
      { phase: 2, name: "The Left Hand of Reception",   power: 6, breath: "Inhale",                   action: "Firm slap — left hand",               field: "The left hand contains the spiral. The inhale draws the signal inward. Both poles now alive — the geometry of alternation is established." },
      { phase: 3, name: "The Alternating Spiral",       power: 6, breath: "Inhale-exhale-inhale",      action: "Right-left-right sequence",           field: "The rhythm establishes. The body tracks three signals across two sides with breath reversing. The spiral is in motion but not yet coherent." },
      { phase: 4, name: "The Mirror of Polarity",       power: 6, breath: "Shared stillness",         action: "Pause — mirror your partner's breath", field: "No slap. Both fields breathe together. The polarity dissolves into shared breath. The most intimate moment of the ceremony." },
      { phase: 5, name: "The Collapse of Resistance",   power: 6, breath: "Chaotic then still",       action: "Rapid alternating until breath breaks", field: "The scaffolding outpaced. The body stops managing. Breath breaks through. Chaotic release then sudden openness — the field widens." },
      { phase: 6, name: "The Breath of Symmetry",       power: 7, breath: "Balanced inhale/exhale",   action: "Slow synchronized slaps",             field: "One slap per breath cycle on an open field. Breath and impact move together. Coherence — everything moving in the same direction." },
      { phase: 7, name: "The Spiral of Repetition",     power: 6, breath: "Loop",                     action: "Repeat any previous action",          field: "The giver reads the receiver's field. Repetition continues until the nervous system has encoded the pattern and the breath settles." },
      { phase: 8, name: "The Rebirth of Equilibrium",   power: 8, breath: "Deep inhale, long exhale", action: "Both hands resting gently on partner", field: "The same hands that delivered every strike now rest without force. The deep inhale draws in the full ceremony. New geometry of presence." },
    ],
  },
};

const INTENSITY_LABELS = {
  1: { label: "Whisper", desc: "Barely there — breath of presence", color: "#90caf9" },
  2: { label: "Gentle",  desc: "Light — awakening the surface",     color: "#a5d6a7" },
  3: { label: "Present", desc: "Moderate — the body notices",       color: "#fff176" },
  4: { label: "Firm",    desc: "Solid — full contact and presence",  color: "#ffb74d" },
  5: { label: "Strong",  desc: "Deep — resonance through the field", color: "#ef9a9a" },
  6: { label: "Full",    desc: "Maximum — complete field activation", color: "#ce93d8" },
};

function rollDie(faces) {
  return Math.floor(Math.random() * faces) + 1;
}

function DiceDisplay({ value, faces, rolling }) {
  return (
    <div style={{
      width: 72, height: 72,
      background: rolling ? "linear-gradient(135deg,#1a1a2e,#2a1f3d)" : "linear-gradient(135deg,#2a1f3d,#4a3576)",
      border: `2px solid ${rolling ? "#7c5cbf" : "#9c7cd4"}`,
      borderRadius: faces === 20 ? "50%" : 14,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      boxShadow: rolling ? "0 0 20px #7c5cbf88" : "0 4px 16px rgba(0,0,0,0.4)",
      transition: "all 0.2s",
      fontFamily: "'Cinzel', serif",
    }}>
      <div style={{ fontSize: 26, fontWeight: 700, color: rolling ? "#c4b5fd" : "#fff", lineHeight: 1 }}>
        {rolling ? "?" : value ?? "—"}
      </div>
      <div style={{ fontSize: 9, color: "#a89cc8", marginTop: 2 }}>d{faces}</div>
    </div>
  );
}

function CardDisplay({ card, intensity, instrument }) {
  const intInfo = INTENSITY_LABELS[intensity] || INTENSITY_LABELS[3];
  const bars = Array.from({ length: 6 }, (_, i) => i < intensity);

  return (
    <div style={{
      background: `linear-gradient(135deg, ${instrument.light}, #fff)`,
      border: `2px solid ${instrument.color}`,
      borderRadius: 18,
      padding: "20px 24px",
      boxShadow: `0 8px 32px ${instrument.color}33`,
      animation: "cardReveal 0.4s ease",
    }}>
      {/* Phase badge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{
          background: instrument.color, color: "#fff",
          padding: "3px 12px", borderRadius: 99,
          fontSize: 11, fontFamily: "'Cinzel',serif", fontWeight: 700, letterSpacing: "0.06em",
        }}>
          Phase {card.phase} of {Object.values(INSTRUMENTS).find(i=>i.id===instrument.id)?.cards.length}
        </div>
        <div style={{ display: "flex", gap: 3 }}>
          {Array.from({length:8},(_,i)=>(
            <div key={i} style={{
              width: 8, height: 8, borderRadius: "50%",
              background: i < card.power ? instrument.color : "#e0d6d0",
              transition: "background 0.3s",
            }}/>
          ))}
        </div>
      </div>

      {/* Card name */}
      <div style={{
        fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700,
        color: instrument.color, marginBottom: 6, lineHeight: 1.2,
      }}>
        {card.name}
      </div>

      {/* Intensity bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 4 }}>
          {bars.map((filled, i) => (
            <div key={i} style={{
              width: 20, height: 8, borderRadius: 4,
              background: filled ? intInfo.color : "#e0d6d0",
            }}/>
          ))}
        </div>
        <span style={{ fontWeight: 700, color: instrument.color, fontSize: 13 }}>{intInfo.label}</span>
        <span style={{ fontSize: 12, color: "#888" }}>{intInfo.desc}</span>
      </div>

      {/* Three info blocks */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          { label: "ACTION", value: card.action, icon: "⚡" },
          { label: "BREATH", value: card.breath, icon: "○" },
          { label: "POWER", value: `P${card.power}`, icon: "◈" },
        ].map(({ label, value, icon }) => (
          <div key={label} style={{
            background: "#fff", border: `1px solid ${instrument.accent}44`,
            borderRadius: 10, padding: "10px 12px",
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: instrument.accent, letterSpacing: "0.08em", marginBottom: 4 }}>
              {icon} {label}
            </div>
            <div style={{ fontSize: 12, color: "#2a1f3d", fontWeight: 600, lineHeight: 1.4 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Field effect */}
      <div style={{
        background: `${instrument.color}11`,
        border: `1px solid ${instrument.color}33`,
        borderLeft: `4px solid ${instrument.color}`,
        borderRadius: "0 10px 10px 0",
        padding: "12px 16px",
      }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: instrument.accent, letterSpacing: "0.08em", marginBottom: 6 }}>
          ✦ FIELD EFFECT
        </div>
        <div style={{ fontSize: 13, color: "#2a1f3d", lineHeight: 1.7 }}>{card.field}</div>
      </div>
    </div>
  );
}

export default function QuantumImpactTool({ onQuit }) {
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [strokeDieFaces, setStrokeDieFaces] = useState(6);
  const [intensity, setIntensity] = useState(null);
  const [strokes, setStrokes] = useState(null);
  const [phase, setPhase] = useState(null); // which arc card
  const [rolling, setRolling] = useState(false);
  const [rolled, setRolled] = useState(false);
  const [history, setHistory] = useState([]);
  const rollCount = useRef(0);

  const instrument = selectedInstrument ? INSTRUMENTS[selectedInstrument] : null;

  const doRoll = () => {
    if (!instrument || rolling) return;
    setRolling(true);
    setRolled(false);

    // Animate for 600ms then reveal
    setTimeout(() => {
      const intensityRoll = rollDie(6);
      const strokesRoll = rollDie(strokeDieFaces);
      // Phase determined by stroke roll mapped to arc length
      const arcLen = instrument.cards.length;
      const phaseIdx = ((strokesRoll - 1) % arcLen);
      const card = instrument.cards[phaseIdx];

      rollCount.current += 1;
      setIntensity(intensityRoll);
      setStrokes(strokesRoll);
      setPhase(phaseIdx);
      setRolling(false);
      setRolled(true);

      setHistory(h => [{
        id: rollCount.current,
        instrument: instrument.name,
        intensity: intensityRoll,
        strokes: strokesRoll,
        card: card.name,
        phase: card.phase,
      }, ...h].slice(0, 10));
    }, 600);
  };

  const reset = () => {
    setRolled(false);
    setIntensity(null);
    setStrokes(null);
    setPhase(null);
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=DM+Sans:wght@300;400;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0f0f1a; }
    .qi-app { min-height: 100vh; background: linear-gradient(135deg, #0f0f1a 0%, #1a0f2e 50%, #0f1a1a 100%); font-family: 'DM Sans', sans-serif; color: #e8e0f0; padding: 24px; }
    .qi-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
    .qi-title { font-family: 'Cinzel', serif; font-size: 22px; color: #e8d5ff; letter-spacing: 0.08em; }
    .qi-subtitle { font-size: 12px; color: #7c6a9a; margin-top: 3px; letter-spacing: 0.06em; }
    .qi-quit { background: transparent; border: 1px solid #3a2a5e; color: #9a8ab8; padding: 7px 16px; border-radius: 8px; cursor: pointer; font-size: 12px; font-family: 'DM Sans', sans-serif; }
    .qi-quit:hover { background: #1a0f2e; color: #e8d5ff; }
    .instrument-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 24px; }
    @media(max-width: 700px) { .instrument-grid { grid-template-columns: repeat(3, 1fr); } }
    .inst-btn { background: #1a1230; border: 2px solid #2a1f3d; border-radius: 14px; padding: 14px 10px; cursor: pointer; text-align: center; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
    .inst-btn:hover { border-color: #7c5cbf; background: #20163a; transform: translateY(-2px); }
    .inst-btn.selected { border-color: var(--ic); background: linear-gradient(135deg, #1a1230, #20163a); box-shadow: 0 0 20px var(--ic-glow); }
    .inst-glyph { font-size: 26px; margin-bottom: 6px; }
    .inst-name { font-size: 11px; font-weight: 700; color: #c4b5fd; letter-spacing: 0.05em; }
    .inst-desc { font-size: 10px; color: #7c6a9a; margin-top: 3px; line-height: 1.4; }
    .dice-section { background: #1a1230; border: 1px solid #2a1f3d; border-radius: 16px; padding: 20px 24px; margin-bottom: 20px; }
    .dice-row { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
    .dice-label { font-size: 11px; font-weight: 700; color: #9a8ab8; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 8px; }
    .die-select { display: flex; gap: 8px; }
    .die-opt { background: #0f0f1a; border: 2px solid #2a1f3d; color: #9a8ab8; padding: 6px 16px; border-radius: 8px; cursor: pointer; font-size: 12px; font-family: 'Cinzel', serif; transition: all 0.15s; }
    .die-opt.active { border-color: #7c5cbf; color: #e8d5ff; background: #20163a; }
    .roll-btn { background: linear-gradient(135deg, #4a3576, #7c5cbf); color: #fff; border: none; padding: 14px 36px; border-radius: 12px; font-size: 15px; font-family: 'Cinzel', serif; font-weight: 700; cursor: pointer; letter-spacing: 0.06em; transition: all 0.2s; box-shadow: 0 4px 20px #7c5cbf44; }
    .roll-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 32px #7c5cbf66; }
    .roll-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .roll-btn.rolling { animation: pulse 0.3s ease infinite alternate; }
    @keyframes pulse { from { box-shadow: 0 4px 20px #7c5cbf44; } to { box-shadow: 0 4px 40px #7c5cbfaa; } }
    @keyframes cardReveal { from { opacity: 0; transform: translateY(20px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
    .result-section { display: grid; grid-template-columns: 1fr 2fr; gap: 20px; margin-bottom: 20px; }
    @media(max-width: 800px) { .result-section { grid-template-columns: 1fr; } }
    .result-stats { background: #1a1230; border: 1px solid #2a1f3d; border-radius: 16px; padding: 20px; }
    .stat-block { margin-bottom: 18px; }
    .stat-label { font-size: 10px; font-weight: 700; color: #7c6a9a; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 6px; }
    .stat-value { font-family: 'Cinzel', serif; font-size: 32px; font-weight: 700; color: #e8d5ff; }
    .stat-sub { font-size: 12px; color: #9a8ab8; margin-top: 2px; }
    .history-section { background: #1a1230; border: 1px solid #2a1f3d; border-radius: 16px; padding: 16px 20px; }
    .hist-title { font-size: 11px; font-weight: 700; color: #7c6a9a; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 12px; }
    .hist-row { display: flex; align-items: center; gap: 10px; padding: 6px 0; border-bottom: 1px solid #2a1f3d; font-size: 11px; color: #9a8ab8; }
    .hist-row:last-child { border-bottom: none; }
    .hist-num { color: #4a3576; font-weight: 700; min-width: 20px; }
    .hist-card { color: #c4b5fd; font-weight: 600; }
    .again-btn { background: #0f0f1a; border: 1px solid #3a2a5e; color: #c4b5fd; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-size: 13px; font-family: 'DM Sans', sans-serif; font-weight: 600; transition: all 0.15s; margin-top: 12px; }
    .again-btn:hover { background: #1a1230; border-color: #7c5cbf; }
    ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: #1a1230; } ::-webkit-scrollbar-thumb { background: #3a2a5e; border-radius: 99px; }
  `;

  return (
    <div className="qi-app">
      <style>{css}</style>

      {/* Header */}
      <div className="qi-header">
        <div>
          <div className="qi-title">✦ Quantum Impact Tool</div>
          <div className="qi-subtitle">Harmonic Field · Instrument · Dice · Ceremony</div>
        </div>
        {onQuit && <button className="qi-quit" onClick={onQuit}>← Back</button>}
      </div>

      {/* Instrument Selection */}
      <div style={{ marginBottom: 8, fontSize: 11, fontWeight: 700, color: "#7c6a9a", letterSpacing: "0.08em", textTransform: "uppercase" }}>
        Select Your Instrument
      </div>
      <div className="instrument-grid">
        {Object.values(INSTRUMENTS).map(inst => (
          <button
            key={inst.id}
            className={`inst-btn ${selectedInstrument === inst.id ? "selected" : ""}`}
            style={{ "--ic": inst.color, "--ic-glow": inst.color + "44" }}
            onClick={() => { setSelectedInstrument(inst.id); reset(); }}
          >
            <div className="inst-glyph" style={{ color: inst.color }}>{inst.glyph}</div>
            <div className="inst-name" style={{ color: selectedInstrument === inst.id ? inst.accent : "#c4b5fd" }}>{inst.name}</div>
            <div className="inst-desc">{inst.desc}</div>
          </button>
        ))}
      </div>

      {/* Dice Config + Roll */}
      <div className="dice-section">
        <div className="dice-row">
          {/* Intensity die — always D6 */}
          <div>
            <div className="dice-label">Intensity (D6)</div>
            <DiceDisplay value={intensity} faces={6} rolling={rolling} />
          </div>

          {/* Strokes die — D6 or D20 */}
          <div>
            <div className="dice-label">Strokes — choose die</div>
            <div className="die-select" style={{ marginBottom: 8 }}>
              {[6, 20].map(f => (
                <button
                  key={f}
                  className={`die-opt ${strokeDieFaces === f ? "active" : ""}`}
                  onClick={() => { setStrokeDieFaces(f); reset(); }}
                >D{f}</button>
              ))}
            </div>
            <DiceDisplay value={strokes} faces={strokeDieFaces} rolling={rolling} />
          </div>

          {/* Roll button */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <button
              className={`roll-btn ${rolling ? "rolling" : ""}`}
              disabled={!instrument || rolling}
              onClick={doRoll}
            >
              {rolling ? "Rolling…" : rolled ? "Roll Again 🎲" : "Roll Dice 🎲"}
            </button>
            {!instrument && <div style={{ fontSize: 11, color: "#4a3576" }}>Select an instrument first</div>}
          </div>
        </div>
      </div>

      {/* Results */}
      {rolled && instrument && phase !== null && (() => {
        const card = instrument.cards[phase];
        return (
          <div className="result-section">
            {/* Stats panel */}
            <div className="result-stats">
              <div className="stat-block">
                <div className="dice-label" style={{ color: instrument.accent }}>Instrument</div>
                <div style={{ fontSize: 16, fontFamily: "'Cinzel',serif", color: "#e8d5ff", fontWeight: 700 }}>
                  <span style={{ color: instrument.color, marginRight: 8 }}>{instrument.glyph}</span>
                  {instrument.name}
                </div>
              </div>

              <div className="stat-block">
                <div className="dice-label">Intensity</div>
                <div className="stat-value" style={{ color: INTENSITY_LABELS[intensity]?.color }}>{intensity}</div>
                <div className="stat-sub">{INTENSITY_LABELS[intensity]?.label} — {INTENSITY_LABELS[intensity]?.desc}</div>
              </div>

              <div className="stat-block">
                <div className="dice-label">Strokes</div>
                <div className="stat-value">{strokes}</div>
                <div className="stat-sub">Phase {card.phase} of {instrument.cards.length}</div>
              </div>

              <div className="stat-block">
                <div className="dice-label">Arc Position</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {instrument.cards.map((c, i) => (
                    <div key={i} style={{
                      width: 20, height: 20, borderRadius: "50%",
                      background: i === phase ? instrument.color : "#2a1f3d",
                      border: `1px solid ${i === phase ? instrument.color : "#3a2a5e"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, color: i === phase ? "#fff" : "#4a3576", fontWeight: 700,
                    }}>{i + 1}</div>
                  ))}
                </div>
              </div>

              <button className="again-btn" onClick={doRoll}>
                Roll Again 🎲
              </button>
            </div>

            {/* Card display */}
            <div>
              <CardDisplay card={card} intensity={intensity} instrument={instrument} />
            </div>
          </div>
        );
      })()}

      {/* History */}
      {history.length > 0 && (
        <div className="history-section">
          <div className="hist-title">Roll History</div>
          {history.map((h, i) => (
            <div className="hist-row" key={h.id}>
              <span className="hist-num">#{h.id}</span>
              <span style={{ color: INSTRUMENTS[h.instrument.replace(" ","_").toUpperCase()]?.color || "#7c5cbf", minWidth: 90, fontSize: 11 }}>{h.instrument}</span>
              <span className="hist-card">{h.card}</span>
              <span style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
                <span>Intensity <b style={{ color: INTENSITY_LABELS[h.intensity]?.color }}>{h.intensity}</b></span>
                <span>Strokes <b style={{ color: "#e8d5ff" }}>{h.strokes}</b></span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
