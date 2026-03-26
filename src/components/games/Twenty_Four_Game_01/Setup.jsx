import React, { useState } from "react";
import "./Setup.css";

export default function Setup({ onApply, onClose }) {
  const [numbers, setNumbers] = useState([5, 2, 7, 8]);
  const [target, setTarget] = useState(24);
  const [aiAssist, setAiAssist] = useState(true);

  const handleNumberChange = (index, value) => {
    const newNums = [...numbers];
    newNums[index] = parseInt(value) || 0;
    setNumbers(newNums);
  };

  const applySetup = () => {
    if (onApply) {
      onApply({ numbers, target, aiAssist });
    }
  };

  return (
    <div className="setup-container">
      <div className="setup-header">
        <h2>24 Game — Setup ⚙️</h2>
        <button className="close-btn" onClick={onClose}>✖</button>
      </div>

      <div className="setup-row">
        <label>Numbers:</label>
        {numbers.map((num, idx) => (
          <input
            key={idx}
            type="number"
            min="1"
            max="9"
            value={num}
            onChange={(e) => handleNumberChange(idx, e.target.value)}
          />
        ))}
      </div>

      <div className="setup-row">
        <label>Target:</label>
        <input
          type="number"
          value={target}
          onChange={(e) => setTarget(parseInt(e.target.value))}
        />
      </div>

      <div className="setup-row">
        <label>AI Assistance:</label>
        <input
          type="checkbox"
          checked={aiAssist}
          onChange={(e) => setAiAssist(e.target.checked)}
        />
      </div>

      <button onClick={applySetup} className="apply-btn">
        Apply
      </button>
    </div>
  );
}
