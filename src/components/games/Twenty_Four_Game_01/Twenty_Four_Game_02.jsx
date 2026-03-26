import React, { useState, useEffect } from "react";
import "./Twenty_Four_Game_02.css";

/* =========================
   Defaults + Migration
   ========================= */
const DEFAULT_CONFIG = {
  target: 24,
  customNumbers: [3, 3, 8, 8],
  ai: false,
  numColor: "#000000",
  numBg: "#ffffff",
  btnColor: "#ffffff",
  btnBg: "#007bff",
  layout: "grid",
  mode: "mode1",
  operators: {
    "+": true,
    "-": true,
    "*": true,
    "/": true,
    "^": true, // power operator
    "!": true,
    "(": true,
    ")": true,
  },
  operatorTextColor: "#ffffff",
  operatorBgColor: "#28a745",
};

function migrateConfig(saved) {
  const merged = { ...DEFAULT_CONFIG, ...(saved || {}) };
  if (!merged.operators) merged.operators = { ...DEFAULT_CONFIG.operators };
  for (const key of Object.keys(DEFAULT_CONFIG.operators)) {
    if (typeof merged.operators[key] !== "boolean") {
      merged.operators[key] = DEFAULT_CONFIG.operators[key];
    }
  }
  return merged;
}

function loadConfig() {
  try {
    const raw = localStorage.getItem("twentyFourConfig");
    if (!raw) return DEFAULT_CONFIG;
    return migrateConfig(JSON.parse(raw));
  } catch {
    return DEFAULT_CONFIG;
  }
}

/* =========================
   Helpers
   ========================= */
function factorial(n) {
  if (!Number.isInteger(n) || n < 0 || n > 10) return NaN;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

function generatePuzzle(mode) {
  if (mode === "mode2")
    return Array.from({ length: 4 }, () => Math.floor(Math.random() * 21));
  if (mode === "mode3")
    return Array.from({ length: 4 }, () => Math.floor(Math.random() * 41));
  if (mode === "mode4")
    return Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)); // 0–9
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 9) + 1); // 1–9
}

/* Solver with ^ and ! (as in your last version) */
function solveTarget(nums, operators, target) {
  const EPS = 1e-6;
  const solutions = new Set();

  function helper(numbers, expressions) {
    if (numbers.length === 1) {
      if (Math.abs(numbers[0] - target) < EPS) {
        solutions.add(expressions[0]);
      }
      return;
    }
    for (let i = 0; i < numbers.length; i++) {
      for (let j = 0; j < numbers.length; j++) {
        if (i === j) continue;

        const remainingNums = numbers.filter((_, k) => k !== i && k !== j);
        const remainingExpr = expressions.filter((_, k) => k !== i && k !== j);

        const a = numbers[i];
        const b = numbers[j];
        const exprA = expressions[i];
        const exprB = expressions[j];

        const candidates = [];

        if (operators["+"]) candidates.push([a + b, `(${exprA}+${exprB})`]);
        if (operators["-"]) {
          candidates.push([a - b, `(${exprA}-${exprB})`]);
          candidates.push([b - a, `(${exprB}-${exprA})`]);
        }
        if (operators["*"]) candidates.push([a * b, `(${exprA}*${exprB})`]);
        if (operators["/"]) {
          if (Math.abs(b) > EPS) candidates.push([a / b, `(${exprA}/${exprB})`]);
          if (Math.abs(a) > EPS) candidates.push([b / a, `(${exprB}/${exprA})`]);
        }
        if (operators["^"]) {
          if (Number.isFinite(Math.pow(a, b)))
            candidates.push([Math.pow(a, b), `(${exprA}^${exprB})`]);
          if (Number.isFinite(Math.pow(b, a)))
            candidates.push([Math.pow(b, a), `(${exprB}^${exprA})`]);
        }
        if (operators["!"]) {
          if (Number.isInteger(a) && a >= 0 && a <= 10)
            candidates.push([factorial(a), `(${exprA}!)`]);
          if (Number.isInteger(b) && b >= 0 && b <= 10)
            candidates.push([factorial(b), `(${exprB}!)`]);
        }

        for (const [val, expr] of candidates) {
          if (Number.isFinite(val) && Math.abs(val) < 1e9) {
            helper([...remainingNums, val], [...remainingExpr, expr]);
          }
        }
      }
    }
  }

  helper(nums, nums.map((n) => n.toString()));
  return Array.from(solutions);
}

