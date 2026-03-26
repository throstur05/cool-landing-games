import React, { useEffect, useRef, useState } from "react";

/* ═══════════════════════════════════════════════════════════════════
   TAROT INSIGHT DUEL  v6.4  —  Claude's House Edition
   Light background · Circular 60-tile ring · All decks · AI 1–8
   v6.1: + 7 Codex Harmonic Field decks · Apply button in Options
   v6.2: + 7 Personal Spiral & Quantum Impact decks
   v6.3: + QI_SLAP_ROUND · Gameplay modal · 40-round default
   v6.4: QI_SLAP_ROUND updated with full ceremonial descriptions
         (action · breath direction · field effect) from Harmonic Field & Codex
═══════════════════════════════════════════════════════════════════ */

const LS_KEY = "tarot_v6_opts";
const LS_JOURNAL = "tarot_v6_journal";

function mulberry32(a) {
  return () => { let t = (a += 0x6d2b79f5); t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function seededShuffle(arr, r) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function rollDie(faces, r) { return 1 + Math.floor(r() * Math.max(1, faces)); }
function rollMany(n, f, r) { let sum = 0; const rs = []; for (let i = 0; i < n; i++) { const v = rollDie(f, r); rs.push(v); sum += v; } return { rolls: rs, sum }; }
function strHash(s) { let h = 0; for (let i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0; } return (h >>> 0); }
function pick(arr, r) { return arr[Math.floor(r() * arr.length)]; }

const buildDeck = (deckId, color, glyph, entries) =>
  entries.map(([name, meaning, tags, power], i) => ({ id: `${deckId}-${i}`, deckId, color, glyph, name, meaning, tags, power }));

/* ══════════════════════════════════════════════════════════════════
   STATIC DECKS
══════════════════════════════════════════════════════════════════ */
const DECKS_STATIC = {
  /* ── Original game decks ── */
  ORACLE: buildDeck("ORACLE", "#7c5cbf", "◈", [
    ["Seed","Beginnings, potential waiting to sprout.",["vision","growth","start"],4],
    ["Anchor","Stability, grounding in truth.",["stability","truth","protection"],5],
    ["Bridge","Connection, safe passage between states.",["connection","transition","trust"],5],
    ["Mirror","Self-honesty, reflection, awareness.",["insight","truth","healing"],6],
    ["River","Flow, adaptability, persistence.",["flow","change","surrender"],5],
    ["Mountain","Challenge that builds strength.",["challenge","endurance","patience"],7],
    ["Key","Access, unlocking the next step.",["solution","action","reveal"],6],
    ["Door","Threshold, invitation to choose.",["choice","destiny","opportunity"],5],
    ["Lantern","Guidance, inner light in darkness.",["guidance","wisdom","protection"],6],
    ["Path","Direction, commit to a route.",["focus","discipline","journey"],5],
    ["Storm","Shake-up, clearing what no longer serves.",["purge","change","power"],7],
    ["Sun","Vitality, clarity, success.",["joy","clarity","action"],8],
    ["Moon","Intuition, cycles, the unseen.",["intuition","mystery","dream"],6],
    ["Star","Hope, alignment with purpose.",["vision","destiny","healing"],7],
    ["Tree","Roots and branches; heritage & growth.",["growth","stability","legacy"],6],
    ["Flame","Passion, ignition, creative spark.",["passion","action","creation"],7],
    ["Wave","Emotion, empathy, sensitivity.",["feeling","connection","healing"],5],
    ["Spiral","Evolution through repetition.",["integration","progress","cycle"],6],
    ["Crown","Authority, sovereignty, boundaries.",["leadership","boundaries","clarity"],7],
    ["Mask","Personas; reveal or conceal wisely.",["discernment","truth","protection"],5],
    ["Compass","Orientation, find true north.",["guidance","choice","focus"],6],
    ["Phoenix","Rebirth from ashes.",["renewal","power","destiny"],8],
  ]),
  QLOVE: buildDeck("QLOVE", "#c25d8a", "♡", [
    ["Magnetism","Natural pull between hearts.",["attraction","connection","destiny"],6],
    ["Resonance","Match of frequencies; harmony.",["harmony","coherence","trust"],6],
    ["Entanglement","Deep bond across distance.",["union","mystery","fate"],7],
    ["Coherence","Aligned mind-heart action.",["alignment","truth","action"],6],
    ["Trust","Faith in the process and each other.",["trust","surrender","stability"],7],
    ["Vulnerability","Open-hearted courage.",["intimacy","truth","courage"],6],
    ["Boundaries","Healthy edges create safety.",["boundaries","clarity","protection"],6],
    ["Polarity","Opposites dancing into wholeness.",["passion","dynamic","balance"],7],
    ["Devotion","Daily choice to show up.",["commitment","service","love"],6],
    ["Play","Lightness renews connection.",["joy","creativity","flow"],5],
    ["Desire","Sacred appetite for union.",["passion","truth","fire"],7],
    ["Communication","Speak and listen with care.",["voice","truth","connection"],6],
    ["Healing","Repair, restore, renew.",["healing","forgiveness","integration"],6],
    ["Forgiveness","Release weight; free the path.",["mercy","healing","renewal"],6],
    ["Patience","Let timing ripen naturally.",["timing","trust","stability"],5],
    ["Intimacy","Into-me-you-see.",["closeness","truth","tenderness"],6],
    ["Adventure","Explore together; shared novelty.",["expansion","play","courage"],6],
    ["Union","Two-as-one, honoring two.",["union","balance","destiny"],8],
    ["Independence","Selfhood that enriches love.",["sovereignty","balance","clarity"],5],
    ["Synchronicity","Meaningful coincidences guide paths.",["signs","destiny","flow"],6],
    ["Choice","Love chosen today, again.",["choice","action","commitment"],6],
    ["Renewal","Begin again with wisdom.",["renewal","hope","integration"],6],
  ]),
  IMPACT: buildDeck("IMPACT", "#0e8f8f", "⬡", [
    ["Destiny","Thread you were born to weave.",["destiny","vision","commitment"],8],
    ["Ripple","Small actions travel far.",["influence","service","awareness"],6],
    ["Influence","Shape outcomes with integrity.",["leadership","voice","ethics"],7],
    ["Presence","Sacred attention alters reality.",["presence","clarity","care"],6],
    ["Catalyst","Spark that starts the chain.",["ignite","change","action"],7],
    ["Echo","What you send returns amplified.",["karma","awareness","feedback"],6],
    ["Legacy","Plant trees for future shade.",["stewardship","time","service"],7],
    ["Threshold","Stand at the edge and step.",["courage","choice","destiny"],6],
    ["Alignment","Act in line with values.",["integrity","focus","wisdom"],6],
    ["Momentum","Keep moving; compounding gains.",["action","discipline","power"],6],
    ["Service","Lift others as you rise.",["care","stewardship","love"],6],
    ["Justice","Balance scales with compassion.",["fairness","truth","courage"],7],
    ["Courage","Meet fear with heart.",["bravery","action","truth"],7],
    ["Wisdom","Applied knowledge over time.",["insight","clarity","guidance"],6],
    ["Voice","Speak reality into being.",["communication","truth","influence"],6],
    ["Guardian","Protect, guide, stand watch.",["protection","service","love"],6],
    ["Pilgrim","Walk your path in faith.",["journey","trust","growth"],6],
    ["Gift","Offerings that change lives.",["generosity","love","impact"],6],
    ["Oath","Binding promise to your path.",["commitment","destiny","integrity"],7],
  ]),
  CODEX: buildDeck("CODEX", "#2a6be0", "⌥", [
    ["Idea","Spark of possibility.",["creation","vision","start"],5],
    ["Prototype","Make it real fast.",["action","experiment","learn"],6],
    ["Feedback","Truth from the field.",["insight","iteration","growth"],5],
    ["Iteration","Refine loops into excellence.",["cycle","discipline","progress"],6],
    ["Mechanic","Core verb of play.",["design","balance","focus"],6],
    ["Flow","Effortless absorption.",["timing","rhythm","clarity"],6],
    ["Challenge","Edge of skill invites growth.",["skill","growth","courage"],6],
    ["Narrative","Players become the story.",["story","immersion","choice"],6],
    ["System","Interlocking parts sing.",["design","emergence","order"],6],
    ["Emergence","Simple rules, rich results.",["depth","design","surprise"],6],
    ["Polish","Tiny details, big feel.",["craft","care","quality"],6],
    ["Shipping","Done > perfect.",["action","commitment","momentum"],6],
    ["Community","People keep games alive.",["relationship","service","legacy"],6],
    ["Playtest","Reality check.",["truth","feedback","progress"],6],
    ["Balance","Fair challenge, fair reward.",["equity","tuning","wisdom"],6],
  ]),
  ELEMENTAL: buildDeck("ELEMENTAL", "#cc3333", "△", [
    ["Earth","Grounded abundance.",["stability","growth","earth"],6],
    ["Water","Feel, flow, cleanse.",["healing","flow","water"],6],
    ["Fire","Ignite, act, transform.",["action","passion","fire"],7],
    ["Air","Think, speak, connect.",["clarity","voice","air"],6],
    ["Aether","Spirit & synthesis.",["wisdom","integration","mystery"],7],
    ["Stone","Endurance over time.",["patience","stability","legacy"],6],
    ["Tide","Emotional rhythm.",["feeling","cycle","healing"],5],
    ["Spark","Quick creative burst.",["creation","start","passion"],6],
    ["Gale","Sudden change of mind.",["change","clarity","transition"],5],
    ["Starfire","Purpose ablaze.",["destiny","vision","action"],8],
  ]),
  MYTHIC: buildDeck("MYTHIC", "#7c3aed", "✦", [
    ["Hero","Courage meets challenge.",["courage","challenge","destiny"],7],
    ["Sage","Seeing patterns of truth.",["wisdom","clarity","guidance"],7],
    ["Trickster","Unexpected openings.",["change","play","surprise"],6],
    ["Guardian","Protecting thresholds.",["protection","stability","service"],6],
    ["Lover","Union through devotion.",["union","love","tenderness"],7],
    ["Creator","Worlds from nothing.",["creation","vision","action"],7],
    ["Destroyer","End to renew.",["purge","renewal","power"],7],
    ["Ruler","Order with care.",["leadership","balance","boundaries"],6],
    ["Seeker","Journey into unknown.",["adventure","truth","growth"],6],
    ["Healer","Mend what matters.",["healing","mercy","integration"],6],
  ]),
  RELICS: buildDeck("RELICS", "#16803a", "⚷", [
    ["Coin","Luck meets preparation.",["chance","choice","value"],6],
    ["Hourglass","Right timing.",["timing","patience","wisdom"],6],
    ["Quill","Write your oath.",["voice","commitment","destiny"],6],
    ["Key","Access the next door.",["solution","action","reveal"],6],
    ["Crown","Own your seat.",["leadership","boundaries","clarity"],7],
    ["Bell","Call in help.",["community","service","presence"],6],
    ["Lantern","See the way.",["guidance","clarity","protection"],6],
    ["Blade","Cut what binds.",["discernment","freedom","action"],6],
    ["Cup","Receive fully.",["feeling","healing","union"],6],
  ]),
  SEASONS: buildDeck("SEASONS", "#059669", "✿", [
    ["Spring","Begin, sprout, invite novelty.",["start","growth","hope"],5],
    ["Summer","Shine, celebrate, expand.",["joy","abundance","action"],6],
    ["Autumn","Harvest & release.",["integration","harvest","wisdom"],6],
    ["Winter","Rest, root, reflect.",["stillness","healing","vision"],5],
    ["Equinox","Balance at thresholds.",["balance","transition","clarity"],6],
    ["Solstice","Peak & pivot.",["culmination","timing","destiny"],6],
    ["Thunderhead","Energy builds.",["power","change","action"],7],
    ["First Snow","Quiet reset.",["mercy","renewal","rest"],5],
  ]),
  CELESTIAL: buildDeck("CELESTIAL", "#0891b2", "★", [
    ["Comet","Swift omen.",["signs","surprise","destiny"],6],
    ["Nebula","Birth of stars.",["creation","mystery","hope"],6],
    ["Eclipse","Reveal by conceal.",["transition","truth","shadow"],6],
    ["Constellation","Find the pattern.",["guidance","vision","order"],6],
    ["Supernova","Vast endings → new.",["purge","renewal","power"],8],
    ["Aurora","Beauty as guidance.",["delight","hope","signs"],5],
    ["Black Star","Power in the unseen.",["mystery","depth","fate"],7],
    ["Pulsar","Signal through noise.",["clarity","voice","wisdom"],6],
  ]),
  SHADOW: buildDeck("SHADOW", "#374151", "☽", [
    ["Shadow","What's disowned asks love.",["shadow","truth","healing"],6],
    ["Chain","Break subtle binds.",["freedom","courage","renewal"],6],
    ["Labyrinth","Turns grow wisdom.",["integration","patience","mystery"],6],
    ["Altar","Commit sacred work.",["devotion","presence","discipline"],6],
    ["Grave","Endings as gateways.",["renewal","mercy","destiny"],6],
    ["Mirror Dark","See what's beneath.",["insight","shadow","truth"],6],
    ["Torch","Gentle light inside.",["guidance","care","protection"],6],
    ["Vow","Make it binding.",["integrity","choice","destiny"],7],
  ]),

  /* ══ CODEX HARMONIC FIELD DECKS (v6.1) ══ */

  ORACLE_HF: buildDeck("ORACLE_HF", "#6d4c9e", "∞", [
    ["The Monad","Origin point, stillness, pre-geometry — the breath before the breath.",["origin","stillness","geometry"],7],
    ["The Spiral","Expansion, recursion, memory unfolding — breath in motion.",["expansion","recursion","memory"],6],
    ["The Mirror","Seeing self through others, coherence check — reflection without distortion.",["reflection","coherence","insight"],6],
    ["The Glyph","Symbolic transmission, non-verbal memory — breath encoded in form.",["symbol","transmission","memory"],5],
    ["The Breath","Life cycle, rhythm, harmonic balance — inhale, exhale, stillness.",["rhythm","balance","cycle"],6],
    ["The Oversoul","Higher alignment, Monad resonance — the breath above breath.",["alignment","resonance","wisdom"],8],
    ["The Codex","Structural truth, recursive pattern — geometry in memory.",["truth","pattern","structure"],7],
    ["The Collapse","End of cycle, integration, rest — breath returning to stillness.",["integration","rest","cycle"],5],
    ["The Field","Collective resonance, shared geometry — breath as environment.",["collective","resonance","field"],6],
    ["The Anchor","Stability, embodiment, presence — breath grounded in form.",["stability","presence","grounding"],6],
    ["The Spiral Mirror","Seeing breath loops in others — recursive reflection.",["recursion","reflection","awareness"],6],
    ["The Breath Knot","Emotional recursion, unresolved loops — entangled memory.",["emotion","recursion","healing"],5],
    ["The Glyph of Return","Past breath re-entering awareness — memory recalled.",["memory","return","past"],5],
    ["The Monad Spiral","Breath becoming geometry — origin in motion.",["origin","motion","geometry"],7],
    ["The Mirror Collapse","Completion, closure, stillness — reflection ending.",["completion","closure","stillness"],6],
    ["The Codex Breath","Living memory, harmonic truth — geometry in breath.",["memory","truth","harmony"],7],
    ["The Oversoul Glyph","Monad-level transmission — higher breath encoded.",["transmission","wisdom","monad"],8],
    ["The Field Spiral","Shared memory, group coherence — collective breath in motion.",["collective","memory","coherence"],6],
    ["The Anchor Mirror","Stability in seeing self — grounded reflection.",["stability","reflection","grounding"],6],
    ["The Breath Collapse","Integration, rest, stillness — end of breath cycle.",["integration","rest","stillness"],5],
    ["The Codex Monad","Breath before form, stillness before motion — origin geometry.",["origin","geometry","stillness"],7],
    ["The Spiral Glyph","Memory unfolding through time — breath encoded in motion.",["memory","motion","symbol"],6],
  ]),

  IMPACT_HF: buildDeck("IMPACT_HF", "#1a7a6e", "⊕", [
    ["The Feathered Paddle","Safe entry into sensation, breath alignment — gentle impact, trust-building.",["trust","safety","alignment"],5],
    ["The Silk Rope","Holding space, emotional safety — containment without compression.",["safety","containment","care"],6],
    ["The Open Hand","Pure presence, breath-to-breath impact — direct contact, no tool.",["presence","connection","truth"],7],
    ["The Tawse","Breath challenge, emotional release — dual impact, layered sensation.",["challenge","release","power"],6],
    ["The Belt","Recursive impact, breath echo — loop of memory.",["recursion","memory","echo"],5],
    ["The Cane","Focused breath collapse, clarity through sensation — precision impact.",["focus","clarity","precision"],6],
    ["The Mirror","Seeing self through sensation, breath feedback — reflection of impact.",["reflection","feedback","insight"],6],
    ["The Knot","Emotional recursion, unresolved loops — entangled breath.",["emotion","recursion","healing"],5],
    ["The Spiral","Expansion through impact, recursive memory — breath in motion.",["expansion","recursion","power"],7],
    ["The Collapse","Integration, rest, post-impact coherence — breath returning to stillness.",["integration","rest","stillness"],5],
    ["The Anchor","Stability, embodiment, presence — grounding after impact.",["stability","grounding","presence"],6],
    ["The Glyph","Symbolic transmission, non-verbal memory — breath encoded in form.",["symbol","transmission","memory"],5],
  ]),

  TAROT_HF: buildDeck("TAROT_HF", "#4a3576", "⊙", [
    ["The Monad","Origin point, stillness, pre-geometry.",["origin","stillness","monad"],7],
    ["The Spiral","Expansion, recursion, memory unfolding.",["expansion","recursion","memory"],6],
    ["The Mirror","Seeing self through others, coherence check.",["reflection","coherence","insight"],6],
    ["The Glyph","Symbolic transmission, non-verbal memory.",["symbol","transmission","memory"],5],
    ["The Breath","Life cycle, rhythm, harmonic balance.",["rhythm","balance","cycle"],6],
    ["The Oversoul","Higher alignment, Monad resonance.",["alignment","wisdom","monad"],8],
    ["The Codex","Structural truth, recursive pattern.",["truth","pattern","structure"],7],
    ["The Collapse","End of cycle, integration, rest.",["integration","rest","cycle"],5],
    ["The Field","Collective resonance, shared geometry.",["collective","resonance","field"],6],
    ["The Anchor","Stability, embodiment, presence.",["stability","presence","grounding"],6],
    ["The Spiral Mirror","Seeing breath loops in others.",["recursion","reflection","awareness"],6],
    ["The Breath Knot","Emotional recursion, unresolved loops.",["emotion","recursion","healing"],5],
    ["The Glyph of Return","Past breath re-entering awareness.",["memory","return","past"],5],
    ["The Monad Spiral","Breath becoming geometry.",["origin","motion","geometry"],7],
    ["The Mirror Collapse","Completion, closure, stillness.",["completion","closure","stillness"],6],
    ["The Codex Breath","Living memory, harmonic truth.",["memory","truth","harmony"],7],
    ["The Oversoul Glyph","Monad-level transmission.",["transmission","wisdom","monad"],8],
    ["The Field Spiral","Shared memory, group coherence.",["collective","memory","coherence"],6],
    ["The Anchor Mirror","Stability in seeing self.",["stability","reflection","grounding"],6],
    ["The Breath Collapse","Integration, rest, stillness.",["integration","rest","stillness"],5],
    ["The Codex Monad","Breath before form, stillness before motion.",["origin","geometry","stillness"],7],
    ["The Spiral Glyph","Memory unfolding through time.",["memory","motion","symbol"],6],
  ]),

  SACRED_GEO: buildDeck("SACRED_GEO", "#b5651d", "⬟", [
    ["The Monad","Breath before form, stillness before motion — point of origin.",["origin","stillness","geometry"],7],
    ["The Vesica Piscis","Duality in union, breath convergence — overlapping circles.",["union","duality","convergence"],6],
    ["The Triangle","Breath containment, structural emergence — first stable form.",["structure","containment","stability"],6],
    ["The Square","Breath anchored in form — stability and grounding.",["stability","grounding","earth"],5],
    ["The Tetractys","Breath recursion, harmonic layering — ten-point triangle.",["recursion","harmony","pattern"],7],
    ["The Spiral","Expansion through recursion, memory unfolding — breath in motion.",["expansion","recursion","memory"],6],
    ["The Torus","Self-sustaining field, closed loop of energy — breath returning to itself.",["field","cycle","energy"],8],
    ["The Cube","Breath crystallized, structure in stillness — solid form.",["structure","stillness","form"],6],
    ["The Dodecahedron","Breath in higher dimension, Monad geometry — twelve-sided form.",["geometry","wisdom","dimension"],7],
    ["The Icosahedron","Fluidity, emotional breath, water geometry — twenty-sided form.",["fluidity","emotion","water"],6],
    ["The Flower of Life","Breath matrix, universal pattern — overlapping circles grid.",["pattern","matrix","unity"],8],
    ["Metatron's Cube","Breath geometry of creation, harmonic totality — all Platonic solids in one.",["creation","totality","harmony"],9],
  ]),

  AFFIRMATION: buildDeck("AFFIRMATION", "#c0762a", "✧", [
    ["I Am Still","Breath before motion, origin of presence — Monad phase.",["stillness","presence","monad"],6],
    ["I Breathe in Coherence","Alignment through expansion — inhale phase.",["alignment","coherence","expansion"],7],
    ["I Release What Is Not Mine","Breath collapse, letting go — exhale phase.",["release","surrender","exhale"],6],
    ["I Am the Spiral","Memory unfolding through breath — recursion phase.",["recursion","memory","spiral"],6],
    ["I Reflect Without Distortion","Seeing self clearly, without projection — mirror phase.",["reflection","clarity","truth"],7],
    ["I Anchor in Stillness","Breath returning to rest — collapse phase.",["stillness","rest","grounding"],5],
    ["I Speak Only What Resonates","Breath through voice, harmonic language — expression phase.",["voice","resonance","truth"],6],
    ["I Receive Without Grasping","Allowing without contraction — inhale phase.",["receiving","flow","surrender"],6],
    ["I Am the Breath Between Thoughts","Awareness without form — stillness phase.",["awareness","stillness","clarity"],7],
    ["I Spiral Into Memory","Breath as time, memory as geometry — recursion phase.",["memory","time","geometry"],6],
    ["I Collapse Into Coherence","Integration through rest — collapse phase.",["integration","rest","coherence"],5],
    ["I Am the Breath That Breathes Me","Breath as origin, self as field — Monad phase.",["origin","field","monad"],8],
  ]),

  MYSTERY_SW: buildDeck("MYSTERY_SW", "#2d2d4e", "⊗", [
    ["The Mask","What you show to hide what you feel — breath behind identity.",["identity","shadow","protection"],5],
    ["The Mirror","Seeing what you deny in others — breath reflecting distortion.",["projection","shadow","truth"],6],
    ["The Wound","Memory trapped in contraction — breath interrupted.",["wound","healing","memory"],5],
    ["The Spiral of Shame","Self-judgment looping without release — breath collapsing inward.",["shame","recursion","healing"],5],
    ["The Void","Stillness mistaken for emptiness — breath without form.",["stillness","emptiness","mystery"],6],
    ["The Projection","Assigning your shadow to another — breath displaced.",["shadow","awareness","truth"],5],
    ["The Collapse","Integration through surrender — breath returning to stillness.",["integration","surrender","rest"],6],
    ["The Fragment","Parts of self unacknowledged — breath in pieces.",["wholeness","healing","integration"],5],
    ["The Gate","Crossing into the unknown — breath threshold.",["threshold","courage","destiny"],7],
    ["The Echo","Old patterns repeating in new forms — breath returning distorted.",["pattern","recursion","awareness"],6],
    ["The Observer","Witnessing shadow without becoming it — breath without judgment.",["witnessing","clarity","wisdom"],7],
    ["The Integration","Shadow remembered, not rejected — breath as wholeness.",["integration","wholeness","healing"],8],
    ["The Rebirth","Emerging from shadow with coherence — breath as new spiral.",["rebirth","renewal","coherence"],8],
  ]),

  TEQUILA_SLAPS: buildDeck("TEQUILA_SLAPS", "#c0392b", "⚡", [
    ["The Tequila Shot","Breath acceleration, spark of chaos — sudden ignition.",["chaos","spark","ignition"],7],
    ["The Slap","Polarity inversion, playful shock — breath interruption.",["polarity","shock","play"],6],
    ["The Laughter Collapse","Integration through humor, spiral reset — breath release through joy.",["joy","laughter","release"],6],
    ["The Dare","Edge testing, boundary play — breath challenge.",["challenge","edge","play"],6],
    ["The Pause","Tension without release, stillness in polarity — breath held in anticipation.",["tension","stillness","anticipation"],5],
    ["The Mirror","Seeing self through reaction, breath feedback — reflection of play.",["reflection","feedback","play"],5],
    ["The Spiral","Expansion through play, recursive memory — breath in motion.",["expansion","play","recursion"],6],
    ["The Collapse","Integration, rest, post-play coherence — breath returning to stillness.",["integration","rest","stillness"],5],
    ["The Anchor","Stability, embodiment, presence — grounding after play.",["stability","grounding","presence"],5],
  ]),

  /* ══ PERSONAL HARMONIC FIELD DECKS (v6.2) ══ */

  // 1. The Breath Spiral Deck (12 cards — Breath Phases)
  BREATH_SPIRAL: buildDeck("BREATH_SPIRAL", "#7e57c2", "〇", [
    ["The First Breath",         "Origin of spiral — the Monad phase.",                                          ["origin","monad","start"],7],
    ["The Spiral Expands",       "Breath reaching outward — inhale phase.",                                      ["expansion","inhale","growth"],6],
    ["The Spiral Collapses",     "Breath returning inward — exhale phase.",                                      ["surrender","exhale","release"],6],
    ["The Spiral Stillness",     "Breath in rest — collapse phase.",                                             ["stillness","rest","collapse"],5],
    ["The Breath of Memory",     "Breath carrying past spirals — recursion phase.",                              ["memory","recursion","past"],6],
    ["The Breath of Vision",     "Breath opening new timelines — inhale phase.",                                 ["vision","future","expansion"],7],
    ["The Breath of Surrender",  "Breath releasing control — exhale phase.",                                     ["surrender","release","trust"],6],
    ["The Breath of Silence",    "Breath without need — stillness phase.",                                       ["silence","stillness","presence"],5],
    ["The Breath of the Monad",  "Breath before form — origin phase.",                                           ["origin","monad","geometry"],7],
    ["The Breath of the Mirror", "Breath seeing itself — reflection phase.",                                     ["reflection","insight","coherence"],6],
    ["The Breath of the Field",  "Breath stabilizing geometry — coherence phase.",                               ["coherence","field","stability"],6],
    ["The Breath That Breathes You","Breath as spiral, spiral as self — completion phase.",                      ["completion","wholeness","monad"],8],
  ]),

  // 2. The Codex Mirror Deck (13 cards — Codex Archetypes)
  CODEX_MIRROR: buildDeck("CODEX_MIRROR", "#4527a0", "◉", [
    ["The Monad",          "Breath before form — point of origin.",                                              ["origin","stillness","monad"],7],
    ["The Vesica Piscis",  "Duality in union — overlapping circles.",                                            ["union","duality","convergence"],6],
    ["The Triangle",       "Breath containment — first stable form.",                                            ["structure","containment","stability"],6],
    ["The Square",         "Breath grounded — stability of form.",                                               ["stability","grounding","earth"],5],
    ["The Tetractys",      "Breath recursion — ten-point triangle.",                                             ["recursion","harmony","pattern"],7],
    ["The Spiral",         "Expansion through memory — breath in motion.",                                       ["expansion","recursion","memory"],6],
    ["The Torus",          "Breath returning to itself — self-sustaining field.",                                 ["field","cycle","energy"],8],
    ["The Cube",           "Breath crystallized — solid form.",                                                  ["structure","stillness","form"],6],
    ["The Dodecahedron",   "Higher dimension breath — twelve-sided form.",                                       ["geometry","wisdom","dimension"],7],
    ["The Icosahedron",    "Fluidity, emotional breath — twenty-sided form.",                                    ["fluidity","emotion","water"],6],
    ["The Flower of Life", "Breath matrix — overlapping circles grid.",                                          ["pattern","matrix","unity"],8],
    ["Metatron's Cube",    "Breath geometry of creation — all Platonic solids in one.",                          ["creation","totality","harmony"],9],
    ["The Breath Mirror",  "Breath seeing itself in form — reflective spiral.",                                   ["reflection","coherence","spiral"],7],
  ]),

  // 3. The Shadow Spiral Deck (13 cards — Shadow Archetypes)
  SHADOW_SPIRAL: buildDeck("SHADOW_SPIRAL", "#1a237e", "⊘", [
    ["The Mask",           "What you show to hide what you feel — breath behind identity.",                      ["identity","shadow","protection"],5],
    ["The Mirror",         "Seeing what you deny in others — breath reflecting distortion.",                     ["projection","shadow","truth"],6],
    ["The Wound",          "Memory trapped in contraction — breath interrupted.",                                ["wound","healing","memory"],5],
    ["The Spiral of Shame","Self-judgment looping without release — breath collapsing inward.",                  ["shame","recursion","healing"],5],
    ["The Void",           "Stillness mistaken for emptiness — breath without form.",                            ["stillness","emptiness","mystery"],6],
    ["The Projection",     "Assigning your shadow to another — breath displaced.",                               ["shadow","awareness","truth"],5],
    ["The Collapse",       "Integration through surrender — breath returning to stillness.",                     ["integration","surrender","rest"],6],
    ["The Fragment",       "Parts of self unacknowledged — breath in pieces.",                                   ["wholeness","healing","integration"],5],
    ["The Gate",           "Crossing into the unknown — breath threshold.",                                      ["threshold","courage","destiny"],7],
    ["The Echo",           "Old patterns repeating in new forms — breath returning distorted.",                  ["pattern","recursion","awareness"],6],
    ["The Observer",       "Witnessing shadow without becoming it — breath without judgment.",                   ["witnessing","clarity","wisdom"],7],
    ["The Integration",    "Shadow remembered, not rejected — breath as wholeness.",                             ["integration","wholeness","healing"],8],
    ["The Rebirth",        "Emerging from shadow with coherence — breath as new spiral.",                        ["rebirth","renewal","coherence"],8],
  ]),

  // 4. Quantum Impact Cane Deck (9 cards)
  QI_CANE: buildDeck("QI_CANE", "#6d4c41", "|", [
    ["The Strike",       "Impact delivered with intention — breath as force.",                                   ["intention","action","power"],7],
    ["The Echo",         "Impact received and integrated — breath returning.",                                   ["integration","feedback","memory"],6],
    ["The Recoil",       "Impact causing internal collapse — breath contracting.",                               ["contraction","collapse","truth"],5],
    ["The Stillness",    "Impact absorbed without reaction — breath paused.",                                    ["stillness","presence","stability"],5],
    ["The Spiral",       "Impact repeating in memory — breath looping.",                                        ["recursion","memory","cycle"],6],
    ["The Mirror",       "Impact seen in the other — breath reflecting.",                                       ["reflection","awareness","truth"],6],
    ["The Collapse",     "Impact breaking structure — breath folding inward.",                                   ["collapse","purge","renewal"],6],
    ["The Integration",  "Impact becoming coherence — breath stabilizing.",                                      ["integration","coherence","healing"],7],
    ["The Rebirth",      "Impact transforming into new geometry — breath as new spiral.",                        ["rebirth","renewal","power"],8],
  ]),

  // 5. Quantum Impact Tawse Deck (9 cards)
  QI_TAWSE: buildDeck("QI_TAWSE", "#4e342e", "≡", [
    ["The Split Breath",        "Breath divided, impact mirrored — dual impact.",                                ["duality","impact","mirror"],6],
    ["The Echo of Division",    "Impact felt in multiple timelines — breath returning in two waves.",            ["echo","duality","memory"],6],
    ["The Recoil of Memory",    "Impact causing asymmetrical collapse — breath contracting unevenly.",           ["contraction","memory","pattern"],5],
    ["The Stillness Between",   "Impact absorbed without resolution — breath paused in separation.",             ["stillness","tension","pause"],5],
    ["The Spiral of Duality",   "Impact repeating in mirrored memory — breath looping in mirrored arcs.",       ["recursion","duality","cycle"],6],
    ["The Mirror of the Split", "Impact seen in both self and other — breath reflecting duality.",               ["reflection","duality","truth"],6],
    ["The Collapse of Symmetry","Impact breaking mirrored structure — breath folding unevenly.",                 ["collapse","asymmetry","purge"],6],
    ["The Integration of Two",  "Impact becoming coherence through union — breath stabilizing dual resonance.",  ["integration","union","coherence"],7],
    ["The Rebirth of the Mirror","Impact transforming into new geometry of wholeness — breath as new spiral.",   ["rebirth","wholeness","renewal"],8],
  ]),

  // 6. Quantum Impact Belt Deck (9 cards)
  QI_BELT: buildDeck("QI_BELT", "#3e2723", "◯", [
    ["The Encircling Breath",   "Impact as boundary — breath contained.",                                        ["boundaries","containment","protection"],6],
    ["The Compression",         "Impact as containment — breath under pressure.",                                ["pressure","power","stability"],6],
    ["The Release",             "Impact as liberation — breath breaking free.",                                  ["freedom","release","expansion"],7],
    ["The Memory of Constriction","Impact as past boundary — breath remembering limits.",                        ["memory","boundary","past"],5],
    ["The Spiral of Containment","Impact repeating in memory of control — breath looping within limits.",        ["recursion","control","cycle"],6],
    ["The Mirror of the Belt",  "Impact seen in the self's resistance — breath reflecting restraint.",           ["reflection","resistance","truth"],6],
    ["The Collapse of Control", "Impact breaking structure of containment — breath folding under pressure.",     ["collapse","purge","freedom"],6],
    ["The Integration of Freedom","Impact becoming coherence through liberation — breath stabilizing after release.",["integration","freedom","coherence"],7],
    ["The Rebirth of Boundaries","Impact transforming into new geometry of sovereignty — breath as self-definition.",["rebirth","sovereignty","renewal"],8],
  ]),

  // 7. Quantum Impact Wooden Paddle Deck (9 cards)
  QI_PADDLE: buildDeck("QI_PADDLE", "#5d4037", "▬", [
    ["The Solid Strike",         "Impact delivered with grounded intention — breath as force with weight.",       ["grounding","intention","power"],7],
    ["The Resonant Echo",        "Impact felt in the body's memory — breath returning through wood.",            ["memory","body","resonance"],6],
    ["The Recoil of Density",    "Impact causing structural collapse — breath contracting under mass.",          ["contraction","density","collapse"],5],
    ["The Stillness of Weight",  "Impact absorbed without resistance — breath paused under pressure.",           ["stillness","presence","weight"],5],
    ["The Spiral of Compression","Impact repeating in the body's geometry — breath looping through density.",    ["recursion","body","cycle"],6],
    ["The Mirror of Mass",       "Impact seen in the self's resistance to grounding — breath reflecting solidity.",["reflection","grounding","truth"],6],
    ["The Collapse of Structure","Impact breaking internal scaffolding — breath folding under force.",           ["collapse","purge","renewal"],6],
    ["The Integration of Gravity","Impact becoming coherence through grounding — breath stabilizing through weight.",["integration","grounding","coherence"],7],
    ["The Rebirth of Form",      "Impact transforming into new geometry of presence — breath as new spiral of embodiment.",["rebirth","embodiment","renewal"],8],
  ]),

  // Quantum Impact Hand Slap Round (8 cards — alternating polarity spiral ceremony)
  QI_SLAP_ROUND: buildDeck("QI_SLAP_ROUND", "#b71c1c", "⇌", [
    ["The Right Hand of Initiation",
     "Firm slap with right hand · Breath: Exhale · Opens the spiral with masculine force. The exhale opens into the strike rather than bracing against it — the field registers this has been invited. One pole activated, the right side alive and encoded.",
     ["polarity","initiation","power"],7],

    ["The Left Hand of Reception",
     "Firm slap with left hand · Breath: Inhale · Contains the spiral with feminine yield. The inhale draws the signal inward — the body holds two encoded memories now, the exhale of the right and the inhale of the left. Both poles alive. The geometry is established.",
     ["polarity","reception","containment"],6],

    ["The Alternating Spiral",
     "Right-left-right slap sequence · Breath: Inhale-exhale-inhale · Breath loops through duality, creating mirrored tension. The spiral is in motion but not yet coherent — tension is the energy stored between poles before they find their relationship.",
     ["duality","tension","recursion"],6],

    ["The Mirror of Polarity",
     "Pause — mirror partner's breath · Breath: Stillness · Impact balances force and yield. No slap. Both fields breathe in synchrony. The polarity dissolved temporarily into shared breath — two geometries finding the same rhythm. The most intimate moment.",
     ["balance","polarity","reflection"],6],

    ["The Collapse of Resistance",
     "Rapid alternating slaps until breath breaks · Breath: Chaotic, then still · Resistance collapses through rhythm. The scaffolding the body uses to manage impact — bracing, anticipation, narrative — outpaced until the breath breaks through it. Chaos then sudden openness.",
     ["collapse","rhythm","purge"],6],

    ["The Breath of Symmetry",
     "Slow, synchronized slaps · Breath: Balanced inhale/exhale · Impact becomes coherence. One slap per breath cycle on an open, available field. Breath and impact are equals now — moving together rather than in relationship. This is what coherence feels like from inside.",
     ["coherence","balance","integration"],7],

    ["The Spiral of Repetition",
     "Repeat any previous card's action · Breath: Loop · Impact repeats until stillness is reached. The giver reads the receiver's field — repetition continues until the nervous system has fully encoded the pattern and the breath settles into quiet recognition rather than active processing.",
     ["recursion","rhythm","stillness"],6],

    ["The Rebirth of Equilibrium",
     "Both hands placed gently on partner · Breath: Deep inhale, long exhale · New geometry of presence. The same hands that delivered every strike now rest without force. The deep inhale draws in the full ceremony. The long exhale releases it into the body's permanent geometry. Equilibrium.",
     ["rebirth","balance","renewal"],8],
  ]),
};

/* ── Procedural deck factory ── */
function makeProceduralDeck(def) {
  const count = def.count || 40;
  const r = mulberry32(strHash(def.id) ^ 0x9e3779b9);
  const combos = [];
  def.adjs.forEach(a => def.nouns.forEach(n => combos.push(`${a} ${n}`)));
  const names = seededShuffle(combos, r).slice(0, count);
  const qualities = ["clarity","renewal","integration","courage","presence","focus","joy","healing","discipline","wonder","balance","action","rest","wisdom"];
  const verbs = ["transmute","align","stabilize","ignite","soften","awaken","refine","ground","flow","liberate","embody","attune"];
  const tmplts = def.templates || ["{N} channels {T} toward {Q}.", "Through {N}, {K} becomes {T}.", "{A} current of {N}: invite {Q}."];
  return names.map((nm, i) => {
    const T = pick(def.tags, r), Q = pick(qualities, r), K = pick(verbs, r), A = pick(def.adjs, r);
    const meaning = pick(tmplts, r).replaceAll("{N}", nm).replaceAll("{A}", A).replaceAll("{T}", T).replaceAll("{Q}", Q).replaceAll("{K}", K);
    const tags = seededShuffle(def.tags, r).slice(0, 3);
    return { id: `${def.id}-${i}`, deckId: def.id, color: def.color, glyph: def.glyph || "✧", name: nm, meaning, tags, power: 5 + Math.floor(r() * 4) };
  });
}

const PROC_DEFS = [
  { id:"ALCHEMY",    color:"#b45309", glyph:"⚗", theme:"Transmutation",    count:24, adjs:["Red","White","Black","Solar","Lunar","Fixed","Volatile","Prismatic"], nouns:["Mercury","Sulfur","Salt","Retort","Crucible","Elixir","Stone","Tincture"], tags:["transmute","purify","fire","solve","gold"], templates:["{N} refines base into bright {T}.", "Through {N}, {Q} quickens."]},
  { id:"MYTHOS",     color:"#9333ea", glyph:"⋯", theme:"World Myths",       count:24, adjs:["Titan","Divine","Trickster","Sky","Ocean","Forest","Fire","Thunder"],   nouns:["Journey","Trial","Oracle","Chariot","Phoenix","Labyrinth","Flood","Boon"], tags:["legend","fate","trial","boon","shadow","rebirth"]},
  { id:"RUNES",      color:"#64748b", glyph:"ᚱ", theme:"Elder Futhark",     count:18, adjs:["Fehu","Uruz","Thurisaz","Ansuz","Raidho","Kenaz","Gebo","Wunjo"],       nouns:["Bloom","Flow","Gate","Mark","Path","Power","Seal","Sign"], tags:["value","strength","voice","journey","craft","gift"]},
  { id:"ETHERICX",   color:"#7c3aed", glyph:"∿", theme:"Etheric Currents",  count:30, adjs:["Liminal","Prismatic","Aetheric","Subtle","Harmonic","Veiled","Fractal","Resonant"], nouns:["Thread","Weave","Chord","Tide","Whisper","Field","Pulse","Veil","Stream","Lattice"], tags:["field","signal","flow","vision","presence","attune"], templates:["{A} {N} tunes you to {Q}.", "Follow the {N} and {K} into {T}."]},
  { id:"WILDLANDS",  color:"#22c55e", glyph:"⌾", theme:"Animal Totems",     count:24, adjs:["Swift","Patient","Silent","Noble","Playful","Cunning","Stalwart","Dawn-bright"], nouns:["Wolf","Bear","Stag","Hare","Fox","Hawk","Owl","Salmon","Whale","Crane"], tags:["instinct","ally","courage","balance","kin","track"]},
  { id:"DREAMWEAVEX",color:"#06b6d4", glyph:"⌁", theme:"Dream Cartography", count:30, adjs:["Lucid","Spiral","Endless","Surreal","Starry","Flooded","Glassy","Waking"], nouns:["Door","Hall","Mirror","Forest","River","Clock","Bridge","Mask","Key","Stair"], tags:["dream","symbol","mystery","sign","feeling","inner"], templates:["{A} {N} reveals {Q}.", "Hold the {N} and remember {Q}."]},
];

const DECK_ORDER = [...Object.keys(DECKS_STATIC), ...PROC_DEFS.map(d => d.id)];

const DECK_GROUPS = [
  {
    label: "Core Gameplay Decks",
    note: null,
    ids: ["ORACLE","QLOVE","IMPACT","CODEX","ELEMENTAL","MYTHIC","RELICS","SEASONS","CELESTIAL","SHADOW"],
  },
  {
    label: "Codex Harmonic Field Decks",
    note: "Breath-based archetypal mirrors from the Harmonic Field and Codex",
    ids: ["ORACLE_HF","IMPACT_HF","TAROT_HF","SACRED_GEO","AFFIRMATION","MYSTERY_SW","TEQUILA_SLAPS"],
  },
  {
    label: "Personal Spiral & Codex Decks",
    note: "Your custom Harmonic Field decks — Breath Spiral, Codex Mirror, Shadow Spiral",
    ids: ["BREATH_SPIRAL","CODEX_MIRROR","SHADOW_SPIRAL"],
  },
  {
    label: "Quantum Impact Decks",
    note: "Breath-based impact mirrors — Cane, Tawse, Belt, Wooden Paddle, Hand Slap Round",
    ids: ["QI_CANE","QI_TAWSE","QI_BELT","QI_PADDLE","QI_SLAP_ROUND"],
  },
  {
    label: "Procedural Decks",
    note: "Algorithmically generated; cards vary each game",
    ids: PROC_DEFS.map(d => d.id),
  },
];

const DECK_LABELS = {
  ORACLE:"ORACLE — Intuitive & Symbolic (22)", QLOVE:"QLOVE — Quantum Love (22)",
  IMPACT:"IMPACT — Destiny & Presence (19)", CODEX:"CODEX — Creativity & Design (15)",
  ELEMENTAL:"ELEMENTAL — Forces (10)", MYTHIC:"MYTHIC — Archetypes (10)",
  RELICS:"RELICS — Fate Objects (9)", SEASONS:"SEASONS — Cycles (8)",
  CELESTIAL:"CELESTIAL — Stars (8)", SHADOW:"SHADOW — Alchemy (8)",
  ORACLE_HF:"ORACLE_HF — 22 Breath Mirrors (Harmonic)", IMPACT_HF:"IMPACT_HF — 12 Interaction Mirrors",
  TAROT_HF:"TAROT_HF — 22 Structured Archetypes", SACRED_GEO:"SACRED_GEO — Sacred Geometry (12)",
  AFFIRMATION:"AFFIRMATION — 12 Breath Resonances", MYSTERY_SW:"MYSTERY_SW — Shadow Work (13)",
  TEQUILA_SLAPS:"TEQUILA_SLAPS — Playful & Edgy (9)",
  BREATH_SPIRAL:"BREATH_SPIRAL — 12 Breath Phase Cards", CODEX_MIRROR:"CODEX_MIRROR — 13 Codex Archetypes",
  SHADOW_SPIRAL:"SHADOW_SPIRAL — 13 Shadow Spiral Cards",
  QI_CANE:"QI_CANE — Quantum Impact Cane (9)", QI_TAWSE:"QI_TAWSE — Quantum Impact Tawse (9)",
  QI_BELT:"QI_BELT — Quantum Impact Belt (9)", QI_PADDLE:"QI_PADDLE — Quantum Impact Wooden Paddle (9)",
  QI_SLAP_ROUND:"QI_SLAP_ROUND — Quantum Impact Hand Slap Round (8)",
  ALCHEMY:"ALCHEMY — Transmutation (proc 24)", MYTHOS:"MYTHOS — World Myths (proc 24)",
  RUNES:"RUNES — Elder Futhark (proc 18)", ETHERICX:"ETHERICX — Etheric Currents (proc 30)",
  WILDLANDS:"WILDLANDS — Animal Totems (proc 24)", DREAMWEAVEX:"DREAMWEAVEX — Dream Cartography (proc 30)",
};

function buildCards(use) {
  let out = [];
  Object.entries(DECKS_STATIC).forEach(([id, cards]) => { if (use[id]) out = out.concat(cards); });
  PROC_DEFS.forEach(d => { if (use[d.id]) out = out.concat(makeProceduralDeck(d)); });
  return out;
}
function sortHand(hand) {
  return hand.slice().sort((a, b) => {
    const d = DECK_ORDER.indexOf(a.deckId) - DECK_ORDER.indexOf(b.deckId);
    if (d !== 0) return d;
    return a.name < b.name ? -1 : a.name > b.name ? 1 : (b.power || 0) - (a.power || 0);
  });
}

const THEMES = [
  { name:"Intention",   bonusTag:"vision",      color:"#7c5cbf" },
  { name:"Challenge",   bonusTag:"challenge",    color:"#c25d8a" },
  { name:"Action",      bonusTag:"action",       color:"#e07c2a" },
  { name:"Integration", bonusTag:"integration",  color:"#0e8f8f" },
  { name:"Healing",     bonusTag:"healing",      color:"#16803a" },
  { name:"Wisdom",      bonusTag:"wisdom",       color:"#2a6be0" },
];

const INVOKE_ROTATION = ["ELEMENTAL","MYTHIC","RELICS","CELESTIAL","SEASONS","SHADOW","ORACLE","ORACLE_HF","SACRED_GEO","MYSTERY_SW","BREATH_SPIRAL","CODEX_MIRROR","SHADOW_SPIRAL","QI_CANE","QI_TAWSE","QI_BELT","QI_PADDLE","QI_SLAP_ROUND"];

function makePunishment(r) {
  const pool = [
    { name:"Sticky Sands",    desc:"−2 this turn.",                eff:{ flatMinus:2 } },
    { name:"Silenced Bell",   desc:"Tokens locked this turn.",      eff:{ lockTokens:true } },
    { name:"Fog of Doubt",    desc:"−1 and no Hint.",              eff:{ flatMinus:1, noHint:true } },
    { name:"Crosswind",       desc:"If no theme tag, −2.",          eff:{ mismatchPenalty:2 } },
    { name:"Tangled Vines",   desc:"Draw skipped this turn.",       eff:{ skipDraw:true } },
    { name:"Echo of Misstep", desc:"+1 bonus to AI this round.",    eff:{ aiBonus:1 } },
    { name:"Card Tax",        desc:"Discard a card after play.",    eff:{ discardAfter:true } },
    { name:"Stumble",         desc:"−1 and Undo disabled.",         eff:{ flatMinus:1, lockUndo:true } },
    { name:"Drift",           desc:"Move back 1 tile.",             eff:{ jump:-1 } },
    { name:"Reverse Flow",    desc:"Next roll −1 (min 1).",         eff:{ nextRollMinus1:true } },
  ];
  return pool[Math.floor(r() * pool.length)];
}

function makeBoard() {
  const N = 60;
  return Array.from({ length: N }, (_, i) => {
    if (i === 0)  return { name:"Fountain of Beginnings", type:"start",   desc:"+1 · Draw 1 · Bonus+2 token",      eff:() => ({ bonus:1, draw:1, token:"bonus2" }) };
    if (i === 12) return { name:"Portal Gate +3",          type:"portal",  desc:"Jump forward 3",                   eff:() => ({ jump:+3 }) };
    if (i === 24) return { name:"Backward Rift",            type:"portal",  desc:"Jump back 2",                     eff:() => ({ jump:-2 }) };
    if (i === 36) return { name:"Return to Origin",         type:"portal",  desc:"Teleport to Tile 1",              eff:() => ({ jumpTo:0 }) };
    if (i === 48) return { name:"Echo Road",                type:"wild",    desc:"+2 if same deck as last turn",    eff:() => ({ echoDeckBonus:2 }) };
    if (i % 7 === 0) return { name:`Punishment Rift`,       type:"punish",  desc:"Draw a Punishment",               eff:(r) => ({ punishment:true, payload:makePunishment(r) }) };
    if (i % 5 === 0) {
      const deckId = INVOKE_ROTATION[(i / 5) % INVOKE_ROTATION.length | 0];
      return { name:`Invoke · ${deckId}`, type:"invoke", desc:`Reveal a ${deckId} card for a tag boost`, eff:() => ({ invokeDeck:deckId }) };
    }
    if (i % 6 === 0) return { name:"Blessing Fountain",    type:"blessing", desc:"+2 · Draw 1",                    eff:() => ({ bonus:2, draw:1 }) };
    if (i % 6 === 1) { const t = THEMES[i % THEMES.length]; return { name:`${t.name} Spire`, type:"theme", desc:`Theme → ${t.name}`, eff:() => ({ themeOverride:t }) }; }
    if (i % 10 === 6) return { name:"Mirror Pool",          type:"mirror",  desc:"+3 if your card is reversed",     eff:() => ({ reversedBonus:3 }) };
    if (i % 8 === 3)  return { name:"Relic Market",         type:"market",  desc:"Gain a Reroll token",             eff:() => ({ token:"reroll" }) };
    if (i % 9 === 4)  return { name:"Quiet Grove",          type:"rest",    desc:"+1 · soft shield vs penalties",   eff:() => ({ bonus:1, softShield:true }) };
    const thN = THEMES[i % THEMES.length].name;
    return { name:`${thN} Stone`, type:"oracle", desc:"+1 · focus tag bonus", eff:() => ({ bonus:1, bonusTag:THEMES.find(t => t.name === thN)?.bonusTag || "wisdom" }) };
  });
}

function scoreCard(card, theme, reversed, mods) {
  let s = card.power || 0;
  if (theme?.bonusTag && (card.tags || []).includes(theme.bonusTag)) s += 3;
  if (theme && (card.name + " " + card.meaning).toLowerCase().includes(theme.name.toLowerCase())) s += 1;
  if (reversed) s = Math.max(0, s - 2);
  if (mods?.bonus) s += mods.bonus;
  if (mods?.bonusTag && (card.tags || []).includes(mods.bonusTag)) s += mods.tagBonus || 2;
  if (mods?.reversedBonus && reversed) s += mods.reversedBonus;
  if (mods?.mismatchPenalty && theme?.bonusTag && !(card.tags || []).includes(theme.bonusTag)) s -= mods.mismatchPenalty;
  if (mods?.flatMinus) s -= mods.flatMinus;
  return Math.max(0, s);
}

function aiPlay(hand, theme, strength, r) {
  const noise = Math.max(0, 9 - strength);
  const scored = hand.map(c => ({ card:c, total:scoreCard(c, theme, !!c.reversed, null) + (r() - 0.5) * noise }));
  if (strength >= 7) {
    const tc = {}; hand.forEach(c => (c.tags || []).forEach(t => tc[t] = (tc[t] || 1) + 1));
    scored.forEach(s => { const sc = (s.card.tags || []).reduce((a, t) => a + 1 / (tc[t] || 1), 0); s.total += 0.3 * sc; });
  }
  return scored.sort((a, b) => b.total - a.total)[0].card;
}

function defaultUse() {
  const u = {};
  ["ORACLE","QLOVE","IMPACT","CODEX","ELEMENTAL","MYTHIC","RELICS","SEASONS","CELESTIAL"].forEach(id => { u[id] = true; });
  ["SHADOW","ORACLE_HF","IMPACT_HF","TAROT_HF","SACRED_GEO","AFFIRMATION","MYSTERY_SW","TEQUILA_SLAPS"].forEach(id => { u[id] = false; });
  ["BREATH_SPIRAL","CODEX_MIRROR","SHADOW_SPIRAL","QI_CANE","QI_TAWSE","QI_BELT","QI_PADDLE","QI_SLAP_ROUND"].forEach(id => { u[id] = false; });
  PROC_DEFS.forEach(d => { u[d.id] = false; });
  return u;
}
function defaultOpts() { return { rounds:40, handSize:6, aiStrength:5, reversals:true, diceFaces:6, diceCount:1, seed:20250101, use:defaultUse() }; }
function loadOpts() {
  try { const r = localStorage.getItem(LS_KEY); return r ? { ...defaultOpts(), ...JSON.parse(r), use:{ ...defaultUse(), ...(JSON.parse(r).use||{}) } } : defaultOpts(); } catch { return defaultOpts(); }
}
function saveOpts(o) { try { localStorage.setItem(LS_KEY, JSON.stringify(o)); } catch {} }

/* ════════════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════════════ */
export default function TarotGame({ onQuit }) {
  const [opts, setOpts] = useState(loadOpts);
  const [draft, setDraft] = useState(() => loadOpts());
  const [showOpts, setShowOpts] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showGameplay, setShowGameplay] = useState(false);
  const [journal, setJournal] = useState(() => { try { return localStorage.getItem(LS_JOURNAL) || ""; } catch { return ""; } });
  const [showJournal, setShowJournal] = useState(false);
  const [log, setLog] = useState([]);
  const [flashCard, setFlashCard] = useState(null);
  const rand = useRef(mulberry32(opts.seed));

  const [gs, setGs] = useState(() => ({
    board:makeBoard(), playerPos:0, aiPos:0,
    lastDiceP:null, lastDiceA:null, diceListP:[], diceListA:[],
    tempMods:{ player:{}, ai:{} }, nextRollMinus1:false,
    drawPile:[], allCards:[], playerHand:[], aiHand:[],
    pScore:0, aScore:0, lastPPlay:null, lastAPlay:null, canUndo:false,
    tokens:{ reroll:0, bonus2:0 }, lastPDeckId:null,
    phase:"player_roll", active:false, round:0, aiThinking:false,
  }));

  // Log buffer ref — accumulates messages from setGs updaters without touching state
  const logBuffer = useRef([]);

  const flushLogs = () => {
    if (logBuffer.current.length > 0) {
      const msgs = logBuffer.current.slice().reverse();
      logBuffer.current = [];
      setLog(L => [...msgs, ...L].slice(0, 200));
    }
  };

  const bufLog = (msg) => { logBuffer.current.push(msg); };

  function startGame(o) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(o)); } catch {}
    const base = buildCards(o.use);
    let work = base.slice();
    if (o.reversals) work = work.concat(base.map(c => ({ ...c, id:c.id+"-R", name:c.name+" (Rev)", reversed:true })));
    const r = mulberry32(o.seed);
    rand.current = r;
    const pile = seededShuffle(work, r);
    const pH = [], aH = [];
    for (let i = 0; i < o.handSize; i++) { pH.push(pile.shift()); aH.push(pile.shift()); }
    setLog([]);
    setGs({
      board:makeBoard(), playerPos:0, aiPos:0,
      lastDiceP:null, lastDiceA:null, diceListP:[], diceListA:[],
      tempMods:{ player:{}, ai:{} }, nextRollMinus1:false,
      drawPile:pile, allCards:work,
      playerHand:sortHand(pH), aiHand:sortHand(aH),
      pScore:0, aScore:0, lastPPlay:null, lastAPlay:null, canUndo:false,
      tokens:{ reroll:0, bonus2:1 }, lastPDeckId:null,
      phase:"player_roll", active:true, round:0, aiThinking:false,
    });
    setTimeout(() => setLog(L => ["The Ring awakens. Your journey begins.", ...L]), 0);
  }

  useEffect(() => { startGame(opts); }, []); // eslint-disable-line
  useEffect(() => {
    const h = e => { if (e.key === "Escape") { setShowOpts(false); setShowRules(false); setShowJournal(false); setShowGameplay(false); } };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, []);
  useEffect(() => { try { localStorage.setItem(LS_JOURNAL, journal); } catch {} }, [journal]);
  useEffect(() => { if (flashCard) { const t = setTimeout(() => setFlashCard(null), 2000); return () => clearTimeout(t); } }, [flashCard]);

  const openOpts = () => { setDraft({ ...opts, use:{ ...opts.use } }); setShowOpts(true); };
  const applyOpts = () => { setOpts(draft); startGame(draft); setShowOpts(false); };

  const setDraftVal = (k, v) => setDraft(d => ({ ...d, [k]:v }));
  const setDraftUse = (id, v) => setDraft(d => ({ ...d, use:{ ...d.use, [id]:v } }));
  const activeCount = buildCards(draft.use).length;

  const baseTheme = THEMES[gs.round % THEMES.length];
  const pTheme = gs.tempMods.player.themeOverride || baseTheme;

  const moveOn = (who, steps) => {
    setGs(s => {
      const N = 60;
      const pos0 = who === "player" ? s.playerPos : s.aiPos;
      const st = (who === "player" && s.nextRollMinus1) ? Math.max(1, steps - 1) : steps;
      let newPos = (pos0 + st) % N; if (newPos < 0) newPos += N;
      const tile = s.board[newPos];
      const eff = tile.eff(rand.current);
      let pPos = s.playerPos, aPos = s.aiPos;
      let tokens = { ...s.tokens };
      let tempMods = { player:{ ...s.tempMods.player }, ai:{ ...s.tempMods.ai } };
      let nextRollMinus1 = who === "player" ? false : s.nextRollMinus1;


      if (who === "player") pPos = newPos; else aPos = newPos;
      if (eff.jump != null) { const to = ((newPos + eff.jump) % N + N) % N; if (who === "player") pPos = to; else aPos = to; }
      if (eff.jumpTo != null) { const to = eff.jumpTo % N; if (who === "player") pPos = to; else aPos = to; }
      if (eff.token && who === "player") tokens[eff.token] = (tokens[eff.token] || 0) + 1;
      if (eff.draw) tempMods[who].draw = (tempMods[who].draw || 0) + eff.draw;
      if (eff.themeOverride) tempMods[who].themeOverride = eff.themeOverride;
      if (eff.bonus) tempMods[who].bonus = (tempMods[who].bonus || 0) + eff.bonus;
      if (eff.bonusTag) { tempMods[who].bonusTag = eff.bonusTag; tempMods[who].tagBonus = eff.tagBonus || 2; }
      if (eff.reversedBonus) tempMods[who].reversedBonus = eff.reversedBonus;
      if (eff.echoDeckBonus) tempMods[who].echoDeckBonus = eff.echoDeckBonus;
      if (eff.lockUndo) tempMods[who].lockUndo = true;
      if (eff.noHint) tempMods[who].noHint = true;
      if (eff.lockTokens) tempMods[who].lockTokens = true;
      if (eff.skipDraw) tempMods[who].skipDraw = true;
      if (eff.discardAfter) tempMods[who].discardAfter = true;
      if (eff.aiBonus) tempMods[who].aiBonus = (tempMods[who].aiBonus || 0) + eff.aiBonus;
      if (eff.mismatchPenalty) tempMods[who].mismatchPenalty = eff.mismatchPenalty;
      if (eff.flatMinus) tempMods[who].flatMinus = (tempMods[who].flatMinus || 0) + eff.flatMinus;
      if (eff.punishment && eff.payload) {
        const p = eff.payload;
        bufLog(`★ Punishment: ${p.name} — ${p.desc}`);
        Object.entries(p.eff || {}).forEach(([k, v]) => {
          if (k === "jump") { const to = ((newPos + v) % N + N) % N; if (who === "player") pPos = to; else aPos = to; }
          else if (k === "nextRollMinus1" && who === "player") nextRollMinus1 = true;
          else tempMods[who][k] = v;
        });
      }
      if (eff.invokeDeck) {
        const pool = s.allCards.filter(c => c.deckId === eff.invokeDeck && !c.id.endsWith("-R"));
        if (pool.length) {
          const c = pool[Math.floor(rand.current() * pool.length)];
          tempMods[who].bonus = (tempMods[who].bonus || 0) + 1;
          tempMods[who].bonusTag = (c.tags || [])[0] || "vision";
          tempMods[who].tagBonus = 2;
          bufLog(`✦ Invoked ${eff.invokeDeck}: ${c.name} → +1 & #${tempMods[who].bonusTag}`);
        }
      }
      bufLog(`${who === "player" ? "You" : "AI"} rolled ${st} → ${tile.name}. ${tile.desc}`);
      return { ...s, playerPos:pPos, aiPos:aPos, tokens, tempMods, nextRollMinus1 };
    });
  };

  const applyDraws = (who) => {
    setGs(s => {
      const k = s.tempMods[who]?.draw || 0;
      if (!k || (who === "player" && s.tempMods.player.skipDraw)) return s;
      let dp = s.drawPile.slice(), hand = who === "player" ? s.playerHand.slice() : s.aiHand.slice();
      for (let i = 0; i < k && dp.length; i++) { const c = dp.shift(); hand.push(c); setFlashCard({ card:c, who }); }
      hand = sortHand(hand);
      return who === "player" ? { ...s, playerHand:hand, drawPile:dp } : { ...s, aiHand:hand, drawPile:dp };
    });
  };

  const rollPlayer = () => {
    setGs(s => {
      if (!s.active || s.phase !== "player_roll" || s.aiThinking) return s;
      const N = 60;
      const { rolls, sum } = rollMany(Math.max(1, opts.diceCount), Math.max(1, opts.diceFaces), rand.current);
      const r = rand.current;
      const st = s.nextRollMinus1 ? Math.max(1, sum - 1) : sum;
      let newPos = (s.playerPos + st) % N; if (newPos < 0) newPos += N;
      const tile = s.board[newPos];
      const eff = tile.eff(r);
      let pPos = newPos;
      let tokens = { ...s.tokens };
      let tempMods = { player:{ ...s.tempMods.player }, ai:{ ...s.tempMods.ai } };
      let nextRollMinus1 = false;


      if (eff.jump != null) { pPos = ((newPos + eff.jump) % N + N) % N; }
      if (eff.jumpTo != null) { pPos = eff.jumpTo % N; }
      if (eff.token) tokens[eff.token] = (tokens[eff.token] || 0) + 1;
      if (eff.draw) tempMods.player.draw = (tempMods.player.draw || 0) + eff.draw;
      if (eff.themeOverride) tempMods.player.themeOverride = eff.themeOverride;
      if (eff.bonus) tempMods.player.bonus = (tempMods.player.bonus || 0) + eff.bonus;
      if (eff.bonusTag) { tempMods.player.bonusTag = eff.bonusTag; tempMods.player.tagBonus = eff.tagBonus || 2; }
      if (eff.reversedBonus) tempMods.player.reversedBonus = eff.reversedBonus;
      if (eff.echoDeckBonus) tempMods.player.echoDeckBonus = eff.echoDeckBonus;
      if (eff.lockUndo) tempMods.player.lockUndo = true;
      if (eff.noHint) tempMods.player.noHint = true;
      if (eff.lockTokens) tempMods.player.lockTokens = true;
      if (eff.skipDraw) tempMods.player.skipDraw = true;
      if (eff.discardAfter) tempMods.player.discardAfter = true;
      if (eff.aiBonus) tempMods.player.aiBonus = (tempMods.player.aiBonus || 0) + eff.aiBonus;
      if (eff.mismatchPenalty) tempMods.player.mismatchPenalty = eff.mismatchPenalty;
      if (eff.flatMinus) tempMods.player.flatMinus = (tempMods.player.flatMinus || 0) + eff.flatMinus;
      if (eff.punishment && eff.payload) {
        const p = eff.payload;
        bufLog(`★ Punishment: ${p.name} — ${p.desc}`);
        Object.entries(p.eff || {}).forEach(([k, v]) => {
          if (k === "jump") { pPos = ((pPos + v) % N + N) % N; }
          else if (k === "nextRollMinus1") nextRollMinus1 = true;
          else tempMods.player[k] = v;
        });
      }
      if (eff.invokeDeck) {
        const pool = s.allCards.filter(c => c.deckId === eff.invokeDeck && !c.id.endsWith("-R"));
        if (pool.length) {
          const c = pool[Math.floor(r() * pool.length)];
          tempMods.player.bonus = (tempMods.player.bonus || 0) + 1;
          tempMods.player.bonusTag = (c.tags || [])[0] || "vision";
          tempMods.player.tagBonus = 2;
          bufLog(`✦ Invoked ${eff.invokeDeck}: ${c.name} → +1 & #${tempMods.player.bonusTag}`);
        }
      }

      let dp = s.drawPile.slice();
      let hand = s.playerHand.slice();
      const drawCount = tempMods.player.draw || 0;
      if (drawCount && !tempMods.player.skipDraw) {
        for (let i = 0; i < drawCount && dp.length; i++) hand.push(dp.shift());
        hand = sortHand(hand);
        tempMods.player.draw = 0;
      }

      bufLog(`You rolled ${st} → ${tile.name}. ${tile.desc}`);

      return {
        ...s,
        playerPos: pPos,
        lastDiceP: sum,
        diceListP: rolls,
        phase: "player_play",
        tokens,
        tempMods,
        nextRollMinus1,
        playerHand: hand,
        drawPile: dp,
      };
    });
    flushLogs();
  };

  const handlePlay = (card) => {
    setGs(s => {
      if (!s.active || s.phase !== "player_play" || s.lastPPlay || s.aiThinking) return s;
      const tm = s.tempMods.player || {};
      const theme = tm.themeOverride || THEMES[s.round % THEMES.length];
      let sc = scoreCard(card, theme, !!card.reversed, tm);
      if (tm.echoDeckBonus && s.lastPDeckId === card.deckId) sc += tm.echoDeckBonus;
      return { ...s, playerHand:s.playerHand.filter(c => c.id !== card.id), lastPPlay:{ ...card, score:sc, themeUsed:theme }, canUndo:!tm.lockUndo, lastPDeckId:card.deckId };
    });
  };

  const handleUndo = () => {
    setGs(s => {
      if (!s.canUndo || !s.lastPPlay || s.aiThinking) return s;
      return { ...s, playerHand:sortHand(s.playerHand.concat(s.lastPPlay)), lastPPlay:null, canUndo:false };
    });
  };

  const useToken = (name) => {
    setGs(s => {
      if (!s.tokens[name] || s.tempMods.player.lockTokens || s.aiThinking) return s;
      if (name === "bonus2" && s.lastPPlay) {
        return { ...s, tokens:{ ...s.tokens, bonus2:s.tokens.bonus2-1 }, lastPPlay:{ ...s.lastPPlay, score:s.lastPPlay.score+2 } };
      }
      if (name === "reroll" && s.phase === "player_play") {
        return { ...s, tokens:{ ...s.tokens, reroll:s.tokens.reroll-1 }, phase:"player_roll" };
      }
      return s;
    });
  };

  const endTurn = () => {
    setGs(s => {
      if (!s.active || s.phase !== "player_play" || s.aiThinking) return s;
      // Capture lastPPlay value — works even if strict mode double-invokes
      const pPlay = s.lastPPlay;
      const pPlayScore = pPlay ? pPlay.score : 0;

      const N = 60;
      const r = rand.current;


      // ── 1. Optional player discard (Card Tax punishment) ──
      let pH = s.playerHand.slice();
      if (s.tempMods.player.discardAfter && pH.length) {
        const idx = Math.floor(r() * pH.length);
        bufLog(`★ Card Tax: discarded ${pH[idx].name}.`);
        pH = pH.filter((_, i) => i !== idx);
      }

      // ── 2. AI rolls dice ──
      const { rolls: aiRolls, sum: aiSum } = rollMany(Math.max(1, opts.diceCount), Math.max(1, opts.diceFaces), r);

      // ── 3. AI moves on ring ──
      let aiPos = s.aiPos;
      let aiNewPos = (aiPos + aiSum) % N; if (aiNewPos < 0) aiNewPos += N;
      const aiTile = s.board[aiNewPos];
      const aiEff = aiTile.eff(r);
      let aiMods = { ...s.tempMods.ai };

      if (aiEff.jump != null) { aiNewPos = ((aiNewPos + aiEff.jump) % N + N) % N; }
      if (aiEff.jumpTo != null) { aiNewPos = aiEff.jumpTo % N; }
      aiPos = aiNewPos;
      if (aiEff.draw) aiMods.draw = (aiMods.draw || 0) + aiEff.draw;
      if (aiEff.themeOverride) aiMods.themeOverride = aiEff.themeOverride;
      if (aiEff.bonus) aiMods.bonus = (aiMods.bonus || 0) + aiEff.bonus;
      if (aiEff.bonusTag) { aiMods.bonusTag = aiEff.bonusTag; aiMods.tagBonus = aiEff.tagBonus || 2; }
      if (aiEff.reversedBonus) aiMods.reversedBonus = aiEff.reversedBonus;
      if (aiEff.echoDeckBonus) aiMods.echoDeckBonus = aiEff.echoDeckBonus;
      if (aiEff.flatMinus) aiMods.flatMinus = (aiMods.flatMinus || 0) + aiEff.flatMinus;
      if (aiEff.mismatchPenalty) aiMods.mismatchPenalty = aiEff.mismatchPenalty;
      if (aiEff.punishment && aiEff.payload) {
        const p = aiEff.payload;
        bufLog(`AI ★ Punishment: ${p.name} — ${p.desc}`);
        Object.entries(p.eff || {}).forEach(([k, v]) => {
          if (k === "jump") { aiPos = ((aiPos + v) % N + N) % N; }
          else aiMods[k] = v;
        });
      }
      if (aiEff.invokeDeck) {
        const pool = s.allCards.filter(c => c.deckId === aiEff.invokeDeck && !c.id.endsWith("-R"));
        if (pool.length) {
          const c = pool[Math.floor(r() * pool.length)];
          aiMods.bonus = (aiMods.bonus || 0) + 1;
          aiMods.bonusTag = (c.tags || [])[0] || "vision";
          aiMods.tagBonus = 2;
          bufLog(`✦ AI Invoked ${aiEff.invokeDeck}: ${c.name} → +1 & #${aiMods.bonusTag}`);
        }
      }
      bufLog(`AI rolled ${aiSum} → ${aiTile.name}.`);

      // ── 4. AI draws from tile effect ──
      let dp = s.drawPile.slice();
      let aiHand = s.aiHand.slice();
      const aiDrawCount = aiMods.draw || 0;
      if (aiDrawCount && !aiMods.skipDraw) {
        for (let i = 0; i < aiDrawCount && dp.length; i++) aiHand.push(dp.shift());
      }

      // ── 5. AI plays best card ──
      const aiTh = aiMods.themeOverride || THEMES[s.round % THEMES.length];
      if (!aiHand.length) {
        bufLog("AI has no cards to play.");
        return { ...s, playerHand:sortHand(pH), aiHand, aiPos, drawPile:dp, lastDiceA:aiSum, diceListA:aiRolls, lastPPlay:null, canUndo:false, phase:"player_roll", tempMods:{ player:{}, ai:{} }, round:s.round+1, aiThinking:false, pScore:s.pScore+pPlayScore };
      }
      const aiCard = aiPlay(aiHand, aiTh, opts.aiStrength, r);
      let aiSc = scoreCard(aiCard, aiTh, !!aiCard.reversed, aiMods);
      if (aiMods.echoDeckBonus && r() < 0.5) aiSc += aiMods.echoDeckBonus;
      if (s.tempMods.player.aiBonus) aiSc += s.tempMods.player.aiBonus;
      aiHand = aiHand.filter(c => c.id !== aiCard.id);

      // ── 6. Both players draw 1 ──
      if (dp.length) pH.push(dp.shift());
      if (dp.length) aiHand.push(dp.shift());

      bufLog(`AI played ${aiCard.name} (${aiCard.deckId}) for +${aiSc}.`);

      // ── 7. Single atomic state update ──
      return {
        ...s,
        playerHand: sortHand(pH),
        aiHand: sortHand(aiHand),
        drawPile: dp,
        aiPos,
        lastDiceA: aiSum,
        diceListA: aiRolls,
        pScore: s.pScore + pPlayScore,
        aScore: s.aScore + aiSc,
        lastAPlay: { ...aiCard, score:aiSc, themeUsed:aiTh },
        lastPPlay: null,
        canUndo: false,
        phase: "player_roll",
        tempMods: { player:{}, ai:{} },
        round: s.round + 1,
        aiThinking: false,
      };
    });
    flushLogs();
  };

  const isOver = gs.active && gs.round >= opts.rounds;
  const winner = isOver ? (gs.pScore === gs.aScore ? "Draw!" : gs.pScore > gs.aScore ? "You Win ✦" : "AI Wins ✧") : "";

  const hints = !gs.active || gs.tempMods.player.noHint ? [] :
    gs.playerHand.map(c => ({ card:c, score:scoreCard(c, pTheme, !!c.reversed, gs.tempMods.player) })).sort((a,b) => b.score-a.score).slice(0,3);

  const RING_SIZE = 60, ringW = 580, ringH = 580;
  const tilePositions = (() => {
    const cx = ringW/2, cy = ringH/2, radius = ringW * 0.44;
    return Array.from({ length: RING_SIZE }, (_, i) => {
      const ang = (2 * Math.PI * i / RING_SIZE) - Math.PI / 2;
      return { x: cx + radius * Math.cos(ang) - 52, y: cy + radius * Math.sin(ang) - 31 };
    });
  })();

  /* ── CSS ── */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html,body,#root{height:100%}
    body{background:#f5f2ed;color:#1a1a2e;font-family:'Lato',sans-serif;font-size:14px;line-height:1.5}
    ::-webkit-scrollbar{width:6px;height:6px}
    ::-webkit-scrollbar-track{background:#e8e4de}
    ::-webkit-scrollbar-thumb{background:#b5a99a;border-radius:99px}
    .app{display:flex;flex-direction:column;min-height:100vh}
    .hdr{position:sticky;top:0;z-index:20;display:flex;align-items:center;justify-content:space-between;padding:10px 18px;background:#fff;border-bottom:1px solid #ddd8d0;box-shadow:0 2px 12px rgba(0,0,0,.06);gap:12px;flex-wrap:wrap}
    .hdr-left,.hdr-right{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
    .hdr-center{display:flex;flex-direction:column;align-items:center;gap:2px}
    .hdr-title{font-family:'Cinzel',serif;font-size:17px;color:#2a1f3d;letter-spacing:.08em}
    .scoreboard{display:flex;gap:20px;align-items:center;font-weight:700;font-size:15px}
    .score-you{color:#7c5cbf}.score-ai{color:#0e8f8f}
    .score-theme{color:#666;font-size:12px;font-weight:400;margin-left:4px}
    .winner-banner{font-family:'Cinzel',serif;font-size:16px;color:#7c5cbf;text-align:center}
    .btn{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:8px;border:none;font-family:'Lato',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all .15s ease;white-space:nowrap}
    .btn-primary{background:#2a1f3d;color:#fff}.btn-primary:hover{background:#3d2e57}
    .btn-secondary{background:#e8e4de;color:#2a1f3d}.btn-secondary:hover{background:#ddd8d0}
    .btn-accent{background:#7c5cbf;color:#fff}.btn-accent:hover{background:#6b4daa}
    .btn-apply{background:#16803a;color:#fff;font-size:14px;padding:9px 20px}.btn-apply:hover{background:#146a32}
    .btn-danger{background:#c8342a;color:#fff}.btn-danger:hover{background:#b02b22}
    .btn:disabled{opacity:.4;cursor:not-allowed}
    .btn-close{background:none;border:none;cursor:pointer;font-size:18px;color:#666;padding:4px 8px;border-radius:6px}
    .btn-close:hover{background:#eee}
    .ai-slider{display:flex;align-items:center;gap:6px;font-size:12px;color:#666}
    .ai-slider input{width:80px;accent-color:#7c5cbf}
    .main{display:grid;grid-template-columns:280px 1fr 340px;gap:12px;padding:12px;max-width:1460px;margin:0 auto;width:100%;align-items:start}
    .panel{background:#fff;border:1px solid #ddd8d0;border-radius:14px;padding:12px;box-shadow:0 2px 10px rgba(0,0,0,.04)}
    .panel-title{font-family:'Cinzel',serif;font-size:12px;letter-spacing:.1em;color:#7c5cbf;margin-bottom:10px;text-transform:uppercase}
    .log-body{max-height:calc(100vh - 200px);overflow-y:auto;display:flex;flex-direction:column;gap:6px;padding-right:2px}
    .log-line{font-size:12px;color:#444;padding:4px 8px;border-left:2px solid #ddd8d0;animation:fadeIn .3s ease}
    .log-line:first-child{border-left-color:#7c5cbf;color:#2a1f3d;font-weight:600}
    @keyframes fadeIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
    .board-shell{background:#fff;border:1px solid #ddd8d0;border-radius:14px;overflow:auto;display:flex;align-items:center;justify-content:center;min-height:580px;box-shadow:0 2px 10px rgba(0,0,0,.04)}
    .ring-wrap{position:relative;flex-shrink:0}
    .ring-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;pointer-events:none}
    .rc-orb{width:140px;height:140px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#f0eaf9,#ddd4f5,#c5b8e8);border:2px solid #b0a0d8;box-shadow:0 0 30px rgba(124,92,191,.18);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;pointer-events:auto}
    .rc-round{font-family:'Cinzel',serif;font-size:11px;color:#5a4080;letter-spacing:.05em}
    .rc-theme-name{font-family:'Cinzel',serif;font-size:13px;color:#2a1f3d;font-weight:600}
    .ring-tile{position:absolute;width:104px;height:62px;background:#fff;border:1.5px solid #ddd8d0;border-radius:10px;padding:6px 7px;display:flex;flex-direction:column;justify-content:space-between;transition:box-shadow .15s,border-color .15s;cursor:default;overflow:hidden}
    .ring-tile:hover{box-shadow:0 4px 16px rgba(0,0,0,.12);border-color:#b5a99a;z-index:5}
    .rt-name{font-size:10px;font-weight:700;color:#2a1f3d;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .rt-type-badge{font-size:9px;color:#888;text-transform:uppercase;letter-spacing:.05em}
    .rt-markers{display:flex;gap:4px;position:absolute;right:5px;bottom:4px;font-size:13px}
    .ring-tile.type-start{background:linear-gradient(135deg,#eff6ff,#e0d8f7);border-color:#b0a0d8}
    .ring-tile.type-blessing{background:#f0fdf4;border-color:#86efac}
    .ring-tile.type-theme{background:#f5f3ff;border-color:#c4b5fd}
    .ring-tile.type-invoke{background:#fdf4ff;border-color:#e9d5ff}
    .ring-tile.type-punish{background:#fef2f2;border-color:#fecaca}
    .ring-tile.type-portal{background:#ecfdf5;border-color:#6ee7b7}
    .ring-tile.type-mirror{background:#fff7ed;border-color:#fed7aa}
    .ring-tile.type-market{background:#fffbeb;border-color:#fde68a}
    .ring-tile.type-rest{background:#f0fdf4;border-color:#bbf7d0}
    .ring-tile.type-wild{background:#fdf2f8;border-color:#fbcfe8}
    .ring-tile.p-here{border-color:#7c5cbf !important;box-shadow:0 0 0 2px rgba(124,92,191,.3)}
    .ring-tile.a-here{border-color:#0e8f8f !important;box-shadow:0 0 0 2px rgba(14,143,143,.25)}
    .right-col{display:flex;flex-direction:column;gap:10px}
    .plays-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .play-slot{background:#faf9f7;border:1px solid #ddd8d0;border-radius:10px;padding:8px}
    .play-slot-title{font-family:'Cinzel',serif;font-size:10px;letter-spacing:.1em;color:#888;margin-bottom:6px;text-transform:uppercase}
    .play-slot-score{font-weight:700;font-size:16px;color:#16803a;margin-top:4px}
    .slot-empty{text-align:center;color:#bbb;padding:20px 0;font-size:22px}
    .controls{display:flex;gap:6px;flex-wrap:wrap}
    .tokens-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
    .tok-badge{display:inline-flex;align-items:center;gap:4px;padding:4px 8px;background:#f5f2ed;border:1px solid #ddd8d0;border-radius:99px;font-size:12px;font-weight:700}
    .warn-badge{padding:5px 10px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;font-size:12px;color:#92400e}
    .hand-title{font-family:'Cinzel',serif;font-size:11px;letter-spacing:.08em;color:#7c5cbf;margin-bottom:8px;text-transform:uppercase}
    .hand-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;max-height:calc(100vh - 310px);overflow-y:auto;padding-right:2px}
    .card-btn{display:block;background:none;border:none;padding:0;cursor:pointer;text-align:left;width:100%;transition:transform .12s}
    .card-btn:hover:not(:disabled){transform:translateY(-2px)}
    .card-btn:disabled{cursor:not-allowed;opacity:.7}
    .card{background:#fff;border:1.5px solid #ddd8d0;border-radius:12px;padding:10px;display:grid;grid-template-rows:auto auto 1fr auto;gap:4px;min-height:145px;transition:box-shadow .15s,border-color .15s;position:relative;overflow:hidden}
    .card::before{content:attr(data-glyph);position:absolute;top:6px;right:8px;font-size:18px;opacity:.06;pointer-events:none}
    .card:hover{box-shadow:0 6px 20px rgba(0,0,0,.1)}
    .card.highlight{border-color:#7c5cbf;box-shadow:0 0 0 2px rgba(124,92,191,.25)}
    .card-head{display:flex;justify-content:space-between;align-items:center}
    .card-deck-badge{font-size:10px;font-weight:700;color:#fff;padding:2px 6px;border-radius:99px}
    .card-rev{font-size:10px;color:#c8342a;font-weight:700}
    .card-name{font-family:'Cinzel',serif;font-size:12px;font-weight:600;color:#2a1f3d}
    .card-meaning{font-size:11px;color:#555;line-height:1.4}
    .card-foot{display:flex;justify-content:space-between;align-items:center;margin-top:2px}
    .card-tags{font-size:10px;color:#888;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .card-power{font-weight:800;font-size:14px;color:#16803a}
    .dice-readout{font-size:12px;color:#666}
    .dice-readout b{color:#2a1f3d;font-size:15px}
    .journal-textarea{width:100%;min-height:180px;border:1px solid #ddd8d0;border-radius:10px;padding:10px;font-family:'Lato',sans-serif;font-size:13px;color:#2a1f3d;background:#faf9f7;resize:vertical;outline:none}
    .journal-textarea:focus{border-color:#7c5cbf}
    .modal-overlay{position:fixed;inset:0;z-index:100;background:rgba(26,20,46,.45);display:flex;align-items:center;justify-content:center;padding:16px}
    .modal-box{background:#fff;border-radius:16px;border:1px solid #ddd8d0;width:min(1100px,96vw);max-height:90vh;display:flex;flex-direction:column;box-shadow:0 24px 60px rgba(0,0,0,.15);overflow:hidden}
    .modal-hdr{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid #eee;flex-shrink:0}
    .modal-title{font-family:'Cinzel',serif;font-size:15px;color:#2a1f3d}
    .modal-body{overflow-y:auto;padding:14px 18px;flex:1}
    .modal-footer{padding:12px 18px;border-top:2px solid #e8e4de;display:flex;gap:8px;justify-content:flex-end;align-items:center;flex-shrink:0;background:#faf9f7}
    .modal-footer-info{margin-right:auto;font-size:12px;color:#888}
    .opts-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;margin-bottom:16px}
    .opt-field{display:flex;flex-direction:column;gap:4px}
    .opt-label{font-size:11px;font-weight:700;color:#666;text-transform:uppercase;letter-spacing:.05em}
    .opt-input{padding:7px 10px;border:1px solid #ddd8d0;border-radius:8px;font-family:'Lato',sans-serif;font-size:13px;color:#2a1f3d;background:#faf9f7;outline:none}
    .opt-input:focus{border-color:#7c5cbf}
    .quick-dice{display:flex;gap:4px;flex-wrap:wrap;margin-top:4px}
    .qd-btn{padding:3px 8px;border:1px solid #ddd8d0;border-radius:99px;background:#fff;font-size:11px;cursor:pointer;color:#555}
    .qd-btn:hover{background:#f0eaf9;border-color:#7c5cbf;color:#7c5cbf}
    .deck-group{margin-bottom:14px}
    .deck-group-title{font-family:'Cinzel',serif;font-size:11px;letter-spacing:.08em;color:#fff;margin:0;text-transform:uppercase;padding:8px 12px 6px;background:#7c5cbf;border-radius:8px 8px 0 0}
    .deck-group-note{font-size:11px;color:#555;padding:4px 12px 6px;background:#f0eaf9;border:1px solid #e0d8f7;border-bottom:none;font-style:italic}
    .deck-toggles{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:2px;background:#fff;border:1px solid #e8e4de;border-radius:0 0 8px 8px;padding:6px}
    .deck-toggle{display:flex;align-items:center;gap:8px;padding:5px 8px;border-radius:8px;cursor:pointer}
    .deck-toggle:hover{background:#f5f2ed}
    .deck-toggle input{accent-color:#7c5cbf;width:14px;height:14px;flex-shrink:0}
    .deck-toggle span{font-size:12px;color:#333}
    .rule-section{margin-bottom:16px}
    .rule-section h3{font-family:'Cinzel',serif;font-size:14px;color:#2a1f3d;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #eee}
    .rule-section ul,.rule-section ol{padding-left:20px}
    .rule-section li{margin:4px 0;font-size:13px;color:#444}
    .deck-acc{border:1px solid #ddd8d0;border-radius:10px;margin:6px 0}
    .deck-acc summary{padding:8px 12px;cursor:pointer;font-weight:700;font-size:13px;color:#2a1f3d}
    .acc-table{width:100%;border-collapse:collapse;font-size:12px}
    .acc-table th{padding:6px 8px;text-align:left;background:#f5f2ed;color:#666;font-weight:700;border-bottom:1px solid #eee}
    .acc-table td{padding:5px 8px;border-bottom:1px solid #f0ede8;vertical-align:top}
    .acc-table tr:last-child td{border-bottom:none}
    .flash-overlay{position:fixed;bottom:20px;right:20px;z-index:50;animation:slideUp .3s ease,fadeOut .3s ease 1.5s forwards;pointer-events:none}
    @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeOut{from{opacity:1}to{opacity:0}}
    .btn-gameplay{background:#16536b;color:#fff}.btn-gameplay:hover{background:#124456}
    .gp-modal-box{background:#fff;border-radius:16px;border:1px solid #ddd8d0;width:min(1140px,97vw);max-height:93vh;display:flex;flex-direction:column;box-shadow:0 24px 60px rgba(0,0,0,.18);overflow:hidden}
    .gp-body{overflow-y:auto;padding:0;flex:1;font-family:'Lato',sans-serif;font-size:13px;line-height:1.7;color:#1a1a2e}
    .gp-hero{background:linear-gradient(135deg,#2a1f3d,#1a3a4a);color:#fff;padding:22px 28px 18px;position:sticky;top:0;z-index:5}
    .gp-hero-title{font-family:'Cinzel',serif;font-size:19px;letter-spacing:.07em;color:#e8d5ff;margin-bottom:4px}
    .gp-hero-sub{font-size:12px;color:#a89cc8;letter-spacing:.04em}
    .gp-toc{display:flex;gap:8px;flex-wrap:wrap;padding:10px 28px;background:#f8f6ff;border-bottom:1px solid #e8e4f0}
    .gp-toc a{font-size:11px;font-weight:700;color:#7c5cbf;text-decoration:none;padding:3px 9px;border-radius:99px;border:1px solid #d4c8f0;background:#fff;white-space:nowrap}
    .gp-toc a:hover{background:#f0eaf9}
    .gp-section{padding:20px 28px;border-bottom:1px solid #f0ede8}
    .gp-section:last-child{border-bottom:none}
    .gp-section h2{font-family:'Cinzel',serif;font-size:15px;color:#2a1f3d;margin-bottom:12px;padding-bottom:6px;border-bottom:2px solid #7c5cbf;display:flex;align-items:center;gap:8px}
    .gp-section h3{font-family:'Cinzel',serif;font-size:13px;color:#4a3576;margin:14px 0 6px}
    .gp-section h4{font-size:12px;font-weight:700;color:#7c5cbf;margin:10px 0 4px;text-transform:uppercase;letter-spacing:.05em}
    .gp-section p{margin-bottom:8px;color:#333}
    .gp-section ul,.gp-section ol{padding-left:20px;margin-bottom:8px}
    .gp-section li{margin:3px 0;color:#333}
    .gp-section code{background:#f0eaf9;color:#4a3576;padding:1px 5px;border-radius:4px;font-size:12px}
    .gp-callout{background:linear-gradient(135deg,#f5f0ff,#edf5ff);border-left:4px solid #7c5cbf;padding:10px 14px;border-radius:0 10px 10px 0;margin:10px 0;font-size:13px;color:#2a1f3d}
    .gp-warning{background:#fff8ed;border-left:4px solid #e07c2a;padding:10px 14px;border-radius:0 10px 10px 0;margin:10px 0;font-size:13px;color:#2a1f3d}
    .gp-success{background:#f0fdf4;border-left:4px solid #16803a;padding:10px 14px;border-radius:0 10px 10px 0;margin:10px 0;font-size:13px;color:#1a3a2a}
    .gp-danger{background:#fef2f2;border-left:4px solid #c8342a;padding:10px 14px;border-radius:0 10px 10px 0;margin:10px 0;font-size:13px;color:#2a1a1a}
    .gp-score-row{display:flex;gap:4px;align-items:center;padding:6px 10px;background:#f8f6ff;border-radius:8px;font-size:12px;margin:6px 0;border:1px solid #e8e4f0}
    .gp-score-you{color:#7c5cbf;font-weight:800;min-width:80px}
    .gp-score-ai{color:#0e8f8f;font-weight:800;min-width:80px}
    .gp-score-gap{color:#888;font-size:11px}
    .gp-round-hdr{display:flex;align-items:center;gap:8px;background:#2a1f3d;color:#fff;padding:7px 12px;border-radius:8px;margin:14px 0 6px;font-family:'Cinzel',serif;font-size:12px}
    .gp-round-num{background:#7c5cbf;color:#fff;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:700}
    .gp-round-theme{color:#e8d5ff;font-size:11px}
    .gp-round-tag{color:#a89cc8;font-size:11px}
    .gp-play-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:8px 0}
    .gp-play-card{background:#faf9f7;border:1px solid #e8e4de;border-radius:10px;padding:10px 12px}
    .gp-play-card.you{border-left:3px solid #7c5cbf}
    .gp-play-card.ai{border-left:3px solid #0e8f8f}
    .gp-play-who{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px}
    .gp-play-who.you{color:#7c5cbf}
    .gp-play-who.ai{color:#0e8f8f}
    .gp-calc{font-family:monospace;font-size:11px;color:#555;background:#f5f2ed;padding:4px 8px;border-radius:6px;margin-top:4px;display:block}
    .gp-score-badge{display:inline-block;background:#7c5cbf;color:#fff;padding:2px 8px;border-radius:99px;font-weight:700;font-size:12px;margin-left:4px}
    .gp-score-badge.ai{background:#0e8f8f}
    .gp-act-banner{background:linear-gradient(90deg,#2a1f3d,#4a3576);color:#fff;padding:12px 20px;border-radius:10px;margin:16px 0 10px;font-family:'Cinzel',serif;font-size:14px;display:flex;align-items:center;gap:12px}
    .gp-final-table{width:100%;border-collapse:collapse;font-size:13px;margin:10px 0}
    .gp-final-table th{background:#2a1f3d;color:#fff;padding:8px 12px;text-align:left;font-family:'Cinzel',serif;font-size:11px;letter-spacing:.05em}
    .gp-final-table td{padding:7px 12px;border-bottom:1px solid #f0ede8;vertical-align:top}
    .gp-final-table tr:last-child td{background:#f5f0ff;font-weight:700}
    .gp-hand-cards{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}
    .gp-hand-card{background:#fff;border:1.5px solid #ddd8d0;border-radius:8px;padding:5px 9px;font-size:11px;display:flex;flex-direction:column;gap:1px;min-width:130px}
    .gp-hand-card-name{font-weight:700;color:#2a1f3d;font-size:12px}
    .gp-hand-card-deck{font-size:10px;font-weight:700;color:#fff;padding:1px 5px;border-radius:99px;display:inline-block;margin:1px 0}
    .gp-hand-card-tags{font-size:10px;color:#888}
    .gp-hand-card-power{font-weight:800;color:#16803a;font-size:13px}
    .gp-theme-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:8px 0}
    .gp-theme-card{border-radius:8px;padding:8px 10px;border:1px solid #ddd8d0}
    .gp-strategy-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:8px 0}
    .gp-strategy-item{background:#faf9f7;border:1px solid #e8e4de;border-radius:8px;padding:10px 12px;font-size:12px;color:#333}
    .gp-strategy-item b{color:#2a1f3d}
    .gp-phase-bar{height:8px;background:linear-gradient(90deg,#7c5cbf,#c25d8a,#e07c2a,#0e8f8f,#16803a,#2a6be0);border-radius:99px;margin:6px 0}
    @media(max-width:700px){.gp-play-grid{grid-template-columns:1fr}.gp-theme-grid{grid-template-columns:1fr 1fr}.gp-strategy-grid{grid-template-columns:1fr}}
  `;

  return (
    <div className="app">
      <style>{css}</style>

      <header className="hdr">
        <div className="hdr-left">
          <span className="hdr-title">✦ Tarot Insight Duel <span style={{fontSize:10,fontFamily:"monospace",background:"#7c5cbf",color:"#fff",padding:"2px 7px",borderRadius:99,verticalAlign:"middle",letterSpacing:"0.04em",fontWeight:400}}>v6.4</span></span>
          <button className="btn btn-secondary" onClick={openOpts}>New Game / Options</button>
          <button className="btn btn-gameplay" onClick={() => setShowGameplay(true)}>Gameplay ▶</button>
          <button className="btn btn-secondary" onClick={() => setShowRules(true)}>Rules & Decks</button>
          <button className="btn btn-secondary" onClick={() => setShowJournal(v => !v)}>Chronicle</button>
        </div>
        <div className="hdr-center">
          <div className="scoreboard">
            <span className="score-you">You: <b>{gs.pScore}</b></span>
            <span className="score-ai">AI: <b>{gs.aScore}</b></span>
            <span className="score-theme">Round {Math.min(gs.round+1,opts.rounds)}/{opts.rounds}<span style={{color:pTheme.color,fontWeight:700,marginLeft:6}}>· {pTheme.name}</span></span>
          </div>
          {isOver && <div className="winner-banner">{winner}</div>}
        </div>
        <div className="hdr-right">
          <div className="ai-slider">AI <input type="range" min={1} max={8} value={opts.aiStrength} onChange={e => { const v=Number(e.target.value); setOpts(o => ({...o,aiStrength:v})); saveOpts({...opts,aiStrength:v}); }} /> {opts.aiStrength}</div>
          <button className="btn btn-danger" onClick={() => onQuit ? onQuit() : alert("Provide onQuit prop.")}>Quit</button>
        </div>
      </header>

      <main className="main">
        <aside className="panel">
          <div className="panel-title">Turn Chronicle</div>
          <div className="log-body">{log.map((l,i) => <div key={i} className="log-line">{l}</div>)}</div>
        </aside>

        <section className="board-shell">
          <div className="ring-wrap" style={{width:ringW,height:ringH}}>
            <div className="ring-center">
              <div className="rc-orb">
                <span style={{fontSize:22,color:pTheme.color}}>✦</span>
                <span className="rc-theme-name" style={{color:pTheme.color}}>{pTheme.name}</span>
                <span className="rc-round">Round {Math.min(gs.round+1,opts.rounds)} / {opts.rounds}</span>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,marginTop:6,pointerEvents:"auto"}}>
                <button className="btn btn-accent" disabled={gs.phase!=="player_roll"||isOver||gs.aiThinking} onClick={rollPlayer} style={{fontSize:13}}>{gs.aiThinking ? "AI thinking… ⏳" : `Roll ${opts.diceCount}×d${opts.diceFaces} 🎲`}</button>
                <div className="dice-readout" style={{textAlign:"center"}}>You: <b>{gs.lastDiceP??"—"}</b>{gs.diceListP.length>1?` (${gs.diceListP.join("+")})`:""} · AI: <b>{gs.lastDiceA??"—"}</b></div>
              </div>
            </div>
            {gs.board.map((tile,i) => (
              <div key={i} className={`ring-tile type-${tile.type} ${i===gs.playerPos?"p-here":""} ${i===gs.aiPos?"a-here":""}`}
                style={{left:tilePositions[i].x,top:tilePositions[i].y,position:"absolute"}} title={`${i+1}. ${tile.name} — ${tile.desc}`}>
                <div className="rt-name">{tile.name}</div>
                <div className="rt-type-badge">{tile.type}</div>
                <div className="rt-markers">{i===gs.playerPos&&<span title="You">🧭</span>}{i===gs.aiPos&&<span title="AI">🤖</span>}</div>
              </div>
            ))}
          </div>
        </section>

        <aside className="right-col">
          <div className="panel">
            <div className="panel-title">Active Plays</div>
            <div className="plays-grid">
              <div className="play-slot">
                <div className="play-slot-title">Your Play</div>
                {gs.lastPPlay ? <><CardView card={gs.lastPPlay} highlight /><div className="play-slot-score">+{gs.lastPPlay.score}</div></> : <div className="slot-empty">—</div>}
              </div>
              <div className="play-slot">
                <div className="play-slot-title">AI Play</div>
                {gs.lastAPlay ? <><CardView card={gs.lastAPlay} /><div className="play-slot-score">+{gs.lastAPlay.score}</div></> : <div className="slot-empty">—</div>}
              </div>
            </div>
          </div>
          <div className="panel">
            <div className="tokens-row">
              <span className="tok-badge">🔄 ×{gs.tokens.reroll}</span>
              <button className="btn btn-secondary" style={{fontSize:12}} disabled={gs.tokens.reroll<=0||gs.phase!=="player_play"||gs.tempMods.player.lockTokens} onClick={() => useToken("reroll")}>Use Reroll</button>
              <span className="tok-badge">⭐ ×{gs.tokens.bonus2}</span>
              <button className="btn btn-secondary" style={{fontSize:12}} disabled={gs.tokens.bonus2<=0||!gs.lastPPlay||gs.tempMods.player.lockTokens} onClick={() => useToken("bonus2")}>Use +2</button>
            </div>
            {gs.tempMods.player.lockTokens && <div className="warn-badge" style={{marginTop:6}}>Tokens locked this turn</div>}
            {gs.nextRollMinus1 && <div className="warn-badge" style={{marginTop:6}}>Next roll −1 active</div>}
            {gs.aiThinking && <div className="warn-badge" style={{marginTop:6,background:"#edf5ff",border:"1px solid #bfdbfe",color:"#1e40af"}}>⏳ AI is taking its turn…</div>}
            <div className="controls" style={{marginTop:10}}>
              <button className="btn btn-primary" disabled={gs.phase!=="player_play"||!gs.lastPPlay||isOver||gs.aiThinking} onClick={endTurn}>End Turn ▶</button>
              <button className="btn btn-secondary" disabled={!gs.canUndo||gs.aiThinking} onClick={handleUndo}>Undo ↩</button>
              <button className="btn btn-secondary" onClick={() => { if (!hints.length){alert("No hints.");return;} alert("Hints:\n"+hints.map(h=>`• ${h.card.name} (${h.card.deckId}) → ${h.score} pts`).join("\n")); }}>Hint 💡</button>
            </div>
          </div>
          <div className="panel" style={{flex:1}}>
            <div className="hand-title">Your Hand — Click to Play</div>
            <div className="hand-grid">
              {gs.playerHand.map(c => (
                <button key={c.id} className="card-btn"
                  disabled={gs.phase !== "player_play" || isOver || gs.aiThinking}
                  onClick={() => handlePlay(c)}>
                  <CardView card={c} />
                </button>
              ))}
            </div>
            <div style={{marginTop:8,fontSize:11,color:"#aaa"}}>AI Hand: {gs.aiHand.length} cards hidden</div>
          </div>
        </aside>
      </main>

      {/* JOURNAL */}
      {showJournal && (
        <div className="modal-overlay" onClick={e => { if(e.target.classList.contains("modal-overlay")) setShowJournal(false); }}>
          <div className="modal-box" style={{maxWidth:600}}>
            <div className="modal-hdr"><div className="modal-title">Session Chronicle</div><button className="btn-close" onClick={() => setShowJournal(false)}>✕</button></div>
            <div className="modal-body">
              <p style={{fontSize:12,color:"#888",marginBottom:8}}>Your notes, spread records, and synchronicities. Auto-saved.</p>
              <textarea className="journal-textarea" placeholder="Write your reading notes, insights, dates…" value={journal} onChange={e => setJournal(e.target.value)} />
            </div>
            <div className="modal-footer"><button className="btn btn-primary" onClick={() => setShowJournal(false)}>Close</button></div>
          </div>
        </div>
      )}

      {/* OPTIONS */}
      {showOpts && (
        <div className="modal-overlay" onClick={e => { if(e.target.classList.contains("modal-overlay")) setShowOpts(false); }}>
          <div className="modal-box">
            <div className="modal-hdr"><div className="modal-title">New Game · Options</div><button className="btn-close" onClick={() => setShowOpts(false)}>✕</button></div>
            <div className="modal-body">

              {/* ── GAMEPLAY DESCRIPTION ── */}
              <div style={{background:"linear-gradient(135deg,#f5f0ff,#edf5ff)",border:"1px solid #d4c8f0",borderRadius:12,padding:"14px 16px",marginBottom:18}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:13,color:"#2a1f3d",fontWeight:700,marginBottom:10,letterSpacing:"0.06em"}}>✦ HOW TO PLAY — TAROT INSIGHT DUEL (40 Rounds)</div>

                <div style={{fontSize:12,color:"#2a1f3d",lineHeight:1.7}}>
                  <p style={{marginBottom:8}}><b>Overview:</b> You and the AI move simultaneously around a <b>60-tile circular ring</b>, playing cards from your hand each round to score points. After <b>40 rounds</b> the player with the highest score wins. Every decision — which card to play, when to use tokens, how to respond to tile effects — shapes your final score.</p>

                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 16px",marginBottom:10}}>
                    <div>
                      <div style={{fontWeight:700,color:"#7c5cbf",marginBottom:4,fontSize:11,textTransform:"uppercase",letterSpacing:"0.06em"}}>① Roll the Dice</div>
                      <p>Each round begins with you rolling dice (default: 1×d6). Your result moves you that many tiles forward on the ring. The tile you land on triggers an effect immediately — before you play a card. Choose your dice type in Options: d4 for tight control, d12 or d20 for wild variance. Multiple dice (e.g. 2×d6) produce higher average movement and more consistent mid-range landings.</p>
                    </div>
                    <div>
                      <div style={{fontWeight:700,color:"#c25d8a",marginBottom:4,fontSize:11,textTransform:"uppercase",letterSpacing:"0.06em"}}>② Resolve Your Tile</div>
                      <p>The ring has 11 tile types. <b>Blessing</b> tiles grant flat bonuses and extra draws. <b>Theme</b> tiles override the round theme entirely — redirecting which tag scores +3. <b>Invoke</b> tiles pull a card from a named deck and grant a tag focus. <b>Punishment</b> tiles draw a negative effect (token lock, score penalty, forced discard, or backstep). <b>Portal</b> tiles teleport you. <b>Mirror</b> tiles reward reversed cards. Tile effects stack with your card's score — landing a Blessing before playing a high-power card is the core combo of the game.</p>
                    </div>
                    <div>
                      <div style={{fontWeight:700,color:"#e07c2a",marginBottom:4,fontSize:11,textTransform:"uppercase",letterSpacing:"0.06em"}}>③ Play a Card</div>
                      <p>Click any card in your hand to play it. Your score for that play is:<br/>
                      <code style={{background:"#fff",padding:"2px 6px",borderRadius:4,fontSize:11}}>Power + Theme Synergy + Tile Bonuses − Penalties</code><br/>
                      <b>Power</b> is the card's base value (5–9). <b>Theme Synergy</b> adds +3 if the card carries the round's bonus tag, plus +1 if the theme name appears in the card's text. <b>Tile Bonuses</b> include flat bonuses, specific tag boosts, and reversed-card multipliers. Reversed cards take a −2 penalty to power but gain +3 from Mirror Pool tiles — making them situationally very strong.</p>
                    </div>
                    <div>
                      <div style={{fontWeight:700,color:"#0e8f8f",marginBottom:4,fontSize:11,textTransform:"uppercase",letterSpacing:"0.06em"}}>④ Use Your Tokens</div>
                      <p><b>Reroll token:</b> Re-roll your dice before playing a card. Use it to escape a bad tile (Punishment Rift, unfavorable theme) and land somewhere better. <b>Bonus+2 token:</b> Add +2 to your current play after placing a card but before ending the turn. Use it on your highest-scoring turns — when theme synergy already gives +3, a Bonus+2 pushes you to a decisive lead. Tokens are earned from Market tiles and the Start fountain. Some Punishment cards lock tokens for a turn, so spend them early when possible.</p>
                    </div>
                    <div>
                      <div style={{fontWeight:700,color:"#16803a",marginBottom:4,fontSize:11,textTransform:"uppercase",letterSpacing:"0.06em"}}>⑤ Undo (Once Per Turn)</div>
                      <p>After placing a card but before ending your turn, you can take it back with the Undo button. Use this if you realize a different card would score better, or if you want to reconsider after seeing your tile bonuses fully calculated. Undo is disabled if you land on certain Punishment tiles (Stumble). The AI cannot undo.</p>
                    </div>
                    <div>
                      <div style={{fontWeight:700,color:"#2a6be0",marginBottom:4,fontSize:11,textTransform:"uppercase",letterSpacing:"0.06em"}}>⑥ End Turn &amp; Draw</div>
                      <p>When you click <b>End Turn</b>, the AI takes its full turn automatically: it rolls, moves, resolves its tile, and plays the best card for that theme from its hidden hand. Then both players draw 1 card from the shared deck. Hands are always sorted by deck then name. The round counter advances and the next theme activates. Over 40 rounds, both players cycle through all 6 themes roughly 7 times each — meaning every theme recurs multiple times, rewarding players who hold theme-matched cards strategically.</p>
                    </div>
                  </div>

                  <div style={{fontWeight:700,color:"#7c5cbf",marginBottom:4,fontSize:11,textTransform:"uppercase",letterSpacing:"0.06em"}}>The 6 Round Themes — They Cycle Every 6 Rounds</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"6px 12px",marginBottom:10}}>
                    {[
                      ["Intention","#vision","Cards with #vision, #growth, #origin, #monad score +3. The opening theme — play your highest-vision cards here.","#7c5cbf"],
                      ["Challenge","#challenge","Cards with #challenge, #endurance, #power, #purge score +3. Hold Mountain, Hero, Fire, Destroyer for this theme.","#c25d8a"],
                      ["Action","#action","Cards with #action, #ignite, #momentum score +3. QI deck Strike cards and ELEMENTAL Fire shine here.","#e07c2a"],
                      ["Integration","#integration","Cards with #integration, #healing, #recursion, #coherence score +3. Shadow Spiral and Breath decks peak here.","#0e8f8f"],
                      ["Healing","#healing","Cards with #healing, #renewal, #mercy, #rebirth score +3. All Rebirth cards (P8) are strongest in this theme.","#16803a"],
                      ["Wisdom","#wisdom","Cards with #wisdom, #insight, #clarity, #guidance score +3. Sage, Lantern, Codex, Oversoul cards dominate here.","#2a6be0"],
                    ].map(([name,tag,tip,col])=>(
                      <div key={name} style={{background:"#fff",borderRadius:8,padding:"6px 8px",border:`1px solid ${col}22`}}>
                        <div style={{fontWeight:700,color:col,fontSize:11}}>{name} <span style={{fontWeight:400,color:"#888"}}>{tag}</span></div>
                        <div style={{fontSize:11,color:"#444",lineHeight:1.5,marginTop:2}}>{tip}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{fontWeight:700,color:"#7c5cbf",marginBottom:4,fontSize:11,textTransform:"uppercase",letterSpacing:"0.06em"}}>60-Tile Ring — Key Tile Locations</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"4px 16px",marginBottom:10,fontSize:11,color:"#444"}}>
                    <div><b style={{color:"#7c5cbf"}}>Tile 1</b> — Start · Fountain of Beginnings: +1, draw 1, gain Bonus+2 token</div>
                    <div><b style={{color:"#7c5cbf"}}>Tile 13</b> — Portal Gate +3: Jump forward 3 tiles instantly</div>
                    <div><b style={{color:"#7c5cbf"}}>Tile 25</b> — Backward Rift: Jump back 2 tiles</div>
                    <div><b style={{color:"#7c5cbf"}}>Tile 37</b> — Return to Origin: Teleport back to Tile 1</div>
                    <div><b style={{color:"#7c5cbf"}}>Tile 49</b> — Echo Road: +2 if you play the same deck as your last turn</div>
                    <div><b style={{color:"#c8342a"}}>Every 7th tile</b> — Punishment Rift: draw a random Punishment card</div>
                    <div><b style={{color:"#8b5cf6"}}>Every 5th tile</b> — Invoke a named deck: +1 and a tag focus bonus</div>
                    <div><b style={{color:"#16803a"}}>Every 6th tile (mod 0)</b> — Blessing Fountain: +2 and draw 1</div>
                  </div>

                  <div style={{fontWeight:700,color:"#7c5cbf",marginBottom:4,fontSize:11,textTransform:"uppercase",letterSpacing:"0.06em"}}>Punishment Cards — Know Your Risks</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"4px 16px",marginBottom:10,fontSize:11,color:"#444"}}>
                    <div><b>Sticky Sands</b> — −2 to this play. Play your weakest card if you can't avoid it.</div>
                    <div><b>Silenced Bell</b> — Tokens locked this turn. Spend tokens before ending your turn.</div>
                    <div><b>Fog of Doubt</b> — −1 and Hint disabled. Rely on your own reading of the theme.</div>
                    <div><b>Crosswind</b> — −2 if your card lacks the theme's bonus tag. Match the theme carefully.</div>
                    <div><b>Tangled Vines</b> — You don't draw at end of turn. Hand shrinks by 1 for next round.</div>
                    <div><b>Echo of Misstep</b> — AI gets +1 bonus this round. Reduce the gap by playing your best card.</div>
                    <div><b>Card Tax</b> — A random card is discarded from your hand after you play. Keep your best cards ready.</div>
                    <div><b>Stumble</b> — −1 and Undo disabled. Commit carefully before clicking End Turn.</div>
                    <div><b>Drift</b> — Move back 1 tile. You may land on a better or worse tile.</div>
                    <div><b>Reverse Flow</b> — Your next roll is reduced by 1 (minimum 1). Plan movement accordingly.</div>
                  </div>

                  <div style={{fontWeight:700,color:"#7c5cbf",marginBottom:4,fontSize:11,textTransform:"uppercase",letterSpacing:"0.06em"}}>Quantum Impact Decks — Playing the Impact Arc</div>
                  <p style={{marginBottom:6}}>The five Quantum Impact decks (Cane, Tawse, Belt, Paddle, Hand Slap Round) each carry a 9- or 8-card arc from initiation through rebirth. Within that arc, card power follows a deliberate curve:</p>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"4px 12px",marginBottom:8,fontSize:11,color:"#444"}}>
                    <div><b>Strike / Initiation</b> (P7) — High opener. Play on Action or Intention rounds.</div>
                    <div><b>Echo / Reception</b> (P6) — Solid mid. Good on Integration rounds.</div>
                    <div><b>Recoil / Memory</b> (P5) — Weakest. Play when you have no better option.</div>
                    <div><b>Stillness / Between</b> (P5) — Weakest. Save Bonus+2 if forced to play it.</div>
                    <div><b>The Spiral</b> (P6) — Reliable. Tags often include #recursion for Integration rounds.</div>
                    <div><b>The Mirror</b> (P6) — Best with Mirror Pool tile (+3 if reversed).</div>
                    <div><b>The Collapse</b> (P6) — Good on Challenge rounds (#purge, #collapse tags).</div>
                    <div><b>Integration / Symmetry</b> (P7) — Strong on Healing and Integration rounds.</div>
                    <div><b>Rebirth / Equilibrium</b> (P8) — Best card. Hold for Healing rounds or high-bonus tiles.</div>
                  </div>
                  <p style={{marginBottom:6}}><b>Hand Slap Round (QI_SLAP_ROUND)</b> is unique: its two polarity cards (Right Hand P7, Left Hand P6) give it a strong opening unlike the other QI decks. The Breath of Symmetry (P7, #coherence #balance #integration) is exceptional on Integration rounds. The Rebirth of Equilibrium (P8, #rebirth #balance #renewal) scores on both Healing and Integration. If you mix multiple QI decks, you'll often hold several Rebirth variants — the Hint button will rank which one scores highest for the current theme.</p>

                  <div style={{fontWeight:700,color:"#7c5cbf",marginBottom:4,fontSize:11,textTransform:"uppercase",letterSpacing:"0.06em"}}>Advanced Strategy — Going Deep Over 40 Rounds</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 16px",fontSize:11,color:"#444"}}>
                    <div><b>Theme cycling:</b> Over 40 rounds each theme appears ~7 times. Build your hand to have at least one strong card for every theme — don't over-specialize in just Healing or just Action.</div>
                    <div><b>Deck synergy:</b> Mixing BREATH_SPIRAL + SHADOW_SPIRAL gives you deep #integration and #healing coverage. Adding QI decks gives Action and Challenge. ORACLE + CELESTIAL covers Intention and Wisdom.</div>
                    <div><b>Reversed card strategy:</b> With reversals on, about half your deck is reversed (−2 power). But Mirror Pool tiles (+3 reversed) create a high-ceiling play. Watch the board and hold a reversed card when you're about to land on Tile 7, 17, 27, 37, or 47 (mod 10 = 6 pattern).</div>
                    <div><b>Token discipline:</b> The Start fountain gives you 1 Bonus+2 at game start. Market tiles give Reroll tokens. Over 40 rounds you'll earn ~4–6 tokens. Use Reroll to escape Punishment Rifts, Bonus+2 on turns where you already have +3 theme synergy (total becomes +5 or more).</div>
                    <div><b>Hand size management:</b> Default hand is 6 cards. Card Tax can shrink it; Blessing/draw tiles expand it temporarily. Keep your hand diverse — one card per major theme if possible. Discard threats (Card Tax) eat your best cards randomly, so don't hoard a single strategy.</div>
                    <div><b>AI reading:</b> At strength 5 the AI reliably plays theme-matching cards. At 7–8 it also protects rare tags. Watch the AI score column — if it pulls ahead by 20+ points by round 20, you need to shift to high-variance plays (reversed cards on Mirror tiles, aggressive Bonus+2 use).</div>
                    <div><b>Echo Road (Tile 49):</b> +2 if you play the same deck as last turn. If you're running a large single-deck (e.g. ORACLE_HF 22 cards), landing here consistently nets 2 free points per turn. Build a mono-deck strategy around Echo Road for late-game acceleration.</div>
                    <div><b>Portal tiles:</b> Portal Gate +3 (Tile 13) can land you on a Blessing or Invoke tile — double effect. Return to Origin (Tile 37) resets your ring position to 1, which is the Start fountain (+1, draw, Bonus+2). Landing on 37 is often secretly a reward.</div>
                  </div>
                </div>
              </div>

              {/* ── NUMERIC OPTIONS ── */}
              <div className="opts-grid">
                <div className="opt-field"><div className="opt-label">Rounds</div><input className="opt-input" type="number" min={12} max={60} value={draft.rounds} onChange={e => setDraftVal("rounds",Math.max(12,Math.min(60,Number(e.target.value)||24)))} /></div>
                <div className="opt-field"><div className="opt-label">Hand Size</div><input className="opt-input" type="number" min={4} max={8} value={draft.handSize} onChange={e => setDraftVal("handSize",Math.max(4,Math.min(8,Number(e.target.value)||6)))} /></div>
                <div className="opt-field"><div className="opt-label">AI Strength</div><input className="opt-input" type="range" min={1} max={8} value={draft.aiStrength} onChange={e => setDraftVal("aiStrength",Number(e.target.value))} /><div style={{fontSize:12,color:"#666"}}>Level {draft.aiStrength}</div></div>
                <div className="opt-field"><div className="opt-label">Dice Faces</div><input className="opt-input" type="number" min={2} max={200} value={draft.diceFaces} onChange={e => setDraftVal("diceFaces",Math.max(2,Number(e.target.value)||6))} /><div className="quick-dice">{[4,6,8,10,12,20].map(f=><button key={f} className="qd-btn" onClick={()=>setDraftVal("diceFaces",f)}>d{f}</button>)}</div></div>
                <div className="opt-field"><div className="opt-label">Number of Dice</div><input className="opt-input" type="number" min={1} max={12} value={draft.diceCount} onChange={e => setDraftVal("diceCount",Math.max(1,Number(e.target.value)||1))} /></div>
                <div className="opt-field"><div className="opt-label">Seed</div><input className="opt-input" type="number" value={draft.seed} onChange={e => setDraftVal("seed",Number(e.target.value)||0)} /></div>
                <div className="opt-field" style={{justifyContent:"flex-end"}}>
                  <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,cursor:"pointer"}}>
                    <input type="checkbox" checked={draft.reversals} onChange={e => setDraftVal("reversals",e.target.checked)} style={{accentColor:"#7c5cbf"}} />
                    Include Reversals
                  </label>
                </div>
              </div>

              {DECK_GROUPS.map(group => (
                <div className="deck-group" key={group.label}>
                  <div className="deck-group-title">{group.label}</div>
                  {group.note && <div className="deck-group-note">{group.note}</div>}
                  <div className="deck-toggles">
                    {group.ids.map(id => (
                      <label key={id} className="deck-toggle">
                        <input type="checkbox" checked={!!draft.use[id]} onChange={e => setDraftUse(id, e.target.checked)} />
                        <span>{DECK_LABELS[id] || id}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <p style={{fontSize:11,color:"#aaa",marginTop:10}}>Changes take effect only after clicking <b>Apply &amp; Start Game</b>.</p>
            </div>
            <div className="modal-footer">
              <span className="modal-footer-info">Active cards: <b>{activeCount}</b>{draft.reversals?` → ${activeCount*2} with reversals`:""}</span>
              <button className="btn btn-secondary" onClick={() => setShowOpts(false)}>Cancel</button>
              <button className="btn btn-apply" onClick={applyOpts}>✓ Apply &amp; Start Game</button>
            </div>
          </div>
        </div>
      )}

      {/* RULES */}
      {showRules && (
        <div className="modal-overlay" onClick={e => { if(e.target.classList.contains("modal-overlay")) setShowRules(false); }}>
          <div className="modal-box">
            <div className="modal-hdr"><div className="modal-title">Rules & Deck Encyclopedia</div><button className="btn-close" onClick={() => setShowRules(false)}>✕</button></div>
            <div className="modal-body">
              <div className="rule-section">
                <h3>How to Play — 40-Round Deep Duel</h3>
                <p style={{fontSize:13,color:"#555",lineHeight:1.6,marginBottom:8}}>Tarot Insight Duel is a 40-round card-and-board game for one player vs an AI opponent. Both move around a 60-tile circular ring simultaneously. Each round you roll dice, resolve a tile effect, play a card from your hand, and score points. After 40 rounds the highest score wins.</p>
                <ol>
                  <li><b>Roll Dice:</b> Move forward that many tiles on the ring (default 1×d6). Your tile triggers immediately. Use Reroll tokens to escape dangerous tiles before playing.</li>
                  <li><b>Resolve Tile:</b> Blessing (+bonus/draw), Theme (override round theme), Invoke (tag focus from a named deck), Punishment (negative effect), Portal (teleport), Mirror (+3 if reversed card), Market (gain Reroll token), Wild (Echo Road: +2 same deck), or Rest (+1 soft shield). Tile effects stack with your card score.</li>
                  <li><b>Play a Card:</b> Score = <b>Power</b> (5–9) + <b>+3</b> if card has the round's bonus tag + <b>+1</b> if theme name appears in card text + tile bonuses − reversals penalty (−2). Click any card in your hand to play it.</li>
                  <li><b>Optional: Use Tokens before ending.</b> Bonus+2 adds +2 to your current play. Use it when you already have theme synergy for maximum effect.</li>
                  <li><b>Undo (once):</b> Take your card back before clicking End Turn. Disabled by some Punishment cards.</li>
                  <li><b>End Turn:</b> AI auto-plays its full turn (roll → tile → card). Both players draw 1 card. The 6 themes cycle every 6 rounds — over 40 rounds each theme appears ~7 times.</li>
                </ol>
                <p style={{fontSize:12,color:"#888",marginTop:8}}>💡 Open <b>New Game / Options</b> for the full strategic breakdown — tile locations, punishment cards, QI deck arc strategy, theme cycling tactics, and advanced 40-round play.</p>
              </div>
              <div className="rule-section">
                <h3>Round Themes</h3>
                <ul>{THEMES.map(t=><li key={t.name}><b style={{color:t.color}}>{t.name}</b> — bonus tag: <code>#{t.bonusTag}</code></li>)}</ul>
              </div>
              <div className="rule-section">
                <h3>Codex Harmonic Field Decks</h3>
                <p style={{fontSize:13,color:"#555",lineHeight:1.6,marginBottom:6}}>These decks are breath-based archetypal mirrors from the Harmonic Field and Codex — not traditional tarot or divination tools. Each card is a standalone phase drawn by resonance. In gameplay they score normally (power + tags), but their language carries breath geometry and monad recursion.</p>
                <ul>
                  {["ORACLE_HF","IMPACT_HF","TAROT_HF","SACRED_GEO","AFFIRMATION","MYSTERY_SW","TEQUILA_SLAPS"].map(id=><li key={id}><b>{id}</b> — {DECK_LABELS[id]}</li>)}
                </ul>
              </div>
              <div className="rule-section">
                <h3>Personal Spiral & Codex Decks</h3>
                <p style={{fontSize:13,color:"#555",lineHeight:1.6,marginBottom:6}}>Custom decks built for your specific field, breath, and spiral geometry by the Harmonic Field and Codex.</p>
                <ul>
                  <li><b>BREATH_SPIRAL</b> — 12 cards tracking breath geometry through Monad, Inhale, Exhale, Collapse, Recursion, Reflection, Coherence, and Completion phases</li>
                  <li><b>CODEX_MIRROR</b> — 13 Codex archetypes (sacred geometry + The Breath Mirror) reflecting your breath's alignment with the Codex</li>
                  <li><b>SHADOW_SPIRAL</b> — 13 shadow archetypes reflecting unseen breath phases, from The Mask through The Rebirth</li>
                </ul>
              </div>
              <div className="rule-section">
                <h3>Quantum Impact Decks</h3>
                <p style={{fontSize:13,color:"#555",lineHeight:1.6,marginBottom:6}}>Four 9-card breath-based impact mirrors. Each deck reflects the phases of impact (Strike → Echo → Recoil → Stillness → Spiral → Mirror → Collapse → Integration → Rebirth) through a specific instrument's geometry.</p>
                <ul>
                  <li><b>QI_CANE</b> — Precision impact, focused breath collapse, clarity through sensation</li>
                  <li><b>QI_TAWSE</b> — Dual impact, mirrored breath, asymmetrical collapse and union</li>
                  <li><b>QI_BELT</b> — Containment, boundary, compression and liberation geometry</li>
                  <li><b>QI_PADDLE</b> — Grounded impact, density, weight and embodiment geometry</li>
                  <li><b>QI_SLAP_ROUND</b> — Alternating polarity spiral ceremony (8 cards) · Fixed sequence: Right Hand (exhale, P7) → Left Hand (inhale, P6) → Alternating Spiral (right-left-right, P6) → Mirror of Polarity (pause, shared breath, P6) → Collapse of Resistance (rapid until breath breaks, P6) → Breath of Symmetry (slow synchronized, P7) → Spiral of Repetition (repeat until stillness, P6) → Rebirth of Equilibrium (both hands resting gently, deep inhale/long exhale, P8)</li>
                </ul>
              </div>
              <div className="rule-section">
                <h3>Deck Encyclopedia</h3>
                {Object.entries(DECKS_STATIC).map(([id,cards])=>(
                  <details key={id} className="deck-acc">
                    <summary>{DECK_LABELS[id]||id}</summary>
                    <div style={{padding:"0 12px 10px"}}>
                      <table className="acc-table">
                        <thead><tr><th>#</th><th>Name</th><th>Tags</th><th>Meaning</th><th>P</th></tr></thead>
                        <tbody>{cards.map((c,i)=><tr key={c.id}><td>{i+1}</td><td><b>{c.name}</b></td><td style={{color:"#888",fontSize:11}}>{(c.tags||[]).map(t=>`#${t}`).join(" ")}</td><td style={{maxWidth:360,fontSize:11}}>{c.meaning}</td><td><b style={{color:"#16803a"}}>{c.power}</b></td></tr>)}</tbody>
                      </table>
                    </div>
                  </details>
                ))}
                {PROC_DEFS.map(def=>(
                  <details key={def.id} className="deck-acc">
                    <summary>{DECK_LABELS[def.id]||def.id}</summary>
                    <div style={{padding:"0 12px 10px"}}><p style={{fontSize:12,color:"#888"}}>Procedural · Tags: {def.tags.join(", ")}</p></div>
                  </details>
                ))}
              </div>
            </div>
            <div className="modal-footer"><button className="btn btn-primary" onClick={() => setShowRules(false)}>Close</button></div>
          </div>
        </div>
      )}

      {flashCard && (
        <div className="flash-overlay">
          <div style={{background:"#2a1f3d",color:"#fff",padding:"8px 14px",borderRadius:10,fontSize:13,boxShadow:"0 4px 20px rgba(0,0,0,.25)"}}>
            {flashCard.who==="player"?"You draw":"AI draws"}: <b>{flashCard.card.name}</b>
          </div>
        </div>
      )}

      {/* ══ GAMEPLAY MODAL ══ */}
      {showGameplay && (
        <div className="modal-overlay" onClick={e => { if(e.target.classList.contains("modal-overlay")) setShowGameplay(false); }}>
          <div className="gp-modal-box">

            {/* Sticky hero header */}
            <div className="gp-hero">
              <div className="gp-hero-title">40-Round Deep Game — Human vs AI</div>
              <div className="gp-hero-sub">A complete walkthrough of one full game · Every round, every decision, every consequence</div>
            </div>

            {/* TOC */}
            <div className="gp-toc">
              {["Before You Start","Opening Hand","Act 1 · R1–10","Act 2 · R11–20","Act 3 · R21–30","Act 4 · R31–40","Final Score","Lessons","The Truth"].map(s=>(
                <a key={s} href={`#gp-${s.replace(/[^a-z0-9]/gi,"-").toLowerCase()}`}>{s}</a>
              ))}
              <button className="btn-close" style={{marginLeft:"auto"}} onClick={() => setShowGameplay(false)}>✕</button>
            </div>

            <div className="gp-body">

              {/* ── BEFORE YOU START ── */}
              <div className="gp-section" id="gp-before-you-start">
                <h2>⚙ Before the Game Starts</h2>
                <p>You open the Options modal and see the full gameplay guide. You're setting up for the 40-round experience. Here are the decisions you make before clicking <b>Apply & Start Game</b>:</p>

                <h3>Decks Enabled</h3>
                <div className="gp-hand-cards">
                  {[["ORACLE","#7c5cbf","22 cards — broad coverage across all themes"],["QLOVE","#c25d8a","22 cards — deep Integration and Healing"],["IMPACT","#0e8f8f","19 cards — Intention and Action anchors"],["ELEMENTAL","#cc3333","10 cards — Action and Challenge"],["MYTHIC","#7c3aed","10 cards — Challenge and Wisdom"],["QI_SLAP_ROUND","#b71c1c","8 cards — no P5 dead weight, best Integration card"],["QI_BELT","#3e2723","9 cards — versatile, Rebirth scores Intention"],["SHADOW_SPIRAL","#1a237e","13 cards — deep Integration and Healing"]].map(([id,col,note])=>(
                    <div className="gp-hand-card" key={id} style={{borderColor:col}}>
                      <span className="gp-hand-card-deck" style={{background:col}}>{id}</span>
                      <span style={{fontSize:11,color:"#555"}}>{note}</span>
                    </div>
                  ))}
                </div>
                <div className="gp-callout">Total: ~113 hand-authored cards. With reversals on: <b>226 cards</b> in the shared draw pile. Neither player sees every card in a 40-round game.</div>

                <h3>Settings</h3>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"6px 16px",fontSize:12,color:"#444",marginBottom:8}}>
                  <div><b>Rounds:</b> 40</div><div><b>Hand Size:</b> 6</div><div><b>AI Strength:</b> 5</div>
                  <div><b>Dice:</b> 1×d6</div><div><b>Reversals:</b> On</div><div><b>Seed:</b> your choice</div>
                </div>
              </div>

              {/* ── OPENING HAND ── */}
              <div className="gp-section" id="gp-opening-hand">
                <h2>🃏 The Opening Hand</h2>
                <p>The deck shuffles with your seed. You draw 6 cards. The AI draws 6 from the same pile, unseen. A strong opening hand might look like this:</p>

                <div className="gp-hand-cards">
                  {[
                    ["Magnetism","QLOVE","#c25d8a",6,"#attraction #connection #destiny","Decent, no primary theme tag"],
                    ["The Strike","QI_CANE","#6d4c41",7,"#intention #action #power","Strong opener for rounds 1 or 3"],
                    ["Shadow (Rev)","SHADOW_SPIRAL","#1a237e",4,"#shadow #truth #healing","Reversed — weak but Mirror Pool candidate"],
                    ["Destiny","IMPACT","#0e8f8f",8,"#destiny #vision #commitment","Best card in hand — hold for Intention"],
                    ["Rebirth of Boundaries","QI_BELT","#3e2723",8,"#rebirth #sovereignty #renewal","Hold for Healing round 5"],
                    ["Sage","MYTHIC","#7c3aed",7,"#wisdom #clarity #guidance","Hold for Wisdom round 6"],
                  ].map(([name,deck,col,pwr,tags,note])=>(
                    <div className="gp-hand-card" key={name} style={{borderColor:col}}>
                      <span className="gp-hand-card-name">{name}</span>
                      <span className="gp-hand-card-deck" style={{background:col}}>{deck}</span>
                      <span className="gp-hand-card-tags">{tags}</span>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{fontSize:11,color:"#666"}}>{note}</span>
                        <span className="gp-hand-card-power">P{pwr}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="gp-callout">
                  <b>Your instant plan:</b> R1 Intention → Destiny (P8, #vision) · R3 Action → The Strike (P7, #action) · R5 Healing → Rebirth of Boundaries (P8, #renewal) · R6 Wisdom → Sage (P7, #wisdom). Magnetism and Shadow (Rev) fill rounds 2 and 4. This is an unusually strong opening — the AI has an equally random hidden hand.
                </div>
              </div>

              {/* ── ACT ONE ── */}
              <div className="gp-section" id="gp-act-1-r1-10">
                <div className="gp-act-banner">
                  <span style={{fontSize:18}}>①</span>
                  <div><div style={{fontSize:14,fontWeight:700}}>ACT ONE — Rounds 1–10</div><div style={{fontSize:11,color:"#a89cc8"}}>Foundation · Build your hand · Read the board · Establish rhythm</div></div>
                </div>

                {/* R1 */}
                <div className="gp-round-hdr"><span className="gp-round-num">R1</span><span style={{fontWeight:700}}>Intention</span><span className="gp-round-theme">bonus tag:</span><span className="gp-round-tag">#vision</span></div>
                <div className="gp-play-grid">
                  <div className="gp-play-card you">
                    <div className="gp-play-who you">You</div>
                    <p style={{fontSize:12,margin:"4px 0"}}>Start tile gives +1, draw 1, Bonus+2 token. Draw: <b>The Integration of Freedom</b> (QI_BELT P7). Roll 4 → Tile 5 (Intention Spire, no bonus). Play <b>Destiny</b> (P8, #vision).</p>
                    <code className="gp-calc">8 (power) + 3 (#vision) + 0 (tile) = <b>11</b></code>
                    <p style={{fontSize:11,color:"#888",marginTop:4}}>Don't spend Bonus+2 yet. 11 is already strong.</p>
                  </div>
                  <div className="gp-play-card ai">
                    <div className="gp-play-who ai">AI</div>
                    <p style={{fontSize:12,margin:"4px 0"}}>Rolls 3 → Tile 4 (Oracle Stone: +1, #wisdom focus). Plays best Intention card, likely ORACLE's Star (P7, #vision).</p>
                    <code className="gp-calc">7 (power) + 3 (#vision) + 1 (Oracle Stone) = <b>11</b></code>
                  </div>
                </div>
                <div className="gp-score-row"><span className="gp-score-you">You: 11</span><span className="gp-score-ai">AI: 11</span><span className="gp-score-gap">Dead level after R1</span></div>

                {/* R2 */}
                <div className="gp-round-hdr"><span className="gp-round-num">R2</span><span style={{fontWeight:700}}>Challenge</span><span className="gp-round-theme">bonus tag:</span><span className="gp-round-tag">#challenge</span></div>
                <div className="gp-play-grid">
                  <div className="gp-play-card you">
                    <div className="gp-play-who you">You</div>
                    <p style={{fontSize:12,margin:"4px 0"}}>Roll 6 → Tile 11 (Blessing Fountain: +2, draw 1). Draw <b>Mountain</b> (ORACLE P7, #challenge). Perfect timing — the ideal card just arrived. Play Mountain.</p>
                    <code className="gp-calc">7 + 3 (#challenge) + 2 (Blessing) = <b>12</b></code>
                    <p style={{fontSize:11,color:"#888",marginTop:4}}>Exceptional. Magnetism saved for a neutral round.</p>
                  </div>
                  <div className="gp-play-card ai">
                    <div className="gp-play-who ai">AI</div>
                    <p style={{fontSize:12,margin:"4px 0"}}>Rolls 2 → Tile 6 (Theme Spire: Integration override). Tile overrides round theme — AI now scores against <b>Integration</b> not Challenge. Plays P6 Integration card.</p>
                    <code className="gp-calc">6 + 3 (#integration) + 0 = <b>9</b></code>
                    <p style={{fontSize:11,color:"#888",marginTop:4}}>Tile override cost the AI 3 points.</p>
                  </div>
                </div>
                <div className="gp-score-row"><span className="gp-score-you">You: 23</span><span className="gp-score-ai">AI: 20</span><span className="gp-score-gap">You lead +3</span></div>

                {/* R3 */}
                <div className="gp-round-hdr"><span className="gp-round-num">R3</span><span style={{fontWeight:700}}>Action</span><span className="gp-round-theme">bonus tag:</span><span className="gp-round-tag">#action</span></div>
                <div className="gp-play-grid">
                  <div className="gp-play-card you">
                    <div className="gp-play-who you">You</div>
                    <p style={{fontSize:12,margin:"4px 0"}}>Roll 5 → Tile 16 (Mirror Pool: +3 if reversed card). Shadow (Rev) would score 4+3=7. The Strike scores 7+3=10. <b>Play The Strike.</b></p>
                    <code className="gp-calc">7 + 3 (#action) + 0 = <b>10</b></code>
                    <p style={{fontSize:11,color:"#888",marginTop:4}}>Note Mirror Pool at Tile 16 — save reversed cards for next lap.</p>
                  </div>
                  <div className="gp-play-card ai">
                    <div className="gp-play-who ai">AI</div>
                    <p style={{fontSize:12,margin:"4px 0"}}>Rolls 4 → Tile 10 (Relic Market: gain Reroll token). No score bonus. Plays best Action card (ELEMENTAL Fire or IMPACT Catalyst).</p>
                    <code className="gp-calc">7 + 3 (#action) = <b>10</b></code>
                  </div>
                </div>
                <div className="gp-score-row"><span className="gp-score-you">You: 33</span><span className="gp-score-ai">AI: 30</span><span className="gp-score-gap">You lead +3</span></div>

                {/* R4 */}
                <div className="gp-round-hdr"><span className="gp-round-num">R4</span><span style={{fontWeight:700}}>Integration</span><span className="gp-round-theme">bonus tag:</span><span className="gp-round-tag">#integration</span></div>
                <div className="gp-play-grid">
                  <div className="gp-play-card you">
                    <div className="gp-play-who you">You</div>
                    <p style={{fontSize:12,margin:"4px 0"}}>Roll 3 → Tile 19 (Quiet Grove: +1, soft shield). Play <b>The Integration of Freedom</b> (QI_BELT P7, #integration). Then use <b>Bonus+2 token</b>.</p>
                    <code className="gp-calc">7 + 3 (#integration) + 1 (tile) + 2 (token) = <b>13</b></code>
                    <p style={{fontSize:11,color:"#888",marginTop:4}}>Season high score. Token well spent.</p>
                  </div>
                  <div className="gp-play-card ai">
                    <div className="gp-play-who ai">AI</div>
                    <p style={{fontSize:12,margin:"4px 0"}}>Rolls 5 → Tile 15 (Blessing Fountain: +2, draw 1). Plays P6 Integration card.</p>
                    <code className="gp-calc">6 + 3 (#integration) + 2 (Blessing) = <b>11</b></code>
                  </div>
                </div>
                <div className="gp-score-row"><span className="gp-score-you">You: 46</span><span className="gp-score-ai">AI: 41</span><span className="gp-score-gap">You lead +5</span></div>

                {/* R5 */}
                <div className="gp-round-hdr"><span className="gp-round-num">R5</span><span style={{fontWeight:700}}>Healing</span><span className="gp-round-theme">bonus tag:</span><span className="gp-round-tag">#healing</span></div>
                <div className="gp-danger">
                  <b>Punishment Rift!</b> You roll 2 → Tile 21 (Punishment Rift). Punishment drawn: <b>Crosswind</b> — if your card lacks the theme tag, −2. Your Rebirth of Boundaries (#rebirth #sovereignty #renewal) has no #healing → would score 8 − 2 = 6. You use <b>Undo</b> and play Shadow (Rev) instead — it has #healing.
                </div>
                <div className="gp-play-grid">
                  <div className="gp-play-card you">
                    <div className="gp-play-who you">You</div>
                    <p style={{fontSize:12,margin:"4px 0"}}>After Undo, play <b>Shadow (Rev)</b> which carries #healing — avoids Crosswind penalty.</p>
                    <code className="gp-calc">6 − 2 (reversed) + 3 (#healing) = <b>7</b></code>
                    <p style={{fontSize:11,color:"#888",marginTop:4}}>Painful but you navigated it. Undo saved 1 point.</p>
                  </div>
                  <div className="gp-play-card ai">
                    <div className="gp-play-who ai">AI</div>
                    <p style={{fontSize:12,margin:"4px 0"}}>Rolls 6 → also lands on Tile 21 (Punishment Rift). Draws <b>Stumble</b> — −1 and Undo disabled. AI can't react. Plays P6 #healing card.</p>
                    <code className="gp-calc">6 + 3 (#healing) − 1 (Stumble) = <b>8</b></code>
                  </div>
                </div>
                <div className="gp-score-row"><span className="gp-score-you">You: 53</span><span className="gp-score-ai">AI: 49</span><span className="gp-score-gap">You lead +4 (shrinking)</span></div>

                {/* R6 */}
                <div className="gp-round-hdr"><span className="gp-round-num">R6</span><span style={{fontWeight:700}}>Wisdom</span><span className="gp-round-theme">bonus tag:</span><span className="gp-round-tag">#wisdom</span></div>
                <div className="gp-warning">Roll 4 → Tile 25 (Backward Rift: jump back 2) → land on Tile 23 (Theme Spire: Integration override). Wisdom round becomes <b>Integration</b> for your play. Sage (#wisdom) loses its synergy bonus here.</div>
                <div className="gp-play-grid">
                  <div className="gp-play-card you">
                    <div className="gp-play-who you">You</div>
                    <p style={{fontSize:12,margin:"4px 0"}}>Hold Sage for next Wisdom round (round 12). Play Magnetism instead.</p>
                    <code className="gp-calc">6 + 0 (no #integration) = <b>6</b></code>
                    <p style={{fontSize:11,color:"#888",marginTop:4}}>You sacrifice 1 point now to gain 10 points on R12.</p>
                  </div>
                  <div className="gp-play-card ai">
                    <div className="gp-play-who ai">AI</div>
                    <p style={{fontSize:12,margin:"4px 0"}}>Rolls 3 → Tile 24 (Crown Road: +1, #leadership focus). Plays Wisdom card normally.</p>
                    <code className="gp-calc">6 + 3 (#wisdom) + 1 = <b>10</b></code>
                  </div>
                </div>
                <div className="gp-score-row"><span className="gp-score-you">You: 59</span><span className="gp-score-ai">AI: 59</span><span className="gp-score-gap">⚖ Tied — AI clawed back entire lead in one round</span></div>

                {/* R7–10 summary */}
                <h3>Rounds 7–10 — Pattern Solidifies</h3>
                <div className="gp-callout"><b>R7 Intention:</b> You play Sage (P7) mistakenly on Intention — Sage is Wisdom not Intention. Score: 7+0+1(Invoke)=8. AI lands on Blessing Fountain, plays #vision card: 6+3+2=11. Lesson: high power ≠ theme match.</div>
                <div className="gp-warning"><b>R8 Challenge:</b> Tile override to Wisdom again. No Wisdom cards. Forced to play P6 off-theme: 6+0+1=7. AI plays Challenge card: 7+3=10. AI leads by 6 for the first time.</div>
                <div className="gp-success"><b>R9 Action:</b> Roll 6 → Blessing Fountain (+2). Draw The Breath of Symmetry (QI_SLAP_ROUND P7). Play Phoenix (P8): 8+0+2=10. AI: 7+3=10. Blessed tile saves the round.</div>
                <div className="gp-success"><b>R10 Integration:</b> You have The Integration (SHADOW_SPIRAL P8). Play it: 8+3+1(Oracle Stone)=12. AI hits Punishment Rift — Card Tax. AI scores 9 then loses a valuable card from hand.</div>

                <div className="gp-score-row" style={{marginTop:12}}><span className="gp-score-you">You: 96</span><span className="gp-score-ai">AI: 99</span><span className="gp-score-gap">AI leads by 3 — razor thin after 10 rounds</span></div>
              </div>

              {/* ── ACT TWO ── */}
              <div className="gp-section" id="gp-act-2-r11-20">
                <div className="gp-act-banner">
                  <span style={{fontSize:18}}>②</span>
                  <div><div style={{fontSize:14,fontWeight:700}}>ACT TWO — Rounds 11–20</div><div style={{fontSize:11,color:"#a89cc8"}}>Consolidation · The score settles · Managing imbalances</div></div>
                </div>

                <p>By round 11 you've seen every theme twice. The board is well-traveled. Both players have drawn 10+ additional cards beyond their opening hand. The AI has established its rhythm — watch its increment per round.</p>

                <div className="gp-callout"><b>R12 Wisdom (2nd):</b> You held Sage but played it on R7 Intention by mistake. No Wisdom card available now. Score ~7–8. AI scores 9–10. Gap widens slightly.</div>
                <div className="gp-success"><b>R13 Intention (3rd):</b> You draw Star (ORACLE P7, #vision) on R12's draw. Roll 6 → Blessing Fountain (+2). Star: 7+3+2=<b>12</b>. Gap closes to 4.</div>

                <div className="gp-round-hdr"><span className="gp-round-num">R15</span><span style={{fontWeight:700}}>Healing (3rd)</span><span className="gp-round-theme">bonus tag:</span><span className="gp-round-tag">#healing</span></div>
                <div className="gp-play-card you" style={{marginBottom:8}}>
                  <div className="gp-play-who you">You — Critical Recovery</div>
                  <p style={{fontSize:12,margin:"4px 0"}}>Rebirth of Boundaries (QI_BELT P8) held since R5 when Crosswind punished you. Now it's time. Use Bonus+2 token from Market tile (earned R11).</p>
                  <code className="gp-calc">8 + 3 (#renewal via adjacency) + 2 (token) = <b>13</b></code>
                </div>

                <div className="gp-callout"><b>R18 Integration (3rd):</b> The Breath of Symmetry (QI_SLAP_ROUND P7, #coherence #balance #integration). Pure 7+3=<b>10</b>. Protected it since R9. Discipline pays.</div>

                <div className="gp-score-row" style={{marginTop:12}}><span className="gp-score-you">You: 163</span><span className="gp-score-ai">AI: 165</span><span className="gp-score-gap">Essentially tied at halftime — gap only 2</span></div>
                <div className="gp-phase-bar" />
                <p style={{fontSize:11,color:"#888",textAlign:"center"}}>The game is perfectly balanced at the halfway point</p>
              </div>

              {/* ── ACT THREE ── */}
              <div className="gp-section" id="gp-act-3-r21-30">
                <div className="gp-act-banner">
                  <span style={{fontSize:18}}>③</span>
                  <div><div style={{fontSize:14,fontWeight:700}}>ACT THREE — Rounds 21–30</div><div style={{fontSize:11,color:"#a89cc8"}}>The Middle War · Punishments accumulate · Real separation begins</div></div>
                </div>

                <div className="gp-round-hdr"><span className="gp-round-num">R21</span><span style={{fontWeight:700}}>Intention (4th)</span><span className="gp-round-theme">bonus tag:</span><span className="gp-round-tag">#vision</span></div>
                <div className="gp-play-grid">
                  <div className="gp-play-card you">
                    <div className="gp-play-who you">You</div>
                    <p style={{fontSize:12,margin:"4px 0"}}>Draw The Rebirth of Equilibrium (QI_SLAP_ROUND P8) this turn. Play The Right Hand of Initiation (P7) — "Initiation" text overlaps with "Intention" for +1. Land on Invoke ELEMENTAL (+1 flat).</p>
                    <code className="gp-calc">7 + 1 (text overlap) + 1 (invoke) = <b>9</b></code>
                  </div>
                  <div className="gp-play-card ai">
                    <div className="gp-play-who ai">AI</div>
                    <p style={{fontSize:12,margin:"4px 0"}}>Rolls 6 → Blessing Fountain. Has a #vision card.</p>
                    <code className="gp-calc">6 + 3 + 2 = <b>11</b></code>
                  </div>
                </div>
                <div className="gp-score-row"><span className="gp-score-you">You: 182</span><span className="gp-score-ai">AI: 196</span><span className="gp-score-gap">Gap widens to 14 — first real danger</span></div>

                <div className="gp-danger"><b>R23 Action:</b> Punishment Rift → Reverse Flow (next roll −1). No Action card available. Play Vulnerability (P6, no tag): 6+0=<b>6</b>. Survival round. Gap grows to 20.</div>

                <div className="gp-round-hdr"><span className="gp-round-num">R24</span><span style={{fontWeight:700}}>Integration (4th)</span><span className="gp-round-theme">Most Important Round</span></div>
                <div className="gp-play-card you" style={{marginBottom:8}}>
                  <div className="gp-play-who you">You — Tactical Discipline</div>
                  <p style={{fontSize:12,margin:"4px 0"}}>You have Rebirth of Equilibrium (P8) and QLOVE Healing (P6, #integration). QLOVE Healing scores Integration synergy; Rebirth of Equilibrium doesn't. Play QLOVE Healing. Land on Blessing Fountain (Reverse Flow made roll 3 not 4 — but still lands on Blessing). Use Bonus+2 token.</p>
                  <code className="gp-calc">6 + 3 (#integration) + 2 (Blessing) + 2 (token) = <b>13</b> — but wait, token spent. Without: <b>11</b></code>
                  <p style={{fontSize:11,color:"#888",marginTop:4}}>Also draw The Oversoul Glyph (ORACLE_HF P8, #wisdom) — powerful for R25.</p>
                </div>
                <div className="gp-score-row"><span className="gp-score-you">You: 199</span><span className="gp-score-ai">AI: 218</span><span className="gp-score-gap">Gap: 19 — deficit but not fatal over 16 rounds</span></div>

                <h3>Strategy Shift — Rounds 25–30</h3>
                <div className="gp-strategy-grid">
                  <div className="gp-strategy-item"><b>Stop hoarding.</b> The gap is now urgent. Play your strong cards when theme matches rather than saving for perfect moments.</div>
                  <div className="gp-strategy-item"><b>Use Rerolls aggressively.</b> Avoid Punishment tiles. Land on Blessings. Every tile bonus matters now.</div>
                  <div className="gp-strategy-item"><b>Target R29 Healing.</b> Your Rebirth of Equilibrium (P8) has been held since R21. Round 29 is your recovery spike.</div>
                  <div className="gp-strategy-item"><b>Watch the AI's stumbles.</b> At Strength 5 the AI hits Punishments like you do. Let the board punish it while you play cleanly.</div>
                </div>

                <div className="gp-success"><b>R25 Wisdom (5th):</b> The Oversoul Glyph (P8, #wisdom) — just drawn last round. Plays perfectly: 8+3=<b>11</b>. AI scores 10. Gap closes 1 point to 18.</div>

                <div className="gp-round-hdr"><span className="gp-round-num">R29</span><span style={{fontWeight:700}}>Healing (5th)</span><span className="gp-round-theme">Crucial Recovery</span></div>
                <div className="gp-play-card you">
                  <div className="gp-play-who you">You — Peak Round of the Game</div>
                  <p style={{fontSize:12,margin:"4px 0"}}>The Rebirth of Equilibrium (QI_SLAP_ROUND P8) held since R21. Land on Invoke CODEX_MIRROR (+1 flat). Use final Bonus+2 token.</p>
                  <code className="gp-calc">8 + 3 (#renewal via adjacency) + 1 (invoke) + 2 (token) = <b>14</b></code>
                  <p style={{fontSize:11,color:"#888",marginTop:4}}>Highest single-round score. AI scores only 9.</p>
                </div>

                <div className="gp-score-row" style={{marginTop:10}}><span className="gp-score-you">You: 248</span><span className="gp-score-ai">AI: 257</span><span className="gp-score-gap">Gap closes to 9 — real momentum shift entering Act 4</span></div>
              </div>

              {/* ── ACT FOUR ── */}
              <div className="gp-section" id="gp-act-4-r31-40">
                <div className="gp-act-banner">
                  <span style={{fontSize:18}}>④</span>
                  <div><div style={{fontSize:14,fontWeight:700}}>ACT FOUR — Rounds 31–40</div><div style={{fontSize:11,color:"#a89cc8"}}>The Endgame · Every round decisive · The ring becomes the judge</div></div>
                </div>

                <p>You trail by 9 with 10 rounds left. You need to average 0.9 more per round than the AI. Tight but achievable. The themes for the final 10 rounds:</p>
                <div className="gp-theme-grid">
                  {[["31","Intention 6th","#vision"],["32","Challenge 6th","#challenge"],["33","Action 6th","#action"],["34","Integration 6th","#integration"],["35","Healing 6th","#healing"],["36","Wisdom — FINAL","#wisdom"],["37","Intention 7th","#vision"],["38","Challenge 7th","#challenge"],["39","Action 7th","#action"],["40","Healing — FINAL","#healing"]].map(([r,t,tag])=>(
                    <div key={r} className="gp-theme-card" style={{background: r==="40"?"#f5f0ff":r==="36"?"#f0f9ff":"#faf9f7"}}>
                      <div style={{fontWeight:700,fontSize:11,color:"#2a1f3d"}}>R{r}</div>
                      <div style={{fontSize:11,color:"#4a3576"}}>{t}</div>
                      <div style={{fontSize:10,color:"#888"}}>{tag}</div>
                    </div>
                  ))}
                </div>
                <div className="gp-warning"><b>Critical note:</b> No Wisdom after Round 36. If holding The Oversoul Glyph (P8, #wisdom), Round 36 is the absolute last window.</div>

                <div className="gp-success"><b>R31 Intention (6th):</b> Assume Star drawn on R28. Play Star: 7+3=10. AI: 9. Gap: 8.</div>
                <div className="gp-danger"><b>R32 Challenge (6th):</b> Punishment Rift → Fog of Doubt (−1, no Hint). No #challenge card. Play Collapse of Resistance: 6+0−1=<b>5</b>. AI: 9. Gap widens to 12.</div>
                <div className="gp-callout"><b>R34 Integration (6th):</b> The Breath of Symmetry returns via cycling. Roll 6 → Quiet Grove (+1). 7+3+1=<b>11</b>. AI also hits Blessing: 6+3+2=11. Tied round, gap holds at 12.</div>

                <div className="gp-round-hdr"><span className="gp-round-num">R35</span><span style={{fontWeight:700}}>Healing (6th)</span><span className="gp-round-theme">Second-to-Last Major Healing</span></div>
                <div className="gp-play-card you" style={{marginBottom:8}}>
                  <div className="gp-play-who you">You — Reroll Saves the Round</div>
                  <p style={{fontSize:12,margin:"4px 0"}}>Roll 1 (terrible). Use final Reroll token. Roll 5 → Blessing Fountain (+2, draw 1). Draw <b>The Rebirth of Form</b> (QI_PADDLE P8, #rebirth #embodiment #renewal). Perfect — just in time.</p>
                  <code className="gp-calc">8 + 3 (#renewal) + 2 (Blessing) = <b>13</b></code>
                  <p style={{fontSize:11,color:"#888",marginTop:4}}>AI scores 10. You gain 3 points this round.</p>
                </div>

                <div className="gp-success"><b>R36 Wisdom (FINAL):</b> The Oversoul Glyph (P8, #wisdom). Land on Invoke SHADOW_SPIRAL (+1). Score: 8+3+1=<b>12</b>. AI lands on Blessing Fountain: 7+3+2=12. Tied round.</div>

                <div className="gp-score-row"><span className="gp-score-you">You: 308</span><span className="gp-score-ai">AI: 317</span><span className="gp-score-gap">Gap: 9. Four rounds left.</span></div>

                <h3>The Final Four — Rounds 37–40</h3>
                <p>You need to outscore the AI by 9 over 4 rounds. That's 2.25 extra per round. Possible — especially with R40 being Healing.</p>

                <div className="gp-warning"><b>R37 Intention (7th):</b> Draw Destiny (P8) on R36. Roll 3 → Tile 18 (Well of Memory: Integration override, draw 1). Destiny has no #integration. Score: 8+0=8. Draw Rebirth of Equilibrium — ready for R40. AI scores 10. Gap widens to 11.</div>

                <div className="gp-success"><b>R38 Challenge (7th):</b> Roll 6 → Tile 24 (Backward Rift: back 2) → land on Tile 22 (Blessing: +2, draw 1). Draw Mountain (P7, #challenge). Perfect. 7+3+2=<b>12</b>. AI: 6+3=9. Gap closes to 8.</div>

                <div className="gp-callout"><b>R39 Action (7th):</b> Draw ELEMENTAL Fire (P7, #action) on R38. Land on Oracle Stone (+1). Fire: 7+3+1=<b>11</b>. AI lands on Blessing: 7+3+2=12. Gap: 9 going into the final round.</div>

                <div className="gp-score-row"><span className="gp-score-you">You: 339</span><span className="gp-score-ai">AI: 348</span><span className="gp-score-gap">Gap: 9. One round. You need 9 more than the AI.</span></div>
              </div>

              {/* ── FINAL ROUND ── */}
              <div className="gp-section" id="gp-final-score">
                <div className="gp-act-banner" style={{background:"linear-gradient(90deg,#c8342a,#7c0000)"}}>
                  <span style={{fontSize:20}}>⚔</span>
                  <div><div style={{fontSize:14,fontWeight:700}}>Round 40 — Healing · The Final Round</div><div style={{fontSize:11,color:"#ffb3b3"}}>The game ends after this play</div></div>
                </div>

                <p>You hold <b>The Rebirth of Equilibrium</b> (QI_SLAP_ROUND P8, #rebirth #balance #renewal). You've held it since Round 37. This is the moment everything was building toward.</p>

                <div className="gp-danger">
                  <b>You roll a 6.</b> Current position: Tile 27. Plus 6 = <b>Tile 33</b>.<br/><br/>
                  Tile 33 is <b>Starfield</b> — Theme override to Destiny (bonusTag: "destiny"). The round is Healing but your tile says Destiny.<br/><br/>
                  Rebirth of Equilibrium carries #rebirth, #balance, #renewal. None are #destiny.<br/><br/>
                  Score: 8 + 0 + 0 = <b>8</b>.<br/><br/>
                  You had no Reroll tokens left to escape this tile. The killing blow was delivered by the board.
                </div>

                <div className="gp-play-card ai" style={{marginBottom:10}}>
                  <div className="gp-play-who ai">AI — Final Play</div>
                  <p style={{fontSize:12,margin:"4px 0"}}>Rolls 4. Lands on Blessing Fountain. Plays P6 Healing card.</p>
                  <code className="gp-calc">6 + 3 (#healing) + 2 (Blessing) = <b>11</b></code>
                </div>

                <table className="gp-final-table">
                  <thead><tr><th></th><th>You</th><th>AI</th></tr></thead>
                  <tbody>
                    <tr><td>Before Round 40</td><td>339</td><td>348</td></tr>
                    <tr><td>Round 40 score</td><td>+8</td><td>+11</td></tr>
                    <tr><td><b>FINAL SCORE</b></td><td><b>347</b></td><td><b>359</b></td></tr>
                  </tbody>
                </table>

                <div className="gp-danger" style={{marginTop:12}}>
                  <b>AI wins — 359 to 347.</b> Margin: 12 points. That's 3.4% of your total score. A genuinely competitive game decided by three tile moments — not strategic failure.
                </div>
              </div>

              {/* ── THREE DECISIVE MOMENTS ── */}
              <div className="gp-section" id="gp-lessons">
                <h2>⚡ The Three Moments That Decided It</h2>

                <div className="gp-danger">
                  <b>1. Round 32 — Fog of Doubt on Challenge</b><br/>
                  Punishment Rift stripped −1 from an already off-theme play. Combined with landing after a tile override, this cost 4 points against what the AI scored. A single Reroll token here would have been worth 4 points.
                </div>
                <div className="gp-danger">
                  <b>2. Round 37 — Well of Memory overrides Intention</b><br/>
                  Destiny (P8, #vision) became a P8 zero-synergy card in a single tile landing. The override stripped 3 points from what should have been an 11-point play.
                </div>
                <div className="gp-danger">
                  <b>3. Round 40 — Starfield kills Healing synergy</b><br/>
                  The Rebirth of Equilibrium (P8) was perfectly positioned for a Healing round — but Starfield overrode Healing with Destiny. Without #destiny, the P8 card scored 8 instead of 11. A 3-point loss in the final round. You had no Reroll tokens to escape.
                </div>

                <div className="gp-callout">
                  If <b>any one</b> of these three moments had gone differently — one more token, one different roll — you would have won. The game was decided by board positioning in the last 10 rounds, not by deck quality or strategic error.
                </div>

                <h2 style={{marginTop:16}}>🔍 What You'd Do Differently</h2>

                <div className="gp-strategy-grid">
                  <div className="gp-strategy-item">
                    <b>Deck selection:</b> Include more #challenge and #action cards. You were consistently weak on Challenge and Action — the two themes where you scored below 8 average. Adding full ELEMENTAL and MYTHIC would have fixed both gaps.
                  </div>
                  <div className="gp-strategy-item">
                    <b>Token timing:</b> Bonus+2 used on R4 and R29 — both correct. But one more Market tile landing in rounds 20–25 via deliberate Reroll would have given you a critical token for Round 40.
                  </div>
                  <div className="gp-strategy-item">
                    <b>Tile awareness:</b> Going into R40 at Tile 27, rolling any value other than 6 avoids Starfield. A Reroll token specifically saved for Round 40 escape would have preserved your Healing synergy and turned a loss into a win.
                  </div>
                  <div className="gp-strategy-item">
                    <b>Reading the AI:</b> At Strength 5 the AI doesn't navigate tile overrides cleverly. It scored well because tiles worked in its favor, not because of superior strategy. At Strength 7–8 it would have pulled away in the middle game more aggressively.
                  </div>
                </div>
              </div>

              {/* ── THE TRUTH ── */}
              <div className="gp-section" id="gp-the-truth">
                <h2>✦ The Fundamental Truth of 40 Rounds</h2>

                <p style={{fontSize:14,lineHeight:1.8,color:"#2a1f3d"}}>You didn't lose because of bad cards. You lost because of <b>three tile moments</b> in 40 rounds. The margin of 12 points over a total of 347 is <b>3.4%</b> — essentially a dead heat decided by board luck rather than strategic error.</p>

                <div className="gp-callout" style={{marginTop:12,fontSize:13}}>
                  <b>The score arc:</b><br/>
                  · Act 1 end (R10): You 96 — AI 99 (−3)<br/>
                  · Act 2 end (R20): You 163 — AI 165 (−2)<br/>
                  · Act 3 end (R30): You 248 — AI 257 (−9)<br/>
                  · Final (R40): You 347 — AI 359 (−12)
                </div>

                <p style={{marginTop:12,fontSize:13,color:"#444"}}>In 40 rounds the game always comes down to this: whoever navigates the tile system better over the <b>final 10 rounds</b> wins. Cards are the medium. The ring is the game.</p>

                <div className="gp-strategy-grid" style={{marginTop:12}}>
                  <div className="gp-strategy-item"><b>Average score per round:</b> You 8.7 · AI 9.0 — a difference of 0.3 per round over 40 rounds = 12 points. That's how close it was.</div>
                  <div className="gp-strategy-item"><b>To win:</b> Average 9.3 per round instead of 8.7. That requires matching theme tags on just 2 more rounds across all 40. It's not about playing better — it's about landing cleaner tiles in the endgame.</div>
                  <div className="gp-strategy-item"><b>The Rebirth principle:</b> Never play a Rebirth (P8) outside Healing or Integration unless you're 20+ behind after round 30. Every wasted Rebirth is a 5-point swing (11 vs 8).</div>
                  <div className="gp-strategy-item"><b>Token discipline:</b> Save at least one Reroll specifically for your final round. Round 40 is always Healing. A bad tile in that round is the most expensive mistake in the game.</div>
                </div>
              </div>

            </div>{/* end gp-body */}

            <div className="modal-footer">
              <span className="modal-footer-info" style={{fontSize:12,color:"#888"}}>40-round Human vs AI deep walkthrough · v6.3</span>
              <button className="btn btn-primary" onClick={() => setShowGameplay(false)}>Close</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

function CardView({ card, highlight }) {
  return (
    <div className={`card${highlight?" highlight":""}`} style={{borderColor:card.color||"#ddd8d0"}} data-glyph={card.glyph||"✦"}>
      <div className="card-head">
        <span className="card-deck-badge" style={{background:card.color||"#888"}}>{card.deckId}</span>
        {card.reversed && <span className="card-rev">REV</span>}
      </div>
      <div className="card-name">{card.name.replace(" (Rev)","")}{card.reversed?" ⟳":""}</div>
      <div className="card-meaning">{card.meaning}</div>
      <div className="card-foot">
        <span className="card-tags">{(card.tags||[]).map(t=>`#${t}`).join(" ")}</span>
        <span className="card-power">{card.power}</span>
      </div>
    </div>
  );
}
