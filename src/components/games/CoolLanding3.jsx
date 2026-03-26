import React, { useState } from "react";
import "./CoolLanding3.css";

import AdvancedPhysicsProblems from "./AdvancedPhysicsProblems";
import AdvancedChemistryProblems from "./AdvancedChemistryProblems";
import AdvancedCalculusProblems from "./AdvancedCalculusProblems";
import AdvancedAlgebraProblems from "./AdvancedAlgebraProblems";
import Game24Problems from "./Game24Problems";

import Twenty_Four_Game_01 from "./Twenty_Four_Game_01/Twenty_Four_Game_01";
import Twenty_Four_Game_02 from "./Twenty_Four_Game_01/Twenty_Four_Game_02";

import Suduko_Game_01 from "./Suduko_Game_01/Suduko_Game_01";

import calculus_game_01 from "./calculus/calculus_game_01/calculus_game_01";

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

import test_loop from "./tarot_game_v6_01/test_loop";


import QuantumImpact_v1_01 from "./tarot_game_v6_01/QuantumImpact_v1_01";

import DeckManager_v1_01 from "./tarot_game_v6_01/DeckManager_v1_01";






/* === Registry: key -> {label, component} === */
const GAME_REGISTRY = {
  physics:          { label: "⚛️ Physics",        component: AdvancedPhysicsProblems },
  chemistry:        { label: "🧪 Chemistry",      component: AdvancedChemistryProblems },
  calculus:         { label: "∫ Calculus",         component: AdvancedCalculusProblems },
  algebra:          { label: "📐 Algebra",         component: AdvancedAlgebraProblems },
  game24:           { label: "🎲 Game 24",         component: Game24Problems },
  twentyfour01:     { label: "🎲 24 Game (v1)",    component: Twenty_Four_Game_01 },
  twentyfour02:     { label: "🎲 24 Game (v2)",    component: Twenty_Four_Game_02 },
  sudoku01:         { label: "🔢 Sudoku",          component: Suduko_Game_01 },
  calculus_game_01: { label: "∫ Calculus Game",    component: calculus_game_01 },
  twenty_four_v2:   { label: "🎲 24 Game (v3)",    component: twenty_four_v2 },
  rummy:            { label: "🃏 Rummy",            component: RummyGame },
  tangram_tiles:    { label: "🔷 Tangram Tiles",    component: TangramTilesGame_2 },
  sudoku_game_01:   { label: "🔢 Sudoku Game",      component: Sudoku_Game_01 },
  rummikub:         { label: "🃏 Rummikub",         component: Rummikub },
  canasta:          { label: "🃏 Canasta",          component: Canasta3 },
  canasta2:         { label: "🃏 Canasta 2",         component: Canasta2 },
  canasta1:         { label: "🃏 Canasta 1",         component: Canasta1 },
  gin_rummy_v3:     { label: "🃏 Gin Rummy v3",     component: Gin_Rummy_v3 },
  hearts_v2:        { label: "🃏 Hearts v2",        component: Hearts_v2 },
  monopoly_v3:      { label: "🎲 Monopoly v3",      component: Monopoly_v3 },
  risk_game_v3_01:  { label: "🎲 Risk Game v3",     component: Risk_Game_v3_01 },
  rummy_500_v2_01:  { label: "🃏 Rummy 500 v2",     component: Rummy_500_v2_01 },
  slapzi1_v2_01:    { label: "🃏 Slapzi v2",         component: Slapzi1_v2_01 },
  stock_market_game_v3_01: { label: "📈 Stock Market Game v3", component: StockMarketGame_v3_01 },
  solitaire_v2_01:  { label: "🃏 Solitaire v2",      component: Solitaire_v2_01 },
  spades_v2_01:     { label: "🃏 Spades v2",         component: Spades_v2_01 },
  tarot_game_v6_01: { label: "🔮 Tarot Game v6",     component: tarot_game_v6_01 },
  collapse_through_symbol_v8_01: { label: "🌀 Collapse Through Symbol v8", component: Collapse_Through_Symbol_v8_01 },
  mahjong_tiles_game_v2_01: { label: "🀄 Mahjong Tiles Game v2", component: mahjong_tiles_game_v2_01 },
  collapse_through_symbol_sacred_geometry: { label: "🌀 Collapse Through Symbol: Sacred Geometry", component: Collapse_Through_Symbol_sacred_geometry },
  test_loop:        { label: "🔄 Test Loop",         component: test_loop },
  quantum_impact_v1_01: { label: "⚛️ Quantum Impact v1", component: QuantumImpact_v1_01 },
  deck_manager_v1_01: { label: "🃏 Deck Manager v1", component: DeckManager_v1_01 },



};

export default function CoolLanding3() {
  const [activeGame, setGame] = useState(null);

  const entry = GAME_REGISTRY[activeGame];

  return (
    <div className="cool-landing">
      {!entry ? (
        <div>
          <h1>Cool Landing</h1>
          <p>Select a game or subject:</p>
          <div className="game-buttons">
            {Object.entries(GAME_REGISTRY).map(([key, { label }]) => (
              <button key={key} onClick={() => setGame(key)}>
                {label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <entry.component onQuit={() => setGame(null)} />
      )}
    </div>
  );
}