/* =========================
   Component
   ========================= */
export default function Twenty_Four_Game_02({ onQuit }) {
  const [config, setConfig] = useState(() => loadConfig());

  const [solutionInput, setSolutionInput] = useState("");
  const [message, setMessage] = useState("");

  const [showRules, setShowRules] = useState(false);
  const [showDesc, setShowDesc] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [showSolutions, setShowSolutions] = useState(false);

  const [solutions, setSolutions] = useState([]);

  // Persist config
  useEffect(() => {
    localStorage.setItem("twentyFourConfig", JSON.stringify(config));
  }, [config]);

  const btnStyle = { color: config.btnColor, background: config.btnBg };

  function newGame() {
    setConfig((prev) => ({
      ...prev,
      customNumbers: generatePuzzle(prev.mode),
    }));
    setMessage("");
    setSolutionInput("");
    setSolutions([]);
  }

  function shuffleNumbers() {
    setConfig((prev) => ({
      ...prev,
      customNumbers: [...prev.customNumbers].sort(() => Math.random() - 0.5),
    }));
  }

  function clearForm() {
    setSolutionInput("");
    setMessage("");
  }

  function appendToSolution(token) {
    setSolutionInput((prev) => prev + token);
  }

  function checkSolution() {
    const EPS = 1e-6;
    try {
      let expr = solutionInput
        .replace(/\^/g, "**")
        .replace(/(\d+)!/g, (_, n) => factorial(parseInt(n, 10)));
      // eslint-disable-next-line no-eval
      const val = eval(expr);
      if (Math.abs(val - config.target) < EPS) {
        setMessage(`✅ Correct! You made ${config.target}.`);
      } else {
        setMessage(`❌ Not ${config.target}. You got ${val}`);
      }
    } catch {
      setMessage("⚠️ Invalid expression.");
    }
  }

  function toggleSolutions() {
    setShowSolutions((was) => {
      const next = !was;
      if (next) {
        const sols = solveTarget(
          config.customNumbers,
          config.operators,
          config.target
        );
        setSolutions(sols.length ? sols : ["No solutions"]);
      }
      return next;
    });
  }

  return (
    <div className="tfour-container">
      <h2>🎲 Twenty Four Game (v1)</h2>
      <p>Numbers: {JSON.stringify(config.customNumbers)} | Target: {config.target}</p>

      {/* Controls */}
      <div className="tfour-buttons">
        <button style={btnStyle} onClick={onQuit}>Quit</button>
        <button style={btnStyle} onClick={() => setShowRules((v) => !v)}>Rules</button>
        <button style={btnStyle} onClick={() => setShowDesc((v) => !v)}>Description</button>
        {/* FIX: Setup now toggles open/close */}
        <button style={btnStyle} onClick={() => setShowSetup((v) => !v)}>Setup</button>
        <button style={btnStyle} onClick={toggleSolutions}>Solutions</button>
        <button style={btnStyle} onClick={newGame}>New Game</button>
        <button style={btnStyle} onClick={shuffleNumbers}>Shuffle</button>
        <button style={btnStyle} onClick={clearForm}>Clear</button>
        <button style={btnStyle} onClick={checkSolution}>Check</button>
      </div>

      {/* Rules (works even if Setup is open) */}
      {showRules && (
        <div className="tfour-box">
          <h3>Rules</h3>
          <p>Use all four numbers exactly once with your chosen operators to reach the target.</p>
        </div>
      )}

      {/* Description (works even if Setup is open) */}
      {showDesc && (
        <div className="tfour-box">
          <h3>Description</h3>
          <p>Classic 24 game with factorial (!) and power (^) extensions, plus setup and styling options.</p>
        </div>
      )}

      {/* Setup (now a true toggle) */}
      {showSetup && (
        <div className="tfour-box">
          <h3>Setup</h3>

          <label>
            Target:
            <input
              type="number"
              value={config.target}
              onChange={(e) =>
                setConfig({ ...config, target: parseInt(e.target.value, 10) })
              }
            />
          </label>

          <label>
            Mode:
            <select
              value={config.mode}
              onChange={(e) =>
                setConfig({
                  ...config,
                  mode: e.target.value,
                  customNumbers: generatePuzzle(e.target.value),
                })
              }
            >
              <option value="mode1">Mode 1 (1–9)</option>
              <option value="mode2">Mode 2 (0–20)</option>
              <option value="mode3">Mode 3 (0–40)</option>
              <option value="mode4">Mode 4 (0–9)</option>
            </select>
          </label>

          <label>
            Custom Puzzle (4 numbers, comma separated):
            <input
              type="text"
              value={config.customNumbers.join(",")}
              onChange={(e) =>
                setConfig({
                  ...config,
                  customNumbers: e.target.value
                    .split(",")
                    .map((n) => parseInt(n.trim(), 10) || 0),
                })
              }
            />
          </label>

          <label>
            Button Text Color:
            <input
              type="color"
              value={config.btnColor}
              onChange={(e) => setConfig({ ...config, btnColor: e.target.value })}
            />
          </label>

          <label>
            Button Background Color:
            <input
              type="color"
              value={config.btnBg}
              onChange={(e) => setConfig({ ...config, btnBg: e.target.value })}
            />
          </label>

          <label>
            Operator Text Color:
            <input
              type="color"
              value={config.operatorTextColor}
              onChange={(e) =>
                setConfig({ ...config, operatorTextColor: e.target.value })
              }
            />
          </label>

          <label>
            Operator Background Color:
            <input
              type="color"
              value={config.operatorBgColor}
              onChange={(e) =>
                setConfig({ ...config, operatorBgColor: e.target.value })
              }
            />
          </label>

          <br />
          {/* You can still close from inside */}
          <button onClick={() => setShowSetup(false)}>Close Setup</button>
        </div>
      )}

      {/* Numbers */}
      <div className={`tfour-numbers layout-${config.layout}`}>
        {config.customNumbers.map((num, i) => (
          <div
            key={i}
            className="tfour-number"
            style={{ color: config.numColor, background: config.numBg }}
            onClick={() => appendToSolution(num.toString())}
          >
            {num}
          </div>
        ))}
      </div>

      {/* Operators */}
      <div className="operators-panel">
        {Object.keys(config.operators)
          .filter((op) => config.operators[op])
          .map((op) => (
            <button
              key={op}
              style={{
                background: config.operatorBgColor,
                color: config.operatorTextColor,
                margin: "0.3rem",
                padding: "0.5rem 0.9rem",
                fontSize: "1.2rem",
                borderRadius: "6px",
              }}
              onClick={() => appendToSolution(op)}
            >
              {op}
            </button>
          ))}
      </div>

      {/* Solution form */}
      <div className="tfour-form">
        <textarea
          value={solutionInput}
          onChange={(e) => setSolutionInput(e.target.value)}
          placeholder={`Click numbers/operators or type manually to reach ${config.target}`}
        />
        <div className="tfour-message">{message}</div>
      </div>

      {/* Solutions */}
      {showSolutions && (
        <div className="tfour-box">
          <h3>Solutions (target {config.target})</h3>
          <ul>
            {solutions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
