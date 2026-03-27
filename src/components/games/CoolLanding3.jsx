import React, { useState, useEffect } from "react";
import "./CoolLanding3.css";

import twenty_four_v2 from "./twenty_four_v2/twenty_four_v2";
import RummyGame from "./rummy_game_01/RummyGame";
import TangramTilesGame_2 from "./tangram_tiles_game_02/TangramTilesGame_2";
import Sudoku_Game_01 from "./sudoku_game_02/Sudoku_Game_01";
import Rummikub from "./rummikub_01/Rummikub";
import Canasta3 from "./canasta_01/Canasta3";
import Canasta2 from "./canasta_01/Canasta2";
import Canasta1 from "./canasta_01/Canasta1";
import Gin_Rummy_v3 from "./gin_rummy_v3/Gin_Rummy_v3";
import Hearts_v2 from "./hearts_v2/Hearts_v2";
import Monopoly_v3 from "./monopoly_v3/Monopoly_v3";
import Risk_Game_v3_01 from "./risk_game_v3_01/Risk_Game_v3_01";
import Rummy_500_v2_01 from "./rummy_500_v2_01/Rummy_500_v2_01";
import Slapzi1_v2_01 from "./slapzi1_v2_01/Slapzi1_v2_01";
import StockMarketGame_v3_01 from "./stockMarketGame_v3_01/StockMarketGame_v3_01";
import Solitaire_v2_01 from "./solitaire_v2_01/Solitaire_v2_01";
import Spades_v2_01 from "./spades_v2_01/Spades_v2_01";
import tarot_game_v6_01 from "./tarot_game_v6_01/tarot_game_v6_01";
import Collapse_Through_Symbol_v8_01 from "./collapse_through_symbol_v8_01/Collapse_Through_Symbol_v8_01";
import mahjong_tiles_game_v2_01 from "./mahjong_tiles_game_v2_01/mahjong_tiles_game_v2_01";
import Collapse_Through_Symbol_sacred_geometry from "./Collapse_Through_Symbol_sacred_geometry_v01/Collapse_Through_Symbol_sacred_geometry";

const GAME_REGISTRY = {
  twenty_four_v2:   { label: "24 Game", emoji: "🎲", category: "Puzzle", desc: "Math puzzle — make 24 from 4 numbers", component: twenty_four_v2 },
  sudoku_game_01:   { label: "Sudoku", emoji: "🔢", category: "Puzzle", desc: "Classic number placement puzzle", component: Sudoku_Game_01 },
  tangram_tiles:    { label: "Tangram Tiles", emoji: "🔷", category: "Puzzle", desc: "113 geometric shape puzzles", component: TangramTilesGame_2 },
  collapse_through_symbol_v8_01: { label: "Collapse Through Symbol", emoji: "🌀", category: "Puzzle", desc: "Mathematical grid puzzle — residue classes", component: Collapse_Through_Symbol_v8_01 },
  collapse_through_symbol_sacred_geometry: { label: "Sacred Geometry", emoji: "✴️", category: "Puzzle", desc: "Collapse puzzle on sacred geometry boards", component: Collapse_Through_Symbol_sacred_geometry },
  rummy:            { label: "Rummy", emoji: "🃏", category: "Cards", desc: "Luxury neon edition with special rules", component: RummyGame },
  rummikub:         { label: "Rummikub", emoji: "🎴", category: "Cards", desc: "Tile-based rummy strategy game", component: Rummikub },
  gin_rummy_v3:     { label: "Gin Rummy", emoji: "🃏", category: "Cards", desc: "Classic gin rummy — v3 edition", component: Gin_Rummy_v3 },
  rummy_500_v2_01:  { label: "Rummy 500", emoji: "🃏", category: "Cards", desc: "Score-based rummy to 500 points", component: Rummy_500_v2_01 },
  hearts_v2:        { label: "Hearts", emoji: "♥️", category: "Cards", desc: "Avoid the hearts — classic trick game", component: Hearts_v2 },
  spades_v2_01:     { label: "Spades", emoji: "♠️", category: "Cards", desc: "Bid and win tricks with your partner", component: Spades_v2_01 },
  solitaire_v2_01:  { label: "Solitaire", emoji: "🂡", category: "Cards", desc: "Klondike solitaire — house edition", component: Solitaire_v2_01 },
  canasta:          { label: "Canasta", emoji: "🃏", category: "Cards", desc: "Canasta — advanced edition", component: Canasta3 },
  canasta2:         { label: "Canasta 2", emoji: "🃏", category: "Cards", desc: "Canasta — second edition", component: Canasta2 },
  canasta1:         { label: "Canasta 1", emoji: "🃏", category: "Cards", desc: "Canasta — original edition", component: Canasta1 },
  tarot_game_v6_01: { label: "Tarot Insight Duel", emoji: "🔮", category: "Special", desc: "Symbolic card duel — Harmonic Field Codex", component: tarot_game_v6_01 },
  mahjong_tiles_game_v2_01: { label: "Mahjong Tiles", emoji: "🀄", category: "Special", desc: "40-round campaign with AI narratives", component: mahjong_tiles_game_v2_01 },
  monopoly_v3:      { label: "Monopoly", emoji: "🏠", category: "Board", desc: "Property trading — v3 house rules", component: Monopoly_v3 },
  risk_game_v3_01:  { label: "Risk", emoji: "⚔️", category: "Board", desc: "World domination strategy game", component: Risk_Game_v3_01 },
  stock_market_game_v3_01: { label: "Stock Market", emoji: "📈", category: "Board", desc: "Trade stocks — beat the market", component: StockMarketGame_v3_01 },
  slapzi1_v2_01:    { label: "Slapzi", emoji: "👋", category: "Board", desc: "Fast-paced card slapping game", component: Slapzi1_v2_01 },
};

