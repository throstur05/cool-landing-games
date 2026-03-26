import React from "react";
import "./Rules.css";

export default function Rules({ onClose }) {
  return (
    <div className="rules-container">
      <div className="rules-header">
        <h2>24 Game — Rules 📜</h2>
        <button className="close-btn" onClick={onClose}>✖</button>
      </div>

      <h3>Basic Rules</h3>
      <ul>
        <li>You are given exactly <b>four numbers (1–9)</b>.</li>
        <li>You must use each number exactly once.</li>
        <li>You may use <b>+</b>, <b>−</b>, <b>×</b>, <b>÷</b> and parentheses.</li>
        <li>The goal is to reach exactly <b>24</b>.</li>
      </ul>

      <h3>Mode Variants</h3>
      <p><b>Classic:</b> Normal +, −, ×, ÷.</p>
      <p><b>Calculus:</b> Build integrals like ∫(ax+b)dx and evaluate.</p>
      <p><b>Physics:</b> Combine numbers as resistors in series/parallel.</p>
      <p><b>Chemistry:</b> Use dilution law (C1V1 = C2V2) to target 24.</p>
    </div>
  );
}
