import React from "react";
import "./Descriptions.css";

export default function Descriptions({ onClose }) {
  return (
    <div className="description-container">
      <div className="desc-header">
        <h2>24 Game — Description 🎲</h2>
        <button className="close-btn" onClick={onClose}>✖</button>
      </div>

      <p>
        The <b>24 Game</b> is a mathematical puzzle where you are given 
        <b> four numbers (1–9)</b>. 
        Your goal is to use the operators 
        <b> +, −, ×, ÷ </b> and parentheses to make the value exactly <b>24</b>.
      </p>

      <h3>Example</h3>
      <p>
        Puzzle: <code>[5, 2, 7, 8]</code> <br />
        One solution: <code>((5 × 2 − 7) × 8) = 24</code>
      </p>

      <h3>Modes</h3>
      <ul>
        <li><b>Classic:</b> Use +, −, ×, ÷</li>
        <li><b>Calculus:</b> Operators include ∫(ax+b) templates</li>
        <li><b>Physics:</b> Series/parallel resistor combinations</li>
        <li><b>Chemistry:</b> Dilution (C1V1/(V1+V2)) style puzzles</li>
      </ul>
    </div>
  );
}
