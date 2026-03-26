import React, { useState } from "react";
import Canasta1 from "./Canasta1";
import Canasta2 from "./Canasta2";
import Canasta3 from "./Canasta3";
import "./App.css";

const GAMES = [
  {
    id: "canasta1", title: "Classic Canasta", sub: "Teaching Edition", icon: "♣",
    desc: "Full Canasta rules: frozen pile, canasta bonuses, multi-round scoring. Coach explains every decision.",
    tags: ["Turn-Based", "Strategy", "Cards"], accent: "#1d6fa4",
  },
  {
    id: "canasta2", title: "Slapzi Blitz", sub: "Reaction & Matching", icon: "👋",
    desc: "Race the AI to slap a picture card matching the clue. Chaos Mode fires double clues for extra spice.",
    tags: ["Reaction", "Fast-Paced", "Matching"], accent: "#16a34a",
  },
  {
    id: "canasta3", title: "Rummy Blitz", sub: "Speed Rummy", icon: "🃏",
    desc: "Lay Sets & Runs, lay off onto any meld on the table. First to the target score wins the match.",
    tags: ["Rummy", "Multi-Round", "Competitive"], accent: "#be185d",
  },
];

export default function App() {
  const [active, setActive] = useState(null);
  if (active === "canasta1") return <Canasta1 onQuit={() => setActive(null)} />;
  if (active === "canasta2") return <Canasta2 onQuit={() => setActive(null)} />;
  if (active === "canasta3") return <Canasta3 onQuit={() => setActive(null)} />;

  return (
    <div className="app-root">
      <header className="app-hero">
        <span className="app-hero-icon">🎴</span>
        <h1>Card Game Academy</h1>
        <p>Three games · Every rule explained · Beat the AI</p>
      </header>
      <main className="app-grid">
        {GAMES.map(g => (
          <button key={g.id} className="app-card" style={{"--a": g.accent}} onClick={() => setActive(g.id)}>
            <div className="app-icon">{g.icon}</div>
            <div className="app-card-body">
              <div className="app-card-title">{g.title}</div>
              <div className="app-card-sub">{g.sub}</div>
              <p className="app-card-desc">{g.desc}</p>
              <div className="app-tags">{g.tags.map(t => <span key={t} className="app-tag">{t}</span>)}</div>
            </div>
            <span className="app-cta">Play now →</span>
          </button>
        ))}
      </main>
      <footer className="app-footer">Teaching editions · No ads · Open source rules</footer>
    </div>
  );
}
