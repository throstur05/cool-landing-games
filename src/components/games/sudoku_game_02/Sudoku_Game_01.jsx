import React, { useState, useRef, useMemo } from "react";
import "./Sudoku_Game_01.css";

// ── localStorage keys ────────────────────────────────────────────────
const LS_COLORS  = "sudoku_color_settings";
const LS_GAME    = "sudoku_saved_game";

// ── Default palettes ─────────────────────────────────────────────────
const LIGHT_DEFAULTS = {
  givenColor:      "#1c1a17",
  userColor:       "#1a6fa8",
  noteColor:       "#2e7d32",
  bgColor:         "#ffffff",
  borderThinColor: "#ddd8d0",
  borderBoldColor: "#8a7a5e",
};
const DARK_DEFAULTS = {
  givenColor:      "#e8e2d9",
  userColor:       "#e8b84b",
  noteColor:       "#66bb6a",
  bgColor:         "#1a1916",
  borderThinColor: "#2e2c29",
  borderBoldColor: "#c8a96e",
};

function lsGet(key) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; }
  catch { return null; }
}
function lsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); return true; }
  catch { return false; }
}

// ── Pretty-print puzzle JSON (each grid row on one line) ─────────────
function formatPuzzleJSON(puzzles) {
  const rows = puzzles.map((p) => {
    const gridRows = p.grid
      .map((row) => "    [" + row.join(", ") + "]")
      .join(",\n");
    return (
      `  {\n` +
      `    "id": "${p.id}",\n` +
      `    "difficulty": "${p.difficulty}",\n` +
      `    "givens": ${p.givens},\n` +
      `    "grid": [\n${gridRows}\n    ]\n` +
      `  }`
    );
  });
  return `{\n  "puzzles": [\n${rows.join(",\n")}\n  ]\n}\n`;
}