const CATEGORIES = ["All", "Puzzle", "Cards", "Board", "Special"];

const CATEGORY_COLORS = {
  Puzzle: "#a78bfa",
  Cards:  "#f59e0b",
  Board:  "#34d399",
  Special:"#f472b6",
};

export default function CoolLanding3() {
  const [activeGame, setGame] = useState(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
  }, []);

  const entry = activeGame ? GAME_REGISTRY[activeGame] : null;

  const filtered = Object.entries(GAME_REGISTRY).filter(([, g]) => {
    const matchCat = filter === "All" || g.category === filter;
    const matchSearch = g.label.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  if (entry) {
    return (
      <div className="cl-game-wrapper">
        <entry.component onQuit={() => setGame(null)} />
      </div>
    );
  }

  return (
    <div className={`cl-root ${visible ? "cl-visible" : ""}`}>
      {/* Animated background orbs */}
      <div className="cl-orb cl-orb1" />
      <div className="cl-orb cl-orb2" />
      <div className="cl-orb cl-orb3" />

      {/* Header */}
      <header className="cl-header">
        <div className="cl-logo-mark">✦</div>
        <h1 className="cl-title">
          <span className="cl-title-cool">Cool</span>
          <span className="cl-title-landing">Landing</span>
        </h1>
        <p className="cl-subtitle">
          {Object.keys(GAME_REGISTRY).length} games · Choose your challenge
        </p>
      </header>

      {/* Controls */}
      <div className="cl-controls">
        <div className="cl-search-wrap">
          <span className="cl-search-icon">⌕</span>
          <input
            className="cl-search"
            type="text"
            placeholder="Search games…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="cl-filters">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`cl-filter-btn ${filter === cat ? "cl-filter-active" : ""}`}
              onClick={() => setFilter(cat)}
              style={filter === cat && cat !== "All" ? { borderColor: CATEGORY_COLORS[cat], color: CATEGORY_COLORS[cat] } : {}}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Game Grid */}
      <div className="cl-grid">
        {filtered.map(([key, game], i) => (
          <button
            key={key}
            className="cl-card"
            onClick={() => setGame(key)}
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="cl-card-inner">
              <div
                className="cl-cat-tag"
                style={{ color: CATEGORY_COLORS[game.category] || "#888", borderColor: CATEGORY_COLORS[game.category] || "#888" }}
              >
                {game.category}
              </div>
              <div className="cl-card-emoji">{game.emoji}</div>
              <h3 className="cl-card-title">{game.label}</h3>
              <p className="cl-card-desc">{game.desc}</p>
              <div className="cl-card-play">Play →</div>
            </div>
            <div className="cl-card-glow" style={{ background: CATEGORY_COLORS[game.category] || "#6366f1" }} />
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="cl-empty">No games match your search.</div>
      )}

      <footer className="cl-footer">
        Made with ♥ · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
