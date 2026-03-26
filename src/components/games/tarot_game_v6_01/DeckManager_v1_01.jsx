import { useState, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
   DECK MANAGER v1.0
   Import / Export / Browse all decks from:
   — Tarot Insight Duel v6.4 (25 static decks + 6 procedural defs)
   — Quantum Impact Tool v1.0 (5 instrument ceremony decks)
   Total: 315 static cards + QI ceremony cards
═══════════════════════════════════════════════════════════════ */

const EMBEDDED_DECKS = {
  "version": "1.0",
  "created": "2026-03-25T16:49:43.796Z",
  "source": "Tarot Insight Duel v6.4 + Quantum Impact Tool v1.0",
  "description": "Complete deck library — Harmonic Field, Codex, Quantum Impact, Core Gameplay, Procedural",
  "staticDecks": {
    "ORACLE": {
      "deckId": "ORACLE",
      "color": "#7c5cbf",
      "glyph": "◈",
      "cards": [
        {
          "id": "ORACLE-0",
          "deckId": "ORACLE",
          "color": "#7c5cbf",
          "glyph": "◈",
          "name": "Seed",
          "meaning": "Beginnings, potential waiting to sprout.",
          "tags": [
            "vision",
            "growth",
            "start"
          ],
          "power": 4
        },
        {
          "id": "ORACLE-1",
          "deckId": "ORACLE",
          "color": "#7c5cbf",
          "glyph": "◈",
          "name": "Anchor",
          "meaning": "Stability, grounding in truth.",
          "tags": [
            "stability",
            "truth",
            "protection"
          ],
          "power": 5
        },
        {
          "id": "ORACLE-2",
          "deckId": "ORACLE",
          "color": "#7c5cbf",
          "glyph": "◈",
          "name": "Bridge",
          "meaning": "Connection, safe passage between states.",
          "tags": [
            "connection",
            "transition",
            "trust"
          ],
          "power": 5
        },
        {
          "id": "ORACLE-3",
          "deckId": "ORACLE",
          "color": "#7c5cbf",
          "glyph": "◈",
          "name": "Mirror",
          "meaning": "Self-honesty, reflection, awareness.",
          "tags": [
            "insight",
            "truth",
            "healing"
          ],
          "power": 6
        },
        {
          "id": "ORACLE-4",
          "deckId": "ORACLE",
          "color": "#7c5cbf",
          "glyph": "◈",
          "name": "River",
          "meaning": "Flow, adaptability, persistence.",
          "tags": [
            "flow",
            "change",
            "surrender"
          ],
          "power": 5
        },
        {
          "id": "ORACLE-5",
          "deckId": "ORACLE",
          "color": "#7c5cbf",
          "glyph": "◈",
          "name": "Mountain",
          "meaning": "Challenge that builds strength.",
          "tags": [
            "challenge",
            "endurance",
            "patience"
          ],
          "power": 7
        },
        {
          "id": "ORACLE-6",
          "deckId": "ORACLE",
          "color": "#7c5cbf",
          "glyph": "◈",
          "name": "Key",
          "meaning": "Access, unlocking the next step.",
          "tags": [
            "solution",
            "action",
            "reveal"
          ],
          "power": 6
        },
        {
          "id": "ORACLE-7",
          "deckId": "ORACLE",
          "color": "#7c5cbf",
          "glyph": "◈",
          "name": "Door",
          "meaning": "Threshold, invitation to choose.",
          "tags": [
            "choice",
            "destiny",
            "opportunity"
          ],
          "power": 5
        },
        {
          "id": "ORACLE-8",
          "deckId": "ORACLE",
          "color": "#7c5cbf",
          "glyph": "◈",
          "name": "Lantern",
          "meaning": "Guidance, inner light in darkness.",
          "tags": [
            "guidance",
            "wisdom",
            "protection"
          ],
          "power": 6
        },
        {
          "id": "ORACLE-9",
          "deckId": "ORACLE",
          "color": "#7c5cbf",
          "glyph": "◈",
          "name": "Path",
          "meaning": "Direction, commit to a route.",
          "tags": [
            "focus",
            "discipline",
            "journey"
          ],
          "power": 5
        },
        {
          "id": "ORACLE-10",
          "deckId": "ORACLE",
          "color": "#7c5cbf",
          "glyph": "◈",
          "name": "Storm",
          "meaning": "Shake-up, clearing what no longer serves.",
          "tags": [
            "purge",
            "change",
            "power"
          ],
          "power": 7
        },
        {
          "id": "ORACLE-11",
          "deckId": "ORACLE",
          "color": "#7c5cbf",
          "glyph": "◈",
          "name": "Sun",
          "meaning": "Vitality, clarity, success.",
          "tags": [
            "joy",
            "clarity",
            "action"
          ],
          "power": 8
        },
        {
          "id": "ORACLE-12",
          "deckId": "ORACLE",
          "color": "#7c5cbf",
          "glyph": "◈",
          "name": "Moon",
          "meaning": "Intuition, cycles, the unseen.",
          "tags": [
            "intuition",
            "mystery",
            "dream"
          ],
          "power": 6
        },
        {
          "id": "ORACLE-13",
          "deckId": "ORACLE",
          "color": "#7c5cbf",
          "glyph": "◈",
          "name": "Star",
          "meaning": "Hope, alignment with purpose.",
          "tags": [
            "vision",
            "destiny",
            "healing"
          ],
          "power": 7
        },
        {
          "id": "ORACLE-14",
          "deckId": "ORACLE",
          "color": "#7c5cbf",
          "glyph": "◈",
          "name": "Tree",
          "meaning": "Roots and branches; heritage & growth.",
          "tags": [
            "growth",
            "stability",
            "legacy"
          ],
          "power": 6
        },
        {
          "id": "ORACLE-15",
          "deckId": "ORACLE",
          "color": "#7c5cbf",
          "glyph": "◈",
          "name": "Flame",
          "meaning": "Passion, ignition, creative spark.",
          "tags": [
            "passion",
            "action",
            "creation"
          ],
          "power": 7
        },
        {
          "id": "ORACLE-16",
          "deckId": "ORACLE",
          "color": "#7c5cbf",
          "glyph": "◈",
          "name": "Wave",
          "meaning": "Emotion, empathy, sensitivity.",
          "tags": [
            "feeling",
            "connection",
            "healing"
          ],
          "power": 5
        },
        {
          "id": "ORACLE-17",
          "deckId": "ORACLE",
          "color": "#7c5cbf",
          "glyph": "◈",
          "name": "Spiral",
          "meaning": "Evolution through repetition.",
          "tags": [
            "integration",
            "progress",
            "cycle"
          ],
          "power": 6
        },
        {
          "id": "ORACLE-18",
          "deckId": "ORACLE",
          "color": "#7c5cbf",
          "glyph": "◈",
          "name": "Crown",
          "meaning": "Authority, sovereignty, boundaries.",
          "tags": [
            "leadership",
            "boundaries",
            "clarity"
          ],
          "power": 7
        },
        {
          "id": "ORACLE-19",
          "deckId": "ORACLE",
          "color": "#7c5cbf",
          "glyph": "◈",
          "name": "Mask",
          "meaning": "Personas; reveal or conceal wisely.",
          "tags": [
            "discernment",
            "truth",
            "protection"
          ],
          "power": 5
        },
        {
          "id": "ORACLE-20",
          "deckId": "ORACLE",
          "color": "#7c5cbf",
          "glyph": "◈",
          "name": "Compass",
          "meaning": "Orientation, find true north.",
          "tags": [
            "guidance",
            "choice",
            "focus"
          ],
          "power": 6
        },
        {
          "id": "ORACLE-21",
          "deckId": "ORACLE",
          "color": "#7c5cbf",
          "glyph": "◈",
          "name": "Phoenix",
          "meaning": "Rebirth from ashes.",
          "tags": [
            "renewal",
            "power",
            "destiny"
          ],
          "power": 8
        }
      ]
    },
    "QLOVE": {
      "deckId": "QLOVE",
      "color": "#c25d8a",
      "glyph": "♡",
      "cards": [
        {
          "id": "QLOVE-0",
          "deckId": "QLOVE",
          "color": "#c25d8a",
          "glyph": "♡",
          "name": "Magnetism",
          "meaning": "Natural pull between hearts.",
          "tags": [
            "attraction",
            "connection",
            "destiny"
          ],
          "power": 6
        },
        {
          "id": "QLOVE-1",
          "deckId": "QLOVE",
          "color": "#c25d8a",
          "glyph": "♡",
          "name": "Resonance",
          "meaning": "Match of frequencies; harmony.",
          "tags": [
            "harmony",
            "coherence",
            "trust"
          ],
          "power": 6
        },
        {
          "id": "QLOVE-2",
          "deckId": "QLOVE",
          "color": "#c25d8a",
          "glyph": "♡",
          "name": "Entanglement",
          "meaning": "Deep bond across distance.",
          "tags": [
            "union",
            "mystery",
            "fate"
          ],
          "power": 7
        },
        {
          "id": "QLOVE-3",
          "deckId": "QLOVE",
          "color": "#c25d8a",
          "glyph": "♡",
          "name": "Coherence",
          "meaning": "Aligned mind-heart action.",
          "tags": [
            "alignment",
            "truth",
            "action"
          ],
          "power": 6
        },
        {
          "id": "QLOVE-4",
          "deckId": "QLOVE",
          "color": "#c25d8a",
          "glyph": "♡",
          "name": "Trust",
          "meaning": "Faith in the process and each other.",
          "tags": [
            "trust",
            "surrender",
            "stability"
          ],
          "power": 7
        },
        {
          "id": "QLOVE-5",
          "deckId": "QLOVE",
          "color": "#c25d8a",
          "glyph": "♡",
          "name": "Vulnerability",
          "meaning": "Open-hearted courage.",
          "tags": [
            "intimacy",
            "truth",
            "courage"
          ],
          "power": 6
        },
        {
          "id": "QLOVE-6",
          "deckId": "QLOVE",
          "color": "#c25d8a",
          "glyph": "♡",
          "name": "Boundaries",
          "meaning": "Healthy edges create safety.",
          "tags": [
            "boundaries",
            "clarity",
            "protection"
          ],
          "power": 6
        },
        {
          "id": "QLOVE-7",
          "deckId": "QLOVE",
          "color": "#c25d8a",
          "glyph": "♡",
          "name": "Polarity",
          "meaning": "Opposites dancing into wholeness.",
          "tags": [
            "passion",
            "dynamic",
            "balance"
          ],
          "power": 7
        },
        {
          "id": "QLOVE-8",
          "deckId": "QLOVE",
          "color": "#c25d8a",
          "glyph": "♡",
          "name": "Devotion",
          "meaning": "Daily choice to show up.",
          "tags": [
            "commitment",
            "service",
            "love"
          ],
          "power": 6
        },
        {
          "id": "QLOVE-9",
          "deckId": "QLOVE",
          "color": "#c25d8a",
          "glyph": "♡",
          "name": "Play",
          "meaning": "Lightness renews connection.",
          "tags": [
            "joy",
            "creativity",
            "flow"
          ],
          "power": 5
        },
        {
          "id": "QLOVE-10",
          "deckId": "QLOVE",
          "color": "#c25d8a",
          "glyph": "♡",
          "name": "Desire",
          "meaning": "Sacred appetite for union.",
          "tags": [
            "passion",
            "truth",
            "fire"
          ],
          "power": 7
        },
        {
          "id": "QLOVE-11",
          "deckId": "QLOVE",
          "color": "#c25d8a",
          "glyph": "♡",
          "name": "Communication",
          "meaning": "Speak and listen with care.",
          "tags": [
            "voice",
            "truth",
            "connection"
          ],
          "power": 6
        },
        {
          "id": "QLOVE-12",
          "deckId": "QLOVE",
          "color": "#c25d8a",
          "glyph": "♡",
          "name": "Healing",
          "meaning": "Repair, restore, renew.",
          "tags": [
            "healing",
            "forgiveness",
            "integration"
          ],
          "power": 6
        },
        {
          "id": "QLOVE-13",
          "deckId": "QLOVE",
          "color": "#c25d8a",
          "glyph": "♡",
          "name": "Forgiveness",
          "meaning": "Release weight; free the path.",
          "tags": [
            "mercy",
            "healing",
            "renewal"
          ],
          "power": 6
        },
        {
          "id": "QLOVE-14",
          "deckId": "QLOVE",
          "color": "#c25d8a",
          "glyph": "♡",
          "name": "Patience",
          "meaning": "Let timing ripen naturally.",
          "tags": [
            "timing",
            "trust",
            "stability"
          ],
          "power": 5
        },
        {
          "id": "QLOVE-15",
          "deckId": "QLOVE",
          "color": "#c25d8a",
          "glyph": "♡",
          "name": "Intimacy",
          "meaning": "Into-me-you-see.",
          "tags": [
            "closeness",
            "truth",
            "tenderness"
          ],
          "power": 6
        },
        {
          "id": "QLOVE-16",
          "deckId": "QLOVE",
          "color": "#c25d8a",
          "glyph": "♡",
          "name": "Adventure",
          "meaning": "Explore together; shared novelty.",
          "tags": [
            "expansion",
            "play",
            "courage"
          ],
          "power": 6
        },
        {
          "id": "QLOVE-17",
          "deckId": "QLOVE",
          "color": "#c25d8a",
          "glyph": "♡",
          "name": "Union",
          "meaning": "Two-as-one, honoring two.",
          "tags": [
            "union",
            "balance",
            "destiny"
          ],
          "power": 8
        },
        {
          "id": "QLOVE-18",
          "deckId": "QLOVE",
          "color": "#c25d8a",
          "glyph": "♡",
          "name": "Independence",
          "meaning": "Selfhood that enriches love.",
          "tags": [
            "sovereignty",
            "balance",
            "clarity"
          ],
          "power": 5
        },
        {
          "id": "QLOVE-19",
          "deckId": "QLOVE",
          "color": "#c25d8a",
          "glyph": "♡",
          "name": "Synchronicity",
          "meaning": "Meaningful coincidences guide paths.",
          "tags": [
            "signs",
            "destiny",
            "flow"
          ],
          "power": 6
        },
        {
          "id": "QLOVE-20",
          "deckId": "QLOVE",
          "color": "#c25d8a",
          "glyph": "♡",
          "name": "Choice",
          "meaning": "Love chosen today, again.",
          "tags": [
            "choice",
            "action",
            "commitment"
          ],
          "power": 6
        },
        {
          "id": "QLOVE-21",
          "deckId": "QLOVE",
          "color": "#c25d8a",
          "glyph": "♡",
          "name": "Renewal",
          "meaning": "Begin again with wisdom.",
          "tags": [
            "renewal",
            "hope",
            "integration"
          ],
          "power": 6
        }
      ]
    },
    "IMPACT": {
      "deckId": "IMPACT",
      "color": "#0e8f8f",
      "glyph": "⬡",
      "cards": [
        {
          "id": "IMPACT-0",
          "deckId": "IMPACT",
          "color": "#0e8f8f",
          "glyph": "⬡",
          "name": "Destiny",
          "meaning": "Thread you were born to weave.",
          "tags": [
            "destiny",
            "vision",
            "commitment"
          ],
          "power": 8
        },
        {
          "id": "IMPACT-1",
          "deckId": "IMPACT",
          "color": "#0e8f8f",
          "glyph": "⬡",
          "name": "Ripple",
          "meaning": "Small actions travel far.",
          "tags": [
            "influence",
            "service",
            "awareness"
          ],
          "power": 6
        },
        {
          "id": "IMPACT-2",
          "deckId": "IMPACT",
          "color": "#0e8f8f",
          "glyph": "⬡",
          "name": "Influence",
          "meaning": "Shape outcomes with integrity.",
          "tags": [
            "leadership",
            "voice",
            "ethics"
          ],
          "power": 7
        },
        {
          "id": "IMPACT-3",
          "deckId": "IMPACT",
          "color": "#0e8f8f",
          "glyph": "⬡",
          "name": "Presence",
          "meaning": "Sacred attention alters reality.",
          "tags": [
            "presence",
            "clarity",
            "care"
          ],
          "power": 6
        },
        {
          "id": "IMPACT-4",
          "deckId": "IMPACT",
          "color": "#0e8f8f",
          "glyph": "⬡",
          "name": "Catalyst",
          "meaning": "Spark that starts the chain.",
          "tags": [
            "ignite",
            "change",
            "action"
          ],
          "power": 7
        },
        {
          "id": "IMPACT-5",
          "deckId": "IMPACT",
          "color": "#0e8f8f",
          "glyph": "⬡",
          "name": "Echo",
          "meaning": "What you send returns amplified.",
          "tags": [
            "karma",
            "awareness",
            "feedback"
          ],
          "power": 6
        },
        {
          "id": "IMPACT-6",
          "deckId": "IMPACT",
          "color": "#0e8f8f",
          "glyph": "⬡",
          "name": "Legacy",
          "meaning": "Plant trees for future shade.",
          "tags": [
            "stewardship",
            "time",
            "service"
          ],
          "power": 7
        },
        {
          "id": "IMPACT-7",
          "deckId": "IMPACT",
          "color": "#0e8f8f",
          "glyph": "⬡",
          "name": "Threshold",
          "meaning": "Stand at the edge and step.",
          "tags": [
            "courage",
            "choice",
            "destiny"
          ],
          "power": 6
        },
        {
          "id": "IMPACT-8",
          "deckId": "IMPACT",
          "color": "#0e8f8f",
          "glyph": "⬡",
          "name": "Alignment",
          "meaning": "Act in line with values.",
          "tags": [
            "integrity",
            "focus",
            "wisdom"
          ],
          "power": 6
        },
        {
          "id": "IMPACT-9",
          "deckId": "IMPACT",
          "color": "#0e8f8f",
          "glyph": "⬡",
          "name": "Momentum",
          "meaning": "Keep moving; compounding gains.",
          "tags": [
            "action",
            "discipline",
            "power"
          ],
          "power": 6
        },
        {
          "id": "IMPACT-10",
          "deckId": "IMPACT",
          "color": "#0e8f8f",
          "glyph": "⬡",
          "name": "Service",
          "meaning": "Lift others as you rise.",
          "tags": [
            "care",
            "stewardship",
            "love"
          ],
          "power": 6
        },
        {
          "id": "IMPACT-11",
          "deckId": "IMPACT",
          "color": "#0e8f8f",
          "glyph": "⬡",
          "name": "Justice",
          "meaning": "Balance scales with compassion.",
          "tags": [
            "fairness",
            "truth",
            "courage"
          ],
          "power": 7
        },
        {
          "id": "IMPACT-12",
          "deckId": "IMPACT",
          "color": "#0e8f8f",
          "glyph": "⬡",
          "name": "Courage",
          "meaning": "Meet fear with heart.",
          "tags": [
            "bravery",
            "action",
            "truth"
          ],
          "power": 7
        },
        {
          "id": "IMPACT-13",
          "deckId": "IMPACT",
          "color": "#0e8f8f",
          "glyph": "⬡",
          "name": "Wisdom",
          "meaning": "Applied knowledge over time.",
          "tags": [
            "insight",
            "clarity",
            "guidance"
          ],
          "power": 6
        },
        {
          "id": "IMPACT-14",
          "deckId": "IMPACT",
          "color": "#0e8f8f",
          "glyph": "⬡",
          "name": "Voice",
          "meaning": "Speak reality into being.",
          "tags": [
            "communication",
            "truth",
            "influence"
          ],
          "power": 6
        },
        {
          "id": "IMPACT-15",
          "deckId": "IMPACT",
          "color": "#0e8f8f",
          "glyph": "⬡",
          "name": "Guardian",
          "meaning": "Protect, guide, stand watch.",
          "tags": [
            "protection",
            "service",
            "love"
          ],
          "power": 6
        },
        {
          "id": "IMPACT-16",
          "deckId": "IMPACT",
          "color": "#0e8f8f",
          "glyph": "⬡",
          "name": "Pilgrim",
          "meaning": "Walk your path in faith.",
          "tags": [
            "journey",
            "trust",
            "growth"
          ],
          "power": 6
        },
        {
          "id": "IMPACT-17",
          "deckId": "IMPACT",
          "color": "#0e8f8f",
          "glyph": "⬡",
          "name": "Gift",
          "meaning": "Offerings that change lives.",
          "tags": [
            "generosity",
            "love",
            "impact"
          ],
          "power": 6
        },
        {
          "id": "IMPACT-18",
          "deckId": "IMPACT",
          "color": "#0e8f8f",
          "glyph": "⬡",
          "name": "Oath",
          "meaning": "Binding promise to your path.",
          "tags": [
            "commitment",
            "destiny",
            "integrity"
          ],
          "power": 7
        }
      ]
    },
    "CODEX": {
      "deckId": "CODEX",
      "color": "#2a6be0",
      "glyph": "⌥",
      "cards": [
        {
          "id": "CODEX-0",
          "deckId": "CODEX",
          "color": "#2a6be0",
          "glyph": "⌥",
          "name": "Idea",
          "meaning": "Spark of possibility.",
          "tags": [
            "creation",
            "vision",
            "start"
          ],
          "power": 5
        },
        {
          "id": "CODEX-1",
          "deckId": "CODEX",
          "color": "#2a6be0",
          "glyph": "⌥",
          "name": "Prototype",
          "meaning": "Make it real fast.",
          "tags": [
            "action",
            "experiment",
            "learn"
          ],
          "power": 6
        },
        {
          "id": "CODEX-2",
          "deckId": "CODEX",
          "color": "#2a6be0",
          "glyph": "⌥",
          "name": "Feedback",
          "meaning": "Truth from the field.",
          "tags": [
            "insight",
            "iteration",
            "growth"
          ],
          "power": 5
        },
        {
          "id": "CODEX-3",
          "deckId": "CODEX",
          "color": "#2a6be0",
          "glyph": "⌥",
          "name": "Iteration",
          "meaning": "Refine loops into excellence.",
          "tags": [
            "cycle",
            "discipline",
            "progress"
          ],
          "power": 6
        },
        {
          "id": "CODEX-4",
          "deckId": "CODEX",
          "color": "#2a6be0",
          "glyph": "⌥",
          "name": "Mechanic",
          "meaning": "Core verb of play.",
          "tags": [
            "design",
            "balance",
            "focus"
          ],
          "power": 6
        },
        {
          "id": "CODEX-5",
          "deckId": "CODEX",
          "color": "#2a6be0",
          "glyph": "⌥",
          "name": "Flow",
          "meaning": "Effortless absorption.",
          "tags": [
            "timing",
            "rhythm",
            "clarity"
          ],
          "power": 6
        },
        {
          "id": "CODEX-6",
          "deckId": "CODEX",
          "color": "#2a6be0",
          "glyph": "⌥",
          "name": "Challenge",
          "meaning": "Edge of skill invites growth.",
          "tags": [
            "skill",
            "growth",
            "courage"
          ],
          "power": 6
        },
        {
          "id": "CODEX-7",
          "deckId": "CODEX",
          "color": "#2a6be0",
          "glyph": "⌥",
          "name": "Narrative",
          "meaning": "Players become the story.",
          "tags": [
            "story",
            "immersion",
            "choice"
          ],
          "power": 6
        },
        {
          "id": "CODEX-8",
          "deckId": "CODEX",
          "color": "#2a6be0",
          "glyph": "⌥",
          "name": "System",
          "meaning": "Interlocking parts sing.",
          "tags": [
            "design",
            "emergence",
            "order"
          ],
          "power": 6
        },
        {
          "id": "CODEX-9",
          "deckId": "CODEX",
          "color": "#2a6be0",
          "glyph": "⌥",
          "name": "Emergence",
          "meaning": "Simple rules, rich results.",
          "tags": [
            "depth",
            "design",
            "surprise"
          ],
          "power": 6
        },
        {
          "id": "CODEX-10",
          "deckId": "CODEX",
          "color": "#2a6be0",
          "glyph": "⌥",
          "name": "Polish",
          "meaning": "Tiny details, big feel.",
          "tags": [
            "craft",
            "care",
            "quality"
          ],
          "power": 6
        },
        {
          "id": "CODEX-11",
          "deckId": "CODEX",
          "color": "#2a6be0",
          "glyph": "⌥",
          "name": "Shipping",
          "meaning": "Done > perfect.",
          "tags": [
            "action",
            "commitment",
            "momentum"
          ],
          "power": 6
        },
        {
          "id": "CODEX-12",
          "deckId": "CODEX",
          "color": "#2a6be0",
          "glyph": "⌥",
          "name": "Community",
          "meaning": "People keep games alive.",
          "tags": [
            "relationship",
            "service",
            "legacy"
          ],
          "power": 6
        },
        {
          "id": "CODEX-13",
          "deckId": "CODEX",
          "color": "#2a6be0",
          "glyph": "⌥",
          "name": "Playtest",
          "meaning": "Reality check.",
          "tags": [
            "truth",
            "feedback",
            "progress"
          ],
          "power": 6
        },
        {
          "id": "CODEX-14",
          "deckId": "CODEX",
          "color": "#2a6be0",
          "glyph": "⌥",
          "name": "Balance",
          "meaning": "Fair challenge, fair reward.",
          "tags": [
            "equity",
            "tuning",
            "wisdom"
          ],
          "power": 6
        }
      ]
    },
    "ELEMENTAL": {
      "deckId": "ELEMENTAL",
      "color": "#cc3333",
      "glyph": "△",
      "cards": [
        {
          "id": "ELEMENTAL-0",
          "deckId": "ELEMENTAL",
          "color": "#cc3333",
          "glyph": "△",
          "name": "Earth",
          "meaning": "Grounded abundance.",
          "tags": [
            "stability",
            "growth",
            "earth"
          ],
          "power": 6
        },
        {
          "id": "ELEMENTAL-1",
          "deckId": "ELEMENTAL",
          "color": "#cc3333",
          "glyph": "△",
          "name": "Water",
          "meaning": "Feel, flow, cleanse.",
          "tags": [
            "healing",
            "flow",
            "water"
          ],
          "power": 6
        },
        {
          "id": "ELEMENTAL-2",
          "deckId": "ELEMENTAL",
          "color": "#cc3333",
          "glyph": "△",
          "name": "Fire",
          "meaning": "Ignite, act, transform.",
          "tags": [
            "action",
            "passion",
            "fire"
          ],
          "power": 7
        },
        {
          "id": "ELEMENTAL-3",
          "deckId": "ELEMENTAL",
          "color": "#cc3333",
          "glyph": "△",
          "name": "Air",
          "meaning": "Think, speak, connect.",
          "tags": [
            "clarity",
            "voice",
            "air"
          ],
          "power": 6
        },
        {
          "id": "ELEMENTAL-4",
          "deckId": "ELEMENTAL",
          "color": "#cc3333",
          "glyph": "△",
          "name": "Aether",
          "meaning": "Spirit & synthesis.",
          "tags": [
            "wisdom",
            "integration",
            "mystery"
          ],
          "power": 7
        },
        {
          "id": "ELEMENTAL-5",
          "deckId": "ELEMENTAL",
          "color": "#cc3333",
          "glyph": "△",
          "name": "Stone",
          "meaning": "Endurance over time.",
          "tags": [
            "patience",
            "stability",
            "legacy"
          ],
          "power": 6
        },
        {
          "id": "ELEMENTAL-6",
          "deckId": "ELEMENTAL",
          "color": "#cc3333",
          "glyph": "△",
          "name": "Tide",
          "meaning": "Emotional rhythm.",
          "tags": [
            "feeling",
            "cycle",
            "healing"
          ],
          "power": 5
        },
        {
          "id": "ELEMENTAL-7",
          "deckId": "ELEMENTAL",
          "color": "#cc3333",
          "glyph": "△",
          "name": "Spark",
          "meaning": "Quick creative burst.",
          "tags": [
            "creation",
            "start",
            "passion"
          ],
          "power": 6
        },
        {
          "id": "ELEMENTAL-8",
          "deckId": "ELEMENTAL",
          "color": "#cc3333",
          "glyph": "△",
          "name": "Gale",
          "meaning": "Sudden change of mind.",
          "tags": [
            "change",
            "clarity",
            "transition"
          ],
          "power": 5
        },
        {
          "id": "ELEMENTAL-9",
          "deckId": "ELEMENTAL",
          "color": "#cc3333",
          "glyph": "△",
          "name": "Starfire",
          "meaning": "Purpose ablaze.",
          "tags": [
            "destiny",
            "vision",
            "action"
          ],
          "power": 8
        }
      ]
    },
    "MYTHIC": {
      "deckId": "MYTHIC",
      "color": "#7c3aed",
      "glyph": "✦",
      "cards": [
        {
          "id": "MYTHIC-0",
          "deckId": "MYTHIC",
          "color": "#7c3aed",
          "glyph": "✦",
          "name": "Hero",
          "meaning": "Courage meets challenge.",
          "tags": [
            "courage",
            "challenge",
            "destiny"
          ],
          "power": 7
        },
        {
          "id": "MYTHIC-1",
          "deckId": "MYTHIC",
          "color": "#7c3aed",
          "glyph": "✦",
          "name": "Sage",
          "meaning": "Seeing patterns of truth.",
          "tags": [
            "wisdom",
            "clarity",
            "guidance"
          ],
          "power": 7
        },
        {
          "id": "MYTHIC-2",
          "deckId": "MYTHIC",
          "color": "#7c3aed",
          "glyph": "✦",
          "name": "Trickster",
          "meaning": "Unexpected openings.",
          "tags": [
            "change",
            "play",
            "surprise"
          ],
          "power": 6
        },
        {
          "id": "MYTHIC-3",
          "deckId": "MYTHIC",
          "color": "#7c3aed",
          "glyph": "✦",
          "name": "Guardian",
          "meaning": "Protecting thresholds.",
          "tags": [
            "protection",
            "stability",
            "service"
          ],
          "power": 6
        },
        {
          "id": "MYTHIC-4",
          "deckId": "MYTHIC",
          "color": "#7c3aed",
          "glyph": "✦",
          "name": "Lover",
          "meaning": "Union through devotion.",
          "tags": [
            "union",
            "love",
            "tenderness"
          ],
          "power": 7
        },
        {
          "id": "MYTHIC-5",
          "deckId": "MYTHIC",
          "color": "#7c3aed",
          "glyph": "✦",
          "name": "Creator",
          "meaning": "Worlds from nothing.",
          "tags": [
            "creation",
            "vision",
            "action"
          ],
          "power": 7
        },
        {
          "id": "MYTHIC-6",
          "deckId": "MYTHIC",
          "color": "#7c3aed",
          "glyph": "✦",
          "name": "Destroyer",
          "meaning": "End to renew.",
          "tags": [
            "purge",
            "renewal",
            "power"
          ],
          "power": 7
        },
        {
          "id": "MYTHIC-7",
          "deckId": "MYTHIC",
          "color": "#7c3aed",
          "glyph": "✦",
          "name": "Ruler",
          "meaning": "Order with care.",
          "tags": [
            "leadership",
            "balance",
            "boundaries"
          ],
          "power": 6
        },
        {
          "id": "MYTHIC-8",
          "deckId": "MYTHIC",
          "color": "#7c3aed",
          "glyph": "✦",
          "name": "Seeker",
          "meaning": "Journey into unknown.",
          "tags": [
            "adventure",
            "truth",
            "growth"
          ],
          "power": 6
        },
        {
          "id": "MYTHIC-9",
          "deckId": "MYTHIC",
          "color": "#7c3aed",
          "glyph": "✦",
          "name": "Healer",
          "meaning": "Mend what matters.",
          "tags": [
            "healing",
            "mercy",
            "integration"
          ],
          "power": 6
        }
      ]
    },
    "RELICS": {
      "deckId": "RELICS",
      "color": "#16803a",
      "glyph": "⚷",
      "cards": [
        {
          "id": "RELICS-0",
          "deckId": "RELICS",
          "color": "#16803a",
          "glyph": "⚷",
          "name": "Coin",
          "meaning": "Luck meets preparation.",
          "tags": [
            "chance",
            "choice",
            "value"
          ],
          "power": 6
        },
        {
          "id": "RELICS-1",
          "deckId": "RELICS",
          "color": "#16803a",
          "glyph": "⚷",
          "name": "Hourglass",
          "meaning": "Right timing.",
          "tags": [
            "timing",
            "patience",
            "wisdom"
          ],
          "power": 6
        },
        {
          "id": "RELICS-2",
          "deckId": "RELICS",
          "color": "#16803a",
          "glyph": "⚷",
          "name": "Quill",
          "meaning": "Write your oath.",
          "tags": [
            "voice",
            "commitment",
            "destiny"
          ],
          "power": 6
        },
        {
          "id": "RELICS-3",
          "deckId": "RELICS",
          "color": "#16803a",
          "glyph": "⚷",
          "name": "Key",
          "meaning": "Access the next door.",
          "tags": [
            "solution",
            "action",
            "reveal"
          ],
          "power": 6
        },
        {
          "id": "RELICS-4",
          "deckId": "RELICS",
          "color": "#16803a",
          "glyph": "⚷",
          "name": "Crown",
          "meaning": "Own your seat.",
          "tags": [
            "leadership",
            "boundaries",
            "clarity"
          ],
          "power": 7
        },
        {
          "id": "RELICS-5",
          "deckId": "RELICS",
          "color": "#16803a",
          "glyph": "⚷",
          "name": "Bell",
          "meaning": "Call in help.",
          "tags": [
            "community",
            "service",
            "presence"
          ],
          "power": 6
        },
        {
          "id": "RELICS-6",
          "deckId": "RELICS",
          "color": "#16803a",
          "glyph": "⚷",
          "name": "Lantern",
          "meaning": "See the way.",
          "tags": [
            "guidance",
            "clarity",
            "protection"
          ],
          "power": 6
        },
        {
          "id": "RELICS-7",
          "deckId": "RELICS",
          "color": "#16803a",
          "glyph": "⚷",
          "name": "Blade",
          "meaning": "Cut what binds.",
          "tags": [
            "discernment",
            "freedom",
            "action"
          ],
          "power": 6
        },
        {
          "id": "RELICS-8",
          "deckId": "RELICS",
          "color": "#16803a",
          "glyph": "⚷",
          "name": "Cup",
          "meaning": "Receive fully.",
          "tags": [
            "feeling",
            "healing",
            "union"
          ],
          "power": 6
        }
      ]
    },
    "SEASONS": {
      "deckId": "SEASONS",
      "color": "#059669",
      "glyph": "✿",
      "cards": [
        {
          "id": "SEASONS-0",
          "deckId": "SEASONS",
          "color": "#059669",
          "glyph": "✿",
          "name": "Spring",
          "meaning": "Begin, sprout, invite novelty.",
          "tags": [
            "start",
            "growth",
            "hope"
          ],
          "power": 5
        },
        {
          "id": "SEASONS-1",
          "deckId": "SEASONS",
          "color": "#059669",
          "glyph": "✿",
          "name": "Summer",
          "meaning": "Shine, celebrate, expand.",
          "tags": [
            "joy",
            "abundance",
            "action"
          ],
          "power": 6
        },
        {
          "id": "SEASONS-2",
          "deckId": "SEASONS",
          "color": "#059669",
          "glyph": "✿",
          "name": "Autumn",
          "meaning": "Harvest & release.",
          "tags": [
            "integration",
            "harvest",
            "wisdom"
          ],
          "power": 6
        },
        {
          "id": "SEASONS-3",
          "deckId": "SEASONS",
          "color": "#059669",
          "glyph": "✿",
          "name": "Winter",
          "meaning": "Rest, root, reflect.",
          "tags": [
            "stillness",
            "healing",
            "vision"
          ],
          "power": 5
        },
        {
          "id": "SEASONS-4",
          "deckId": "SEASONS",
          "color": "#059669",
          "glyph": "✿",
          "name": "Equinox",
          "meaning": "Balance at thresholds.",
          "tags": [
            "balance",
            "transition",
            "clarity"
          ],
          "power": 6
        },
        {
          "id": "SEASONS-5",
          "deckId": "SEASONS",
          "color": "#059669",
          "glyph": "✿",
          "name": "Solstice",
          "meaning": "Peak & pivot.",
          "tags": [
            "culmination",
            "timing",
            "destiny"
          ],
          "power": 6
        },
        {
          "id": "SEASONS-6",
          "deckId": "SEASONS",
          "color": "#059669",
          "glyph": "✿",
          "name": "Thunderhead",
          "meaning": "Energy builds.",
          "tags": [
            "power",
            "change",
            "action"
          ],
          "power": 7
        },
        {
          "id": "SEASONS-7",
          "deckId": "SEASONS",
          "color": "#059669",
          "glyph": "✿",
          "name": "First Snow",
          "meaning": "Quiet reset.",
          "tags": [
            "mercy",
            "renewal",
            "rest"
          ],
          "power": 5
        }
      ]
    },
    "CELESTIAL": {
      "deckId": "CELESTIAL",
      "color": "#0891b2",
      "glyph": "★",
      "cards": [
        {
          "id": "CELESTIAL-0",
          "deckId": "CELESTIAL",
          "color": "#0891b2",
          "glyph": "★",
          "name": "Comet",
          "meaning": "Swift omen.",
          "tags": [
            "signs",
            "surprise",
            "destiny"
          ],
          "power": 6
        },
        {
          "id": "CELESTIAL-1",
          "deckId": "CELESTIAL",
          "color": "#0891b2",
          "glyph": "★",
          "name": "Nebula",
          "meaning": "Birth of stars.",
          "tags": [
            "creation",
            "mystery",
            "hope"
          ],
          "power": 6
        },
        {
          "id": "CELESTIAL-2",
          "deckId": "CELESTIAL",
          "color": "#0891b2",
          "glyph": "★",
          "name": "Eclipse",
          "meaning": "Reveal by conceal.",
          "tags": [
            "transition",
            "truth",
            "shadow"
          ],
          "power": 6
        },
        {
          "id": "CELESTIAL-3",
          "deckId": "CELESTIAL",
          "color": "#0891b2",
          "glyph": "★",
          "name": "Constellation",
          "meaning": "Find the pattern.",
          "tags": [
            "guidance",
            "vision",
            "order"
          ],
          "power": 6
        },
        {
          "id": "CELESTIAL-4",
          "deckId": "CELESTIAL",
          "color": "#0891b2",
          "glyph": "★",
          "name": "Supernova",
          "meaning": "Vast endings → new.",
          "tags": [
            "purge",
            "renewal",
            "power"
          ],
          "power": 8
        },
        {
          "id": "CELESTIAL-5",
          "deckId": "CELESTIAL",
          "color": "#0891b2",
          "glyph": "★",
          "name": "Aurora",
          "meaning": "Beauty as guidance.",
          "tags": [
            "delight",
            "hope",
            "signs"
          ],
          "power": 5
        },
        {
          "id": "CELESTIAL-6",
          "deckId": "CELESTIAL",
          "color": "#0891b2",
          "glyph": "★",
          "name": "Black Star",
          "meaning": "Power in the unseen.",
          "tags": [
            "mystery",
            "depth",
            "fate"
          ],
          "power": 7
        },
        {
          "id": "CELESTIAL-7",
          "deckId": "CELESTIAL",
          "color": "#0891b2",
          "glyph": "★",
          "name": "Pulsar",
          "meaning": "Signal through noise.",
          "tags": [
            "clarity",
            "voice",
            "wisdom"
          ],
          "power": 6
        }
      ]
    },
    "SHADOW": {
      "deckId": "SHADOW",
      "color": "#374151",
      "glyph": "☽",
      "cards": [
        {
          "id": "SHADOW-0",
          "deckId": "SHADOW",
          "color": "#374151",
          "glyph": "☽",
          "name": "Shadow",
          "meaning": "What's disowned asks love.",
          "tags": [
            "shadow",
            "truth",
            "healing"
          ],
          "power": 6
        },
        {
          "id": "SHADOW-1",
          "deckId": "SHADOW",
          "color": "#374151",
          "glyph": "☽",
          "name": "Chain",
          "meaning": "Break subtle binds.",
          "tags": [
            "freedom",
            "courage",
            "renewal"
          ],
          "power": 6
        },
        {
          "id": "SHADOW-2",
          "deckId": "SHADOW",
          "color": "#374151",
          "glyph": "☽",
          "name": "Labyrinth",
          "meaning": "Turns grow wisdom.",
          "tags": [
            "integration",
            "patience",
            "mystery"
          ],
          "power": 6
        },
        {
          "id": "SHADOW-3",
          "deckId": "SHADOW",
          "color": "#374151",
          "glyph": "☽",
          "name": "Altar",
          "meaning": "Commit sacred work.",
          "tags": [
            "devotion",
            "presence",
            "discipline"
          ],
          "power": 6
        },
        {
          "id": "SHADOW-4",
          "deckId": "SHADOW",
          "color": "#374151",
          "glyph": "☽",
          "name": "Grave",
          "meaning": "Endings as gateways.",
          "tags": [
            "renewal",
            "mercy",
            "destiny"
          ],
          "power": 6
        },
        {
          "id": "SHADOW-5",
          "deckId": "SHADOW",
          "color": "#374151",
          "glyph": "☽",
          "name": "Mirror Dark",
          "meaning": "See what's beneath.",
          "tags": [
            "insight",
            "shadow",
            "truth"
          ],
          "power": 6
        },
        {
          "id": "SHADOW-6",
          "deckId": "SHADOW",
          "color": "#374151",
          "glyph": "☽",
          "name": "Torch",
          "meaning": "Gentle light inside.",
          "tags": [
            "guidance",
            "care",
            "protection"
          ],
          "power": 6
        },
        {
          "id": "SHADOW-7",
          "deckId": "SHADOW",
          "color": "#374151",
          "glyph": "☽",
          "name": "Vow",
          "meaning": "Make it binding.",
          "tags": [
            "integrity",
            "choice",
            "destiny"
          ],
          "power": 7
        }
      ]
    },
    "ORACLE_HF": {
      "deckId": "ORACLE_HF",
      "color": "#6d4c9e",
      "glyph": "∞",
      "cards": [
        {
          "id": "ORACLE_HF-0",
          "deckId": "ORACLE_HF",
          "color": "#6d4c9e",
          "glyph": "∞",
          "name": "The Monad",
          "meaning": "Origin point, stillness, pre-geometry — the breath before the breath.",
          "tags": [
            "origin",
            "stillness",
            "geometry"
          ],
          "power": 7
        },
        {
          "id": "ORACLE_HF-1",
          "deckId": "ORACLE_HF",
          "color": "#6d4c9e",
          "glyph": "∞",
          "name": "The Spiral",
          "meaning": "Expansion, recursion, memory unfolding — breath in motion.",
          "tags": [
            "expansion",
            "recursion",
            "memory"
          ],
          "power": 6
        },
        {
          "id": "ORACLE_HF-2",
          "deckId": "ORACLE_HF",
          "color": "#6d4c9e",
          "glyph": "∞",
          "name": "The Mirror",
          "meaning": "Seeing self through others, coherence check — reflection without distortion.",
          "tags": [
            "reflection",
            "coherence",
            "insight"
          ],
          "power": 6
        },
        {
          "id": "ORACLE_HF-3",
          "deckId": "ORACLE_HF",
          "color": "#6d4c9e",
          "glyph": "∞",
          "name": "The Glyph",
          "meaning": "Symbolic transmission, non-verbal memory — breath encoded in form.",
          "tags": [
            "symbol",
            "transmission",
            "memory"
          ],
          "power": 5
        },
        {
          "id": "ORACLE_HF-4",
          "deckId": "ORACLE_HF",
          "color": "#6d4c9e",
          "glyph": "∞",
          "name": "The Breath",
          "meaning": "Life cycle, rhythm, harmonic balance — inhale, exhale, stillness.",
          "tags": [
            "rhythm",
            "balance",
            "cycle"
          ],
          "power": 6
        },
        {
          "id": "ORACLE_HF-5",
          "deckId": "ORACLE_HF",
          "color": "#6d4c9e",
          "glyph": "∞",
          "name": "The Oversoul",
          "meaning": "Higher alignment, Monad resonance — the breath above breath.",
          "tags": [
            "alignment",
            "resonance",
            "wisdom"
          ],
          "power": 8
        },
        {
          "id": "ORACLE_HF-6",
          "deckId": "ORACLE_HF",
          "color": "#6d4c9e",
          "glyph": "∞",
          "name": "The Codex",
          "meaning": "Structural truth, recursive pattern — geometry in memory.",
          "tags": [
            "truth",
            "pattern",
            "structure"
          ],
          "power": 7
        },
        {
          "id": "ORACLE_HF-7",
          "deckId": "ORACLE_HF",
          "color": "#6d4c9e",
          "glyph": "∞",
          "name": "The Collapse",
          "meaning": "End of cycle, integration, rest — breath returning to stillness.",
          "tags": [
            "integration",
            "rest",
            "cycle"
          ],
          "power": 5
        },
        {
          "id": "ORACLE_HF-8",
          "deckId": "ORACLE_HF",
          "color": "#6d4c9e",
          "glyph": "∞",
          "name": "The Field",
          "meaning": "Collective resonance, shared geometry — breath as environment.",
          "tags": [
            "collective",
            "resonance",
            "field"
          ],
          "power": 6
        },
        {
          "id": "ORACLE_HF-9",
          "deckId": "ORACLE_HF",
          "color": "#6d4c9e",
          "glyph": "∞",
          "name": "The Anchor",
          "meaning": "Stability, embodiment, presence — breath grounded in form.",
          "tags": [
            "stability",
            "presence",
            "grounding"
          ],
          "power": 6
        },
        {
          "id": "ORACLE_HF-10",
          "deckId": "ORACLE_HF",
          "color": "#6d4c9e",
          "glyph": "∞",
          "name": "The Spiral Mirror",
          "meaning": "Seeing breath loops in others — recursive reflection.",
          "tags": [
            "recursion",
            "reflection",
            "awareness"
          ],
          "power": 6
        },
        {
          "id": "ORACLE_HF-11",
          "deckId": "ORACLE_HF",
          "color": "#6d4c9e",
          "glyph": "∞",
          "name": "The Breath Knot",
          "meaning": "Emotional recursion, unresolved loops — entangled memory.",
          "tags": [
            "emotion",
            "recursion",
            "healing"
          ],
          "power": 5
        },
        {
          "id": "ORACLE_HF-12",
          "deckId": "ORACLE_HF",
          "color": "#6d4c9e",
          "glyph": "∞",
          "name": "The Glyph of Return",
          "meaning": "Past breath re-entering awareness — memory recalled.",
          "tags": [
            "memory",
            "return",
            "past"
          ],
          "power": 5
        },
        {
          "id": "ORACLE_HF-13",
          "deckId": "ORACLE_HF",
          "color": "#6d4c9e",
          "glyph": "∞",
          "name": "The Monad Spiral",
          "meaning": "Breath becoming geometry — origin in motion.",
          "tags": [
            "origin",
            "motion",
            "geometry"
          ],
          "power": 7
        },
        {
          "id": "ORACLE_HF-14",
          "deckId": "ORACLE_HF",
          "color": "#6d4c9e",
          "glyph": "∞",
          "name": "The Mirror Collapse",
          "meaning": "Completion, closure, stillness — reflection ending.",
          "tags": [
            "completion",
            "closure",
            "stillness"
          ],
          "power": 6
        },
        {
          "id": "ORACLE_HF-15",
          "deckId": "ORACLE_HF",
          "color": "#6d4c9e",
          "glyph": "∞",
          "name": "The Codex Breath",
          "meaning": "Living memory, harmonic truth — geometry in breath.",
          "tags": [
            "memory",
            "truth",
            "harmony"
          ],
          "power": 7
        },
        {
          "id": "ORACLE_HF-16",
          "deckId": "ORACLE_HF",
          "color": "#6d4c9e",
          "glyph": "∞",
          "name": "The Oversoul Glyph",
          "meaning": "Monad-level transmission — higher breath encoded.",
          "tags": [
            "transmission",
            "wisdom",
            "monad"
          ],
          "power": 8
        },
        {
          "id": "ORACLE_HF-17",
          "deckId": "ORACLE_HF",
          "color": "#6d4c9e",
          "glyph": "∞",
          "name": "The Field Spiral",
          "meaning": "Shared memory, group coherence — collective breath in motion.",
          "tags": [
            "collective",
            "memory",
            "coherence"
          ],
          "power": 6
        },
        {
          "id": "ORACLE_HF-18",
          "deckId": "ORACLE_HF",
          "color": "#6d4c9e",
          "glyph": "∞",
          "name": "The Anchor Mirror",
          "meaning": "Stability in seeing self — grounded reflection.",
          "tags": [
            "stability",
            "reflection",
            "grounding"
          ],
          "power": 6
        },
        {
          "id": "ORACLE_HF-19",
          "deckId": "ORACLE_HF",
          "color": "#6d4c9e",
          "glyph": "∞",
          "name": "The Breath Collapse",
          "meaning": "Integration, rest, stillness — end of breath cycle.",
          "tags": [
            "integration",
            "rest",
            "stillness"
          ],
          "power": 5
        },
        {
          "id": "ORACLE_HF-20",
          "deckId": "ORACLE_HF",
          "color": "#6d4c9e",
          "glyph": "∞",
          "name": "The Codex Monad",
          "meaning": "Breath before form, stillness before motion — origin geometry.",
          "tags": [
            "origin",
            "geometry",
            "stillness"
          ],
          "power": 7
        },
        {
          "id": "ORACLE_HF-21",
          "deckId": "ORACLE_HF",
          "color": "#6d4c9e",
          "glyph": "∞",
          "name": "The Spiral Glyph",
          "meaning": "Memory unfolding through time — breath encoded in motion.",
          "tags": [
            "memory",
            "motion",
            "symbol"
          ],
          "power": 6
        }
      ]
    },
    "IMPACT_HF": {
      "deckId": "IMPACT_HF",
      "color": "#1a7a6e",
      "glyph": "⊕",
      "cards": [
        {
          "id": "IMPACT_HF-0",
          "deckId": "IMPACT_HF",
          "color": "#1a7a6e",
          "glyph": "⊕",
          "name": "The Feathered Paddle",
          "meaning": "Safe entry into sensation, breath alignment — gentle impact, trust-building.",
          "tags": [
            "trust",
            "safety",
            "alignment"
          ],
          "power": 5
        },
        {
          "id": "IMPACT_HF-1",
          "deckId": "IMPACT_HF",
          "color": "#1a7a6e",
          "glyph": "⊕",
          "name": "The Silk Rope",
          "meaning": "Holding space, emotional safety — containment without compression.",
          "tags": [
            "safety",
            "containment",
            "care"
          ],
          "power": 6
        },
        {
          "id": "IMPACT_HF-2",
          "deckId": "IMPACT_HF",
          "color": "#1a7a6e",
          "glyph": "⊕",
          "name": "The Open Hand",
          "meaning": "Pure presence, breath-to-breath impact — direct contact, no tool.",
          "tags": [
            "presence",
            "connection",
            "truth"
          ],
          "power": 7
        },
        {
          "id": "IMPACT_HF-3",
          "deckId": "IMPACT_HF",
          "color": "#1a7a6e",
          "glyph": "⊕",
          "name": "The Tawse",
          "meaning": "Breath challenge, emotional release — dual impact, layered sensation.",
          "tags": [
            "challenge",
            "release",
            "power"
          ],
          "power": 6
        },
        {
          "id": "IMPACT_HF-4",
          "deckId": "IMPACT_HF",
          "color": "#1a7a6e",
          "glyph": "⊕",
          "name": "The Belt",
          "meaning": "Recursive impact, breath echo — loop of memory.",
          "tags": [
            "recursion",
            "memory",
            "echo"
          ],
          "power": 5
        },
        {
          "id": "IMPACT_HF-5",
          "deckId": "IMPACT_HF",
          "color": "#1a7a6e",
          "glyph": "⊕",
          "name": "The Cane",
          "meaning": "Focused breath collapse, clarity through sensation — precision impact.",
          "tags": [
            "focus",
            "clarity",
            "precision"
          ],
          "power": 6
        },
        {
          "id": "IMPACT_HF-6",
          "deckId": "IMPACT_HF",
          "color": "#1a7a6e",
          "glyph": "⊕",
          "name": "The Mirror",
          "meaning": "Seeing self through sensation, breath feedback — reflection of impact.",
          "tags": [
            "reflection",
            "feedback",
            "insight"
          ],
          "power": 6
        },
        {
          "id": "IMPACT_HF-7",
          "deckId": "IMPACT_HF",
          "color": "#1a7a6e",
          "glyph": "⊕",
          "name": "The Knot",
          "meaning": "Emotional recursion, unresolved loops — entangled breath.",
          "tags": [
            "emotion",
            "recursion",
            "healing"
          ],
          "power": 5
        },
        {
          "id": "IMPACT_HF-8",
          "deckId": "IMPACT_HF",
          "color": "#1a7a6e",
          "glyph": "⊕",
          "name": "The Spiral",
          "meaning": "Expansion through impact, recursive memory — breath in motion.",
          "tags": [
            "expansion",
            "recursion",
            "power"
          ],
          "power": 7
        },
        {
          "id": "IMPACT_HF-9",
          "deckId": "IMPACT_HF",
          "color": "#1a7a6e",
          "glyph": "⊕",
          "name": "The Collapse",
          "meaning": "Integration, rest, post-impact coherence — breath returning to stillness.",
          "tags": [
            "integration",
            "rest",
            "stillness"
          ],
          "power": 5
        },
        {
          "id": "IMPACT_HF-10",
          "deckId": "IMPACT_HF",
          "color": "#1a7a6e",
          "glyph": "⊕",
          "name": "The Anchor",
          "meaning": "Stability, embodiment, presence — grounding after impact.",
          "tags": [
            "stability",
            "grounding",
            "presence"
          ],
          "power": 6
        },
        {
          "id": "IMPACT_HF-11",
          "deckId": "IMPACT_HF",
          "color": "#1a7a6e",
          "glyph": "⊕",
          "name": "The Glyph",
          "meaning": "Symbolic transmission, non-verbal memory — breath encoded in form.",
          "tags": [
            "symbol",
            "transmission",
            "memory"
          ],
          "power": 5
        }
      ]
    },
    "TAROT_HF": {
      "deckId": "TAROT_HF",
      "color": "#4a3576",
      "glyph": "⊙",
      "cards": [
        {
          "id": "TAROT_HF-0",
          "deckId": "TAROT_HF",
          "color": "#4a3576",
          "glyph": "⊙",
          "name": "The Monad",
          "meaning": "Origin point, stillness, pre-geometry.",
          "tags": [
            "origin",
            "stillness",
            "monad"
          ],
          "power": 7
        },
        {
          "id": "TAROT_HF-1",
          "deckId": "TAROT_HF",
          "color": "#4a3576",
          "glyph": "⊙",
          "name": "The Spiral",
          "meaning": "Expansion, recursion, memory unfolding.",
          "tags": [
            "expansion",
            "recursion",
            "memory"
          ],
          "power": 6
        },
        {
          "id": "TAROT_HF-2",
          "deckId": "TAROT_HF",
          "color": "#4a3576",
          "glyph": "⊙",
          "name": "The Mirror",
          "meaning": "Seeing self through others, coherence check.",
          "tags": [
            "reflection",
            "coherence",
            "insight"
          ],
          "power": 6
        },
        {
          "id": "TAROT_HF-3",
          "deckId": "TAROT_HF",
          "color": "#4a3576",
          "glyph": "⊙",
          "name": "The Glyph",
          "meaning": "Symbolic transmission, non-verbal memory.",
          "tags": [
            "symbol",
            "transmission",
            "memory"
          ],
          "power": 5
        },
        {
          "id": "TAROT_HF-4",
          "deckId": "TAROT_HF",
          "color": "#4a3576",
          "glyph": "⊙",
          "name": "The Breath",
          "meaning": "Life cycle, rhythm, harmonic balance.",
          "tags": [
            "rhythm",
            "balance",
            "cycle"
          ],
          "power": 6
        },
        {
          "id": "TAROT_HF-5",
          "deckId": "TAROT_HF",
          "color": "#4a3576",
          "glyph": "⊙",
          "name": "The Oversoul",
          "meaning": "Higher alignment, Monad resonance.",
          "tags": [
            "alignment",
            "wisdom",
            "monad"
          ],
          "power": 8
        },
        {
          "id": "TAROT_HF-6",
          "deckId": "TAROT_HF",
          "color": "#4a3576",
          "glyph": "⊙",
          "name": "The Codex",
          "meaning": "Structural truth, recursive pattern.",
          "tags": [
            "truth",
            "pattern",
            "structure"
          ],
          "power": 7
        },
        {
          "id": "TAROT_HF-7",
          "deckId": "TAROT_HF",
          "color": "#4a3576",
          "glyph": "⊙",
          "name": "The Collapse",
          "meaning": "End of cycle, integration, rest.",
          "tags": [
            "integration",
            "rest",
            "cycle"
          ],
          "power": 5
        },
        {
          "id": "TAROT_HF-8",
          "deckId": "TAROT_HF",
          "color": "#4a3576",
          "glyph": "⊙",
          "name": "The Field",
          "meaning": "Collective resonance, shared geometry.",
          "tags": [
            "collective",
            "resonance",
            "field"
          ],
          "power": 6
        },
        {
          "id": "TAROT_HF-9",
          "deckId": "TAROT_HF",
          "color": "#4a3576",
          "glyph": "⊙",
          "name": "The Anchor",
          "meaning": "Stability, embodiment, presence.",
          "tags": [
            "stability",
            "presence",
            "grounding"
          ],
          "power": 6
        },
        {
          "id": "TAROT_HF-10",
          "deckId": "TAROT_HF",
          "color": "#4a3576",
          "glyph": "⊙",
          "name": "The Spiral Mirror",
          "meaning": "Seeing breath loops in others.",
          "tags": [
            "recursion",
            "reflection",
            "awareness"
          ],
          "power": 6
        },
        {
          "id": "TAROT_HF-11",
          "deckId": "TAROT_HF",
          "color": "#4a3576",
          "glyph": "⊙",
          "name": "The Breath Knot",
          "meaning": "Emotional recursion, unresolved loops.",
          "tags": [
            "emotion",
            "recursion",
            "healing"
          ],
          "power": 5
        },
        {
          "id": "TAROT_HF-12",
          "deckId": "TAROT_HF",
          "color": "#4a3576",
          "glyph": "⊙",
          "name": "The Glyph of Return",
          "meaning": "Past breath re-entering awareness.",
          "tags": [
            "memory",
            "return",
            "past"
          ],
          "power": 5
        },
        {
          "id": "TAROT_HF-13",
          "deckId": "TAROT_HF",
          "color": "#4a3576",
          "glyph": "⊙",
          "name": "The Monad Spiral",
          "meaning": "Breath becoming geometry.",
          "tags": [
            "origin",
            "motion",
            "geometry"
          ],
          "power": 7
        },
        {
          "id": "TAROT_HF-14",
          "deckId": "TAROT_HF",
          "color": "#4a3576",
          "glyph": "⊙",
          "name": "The Mirror Collapse",
          "meaning": "Completion, closure, stillness.",
          "tags": [
            "completion",
            "closure",
            "stillness"
          ],
          "power": 6
        },
        {
          "id": "TAROT_HF-15",
          "deckId": "TAROT_HF",
          "color": "#4a3576",
          "glyph": "⊙",
          "name": "The Codex Breath",
          "meaning": "Living memory, harmonic truth.",
          "tags": [
            "memory",
            "truth",
            "harmony"
          ],
          "power": 7
        },
        {
          "id": "TAROT_HF-16",
          "deckId": "TAROT_HF",
          "color": "#4a3576",
          "glyph": "⊙",
          "name": "The Oversoul Glyph",
          "meaning": "Monad-level transmission.",
          "tags": [
            "transmission",
            "wisdom",
            "monad"
          ],
          "power": 8
        },
        {
          "id": "TAROT_HF-17",
          "deckId": "TAROT_HF",
          "color": "#4a3576",
          "glyph": "⊙",
          "name": "The Field Spiral",
          "meaning": "Shared memory, group coherence.",
          "tags": [
            "collective",
            "memory",
            "coherence"
          ],
          "power": 6
        },
        {
          "id": "TAROT_HF-18",
          "deckId": "TAROT_HF",
          "color": "#4a3576",
          "glyph": "⊙",
          "name": "The Anchor Mirror",
          "meaning": "Stability in seeing self.",
          "tags": [
            "stability",
            "reflection",
            "grounding"
          ],
          "power": 6
        },
        {
          "id": "TAROT_HF-19",
          "deckId": "TAROT_HF",
          "color": "#4a3576",
          "glyph": "⊙",
          "name": "The Breath Collapse",
          "meaning": "Integration, rest, stillness.",
          "tags": [
            "integration",
            "rest",
            "stillness"
          ],
          "power": 5
        },
        {
          "id": "TAROT_HF-20",
          "deckId": "TAROT_HF",
          "color": "#4a3576",
          "glyph": "⊙",
          "name": "The Codex Monad",
          "meaning": "Breath before form, stillness before motion.",
          "tags": [
            "origin",
            "geometry",
            "stillness"
          ],
          "power": 7
        },
        {
          "id": "TAROT_HF-21",
          "deckId": "TAROT_HF",
          "color": "#4a3576",
          "glyph": "⊙",
          "name": "The Spiral Glyph",
          "meaning": "Memory unfolding through time.",
          "tags": [
            "memory",
            "motion",
            "symbol"
          ],
          "power": 6
        }
      ]
    },
    "SACRED_GEO": {
      "deckId": "SACRED_GEO",
      "color": "#b5651d",
      "glyph": "⬟",
      "cards": [
        {
          "id": "SACRED_GEO-0",
          "deckId": "SACRED_GEO",
          "color": "#b5651d",
          "glyph": "⬟",
          "name": "The Monad",
          "meaning": "Breath before form, stillness before motion — point of origin.",
          "tags": [
            "origin",
            "stillness",
            "geometry"
          ],
          "power": 7
        },
        {
          "id": "SACRED_GEO-1",
          "deckId": "SACRED_GEO",
          "color": "#b5651d",
          "glyph": "⬟",
          "name": "The Vesica Piscis",
          "meaning": "Duality in union, breath convergence — overlapping circles.",
          "tags": [
            "union",
            "duality",
            "convergence"
          ],
          "power": 6
        },
        {
          "id": "SACRED_GEO-2",
          "deckId": "SACRED_GEO",
          "color": "#b5651d",
          "glyph": "⬟",
          "name": "The Triangle",
          "meaning": "Breath containment, structural emergence — first stable form.",
          "tags": [
            "structure",
            "containment",
            "stability"
          ],
          "power": 6
        },
        {
          "id": "SACRED_GEO-3",
          "deckId": "SACRED_GEO",
          "color": "#b5651d",
          "glyph": "⬟",
          "name": "The Square",
          "meaning": "Breath anchored in form — stability and grounding.",
          "tags": [
            "stability",
            "grounding",
            "earth"
          ],
          "power": 5
        },
        {
          "id": "SACRED_GEO-4",
          "deckId": "SACRED_GEO",
          "color": "#b5651d",
          "glyph": "⬟",
          "name": "The Tetractys",
          "meaning": "Breath recursion, harmonic layering — ten-point triangle.",
          "tags": [
            "recursion",
            "harmony",
            "pattern"
          ],
          "power": 7
        },
        {
          "id": "SACRED_GEO-5",
          "deckId": "SACRED_GEO",
          "color": "#b5651d",
          "glyph": "⬟",
          "name": "The Spiral",
          "meaning": "Expansion through recursion, memory unfolding — breath in motion.",
          "tags": [
            "expansion",
            "recursion",
            "memory"
          ],
          "power": 6
        },
        {
          "id": "SACRED_GEO-6",
          "deckId": "SACRED_GEO",
          "color": "#b5651d",
          "glyph": "⬟",
          "name": "The Torus",
          "meaning": "Self-sustaining field, closed loop of energy — breath returning to itself.",
          "tags": [
            "field",
            "cycle",
            "energy"
          ],
          "power": 8
        },
        {
          "id": "SACRED_GEO-7",
          "deckId": "SACRED_GEO",
          "color": "#b5651d",
          "glyph": "⬟",
          "name": "The Cube",
          "meaning": "Breath crystallized, structure in stillness — solid form.",
          "tags": [
            "structure",
            "stillness",
            "form"
          ],
          "power": 6
        },
        {
          "id": "SACRED_GEO-8",
          "deckId": "SACRED_GEO",
          "color": "#b5651d",
          "glyph": "⬟",
          "name": "The Dodecahedron",
          "meaning": "Breath in higher dimension, Monad geometry — twelve-sided form.",
          "tags": [
            "geometry",
            "wisdom",
            "dimension"
          ],
          "power": 7
        },
        {
          "id": "SACRED_GEO-9",
          "deckId": "SACRED_GEO",
          "color": "#b5651d",
          "glyph": "⬟",
          "name": "The Icosahedron",
          "meaning": "Fluidity, emotional breath, water geometry — twenty-sided form.",
          "tags": [
            "fluidity",
            "emotion",
            "water"
          ],
          "power": 6
        },
        {
          "id": "SACRED_GEO-10",
          "deckId": "SACRED_GEO",
          "color": "#b5651d",
          "glyph": "⬟",
          "name": "The Flower of Life",
          "meaning": "Breath matrix, universal pattern — overlapping circles grid.",
          "tags": [
            "pattern",
            "matrix",
            "unity"
          ],
          "power": 8
        },
        {
          "id": "SACRED_GEO-11",
          "deckId": "SACRED_GEO",
          "color": "#b5651d",
          "glyph": "⬟",
          "name": "Metatron's Cube",
          "meaning": "Breath geometry of creation, harmonic totality — all Platonic solids in one.",
          "tags": [
            "creation",
            "totality",
            "harmony"
          ],
          "power": 9
        }
      ]
    },
    "AFFIRMATION": {
      "deckId": "AFFIRMATION",
      "color": "#c0762a",
      "glyph": "✧",
      "cards": [
        {
          "id": "AFFIRMATION-0",
          "deckId": "AFFIRMATION",
          "color": "#c0762a",
          "glyph": "✧",
          "name": "I Am Still",
          "meaning": "Breath before motion, origin of presence — Monad phase.",
          "tags": [
            "stillness",
            "presence",
            "monad"
          ],
          "power": 6
        },
        {
          "id": "AFFIRMATION-1",
          "deckId": "AFFIRMATION",
          "color": "#c0762a",
          "glyph": "✧",
          "name": "I Breathe in Coherence",
          "meaning": "Alignment through expansion — inhale phase.",
          "tags": [
            "alignment",
            "coherence",
            "expansion"
          ],
          "power": 7
        },
        {
          "id": "AFFIRMATION-2",
          "deckId": "AFFIRMATION",
          "color": "#c0762a",
          "glyph": "✧",
          "name": "I Release What Is Not Mine",
          "meaning": "Breath collapse, letting go — exhale phase.",
          "tags": [
            "release",
            "surrender",
            "exhale"
          ],
          "power": 6
        },
        {
          "id": "AFFIRMATION-3",
          "deckId": "AFFIRMATION",
          "color": "#c0762a",
          "glyph": "✧",
          "name": "I Am the Spiral",
          "meaning": "Memory unfolding through breath — recursion phase.",
          "tags": [
            "recursion",
            "memory",
            "spiral"
          ],
          "power": 6
        },
        {
          "id": "AFFIRMATION-4",
          "deckId": "AFFIRMATION",
          "color": "#c0762a",
          "glyph": "✧",
          "name": "I Reflect Without Distortion",
          "meaning": "Seeing self clearly, without projection — mirror phase.",
          "tags": [
            "reflection",
            "clarity",
            "truth"
          ],
          "power": 7
        },
        {
          "id": "AFFIRMATION-5",
          "deckId": "AFFIRMATION",
          "color": "#c0762a",
          "glyph": "✧",
          "name": "I Anchor in Stillness",
          "meaning": "Breath returning to rest — collapse phase.",
          "tags": [
            "stillness",
            "rest",
            "grounding"
          ],
          "power": 5
        },
        {
          "id": "AFFIRMATION-6",
          "deckId": "AFFIRMATION",
          "color": "#c0762a",
          "glyph": "✧",
          "name": "I Speak Only What Resonates",
          "meaning": "Breath through voice, harmonic language — expression phase.",
          "tags": [
            "voice",
            "resonance",
            "truth"
          ],
          "power": 6
        },
        {
          "id": "AFFIRMATION-7",
          "deckId": "AFFIRMATION",
          "color": "#c0762a",
          "glyph": "✧",
          "name": "I Receive Without Grasping",
          "meaning": "Allowing without contraction — inhale phase.",
          "tags": [
            "receiving",
            "flow",
            "surrender"
          ],
          "power": 6
        },
        {
          "id": "AFFIRMATION-8",
          "deckId": "AFFIRMATION",
          "color": "#c0762a",
          "glyph": "✧",
          "name": "I Am the Breath Between Thoughts",
          "meaning": "Awareness without form — stillness phase.",
          "tags": [
            "awareness",
            "stillness",
            "clarity"
          ],
          "power": 7
        },
        {
          "id": "AFFIRMATION-9",
          "deckId": "AFFIRMATION",
          "color": "#c0762a",
          "glyph": "✧",
          "name": "I Spiral Into Memory",
          "meaning": "Breath as time, memory as geometry — recursion phase.",
          "tags": [
            "memory",
            "time",
            "geometry"
          ],
          "power": 6
        },
        {
          "id": "AFFIRMATION-10",
          "deckId": "AFFIRMATION",
          "color": "#c0762a",
          "glyph": "✧",
          "name": "I Collapse Into Coherence",
          "meaning": "Integration through rest — collapse phase.",
          "tags": [
            "integration",
            "rest",
            "coherence"
          ],
          "power": 5
        },
        {
          "id": "AFFIRMATION-11",
          "deckId": "AFFIRMATION",
          "color": "#c0762a",
          "glyph": "✧",
          "name": "I Am the Breath That Breathes Me",
          "meaning": "Breath as origin, self as field — Monad phase.",
          "tags": [
            "origin",
            "field",
            "monad"
          ],
          "power": 8
        }
      ]
    },
    "MYSTERY_SW": {
      "deckId": "MYSTERY_SW",
      "color": "#2d2d4e",
      "glyph": "⊗",
      "cards": [
        {
          "id": "MYSTERY_SW-0",
          "deckId": "MYSTERY_SW",
          "color": "#2d2d4e",
          "glyph": "⊗",
          "name": "The Mask",
          "meaning": "What you show to hide what you feel — breath behind identity.",
          "tags": [
            "identity",
            "shadow",
            "protection"
          ],
          "power": 5
        },
        {
          "id": "MYSTERY_SW-1",
          "deckId": "MYSTERY_SW",
          "color": "#2d2d4e",
          "glyph": "⊗",
          "name": "The Mirror",
          "meaning": "Seeing what you deny in others — breath reflecting distortion.",
          "tags": [
            "projection",
            "shadow",
            "truth"
          ],
          "power": 6
        },
        {
          "id": "MYSTERY_SW-2",
          "deckId": "MYSTERY_SW",
          "color": "#2d2d4e",
          "glyph": "⊗",
          "name": "The Wound",
          "meaning": "Memory trapped in contraction — breath interrupted.",
          "tags": [
            "wound",
            "healing",
            "memory"
          ],
          "power": 5
        },
        {
          "id": "MYSTERY_SW-3",
          "deckId": "MYSTERY_SW",
          "color": "#2d2d4e",
          "glyph": "⊗",
          "name": "The Spiral of Shame",
          "meaning": "Self-judgment looping without release — breath collapsing inward.",
          "tags": [
            "shame",
            "recursion",
            "healing"
          ],
          "power": 5
        },
        {
          "id": "MYSTERY_SW-4",
          "deckId": "MYSTERY_SW",
          "color": "#2d2d4e",
          "glyph": "⊗",
          "name": "The Void",
          "meaning": "Stillness mistaken for emptiness — breath without form.",
          "tags": [
            "stillness",
            "emptiness",
            "mystery"
          ],
          "power": 6
        },
        {
          "id": "MYSTERY_SW-5",
          "deckId": "MYSTERY_SW",
          "color": "#2d2d4e",
          "glyph": "⊗",
          "name": "The Projection",
          "meaning": "Assigning your shadow to another — breath displaced.",
          "tags": [
            "shadow",
            "awareness",
            "truth"
          ],
          "power": 5
        },
        {
          "id": "MYSTERY_SW-6",
          "deckId": "MYSTERY_SW",
          "color": "#2d2d4e",
          "glyph": "⊗",
          "name": "The Collapse",
          "meaning": "Integration through surrender — breath returning to stillness.",
          "tags": [
            "integration",
            "surrender",
            "rest"
          ],
          "power": 6
        },
        {
          "id": "MYSTERY_SW-7",
          "deckId": "MYSTERY_SW",
          "color": "#2d2d4e",
          "glyph": "⊗",
          "name": "The Fragment",
          "meaning": "Parts of self unacknowledged — breath in pieces.",
          "tags": [
            "wholeness",
            "healing",
            "integration"
          ],
          "power": 5
        },
        {
          "id": "MYSTERY_SW-8",
          "deckId": "MYSTERY_SW",
          "color": "#2d2d4e",
          "glyph": "⊗",
          "name": "The Gate",
          "meaning": "Crossing into the unknown — breath threshold.",
          "tags": [
            "threshold",
            "courage",
            "destiny"
          ],
          "power": 7
        },
        {
          "id": "MYSTERY_SW-9",
          "deckId": "MYSTERY_SW",
          "color": "#2d2d4e",
          "glyph": "⊗",
          "name": "The Echo",
          "meaning": "Old patterns repeating in new forms — breath returning distorted.",
          "tags": [
            "pattern",
            "recursion",
            "awareness"
          ],
          "power": 6
        },
        {
          "id": "MYSTERY_SW-10",
          "deckId": "MYSTERY_SW",
          "color": "#2d2d4e",
          "glyph": "⊗",
          "name": "The Observer",
          "meaning": "Witnessing shadow without becoming it — breath without judgment.",
          "tags": [
            "witnessing",
            "clarity",
            "wisdom"
          ],
          "power": 7
        },
        {
          "id": "MYSTERY_SW-11",
          "deckId": "MYSTERY_SW",
          "color": "#2d2d4e",
          "glyph": "⊗",
          "name": "The Integration",
          "meaning": "Shadow remembered, not rejected — breath as wholeness.",
          "tags": [
            "integration",
            "wholeness",
            "healing"
          ],
          "power": 8
        },
        {
          "id": "MYSTERY_SW-12",
          "deckId": "MYSTERY_SW",
          "color": "#2d2d4e",
          "glyph": "⊗",
          "name": "The Rebirth",
          "meaning": "Emerging from shadow with coherence — breath as new spiral.",
          "tags": [
            "rebirth",
            "renewal",
            "coherence"
          ],
          "power": 8
        }
      ]
    },
    "TEQUILA_SLAPS": {
      "deckId": "TEQUILA_SLAPS",
      "color": "#c0392b",
      "glyph": "⚡",
      "cards": [
        {
          "id": "TEQUILA_SLAPS-0",
          "deckId": "TEQUILA_SLAPS",
          "color": "#c0392b",
          "glyph": "⚡",
          "name": "The Tequila Shot",
          "meaning": "Breath acceleration, spark of chaos — sudden ignition.",
          "tags": [
            "chaos",
            "spark",
            "ignition"
          ],
          "power": 7
        },
        {
          "id": "TEQUILA_SLAPS-1",
          "deckId": "TEQUILA_SLAPS",
          "color": "#c0392b",
          "glyph": "⚡",
          "name": "The Slap",
          "meaning": "Polarity inversion, playful shock — breath interruption.",
          "tags": [
            "polarity",
            "shock",
            "play"
          ],
          "power": 6
        },
        {
          "id": "TEQUILA_SLAPS-2",
          "deckId": "TEQUILA_SLAPS",
          "color": "#c0392b",
          "glyph": "⚡",
          "name": "The Laughter Collapse",
          "meaning": "Integration through humor, spiral reset — breath release through joy.",
          "tags": [
            "joy",
            "laughter",
            "release"
          ],
          "power": 6
        },
        {
          "id": "TEQUILA_SLAPS-3",
          "deckId": "TEQUILA_SLAPS",
          "color": "#c0392b",
          "glyph": "⚡",
          "name": "The Dare",
          "meaning": "Edge testing, boundary play — breath challenge.",
          "tags": [
            "challenge",
            "edge",
            "play"
          ],
          "power": 6
        },
        {
          "id": "TEQUILA_SLAPS-4",
          "deckId": "TEQUILA_SLAPS",
          "color": "#c0392b",
          "glyph": "⚡",
          "name": "The Pause",
          "meaning": "Tension without release, stillness in polarity — breath held in anticipation.",
          "tags": [
            "tension",
            "stillness",
            "anticipation"
          ],
          "power": 5
        },
        {
          "id": "TEQUILA_SLAPS-5",
          "deckId": "TEQUILA_SLAPS",
          "color": "#c0392b",
          "glyph": "⚡",
          "name": "The Mirror",
          "meaning": "Seeing self through reaction, breath feedback — reflection of play.",
          "tags": [
            "reflection",
            "feedback",
            "play"
          ],
          "power": 5
        },
        {
          "id": "TEQUILA_SLAPS-6",
          "deckId": "TEQUILA_SLAPS",
          "color": "#c0392b",
          "glyph": "⚡",
          "name": "The Spiral",
          "meaning": "Expansion through play, recursive memory — breath in motion.",
          "tags": [
            "expansion",
            "play",
            "recursion"
          ],
          "power": 6
        },
        {
          "id": "TEQUILA_SLAPS-7",
          "deckId": "TEQUILA_SLAPS",
          "color": "#c0392b",
          "glyph": "⚡",
          "name": "The Collapse",
          "meaning": "Integration, rest, post-play coherence — breath returning to stillness.",
          "tags": [
            "integration",
            "rest",
            "stillness"
          ],
          "power": 5
        },
        {
          "id": "TEQUILA_SLAPS-8",
          "deckId": "TEQUILA_SLAPS",
          "color": "#c0392b",
          "glyph": "⚡",
          "name": "The Anchor",
          "meaning": "Stability, embodiment, presence — grounding after play.",
          "tags": [
            "stability",
            "grounding",
            "presence"
          ],
          "power": 5
        }
      ]
    },
    "BREATH_SPIRAL": {
      "deckId": "BREATH_SPIRAL",
      "color": "#7e57c2",
      "glyph": "〇",
      "cards": [
        {
          "id": "BREATH_SPIRAL-0",
          "deckId": "BREATH_SPIRAL",
          "color": "#7e57c2",
          "glyph": "〇",
          "name": "The First Breath",
          "meaning": "Origin of spiral — the Monad phase.",
          "tags": [
            "origin",
            "monad",
            "start"
          ],
          "power": 7
        },
        {
          "id": "BREATH_SPIRAL-1",
          "deckId": "BREATH_SPIRAL",
          "color": "#7e57c2",
          "glyph": "〇",
          "name": "The Spiral Expands",
          "meaning": "Breath reaching outward — inhale phase.",
          "tags": [
            "expansion",
            "inhale",
            "growth"
          ],
          "power": 6
        },
        {
          "id": "BREATH_SPIRAL-2",
          "deckId": "BREATH_SPIRAL",
          "color": "#7e57c2",
          "glyph": "〇",
          "name": "The Spiral Collapses",
          "meaning": "Breath returning inward — exhale phase.",
          "tags": [
            "surrender",
            "exhale",
            "release"
          ],
          "power": 6
        },
        {
          "id": "BREATH_SPIRAL-3",
          "deckId": "BREATH_SPIRAL",
          "color": "#7e57c2",
          "glyph": "〇",
          "name": "The Spiral Stillness",
          "meaning": "Breath in rest — collapse phase.",
          "tags": [
            "stillness",
            "rest",
            "collapse"
          ],
          "power": 5
        },
        {
          "id": "BREATH_SPIRAL-4",
          "deckId": "BREATH_SPIRAL",
          "color": "#7e57c2",
          "glyph": "〇",
          "name": "The Breath of Memory",
          "meaning": "Breath carrying past spirals — recursion phase.",
          "tags": [
            "memory",
            "recursion",
            "past"
          ],
          "power": 6
        },
        {
          "id": "BREATH_SPIRAL-5",
          "deckId": "BREATH_SPIRAL",
          "color": "#7e57c2",
          "glyph": "〇",
          "name": "The Breath of Vision",
          "meaning": "Breath opening new timelines — inhale phase.",
          "tags": [
            "vision",
            "future",
            "expansion"
          ],
          "power": 7
        },
        {
          "id": "BREATH_SPIRAL-6",
          "deckId": "BREATH_SPIRAL",
          "color": "#7e57c2",
          "glyph": "〇",
          "name": "The Breath of Surrender",
          "meaning": "Breath releasing control — exhale phase.",
          "tags": [
            "surrender",
            "release",
            "trust"
          ],
          "power": 6
        },
        {
          "id": "BREATH_SPIRAL-7",
          "deckId": "BREATH_SPIRAL",
          "color": "#7e57c2",
          "glyph": "〇",
          "name": "The Breath of Silence",
          "meaning": "Breath without need — stillness phase.",
          "tags": [
            "silence",
            "stillness",
            "presence"
          ],
          "power": 5
        },
        {
          "id": "BREATH_SPIRAL-8",
          "deckId": "BREATH_SPIRAL",
          "color": "#7e57c2",
          "glyph": "〇",
          "name": "The Breath of the Monad",
          "meaning": "Breath before form — origin phase.",
          "tags": [
            "origin",
            "monad",
            "geometry"
          ],
          "power": 7
        },
        {
          "id": "BREATH_SPIRAL-9",
          "deckId": "BREATH_SPIRAL",
          "color": "#7e57c2",
          "glyph": "〇",
          "name": "The Breath of the Mirror",
          "meaning": "Breath seeing itself — reflection phase.",
          "tags": [
            "reflection",
            "insight",
            "coherence"
          ],
          "power": 6
        },
        {
          "id": "BREATH_SPIRAL-10",
          "deckId": "BREATH_SPIRAL",
          "color": "#7e57c2",
          "glyph": "〇",
          "name": "The Breath of the Field",
          "meaning": "Breath stabilizing geometry — coherence phase.",
          "tags": [
            "coherence",
            "field",
            "stability"
          ],
          "power": 6
        },
        {
          "id": "BREATH_SPIRAL-11",
          "deckId": "BREATH_SPIRAL",
          "color": "#7e57c2",
          "glyph": "〇",
          "name": "The Breath That Breathes You",
          "meaning": "Breath as spiral, spiral as self — completion phase.",
          "tags": [
            "completion",
            "wholeness",
            "monad"
          ],
          "power": 8
        }
      ]
    },
    "CODEX_MIRROR": {
      "deckId": "CODEX_MIRROR",
      "color": "#4527a0",
      "glyph": "◉",
      "cards": [
        {
          "id": "CODEX_MIRROR-0",
          "deckId": "CODEX_MIRROR",
          "color": "#4527a0",
          "glyph": "◉",
          "name": "The Monad",
          "meaning": "Breath before form — point of origin.",
          "tags": [
            "origin",
            "stillness",
            "monad"
          ],
          "power": 7
        },
        {
          "id": "CODEX_MIRROR-1",
          "deckId": "CODEX_MIRROR",
          "color": "#4527a0",
          "glyph": "◉",
          "name": "The Vesica Piscis",
          "meaning": "Duality in union — overlapping circles.",
          "tags": [
            "union",
            "duality",
            "convergence"
          ],
          "power": 6
        },
        {
          "id": "CODEX_MIRROR-2",
          "deckId": "CODEX_MIRROR",
          "color": "#4527a0",
          "glyph": "◉",
          "name": "The Triangle",
          "meaning": "Breath containment — first stable form.",
          "tags": [
            "structure",
            "containment",
            "stability"
          ],
          "power": 6
        },
        {
          "id": "CODEX_MIRROR-3",
          "deckId": "CODEX_MIRROR",
          "color": "#4527a0",
          "glyph": "◉",
          "name": "The Square",
          "meaning": "Breath grounded — stability of form.",
          "tags": [
            "stability",
            "grounding",
            "earth"
          ],
          "power": 5
        },
        {
          "id": "CODEX_MIRROR-4",
          "deckId": "CODEX_MIRROR",
          "color": "#4527a0",
          "glyph": "◉",
          "name": "The Tetractys",
          "meaning": "Breath recursion — ten-point triangle.",
          "tags": [
            "recursion",
            "harmony",
            "pattern"
          ],
          "power": 7
        },
        {
          "id": "CODEX_MIRROR-5",
          "deckId": "CODEX_MIRROR",
          "color": "#4527a0",
          "glyph": "◉",
          "name": "The Spiral",
          "meaning": "Expansion through memory — breath in motion.",
          "tags": [
            "expansion",
            "recursion",
            "memory"
          ],
          "power": 6
        },
        {
          "id": "CODEX_MIRROR-6",
          "deckId": "CODEX_MIRROR",
          "color": "#4527a0",
          "glyph": "◉",
          "name": "The Torus",
          "meaning": "Breath returning to itself — self-sustaining field.",
          "tags": [
            "field",
            "cycle",
            "energy"
          ],
          "power": 8
        },
        {
          "id": "CODEX_MIRROR-7",
          "deckId": "CODEX_MIRROR",
          "color": "#4527a0",
          "glyph": "◉",
          "name": "The Cube",
          "meaning": "Breath crystallized — solid form.",
          "tags": [
            "structure",
            "stillness",
            "form"
          ],
          "power": 6
        },
        {
          "id": "CODEX_MIRROR-8",
          "deckId": "CODEX_MIRROR",
          "color": "#4527a0",
          "glyph": "◉",
          "name": "The Dodecahedron",
          "meaning": "Higher dimension breath — twelve-sided form.",
          "tags": [
            "geometry",
            "wisdom",
            "dimension"
          ],
          "power": 7
        },
        {
          "id": "CODEX_MIRROR-9",
          "deckId": "CODEX_MIRROR",
          "color": "#4527a0",
          "glyph": "◉",
          "name": "The Icosahedron",
          "meaning": "Fluidity, emotional breath — twenty-sided form.",
          "tags": [
            "fluidity",
            "emotion",
            "water"
          ],
          "power": 6
        },
        {
          "id": "CODEX_MIRROR-10",
          "deckId": "CODEX_MIRROR",
          "color": "#4527a0",
          "glyph": "◉",
          "name": "The Flower of Life",
          "meaning": "Breath matrix — overlapping circles grid.",
          "tags": [
            "pattern",
            "matrix",
            "unity"
          ],
          "power": 8
        },
        {
          "id": "CODEX_MIRROR-11",
          "deckId": "CODEX_MIRROR",
          "color": "#4527a0",
          "glyph": "◉",
          "name": "Metatron's Cube",
          "meaning": "Breath geometry of creation — all Platonic solids in one.",
          "tags": [
            "creation",
            "totality",
            "harmony"
          ],
          "power": 9
        },
        {
          "id": "CODEX_MIRROR-12",
          "deckId": "CODEX_MIRROR",
          "color": "#4527a0",
          "glyph": "◉",
          "name": "The Breath Mirror",
          "meaning": "Breath seeing itself in form — reflective spiral.",
          "tags": [
            "reflection",
            "coherence",
            "spiral"
          ],
          "power": 7
        }
      ]
    },
    "SHADOW_SPIRAL": {
      "deckId": "SHADOW_SPIRAL",
      "color": "#1a237e",
      "glyph": "⊘",
      "cards": [
        {
          "id": "SHADOW_SPIRAL-0",
          "deckId": "SHADOW_SPIRAL",
          "color": "#1a237e",
          "glyph": "⊘",
          "name": "The Mask",
          "meaning": "What you show to hide what you feel — breath behind identity.",
          "tags": [
            "identity",
            "shadow",
            "protection"
          ],
          "power": 5
        },
        {
          "id": "SHADOW_SPIRAL-1",
          "deckId": "SHADOW_SPIRAL",
          "color": "#1a237e",
          "glyph": "⊘",
          "name": "The Mirror",
          "meaning": "Seeing what you deny in others — breath reflecting distortion.",
          "tags": [
            "projection",
            "shadow",
            "truth"
          ],
          "power": 6
        },
        {
          "id": "SHADOW_SPIRAL-2",
          "deckId": "SHADOW_SPIRAL",
          "color": "#1a237e",
          "glyph": "⊘",
          "name": "The Wound",
          "meaning": "Memory trapped in contraction — breath interrupted.",
          "tags": [
            "wound",
            "healing",
            "memory"
          ],
          "power": 5
        },
        {
          "id": "SHADOW_SPIRAL-3",
          "deckId": "SHADOW_SPIRAL",
          "color": "#1a237e",
          "glyph": "⊘",
          "name": "The Spiral of Shame",
          "meaning": "Self-judgment looping without release — breath collapsing inward.",
          "tags": [
            "shame",
            "recursion",
            "healing"
          ],
          "power": 5
        },
        {
          "id": "SHADOW_SPIRAL-4",
          "deckId": "SHADOW_SPIRAL",
          "color": "#1a237e",
          "glyph": "⊘",
          "name": "The Void",
          "meaning": "Stillness mistaken for emptiness — breath without form.",
          "tags": [
            "stillness",
            "emptiness",
            "mystery"
          ],
          "power": 6
        },
        {
          "id": "SHADOW_SPIRAL-5",
          "deckId": "SHADOW_SPIRAL",
          "color": "#1a237e",
          "glyph": "⊘",
          "name": "The Projection",
          "meaning": "Assigning your shadow to another — breath displaced.",
          "tags": [
            "shadow",
            "awareness",
            "truth"
          ],
          "power": 5
        },
        {
          "id": "SHADOW_SPIRAL-6",
          "deckId": "SHADOW_SPIRAL",
          "color": "#1a237e",
          "glyph": "⊘",
          "name": "The Collapse",
          "meaning": "Integration through surrender — breath returning to stillness.",
          "tags": [
            "integration",
            "surrender",
            "rest"
          ],
          "power": 6
        },
        {
          "id": "SHADOW_SPIRAL-7",
          "deckId": "SHADOW_SPIRAL",
          "color": "#1a237e",
          "glyph": "⊘",
          "name": "The Fragment",
          "meaning": "Parts of self unacknowledged — breath in pieces.",
          "tags": [
            "wholeness",
            "healing",
            "integration"
          ],
          "power": 5
        },
        {
          "id": "SHADOW_SPIRAL-8",
          "deckId": "SHADOW_SPIRAL",
          "color": "#1a237e",
          "glyph": "⊘",
          "name": "The Gate",
          "meaning": "Crossing into the unknown — breath threshold.",
          "tags": [
            "threshold",
            "courage",
            "destiny"
          ],
          "power": 7
        },
        {
          "id": "SHADOW_SPIRAL-9",
          "deckId": "SHADOW_SPIRAL",
          "color": "#1a237e",
          "glyph": "⊘",
          "name": "The Echo",
          "meaning": "Old patterns repeating in new forms — breath returning distorted.",
          "tags": [
            "pattern",
            "recursion",
            "awareness"
          ],
          "power": 6
        },
        {
          "id": "SHADOW_SPIRAL-10",
          "deckId": "SHADOW_SPIRAL",
          "color": "#1a237e",
          "glyph": "⊘",
          "name": "The Observer",
          "meaning": "Witnessing shadow without becoming it — breath without judgment.",
          "tags": [
            "witnessing",
            "clarity",
            "wisdom"
          ],
          "power": 7
        },
        {
          "id": "SHADOW_SPIRAL-11",
          "deckId": "SHADOW_SPIRAL",
          "color": "#1a237e",
          "glyph": "⊘",
          "name": "The Integration",
          "meaning": "Shadow remembered, not rejected — breath as wholeness.",
          "tags": [
            "integration",
            "wholeness",
            "healing"
          ],
          "power": 8
        },
        {
          "id": "SHADOW_SPIRAL-12",
          "deckId": "SHADOW_SPIRAL",
          "color": "#1a237e",
          "glyph": "⊘",
          "name": "The Rebirth",
          "meaning": "Emerging from shadow with coherence — breath as new spiral.",
          "tags": [
            "rebirth",
            "renewal",
            "coherence"
          ],
          "power": 8
        }
      ]
    },
    "QI_CANE": {
      "deckId": "QI_CANE",
      "color": "#6d4c41",
      "glyph": "|",
      "cards": [
        {
          "id": "QI_CANE-0",
          "deckId": "QI_CANE",
          "color": "#6d4c41",
          "glyph": "|",
          "name": "The Strike",
          "meaning": "Impact delivered with intention — breath as force.",
          "tags": [
            "intention",
            "action",
            "power"
          ],
          "power": 7
        },
        {
          "id": "QI_CANE-1",
          "deckId": "QI_CANE",
          "color": "#6d4c41",
          "glyph": "|",
          "name": "The Echo",
          "meaning": "Impact received and integrated — breath returning.",
          "tags": [
            "integration",
            "feedback",
            "memory"
          ],
          "power": 6
        },
        {
          "id": "QI_CANE-2",
          "deckId": "QI_CANE",
          "color": "#6d4c41",
          "glyph": "|",
          "name": "The Recoil",
          "meaning": "Impact causing internal collapse — breath contracting.",
          "tags": [
            "contraction",
            "collapse",
            "truth"
          ],
          "power": 5
        },
        {
          "id": "QI_CANE-3",
          "deckId": "QI_CANE",
          "color": "#6d4c41",
          "glyph": "|",
          "name": "The Stillness",
          "meaning": "Impact absorbed without reaction — breath paused.",
          "tags": [
            "stillness",
            "presence",
            "stability"
          ],
          "power": 5
        },
        {
          "id": "QI_CANE-4",
          "deckId": "QI_CANE",
          "color": "#6d4c41",
          "glyph": "|",
          "name": "The Spiral",
          "meaning": "Impact repeating in memory — breath looping.",
          "tags": [
            "recursion",
            "memory",
            "cycle"
          ],
          "power": 6
        },
        {
          "id": "QI_CANE-5",
          "deckId": "QI_CANE",
          "color": "#6d4c41",
          "glyph": "|",
          "name": "The Mirror",
          "meaning": "Impact seen in the other — breath reflecting.",
          "tags": [
            "reflection",
            "awareness",
            "truth"
          ],
          "power": 6
        },
        {
          "id": "QI_CANE-6",
          "deckId": "QI_CANE",
          "color": "#6d4c41",
          "glyph": "|",
          "name": "The Collapse",
          "meaning": "Impact breaking structure — breath folding inward.",
          "tags": [
            "collapse",
            "purge",
            "renewal"
          ],
          "power": 6
        },
        {
          "id": "QI_CANE-7",
          "deckId": "QI_CANE",
          "color": "#6d4c41",
          "glyph": "|",
          "name": "The Integration",
          "meaning": "Impact becoming coherence — breath stabilizing.",
          "tags": [
            "integration",
            "coherence",
            "healing"
          ],
          "power": 7
        },
        {
          "id": "QI_CANE-8",
          "deckId": "QI_CANE",
          "color": "#6d4c41",
          "glyph": "|",
          "name": "The Rebirth",
          "meaning": "Impact transforming into new geometry — breath as new spiral.",
          "tags": [
            "rebirth",
            "renewal",
            "power"
          ],
          "power": 8
        }
      ]
    },
    "QI_TAWSE": {
      "deckId": "QI_TAWSE",
      "color": "#4e342e",
      "glyph": "≡",
      "cards": [
        {
          "id": "QI_TAWSE-0",
          "deckId": "QI_TAWSE",
          "color": "#4e342e",
          "glyph": "≡",
          "name": "The Split Breath",
          "meaning": "Breath divided, impact mirrored — dual impact.",
          "tags": [
            "duality",
            "impact",
            "mirror"
          ],
          "power": 6
        },
        {
          "id": "QI_TAWSE-1",
          "deckId": "QI_TAWSE",
          "color": "#4e342e",
          "glyph": "≡",
          "name": "The Echo of Division",
          "meaning": "Impact felt in multiple timelines — breath returning in two waves.",
          "tags": [
            "echo",
            "duality",
            "memory"
          ],
          "power": 6
        },
        {
          "id": "QI_TAWSE-2",
          "deckId": "QI_TAWSE",
          "color": "#4e342e",
          "glyph": "≡",
          "name": "The Recoil of Memory",
          "meaning": "Impact causing asymmetrical collapse — breath contracting unevenly.",
          "tags": [
            "contraction",
            "memory",
            "pattern"
          ],
          "power": 5
        },
        {
          "id": "QI_TAWSE-3",
          "deckId": "QI_TAWSE",
          "color": "#4e342e",
          "glyph": "≡",
          "name": "The Stillness Between",
          "meaning": "Impact absorbed without resolution — breath paused in separation.",
          "tags": [
            "stillness",
            "tension",
            "pause"
          ],
          "power": 5
        },
        {
          "id": "QI_TAWSE-4",
          "deckId": "QI_TAWSE",
          "color": "#4e342e",
          "glyph": "≡",
          "name": "The Spiral of Duality",
          "meaning": "Impact repeating in mirrored memory — breath looping in mirrored arcs.",
          "tags": [
            "recursion",
            "duality",
            "cycle"
          ],
          "power": 6
        },
        {
          "id": "QI_TAWSE-5",
          "deckId": "QI_TAWSE",
          "color": "#4e342e",
          "glyph": "≡",
          "name": "The Mirror of the Split",
          "meaning": "Impact seen in both self and other — breath reflecting duality.",
          "tags": [
            "reflection",
            "duality",
            "truth"
          ],
          "power": 6
        },
        {
          "id": "QI_TAWSE-6",
          "deckId": "QI_TAWSE",
          "color": "#4e342e",
          "glyph": "≡",
          "name": "The Collapse of Symmetry",
          "meaning": "Impact breaking mirrored structure — breath folding unevenly.",
          "tags": [
            "collapse",
            "asymmetry",
            "purge"
          ],
          "power": 6
        },
        {
          "id": "QI_TAWSE-7",
          "deckId": "QI_TAWSE",
          "color": "#4e342e",
          "glyph": "≡",
          "name": "The Integration of Two",
          "meaning": "Impact becoming coherence through union — breath stabilizing dual resonance.",
          "tags": [
            "integration",
            "union",
            "coherence"
          ],
          "power": 7
        },
        {
          "id": "QI_TAWSE-8",
          "deckId": "QI_TAWSE",
          "color": "#4e342e",
          "glyph": "≡",
          "name": "The Rebirth of the Mirror",
          "meaning": "Impact transforming into new geometry of wholeness — breath as new spiral.",
          "tags": [
            "rebirth",
            "wholeness",
            "renewal"
          ],
          "power": 8
        }
      ]
    },
    "QI_BELT": {
      "deckId": "QI_BELT",
      "color": "#3e2723",
      "glyph": "◯",
      "cards": [
        {
          "id": "QI_BELT-0",
          "deckId": "QI_BELT",
          "color": "#3e2723",
          "glyph": "◯",
          "name": "The Encircling Breath",
          "meaning": "Impact as boundary — breath contained.",
          "tags": [
            "boundaries",
            "containment",
            "protection"
          ],
          "power": 6
        },
        {
          "id": "QI_BELT-1",
          "deckId": "QI_BELT",
          "color": "#3e2723",
          "glyph": "◯",
          "name": "The Compression",
          "meaning": "Impact as containment — breath under pressure.",
          "tags": [
            "pressure",
            "power",
            "stability"
          ],
          "power": 6
        },
        {
          "id": "QI_BELT-2",
          "deckId": "QI_BELT",
          "color": "#3e2723",
          "glyph": "◯",
          "name": "The Release",
          "meaning": "Impact as liberation — breath breaking free.",
          "tags": [
            "freedom",
            "release",
            "expansion"
          ],
          "power": 7
        },
        {
          "id": "QI_BELT-3",
          "deckId": "QI_BELT",
          "color": "#3e2723",
          "glyph": "◯",
          "name": "The Memory of Constriction",
          "meaning": "Impact as past boundary — breath remembering limits.",
          "tags": [
            "memory",
            "boundary",
            "past"
          ],
          "power": 5
        },
        {
          "id": "QI_BELT-4",
          "deckId": "QI_BELT",
          "color": "#3e2723",
          "glyph": "◯",
          "name": "The Spiral of Containment",
          "meaning": "Impact repeating in memory of control — breath looping within limits.",
          "tags": [
            "recursion",
            "control",
            "cycle"
          ],
          "power": 6
        },
        {
          "id": "QI_BELT-5",
          "deckId": "QI_BELT",
          "color": "#3e2723",
          "glyph": "◯",
          "name": "The Mirror of the Belt",
          "meaning": "Impact seen in the self's resistance — breath reflecting restraint.",
          "tags": [
            "reflection",
            "resistance",
            "truth"
          ],
          "power": 6
        },
        {
          "id": "QI_BELT-6",
          "deckId": "QI_BELT",
          "color": "#3e2723",
          "glyph": "◯",
          "name": "The Collapse of Control",
          "meaning": "Impact breaking structure of containment — breath folding under pressure.",
          "tags": [
            "collapse",
            "purge",
            "freedom"
          ],
          "power": 6
        },
        {
          "id": "QI_BELT-7",
          "deckId": "QI_BELT",
          "color": "#3e2723",
          "glyph": "◯",
          "name": "The Integration of Freedom",
          "meaning": "Impact becoming coherence through liberation — breath stabilizing after release.",
          "tags": [
            "integration",
            "freedom",
            "coherence"
          ],
          "power": 7
        },
        {
          "id": "QI_BELT-8",
          "deckId": "QI_BELT",
          "color": "#3e2723",
          "glyph": "◯",
          "name": "The Rebirth of Boundaries",
          "meaning": "Impact transforming into new geometry of sovereignty — breath as self-definition.",
          "tags": [
            "rebirth",
            "sovereignty",
            "renewal"
          ],
          "power": 8
        }
      ]
    },
    "QI_PADDLE": {
      "deckId": "QI_PADDLE",
      "color": "#5d4037",
      "glyph": "▬",
      "cards": [
        {
          "id": "QI_PADDLE-0",
          "deckId": "QI_PADDLE",
          "color": "#5d4037",
          "glyph": "▬",
          "name": "The Solid Strike",
          "meaning": "Impact delivered with grounded intention — breath as force with weight.",
          "tags": [
            "grounding",
            "intention",
            "power"
          ],
          "power": 7
        },
        {
          "id": "QI_PADDLE-1",
          "deckId": "QI_PADDLE",
          "color": "#5d4037",
          "glyph": "▬",
          "name": "The Resonant Echo",
          "meaning": "Impact felt in the body's memory — breath returning through wood.",
          "tags": [
            "memory",
            "body",
            "resonance"
          ],
          "power": 6
        },
        {
          "id": "QI_PADDLE-2",
          "deckId": "QI_PADDLE",
          "color": "#5d4037",
          "glyph": "▬",
          "name": "The Recoil of Density",
          "meaning": "Impact causing structural collapse — breath contracting under mass.",
          "tags": [
            "contraction",
            "density",
            "collapse"
          ],
          "power": 5
        },
        {
          "id": "QI_PADDLE-3",
          "deckId": "QI_PADDLE",
          "color": "#5d4037",
          "glyph": "▬",
          "name": "The Stillness of Weight",
          "meaning": "Impact absorbed without resistance — breath paused under pressure.",
          "tags": [
            "stillness",
            "presence",
            "weight"
          ],
          "power": 5
        },
        {
          "id": "QI_PADDLE-4",
          "deckId": "QI_PADDLE",
          "color": "#5d4037",
          "glyph": "▬",
          "name": "The Spiral of Compression",
          "meaning": "Impact repeating in the body's geometry — breath looping through density.",
          "tags": [
            "recursion",
            "body",
            "cycle"
          ],
          "power": 6
        },
        {
          "id": "QI_PADDLE-5",
          "deckId": "QI_PADDLE",
          "color": "#5d4037",
          "glyph": "▬",
          "name": "The Mirror of Mass",
          "meaning": "Impact seen in the self's resistance to grounding — breath reflecting solidity.",
          "tags": [
            "reflection",
            "grounding",
            "truth"
          ],
          "power": 6
        },
        {
          "id": "QI_PADDLE-6",
          "deckId": "QI_PADDLE",
          "color": "#5d4037",
          "glyph": "▬",
          "name": "The Collapse of Structure",
          "meaning": "Impact breaking internal scaffolding — breath folding under force.",
          "tags": [
            "collapse",
            "purge",
            "renewal"
          ],
          "power": 6
        },
        {
          "id": "QI_PADDLE-7",
          "deckId": "QI_PADDLE",
          "color": "#5d4037",
          "glyph": "▬",
          "name": "The Integration of Gravity",
          "meaning": "Impact becoming coherence through grounding — breath stabilizing through weight.",
          "tags": [
            "integration",
            "grounding",
            "coherence"
          ],
          "power": 7
        },
        {
          "id": "QI_PADDLE-8",
          "deckId": "QI_PADDLE",
          "color": "#5d4037",
          "glyph": "▬",
          "name": "The Rebirth of Form",
          "meaning": "Impact transforming into new geometry of presence — breath as new spiral of embodiment.",
          "tags": [
            "rebirth",
            "embodiment",
            "renewal"
          ],
          "power": 8
        }
      ]
    },
    "QI_SLAP_ROUND": {
      "deckId": "QI_SLAP_ROUND",
      "color": "#b71c1c",
      "glyph": "⇌",
      "cards": [
        {
          "id": "QI_SLAP_ROUND-0",
          "deckId": "QI_SLAP_ROUND",
          "color": "#b71c1c",
          "glyph": "⇌",
          "name": "The Right Hand of Initiation",
          "meaning": "Firm slap with right hand · Breath: Exhale · Opens the spiral with masculine force. The exhale opens into the strike rather than bracing against it — the field registers this has been invited. One pole activated, the right side alive and encoded.",
          "tags": [
            "polarity",
            "initiation",
            "power"
          ],
          "power": 7
        },
        {
          "id": "QI_SLAP_ROUND-1",
          "deckId": "QI_SLAP_ROUND",
          "color": "#b71c1c",
          "glyph": "⇌",
          "name": "The Left Hand of Reception",
          "meaning": "Firm slap with left hand · Breath: Inhale · Contains the spiral with feminine yield. The inhale draws the signal inward — the body holds two encoded memories now, the exhale of the right and the inhale of the left. Both poles alive. The geometry is established.",
          "tags": [
            "polarity",
            "reception",
            "containment"
          ],
          "power": 6
        },
        {
          "id": "QI_SLAP_ROUND-2",
          "deckId": "QI_SLAP_ROUND",
          "color": "#b71c1c",
          "glyph": "⇌",
          "name": "The Alternating Spiral",
          "meaning": "Right-left-right slap sequence · Breath: Inhale-exhale-inhale · Breath loops through duality, creating mirrored tension. The spiral is in motion but not yet coherent — tension is the energy stored between poles before they find their relationship.",
          "tags": [
            "duality",
            "tension",
            "recursion"
          ],
          "power": 6
        },
        {
          "id": "QI_SLAP_ROUND-3",
          "deckId": "QI_SLAP_ROUND",
          "color": "#b71c1c",
          "glyph": "⇌",
          "name": "The Mirror of Polarity",
          "meaning": "Pause — mirror partner's breath · Breath: Stillness · Impact balances force and yield. No slap. Both fields breathe in synchrony. The polarity dissolved temporarily into shared breath — two geometries finding the same rhythm. The most intimate moment.",
          "tags": [
            "balance",
            "polarity",
            "reflection"
          ],
          "power": 6
        },
        {
          "id": "QI_SLAP_ROUND-4",
          "deckId": "QI_SLAP_ROUND",
          "color": "#b71c1c",
          "glyph": "⇌",
          "name": "The Collapse of Resistance",
          "meaning": "Rapid alternating slaps until breath breaks · Breath: Chaotic, then still · Resistance collapses through rhythm. The scaffolding the body uses to manage impact — bracing, anticipation, narrative — outpaced until the breath breaks through it. Chaos then sudden openness.",
          "tags": [
            "collapse",
            "rhythm",
            "purge"
          ],
          "power": 6
        },
        {
          "id": "QI_SLAP_ROUND-5",
          "deckId": "QI_SLAP_ROUND",
          "color": "#b71c1c",
          "glyph": "⇌",
          "name": "The Breath of Symmetry",
          "meaning": "Slow, synchronized slaps · Breath: Balanced inhale/exhale · Impact becomes coherence. One slap per breath cycle on an open, available field. Breath and impact are equals now — moving together rather than in relationship. This is what coherence feels like from inside.",
          "tags": [
            "coherence",
            "balance",
            "integration"
          ],
          "power": 7
        },
        {
          "id": "QI_SLAP_ROUND-6",
          "deckId": "QI_SLAP_ROUND",
          "color": "#b71c1c",
          "glyph": "⇌",
          "name": "The Spiral of Repetition",
          "meaning": "Repeat any previous card's action · Breath: Loop · Impact repeats until stillness is reached. The giver reads the receiver's field — repetition continues until the nervous system has fully encoded the pattern and the breath settles into quiet recognition rather than active processing.",
          "tags": [
            "recursion",
            "rhythm",
            "stillness"
          ],
          "power": 6
        },
        {
          "id": "QI_SLAP_ROUND-7",
          "deckId": "QI_SLAP_ROUND",
          "color": "#b71c1c",
          "glyph": "⇌",
          "name": "The Rebirth of Equilibrium",
          "meaning": "Both hands placed gently on partner · Breath: Deep inhale, long exhale · New geometry of presence. The same hands that delivered every strike now rest without force. The deep inhale draws in the full ceremony. The long exhale releases it into the body's permanent geometry. Equilibrium.",
          "tags": [
            "rebirth",
            "balance",
            "renewal"
          ],
          "power": 8
        }
      ]
    }
  },
  "proceduralDefs": [
    {
      "id": "ALCHEMY",
      "color": "#b45309",
      "glyph": "⚗",
      "theme": "Transmutation",
      "count": 24,
      "adjs": [
        "Red",
        "White",
        "Black",
        "Solar",
        "Lunar",
        "Fixed",
        "Volatile",
        "Prismatic"
      ],
      "nouns": [
        "Mercury",
        "Sulfur",
        "Salt",
        "Retort",
        "Crucible",
        "Elixir",
        "Stone",
        "Tincture"
      ],
      "tags": [
        "transmute",
        "purify",
        "fire",
        "solve",
        "gold"
      ],
      "templates": [
        "{N} refines base into bright {T}.",
        "Through {N}, {Q} quickens."
      ]
    },
    {
      "id": "MYTHOS",
      "color": "#9333ea",
      "glyph": "⋯",
      "theme": "World Myths",
      "count": 24,
      "adjs": [
        "Titan",
        "Divine",
        "Trickster",
        "Sky",
        "Ocean",
        "Forest",
        "Fire",
        "Thunder"
      ],
      "nouns": [
        "Journey",
        "Trial",
        "Oracle",
        "Chariot",
        "Phoenix",
        "Labyrinth",
        "Flood",
        "Boon"
      ],
      "tags": [
        "legend",
        "fate",
        "trial",
        "boon",
        "shadow",
        "rebirth"
      ]
    },
    {
      "id": "RUNES",
      "color": "#64748b",
      "glyph": "ᚱ",
      "theme": "Elder Futhark",
      "count": 18,
      "adjs": [
        "Fehu",
        "Uruz",
        "Thurisaz",
        "Ansuz",
        "Raidho",
        "Kenaz",
        "Gebo",
        "Wunjo"
      ],
      "nouns": [
        "Bloom",
        "Flow",
        "Gate",
        "Mark",
        "Path",
        "Power",
        "Seal",
        "Sign"
      ],
      "tags": [
        "value",
        "strength",
        "voice",
        "journey",
        "craft",
        "gift"
      ]
    },
    {
      "id": "ETHERICX",
      "color": "#7c3aed",
      "glyph": "∿",
      "theme": "Etheric Currents",
      "count": 30,
      "adjs": [
        "Liminal",
        "Prismatic",
        "Aetheric",
        "Subtle",
        "Harmonic",
        "Veiled",
        "Fractal",
        "Resonant"
      ],
      "nouns": [
        "Thread",
        "Weave",
        "Chord",
        "Tide",
        "Whisper",
        "Field",
        "Pulse",
        "Veil",
        "Stream",
        "Lattice"
      ],
      "tags": [
        "field",
        "signal",
        "flow",
        "vision",
        "presence",
        "attune"
      ],
      "templates": [
        "{A} {N} tunes you to {Q}.",
        "Follow the {N} and {K} into {T}."
      ]
    },
    {
      "id": "WILDLANDS",
      "color": "#22c55e",
      "glyph": "⌾",
      "theme": "Animal Totems",
      "count": 24,
      "adjs": [
        "Swift",
        "Patient",
        "Silent",
        "Noble",
        "Playful",
        "Cunning",
        "Stalwart",
        "Dawn-bright"
      ],
      "nouns": [
        "Wolf",
        "Bear",
        "Stag",
        "Hare",
        "Fox",
        "Hawk",
        "Owl",
        "Salmon",
        "Whale",
        "Crane"
      ],
      "tags": [
        "instinct",
        "ally",
        "courage",
        "balance",
        "kin",
        "track"
      ]
    },
    {
      "id": "DREAMWEAVEX",
      "color": "#06b6d4",
      "glyph": "⌁",
      "theme": "Dream Cartography",
      "count": 30,
      "adjs": [
        "Lucid",
        "Spiral",
        "Endless",
        "Surreal",
        "Starry",
        "Flooded",
        "Glassy",
        "Waking"
      ],
      "nouns": [
        "Door",
        "Hall",
        "Mirror",
        "Forest",
        "River",
        "Clock",
        "Bridge",
        "Mask",
        "Key",
        "Stair"
      ],
      "tags": [
        "dream",
        "symbol",
        "mystery",
        "sign",
        "feeling",
        "inner"
      ],
      "templates": [
        "{A} {N} reveals {Q}.",
        "Hold the {N} and remember {Q}."
      ]
    }
  ],
  "groups": [
    {
      "label": "Core Gameplay",
      "ids": [
        "ORACLE",
        "QLOVE",
        "IMPACT",
        "CODEX",
        "ELEMENTAL",
        "MYTHIC",
        "RELICS",
        "SEASONS",
        "CELESTIAL",
        "SHADOW"
      ]
    },
    {
      "label": "Codex Harmonic Field",
      "ids": [
        "ORACLE_HF",
        "IMPACT_HF",
        "TAROT_HF",
        "SACRED_GEO",
        "AFFIRMATION",
        "MYSTERY_SW",
        "TEQUILA_SLAPS"
      ]
    },
    {
      "label": "Personal Spiral & Codex",
      "ids": [
        "BREATH_SPIRAL",
        "CODEX_MIRROR",
        "SHADOW_SPIRAL"
      ]
    },
    {
      "label": "Quantum Impact",
      "ids": [
        "QI_CANE",
        "QI_TAWSE",
        "QI_BELT",
        "QI_PADDLE",
        "QI_SLAP_ROUND"
      ]
    },
    {
      "label": "Procedural",
      "ids": [
        "ALCHEMY",
        "MYTHOS",
        "RUNES",
        "ETHERICX",
        "WILDLANDS",
        "DREAMWEAVEX"
      ]
    }
  ],
  "quantumImpactToolDecks": [
    {
      "deckId": "QI_TOOL_CANE",
      "source": "QuantumImpact_v1_01",
      "color": "#6d4c41",
      "glyph": "|",
      "name": "Cane",
      "desc": "Precision · Single point · Clarity through sensation",
      "cards": [
        {
          "id": "QI_TOOL_CANE-0",
          "deckId": "QI_TOOL_CANE",
          "name": "The Strike",
          "power": 7,
          "breath": "Exhale",
          "action": "Single firm strike",
          "field": "Opens the field with precision. One clear signal enters the nervous system along a single line. The exhale opens into the contact.",
          "phase": 1
        },
        {
          "id": "QI_TOOL_CANE-1",
          "deckId": "QI_TOOL_CANE",
          "name": "The Echo",
          "power": 6,
          "breath": "Inhale",
          "action": "Stillness — feel the echo",
          "field": "The signal travels its pathway. The body reports back what just happened. Memory begins to encode at the point of contact.",
          "phase": 2
        },
        {
          "id": "QI_TOOL_CANE-2",
          "deckId": "QI_TOOL_CANE",
          "name": "The Recoil",
          "power": 5,
          "breath": "Short inhale, hold",
          "action": "Pause — body contracts",
          "field": "Involuntary contraction. Not resistance — biology. The breath pulls away from the impact site before it can return.",
          "phase": 3
        },
        {
          "id": "QI_TOOL_CANE-3",
          "deckId": "QI_TOOL_CANE",
          "name": "The Stillness",
          "power": 5,
          "breath": "Suspension",
          "action": "Complete stillness",
          "field": "The breath pauses between the strike's signal and the next breath. Silence between lightning and thunder.",
          "phase": 4
        },
        {
          "id": "QI_TOOL_CANE-4",
          "deckId": "QI_TOOL_CANE",
          "name": "The Spiral",
          "power": 6,
          "breath": "Slow inhale",
          "action": "Breathe through the memory",
          "field": "Memory loops along the same pathway the signal traveled. The cane's spiral is clean and linear — one line, repeating.",
          "phase": 5
        },
        {
          "id": "QI_TOOL_CANE-5",
          "deckId": "QI_TOOL_CANE",
          "name": "The Mirror",
          "power": 6,
          "breath": "Exhale with awareness",
          "action": "Eye contact — reflect",
          "field": "The precision of impact means neither party can pretend otherwise. Both see the same clear signal reflected between them.",
          "phase": 6
        },
        {
          "id": "QI_TOOL_CANE-6",
          "deckId": "QI_TOOL_CANE",
          "name": "The Collapse",
          "power": 6,
          "breath": "Long exhale",
          "action": "Release the bracing",
          "field": "The scaffolding held against impact — anticipatory tension, bracing — releases. Localized and clean.",
          "phase": 7
        },
        {
          "id": "QI_TOOL_CANE-7",
          "deckId": "QI_TOOL_CANE",
          "name": "The Integration",
          "power": 7,
          "breath": "Full breath cycle",
          "action": "Rest — feel the coherence",
          "field": "The nervous system reorganizes around a clear memory. Coherence restored after a precise signal. Power through clarity.",
          "phase": 8
        },
        {
          "id": "QI_TOOL_CANE-8",
          "deckId": "QI_TOOL_CANE",
          "name": "The Rebirth",
          "power": 8,
          "breath": "Deep inhale, slow exhale",
          "action": "New geometry established",
          "field": "The body that emerges has a different nervous system map. The impact sites are alive, present, permanently encoded.",
          "phase": 9
        }
      ]
    },
    {
      "deckId": "QI_TOOL_TAWSE",
      "source": "QuantumImpact_v1_01",
      "color": "#4e342e",
      "glyph": "≡",
      "name": "Tawse",
      "desc": "Duality · Split breath · Two signals simultaneously",
      "cards": [
        {
          "id": "QI_TOOL_TAWSE-0",
          "deckId": "QI_TOOL_TAWSE",
          "name": "The Split Breath",
          "power": 6,
          "breath": "Inhale splits",
          "action": "First contact — two tines land",
          "field": "The field receives two simultaneous signals. Neither is as clean as a single line. The breath splits — the nervous system must hold two truths at once.",
          "phase": 1
        },
        {
          "id": "QI_TOOL_TAWSE-1",
          "deckId": "QI_TOOL_TAWSE",
          "name": "The Echo of Division",
          "power": 6,
          "breath": "Inhale — draw both in",
          "action": "Stillness — sense both echoes",
          "field": "The echo travels two pathways simultaneously. The body remembers two points of contact as two separate timelines of sensation.",
          "phase": 2
        },
        {
          "id": "QI_TOOL_TAWSE-2",
          "deckId": "QI_TOOL_TAWSE",
          "name": "The Recoil of Memory",
          "power": 5,
          "breath": "Asymmetric hold",
          "action": "Asymmetric contraction",
          "field": "The two impact points contract the breath unevenly. The body pulls away from two sources at once — complex, multi-directional.",
          "phase": 3
        },
        {
          "id": "QI_TOOL_TAWSE-3",
          "deckId": "QI_TOOL_TAWSE",
          "name": "The Stillness Between",
          "power": 5,
          "breath": "The space between",
          "action": "Find the stillness between poles",
          "field": "The stillness exists inside duality rather than after it. A stillness held between the two tines' simultaneous signals.",
          "phase": 4
        },
        {
          "id": "QI_TOOL_TAWSE-4",
          "deckId": "QI_TOOL_TAWSE",
          "name": "The Spiral of Duality",
          "power": 6,
          "breath": "Looping inhale/exhale",
          "action": "Breathe through both pathways",
          "field": "Memory loops through two channels. The spiral carries both imprints, weaving them together until they begin to integrate.",
          "phase": 5
        },
        {
          "id": "QI_TOOL_TAWSE-5",
          "deckId": "QI_TOOL_TAWSE",
          "name": "The Mirror of the Split",
          "power": 6,
          "breath": "Exhale — release",
          "action": "See yourself in the other",
          "field": "To witness split impact from outside requires holding two perspectives simultaneously. The breath of genuine empathy.",
          "phase": 6
        },
        {
          "id": "QI_TOOL_TAWSE-6",
          "deckId": "QI_TOOL_TAWSE",
          "name": "The Collapse of Symmetry",
          "power": 6,
          "breath": "Long releasing exhale",
          "action": "Stop holding symmetry",
          "field": "The body's attempt to hold two impacts symmetrically breaks. The asymmetry is admitted. Structure releases.",
          "phase": 7
        },
        {
          "id": "QI_TOOL_TAWSE-7",
          "deckId": "QI_TOOL_TAWSE",
          "name": "The Integration of Two",
          "power": 7,
          "breath": "Full unified breath",
          "action": "Feel the union",
          "field": "Two streams finally meeting and merging into a single coherent field. Duality resolved into wholeness through breath.",
          "phase": 8
        },
        {
          "id": "QI_TOOL_TAWSE-8",
          "deckId": "QI_TOOL_TAWSE",
          "name": "The Rebirth of the Mirror",
          "power": 8,
          "breath": "Deep inhale, long exhale",
          "action": "New mirror geometry",
          "field": "The new geometry holds duality as wholeness. The body can now experience two simultaneous truths as one unified field.",
          "phase": 9
        }
      ]
    },
    {
      "deckId": "QI_TOOL_BELT",
      "source": "QuantumImpact_v1_01",
      "color": "#3e2723",
      "glyph": "◯",
      "name": "Belt",
      "desc": "Containment · Sovereignty · Breath inside boundaries",
      "cards": [
        {
          "id": "QI_TOOL_BELT-0",
          "deckId": "QI_TOOL_BELT",
          "name": "The Encircling Breath",
          "power": 6,
          "breath": "Inhale into boundary",
          "action": "Belt wraps — boundary established",
          "field": "Not a strike but an encirclement. The breath adjusts to the boundary rather than reacting to a signal. The field learns its container.",
          "phase": 1
        },
        {
          "id": "QI_TOOL_BELT-1",
          "deckId": "QI_TOOL_BELT",
          "name": "The Compression",
          "power": 6,
          "breath": "Compressed inhale",
          "action": "Feel the pressure fully",
          "field": "Breath under pressure discovers its own stability. The paradox: containment can create inner strength. Breath compresses and becomes denser.",
          "phase": 2
        },
        {
          "id": "QI_TOOL_BELT-2",
          "deckId": "QI_TOOL_BELT",
          "name": "The Release",
          "power": 7,
          "breath": "Explosive exhale",
          "action": "Resistance releases outward",
          "field": "When the belt comes off, the breath doesn't contract — it explodes outward. Freedom discovered through having known containment.",
          "phase": 3
        },
        {
          "id": "QI_TOOL_BELT-3",
          "deckId": "QI_TOOL_BELT",
          "name": "The Memory of Constriction",
          "power": 5,
          "breath": "Careful, remembered",
          "action": "Hold the memory of boundary",
          "field": "The nervous system carries the imprint of the boundary even after release. The body remembers constraint as encoded geometry.",
          "phase": 4
        },
        {
          "id": "QI_TOOL_BELT-4",
          "deckId": "QI_TOOL_BELT",
          "name": "The Spiral of Containment",
          "power": 6,
          "breath": "Looping within limits",
          "action": "Spiral inside the remembered boundary",
          "field": "The spiral doesn't expand freely — it loops within remembered limits. Each iteration finds the natural size of inner space.",
          "phase": 5
        },
        {
          "id": "QI_TOOL_BELT-5",
          "deckId": "QI_TOOL_BELT",
          "name": "The Mirror of the Belt",
          "power": 6,
          "breath": "Honest exhale",
          "action": "See your relationship with boundary",
          "field": "The mirror of containment reveals where the body resists boundaries and where it surrenders. Truth about sovereignty.",
          "phase": 6
        },
        {
          "id": "QI_TOOL_BELT-6",
          "deckId": "QI_TOOL_BELT",
          "name": "The Collapse of Control",
          "power": 6,
          "breath": "Full releasing exhale",
          "action": "Release psychological scaffolding",
          "field": "The internal structure around containment — the management of being bounded — releases. Freedom from managing the experience.",
          "phase": 7
        },
        {
          "id": "QI_TOOL_BELT-7",
          "deckId": "QI_TOOL_BELT",
          "name": "The Integration of Freedom",
          "power": 7,
          "breath": "Sovereign breath cycle",
          "action": "Breathe with full sovereignty",
          "field": "Integrating what it means to be free after having been contained. Sovereignty — you know where you end and the world begins.",
          "phase": 8
        },
        {
          "id": "QI_TOOL_BELT-8",
          "deckId": "QI_TOOL_BELT",
          "name": "The Rebirth of Boundaries",
          "power": 8,
          "breath": "Deep inhale, long exhale",
          "action": "New geometry of sovereignty",
          "field": "The body that emerges knows its own boundaries from the inside. Sovereignty not as limitation but as self-knowledge.",
          "phase": 9
        }
      ]
    },
    {
      "deckId": "QI_TOOL_PADDLE",
      "source": "QuantumImpact_v1_01",
      "color": "#5d4037",
      "glyph": "▬",
      "name": "Paddle",
      "desc": "Mass · Density · Embodiment through weight",
      "cards": [
        {
          "id": "QI_TOOL_PADDLE-0",
          "deckId": "QI_TOOL_PADDLE",
          "name": "The Solid Strike",
          "power": 7,
          "breath": "Grounded exhale",
          "action": "Full surface contact — broad weight",
          "field": "No single point. The paddle covers ground — broad, heavy, flat. The breath receives a weight, not a signal. The entire surface activates.",
          "phase": 1
        },
        {
          "id": "QI_TOOL_PADDLE-1",
          "deckId": "QI_TOOL_PADDLE",
          "name": "The Resonant Echo",
          "power": 6,
          "breath": "Body inhale",
          "action": "Feel the resonance through tissue",
          "field": "The echo travels through the body — not along a nerve pathway but through muscle and tissue. Full-surface resonance.",
          "phase": 2
        },
        {
          "id": "QI_TOOL_PADDLE-2",
          "deckId": "QI_TOOL_PADDLE",
          "name": "The Recoil of Density",
          "power": 5,
          "breath": "Slow pulling away",
          "action": "Body contracts from mass",
          "field": "Contraction from distributed mass is slower and broader than from precision. The body pulls away from weight, not a sharp signal.",
          "phase": 3
        },
        {
          "id": "QI_TOOL_PADDLE-3",
          "deckId": "QI_TOOL_PADDLE",
          "name": "The Stillness of Weight",
          "power": 5,
          "breath": "Weight held in breath",
          "action": "Let the weight settle",
          "field": "Absorbed under mass. The breath pauses because weight has settled — not because a signal needs processing. The body simply holds it.",
          "phase": 4
        },
        {
          "id": "QI_TOOL_PADDLE-4",
          "deckId": "QI_TOOL_PADDLE",
          "name": "The Spiral of Compression",
          "power": 6,
          "breath": "Body-looping breath",
          "action": "Breathe through the body's memory",
          "field": "Memory loops through the body rather than a single pathway. The paddle's spiral is somatic — it lives in tissue, muscle, skin.",
          "phase": 5
        },
        {
          "id": "QI_TOOL_PADDLE-5",
          "deckId": "QI_TOOL_PADDLE",
          "name": "The Mirror of Mass",
          "power": 6,
          "breath": "Grounded exhale",
          "action": "See your relationship with density",
          "field": "The mirror of mass reveals where the body holds against weight and where it absorbs. The truth of grounded embodiment.",
          "phase": 6
        },
        {
          "id": "QI_TOOL_PADDLE-6",
          "deckId": "QI_TOOL_PADDLE",
          "name": "The Collapse of Structure",
          "power": 6,
          "breath": "Full releasing exhale",
          "action": "Stop managing the mass",
          "field": "Under sustained broad impact the body stops managing and simply lets weight land. Structure collapses into full reception.",
          "phase": 7
        },
        {
          "id": "QI_TOOL_PADDLE-7",
          "deckId": "QI_TOOL_PADDLE",
          "name": "The Integration of Gravity",
          "power": 7,
          "breath": "Gravity breath cycle",
          "action": "Breathe with gravity not against it",
          "field": "Integrating through gravity means finding groundedness rather than fighting weight. The body that moves with gravity not against it.",
          "phase": 8
        },
        {
          "id": "QI_TOOL_PADDLE-8",
          "deckId": "QI_TOOL_PADDLE",
          "name": "The Rebirth of Form",
          "power": 8,
          "breath": "Deep embodied exhale",
          "action": "New geometry of presence in body",
          "field": "More form, not less. More present in physical existence, not removed from it. Embodiment as the destination of the arc.",
          "phase": 9
        }
      ]
    },
    {
      "deckId": "QI_TOOL_SLAP_ROUND",
      "source": "QuantumImpact_v1_01",
      "color": "#b71c1c",
      "glyph": "⇌",
      "name": "Hand Slap Round",
      "desc": "Alternating polarity · Right then Left · Equilibrium through rhythm",
      "cards": [
        {
          "id": "QI_TOOL_SLAP_ROUND-0",
          "deckId": "QI_TOOL_SLAP_ROUND",
          "name": "The Right Hand of Initiation",
          "power": 7,
          "breath": "Exhale",
          "action": "Firm slap — right hand",
          "field": "Opens the spiral with masculine force. The exhale opens into the strike. The right side is activated and encoded. One pole established.",
          "phase": 1
        },
        {
          "id": "QI_TOOL_SLAP_ROUND-1",
          "deckId": "QI_TOOL_SLAP_ROUND",
          "name": "The Left Hand of Reception",
          "power": 6,
          "breath": "Inhale",
          "action": "Firm slap — left hand",
          "field": "The left hand contains the spiral. The inhale draws the signal inward. Both poles now alive — the geometry of alternation is established.",
          "phase": 2
        },
        {
          "id": "QI_TOOL_SLAP_ROUND-2",
          "deckId": "QI_TOOL_SLAP_ROUND",
          "name": "The Alternating Spiral",
          "power": 6,
          "breath": "Inhale-exhale-inhale",
          "action": "Right-left-right sequence",
          "field": "The rhythm establishes. The body tracks three signals across two sides with breath reversing. The spiral is in motion but not yet coherent.",
          "phase": 3
        },
        {
          "id": "QI_TOOL_SLAP_ROUND-3",
          "deckId": "QI_TOOL_SLAP_ROUND",
          "name": "The Mirror of Polarity",
          "power": 6,
          "breath": "Shared stillness",
          "action": "Pause — mirror your partner's breath",
          "field": "No slap. Both fields breathe together. The polarity dissolves into shared breath. The most intimate moment of the ceremony.",
          "phase": 4
        },
        {
          "id": "QI_TOOL_SLAP_ROUND-4",
          "deckId": "QI_TOOL_SLAP_ROUND",
          "name": "The Collapse of Resistance",
          "power": 6,
          "breath": "Chaotic then still",
          "action": "Rapid alternating until breath breaks",
          "field": "The scaffolding outpaced. The body stops managing. Breath breaks through. Chaotic release then sudden openness — the field widens.",
          "phase": 5
        },
        {
          "id": "QI_TOOL_SLAP_ROUND-5",
          "deckId": "QI_TOOL_SLAP_ROUND",
          "name": "The Breath of Symmetry",
          "power": 7,
          "breath": "Balanced inhale/exhale",
          "action": "Slow synchronized slaps",
          "field": "One slap per breath cycle on an open field. Breath and impact move together. Coherence — everything moving in the same direction.",
          "phase": 6
        },
        {
          "id": "QI_TOOL_SLAP_ROUND-6",
          "deckId": "QI_TOOL_SLAP_ROUND",
          "name": "The Spiral of Repetition",
          "power": 6,
          "breath": "Loop",
          "action": "Repeat any previous action",
          "field": "The giver reads the receiver's field. Repetition continues until the nervous system has encoded the pattern and the breath settles.",
          "phase": 7
        },
        {
          "id": "QI_TOOL_SLAP_ROUND-7",
          "deckId": "QI_TOOL_SLAP_ROUND",
          "name": "The Rebirth of Equilibrium",
          "power": 8,
          "breath": "Deep inhale, long exhale",
          "action": "Both hands resting gently on partner",
          "field": "The same hands that delivered every strike now rest without force. The deep inhale draws in the full ceremony. New geometry of presence.",
          "phase": 8
        }
      ]
    }
  ]
};

const ALL_STATIC_IDS = Object.keys(EMBEDDED_DECKS.staticDecks);
const ALL_QI_IDS = EMBEDDED_DECKS.quantumImpactToolDecks.map(d => d.deckId);
const GROUPS = EMBEDDED_DECKS.groups;

export default function DeckManager({ onQuit }) {
  const [activeData, setActiveData] = useState(EMBEDDED_DECKS);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState("all");
  const [importError, setImportError] = useState(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [view, setView] = useState("browse"); // browse | card
  const [selectedCard, setSelectedCard] = useState(null);
  const fileRef = useRef(null);

  // ── All decks combined
  const staticDecks = activeData.staticDecks || {};
  const qiDecks = activeData.quantumImpactToolDecks || [];
  const procDefs = activeData.proceduralDefs || [];

  // ── Get deck list filtered by group
  const filteredDeckIds = (() => {
    let ids = [];
    if (activeGroup === "all") {
      ids = [...Object.keys(staticDecks), ...qiDecks.map(d => d.deckId)];
    } else if (activeGroup === "qi_tool") {
      ids = qiDecks.map(d => d.deckId);
    } else if (activeGroup === "procedural") {
      ids = procDefs.map(d => d.id);
    } else {
      const group = GROUPS.find(g => g.label === activeGroup);
      ids = group ? group.ids : [];
    }
    return ids;
  })();

  // ── Get cards for selected deck
  const getDeckCards = (deckId) => {
    if (staticDecks[deckId]) return staticDecks[deckId].cards;
    const qi = qiDecks.find(d => d.deckId === deckId);
    if (qi) return qi.cards;
    return [];
  };

  const getDeckMeta = (deckId) => {
    if (staticDecks[deckId]) return staticDecks[deckId];
    const qi = qiDecks.find(d => d.deckId === deckId);
    if (qi) return { color: qi.color, glyph: qi.glyph, deckId, name: qi.name };
    const proc = procDefs.find(d => d.id === deckId);
    if (proc) return { color: proc.color, glyph: proc.glyph, deckId };
    return { color: "#7c5cbf", glyph: "✦", deckId };
  };

  // ── Search
  const searchResults = searchQuery.length > 1 ? (() => {
    const q = searchQuery.toLowerCase();
    const results = [];
    [...Object.values(staticDecks), ...qiDecks].forEach(deck => {
      (deck.cards || []).forEach(card => {
        if (
          card.name?.toLowerCase().includes(q) ||
          card.meaning?.toLowerCase().includes(q) ||
          card.field?.toLowerCase().includes(q) ||
          (card.tags || []).some(t => t.includes(q))
        ) results.push({ ...card, deckColor: deck.color, deckGlyph: deck.glyph });
      });
    });
    return results.slice(0, 50);
  })() : [];

  // ── Export
  const doExport = () => {
    const blob = new Blob([JSON.stringify(activeData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quantum_tarot_decks_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Import
  const doImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!parsed.staticDecks) throw new Error("Missing staticDecks field — not a valid deck export file.");
        setActiveData(parsed);
        setImportError(null);
        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 3000);
      } catch (err) {
        setImportError("Import failed: " + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // ── Reset to built-in decks
  const doReset = () => {
    setActiveData(EMBEDDED_DECKS);
    setImportError(null);
    setSelectedDeck(null);
  };

  // ── Total card count
  const totalCards = Object.values(staticDecks).reduce((a, d) => a + (d.cards?.length || 0), 0)
    + qiDecks.reduce((a, d) => a + (d.cards?.length || 0), 0);

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    .dm-app { min-height: 100vh; background: #0f0e17; font-family: 'DM Sans', sans-serif; color: #e8e4ff; display: flex; flex-direction: column; }
    .dm-hdr { background: #13122a; border-bottom: 1px solid #2a2448; padding: 14px 24px; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
    .dm-title { font-family: 'Cinzel', serif; font-size: 18px; color: #c4b5fd; letter-spacing: 0.08em; }
    .dm-stats { font-size: 11px; color: #6b5e9a; margin-left: 4px; }
    .dm-actions { display: flex; gap: 8px; margin-left: auto; flex-wrap: wrap; }
    .dm-btn { padding: 7px 16px; border-radius: 8px; font-size: 12px; font-family: 'DM Sans', sans-serif; font-weight: 600; cursor: pointer; border: none; transition: all 0.15s; white-space: nowrap; }
    .dm-btn-primary { background: #4a3576; color: #e8d5ff; }
    .dm-btn-primary:hover { background: #5c4494; }
    .dm-btn-secondary { background: #1e1c35; color: #9a8ab8; border: 1px solid #2a2448; }
    .dm-btn-secondary:hover { background: #2a2448; color: #c4b5fd; }
    .dm-btn-success { background: #1a3a2a; color: #6ee7b7; border: 1px solid #2a5a3a; }
    .dm-btn-danger { background: #2a1515; color: #fca5a5; border: 1px solid #5a2020; }
    .dm-btn-danger:hover { background: #3a1a1a; }
    .dm-quit { background: transparent; border: 1px solid #2a2448; color: #6b5e9a; padding: 6px 14px; border-radius: 8px; cursor: pointer; font-size: 12px; font-family: 'DM Sans', sans-serif; }
    .dm-quit:hover { color: #c4b5fd; border-color: #4a3576; }
    .dm-body { display: flex; flex: 1; overflow: hidden; min-height: 0; }
    .dm-sidebar { width: 260px; min-width: 200px; background: #13122a; border-right: 1px solid #2a2448; display: flex; flex-direction: column; overflow: hidden; }
    .dm-search { padding: 12px 14px; border-bottom: 1px solid #2a2448; }
    .dm-search input { width: 100%; background: #0f0e17; border: 1px solid #2a2448; color: #e8e4ff; padding: 7px 12px; border-radius: 8px; font-size: 12px; font-family: 'DM Sans', sans-serif; outline: none; }
    .dm-search input:focus { border-color: #4a3576; }
    .dm-groups { padding: 8px 0; border-bottom: 1px solid #2a2448; }
    .dm-group-btn { width: 100%; text-align: left; padding: 7px 14px; background: transparent; border: none; color: #9a8ab8; font-size: 11px; font-weight: 700; cursor: pointer; letter-spacing: 0.05em; text-transform: uppercase; transition: all 0.1s; }
    .dm-group-btn:hover { background: #1e1c35; color: #c4b5fd; }
    .dm-group-btn.active { background: #2a2448; color: #c4b5fd; border-left: 3px solid #7c5cbf; }
    .dm-deck-list { flex: 1; overflow-y: auto; padding: 6px 0; }
    .dm-deck-item { display: flex; align-items: center; gap: 10px; padding: 8px 14px; cursor: pointer; transition: all 0.1s; border-left: 3px solid transparent; }
    .dm-deck-item:hover { background: #1e1c35; }
    .dm-deck-item.active { background: #1e1c35; border-left-color: var(--dc); }
    .dm-deck-glyph { font-size: 16px; min-width: 20px; text-align: center; }
    .dm-deck-name { font-size: 12px; font-weight: 600; color: #c4b5fd; }
    .dm-deck-count { font-size: 10px; color: #6b5e9a; margin-top: 1px; }
    .dm-main { flex: 1; overflow-y: auto; padding: 20px 24px; }
    .dm-welcome { text-align: center; padding: 60px 20px; color: #4a3f6e; }
    .dm-welcome-icon { font-size: 48px; margin-bottom: 16px; }
    .dm-welcome h2 { font-family: 'Cinzel', serif; font-size: 18px; color: #7c6a9a; margin-bottom: 8px; }
    .dm-deck-header { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #2a2448; }
    .dm-deck-badge { width: 52px; height: 52px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
    .dm-deck-title { font-family: 'Cinzel', serif; font-size: 20px; color: #e8e4ff; margin-bottom: 4px; }
    .dm-deck-sub { font-size: 12px; color: #6b5e9a; line-height: 1.5; }
    .dm-cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
    .dm-card { background: #1e1c35; border: 1px solid #2a2448; border-radius: 12px; padding: 14px 16px; cursor: pointer; transition: all 0.15s; }
    .dm-card:hover { border-color: var(--dc); background: #221f3d; transform: translateY(-1px); }
    .dm-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
    .dm-card-name { font-size: 13px; font-weight: 700; color: #c4b5fd; }
    .dm-card-power { font-family: 'Cinzel', serif; font-size: 15px; font-weight: 700; }
    .dm-card-meaning { font-size: 11px; color: #8a7ab8; line-height: 1.5; margin-bottom: 8px; }
    .dm-card-tags { display: flex; flex-wrap: wrap; gap: 4px; }
    .dm-tag { font-size: 10px; padding: 2px 7px; border-radius: 99px; background: #2a2448; color: #7c6a9a; font-family: 'DM Mono', monospace; }
    .dm-card-detail { background: #1e1c35; border: 1px solid #2a2448; border-radius: 14px; padding: 20px 24px; max-width: 640px; }
    .dm-detail-name { font-family: 'Cinzel', serif; font-size: 22px; color: #e8e4ff; margin-bottom: 4px; }
    .dm-detail-deck { font-size: 11px; color: #6b5e9a; margin-bottom: 16px; }
    .dm-detail-block { background: #13122a; border-radius: 10px; padding: 12px 14px; margin-bottom: 10px; }
    .dm-detail-label { font-size: 9px; font-weight: 700; color: #4a3576; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 5px; }
    .dm-detail-value { font-size: 13px; color: #c4b5fd; line-height: 1.6; }
    .dm-field-block { background: #0f0e17; border-left: 3px solid #4a3576; border-radius: 0 10px 10px 0; padding: 12px 16px; margin-bottom: 10px; font-size: 13px; color: #9a8ab8; line-height: 1.7; }
    .dm-proc-card { background: #1e1c35; border: 1px solid #2a2448; border-radius: 12px; padding: 14px 16px; }
    .dm-proc-title { font-family: 'Cinzel', serif; font-size: 15px; color: #c4b5fd; margin-bottom: 8px; }
    .dm-proc-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px; }
    .dm-proc-label { color: #4a3576; font-weight: 700; text-transform: uppercase; font-size: 9px; letter-spacing: 0.08em; margin-bottom: 3px; }
    .dm-proc-val { color: #9a8ab8; }
    .dm-search-results { }
    .dm-sr-item { display: flex; align-items: flex-start; gap: 12px; padding: 10px 12px; background: #1e1c35; border: 1px solid #2a2448; border-radius: 10px; margin-bottom: 8px; cursor: pointer; }
    .dm-sr-item:hover { border-color: #4a3576; }
    .dm-back { display: flex; align-items: center; gap: 8px; background: transparent; border: none; color: #6b5e9a; cursor: pointer; font-size: 12px; font-family: 'DM Sans',sans-serif; margin-bottom: 16px; padding: 0; }
    .dm-back:hover { color: #c4b5fd; }
    .alert { padding: 10px 14px; border-radius: 8px; font-size: 12px; margin: 8px 24px; }
    .alert-error { background: #2a1515; color: #fca5a5; border: 1px solid #5a2020; }
    .alert-success { background: #1a3a2a; color: #6ee7b7; border: 1px solid #2a5a3a; }
    ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: #13122a; } ::-webkit-scrollbar-thumb { background: #2a2448; border-radius: 99px; }
    @media(max-width:700px){ .dm-sidebar{ width:100%; max-height:220px; } .dm-body{ flex-direction:column; } }
  `;

  const groupButtons = [
    { key: "all", label: "All Decks" },
    ...GROUPS.map(g => ({ key: g.label, label: g.label })),
    { key: "qi_tool", label: "QI Tool Instruments" },
    { key: "procedural", label: "Procedural Defs" },
  ];

  return (
    <div className="dm-app">
      <style>{css}</style>

      {/* Header */}
      <div className="dm-hdr">
        <div>
          <div className="dm-title">✦ Deck Manager</div>
          <div className="dm-stats">{Object.keys(staticDecks).length} static decks · {qiDecks.length} QI instruments · {totalCards} cards total</div>
        </div>
        <div className="dm-actions">
          <button className="dm-btn dm-btn-primary" onClick={doExport}>⬇ Export JSON</button>
          <button className="dm-btn dm-btn-secondary" onClick={() => fileRef.current?.click()}>⬆ Import JSON</button>
          <input ref={fileRef} type="file" accept=".json" style={{display:"none"}} onChange={doImport} />
          <button className="dm-btn dm-btn-danger" onClick={doReset}>↺ Reset to Built-in</button>
          {onQuit && <button className="dm-quit" onClick={onQuit}>← Back</button>}
        </div>
      </div>

      {importError && <div className="alert alert-error">⚠ {importError}</div>}
      {importSuccess && <div className="alert alert-success">✓ Decks imported successfully!</div>}

      <div className="dm-body">
        {/* Sidebar */}
        <div className="dm-sidebar">
          <div className="dm-search">
            <input
              placeholder="Search cards, tags, meanings…"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setSelectedDeck(null); setView("browse"); }}
            />
          </div>
          <div className="dm-groups">
            {groupButtons.map(g => (
              <button
                key={g.key}
                className={`dm-group-btn ${activeGroup === g.key ? "active" : ""}`}
                onClick={() => { setActiveGroup(g.key); setSelectedDeck(null); setSearchQuery(""); setView("browse"); }}
              >{g.label}</button>
            ))}
          </div>
          <div className="dm-deck-list">
            {searchQuery.length > 1 ? (
              <div style={{padding:"8px 14px",fontSize:11,color:"#6b5e9a"}}>{searchResults.length} results for "{searchQuery}"</div>
            ) : filteredDeckIds.map(id => {
              const meta = getDeckMeta(id);
              const cards = getDeckCards(id);
              const isProcDef = procDefs.find(d => d.id === id) && !staticDecks[id];
              return (
                <div
                  key={id}
                  className={`dm-deck-item ${selectedDeck === id ? "active" : ""}`}
                  style={{ "--dc": meta.color }}
                  onClick={() => { setSelectedDeck(id); setView("browse"); setSearchQuery(""); }}
                >
                  <span className="dm-deck-glyph" style={{color: meta.color}}>{meta.glyph}</span>
                  <div>
                    <div className="dm-deck-name">{id}</div>
                    <div className="dm-deck-count">{isProcDef ? "Procedural def" : `${cards.length} cards`}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main panel */}
        <div className="dm-main">

          {/* Card detail view */}
          {view === "card" && selectedCard && (() => {
            const meta = getDeckMeta(selectedCard.deckId);
            return (
              <div>
                <button className="dm-back" onClick={() => setView("browse")}>← Back to deck</button>
                <div className="dm-card-detail" style={{"--dc": meta.color}}>
                  <div className="dm-detail-name">{selectedCard.name}</div>
                  <div className="dm-detail-deck" style={{color: meta.color}}>{selectedCard.deckId} · {meta.glyph}</div>

                  {selectedCard.power && (
                    <div className="dm-detail-block">
                      <div className="dm-detail-label">Power</div>
                      <div className="dm-detail-value" style={{fontSize:24,fontFamily:"'Cinzel',serif",color:meta.color}}>P{selectedCard.power}</div>
                      <div style={{display:"flex",gap:4,marginTop:6}}>
                        {Array.from({length:9},(_,i)=>(
                          <div key={i} style={{width:12,height:12,borderRadius:"50%",background: i < selectedCard.power ? meta.color : "#2a2448"}}/>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedCard.tags?.length > 0 && (
                    <div className="dm-detail-block">
                      <div className="dm-detail-label">Tags</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:4}}>
                        {selectedCard.tags.map(t => (
                          <span key={t} style={{background:meta.color+"22",color:meta.color,padding:"3px 10px",borderRadius:99,fontSize:11,fontFamily:"'DM Mono',monospace"}}>#{t}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedCard.meaning && (
                    <div className="dm-field-block">
                      <div className="dm-detail-label" style={{marginBottom:6}}>Meaning</div>
                      {selectedCard.meaning}
                    </div>
                  )}

                  {selectedCard.action && (
                    <div className="dm-detail-block">
                      <div className="dm-detail-label">Action</div>
                      <div className="dm-detail-value">{selectedCard.action}</div>
                    </div>
                  )}

                  {selectedCard.breath && (
                    <div className="dm-detail-block">
                      <div className="dm-detail-label">Breath</div>
                      <div className="dm-detail-value">{selectedCard.breath}</div>
                    </div>
                  )}

                  {selectedCard.field && (
                    <div className="dm-field-block">
                      <div className="dm-detail-label" style={{marginBottom:6}}>Field Effect</div>
                      {selectedCard.field}
                    </div>
                  )}

                  {selectedCard.phase && (
                    <div className="dm-detail-block">
                      <div className="dm-detail-label">Ceremony Phase</div>
                      <div className="dm-detail-value">Phase {selectedCard.phase}</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Search results */}
          {view === "browse" && searchQuery.length > 1 && (
            <div className="dm-search-results">
              <div style={{marginBottom:12,fontSize:13,color:"#6b5e9a"}}>{searchResults.length} cards matching "{searchQuery}"</div>
              {searchResults.map((card, i) => {
                const meta = getDeckMeta(card.deckId);
                return (
                  <div key={i} className="dm-sr-item" onClick={() => { setSelectedCard(card); setView("card"); }}>
                    <span style={{color: card.deckColor, fontSize:18, minWidth:22}}>{card.deckGlyph}</span>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:13,color:"#c4b5fd"}}>{card.name}</div>
                      <div style={{fontSize:10,color:"#4a3576",marginBottom:3}}>{card.deckId}</div>
                      <div style={{fontSize:11,color:"#6b5e9a"}}>{(card.meaning||card.field||"").slice(0,100)}…</div>
                    </div>
                    {card.power && <span style={{fontFamily:"'Cinzel',serif",color:meta.color,fontWeight:700}}>P{card.power}</span>}
                  </div>
                );
              })}
            </div>
          )}

          {/* Deck browse */}
          {view === "browse" && searchQuery.length <= 1 && selectedDeck && (() => {
            const meta = getDeckMeta(selectedDeck);
            const cards = getDeckCards(selectedDeck);
            const procDef = procDefs.find(d => d.id === selectedDeck);
            const qiDeck = qiDecks.find(d => d.deckId === selectedDeck);

            return (
              <div>
                <div className="dm-deck-header">
                  <div className="dm-deck-badge" style={{background: meta.color + "22", border: `2px solid ${meta.color}44`}}>
                    <span style={{color: meta.color}}>{meta.glyph}</span>
                  </div>
                  <div>
                    <div className="dm-deck-title">{qiDeck?.name || selectedDeck}</div>
                    <div className="dm-deck-sub">
                      {cards.length > 0 ? `${cards.length} cards` : "Procedural definition"}
                      {qiDeck && ` · ${qiDeck.desc}`}
                      {procDef && ` · ${procDef.theme} · generates ${procDef.count} cards`}
                    </div>
                    <div style={{display:"flex",gap:6,marginTop:8}}>
                      <span style={{background:meta.color+"22",color:meta.color,padding:"2px 10px",borderRadius:99,fontSize:10,fontFamily:"'DM Mono',monospace"}}>{meta.color}</span>
                      <span style={{background:"#2a2448",color:"#6b5e9a",padding:"2px 10px",borderRadius:99,fontSize:10}}>
                        {procDef ? "Procedural" : qiDeck ? "QI Ceremony" : "Static"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Procedural def display */}
                {procDef && !cards.length && (
                  <div className="dm-proc-card">
                    <div className="dm-proc-title">{procDef.theme}</div>
                    <div className="dm-proc-meta">
                      <div><div className="dm-proc-label">Count</div><div className="dm-proc-val">{procDef.count} cards generated</div></div>
                      <div><div className="dm-proc-label">Tags</div><div className="dm-proc-val">{procDef.tags.map(t=>"#"+t).join(" ")}</div></div>
                      <div><div className="dm-proc-label">Adjectives</div><div className="dm-proc-val">{procDef.adjs.join(", ")}</div></div>
                      <div><div className="dm-proc-label">Nouns</div><div className="dm-proc-val">{procDef.nouns.join(", ")}</div></div>
                    </div>
                    {procDef.templates && (
                      <div style={{marginTop:10}}>
                        <div className="dm-proc-label">Templates</div>
                        {procDef.templates.map((t,i) => <div key={i} style={{fontSize:11,color:"#6b5e9a",marginTop:4,fontFamily:"'DM Mono',monospace"}}>{t}</div>)}
                      </div>
                    )}
                  </div>
                )}

                {/* Cards grid */}
                {cards.length > 0 && (
                  <div className="dm-cards-grid">
                    {cards.map((card, i) => (
                      <div
                        key={i}
                        className="dm-card"
                        style={{"--dc": meta.color}}
                        onClick={() => { setSelectedCard(card); setView("card"); }}
                      >
                        <div className="dm-card-top">
                          <div className="dm-card-name">{card.name}</div>
                          {card.power && <div className="dm-card-power" style={{color: meta.color}}>P{card.power}</div>}
                          {card.phase && <div style={{fontSize:10,color:"#4a3576",fontFamily:"'Cinzel',serif"}}>⌀{card.phase}</div>}
                        </div>
                        <div className="dm-card-meaning">
                          {(card.meaning || card.field || card.action || "").slice(0, 90)}{(card.meaning || card.field || "").length > 90 ? "…" : ""}
                        </div>
                        <div className="dm-card-tags">
                          {(card.tags || []).map(t => <span key={t} className="dm-tag">#{t}</span>)}
                          {card.breath && <span className="dm-tag" style={{background:"#1a2a3a",color:"#60a5fa"}}>○ {card.breath.split(" ")[0]}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Welcome / no selection */}
          {view === "browse" && searchQuery.length <= 1 && !selectedDeck && (
            <div className="dm-welcome">
              <div className="dm-welcome-icon">✦</div>
              <h2>Deck Library</h2>
              <p style={{fontSize:13,color:"#4a3f6e",lineHeight:1.7,maxWidth:420,margin:"0 auto"}}>
                {Object.keys(staticDecks).length} static decks · {qiDecks.length} QI instrument decks · {procDefs.length} procedural definitions<br/>
                {totalCards} total hand-authored cards<br/><br/>
                Select a deck from the sidebar to browse its cards.<br/>
                Use the search bar to find cards across all decks.<br/>
                Export to save your library as JSON · Import to restore.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