export default function Sudoku_Game_01({ onQuit }) {
  const emptyGrid = () => Array.from({ length: 9 }, () => Array(9).fill(0));

  // ── Core game state ──────────────────────────────────────────────
  const [grid,      setGrid]      = useState(emptyGrid);
  const [givenGrid, setGivenGrid] = useState(emptyGrid);
  const [selectedCell, setSelectedCell] = useState(null);
  const [highlightVal, setHighlightVal] = useState(null);
  const [noteMode,  setNoteMode]  = useState(false);
  const [darkMode,  setDarkMode]  = useState(false);
  const [activePuzzleId, setActivePuzzleId] = useState(null);

  // ── Puzzle creator mode ──────────────────────────────────────────
  const [creatorMode, setCreatorMode] = useState(false);
  const [creatorGrid, setCreatorGrid] = useState(emptyGrid);
  const [creatorId,   setCreatorId]   = useState("");
  const [creatorDiff, setCreatorDiff] = useState("medium");
  const [creatorMsg,  setCreatorMsg]  = useState("");
  const mergeFileRef = useRef(null);

  // ── Resume banner ────────────────────────────────────────────────
  const [showResumeBanner, setShowResumeBanner] = useState(() => {
    const s = lsGet(LS_GAME); return !!(s && s.activePuzzleId);
  });
  const [gameSaveMsg, setGameSaveMsg] = useState("");

  // ── Colors: applied vs draft ─────────────────────────────────────
  const [colors, setColors] = useState(() => lsGet(LS_COLORS) ?? { ...LIGHT_DEFAULTS });
  const [draft,  setDraft]  = useState(() => lsGet(LS_COLORS) ?? { ...LIGHT_DEFAULTS });
  const [saveMsg, setSaveMsg] = useState("");

  // ── Panels ───────────────────────────────────────────────────────
  const [showRules,      setShowRules]      = useState(false);
  const [showDesc,       setShowDesc]       = useState(false);
  const [showSetup,      setShowSetup]      = useState(false);
  const [showSolutions,  setShowSolutions]  = useState(false);
  const [showPuzzleList, setShowPuzzleList] = useState(false);

  // ── Puzzle library ───────────────────────────────────────────────
  const [puzzles,    setPuzzles]    = useState([]);
  const [filterText, setFilterText] = useState("");
  const [filterDiff, setFilterDiff] = useState("all");

  const fileInputRef   = useRef(null);
  const progressDlRef  = useRef(null); // hidden link for progress download

  // ════════════════════════════════════════════════════════════════
  // Color helpers
  // ════════════════════════════════════════════════════════════════
  function setDraftColor(key, val) { setDraft(p => ({ ...p, [key]: val })); }

  function applyColors() { setColors({ ...draft }); }

  function saveColors() {
    lsSet(LS_COLORS, draft);
    setColors({ ...draft });
    flash(setSaveMsg, "Saved ✓");
  }

  function resetColors() {
    const d = darkMode ? { ...DARK_DEFAULTS } : { ...LIGHT_DEFAULTS };
    setDraft(d); setColors(d);
  }

  function toggleTheme() {
    const next = !darkMode;
    setDarkMode(next);
    const d = next ? { ...DARK_DEFAULTS } : { ...LIGHT_DEFAULTS };
    setDraft(d); setColors(d);
  }

  function flash(setter, msg, ms = 2200) {
    setter(msg); setTimeout(() => setter(""), ms);
  }

  // ════════════════════════════════════════════════════════════════
  // Game save / resume
  // ════════════════════════════════════════════════════════════════
  function autoSave(g, gg, pid) {
    lsSet(LS_GAME, { grid: g, givenGrid: gg,
      activePuzzleId: pid ?? activePuzzleId,
      savedAt: new Date().toISOString() });
  }

  function saveGame() {
    if (lsSet(LS_GAME, { grid, givenGrid, activePuzzleId,
        savedAt: new Date().toISOString() })) {
      flash(setGameSaveMsg, "Game saved ✓");
    } else {
      flash(setGameSaveMsg, "Save failed");
    }
  }

  function resumeGame() {
    const s = lsGet(LS_GAME);
    if (!s) return;
    setGrid(s.grid); setGivenGrid(s.givenGrid);
    setActivePuzzleId(s.activePuzzleId);
    setSelectedCell(null); setHighlightVal(null);
    setShowResumeBanner(false);
  }

  function discardSavedGame() {
    localStorage.removeItem(LS_GAME);
    setShowResumeBanner(false);
  }

  function savedGameMeta() {
    try {
      const s = lsGet(LS_GAME); if (!s) return null;
      const d = new Date(s.savedAt);
      return {
        id: s.activePuzzleId,
        dateStr: d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
        timeStr: d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
      };
    } catch { return null; }
  }

  // ════════════════════════════════════════════════════════════════
  // Progress export (download current game as JSON)
  // ════════════════════════════════════════════════════════════════
  function exportProgress() {
    const progress = {
      id:            activePuzzleId || "in-progress",
      savedAt:       new Date().toISOString(),
      activePuzzleId,
      givenGrid,
      grid,
    };
    const blob = new Blob([JSON.stringify(progress, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `sudoku_progress_${activePuzzleId || "game"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ════════════════════════════════════════════════════════════════
  // Core grid actions
  // ════════════════════════════════════════════════════════════════
  function countGivens(g) { return g.flat().filter(v => v !== 0).length; }

  function selectCell(r, c) {
    setSelectedCell([r, c]);
    setHighlightVal(grid[r][c] !== 0 ? grid[r][c] : null);
  }

  function handleKeypadInput(num) {
    if (!selectedCell) return;
    const [r, c] = selectedCell;
    if (givenGrid[r][c] !== 0) return;
    const ng = grid.map(row => [...row]);
    ng[r][c] = num;
    setGrid(ng);
    setHighlightVal(num !== 0 ? num : null);
    autoSave(ng, givenGrid, activePuzzleId);
  }

  function handleDelete() {
    if (!selectedCell) return;
    const [r, c] = selectedCell;
    if (givenGrid[r][c] !== 0) return;
    const ng = grid.map(row => [...row]);
    ng[r][c] = 0;
    setGrid(ng);
    setHighlightVal(null);
    autoSave(ng, givenGrid, activePuzzleId);
  }

  function newGame() {
    localStorage.removeItem(LS_GAME);
    setGrid(emptyGrid()); setGivenGrid(emptyGrid());
    setSelectedCell(null); setHighlightVal(null);
    setActivePuzzleId(null); setShowResumeBanner(false);
  }

  function clearGrid() {
    const reset = grid.map((row, r) =>
      row.map((v, c) => givenGrid[r][c] !== 0 ? givenGrid[r][c] : 0));
    setGrid(reset); setHighlightVal(null);
  }

  function loadGrid(g, id) {
    const ng = g.map(row => [...row]);
    const gg = g.map(row => [...row]);
    setGrid(ng); setGivenGrid(gg);
    setSelectedCell(null); setHighlightVal(null);
    setActivePuzzleId(id); setShowResumeBanner(false);
    autoSave(ng, gg, id);
  }

  function loadPuzzle(p) { loadGrid(p.grid, p.id || p.index); }

  function downloadPuzzle() {
    const blob = new Blob([JSON.stringify({ grid }, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "sudoku_puzzle.json"; a.click();
    URL.revokeObjectURL(url);
  }

  function handleUploadClick() { fileInputRef.current.click(); }

  function handleFileChange(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target.result);
        if (json.grid && json.grid.length === 9) {
          loadGrid(json.grid, "imported");
        } else if (json.givenGrid && json.grid) {
          // progress file
          setGrid(json.grid); setGivenGrid(json.givenGrid);
          setActivePuzzleId(json.activePuzzleId || "imported");
          setSelectedCell(null); setHighlightVal(null);
          setShowResumeBanner(false);
        } else if (json.puzzles && json.puzzles.length > 0) {
          setPuzzles(json.puzzles); setShowPuzzleList(true);
        } else { alert("⚠️ Invalid JSON format"); }
      } catch { alert("❌ Error parsing JSON file"); }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  // ════════════════════════════════════════════════════════════════
  // Creator mode
  // ════════════════════════════════════════════════════════════════
  function creatorSelectCell(r, c) { setSelectedCell([r, c]); }

  function creatorKeypad(num) {
    if (!selectedCell) return;
    const [r, c] = selectedCell;
    const ng = creatorGrid.map(row => [...row]);
    ng[r][c] = num;
    setCreatorGrid(ng);
  }

  function creatorDelete() {
    if (!selectedCell) return;
    const [r, c] = selectedCell;
    const ng = creatorGrid.map(row => [...row]);
    ng[r][c] = 0;
    setCreatorGrid(ng);
  }

  function creatorClear() { setCreatorGrid(emptyGrid()); setSelectedCell(null); }

  function buildPuzzleObject() {
    const id     = creatorId.trim() || `puzzle-custom-${Date.now()}`;
    const givens = countGivens(creatorGrid);
    return { id, difficulty: creatorDiff, givens, grid: creatorGrid };
  }

  // Save to a new JSON file
  function creatorSaveNew() {
    const p    = buildPuzzleObject();
    const json = formatPuzzleJSON([p]);
    const blob = new Blob([json], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `${p.id}.json`; a.click();
    URL.revokeObjectURL(url);
    flash(setCreatorMsg, `Saved as ${p.id}.json ✓`);
  }

  // Merge into existing JSON file — triggers file picker
  function creatorMergeClick() { mergeFileRef.current.click(); }

  function creatorMergeFile(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json   = JSON.parse(ev.target.result);
        const list   = json.puzzles || [];
        const newP   = buildPuzzleObject();
        // prevent duplicate IDs
        const merged = [...list.filter(p => p.id !== newP.id), newP];
        const out    = formatPuzzleJSON(merged);
        const blob   = new Blob([out], { type: "application/json" });
        const url    = URL.createObjectURL(blob);
        const a      = document.createElement("a");
        a.href = url; a.download = file.name; a.click();
        URL.revokeObjectURL(url);
        flash(setCreatorMsg, `Added to ${file.name} (${merged.length} puzzles) ✓`);
      } catch { flash(setCreatorMsg, "❌ Error reading file"); }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  // Load creator puzzle into the game to play it
  function creatorPlay() {
    const p = buildPuzzleObject();
    setCreatorMode(false);
    loadGrid(p.grid, p.id);
  }

  // ════════════════════════════════════════════════════════════════
  // Border / cell style helpers
  // ════════════════════════════════════════════════════════════════
  function cellBorderStyle(r, c) {
    const bold = colors.borderBoldColor;
    const thin = colors.borderThinColor;
    return {
      borderTop:    r % 3 === 0 ? `2px solid ${bold}` : `1px solid ${thin}`,
      borderLeft:   c % 3 === 0 ? `2px solid ${bold}` : `1px solid ${thin}`,
      borderRight:  c === 8     ? `2px solid ${bold}` : `1px solid ${thin}`,
      borderBottom: r === 8     ? `2px solid ${bold}` : `1px solid ${thin}`,
    };
  }

  function cellColorStyle(isGiven, isUser) {
    if (isGiven) return { color: colors.givenColor, background: colors.bgColor };
    if (isUser)  return { color: colors.userColor,  background: colors.bgColor };
    return { background: colors.bgColor };
  }

  // ════════════════════════════════════════════════════════════════
  // Filtered puzzle list
  // ════════════════════════════════════════════════════════════════
  const difficulties = useMemo(() => {
    const s = new Set(puzzles.map(p => p.difficulty).filter(Boolean));
    return ["all", ...Array.from(s)];
  }, [puzzles]);

  const filtered = useMemo(() => puzzles.filter((p, idx) => {
    const id   = (p.id || `Puzzle ${idx + 1}`).toLowerCase();
    const diff = (p.difficulty || "").toLowerCase();
    return (!filterText || id.includes(filterText.toLowerCase())) &&
           (filterDiff === "all" || diff === filterDiff);
  }), [puzzles, filterText, filterDiff]);

  // ════════════════════════════════════════════════════════════════
  // Mini grid preview
  // ════════════════════════════════════════════════════════════════
  function MiniGrid({ g }) {
    return (
      <div className="mini-grid">
        {g.map((row, r) => (
          <div key={r} className="mini-row">
            {row.map((val, c) => {
              let cls = "mini-cell";
              if (val !== 0) cls += " filled";
              if (c === 2 || c === 5) cls += " box-border-r";
              if (r === 2 || r === 5) cls += " box-border-b";
              return <div key={c} className={cls} />;
            })}
          </div>
        ))}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // Toolbar
  // ════════════════════════════════════════════════════════════════
  const TOOLBAR = [
    { label: "Quit",          action: onQuit },
    { label: "Rules",         action: () => setShowRules(v => !v) },
    { label: "Description",   action: () => setShowDesc(v => !v) },
    { label: "Setup",         action: () => setShowSetup(v => !v) },
    { label: "Solutions",     action: () => setShowSolutions(v => !v) },
    { label: "New Game",      action: newGame },
    { label: "Clear",         action: clearGrid },
    { label: "Save Game",     action: saveGame },
    { label: "Save Progress", action: exportProgress },
    { label: "Download",      action: downloadPuzzle },
    { label: "Upload",        action: handleUploadClick },
    { label: "Puzzles",       action: () => setShowPuzzleList(v => !v) },
    { label: creatorMode ? "✕ Creator" : "Create Puzzle",
      action: () => { setCreatorMode(v => !v); setSelectedCell(null); } },
  ];

  const COLOR_OPTIONS = [
    { key: "givenColor",      label: "Given numbers",     sample: "5" },
    { key: "userColor",       label: "Your numbers",      sample: "3" },
    { key: "noteColor",       label: "Note numbers",      sample: "7" },
    { key: "bgColor",         label: "Cell background",   sample: null },
    { key: "borderThinColor", label: "Cell border (thin)", sample: null },
    { key: "borderBoldColor", label: "Box border (bold)",  sample: null },
  ];

  // ════════════════════════════════════════════════════════════════
  // Render
  // ════════════════════════════════════════════════════════════════
  return (
    <div className="sudoku-container" data-theme={darkMode ? "dark" : "light"}>

      {/* Header */}
      <div className="sudoku-header">
        <h2>{creatorMode ? "Create Puzzle" : "Sudoku"}</h2>
        <button className="theme-toggle" onClick={toggleTheme}>
          <span>{darkMode ? "☀️" : "🌙"}</span>
          {darkMode ? "Light" : "Dark"}
        </button>
      </div>

      {/* Puzzle indicator */}
      {!creatorMode && activePuzzleId && (
        <div className="current-puzzle-bar">
          Playing: <span>{activePuzzleId}</span>
        </div>
      )}

      {/* Resume banner */}
      {!creatorMode && showResumeBanner && (() => {
        const meta = savedGameMeta();
        return meta ? (
          <div className="resume-banner">
            <div className="resume-banner-text">
              <span className="resume-icon">💾</span>
              <span>
                Saved game: <strong>{meta.id || "puzzle"}</strong>
                <span className="resume-date"> · {meta.dateStr} at {meta.timeStr}</span>
              </span>
            </div>
            <div className="resume-banner-btns">
              <button className="resume-yes-btn" onClick={resumeGame}>Resume</button>
              <button className="resume-no-btn"  onClick={discardSavedGame}>Discard</button>
            </div>
          </div>
        ) : null;
      })()}

      {/* Game save flash */}
      {gameSaveMsg && <div className="game-save-msg">{gameSaveMsg}</div>}

      {/* Toolbar */}
      <div className="sudoku-buttons">
        {TOOLBAR.map(({ label, action }) => (
          <button
            key={label}
            onClick={action}
            className={label === "Create Puzzle" || label === "✕ Creator"
              ? "btn-creator" : ""}
          >
            {label}
          </button>
        ))}
        <input type="file" ref={fileInputRef}    style={{ display: "none" }} accept=".json" onChange={handleFileChange} />
        <input type="file" ref={mergeFileRef}    style={{ display: "none" }} accept=".json" onChange={creatorMergeFile} />
      </div>

      {/* ══════════════════════════════════════════
          CREATOR MODE
      ══════════════════════════════════════════ */}
      {creatorMode && (
        <div className="creator-panel">
          <div className="creator-meta">
            <div className="creator-field">
              <label>Puzzle ID</label>
              <input
                type="text"
                placeholder="e.g. puzzle-my-001"
                value={creatorId}
                onChange={e => setCreatorId(e.target.value)}
              />
            </div>
            <div className="creator-field">
              <label>Difficulty</label>
              <select value={creatorDiff} onChange={e => setCreatorDiff(e.target.value)}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            <div className="creator-givens">
              {countGivens(creatorGrid)} givens placed
            </div>
          </div>

          {/* Creator grid */}
          <div className="sudoku-grid" style={{ margin: "0.8rem auto" }}>
            {creatorGrid.map((row, r) =>
              <div key={r} className="sudoku-row">
                {row.map((val, c) => {
                  const isSel = selectedCell?.[0] === r && selectedCell?.[1] === c;
                  return (
                    <div
                      key={c}
                      className={`sudoku-cell given${isSel ? " selected" : ""}`}
                      onClick={() => creatorSelectCell(r, c)}
                      style={{
                        ...cellBorderStyle(r, c),
                        color: val !== 0 ? colors.givenColor : "transparent",
                        background: colors.bgColor,
                      }}
                    >
                      {val !== 0 ? val : ""}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Creator keypad */}
          <div className="sudoku-pad">
            <div className="pad-grid">
              {[1,2,3,4,5,6,7,8,9].map(n => (
                <button key={n} onClick={() => creatorKeypad(n)}>{n}</button>
              ))}
              <button onClick={() => creatorKeypad(0)}>0</button>
              <button onClick={creatorClear} className="delete-btn" style={{ fontFamily: "Space Mono, monospace", fontSize: "0.72rem" }}>Clear All</button>
              <button onClick={creatorDelete} className="delete-btn">Del</button>
            </div>
          </div>

          {/* Creator actions */}
          <div className="creator-actions">
            <button className="setup-apply-btn" onClick={creatorPlay}>
              ▶ Play this puzzle
            </button>
            <button className="setup-save-btn" onClick={creatorSaveNew}>
              💾 Save as new JSON
            </button>
            <button className="setup-save-btn" onClick={creatorMergeClick}>
              ＋ Add to existing JSON
            </button>
            <button className="setup-reset-btn" onClick={creatorClear}>
              ↺ Clear grid
            </button>
          </div>
          {creatorMsg && <div className="game-save-msg" style={{ marginTop: "0.5rem" }}>{creatorMsg}</div>}
        </div>
      )}

      {/* ══════════════════════════════════════════
          PLAY MODE grid
      ══════════════════════════════════════════ */}
      {!creatorMode && (
        <>
          <div className="sudoku-grid">
            {grid.map((row, r) =>
              <div key={r} className="sudoku-row">
                {row.map((val, c) => {
                  const isSelected  = selectedCell?.[0] === r && selectedCell?.[1] === c;
                  const isHighlight = highlightVal && val === highlightVal && !isSelected;
                  const isGiven     = givenGrid[r][c] !== 0;
                  const isUser      = val !== 0 && !isGiven;
                  let cls = "sudoku-cell";
                  if (isSelected)  cls += " selected";
                  if (isHighlight) cls += " highlight";
                  return (
                    <div
                      key={c}
                      className={cls}
                      onClick={() => selectCell(r, c)}
                      style={{ ...cellBorderStyle(r, c), ...cellColorStyle(isGiven, isUser) }}
                    >
                      {val !== 0 ? val : ""}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Play keypad */}
          <div className="sudoku-pad">
            <div className="pad-grid">
              {[1,2,3,4,5,6,7,8,9].map(n => (
                <button key={n} onClick={() => handleKeypadInput(n)}>{n}</button>
              ))}
              <button onClick={() => handleKeypadInput(0)}>0</button>
              <button
                className={noteMode ? "note-active" : ""}
                onClick={() => setNoteMode(v => !v)}
              >
                {noteMode ? "NOTE ✓" : "Note"}
              </button>
              <button className="delete-btn" onClick={handleDelete}>Del</button>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════
          INFO PANELS
      ══════════════════════════════════════════ */}
      {showRules && (
        <div className="sudoku-box">
          <h3>Rules</h3>
          Fill every row, column, and 3×3 box with the digits 1–9.
          Each digit may appear exactly once per row, column, and box.
        </div>
      )}

      {showDesc && (
        <div className="sudoku-box">
          <h3>Description</h3>
          A classic logic puzzle. No arithmetic required — only deduction, patience, and pattern recognition.
        </div>
      )}

      {showSolutions && (
        <div className="sudoku-box">
          <h3>Solutions</h3>
          Solver coming soon. Download your puzzle and use an external solver in the meantime.
        </div>
      )}

      {/* ══════════════════════════════════════════
          SETUP PANEL
      ══════════════════════════════════════════ */}
      {showSetup && (
        <div className="setup-panel">
          <h3>Setup</h3>

          <div className="setup-section-label">Colors</div>
          <div className="color-rows">
            {COLOR_OPTIONS.map(({ key, label, sample }) => (
              <div className="color-row" key={key}>
                <span className="color-row-label">{label}</span>
                {sample && (
                  <span className="color-row-sample" style={{ color: draft[key] }}>{sample}</span>
                )}
                <div className="color-row-preview"
                  style={{ background: draft[key], border: "2px solid var(--border-bold)" }} />
                <input type="color" value={draft[key]}
                  onChange={e => setDraftColor(key, e.target.value)} />
              </div>
            ))}
          </div>

          <div className="setup-section-label" style={{ marginTop: "1rem" }}>Instructions</div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
            Click a cell, then tap a digit. Given numbers are locked.
            Use <em>Note</em> mode to pencil in candidates.
            <em> Save Progress</em> downloads your in-progress game as JSON so you can resume it later.
            <em> Create Puzzle</em> opens a blank grid — fill in the givens, then save or play.
          </div>

          <div className="setup-actions">
            <button className="setup-apply-btn" onClick={applyColors}>✓ Apply</button>
            <button className="setup-save-btn"  onClick={saveColors}>💾 Save settings</button>
            <button className="setup-reset-btn" onClick={resetColors}>↺ Reset</button>
            {saveMsg && <span className="setup-save-msg">{saveMsg}</span>}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          PUZZLE BROWSER
      ══════════════════════════════════════════ */}
      {showPuzzleList && (
        <div className="puzzle-browser">
          <div className="puzzle-browser-header">
            <h3>Puzzle Browser</h3>
            <span className="puzzle-count">{filtered.length} / {puzzles.length} puzzles</span>
          </div>

          {puzzles.length === 0 ? (
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
              No puzzles loaded yet. Click <strong>Upload</strong> to import a JSON file.
            </p>
          ) : (
            <>
              <div className="puzzle-filter">
                <input type="text" placeholder="Search by ID…"
                  value={filterText} onChange={e => setFilterText(e.target.value)} />
                {difficulties.length > 2 && (
                  <select value={filterDiff} onChange={e => setFilterDiff(e.target.value)}>
                    {difficulties.map(d => (
                      <option key={d} value={d}>{d === "all" ? "All difficulties" : d}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="puzzle-list-grid">
                {filtered.length === 0
                  ? <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>No matches.</p>
                  : filtered.map((p, idx) => {
                    const id = p.id || `Puzzle ${idx + 1}`;
                    const isActive = activePuzzleId === (p.id || p.index);
                    return (
                      <div key={id}
                        className={`puzzle-card${isActive ? " active-puzzle" : ""}`}
                        onClick={() => loadPuzzle(p)}>
                        <MiniGrid g={p.grid} />
                        <div className="puzzle-card-info">
                          <div className="puzzle-card-id">{id}</div>
                          <div className="puzzle-card-meta">
                            {p.difficulty || "unknown"} · {countGivens(p.grid)} givens
                          </div>
                        </div>
                        {isActive
                          ? <span className="active-badge">Playing</span>
                          : <button className="load-btn"
                              onClick={e => { e.stopPropagation(); loadPuzzle(p); }}>
                              Load
                            </button>
                        }
                      </div>
                    );
                  })
                }
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
