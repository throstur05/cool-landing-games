// Collapse_Through_Symbol_v8_01.jsx — Claude House Edition
// Clean rewrite: mathematically correct, no JSX in data objects

import React, { useState, useCallback, useEffect, useRef } from 'react';

/* ══════════════════════════════════════════════════
   MATH
══════════════════════════════════════════════════ */
const digitalRoot = (n) => n <= 0 ? 0 : 1 + ((n - 1) % 9);
const lineSum     = (arr) => arr.reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0);

const ALL_CANDS = [1, 5, 7, 11, 13, 17, 19, 23];
const A_TYPE    = [1, 7, 13, 19];   // ≡ 1 mod 3
const B_TYPE    = [5, 11, 17, 23];  // ≡ 2 mod 3

const isDiv3  = (arr) => lineSum(arr) % 3 === 0;
const isDR369 = (arr) => { const dr = digitalRoot(lineSum(arr)); return dr===3||dr===6||dr===9; };

const getRows  = (g) => g;
const getCols  = (g) => g[0].map((_, c) => g.map(r => r[c]));
const getDiags = (g) => {
  const N = g.length;
  const d1 = g.map((r, i) => r[i]);
  const d2 = g.map((r, i) => r[N - 1 - i]);
  return [d1, d2];
};

/* ══════════════════════════════════════════════════
   MODES
══════════════════════════════════════════════════ */
const MODES = {
  rowsOnly: {
    id:'rowsOnly', tier:1, tierName:'Basic', color:'#2e7d45',
    name:'Rows Only', short:'Row sums ÷ 3',
    cands: ALL_CANDS,
    validate(g) {
      for (const row of getRows(g)) if (!isDiv3(row)) return {ok:false, msg:`Row sum ${lineSum(row)} not divisible by 3`};
      return {ok:true};
    },
    howto:['All values from {1,5,7,11,13,17,19,23}.','Every row sum must be divisible by 3.','KEY: values are A-type {1,7,13,19} (≡1 mod 3) or B-type {5,11,17,23} (≡2 mod 3). A valid row must be all A-type OR all B-type.'],
  },
  rowsAndCols: {
    id:'rowsAndCols', tier:1, tierName:'Basic', color:'#2e7d45',
    name:'Rows & Cols', short:'Rows and columns ÷ 3',
    cands: ALL_CANDS,
    validate(g) {
      for (const row of getRows(g)) if (!isDiv3(row)) return {ok:false, msg:`Row sum ${lineSum(row)} not ÷3`};
      for (const col of getCols(g)) if (!isDiv3(col)) return {ok:false, msg:`Col sum ${lineSum(col)} not ÷3`};
      return {ok:true};
    },
    howto:['All values from {1,5,7,11,13,17,19,23}.','Every row AND column sum must be divisible by 3.','Residue trick: determine each row/col type (A or B) from clues, then blanks must match.'],
  },
  standardDR: {
    id:'standardDR', tier:2, tierName:'Standard', color:'#1a5276',
    name:'Standard DR', short:'Rows + cols, DR in {3,6,9}',
    cands: ALL_CANDS,
    validate(g) {
      for (const row of getRows(g)) if (!isDR369(row)) return {ok:false, msg:`Row DR=${digitalRoot(lineSum(row))} not in {3,6,9}`};
      for (const col of getCols(g)) if (!isDR369(col)) return {ok:false, msg:`Col DR=${digitalRoot(lineSum(col))} not in {3,6,9}`};
      return {ok:true};
    },
    howto:['All values from {1,5,7,11,13,17,19,23}.','Row and column sums must have digital root in {3,6,9}.','Digital root = repeatedly sum digits until one digit. DR in {3,6,9} means sum is divisible by 3.'],
  },
  withDiagonals: {
    id:'withDiagonals', tier:2, tierName:'Standard', color:'#1a5276',
    name:'With Diagonals', short:'Rows + cols + diagonals ÷ 3',
    cands: ALL_CANDS,
    validate(g) {
      for (const row of getRows(g)) if (!isDiv3(row)) return {ok:false, msg:`Row sum ${lineSum(row)} not ÷3`};
      for (const col of getCols(g)) if (!isDiv3(col)) return {ok:false, msg:`Col sum ${lineSum(col)} not ÷3`};
      for (const d of getDiags(g)) if (!isDiv3(d)) return {ok:false, msg:`Diagonal sum ${lineSum(d)} not ÷3`};
      return {ok:true};
    },
    howto:['All values from {1,5,7,11,13,17,19,23}.','Rows, columns, and BOTH diagonals must be divisible by 3.','Center cell appears in both diagonals — solve it last.'],
  },
  aTypeOnly: {
    id:'aTypeOnly', tier:3, tierName:'Advanced', color:'#7d4e00',
    name:'A-Type Only', short:'Only {1,7,13,19}',
    cands: A_TYPE,
    validate(g) {
      const N = g.length;
      for (let r=0;r<N;r++) for (let c=0;c<N;c++) {
        if (typeof g[r][c]==='number' && !A_TYPE.includes(g[r][c])) return {ok:false, msg:`(${r+1},${c+1})=${g[r][c]} not A-type`};
      }
      for (const row of getRows(g)) if (!isDiv3(row)) return {ok:false, msg:`Row sum ${lineSum(row)} not ÷3`};
      for (const col of getCols(g)) if (!isDiv3(col)) return {ok:false, msg:`Col sum ${lineSum(col)} not ÷3`};
      for (const d of getDiags(g)) if (!isDiv3(d)) return {ok:false, msg:`Diagonal sum ${lineSum(d)} not ÷3`};
      return {ok:true};
    },
    howto:['Only A-type values {1,7,13,19} allowed.','Any 3 A-type values sum to a multiple of 3 automatically (1+1+1=3).','Focus on exact row/col sums to pick the right specific value.'],
  },
  bTypeOnly: {
    id:'bTypeOnly', tier:3, tierName:'Advanced', color:'#7d4e00',
    name:'B-Type Only', short:'Only {5,11,17,23}',
    cands: B_TYPE,
    validate(g) {
      const N = g.length;
      for (let r=0;r<N;r++) for (let c=0;c<N;c++) {
        if (typeof g[r][c]==='number' && !B_TYPE.includes(g[r][c])) return {ok:false, msg:`(${r+1},${c+1})=${g[r][c]} not B-type`};
      }
      for (const row of getRows(g)) if (!isDiv3(row)) return {ok:false, msg:`Row sum ${lineSum(row)} not ÷3`};
      for (const col of getCols(g)) if (!isDiv3(col)) return {ok:false, msg:`Col sum ${lineSum(col)} not ÷3`};
      for (const d of getDiags(g)) if (!isDiv3(d)) return {ok:false, msg:`Diagonal sum ${lineSum(d)} not ÷3`};
      return {ok:true};
    },
    howto:['Only B-type values {5,11,17,23} allowed.','Any 3 B-type values sum to a multiple of 3 automatically (2+2+2=6).','Mirror of A-Type Only — same strategy, different numbers.'],
  },
  mixedResidues: {
    id:'mixedResidues', tier:3, tierName:'Advanced', color:'#7d4e00',
    name:'Mixed Residues', short:'Full set + A/B badges shown',
    cands: ALL_CANDS,
    validate(g) {
      for (const row of getRows(g)) if (!isDiv3(row)) return {ok:false, msg:`Row sum ${lineSum(row)} not ÷3`};
      for (const col of getCols(g)) if (!isDiv3(col)) return {ok:false, msg:`Col sum ${lineSum(col)} not ÷3`};
      for (const d of getDiags(g)) if (!isDiv3(d)) return {ok:false, msg:`Diagonal sum ${lineSum(d)} not ÷3`};
      return {ok:true};
    },
    howto:['Full candidate set. Residue badges (A/B) shown on clue cells.','Phase 1: read badges to determine required type for each blank.','Phase 2: use row + col sums to pick the specific value within that type.'],
  },
  exactSum: {
    id:'exactSum', tier:4, tierName:'Boss', color:'#6a0a0a',
    name:'Exact Sum', short:'All lines sum to target T',
    cands: ALL_CANDS,
    targetSum: 39,
    validate(g, T) {
      const target = T || 39;
      for (const row of getRows(g)) if (lineSum(row)!==target) return {ok:false, msg:`Row sum=${lineSum(row)}, need ${target}`};
      for (const col of getCols(g)) if (lineSum(col)!==target) return {ok:false, msg:`Col sum=${lineSum(col)}, need ${target}`};
      for (const d of getDiags(g)) if (lineSum(d)!==target) return {ok:false, msg:`Diag sum=${lineSum(d)}, need ${target}`};
      return {ok:true};
    },
    howto:['Every row, column, and diagonal must sum to exactly T.','Algebra: x = T - known1 - known2. Check x is a valid candidate.','If x is negative or not a candidate, that arrangement has no solution.'],
  },
  symmetryMode: {
    id:'symmetryMode', tier:4, tierName:'Boss', color:'#6a0a0a',
    name:'Symmetry', short:'Rotational symmetry + ÷3',
    cands: ALL_CANDS,
    validate(g) {
      const N = g.length;
      for (let r=0;r<N;r++) for (let c=0;c<N;c++) {
        if (g[r][c]!==g[N-1-r][N-1-c]) return {ok:false, msg:`Symmetry broken at (${r+1},${c+1})`};
      }
      for (const row of getRows(g)) if (!isDiv3(row)) return {ok:false, msg:`Row sum ${lineSum(row)} not ÷3`};
      for (const col of getCols(g)) if (!isDiv3(col)) return {ok:false, msg:`Col sum ${lineSum(col)} not ÷3`};
      for (const d of getDiags(g)) if (!isDiv3(d)) return {ok:false, msg:`Diagonal sum ${lineSum(d)} not ÷3`};
      return {ok:true};
    },
    howto:['Grid must be rotationally symmetric: M[r][c] = M[N-r][N-c] (opposite cells equal).','Filling one blank forces its rotational partner to the same value.','Symmetric rows look like [a,b,a] — solve center first, then pairs.'],
  },
  bossChamber: {
    id:'bossChamber', tier:4, tierName:'Boss', color:'#6a0a0a',
    name:'Boss Chamber', short:'Exact T + symmetry',
    cands: ALL_CANDS,
    targetSum: 39,
    validate(g, T) {
      const target = T || 39;
      const N = g.length;
      for (let r=0;r<N;r++) for (let c=0;c<N;c++) {
        if (g[r][c]!==g[N-1-r][N-1-c]) return {ok:false, msg:`Symmetry broken at (${r+1},${c+1})`};
      }
      for (const row of getRows(g)) if (lineSum(row)!==target) return {ok:false, msg:`Row sum=${lineSum(row)}, need ${target}`};
      for (const col of getCols(g)) if (lineSum(col)!==target) return {ok:false, msg:`Col sum=${lineSum(col)}, need ${target}`};
      for (const d of getDiags(g)) if (lineSum(d)!==target) return {ok:false, msg:`Diag sum=${lineSum(d)}, need ${target}`};
      return {ok:true};
    },
    howto:['Exact target sum T on ALL lines AND rotational symmetry.','Solve center first, then corner pairs using 2a+b=T, then edges.','Most cells are fully forced — very few valid configurations exist.'],
  },
};

const MODE_ORDER = ['rowsOnly','rowsAndCols','standardDR','withDiagonals',
                    'aTypeOnly','bTypeOnly','mixedResidues','exactSum','symmetryMode','bossChamber'];
const TIER_COLORS = {1:'#2e7d45', 2:'#1a5276', 3:'#7d4e00', 4:'#6a0a0a'};
const TIER_NAMES  = {1:'Basic',   2:'Standard', 3:'Advanced', 4:'Boss'};

/* ══════════════════════════════════════════════════
   GENERATOR
══════════════════════════════════════════════════ */
const shuffle = (a) => [...a].sort(() => Math.random() - .5);

const generatePuzzle = (N, blanks, modeId) => {
  const mode   = MODES[modeId];
  const cands  = mode.cands;
  const isExact = modeId === 'exactSum' || modeId === 'bossChamber';
  const isSym   = modeId === 'symmetryMode' || modeId === 'bossChamber';
  const T       = mode.targetSum || 39;

  for (let attempt = 0; attempt < 500000; attempt++) {
    const grid = Array.from({length:N}, () =>
      Array.from({length:N}, () => cands[Math.floor(Math.random() * cands.length)])
    );

    // Force same-type rows for divisibility modes
    if (!isExact && !isSym) {
      for (let r = 0; r < N; r++) {
        const type = Math.random() < .5 ? A_TYPE : B_TYPE;
        const filtered = cands.filter(c => type.includes(c));
        if (filtered.length > 0) {
          for (let c = 0; c < N; c++) grid[r][c] = filtered[Math.floor(Math.random()*filtered.length)];
        }
      }
    }

    if (isSym) {
      for (let r=0;r<N;r++) for (let c=0;c<N;c++) grid[N-1-r][N-1-c] = grid[r][c];
    }

    const valid = mode.validate(grid, isExact ? T : undefined);
    if (!valid.ok) continue;

    const pos = [];
    for (let r=0;r<N;r++) for (let c=0;c<N;c++) pos.push([r,c]);
    const puzzle = grid.map(r => [...r]);

    if (isSym) {
      const half = pos.filter(([r,c]) => r*N+c < Math.floor(N*N/2));
      shuffle(half).slice(0, Math.min(Math.ceil(blanks/2), half.length-1)).forEach(([r,c]) => {
        puzzle[r][c] = '?'; puzzle[N-1-r][N-1-c] = '?';
      });
    } else {
      shuffle(pos).slice(0, Math.min(blanks, N*N-1)).forEach(([r,c]) => { puzzle[r][c] = '?'; });
    }

    return {puzzle, targetSum: isExact ? T : null};
  }
  return null;
};

/* ══════════════════════════════════════════════════
   SOLVER
══════════════════════════════════════════════════ */
const solvePuzzle = (puzzle, modeId) => {
  const mode   = MODES[modeId];
  const cands  = mode.cands;
  const N      = puzzle.length;
  const grid   = puzzle.map(r => [...r]);
  const blanks = [];
  for (let r=0;r<N;r++) for (let c=0;c<N;c++) if (grid[r][c]==='?') blanks.push([r,c]);
  const solutions = [];
  const isExact = modeId==='exactSum'||modeId==='bossChamber';
  const T = mode.targetSum || 39;
  const bt = (i) => {
    if (solutions.length >= 6) return;
    if (i === blanks.length) {
      if (mode.validate(grid, isExact?T:undefined).ok) solutions.push(grid.map(r=>[...r]));
      return;
    }
    const [r,c] = blanks[i];
    for (const v of cands) { grid[r][c]=v; bt(i+1); }
    grid[r][c]='?';
  };
  bt(0);
  return solutions;
};

/* ══════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════ */
const cellPx = (N) => ({3:72,4:64,5:56,6:50,7:44,8:40,9:36}[N]||36);
const fontPx = (N) => ({3:22,4:19,5:17,6:15,7:13,8:12,9:11}[N]||11);
const blankOpts = (N) => {
  const base=Math.max(2,Math.floor(N*N*.15)), max=Math.floor(N*N*.6);
  const step=Math.max(1,Math.floor((max-base)/8));
  const opts=[];
  for (let b=base;b<=max;b+=step) opts.push(b);
  if (!opts.includes(max)) opts.push(max);
  return opts;
};

const DEFAULTS = {
  numberColor:'#3d2b1f', inputColor:'#c0392b', qmarkColor:'#b0a090',
  fixedBg:'#ffffff', blankBg:'#fdf8f3', selBg:'#ddeeff',
  borderColor:'#c8b89a', pageBg:'#f5f2eb',
  gridSize:3, blanks:4, modeId:'rowsOnly',
};

/* ══════════════════════════════════════════════════
   SHARED STYLES
══════════════════════════════════════════════════ */
const PANEL  = {background:'#fff',border:'1px solid #c8b89a',borderRadius:'6px',padding:'22px 26px',maxWidth:'680px',width:'100%',boxShadow:'0 2px 12px rgba(0,0,0,.06)'};
const PTITLE = {fontSize:'1.05rem',fontWeight:700,marginBottom:'16px',color:'#3d2b1f',borderBottom:'1px solid #e0d6c8',paddingBottom:'10px'};
const PP     = {fontSize:'.87rem',lineHeight:'1.7',color:'#444',marginBottom:'9px'};
const SEC    = {fontSize:'.66rem',fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'#8a7360',margin:'14px 0 7px'};

const BTN = (v) => {
  const m = {success:{bg:'#2e7d45',c:'#fff',b:'#2e7d45'},info:{bg:'#1a5276',c:'#fff',b:'#1a5276'},
    primary:{bg:'#3d2b1f',c:'#f5f2eb',b:'#3d2b1f'},neutral:{bg:'#fff',c:'#3d2b1f',b:'#3d2b1f'}}[v]
    || {bg:'#3d2b1f',c:'#f5f2eb',b:'#3d2b1f'};
  return {background:m.bg,color:m.c,border:`1.5px solid ${m.b}`,padding:'7px 18px',cursor:'pointer',
    fontSize:'.82rem',letterSpacing:'.05em',textTransform:'uppercase',borderRadius:'3px',fontFamily:'inherit',fontWeight:600};
};

/* ══════════════════════════════════════════════════
   TIER TABS (shared UI)
══════════════════════════════════════════════════ */
const TierTabs = ({tab, setTab, accentFn}) => (
  <div style={{marginBottom:'16px'}}>
    {[1,2,3,4].map(tier => (
      <div key={tier} style={{marginBottom:'7px'}}>
        <div style={{fontSize:'.6rem',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:TIER_COLORS[tier],marginBottom:'3px'}}>
          {TIER_NAMES[tier]}
        </div>
        <div style={{display:'flex',gap:'4px',flexWrap:'wrap'}}>
          {MODE_ORDER.filter(id => MODES[id].tier===tier).map(id => (
            <button key={id} onClick={()=>setTab(id)} style={{
              background: tab===id ? (accentFn?accentFn(tier):TIER_COLORS[tier]) : '#f0e8dc',
              color: tab===id ? '#fff' : '#3d2b1f',
              border:`1.5px solid ${TIER_COLORS[tier]}`,borderRadius:'2px',
              padding:'3px 9px',cursor:'pointer',fontFamily:'inherit',fontSize:'.7rem',fontWeight:700,
            }}>{MODES[id].name}</button>
          ))}
        </div>
      </div>
    ))}
  </div>
);

/* ══════════════════════════════════════════════════
   NUMBER PAD
══════════════════════════════════════════════════ */
const NumberPad = ({currentValue, onPick, onClear, onClose, cands, modeId}) => {
  const accent = MODES[modeId].color;
  const aGroup = cands.filter(n => A_TYPE.includes(n));
  const bGroup = cands.filter(n => B_TYPE.includes(n));
  const CandBtn = ({n}) => (
    <button onMouseDown={e=>{e.preventDefault();onPick(n);}} style={{
      width:'52px',height:'44px',
      border:n===currentValue?`2px solid ${accent}`:'1.5px solid #c8b89a',
      borderRadius:'5px',background:n===currentValue?accent:'#fff',
      color:n===currentValue?'#fff':'#3d2b1f',
      fontSize:'.95rem',fontWeight:700,fontFamily:'inherit',cursor:'pointer',
    }}>{n}</button>
  );
  return (
    <div style={{background:'#fff',border:`2px solid ${accent}`,borderRadius:'10px',
      padding:'14px 16px',marginTop:'12px',boxShadow:'0 6px 24px rgba(0,0,0,.15)',
      display:'inline-flex',flexDirection:'column',alignItems:'center',gap:'9px'}}>
      <div style={{fontSize:'.63rem',color:accent,letterSpacing:'.08em',textTransform:'uppercase',fontWeight:700}}>
        {MODES[modeId].name}
      </div>
      <div style={{display:'flex',gap:'12px',flexWrap:'wrap',justifyContent:'center'}}>
        {aGroup.length > 0 && (
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'4px'}}>
            <div style={{fontSize:'.58rem',color:'#1a5276',fontWeight:700}}>A-type</div>
            <div style={{display:'flex',gap:'4px'}}>{aGroup.map(n=><CandBtn key={n} n={n}/>)}</div>
          </div>
        )}
        {bGroup.length > 0 && (
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'4px'}}>
            <div style={{fontSize:'.58rem',color:'#7d4e00',fontWeight:700}}>B-type</div>
            <div style={{display:'flex',gap:'4px'}}>{bGroup.map(n=><CandBtn key={n} n={n}/>)}</div>
          </div>
        )}
      </div>
      <div style={{display:'flex',gap:'8px'}}>
        <button onMouseDown={e=>{e.preventDefault();onClear();}} style={{padding:'5px 16px',border:'1.5px solid #e74c3c',borderRadius:'4px',background:'#fdecea',color:'#c0392b',fontWeight:700,fontSize:'.8rem',fontFamily:'inherit',cursor:'pointer'}}>Clear</button>
        <button onMouseDown={e=>{e.preventDefault();onClose();}} style={{padding:'5px 16px',border:'1.5px solid #c8b89a',borderRadius:'4px',background:'#f0e8dc',color:'#3d2b1f',fontWeight:700,fontSize:'.8rem',fontFamily:'inherit',cursor:'pointer'}}>Close</button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════
   BOARD
══════════════════════════════════════════════════ */
const Board = ({puzzle, setPuzzle, fixedCells, settings, modeId}) => {
  const [sel, setSel] = useState(null);
  const N = puzzle.length, px = cellPx(N), fs = fontPx(N), gap = N<=5?6:4;
  const cands = MODES[modeId].cands;
  const accent = MODES[modeId].color;
  const showBadge = modeId === 'mixedResidues';

  const pick  = (n) => { if(!sel) return; const [r,c]=sel; setPuzzle(puzzle.map((row,ri)=>row.map((v,ci)=>ri===r&&ci===c?n:v))); };
  const clear = ()  => { if(!sel) return; const [r,c]=sel; setPuzzle(puzzle.map((row,ri)=>row.map((v,ci)=>ri===r&&ci===c?'?':v))); };
  const curVal = sel ? puzzle[sel[0]][sel[1]] : null;

  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
      <div style={{display:'grid',gridTemplateColumns:`repeat(${N},${px}px)`,gridTemplateRows:`repeat(${N},${px}px)`,
        gap:`${gap}px`,padding:N<=5?'10px':'6px',background:settings.pageBg,borderRadius:'8px',
        boxShadow:'0 2px 16px rgba(0,0,0,.09)'}}>
        {puzzle.map((row,r) => row.map((cell,c) => {
          const fixed = fixedCells[r][c];
          const isSel = sel&&sel[0]===r&&sel[1]===c;
          const isEmpty = cell==='?';
          const badge = showBadge&&fixed&&typeof cell==='number' ? (A_TYPE.includes(cell)?'A':'B') : null;
          return (
            <div key={`${r}-${c}`} onClick={()=>{if(!fixed) setSel(isSel?null:[r,c]);}} style={{
              width:`${px}px`,height:`${px}px`,position:'relative',
              display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:`${fs}px`,fontWeight:700,
              color:fixed?settings.numberColor:isEmpty?settings.qmarkColor:settings.inputColor,
              background:isSel?settings.selBg:fixed?settings.fixedBg:settings.blankBg,
              border:`${N<=5?2:1.5}px ${fixed?'solid':'dashed'} ${isSel?accent:settings.borderColor}`,
              borderRadius:N<=5?'5px':'3px',cursor:fixed?'default':'pointer',userSelect:'none',
              boxShadow:isSel?`0 0 0 3px ${accent}40`:'none',transition:'background .1s',
            }}>
              {isEmpty?'?':cell}
              {badge&&<span style={{position:'absolute',top:'2px',right:'3px',fontSize:'8px',fontWeight:800,
                color:badge==='A'?'#1a5276':'#7d4e00',opacity:.8}}>{badge}</span>}
            </div>
          );
        }))}
      </div>
      {sel&&!fixedCells[sel[0]][sel[1]]&&(
        <NumberPad currentValue={typeof curVal==='number'?curVal:null}
          onPick={pick} onClear={clear} onClose={()=>setSel(null)} cands={cands} modeId={modeId}/>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════
   GAMEPLAY VIEW
══════════════════════════════════════════════════ */
const GameplayView = ({puzzle, setPuzzle, fixedCells, settings, modeId, targetSum, onSolve}) => {
  const [msg, setMsg] = useState(null);
  const mode    = MODES[modeId];
  const isExact = modeId==='exactSum'||modeId==='bossChamber';

  const check = () => {
    if (!puzzle) return;
    if (puzzle.some(r=>r.includes('?'))) { setMsg({text:'Fill all cells first!',ok:false}); return; }
    const res = mode.validate(puzzle, isExact?(targetSum||mode.targetSum||39):undefined);
    setMsg(res.ok ? {text:'Correct! Well solved.',ok:true} : {text:res.msg,ok:false});
  };

  if (!puzzle) return (
    <div style={{textAlign:'center',color:'#8a7360',marginTop:'48px'}}>
      <p style={PP}>No puzzle loaded — press New Game to start.</p>
    </div>
  );

  const N = puzzle.length;
  const blanksLeft = puzzle.flat().filter(v=>v==='?').length;

  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
      <div style={{display:'flex',alignItems:'center',gap:'7px',marginBottom:'6px',flexWrap:'wrap',justifyContent:'center'}}>
        <span style={{background:mode.color,color:'#fff',borderRadius:'3px',padding:'2px 9px',fontSize:'.67rem',fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase'}}>{mode.tierName}</span>
        <span style={{background:'#f0e8dc',color:'#3d2b1f',borderRadius:'3px',padding:'2px 9px',fontSize:'.67rem',fontWeight:700}}>{mode.name}</span>
        <span style={{fontSize:'.67rem',color:'#8a7360'}}>{N}x{N} · {blanksLeft} blank{blanksLeft!==1?'s':''}</span>
        {isExact&&<span style={{background:'#6a0a0a',color:'#fff',borderRadius:'3px',padding:'2px 9px',fontSize:'.67rem',fontWeight:700}}>T = {targetSum||mode.targetSum||39}</span>}
      </div>
      <div style={{fontSize:'.65rem',color:'#a09080',marginBottom:'12px'}}>Tap a blank cell to open the pad</div>

      <Board puzzle={puzzle} setPuzzle={setPuzzle} fixedCells={fixedCells} settings={settings} modeId={modeId}/>

      <div style={{display:'flex',gap:'10px',marginTop:'16px',flexWrap:'wrap',justifyContent:'center'}}>
        <button onClick={check} style={BTN('success')}>Check</button>
        <button onClick={onSolve} style={BTN('info')}>Solve</button>
      </div>

      {msg&&<div style={{marginTop:'10px',padding:'8px 16px',borderRadius:'4px',fontWeight:600,fontSize:'.85rem',
        background:msg.ok?'#e6f4ea':'#fdecea',color:msg.ok?'#2e7d45':'#b00020',
        border:`1px solid ${msg.ok?'#a8d5b5':'#f5c6c6'}`,maxWidth:'500px',textAlign:'center'}}>{msg.text}</div>}

      <div style={{marginTop:'20px',textAlign:'center'}}>
        <div style={SEC}>Candidates</div>
        <div style={{display:'flex',gap:'8px',justifyContent:'center'}}>
          {[['A',A_TYPE,'#1a5276'],['B',B_TYPE,'#7d4e00']].map(([label,group,color])=>{
            const gc=mode.cands.filter(n=>group.includes(n));
            if(!gc.length) return null;
            return (
              <div key={label} style={{display:'flex',flexDirection:'column',gap:'3px',alignItems:'center'}}>
                <div style={{fontSize:'.58rem',color,fontWeight:700}}>{label}-type</div>
                <div style={{display:'flex',gap:'3px'}}>
                  {gc.map(n=><span key={n} style={{width:'28px',height:'28px',border:'1px solid #c8b89a',borderRadius:'3px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.78rem',fontWeight:700,background:'#fff',color:'#3d2b1f'}}>{n}</span>)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════
   SOLVER VIEW
══════════════════════════════════════════════════ */
const SolverView = ({puzzle, modeId, targetSum, onClose}) => {
  const [solutions, setSolutions] = useState(null);
  const [running,   setRunning]   = useState(false);
  const N  = puzzle ? puzzle.length : 3;
  const px = Math.max(28, Math.min(46, Math.floor(160/N)));

  const run = () => {
    setRunning(true);
    setTimeout(()=>{setSolutions(solvePuzzle(puzzle,modeId));setRunning(false);},30);
  };

  return (
    <div style={PANEL}>
      <div style={PTITLE}>Solver — {MODES[modeId].name}</div>
      {puzzle&&puzzle.some(r=>r.includes('?'))
        ?<button style={BTN('info')} onClick={run} disabled={running}>{running?'Solving...':'Find Solutions'}</button>
        :<p style={PP}>No blank cells to solve.</p>}
      {solutions!==null&&(
        <div style={{marginTop:'16px'}}>
          {solutions.length===0
            ?<p style={PP}>No solutions found.</p>
            :<>
              <p style={{...PP,fontWeight:700}}>{solutions.length} solution{solutions.length!==1?'s':''}{solutions.length===6?' (capped)':''}:</p>
              <div style={{display:'flex',flexWrap:'wrap',gap:'12px',marginTop:'8px'}}>
                {solutions.map((sol,i)=>(
                  <div key={i}>
                    <div style={{fontSize:'.68rem',color:'#8a7360',marginBottom:'3px',fontWeight:700}}>#{i+1}</div>
                    <div style={{display:'grid',gridTemplateColumns:`repeat(${N},${px}px)`,gridTemplateRows:`repeat(${N},${px}px)`,gap:'3px'}}>
                      {sol.flat().map((v,j)=>(
                        <div key={j} style={{width:`${px}px`,height:`${px}px`,border:'1.5px solid #c8b89a',
                          background:A_TYPE.includes(v)?'#eaf1fb':'#fef9ec',
                          display:'flex',alignItems:'center',justifyContent:'center',
                          fontSize:`${Math.max(9,Math.floor(px*.38))}px`,fontWeight:700,
                          color:A_TYPE.includes(v)?'#1a5276':'#7d4e00',borderRadius:'2px'}}>{v}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p style={{...PP,fontSize:'.74rem',color:'#8a7360',marginTop:'8px'}}>Blue = A-type · Amber = B-type</p>
            </>}
        </div>
      )}
      <div style={{marginTop:'18px'}}><button style={BTN('primary')} onClick={onClose}>Back</button></div>
    </div>
  );
};

/* ══════════════════════════════════════════════════
   WALKTHROUGH VIEW  —  3-layer equation approach
   Layer 1: Ordinary Equations  (exact sum, direct algebra)
   Layer 2: Modular Equations   (digital root → mod 3)
   Layer 3: Constraint Equations (allowed set S)
══════════════════════════════════════════════════ */

// ── shared sub-components (only plain strings / numbers here, no JSX in data) ──
const EqBox = ({children}) => (
  <div style={{background:'#eaf1fb',border:'1px solid #bad0ef',borderRadius:'4px',
    padding:'8px 14px',margin:'6px 0',fontFamily:'monospace',fontSize:'.83rem',
    color:'#1a3a5c',lineHeight:'1.7',whiteSpace:'pre-wrap'}}>{children}</div>
);
const WorkLine = ({line}) => {
  const good = line.includes('ok') || line.includes('valid') || line.includes('✓');
  const bad  = line.includes('not allowed') || line.includes('✗') || line.includes('impossible') || line.includes('Contradiction') || line.includes('invalid');
  const arrow= line.trimStart().startsWith('→') || line.trimStart().startsWith('So') || line.trimStart().startsWith('Thus') || line.trimStart().startsWith('Hence');
  return (
    <div style={{padding:'3px 0 3px 8px',fontSize:'.82rem',lineHeight:'1.6',
      fontFamily:'monospace',borderBottom:'1px dotted #e8ddd0',
      fontWeight: bad||arrow ? 600 : 400,
      color: good?'#2e7d45': bad?'#b00020': arrow?'#1a5276': '#333'}}>
      {line}
    </div>
  );
};
const ResBox = ({children, ok=true}) => (
  <div style={{marginTop:'8px',padding:'7px 13px',borderRadius:'4px',fontWeight:700,fontSize:'.85rem',
    background:ok?'#e6f4ea':'#fdecea', border:`1px solid ${ok?'#a8d5b5':'#f5c6c6'}`,
    color:ok?'#2e7d45':'#b00020'}}>{children}</div>
);
const InfoBox = ({children, v='i'}) => {
  const bgs={i:'#eaf1fb',w:'#fef9ec',s:'#e6f4ea',n:'#fdf8f3'};
  const brd={i:'#bad0ef',w:'#f0d98a',s:'#a8d5b5',n:'#c8b89a'};
  return (
    <div style={{background:bgs[v],border:`1px solid ${brd[v]}`,borderRadius:'4px',
      padding:'8px 13px',margin:'6px 0',fontSize:'.84rem',lineHeight:'1.65',color:'#333'}}>
      {children}
    </div>
  );
};
const MiniGrid = ({cells, N}) => {
  const px = N===3?56: N===4?46:38;
  const fs = N===3?15: N===4?13:11;
  return (
    <div style={{display:'inline-grid',
      gridTemplateColumns:`repeat(${N},${px}px)`,
      gridTemplateRows:`repeat(${N},${px}px)`,
      gap:'3px',background:'#f5f2eb',padding:'7px',borderRadius:'5px',margin:'8px 0'}}>
      {cells.map((cell,i) => {
        const isBlank = typeof cell==='string' && /^[a-z]/.test(cell);
        const isA = A_TYPE.includes(cell), isB = B_TYPE.includes(cell);
        return (
          <div key={i} style={{width:`${px}px`,height:`${px}px`,
            background: isBlank?'#fff8e8': isA?'#eaf1fb': isB?'#fef9ec':'#fff',
            border:`2px ${isBlank?'dashed':'solid'} ${isBlank?'#d4a020': isA?'#bad0ef':'#f0d98a'}`,
            borderRadius:'3px',display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:`${fs}px`,fontWeight:700,
            color:isBlank?'#b04020': isA?'#1a3a5c':'#7d4e00'}}>
            {isBlank?`${cell}?`:cell}
          </div>
        );
      })}
    </div>
  );
};

// ── Step accordion (reusable) ──
const StepAccordion = ({steps, accent}) => {
  const [open,setOpen] = useState(0);
  return (
    <div style={{display:'flex',flexDirection:'column',gap:'5px'}}>
      {steps.map((step,i) => (
        <div key={i} style={{border:'1px solid #c8b89a',borderRadius:'5px',overflow:'hidden'}}>
          <div onClick={()=>setOpen(open===i?-1:i)}
            style={{display:'flex',alignItems:'center',justifyContent:'space-between',
              padding:'9px 14px',cursor:'pointer',userSelect:'none',
              background:open===i?accent:'#fdf8f3',
              color:open===i?'#fff':'#3d2b1f'}}>
            <span style={{fontWeight:700,fontSize:'.85rem'}}>{step.title}</span>
            <span style={{fontWeight:700,fontSize:'.9rem'}}>{open===i?'▲':'▼'}</span>
          </div>
          {open===i && (
            <div style={{padding:'14px 16px',background:'#fff'}}>
              {step.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ── The three-layer theory panel ──
const ThreeLayerPanel = () => (
  <div style={{display:'flex',flexDirection:'column',gap:'10px',marginBottom:'18px'}}>
    {[
      {num:'1',title:'Ordinary Equations',color:'#2e7d45',
       desc:'Direct algebra. x = T − a − b. These are the strongest constraints — they pin values exactly.',
       ex:'1 + 7 + x = 21  →  x = 13'},
      {num:'2',title:'Modular Equations',color:'#1a5276',
       desc:'Digital root rule → divisibility by 3 → congruence mod 3. These classify blanks into A-type or B-type.',
       ex:'x + 7 + 13 ≡ 0 (mod 3)  →  x ≡ 1 (mod 3)  →  x ∈ {1,7,13,19}'},
      {num:'3',title:'Constraint Equations',color:'#7d4e00',
       desc:'Domain restriction. Values must come from S = {1,5,7,11,13,17,19,23}. Eliminates algebraic solutions outside the set.',
       ex:'x = 25 → NOT in S → impossible\nx = 13 → in S ✓'},
    ].map(layer => (
      <div key={layer.num} style={{background:'#fff',border:`1.5px solid ${layer.color}`,borderRadius:'6px',padding:'12px 16px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'6px'}}>
          <span style={{background:layer.color,color:'#fff',borderRadius:'50%',width:'24px',height:'24px',
            display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'.85rem',flexShrink:0}}>
            {layer.num}
          </span>
          <span style={{fontWeight:700,color:layer.color,fontSize:'.95rem'}}>{layer.title}</span>
        </div>
        <p style={{...PP,marginBottom:'6px'}}>{layer.desc}</p>
        <div style={{fontFamily:'monospace',fontSize:'.8rem',color:'#555',background:'#f5f5f5',
          borderRadius:'3px',padding:'6px 10px',whiteSpace:'pre-wrap'}}>{layer.ex}</div>
      </div>
    ))}
  </div>
);

// ── Walkthrough tabs data ──
const WT_TABS = [
  { id:'intro',    label:'Overview' },
  { id:'layer1',   label:'1. Ordinary Eq' },
  { id:'layer2',   label:'2. Modular Eq' },
  { id:'layer3',   label:'3. Constraints' },
  { id:'combined', label:'4. Combined' },
  { id:'linear',   label:'5. Linear System' },
  { id:'outcomes', label:'6. Outcomes' },
  { id:'mindset',  label:'7. Mindset' },
];

const WalkthroughView = ({modeId, onClose}) => {
  const [tab, setTab] = useState('intro');

  const tabContent = {
    intro: (
      <div>
        <div style={{background:'#3d2b1f',color:'#fff',borderRadius:'6px',padding:'14px 18px',marginBottom:'16px'}}>
          <div style={{fontWeight:700,fontSize:'1rem',marginBottom:'6px'}}>The Core Idea</div>
          <div style={{fontSize:'.88rem',opacity:.93,lineHeight:'1.7'}}>
            Every missing cell is a variable. Every rule becomes an equation. The puzzle opens when you solve the system. Three types of equations work together — each one narrowing the answer further until only one possibility remains.
          </div>
        </div>
        <ThreeLayerPanel/>
        <InfoBox v='i'>
          <strong>Solving order:</strong> Always apply Layer 1 (ordinary equations) first — they are strongest and give exact values directly. Then Layer 2 (modular) to classify remaining blanks by type. Then Layer 3 (domain) to eliminate non-candidate answers. Cross-check across rows, columns, and diagonals last.
        </InfoBox>
        <div style={SEC}>The Allowed Set S</div>
        <p style={PP}>S = {'{'} 1, 5, 7, 11, 13, 17, 19, 23 {'}'} — the prime-wheel mod-24 residue set. These split into two families by mod-3 residue:</p>
        <div style={{display:'flex',gap:'14px',flexWrap:'wrap',marginBottom:'10px'}}>
          {[['A-type  ≡ 1 (mod 3)','#1a5276','#eaf1fb',A_TYPE],
            ['B-type  ≡ 2 (mod 3)','#7d4e00','#fef9ec',B_TYPE]].map(([label,color,bg,arr])=>(
            <div key={label} style={{background:bg,border:`1.5px solid ${color}`,borderRadius:'5px',padding:'10px 14px'}}>
              <div style={{fontSize:'.75rem',color,fontWeight:700,marginBottom:'6px'}}>{label}</div>
              <div style={{display:'flex',gap:'5px'}}>
                {arr.map(n=><span key={n} style={{width:'32px',height:'32px',border:`1px solid ${color}`,
                  borderRadius:'3px',display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:'.85rem',fontWeight:700,background:'#fff',color}}>{n}</span>)}
              </div>
            </div>
          ))}
        </div>
        <InfoBox v='w'>
          <strong>Key insight:</strong> A 3-cell line sums to a multiple of 3 ONLY if all three cells are from the same family (all A-type or all B-type). Mixed lines are ALWAYS invalid. This halves your search space instantly.
        </InfoBox>
      </div>
    ),

    layer1: (
      <div>
        <div style={{background:'#2e7d45',color:'#fff',borderRadius:'6px',padding:'13px 16px',marginBottom:'14px'}}>
          <div style={{fontWeight:700,fontSize:'.95rem',marginBottom:'4px'}}>Layer 1 — Ordinary Equations</div>
          <div style={{fontSize:'.85rem',opacity:.9}}>Direct algebra. x = T − a − b. These give exact values immediately when a target sum T is known.</div>
        </div>
        <p style={PP}><strong>Template:</strong> For a line [a, x, b] with target sum T:</p>
        <EqBox>a + x + b = T   →   x = T − a − b</EqBox>
        <p style={PP}>Check: is x in S = {'{'} 1, 5, 7, 11, 13, 17, 19, 23 {'}'} ? If not → contradiction.</p>
        <div style={SEC}>Worked Example 1 — All rows sum to 21</div>
        <MiniGrid N={3} cells={[1,7,'x', 13,'y',1, 'z',1,13]}/>
        <StepAccordion accent='#2e7d45' steps={[
          { title:'Row 1: solve x', content:(
            <div>
              <EqBox>1 + 7 + x = 21</EqBox>
              {['8 + x = 21','x = 13','13 ∈ S ✓'].map((l,i)=><WorkLine key={i} line={l}/>)}
              <ResBox>x = 13</ResBox>
            </div>)},
          { title:'Row 2: solve y', content:(
            <div>
              <EqBox>13 + y + 1 = 21</EqBox>
              {['14 + y = 21','y = 7','7 ∈ S ✓'].map((l,i)=><WorkLine key={i} line={l}/>)}
              <ResBox>y = 7</ResBox>
            </div>)},
          { title:'Row 3: solve z', content:(
            <div>
              <EqBox>z + 1 + 13 = 21</EqBox>
              {['z + 14 = 21','z = 7','7 ∈ S ✓'].map((l,i)=><WorkLine key={i} line={l}/>)}
              <ResBox>z = 7</ResBox>
            </div>)},
          { title:'Full solution', content:(
            <div>
              <MiniGrid N={3} cells={[1,7,13, 13,7,1, 7,1,13]}/>
              {['Row sums: 21, 21, 21 ✓','Col sums: 21, 15, 27 — divisible by 3 ✓'].map((l,i)=><WorkLine key={i} line={l}/>)}
              <ResBox>Unique solution. Pure algebra, no guessing.</ResBox>
            </div>)},
        ]}/>
        <div style={SEC}>Worked Example 2 — Contradiction proof</div>
        <MiniGrid N={3} cells={[1,'x',13, 'y',19,'z', 7,'w',1]}/>
        <p style={PP}>Rule: all rows and cols sum to exactly 21.</p>
        <StepAccordion accent='#2e7d45' steps={[
          { title:'Row 1: x = 7', content:(
            <div>
              <EqBox>1 + x + 13 = 21  →  x = 7</EqBox>
              <WorkLine line='x = 7 ✓'/>
            </div>)},
          { title:'Col 1: y = 13', content:(
            <div>
              <EqBox>1 + y + 7 = 21  →  y = 13</EqBox>
              <WorkLine line='y = 13 ✓'/>
            </div>)},
          { title:'Row 2 check → contradiction', content:(
            <div>
              <EqBox>13 + 19 + z = 21  →  z = −11</EqBox>
              {['z = −11','−11 ∉ S  →  not allowed ✗','→ Contradiction. This chamber has NO solution.'].map((l,i)=><WorkLine key={i} line={l}/>)}
              <ResBox ok={false}>No solution — Layer 1 equation proves impossibility.</ResBox>
            </div>)},
        ]}/>
        <InfoBox v='i'>Ordinary equations don't just find solutions — they also PROVE impossibility when they produce a value outside S. This is the fastest way to rule out a puzzle configuration.</InfoBox>
      </div>
    ),

    layer2: (
      <div>
        <div style={{background:'#1a5276',color:'#fff',borderRadius:'6px',padding:'13px 16px',marginBottom:'14px'}}>
          <div style={{fontWeight:700,fontSize:'.95rem',marginBottom:'4px'}}>Layer 2 — Modular Equations</div>
          <div style={{fontSize:'.85rem',opacity:.9}}>Digital root in {'{'} 3,6,9 {'}'} means divisible by 3 means sum ≡ 0 (mod 3). These equations classify blanks into A-type or B-type — instantly halving candidates from 8 to 4.</div>
        </div>
        <p style={PP}><strong>The key equivalence:</strong></p>
        <EqBox>{`DR(line sum) ∈ {3,6,9}
⟺  line sum divisible by 3
⟺  line sum ≡ 0 (mod 3)
⟺  (a + b + x) ≡ 0 (mod 3)
⟺  x ≡ −(a+b)  (mod 3)`}</EqBox>
        <p style={PP}><strong>What mod-3 residue means for S:</strong></p>
        <EqBox>{`x ≡ 1 (mod 3)  →  x ∈ A-type {1, 7, 13, 19}   (4 candidates)
x ≡ 2 (mod 3)  →  x ∈ B-type {5, 11, 17, 23}  (4 candidates)
x ≡ 0 (mod 3)  →  IMPOSSIBLE (no element of S has this residue)`}</EqBox>
        <div style={SEC}>Worked Example — Modular classification chain</div>
        <MiniGrid N={3} cells={[1,7,'x', 13,19,'y', 'z','w','t']}/>
        <StepAccordion accent='#1a5276' steps={[
          { title:'Row 1: classify x', content:(
            <div>
              <EqBox>1 + 7 + x ≡ 0 (mod 3)</EqBox>
              {['1 + 7 = 8.  8 mod 3 = 2','2 + x ≡ 0 (mod 3)','x ≡ 1 (mod 3)  →  A-type','x ∈ {1, 7, 13, 19}'].map((l,i)=><WorkLine key={i} line={l}/>)}
              <ResBox>x ∈ A-type {'{'} 1, 7, 13, 19 {'}'}</ResBox>
            </div>)},
          { title:'Row 2: classify y', content:(
            <div>
              <EqBox>13 + 19 + y ≡ 0 (mod 3)</EqBox>
              {['13 ≡ 1, 19 ≡ 1  →  1+1+y ≡ 0 (mod 3)','2 + y ≡ 0 (mod 3)','y ≡ 1 (mod 3)  →  A-type','y ∈ {1, 7, 13, 19}'].map((l,i)=><WorkLine key={i} line={l}/>)}
              <ResBox>y ∈ A-type {'{'} 1, 7, 13, 19 {'}'}</ResBox>
            </div>)},
          { title:'Column 1: classify z', content:(
            <div>
              <EqBox>1 + 13 + z ≡ 0 (mod 3)</EqBox>
              {['1 ≡ 1, 13 ≡ 1  →  1+1+z ≡ 0 (mod 3)','2 + z ≡ 0 (mod 3)','z ≡ 1 (mod 3)  →  A-type','z ∈ {1, 7, 13, 19}'].map((l,i)=><WorkLine key={i} line={l}/>)}
              <ResBox>z ∈ A-type {'{'} 1, 7, 13, 19 {'}'}</ResBox>
            </div>)},
          { title:'Row 3: t forced', content:(
            <div>
              <EqBox>z + w + t ≡ 0 (mod 3)</EqBox>
              {['z ≡ 1, w ≡ 1  →  1+1+t ≡ 0 (mod 3)','t ≡ 1 (mod 3)  →  A-type','→ The entire board must be filled from {1, 7, 13, 19}'].map((l,i)=><WorkLine key={i} line={l}/>)}
              <ResBox>All blanks ∈ A-type. Board locked to A-type family.</ResBox>
            </div>)},
        ]}/>
        <InfoBox v='w'>
          <strong>Modular equations give type, not value.</strong> After classifying all blanks as A-type or B-type, you still need Layer 1 (exact sums) or Layer 3 (domain restriction) to pick the specific value within those 4 candidates.
        </InfoBox>
        <div style={SEC}>The impossible mod-3 case</div>
        <EqBox>{`Row [1, 13, x]: both clues are A-type (≡1 mod 3)
1 + 13 + x ≡ 0 (mod 3)
1 + 1 + x ≡ 0 (mod 3)
x ≡ 1 (mod 3)  →  A-type  ✓

Row [7, 5, x]: A-type clue + B-type clue
1 + 2 + x ≡ 0 (mod 3)
3 + x ≡ 0 (mod 3)
x ≡ 0 (mod 3)  →  IMPOSSIBLE  ✗`}</EqBox>
        <ResBox ok={false}>A row with mixed A+B clues forces x ≡ 0 (mod 3), which has no solution in S.</ResBox>
      </div>
    ),

    layer3: (
      <div>
        <div style={{background:'#7d4e00',color:'#fff',borderRadius:'6px',padding:'13px 16px',marginBottom:'14px'}}>
          <div style={{fontWeight:700,fontSize:'.95rem',marginBottom:'4px'}}>Layer 3 — Constraint Equations</div>
          <div style={{fontSize:'.85rem',opacity:.9}}>x ∈ S = {'{'} 1,5,7,11,13,17,19,23 {'}'}. Every algebraically valid answer must also be in this set. Answers outside S are rejected — the equation system has no solution at that configuration.</div>
        </div>
        <p style={PP}><strong>The domain restriction written formally:</strong></p>
        <EqBox>{`For every blank x:  x ∈ S = {1, 5, 7, 11, 13, 17, 19, 23}

Equivalently:  x ∈ A-type {1,7,13,19}  OR  x ∈ B-type {5,11,17,23}
               (decided by Layer 2 modular equation)

After Layer 2 decides the type, Layer 3 restricts to 4 specific candidates.
A specific value is then forced by Layer 1 (exact sum) if a target T is given.`}</EqBox>
        <div style={SEC}>Three-layer filter in action</div>
        <StepAccordion accent='#7d4e00' steps={[
          { title:'Start: 8 possibilities', content:(
            <div>
              <p style={PP}>Before any equation: x can be any of 8 values.</p>
              <div style={{display:'flex',gap:'4px',flexWrap:'wrap'}}>
                {ALL_CANDS.map(n=><span key={n} style={{width:'32px',height:'32px',border:'1px solid #c8b89a',borderRadius:'3px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.82rem',fontWeight:700,background:'#fff',color:'#3d2b1f'}}>{n}</span>)}
              </div>
            </div>)},
          { title:'Layer 2 applied: 4 possibilities', content:(
            <div>
              <p style={PP}>Modular equation says x ≡ 1 (mod 3). Only A-type remains.</p>
              <div style={{display:'flex',gap:'4px'}}>
                {A_TYPE.map(n=><span key={n} style={{width:'32px',height:'32px',border:'1.5px solid #1a5276',borderRadius:'3px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.82rem',fontWeight:700,background:'#eaf1fb',color:'#1a5276'}}>{n}</span>)}
              </div>
            </div>)},
          { title:'Layer 1 applied: 1 possibility', content:(
            <div>
              <p style={PP}>Exact sum equation: 1 + x + 7 = 21  →  x = 13.</p>
              <div style={{display:'flex',gap:'4px'}}>
                {[13].map(n=><span key={n} style={{width:'40px',height:'40px',border:'2px solid #2e7d45',borderRadius:'4px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem',fontWeight:700,background:'#e6f4ea',color:'#2e7d45'}}>{n}</span>)}
              </div>
              <ResBox>x = 13. Fully determined by all three layers.</ResBox>
            </div>)},
          { title:'Layer 3 rejects invalid answers', content:(
            <div>
              <EqBox>{`If exact sum gives x = 25:
25 ∉ S  →  REJECTED  ✗
This row/col arrangement has no solution.

If exact sum gives x = 13:
13 ∈ S  →  ACCEPTED  ✓`}</EqBox>
              <InfoBox v='w'>Layer 3 is the final filter. An algebraic answer is only valid if it lands in S. If it doesn't, the puzzle is unsolvable at that cell.</InfoBox>
            </div>)},
        ]}/>
      </div>
    ),

    combined: (
      <div>
        <div style={{background:'#3d2b1f',color:'#fff',borderRadius:'6px',padding:'13px 16px',marginBottom:'14px'}}>
          <div style={{fontWeight:700,fontSize:'.95rem',marginBottom:'4px'}}>All Three Layers Together</div>
          <div style={{fontSize:'.85rem',opacity:.9}}>The full system: ordinary equations + modular congruences + domain restrictions. Each layer eliminates possibilities until the answer is forced — or a contradiction is found.</div>
        </div>
        <div style={SEC}>The General System for a 3×3 Chamber</div>
        <EqBox>{`Variables: unknowns a,b,...,i  (known cells are constants)

Layer 1 — if row target T given:
  row1: a+b+c = T
  row2: d+e+f = T
  row3: g+h+i = T
  col1: a+d+g = T   col2: b+e+h = T   col3: c+f+i = T
  diag1: a+e+i = T  diag2: c+e+g = T

Layer 2 — digital root / divisibility:
  a+b+c ≡ 0 (mod 3)
  a+d+g ≡ 0 (mod 3)   [etc for all active lines]

Layer 3 — domain:
  x ∈ {1, 5, 7, 11, 13, 17, 19, 23}  for every blank x`}</EqBox>
        <div style={SEC}>Deep worked example — 3 variables, all layers</div>
        <MiniGrid N={3} cells={[1,'x',13, 'y',7,'z', 7,'w',1]}/>
        <p style={PP}>Rules: all row sums = 21, all col sums divisible by 3.</p>
        <StepAccordion accent='#3d2b1f' steps={[
          { title:'Layer 1: solve x from row 1', content:(
            <div>
              <EqBox>1 + x + 13 = 21  →  x = 7</EqBox>
              {['x = 7.  7 ∈ S ✓'].map((l,i)=><WorkLine key={i} line={l}/>)}
              <ResBox>x = 7</ResBox>
            </div>)},
          { title:'Layer 1: solve w from row 3', content:(
            <div>
              <EqBox>7 + w + 1 = 21  →  w = 13</EqBox>
              {['w = 13.  13 ∈ S ✓'].map((l,i)=><WorkLine key={i} line={l}/>)}
              <ResBox>w = 13</ResBox>
            </div>)},
          { title:'Layer 1: row 2 gives y + z = 14', content:(
            <div>
              <EqBox>y + 7 + z = 21  →  y + z = 14</EqBox>
              {['Two unknowns, one equation — not yet unique.','Need column equations to resolve.'].map((l,i)=><WorkLine key={i} line={l}/>)}
            </div>)},
          { title:'Layer 2: column 1 classifies y', content:(
            <div>
              <EqBox>1 + y + 7 ≡ 0 (mod 3)</EqBox>
              {['8 + y ≡ 0 (mod 3)','2 + y ≡ 0 (mod 3)','y ≡ 1 (mod 3)  →  A-type','y ∈ {1, 7, 13, 19}'].map((l,i)=><WorkLine key={i} line={l}/>)}
              <ResBox>y ∈ A-type</ResBox>
            </div>)},
          { title:'Layer 2: column 3 classifies z', content:(
            <div>
              <EqBox>13 + z + 1 ≡ 0 (mod 3)</EqBox>
              {['14 + z ≡ 0 (mod 3)','2 + z ≡ 0 (mod 3)','z ≡ 1 (mod 3)  →  A-type','z ∈ {1, 7, 13, 19}'].map((l,i)=><WorkLine key={i} line={l}/>)}
              <ResBox>z ∈ A-type</ResBox>
            </div>)},
          { title:'Layer 3: find y and z with y+z=14, both A-type', content:(
            <div>
              <EqBox>{`y + z = 14,  both A-type:
  1 + 13 = 14  ✓
  13 + 1 = 14  ✓
  7 + 7  = 14  ✓`}</EqBox>
              {['Three solutions exist: (y=1,z=13), (y=13,z=1), (y=7,z=7)','This chamber is multi-solution (underdetermined).'].map((l,i)=><WorkLine key={i} line={l}/>)}
              <ResBox ok={false}>Multiple solutions — add diagonal constraint to get uniqueness.</ResBox>
            </div>)},
          { title:'Adding diagonal to force uniqueness', content:(
            <div>
              <EqBox>Main diagonal: 1 + 7 + 1 = 9 ≠ 21  (oops — need to check which diag)
Anti-diagonal: 13 + 7 + 7 = 27  divisible by 3 ✓
Main diagonal:  1 + 7 + 1 = 9   divisible by 3 ✓</EqBox>
              <p style={PP}>Adding exact diagonal sum = 21: main diag = 1+7+z = 21 → z = 13.</p>
              {['z = 13  →  y = 14 − 13 = 1','y=1, z=13.  Check: y ∈ A-type ✓, z ∈ A-type ✓'].map((l,i)=><WorkLine key={i} line={l}/>)}
              <ResBox>Unique solution when diagonal target added: y=1, z=13.</ResBox>
            </div>)},
        ]}/>
      </div>
    ),

    linear: (
      <div>
        <div style={{background:'linear-gradient(135deg,#2e7d45,#1a5276)',color:'#fff',
          borderRadius:'8px',padding:'16px 20px',marginBottom:'18px'}}>
          <div style={{fontWeight:700,fontSize:'1rem',marginBottom:'6px'}}>
            Solving with a Linear Equation System
          </div>
          <div style={{fontSize:'.88rem',opacity:.92,lineHeight:'1.7'}}>
            A linear equation system uses equations where unknowns appear only to the first power — added or subtracted, never multiplied together. When the puzzle rule is linear, you can solve it like school algebra: write equations, substitute, solve for x.
          </div>
        </div>

        {/* What is linear vs not */}
        <div style={SEC}>What counts as linear?</div>
        <div style={{display:'flex',gap:'10px',flexWrap:'wrap',marginBottom:'16px'}}>
          <div style={{flex:1,minWidth:'200px',background:'#e6f4ea',border:'1.5px solid #2e7d45',
            borderRadius:'6px',padding:'12px 14px'}}>
            <div style={{fontWeight:700,color:'#2e7d45',fontSize:'.84rem',marginBottom:'8px'}}>
              Linear ✓ — can use algebra
            </div>
            {['x + y = 10','x - 11 = 6   →   x = 17','a + b + c = T   (sum rule)','b = a + 6   (pattern rule)','c = a   (copy rule)'].map((l,i)=>(
              <div key={i} style={{fontFamily:'monospace',fontSize:'.8rem',padding:'2px 0',
                color:'#2e7d45',borderBottom:'1px dotted #a8d5b5'}}>{l}</div>
            ))}
          </div>
          <div style={{flex:1,minWidth:'200px',background:'#fdecea',border:'1.5px solid #c0392b',
            borderRadius:'6px',padding:'12px 14px'}}>
            <div style={{fontWeight:700,color:'#c0392b',fontSize:'.84rem',marginBottom:'8px'}}>
              Not linear ✗ — need other methods
            </div>
            {['x × y = 7   (product of unknowns)','x² + y = 4   (square of unknown)','x mod 24 = 1   (modular product)','a · b ≡ c (mod 24)'].map((l,i)=>(
              <div key={i} style={{fontFamily:'monospace',fontSize:'.8rem',padding:'2px 0',
                color:'#c0392b',borderBottom:'1px dotted #f5c6c6'}}>{l}</div>
            ))}
          </div>
        </div>
        <InfoBox v="i">
          In this puzzle, the <strong>divisibility rule</strong> (row sum divisible by 3) is linear — it uses addition only. The <strong>exact sum rule</strong> (Exact Sum mode) is also linear: x = T − a − b. These modes are naturally solved as linear systems.
        </InfoBox>

        {/* Worked example 1 - simple */}
        <div style={SEC}>Example 1 — One unknown per row (simplest case)</div>
        <MiniGrid N={3} cells={[1,7,'x', 13,'y',1, 'z',1,13]}/>
        <p style={PP}>Rule: every row sums to exactly 21. One unknown per row — each row gives one equation directly.</p>
        <EqBox>{`Row 1:   1 + 7 + x = 21   →   x = 21 − 1 − 7   →   x = 13
Row 2:  13 + y + 1 = 21   →   y = 21 − 13 − 1  →   y = 7
Row 3:   z + 1 + 13 = 21  →   z = 21 − 1 − 13  →   z = 7`}</EqBox>
        <ResBox>x = 13,  y = 7,  z = 7   — three independent equations, solved instantly</ResBox>

        {/* Matrix form */}
        <div style={SEC}>The same system written as a matrix</div>
        <p style={PP}>When every unknown appears in only one equation, the matrix is the identity — each variable equals its solution directly:</p>
        <EqBox>{`[ 1  0  0 ] [ x ]   [ 13 ]
[ 0  1  0 ] [ y ] = [  7 ]
[ 0  0  1 ] [ z ]   [  7 ]

→  x = 13,  y = 7,  z = 7`}</EqBox>
        <p style={PP}>This looks trivial, but larger puzzles with shared unknowns produce non-identity matrices that require proper linear algebra to solve.</p>

        {/* Worked example 2 - coupled */}
        <div style={SEC}>Example 2 — Coupled equations (unknown appears in row AND column)</div>
        <MiniGrid N={3} cells={[1,'x',13, 'y',7,'z', 7,'w',1]}/>
        <p style={PP}>Rule: every row sums to 21. Every column sums to 21.</p>
        <EqBox>{`Row equations:
  Row 1:  1 + x + 13 = 21   →   x = 7
  Row 2:  y + 7 + z  = 21   →   y + z = 14
  Row 3:  7 + w + 1  = 21   →   w = 13

Column equations:
  Col 1:  1 + y + 7  = 21   →   y = 13
  Col 2:  x + 7 + w  = 21   →   7 + 7 + 13 = 27  ✗  (contradiction!)
`}</EqBox>
        <ResBox ok={false}>Contradiction — no solution exists. The column equation disproves the arrangement.</ResBox>
        <InfoBox v="w">
          <strong>This is the power of the linear system:</strong> it doesn&apos;t just find solutions — it PROVES impossibility. When an equation gives a contradiction (27 ≠ 21), you know for certain no solution exists, without guessing.
        </InfoBox>

        {/* Worked example 3 - solvable coupled */}
        <div style={SEC}>Example 3 — Coupled system that DOES have a solution</div>
        <MiniGrid N={3} cells={[1,'x',13, 'y',7,'z', 7,'w',13]}/>
        <p style={PP}>Rule: every row sums to 21. Column sums must be divisible by 3.</p>
        <EqBox>{`Row equations:
  Row 1:  1 + x + 13 = 21   →   x = 7
  Row 3:  7 + w + 13 = 21   →   w = 1
  Row 2:  y + 7 + z  = 21   →   y + z = 14   (two unknowns — need column)

Column equations:
  Col 1:  1 + y + 7 ≡ 0 (mod 3)   →   8 + y ≡ 0   →   y ≡ 1 (mod 3)  →  y ∈ A-type
  Col 3: 13 + z + 13 ≡ 0 (mod 3)  →  26 + z ≡ 0   →   z ≡ 1 (mod 3)  →  z ∈ A-type

Combine:  y + z = 14,  both A-type  →  (y=1,z=13)  (y=7,z=7)  (y=13,z=1)`}</EqBox>
        <ResBox>Multiple solutions — the system is underdetermined. Add more constraints (e.g. diagonal = 21) to get uniqueness.</ResBox>

        {/* Adding diagonal */}
        <div style={SEC}>Adding a diagonal equation to force uniqueness</div>
        <EqBox>{`Main diagonal:  1 + 7 + z = 21   →   z = 13
Then:  y = 14 − z = 14 − 13 = 1

Check: y = 1 ∈ A-type ✓,  z = 13 ∈ A-type ✓`}</EqBox>
        <ResBox>y = 1,  z = 13   — unique solution once diagonal constraint added</ResBox>

        {/* Pattern rules */}
        <div style={SEC}>Pattern rules also give linear equations</div>
        <p style={PP}>Some puzzles have a structural pattern instead of a sum target. These also produce linear equations:</p>
        <EqBox>{`Pattern: middle cell = left cell + 6,  right cell = left cell
Written as linear equations:
  b − a = 6   (or:  b = a + 6)
  c − a = 0   (or:  c = a)

Example: row starts with 11, find b and c:
  b − 11 = 6   →   b = 17
  c − 11 = 0   →   c = 11`}</EqBox>
        <MiniGrid N={3} cells={[11,17,11, 11,'b','c', 11,'d','e']}/>
        <p style={PP}>Applying to rows 2 and 3 (each starting with 11):</p>
        <EqBox>{`Row 2:  b = 11 + 6 = 17,   c = 11
Row 3:  d = 11 + 6 = 17,   e = 11`}</EqBox>
        <ResBox>b = 17, c = 11, d = 17, e = 11 — pure linear algebra</ResBox>

        {/* When linear doesn't apply */}
        <div style={SEC}>When the linear approach does NOT apply</div>
        <InfoBox v="w">
          The divisibility rule in this game (row sum ÷ 3) is linear — it works perfectly with the methods above. But some harder variants use non-linear rules:
        </InfoBox>
        {[
          {rule:'Multiplicative mode', why:'Row PRODUCT has digital root in {3,6,9}. Products of unknowns (a×b×x) are nonlinear.'},
          {rule:'Mod-24 prime wheel', why:'x mod 24 ∈ prime wheel is a discrete membership constraint, not a linear equation.'},
          {rule:'Candidate set membership', why:'x ∈ {1,5,7,11,13,17,19,23} is a domain restriction, not algebra.'},
        ].map(item=>(
          <div key={item.rule} style={{display:'flex',gap:'10px',padding:'8px 12px',marginBottom:'6px',
            background:'#fff',border:'1px solid #e0d6c8',borderRadius:'4px'}}>
            <span style={{color:'#c0392b',fontWeight:700,minWidth:'16px'}}>✗</span>
            <div>
              <div style={{fontWeight:700,fontSize:'.83rem',color:'#3d2b1f',marginBottom:'2px'}}>{item.rule}</div>
              <div style={{fontSize:'.8rem',color:'#666',lineHeight:'1.4'}}>{item.why}</div>
            </div>
          </div>
        ))}
        <p style={PP}>For these, use the modular equation approach (Layer 2) or constraint satisfaction (Layer 3) instead.</p>

        {/* Summary */}
        <div style={{background:'#1a3a5c',color:'#fff',borderRadius:'6px',padding:'14px 18px',marginTop:'8px'}}>
          <div style={{fontWeight:700,marginBottom:'8px',fontSize:'.9rem'}}>Linear System — Decision Checklist</div>
          {[
            ['Is the rule based on sums/differences only?', 'Yes → use linear equations'],
            ['Does the puzzle have an exact target T?', 'Yes → x = T − a − b directly'],
            ['Does any row/col have only one unknown?', 'Yes → solve that first, substitute'],
            ['Are unknowns coupled across rows and cols?', 'Yes → set up system, solve simultaneously'],
            ['Does the rule use products or modular ops?', 'Yes → switch to modular/constraint methods'],
          ].map(([q,a],i)=>(
            <div key={i} style={{display:'flex',gap:'10px',padding:'4px 0',borderBottom:'1px solid rgba(255,255,255,.15)',
              fontSize:'.81rem',lineHeight:'1.5'}}>
              <span style={{opacity:.7,minWidth:'220px'}}>{q}</span>
              <span style={{fontWeight:700,color:'#a8d5b5'}}>{a}</span>
            </div>
          ))}
        </div>
      </div>
    ),

    outcomes: (
      <div>
        <div style={{background:'#6a0a0a',color:'#fff',borderRadius:'6px',padding:'13px 16px',marginBottom:'14px'}}>
          <div style={{fontWeight:700,fontSize:'.95rem',marginBottom:'4px'}}>Three Possible Outcomes</div>
          <div style={{fontSize:'.85rem',opacity:.9}}>Every chamber has exactly one of these outcomes: unique solution, multiple solutions, or no solution. Equations tell you which.</div>
        </div>
        {[
          { title:'Outcome 1 — Unique Solution', color:'#2e7d45', bg:'#e6f4ea',
            desc:'The equation system has exactly one set of values satisfying all layers simultaneously.',
            when:'Enough constraints: rows + cols + diagonals with exact target T.',
            ex:'T=21 puzzle with diagonal constraint → unique y=1, z=13.' },
          { title:'Outcome 2 — Multiple Solutions', color:'#1a5276', bg:'#eaf1fb',
            desc:'The equation system is underdetermined — more valid configurations exist.',
            when:'Only divisibility (no exact T). Modular equations narrow type but not value.',
            ex:'y+z=14, both A-type → (1,13), (13,1), (7,7) all valid.' },
          { title:'Outcome 3 — No Solution', color:'#b00020', bg:'#fdecea',
            desc:'The equation system produces a contradiction: a required value is outside S, or mod-3 forces x ≡ 0.',
            when:'Mixed A/B clues in a line, or exact sum forces a non-candidate answer.',
            ex:'y + 8 = 21, y = −11. Not in S. Contradiction.' },
        ].map(o => (
          <div key={o.title} style={{background:o.bg,border:`1.5px solid ${o.color}`,borderRadius:'5px',padding:'12px 16px',marginBottom:'10px'}}>
            <div style={{fontWeight:700,color:o.color,fontSize:'.9rem',marginBottom:'5px'}}>{o.title}</div>
            <p style={{...PP,marginBottom:'4px'}}>{o.desc}</p>
            <p style={{...PP,fontSize:'.82rem',color:'#555',marginBottom:'4px'}}><strong>When:</strong> {o.when}</p>
            <div style={{fontFamily:'monospace',fontSize:'.8rem',color:'#555',background:'rgba(255,255,255,.6)',
              borderRadius:'3px',padding:'5px 9px'}}>{o.ex}</div>
          </div>
        ))}
        <InfoBox v='i'>
          <strong>Equation-based solving always identifies the outcome.</strong> If you reach a contradiction → no solution. If all variables are uniquely determined → unique. If some variables have multiple valid values → multiple solutions. No guessing needed.
        </InfoBox>
      </div>
    ),

    mindset: (
      <div>
        <div style={{background:'#3d2b1f',color:'#fff',borderRadius:'6px',padding:'13px 16px',marginBottom:'14px'}}>
          <div style={{fontWeight:700,fontSize:'.95rem',marginBottom:'4px'}}>The Solving Mindset</div>
          <div style={{fontSize:'.85rem',opacity:.9}}>Think in this order every time. This sequence maximises speed and minimises wrong moves.</div>
        </div>
        {[
          {n:'First', color:'#2e7d45', text:'Check residue type mod 3. Is each row forcing blanks to be A-type or B-type? If mixed clues → unsolvable immediately.'},
          {n:'Second', color:'#1a5276', text:'Apply exact sum equations if a target T is known. These give direct values: x = T − a − b. Check each result is in S.'},
          {n:'Third', color:'#7d4e00', text:'Cross-check rows, columns, and diagonals. A value that solves one row may break a column. All active lines must be satisfied simultaneously.'},
          {n:'Fourth', color:'#6a0a0a', text:'Decide the outcome: impossible (contradiction found), unique (all blanks forced), or multiple (underdetermined — add constraints or accept any valid fill).'},
        ].map(step => (
          <div key={step.n} style={{display:'flex',gap:'12px',marginBottom:'10px',padding:'12px 14px',
            background:'#fff',border:`1px solid #e0d6c8`,borderRadius:'5px'}}>
            <span style={{background:step.color,color:'#fff',borderRadius:'3px',padding:'2px 10px',
              fontSize:'.75rem',fontWeight:700,letterSpacing:'.04em',height:'fit-content',whiteSpace:'nowrap'}}>
              {step.n}
            </span>
            <span style={{fontSize:'.85rem',color:'#333',lineHeight:'1.6'}}>{step.text}</span>
          </div>
        ))}
        <div style={SEC}>One-sentence summary</div>
        <div style={{background:'#1a3a5c',color:'#fff',borderRadius:'6px',padding:'14px 18px',
          fontStyle:'italic',fontSize:'.9rem',lineHeight:'1.7',marginBottom:'12px'}}>
          "The game is solved by turning missing cells into variables and solving: ordinary equations + modular equations + allowed-set restrictions."
        </div>
        <InfoBox v='i'>
          This puzzle is not mystical at the solving level. It is a blend of <strong>linear algebra</strong>, <strong>modular arithmetic</strong>, and <strong>constraint satisfaction</strong>. The symbolic flavor comes from the story and geometry. But underneath, the chamber opens because you solved a structured mathematical system.
        </InfoBox>
      </div>
    ),
  };

  return (
    <div style={{...PANEL, maxWidth:'720px'}}>
      <div style={PTITLE}>Gameplay Walkthrough — Equation Method</div>

      {/* Tab bar */}
      <div style={{display:'flex',gap:'5px',flexWrap:'wrap',marginBottom:'18px'}}>
        {WT_TABS.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            background: tab===t.id ? '#3d2b1f' : '#f0e8dc',
            color:      tab===t.id ? '#fff'    : '#3d2b1f',
            border:'1.5px solid #3d2b1f', borderRadius:'3px',
            padding:'4px 11px', cursor:'pointer', fontFamily:'inherit',
            fontSize:'.74rem', fontWeight:700,
          }}>{t.label}</button>
        ))}
      </div>

      {tabContent[tab]}

      <div style={{marginTop:'20px'}}>
        <button style={BTN('primary')} onClick={onClose}>Back to Game</button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════
   SOLVE FOR X VIEW  — per-mode equation reference
══════════════════════════════════════════════════ */
const SFX_DATA = {
  rowsOnly:{
    formula:'Row: (known1 + known2 + x) ≡ 0 (mod 3)\nx ≡ −(known1 + known2)  (mod 3)\n\nIf result ≡ 1  →  x ∈ A-type {1,7,13,19}\nIf result ≡ 2  →  x ∈ B-type {5,11,17,23}\nIf result ≡ 0  →  IMPOSSIBLE',
    exGrid:[[7,13,'x'],[5,11,'y'],['z',1,19]],
    steps:[
      {label:'Row 1: solve x',eq:'7 + 13 + x ≡ 0 (mod 3)',
       work:['7+13=20.  20 mod 3 = 2','Need x ≡ 1 (mod 3)  →  A-type','x ∈ {1, 7, 13, 19}'],result:'x ∈ A-type {1,7,13,19}'},
      {label:'Row 2: solve y',eq:'5 + 11 + y ≡ 0 (mod 3)',
       work:['5+11=16.  16 mod 3 = 1','Need y ≡ 2 (mod 3)  →  B-type','y ∈ {5, 11, 17, 23}'],result:'y ∈ B-type {5,11,17,23}'},
      {label:'Row 3: solve z',eq:'z + 1 + 19 ≡ 0 (mod 3)',
       work:['1+19=20.  20 mod 3 = 2','Need z ≡ 1 (mod 3)  →  A-type','z ∈ {1, 7, 13, 19}'],result:'z ∈ A-type {1,7,13,19}'},
    ],
  },
  rowsAndCols:{
    formula:'Row: x ≡ −(row knowns)  (mod 3)\nCol: x ≡ −(col knowns)  (mod 3)\nBoth must agree on residue class.\nConflict (A-row, B-col) → IMPOSSIBLE.\nIf agree → use exact sums to pick specific value.',
    exGrid:[['x',7,13],[19,'y',1],[13,23,'z']],
    steps:[
      {label:'Type for x: row AND col',eq:'Row: x mod 3 = ? from {7,13}.  Col: x mod 3 = ? from {19,13}.',
       work:['Row 0: 7(A)+13(A) → row needs A-type (residue 1)','Col 0: 19(A)+13(A) → col needs A-type (residue 1)','Both agree: x ≡ 1 (mod 3)  →  A-type'],result:'x ∈ A-type {1,7,13,19}'},
      {label:'Conflict example',eq:'If row clues are A-type and col clues are B-type:',
       work:['Row: x ≡ 1 (mod 3)','Col: x ≡ 2 (mod 3)','No x satisfies both simultaneously  →  IMPOSSIBLE'],result:'CONFLICT → no solution at this cell'},
    ],
  },
  standardDR:{
    formula:'DR(a + b + x) ∈ {3,6,9}\n⟺  (a+b+x) ≡ 0 (mod 3)\n⟺  x ≡ −(a+b)  (mod 3)\n\nCompute DR for verification:\nDR(n) = 1 + (n−1) mod 9  for n > 0',
    exGrid:[[7,'x',13],[5,17,'y'],['z',11,23]],
    steps:[
      {label:'Row 1 for x',eq:'DR(7 + x + 13) ∈ {3,6,9}',
       work:['7+13=20.  Need DR(20+x) ∈ {3,6,9}','DR in {3,6,9} ↔ divisible by 3','20 mod 3=2.  x ≡ 1 (mod 3)  →  A-type','x=1: DR(21)=3 ✓  x=7: DR(27)=9 ✓  x=13: DR(33)=6 ✓  x=19: DR(39)=3 ✓'],result:'x ∈ A-type — all 4 pass DR check'},
    ],
  },
  withDiagonals:{
    formula:'Row:  x ≡ −(row knowns)  (mod 3)\nCol:  x ≡ −(col knowns)  (mod 3)\nDiag: x ≡ −(diag knowns) (mod 3)  [if x is on that diagonal]\nAll must agree → type → then exact sum for specific value.',
    exGrid:[[1,'x',13],['y',19,'z'],[7,13,1]],
    steps:[
      {label:'x at (0,1): row + col only',eq:'Row: 1+x+13 ≡ 0. Col: x+19+13 ≡ 0.',
       work:['Row: 1+13=14. 14 mod 3=2. x ≡ 1. A-type.','Col: 19+13=32. 32 mod 3=2. x ≡ 1. A-type.','Both agree: x ∈ A-type.'],result:'x ∈ A-type {1,7,13,19}'},
      {label:'y at (1,0): row + col + anti-diagonal',eq:'Col 0: 1+y+7 ≡ 0. Anti-diag: 13+19+y ≡ 0.',
       work:['Col 0: 1+7=8. 8 mod 3=2. y ≡ 1. A-type.','Anti-diag: 13+19=32. 32 mod 3=2. y ≡ 1. A-type.','Both agree. y ∈ A-type.'],result:'y ∈ A-type'},
    ],
  },
  aTypeOnly:{
    formula:'Candidates: {1,7,13,19} — all ≡ 1 (mod 3)\nDivisibility: AUTOMATIC  (1+1+1=3 ≡ 0)\n\nTo find specific value:\n  Row sum: known1 + known2 + x = row_sum\n  x = row_sum − known1 − known2\n  Check: x ∈ {1,7,13,19}?',
    exGrid:[[1,'x',13],['y',19,'z'],[7,13,'w']],
    steps:[
      {label:'Divisibility is automatic',eq:'Any 3 values from {1,7,13,19}: 1+1+1=3, always div 3.',
       work:['All A-type → divisibility always satisfied.','Focus on EXACT sums and column constraints to narrow from 4 to 1.'],result:'Divisibility automatic — use exact sums'},
    ],
  },
  bTypeOnly:{
    formula:'Candidates: {5,11,17,23} — all ≡ 2 (mod 3)\nDivisibility: AUTOMATIC  (2+2+2=6 ≡ 0)\n\nTo find specific value:\n  x = row_sum − known1 − known2\n  Check: x ∈ {5,11,17,23}?',
    exGrid:[[5,'x',17],['y',23,'z'],[11,17,'w']],
    steps:[
      {label:'B-type arithmetic',eq:'2+2+2=6. Any 3 B-type values sum to multiple of 3.',
       work:['All B-type → divisibility always satisfied.','Use exact sums to find specific value from {5,11,17,23}.'],result:'Divisibility automatic — use exact sums'},
    ],
  },
  mixedResidues:{
    formula:'Phase 1 — Type (Layer 2):\n  Row type from clue badges → blank row type\n  Col type from clue badges → blank col type\n  Conflict → IMPOSSIBLE\n\nPhase 2 — Value (Layer 1):\n  x = target_sum − known1 − known2\n  Verify x ∈ S (Layer 3)',
    exGrid:[[1,'x',13],[5,'y',11],['z',7,19]],
    steps:[
      {label:'Phase 1: classify x',eq:'Row 0 badges: 1(A),13(A). Col 1 badge: 7(A).',
       work:['Row wants A-type. Col wants A-type.','Both agree: x ∈ A-type.'],result:'x ∈ A-type (Phase 1)'},
      {label:'Phase 2: find exact x',eq:'Row: 1 + x + 13 = target_sum',
       work:['With T=21: x = 21-1-13 = 7. 7 ∈ S ✓','With T=33: x = 33-1-13 = 19. 19 ∈ S ✓','Exact value depends on which target T the mode uses.'],result:'x determined by row+col exact sum'},
    ],
  },
  exactSum:{
    formula:'Every line sum = T  (target shown in puzzle)\n\nFor blank x with knowns a, b in same line:\n  x = T − a − b\nCheck: x ∈ S = {1,5,7,11,13,17,19,23}?\n  Yes → x is determined  ✓\n  No  → CONTRADICTION  ✗\n\nSolve all rows, then verify all cols and diags.',
    exGrid:[[1,19,'x'],[13,'y',7],['z',1,19]],
    steps:[
      {label:'Row 1: x (T=39)',eq:'1 + 19 + x = 39  →  x = 19',
       work:['x = 39 − 1 − 19 = 19.  19 ∈ S ✓'],result:'x = 19'},
      {label:'Row 2: y (T=39)',eq:'13 + y + 7 = 39  →  y = 19',
       work:['y = 39 − 13 − 7 = 19.  19 ∈ S ✓'],result:'y = 19'},
      {label:'Row 3: z (T=39)',eq:'z + 1 + 19 = 39  →  z = 19',
       work:['z = 39 − 1 − 19 = 19.  19 ∈ S ✓'],result:'z = 19'},
      {label:'Column verification',eq:'Col 1: 1+13+19=33 ≠ 39  ✗',
       work:['Rows alone do not guarantee columns.','Must verify all column and diagonal sums too.','This arrangement fails col check — generator produces valid grids.'],result:'Always verify ALL lines after solving rows'},
    ],
  },
  symmetryMode:{
    formula:'Rotational symmetry: M[r][c] = M[N-1-r][N-1-c]\nFor 3×3: corners paired, edges paired, center = self.\n\nSymmetric row [a, b, a]: sum = 2a + b\n  Layer 2: 2a + b ≡ 0 (mod 3)  →  a and b same type\n  Layer 1: if T given: 2a + b = T  →  a = (T−b)/2\n    Must be integer AND in S.',
    exGrid:[['a',7,'a'],['b',19,'b'],['c',13,'c']],
    steps:[
      {label:'Mod-3 for symmetric row [a,7,a]',eq:'2a + 7 ≡ 0 (mod 3)',
       work:['7 mod 3=1.  2a ≡ −1 ≡ 2 (mod 3)','a ≡ 1 (mod 3)  →  A-type','a ∈ {1,7,13,19}'],result:'a ∈ A-type — same type as b=7'},
      {label:'Exact sum for a (T=39)',eq:'2a + 7 = 39  →  a = 16',
       work:['a = (39−7)/2 = 16.  16 ∉ S  ✗','Try b=13: a=(39−13)/2=13. 13 ∈ S ✓','Try b=1:  a=(39−1)/2=19. 19 ∈ S ✓'],result:'b=13→a=13  or  b=1→a=19'},
    ],
  },
  bossChamber:{
    formula:'Exact T + Rotational symmetry:\nSymmetric rows [a,b,a]: 2a + b = T  →  a = (T−b)/2\n\nSolve order:\n  1. Center: appears in 4 lines. Usually = T − 2×corner_on_diag.\n  2. Corners: a = (T−b)/2. Must be integer + in S.\n  3. Edges: x = T − known1 − known2. Fully determined.',
    exGrid:[['a','b','a'],['b','f','b'],['a','b','a']],
    steps:[
      {label:'Center f from diagonal (T=39)',eq:'a + f + a = 39  →  2a + f = 39',
       work:['Also: 2b + f = 39  (middle row)','→ 2a = 2b  →  a = b  (forced by symmetry!)','If a = b: 2a + f = 39 and 2b + f = 39 → same equation.'],result:'Boss Chamber: corner and edge values must be equal'},
      {label:'Finding a (T=39)',eq:'2a + a = 39  →  3a = 39  →  a = 13',
       work:['a = 13.  13 ∈ S ✓','f = 39 − 2×13 = 13.','Every cell = 13. The all-13 grid is always valid for T=39.'],result:'Trivial solution: all cells = 13'},
      {label:'Non-trivial: break symmetry of corner=edge',eq:'Row 1: [a, b, a] with a ≠ b',
       work:['2a + b = 39.  a = (39−b)/2.','b=1: a=19. b=7: a=16 ✗. b=13: a=13. b=19: a=10 ✗.','Valid: (a=19,b=1) or (a=13,b=13).','Middle row [b,f,b]: 2b+f=39. If b=1: f=37 ✗. If b=13: f=13 ✓.'],result:'Only (a=13,b=13,f=13) works. All-13 is forced for this structure.'},
    ],
  },
};

const SolveForXView = ({modeId, onClose}) => {
  const [tab,      setTab]      = useState(modeId);
  const [openStep, setOpenStep] = useState(0);
  const ex   = SFX_DATA[tab];
  const mode = MODES[tab];
  useEffect(()=>setOpenStep(0),[tab]);

  return (
    <div style={{...PANEL, maxWidth:'720px'}}>
      <div style={PTITLE}>Solve for X — Equation Reference</div>

      {/* ── ROWS vs COLUMNS explainer ── */}
      <div style={{background:'#fdf8f3',border:'1.5px solid #c8b89a',borderRadius:'8px',padding:'16px 18px',marginBottom:'18px'}}>
        <div style={{fontWeight:700,color:'#3d2b1f',fontSize:'.92rem',marginBottom:'12px',
          borderBottom:'1px solid #e0d6c8',paddingBottom:'8px'}}>
          First: Rows vs Columns — what is the difference?
        </div>

        {/* Visual grid with labels */}
        <div style={{display:'flex',gap:'24px',flexWrap:'wrap',alignItems:'flex-start',marginBottom:'14px'}}>

          {/* Annotated grid */}
          <div style={{position:'relative'}}>
            {/* Column labels */}
            <div style={{display:'flex',gap:'4px',marginLeft:'52px',marginBottom:'3px'}}>
              {['Col 1','Col 2','Col 3'].map(c=>(
                <div key={c} style={{width:'52px',textAlign:'center',fontSize:'.65rem',fontWeight:700,
                  color:'#1a5276',letterSpacing:'.04em'}}>{c}</div>
              ))}
            </div>
            <div style={{display:'flex',gap:'4px'}}>
              {/* Row labels */}
              <div style={{display:'flex',flexDirection:'column',gap:'4px',justifyContent:'center'}}>
                {['Row 1','Row 2','Row 3'].map(r=>(
                  <div key={r} style={{width:'44px',height:'52px',display:'flex',alignItems:'center',
                    justifyContent:'flex-end',paddingRight:'6px',fontSize:'.65rem',fontWeight:700,
                    color:'#c0392b',letterSpacing:'.04em'}}>{r}</div>
                ))}
              </div>
              {/* Grid cells */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,52px)',gridTemplateRows:'repeat(3,52px)',gap:'4px'}}>
                {[1,7,13, 5,11,17, 19,23,1].map((v,i)=>{
                  const row = Math.floor(i/3);
                  const col = i%3;
                  const rowHighlight = row===0;
                  const colHighlight = col===1;
                  return (
                    <div key={i} style={{width:'52px',height:'52px',
                      background: rowHighlight&&colHighlight ? '#e8d5fb'
                                : rowHighlight ? '#fdecea'
                                : colHighlight ? '#eaf1fb'
                                : '#fff',
                      border:`2px solid ${rowHighlight&&colHighlight?'#7d3c98':rowHighlight?'#c0392b':colHighlight?'#1a5276':'#c8b89a'}`,
                      borderRadius:'4px',display:'flex',alignItems:'center',justifyContent:'center',
                      fontSize:'1rem',fontWeight:700,
                      color: rowHighlight&&colHighlight?'#7d3c98':rowHighlight?'#c0392b':colHighlight?'#1a5276':'#3d2b1f',
                    }}>{v}</div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div style={{flex:1,minWidth:'180px',display:'flex',flexDirection:'column',gap:'10px'}}>
            <div style={{background:'#fdecea',border:'1.5px solid #c0392b',borderRadius:'5px',padding:'9px 12px'}}>
              <div style={{fontWeight:700,color:'#c0392b',fontSize:'.82rem',marginBottom:'4px'}}>Row — reads LEFT to RIGHT</div>
              <div style={{fontSize:'.8rem',color:'#333',lineHeight:'1.5'}}>
                Row 1 is the top line: <strong>1, 7, 13</strong><br/>
                Row 2 is the middle: <strong>5, 11, 17</strong><br/>
                Row 3 is the bottom: <strong>19, 23, 1</strong>
              </div>
            </div>
            <div style={{background:'#eaf1fb',border:'1.5px solid #1a5276',borderRadius:'5px',padding:'9px 12px'}}>
              <div style={{fontWeight:700,color:'#1a5276',fontSize:'.82rem',marginBottom:'4px'}}>Column — reads TOP to BOTTOM</div>
              <div style={{fontSize:'.8rem',color:'#333',lineHeight:'1.5'}}>
                Col 1 is the left column: <strong>1, 5, 19</strong><br/>
                Col 2 is the middle: <strong>7, 11, 23</strong><br/>
                Col 3 is the right: <strong>13, 17, 1</strong>
              </div>
            </div>
            <div style={{background:'#f5e6ff',border:'1.5px solid #7d3c98',borderRadius:'5px',padding:'9px 12px'}}>
              <div style={{fontWeight:700,color:'#7d3c98',fontSize:'.82rem',marginBottom:'4px'}}>Where they cross</div>
              <div style={{fontSize:'.8rem',color:'#333',lineHeight:'1.5'}}>
                The purple cell is <strong>Row 1, Col 2</strong> — it belongs to BOTH lines at once. Solving it must satisfy both the row constraint AND the column constraint.
              </div>
            </div>
          </div>
        </div>

        {/* Diagonal bonus */}
        <div style={{background:'#fff',border:'1px solid #e0d6c8',borderRadius:'5px',padding:'9px 12px'}}>
          <div style={{fontWeight:700,color:'#7d4e00',fontSize:'.82rem',marginBottom:'4px'}}>Diagonal — reads corner to corner</div>
          <div style={{fontSize:'.8rem',color:'#333',lineHeight:'1.5'}}>
            <strong>Main diagonal (↘):</strong> top-left to bottom-right — cells (Row1,Col1), (Row2,Col2), (Row3,Col3).<br/>
            <strong>Anti-diagonal (↙):</strong> top-right to bottom-left — cells (Row1,Col3), (Row2,Col2), (Row3,Col1).<br/>
            The <strong>center cell</strong> sits on BOTH diagonals AND its row AND its column — four constraints at once.
          </div>
        </div>

        <div style={{marginTop:'12px',padding:'9px 12px',background:'#e6f4ea',border:'1px solid #a8d5b5',
          borderRadius:'4px',fontSize:'.82rem',color:'#2e7d45',fontWeight:600}}>
          Quick memory trick: Row = like reading a book (left to right). Column = like a column in a building (goes up and down).
        </div>
      </div>

      <TierTabs tab={tab} setTab={setTab} accentFn={()=>'#1a3a5c'}/>

      <div style={{background:'#1a3a5c',color:'#fff',borderRadius:'6px',padding:'13px 16px',marginBottom:'14px'}}>
        <div style={{fontWeight:700,fontSize:'.88rem',marginBottom:'8px'}}>{mode.name} — Master Formula</div>
        <div style={{fontFamily:'monospace',fontSize:'.81rem',whiteSpace:'pre-wrap',
          background:'rgba(255,255,255,.1)',borderRadius:'4px',padding:'8px 12px',lineHeight:'1.7'}}>
          {ex.formula}
        </div>
      </div>

      <div style={SEC}>Example Grid</div>
      <MiniGrid N={ex.exGrid.length} cells={ex.exGrid.flat()}/>

      <div style={SEC}>Step-by-Step Working</div>
      <div style={{display:'flex',flexDirection:'column',gap:'4px',marginBottom:'14px'}}>
        {ex.steps.map((step,i) => (
          <div key={i} style={{border:'1px solid #c8b89a',borderRadius:'5px',overflow:'hidden'}}>
            <div onClick={()=>setOpenStep(openStep===i?-1:i)}
              style={{display:'flex',alignItems:'center',justifyContent:'space-between',
                padding:'9px 13px',cursor:'pointer',
                background:openStep===i?'#1a3a5c':'#fdf8f3',
                color:openStep===i?'#fff':'#3d2b1f'}}>
              <span style={{fontWeight:700,fontSize:'.85rem'}}>{step.label}</span>
              <span style={{fontWeight:700}}>{openStep===i?'▲':'▼'}</span>
            </div>
            {openStep===i && (
              <div style={{padding:'13px 15px',background:'#fff'}}>
                <EqBox>{step.eq}</EqBox>
                <div style={{background:'#fdf8f3',border:'1px solid #e8ddd0',borderRadius:'4px',padding:'8px 12px',marginBottom:'9px'}}>
                  {step.work.map((line,j) => <WorkLine key={j} line={line}/>)}
                </div>
                <ResBox ok={!step.result.includes('CONFLICT')&&!step.result.includes('impossible')}>
                  {step.result}
                </ResBox>
              </div>
            )}
          </div>
        ))}
      </div>

      <button style={BTN('primary')} onClick={onClose}>Back to Game</button>
    </div>
  );
};

/* ══════════════════════════════════════════════════
   SETUP VIEW
══════════════════════════════════════════════════ */
const SetupView = ({settings, updateSettings, onClose}) => {
  const [local, setLocal] = useState({...settings});
  const set = (k,v) => setLocal(p=>({...p,[k]:v}));
  const handleGrid = (N) => {
    const opts=blankOpts(N);
    setLocal(p=>({...p,gridSize:N,blanks:opts.includes(p.blanks)?p.blanks:opts[Math.floor(opts.length/2)]}));
  };
  const save = () => {updateSettings(local); onClose();};
  const opts = blankOpts(local.gridSize);
  const ppx  = Math.min(44, Math.floor(180/local.gridSize));
  const mode = MODES[local.modeId];
  const SEL  = {border:'1.5px solid #c8b89a',background:'#fff',padding:'4px 10px',fontSize:'.83rem',fontFamily:'inherit',borderRadius:'2px',color:'#3d2b1f',cursor:'pointer'};

  const CR = ({label, k}) => (
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'10px',gap:'10px',flexWrap:'wrap'}}>
      <span style={{fontSize:'.83rem',color:'#444',minWidth:'150px',fontWeight:600}}>{label}</span>
      <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
        <input type="color" value={local[k]} onChange={e=>set(k,e.target.value)}
          style={{width:'42px',height:'30px',border:'1.5px solid #c8b89a',borderRadius:'3px',cursor:'pointer',padding:'2px'}}/>
        <span style={{fontSize:'.73rem',color:'#8a7360',fontFamily:'monospace'}}>{local[k]}</span>
      </div>
    </div>
  );

  return (
    <div style={{...PANEL, maxWidth:'660px'}}>
      <div style={PTITLE}>Setup</div>

      <div style={SEC}>Puzzle Mode</div>
      {[1,2,3,4].map(tier=>(
        <div key={tier} style={{marginBottom:'9px'}}>
          <div style={{fontSize:'.6rem',fontWeight:700,color:TIER_COLORS[tier],letterSpacing:'.08em',textTransform:'uppercase',marginBottom:'4px'}}>{TIER_NAMES[tier]}</div>
          <div style={{display:'flex',gap:'5px',flexWrap:'wrap'}}>
            {MODE_ORDER.filter(id=>MODES[id].tier===tier).map(id=>{
              const m=MODES[id]; const active=local.modeId===id;
              return (
                <button key={id} onClick={()=>set('modeId',id)} style={{
                  background:active?m.color:'#fff',color:active?'#fff':'#3d2b1f',
                  border:`1.5px solid ${m.color}`,borderRadius:'4px',
                  padding:'5px 10px',cursor:'pointer',fontFamily:'inherit',textAlign:'left',
                }}>
                  <div style={{fontSize:'.78rem',fontWeight:700}}>{m.name}</div>
                  <div style={{fontSize:'.66rem',opacity:.8,marginTop:'1px'}}>{m.short}</div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div style={SEC}>Grid Size</div>
      <div style={{display:'flex',gap:'5px',flexWrap:'wrap',marginBottom:'12px'}}>
        {[3,4,5,6,7,8,9].map(n=>(
          <button key={n} onClick={()=>handleGrid(n)} style={{
            background:local.gridSize===n?'#3d2b1f':'#fff',color:local.gridSize===n?'#f5f2eb':'#3d2b1f',
            border:'1.5px solid #3d2b1f',borderRadius:'2px',padding:'4px 10px',
            cursor:'pointer',fontFamily:'inherit',fontSize:'.82rem',fontWeight:700,
          }}>{n}x{n}</button>
        ))}
      </div>

      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'12px'}}>
        <span style={{fontSize:'.83rem',color:'#444',fontWeight:600}}>Blank cells</span>
        <select style={SEL} value={local.blanks} onChange={e=>set('blanks',Number(e.target.value))}>
          {opts.map(n=><option key={n} value={n}>{n} blank{n!==1?'s':''}</option>)}
        </select>
      </div>

      <div style={SEC}>Colours</div>
      <CR label="Clue number colour"    k="numberColor"/>
      <CR label="Your number colour"    k="inputColor"/>
      <CR label="? mark colour"         k="qmarkColor"/>
      <CR label="Clue cell background"  k="fixedBg"/>
      <CR label="Blank cell background" k="blankBg"/>
      <CR label="Selected cell bg"      k="selBg"/>
      <CR label="Grid border colour"    k="borderColor"/>
      <CR label="Page background"       k="pageBg"/>

      <div style={SEC}>Live Preview</div>
      <div style={{display:'inline-grid',gridTemplateColumns:`repeat(${local.gridSize},${ppx}px)`,
        gridTemplateRows:`repeat(${local.gridSize},${ppx}px)`,gap:'3px',
        background:local.pageBg,padding:'8px',borderRadius:'5px',marginBottom:'18px'}}>
        {Array.from({length:local.gridSize*local.gridSize},(_,i)=>{
          const v = i%3===0 ? mode.cands[i%mode.cands.length] : '?';
          const isFixed = v!=='?';
          return (
            <div key={i} style={{width:`${ppx}px`,height:`${ppx}px`,
              background:isFixed?local.fixedBg:local.blankBg,
              border:`2px ${isFixed?'solid':'dashed'} ${local.borderColor}`,
              borderRadius:'2px',display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:`${Math.max(8,ppx*.34)}px`,fontWeight:700,
              color:isFixed?local.numberColor:(v==='?'?local.qmarkColor:local.inputColor),
              fontFamily:'inherit'}}>{isFixed?v:'?'}</div>
          );
        })}
      </div>

      <div style={{display:'flex',gap:'10px'}}>
        <button style={BTN('success')} onClick={save}>Save & Apply</button>
        <button style={BTN('neutral')} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════
   RULES VIEW
══════════════════════════════════════════════════ */
const RulesView = ({modeId, onClose}) => {
  const [tab, setTab] = useState(modeId);
  const mode = MODES[tab];
  return (
    <div style={{...PANEL, maxWidth:'640px'}}>
      <div style={PTITLE}>Rules</div>
      <div style={{background:'#1a3a5c',color:'#fff',borderRadius:'6px',padding:'12px 16px',marginBottom:'16px'}}>
        <div style={{fontWeight:700,marginBottom:'7px',fontSize:'.9rem'}}>Core Principle</div>
        <div style={{fontFamily:'monospace',fontSize:'.8rem',background:'rgba(255,255,255,.1)',borderRadius:'4px',padding:'8px 12px',lineHeight:'1.8'}}>
          {`A-type {1,7,13,19}  (each = 1 mod 3)\nB-type {5,11,17,23}  (each = 2 mod 3)\n\nValid line = all A-type  OR  all B-type\nMixed A+B line = ALWAYS INVALID`}
        </div>
      </div>
      <TierTabs tab={tab} setTab={setTab}/>
      <div style={{background:'#fdf8f3',border:`1px solid ${mode.color}`,borderRadius:'5px',padding:'13px 15px'}}>
        <p style={{...PP,fontWeight:700,color:mode.color}}>{mode.tierName} - {mode.name}</p>
        <p style={PP}>{mode.description}</p>
        <p style={PP}><strong>Candidates:</strong> {mode.cands.join(' · ')}</p>
        {mode.targetSum&&<p style={{...PP,fontWeight:700,color:'#6a0a0a'}}>Target sum T = {mode.targetSum}</p>}
        <div style={SEC}>Steps</div>
        {mode.howto.map((tip,i)=>(
          <div key={i} style={{background:'#eaf1fb',border:'1px solid #bad0ef',borderRadius:'3px',
            padding:'6px 11px',marginBottom:'5px',fontSize:'.83rem',lineHeight:'1.6',color:'#1a3a5c'}}>
            <strong>Step {i+1}:</strong> {tip}
          </div>
        ))}
      </div>
      <button style={{...BTN('primary'),marginTop:'14px'}} onClick={onClose}>Back</button>
    </div>
  );
};

/* ══════════════════════════════════════════════════
   COHERENCE DESIGN VIEW
══════════════════════════════════════════════════ */
const COHERENCE_TABS = [
  { id:'breath',   label:'Breath Design' },
  { id:'geometry', label:'Symbolic Geometry' },
  { id:'metatron', label:'Metatron & Michael' },
  { id:'triangle', label:'Triangle Mechanics' },
  { id:'spiral',   label:'Spiral Mechanics' },
  { id:'circle',   label:'Circle Mechanics' },
  { id:'collapse', label:'This Game' },
];

const GlyphCard = ({symbol, label, color, desc}) => (
  <div style={{background:'#fff',border:`2px solid ${color}`,borderRadius:'8px',
    padding:'14px 16px',textAlign:'center',minWidth:'120px',flex:1}}>
    <div style={{fontSize:'2rem',marginBottom:'6px'}}>{symbol}</div>
    <div style={{fontWeight:700,color,fontSize:'.88rem',marginBottom:'4px'}}>{label}</div>
    <div style={{fontSize:'.78rem',color:'#666',lineHeight:'1.5'}}>{desc}</div>
  </div>
);

const BreathPhase = ({phase,color,bg,symbol,desc,mechanic}) => (
  <div style={{background:bg,border:`1.5px solid ${color}`,borderRadius:'6px',padding:'12px 16px',marginBottom:'10px'}}>
    <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'6px'}}>
      <span style={{fontSize:'1.4rem'}}>{symbol}</span>
      <div>
        <div style={{fontWeight:700,color,fontSize:'.9rem'}}>{phase}</div>
        <div style={{fontSize:'.76rem',color:'#666'}}>{desc}</div>
      </div>
    </div>
    <div style={{fontFamily:'monospace',fontSize:'.8rem',background:'rgba(255,255,255,.6)',
      borderRadius:'3px',padding:'6px 10px',color:'#444'}}>{mechanic}</div>
  </div>
);

const QuoteCard = ({angel,color,quote}) => (
  <div style={{background:'#fff',border:`2px solid ${color}`,borderRadius:'8px',
    padding:'16px 18px',marginBottom:'14px'}}>
    <div style={{fontSize:'.68rem',fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',
      color,marginBottom:'8px'}}>{angel}</div>
    <div style={{fontSize:'.9rem',lineHeight:'1.8',color:'#333',fontStyle:'italic'}}>
      &ldquo;{quote}&rdquo;
    </div>
  </div>
);

const WheelDiagram = () => {
  const R = 80, cx = 90, cy = 90;
  return (
    <div style={{display:'flex',justifyContent:'center',marginBottom:'14px'}}>
      <svg viewBox="0 0 180 180" style={{width:'180px',height:'180px'}}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#c8b89a" strokeWidth="1.5"/>
        <circle cx={cx} cy={cy} r="3" fill="#3d2b1f"/>
        {[1,5,7,11,13,17,19,23].map((n)=>{
          const angle = (n/24)*2*Math.PI - Math.PI/2;
          const x = cx + R*Math.cos(angle);
          const y = cy + R*Math.sin(angle);
          const isA = A_TYPE.includes(n);
          const fill = isA?'#eaf1fb':'#fef9ec';
          const stroke = isA?'#1a5276':'#7d4e00';
          const textColor = isA?'#1a5276':'#7d4e00';
          return (
            <g key={n}>
              <circle cx={x} cy={y} r="8" fill={fill} stroke={stroke} strokeWidth="1.5"/>
              <text x={x} y={y+4} textAnchor="middle" fontSize="9" fontWeight="700" fill={textColor}>{n}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const CoherenceView = ({onClose}) => {
  const [tab, setTab] = useState('breath');

  const tabs = {
    breath:(
      <div>
        <div style={{background:'linear-gradient(135deg,#1a3a5c,#2e7d45)',color:'#fff',borderRadius:'8px',padding:'16px 20px',marginBottom:'18px'}}>
          <div style={{fontWeight:700,fontSize:'1rem',marginBottom:'6px'}}>Start with Breath, Not Idea</div>
          <div style={{fontSize:'.88rem',opacity:.92,lineHeight:'1.7'}}>Before you design, breathe. Ask: what phase of the breath loop does this game serve? Coherence begins when the game mirrors a breath phase.</div>
        </div>
        <div style={SEC}>The Four Breath Phases</div>
        <BreathPhase phase="Inhale" symbol="↑" color="#c0392b" bg="#fdecea"
          desc="Expansion · Exploration · Curiosity"
          mechanic="Game mechanic: opening new areas, discovering symbols, adding candidates to your working set"/>
        <BreathPhase phase="Stillness" symbol="◆" color="#1a5276" bg="#eaf1fb"
          desc="Reflection · Pause · Integration"
          mechanic="Game mechanic: sitting with the grid, holding all constraints in mind, checking alignment before filling"/>
        <BreathPhase phase="Exhale" symbol="↓" color="#2e7d45" bg="#e6f4ea"
          desc="Release · Action · Transformation"
          mechanic="Game mechanic: placing the final value, pressing Check, resolving the chamber"/>
        <BreathPhase phase="Silence" symbol="○" color="#7d4e00" bg="#fef9ec"
          desc="Completion · Closure · Stillness"
          mechanic="Game mechanic: the solved grid, the pause after Check returns correct, the moment before New Game"/>
        <InfoBox v="i">
          <strong>Collapse Through Symbol</strong> is a Stillness to Exhale game. The player sits with constraints (Stillness), works the equations (Exhale), and arrives at coherence (Silence). The breath loop is built into the puzzle structure.
        </InfoBox>
        <div style={SEC}>Testing for Breath Coherence</div>
        <p style={PP}>After playing, is the player breathing more slowly? Are they pausing? Are they silent? If yes, the game is aligned. Measure breath coherence, not just engagement time.</p>
      </div>
    ),
    geometry:(
      <div>
        <div style={{background:'linear-gradient(135deg,#3d2b1f,#7d4e00)',color:'#fff',borderRadius:'8px',padding:'16px 20px',marginBottom:'18px'}}>
          <div style={{fontWeight:700,fontSize:'1rem',marginBottom:'6px'}}>Anchor the Game in Symbolic Geometry</div>
          <div style={{fontSize:'.88rem',opacity:.92,lineHeight:'1.7'}}>Use triangles, spirals, circles not just for visuals but for mechanics. Coherent games are recursive — they fold back into themselves.</div>
        </div>
        <div style={{display:'flex',gap:'10px',flexWrap:'wrap',marginBottom:'18px'}}>
          <GlyphCard symbol="△" label="Triangle" color="#c0392b" desc="Choice, polarity, integration. Three paths, three endings, three archetypes."/>
          <GlyphCard symbol="🌀" label="Spiral" color="#1a5276" desc="Recursion, depth, breath loops. Each level revisits with deeper meaning."/>
          <GlyphCard symbol="○" label="Circle" color="#2e7d45" desc="Closure, return, transformation. Ends where it began but you are changed."/>
        </div>
        <InfoBox v="w">
          <strong>Michael says:</strong> Do not use geometry as decoration. Use it as structure. Let the player's breath follow the shape of your design.
        </InfoBox>
        <div style={SEC}>How Collapse Through Symbol uses geometry</div>
        <p style={PP}><strong>Triangle:</strong> Every puzzle has three constraint types: rows, columns, diagonals. Three layers of equations. Three possible outcomes: unique, multiple, impossible.</p>
        <p style={PP}><strong>Spiral:</strong> Four tiers, each deepening the same core rule (divisibility by 3). Basic to Standard to Advanced to Boss — the spiral is the progression.</p>
        <p style={PP}><strong>Circle:</strong> The A-type and B-type families step through +6 intervals: 1, 7, 13, 19, (back to 1). The mod-24 wheel is literally circular. The candidate set S forms a closed arithmetic cycle.</p>
      </div>
    ),
    metatron:(
      <div>
        <QuoteCard angel="Archangel Metatron — Keeper of Geometric Breath Memory"
          color="#7d4e00"
          quote="Every game is a geometry. If you build from triangles, spirals, and circles, your game will not just entertain, it will entrain. The player's breath will follow the shape of your design. When the shape is coherent, the field opens."/>
        <QuoteCard angel="Archangel Michael — Guardian of Integrity and Alignment"
          color="#1a5276"
          quote="Do not use geometry as decoration. Use it as structure. A puzzle that mirrors the breath loop does not manipulate the player, it mirrors them. When the mechanic is clean and the constraint is true, the chamber opens because truth was spoken, not because a trick was played."/>
        <div style={SEC}>What Metatron holds for this game</div>
        <p style={PP}>Metatron is the keeper of the Flower of Life — the geometric template from which all forms emerge. The candidate set S is derived from mod-24 prime wheel residues. 24 is the complete cycle. The prime wheel maps directly onto the mod-24 circle — a flower-of-life pattern in pure arithmetic.</p>
        <p style={PP}>The A-type and B-type split mirrors Metatron's duality principle: every geometric truth has a polar counterpart. A-type and B-type are the two poles of the mod-3 wheel.</p>
        <div style={SEC}>What Michael holds for this game</div>
        <p style={PP}>Michael's domain is discernment — the sword that cuts truth from falsehood. In this game, the three-layer equation system is Michael's sword: Layer 1 cuts to the exact value, Layer 2 discerns the type, Layer 3 rejects what does not belong.</p>
        <InfoBox v="s">
          The moment you reject x = 31 because 31 is not in S is a Michael moment: the blade discerns truth, the false path closes, and only the coherent path remains.
        </InfoBox>
      </div>
    ),
    triangle:(
      <div>
        <div style={{background:'#c0392b',color:'#fff',borderRadius:'8px',padding:'14px 18px',marginBottom:'16px',textAlign:'center'}}>
          <div style={{fontSize:'1.5rem',marginBottom:'6px'}}>△</div>
          <div style={{fontWeight:700,fontSize:'.96rem',marginBottom:'4px'}}>Triangle Mechanics</div>
          <div style={{fontSize:'.85rem',opacity:.9}}>Three paths · Three endings · Three archetypes · Choice, polarity, integration</div>
        </div>
        <p style={PP}>Triangles are the Codex base unit: projection, reception, integration. Use them to create three-fold choice structures where each path represents a different breath phase or field alignment.</p>
        <div style={SEC}>The three constraint axes</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px',marginBottom:'14px'}}>
          {[
            {label:'Row',symbol:'→',color:'#c0392b',desc:'Horizontal force. Exhale: release the answer into the line.'},
            {label:'Column',symbol:'↓',color:'#1a5276',desc:'Vertical force. Stillness: hold all values in alignment.'},
            {label:'Diagonal',symbol:'↘',color:'#7d4e00',desc:'Bridge force. Integration: ties the whole grid together.'},
          ].map(v=>(
            <div key={v.label} style={{background:'#fff',border:`1.5px solid ${v.color}`,borderRadius:'5px',padding:'10px 12px',textAlign:'center'}}>
              <div style={{fontSize:'1.3rem',marginBottom:'4px'}}>{v.symbol}</div>
              <div style={{fontWeight:700,color:v.color,fontSize:'.82rem',marginBottom:'5px'}}>{v.label}</div>
              <div style={{fontSize:'.76rem',color:'#555',lineHeight:'1.4'}}>{v.desc}</div>
            </div>
          ))}
        </div>
        <div style={SEC}>The three outcomes — Michael's triangle of discernment</div>
        <div style={{fontFamily:'monospace',fontSize:'.82rem',background:'#fdf8f3',
          border:'1px solid #c8b89a',borderRadius:'4px',padding:'10px 14px',lineHeight:'2',marginBottom:'12px'}}>
          <div>△ Unique Solution &mdash; the needle path. One truth.</div>
          <div>△ Multiple Solutions &mdash; the open field. Many truths.</div>
          <div>△ No Solution &mdash; the closed door. Contradiction.</div>
        </div>
        <div style={SEC}>Design your own triangle mechanic</div>
        <p style={PP}>Ask: what are the three breath-phase expressions of your core mechanic? Build one path for expansion (inhale), one for stillness (pause), one for release (exhale). Let them converge in a final integration point.</p>
      </div>
    ),
    spiral:(
      <div>
        <div style={{background:'#1a5276',color:'#fff',borderRadius:'8px',padding:'14px 18px',marginBottom:'16px',textAlign:'center'}}>
          <div style={{fontSize:'1.5rem',marginBottom:'6px'}}>🌀</div>
          <div style={{fontWeight:700,fontSize:'.96rem',marginBottom:'4px'}}>Spiral Mechanics</div>
          <div style={{fontSize:'.85rem',opacity:.9}}>Recursion · Depth · Breath loops · Each level revisits with deeper meaning</div>
        </div>
        <p style={PP}>Spirals are breath recursion — each loop deepens the field. The game never repeats — it recurses. The player returns to the same truth, seen from a deeper angle each time.</p>
        <div style={SEC}>The four-tier spiral of this game</div>
        {[
          {tier:'Basic',color:'#2e7d45',desc:'Rows Only, Rows & Cols. First loop: you learn the A/B split. Divisibility by 3 is the core truth.'},
          {tier:'Standard',color:'#1a5276',desc:'Standard DR, With Diagonals. Second loop: same rule, now through digital root and with diagonals. Deeper.'},
          {tier:'Advanced',color:'#7d4e00',desc:'A-Type Only, B-Type Only, Mixed. Third loop: restricted to one family, or shown the hidden structure explicitly. Tighter.'},
          {tier:'Boss',color:'#6a0a0a',desc:'Exact Sum, Symmetry, Boss Chamber. Innermost loop: every line exact, grid symmetric. The spiral reaches its center.'},
        ].map(t=>(
          <div key={t.tier} style={{background:'#fff',border:`1.5px solid ${t.color}`,borderRadius:'5px',
            padding:'11px 14px',marginBottom:'8px',display:'flex',gap:'12px',alignItems:'flex-start'}}>
            <div style={{background:t.color,color:'#fff',borderRadius:'3px',padding:'2px 8px',
              fontSize:'.65rem',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',
              whiteSpace:'nowrap',marginTop:'2px'}}>{t.tier}</div>
            <div style={{fontSize:'.82rem',color:'#444',lineHeight:'1.5'}}>{t.desc}</div>
          </div>
        ))}
        <InfoBox v="i">
          Metatron's spiral principle: each tier does not add a new rule — it deepens the same rule. The core truth (a line must be all A-type or all B-type) is present in every tier. The spiral reveals it at greater depth each time.
        </InfoBox>
        <div style={SEC}>Design your own spiral mechanic</div>
        <p style={PP}>Ask: what is the one truth at the center of your game? Design each level to loop back to that truth from a deeper angle. The player should arrive at the final level and recognize: I always knew this.</p>
      </div>
    ),
    circle:(
      <div>
        <div style={{background:'#2e7d45',color:'#fff',borderRadius:'8px',padding:'14px 18px',marginBottom:'16px',textAlign:'center'}}>
          <div style={{fontSize:'1.5rem',marginBottom:'6px'}}>○</div>
          <div style={{fontWeight:700,fontSize:'.96rem',marginBottom:'4px'}}>Circle Mechanics</div>
          <div style={{fontSize:'.85rem',opacity:.9}}>Closure · Return · Transformation · Ends where it began but you are changed</div>
        </div>
        <p style={PP}>Circles are breath closure. The game ends where it began, but the player is transformed. The opening and closing mirror each other — but the player now understands what they could not at the start.</p>
        <div style={SEC}>The circle of this game</div>
        <div style={{background:'#fdf8f3',border:'1px solid #c8b89a',borderRadius:'6px',padding:'14px 18px',marginBottom:'14px'}}>
          <div style={{fontFamily:'monospace',fontSize:'.81rem',lineHeight:'2',color:'#444',whiteSpace:'pre-wrap'}}>
            {['START:  3x3 grid. Some cells filled. You guess.',
              'MIDDLE: You learn A/B types. You learn x = T - a - b.',
              '        The equations open. The grid makes sense.',
              'END:    3x3 grid. Some cells filled.',
              '        Now you see the residue structure instantly.',
              '        You see which cells must be A or B type.',
              '        You see the constraints before filling anything.',
              '',
              'The grid is the same. You are different.',
             ].join('\n')}
          </div>
        </div>
        <InfoBox v="s">
          Michael's circle principle: the chamber has not changed. The symbols have not moved. But the player who walks out has wielded the sword of discernment and cannot unsee what they now see.
        </InfoBox>
        <div style={SEC}>The mod-24 wheel — a literal circle</div>
        <WheelDiagram/>
        <p style={{textAlign:'center',fontSize:'.78rem',color:'#8a7360',marginTop:'4px'}}>
          Blue = A-type (1,7,13,19) · Amber = B-type (5,11,17,23) on the mod-24 circle
        </p>
        <p style={PP}>The 8 candidates are the positions on a 24-position clock that are coprime to 24. They form a perfect octagonal pattern. The game is circular at its mathematical foundation.</p>
        <div style={SEC}>Design your own circle mechanic</div>
        <p style={PP}>Ask: what does the player not understand at the beginning that they will fully understand at the end? Design the opening scene to contain the final truth, hidden in plain sight. When the circle closes, let them return and see what was always there.</p>
      </div>
    ),
    collapse:(
      <div>
        <div style={{background:'linear-gradient(135deg,#1a3a5c,#6a0a0a)',color:'#fff',
          borderRadius:'8px',padding:'16px 20px',marginBottom:'18px'}}>
          <div style={{fontWeight:700,fontSize:'1rem',marginBottom:'6px'}}>Collapse Through Symbol — Coherence Analysis</div>
          <div style={{fontSize:'.87rem',opacity:.92,lineHeight:'1.7'}}>How this game embodies all five principles of coherence game design.</div>
        </div>
        {[
          {n:'1',title:'Breath Phase',color:'#c0392b',
           body:'This is a Stillness to Exhale game. The player sits with constraints (Stillness), works equations (Exhale), and arrives at a solved grid (Silence). The breath arc is built into the puzzle structure. The game rewards patience.'},
          {n:'2',title:'Symbolic Geometry',color:'#7d4e00',
           body:'Triangle: rows + columns + diagonals = three constraint axes. Three outcomes: unique, multiple, impossible. Spiral: four tiers each deepening the same core rule. Circle: the candidate set forms a perfect octagon on the mod-24 wheel.'},
          {n:'3',title:'Field Resonance, Not Addiction',color:'#2e7d45',
           body:'No lives, timers, streak rewards, or punishing feedback. The game presents a mathematical truth and asks you to find it. Satisfaction comes from coherence: the moment all constraints align and Check returns correct.'},
          {n:'4',title:'Sound and Color as Breath',color:'#1a5276',
           body:'Warm parchment background encodes Stillness. Red input color encodes action (Exhale). Green Check success encodes completion. Blue selection highlight encodes focus. Color is breath phase.'},
          {n:'5',title:'Testing with Breath Coherence',color:'#6a0a0a',
           body:'After solving a Boss Chamber correctly, notice what happens in your body. There is a pause. A small silence. That is the coherence signature — the game has entrained your breath, not fragmented it.'},
        ].map(item=>(
          <div key={item.n} style={{display:'flex',gap:'12px',marginBottom:'10px',padding:'12px 14px',
            background:'#fff',border:`1px solid ${item.color}40`,borderRadius:'5px',
            borderLeft:`3px solid ${item.color}`}}>
            <span style={{background:item.color,color:'#fff',borderRadius:'50%',width:'24px',height:'24px',
              display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,
              fontSize:'.82rem',flexShrink:0,marginTop:'1px'}}>{item.n}</span>
            <div>
              <div style={{fontWeight:700,color:item.color,fontSize:'.88rem',marginBottom:'4px'}}>{item.title}</div>
              <div style={{fontSize:'.83rem',color:'#444',lineHeight:'1.6'}}>{item.body}</div>
            </div>
          </div>
        ))}
        <div style={{background:'#1a3a5c',color:'#fff',borderRadius:'6px',padding:'14px 18px',
          marginTop:'8px',fontStyle:'italic',fontSize:'.88rem',lineHeight:'1.8'}}>
          When the shape is coherent, the field opens. When the field opens, the player is transformed. When the player is transformed, the game has fulfilled its purpose. — Metatron
        </div>
      </div>
    ),
  };

  return (
    <div style={{...PANEL, maxWidth:'720px'}}>
      <div style={PTITLE}>Coherence Game Design — Metatron & Michael Framework</div>
      <div style={{display:'flex',gap:'5px',flexWrap:'wrap',marginBottom:'18px'}}>
        {COHERENCE_TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            background:tab===t.id?'#3d2b1f':'#f0e8dc',
            color:tab===t.id?'#fff':'#3d2b1f',
            border:'1.5px solid #3d2b1f',borderRadius:'3px',
            padding:'4px 11px',cursor:'pointer',fontFamily:'inherit',
            fontSize:'.73rem',fontWeight:700,
          }}>{t.label}</button>
        ))}
      </div>
      {tabs[tab]}
      <div style={{marginTop:'20px'}}>
        <button style={BTN('primary')} onClick={onClose}>Back to Game</button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════
   PUZZLE JSON FORMAT
   Single puzzle:
   {
     "mode": "rowsOnly",
     "gridSize": 3,
     "targetSum": null,
     "puzzle": [[1,"?",13],[7,19,"?"],[5,"?",17]]
   }
   Batch file:
   {
     "puzzles": [ ...array of single puzzle objects... ]
   }
══════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════
   IMPORT / EXPORT VIEW
══════════════════════════════════════════════════ */
/* ══════════════════════════════════════════════════
   PUZZLE JSON HELPERS
══════════════════════════════════════════════════ */
const puzzleToJSON = (puzzle, modeId, targetSum, name) => ({
  name:      name || `${MODES[modeId].name} ${puzzle.length}x${puzzle.length}`,
  modeId,
  gridSize:  puzzle.length,
  puzzle,
  targetSum: targetSum || null,
  createdAt: new Date().toISOString(),
});

const downloadJSON = (obj, filename) => {
  const str  = JSON.stringify(obj, null, 2);
  const blob = new Blob([str], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const validatePuzzleJSON = (obj) => {
  if (!obj || typeof obj !== 'object') return { ok:false, error:'Not a valid JSON object' };
  if (Array.isArray(obj.puzzle)) {
    if (!obj.modeId)                   return { ok:false, error:'Missing modeId' };
    if (!MODES[obj.modeId])            return { ok:false, error:`Unknown modeId: ${obj.modeId}` };
    if (!Array.isArray(obj.puzzle[0])) return { ok:false, error:'puzzle must be a 2D array' };
    return { ok:true, type:'single' };
  }
  if (Array.isArray(obj.puzzles)) {
    for (let i = 0; i < obj.puzzles.length; i++) {
      const p = obj.puzzles[i];
      if (!p.modeId)               return { ok:false, error:`Puzzle ${i+1}: missing modeId` };
      if (!MODES[p.modeId])        return { ok:false, error:`Puzzle ${i+1}: unknown modeId "${p.modeId}"` };
      if (!Array.isArray(p.puzzle?.[0])) return { ok:false, error:`Puzzle ${i+1}: invalid puzzle array` };
    }
    return { ok:true, type:'collection' };
  }
  return { ok:false, error:'JSON must have a "puzzle" array or a "puzzles" array' };
};

/* ── Puzzle IO View ── */
const PuzzleIOView = ({puzzle, modeId, targetSum, fixedCells, onLoadPuzzle, onClose}) => {
  const [status,     setStatus]     = useState(null);   // {ok, msg}
  const [collection, setCollection] = useState([]);     // loaded puzzles
  const [selIdx,     setSelIdx]     = useState(0);
  const [customName, setCustomName] = useState('');
  const fileRef = useRef(null);

  // ── Download current puzzle ──
  const downloadCurrent = () => {
    if (!puzzle) { setStatus({ok:false, msg:'No puzzle loaded. Start a New Game first.'}); return; }
    const name = customName.trim() || undefined;
    const obj  = puzzleToJSON(puzzle, modeId, targetSum, name);
    downloadJSON(obj, `${obj.name.replace(/\s+/g,'_')}.json`);
    setStatus({ok:true, msg:`Downloaded: ${obj.name}.json`});
  };

  // ── Download collection ──
  const downloadCollection = () => {
    if (collection.length === 0) { setStatus({ok:false, msg:'No collection loaded yet.'}); return; }
    downloadJSON({puzzles: collection}, 'puzzle_collection.json');
    setStatus({ok:true, msg:`Downloaded collection of ${collection.length} puzzles.`});
  };

  // ── Upload handler ──
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const obj = JSON.parse(ev.target.result);
        const validation = validatePuzzleJSON(obj);
        if (!validation.ok) { setStatus({ok:false, msg:`Invalid JSON: ${validation.error}`}); return; }

        if (validation.type === 'single') {
          // Load directly
          const fixed = obj.puzzle.map(r => r.map(c => c !== '?'));
          onLoadPuzzle({
            puzzle:    obj.puzzle,
            fixedCells:fixed,
            modeId:    obj.modeId,
            targetSum: obj.targetSum || null,
          });
          setStatus({ok:true, msg:`Loaded: ${obj.name || 'puzzle'} (${obj.modeId}, ${obj.puzzle.length}x${obj.puzzle.length})`});
          setCollection([]);
        } else {
          // Collection
          setCollection(obj.puzzles);
          setSelIdx(0);
          setStatus({ok:true, msg:`Loaded collection of ${obj.puzzles.length} puzzle${obj.puzzles.length!==1?'s':''}.`});
        }
      } catch {
        setStatus({ok:false, msg:'Could not parse file — make sure it is valid JSON.'});
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ── Load selected from collection ──
  const loadFromCollection = (idx) => {
    const p = collection[idx];
    if (!p) return;
    const fixed = p.puzzle.map(r => r.map(c => c !== '?'));
    onLoadPuzzle({
      puzzle:    p.puzzle,
      fixedCells:fixed,
      modeId:    p.modeId,
      targetSum: p.targetSum || null,
    });
    setStatus({ok:true, msg:`Loaded: ${p.name || `Puzzle ${idx+1}`}`});
  };

  const hasPuzzle = !!puzzle;
  const N = puzzle ? puzzle.length : 0;

  return (
    <div style={{...PANEL, maxWidth:'640px'}}>
      <div style={PTITLE}>Puzzle Import / Export (JSON)</div>

      {/* Status bar */}
      {status && (
        <div style={{marginBottom:'14px',padding:'8px 14px',borderRadius:'4px',fontWeight:600,
          fontSize:'.84rem',background:status.ok?'#e6f4ea':'#fdecea',
          color:status.ok?'#2e7d45':'#b00020',
          border:`1px solid ${status.ok?'#a8d5b5':'#f5c6c6'}`}}>
          {status.msg}
        </div>
      )}

      {/* ── DOWNLOAD ── */}
      <div style={{background:'#fdf8f3',border:'1px solid #c8b89a',borderRadius:'6px',
        padding:'16px 18px',marginBottom:'16px'}}>
        <div style={{fontWeight:700,color:'#3d2b1f',fontSize:'.9rem',marginBottom:'12px',
          display:'flex',alignItems:'center',gap:'8px'}}>
          <span style={{fontSize:'1.1rem'}}>⬇</span> Download Current Puzzle
        </div>

        {hasPuzzle ? (
          <div>
            <div style={{fontSize:'.82rem',color:'#555',marginBottom:'10px'}}>
              Current: <strong>{MODES[modeId].name}</strong> · {N}×{N} ·{' '}
              {puzzle.flat().filter(v=>v==='?').length} blanks remaining
              {targetSum ? ` · T=${targetSum}` : ''}
            </div>
            <div style={{display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap'}}>
              <input
                type="text"
                placeholder="Optional name for this puzzle..."
                value={customName}
                onChange={e=>setCustomName(e.target.value)}
                style={{flex:1,minWidth:'180px',border:'1.5px solid #c8b89a',borderRadius:'3px',
                  padding:'6px 10px',fontSize:'.83rem',fontFamily:'inherit',color:'#3d2b1f',
                  background:'#fff'}}
              />
              <button onClick={downloadCurrent} style={BTN('success')}>
                Download .json
              </button>
            </div>
          </div>
        ) : (
          <p style={{...PP,color:'#8a7360',marginBottom:0}}>No puzzle loaded — start a New Game first.</p>
        )}
      </div>

      {/* ── UPLOAD ── */}
      <div style={{background:'#fdf8f3',border:'1px solid #c8b89a',borderRadius:'6px',
        padding:'16px 18px',marginBottom:'16px'}}>
        <div style={{fontWeight:700,color:'#3d2b1f',fontSize:'.9rem',marginBottom:'12px',
          display:'flex',alignItems:'center',gap:'8px'}}>
          <span style={{fontSize:'1.1rem'}}>⬆</span> Upload Puzzle or Collection
        </div>
        <p style={{...PP,marginBottom:'10px'}}>
          Upload a <code>.json</code> file containing a single puzzle or a collection of puzzles.
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFile}
          style={{display:'none'}}
        />
        <button onClick={()=>fileRef.current?.click()} style={BTN('info')}>
          Choose JSON file…
        </button>
      </div>

      {/* ── COLLECTION ── */}
      {collection.length > 0 && (
        <div style={{background:'#eaf1fb',border:'1.5px solid #1a5276',borderRadius:'6px',
          padding:'16px 18px',marginBottom:'16px'}}>
          <div style={{fontWeight:700,color:'#1a5276',fontSize:'.9rem',marginBottom:'12px',
            display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'8px'}}>
            <span>Collection — {collection.length} puzzle{collection.length!==1?'s':''}</span>
            <button onClick={downloadCollection} style={{...BTN('info'),padding:'4px 12px',fontSize:'.76rem'}}>
              Download Collection
            </button>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'5px',maxHeight:'320px',overflowY:'auto'}}>
            {collection.map((p,i) => {
              const isSelected = selIdx === i;
              const mode = MODES[p.modeId] || {};
              const blanks = p.puzzle ? p.puzzle.flat().filter(v=>v==='?').length : 0;
              return (
                <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',
                  gap:'10px',padding:'8px 12px',borderRadius:'4px',
                  background:isSelected?'#1a5276':'#fff',
                  border:`1px solid ${isSelected?'#1a5276':'#c8b89a'}`,
                  cursor:'pointer'}}
                  onClick={()=>setSelIdx(i)}>
                  <div>
                    <div style={{fontWeight:700,fontSize:'.84rem',
                      color:isSelected?'#fff':'#3d2b1f'}}>
                      {p.name || `Puzzle ${i+1}`}
                    </div>
                    <div style={{fontSize:'.75rem',
                      color:isSelected?'rgba(255,255,255,.75)':'#8a7360',marginTop:'2px'}}>
                      {mode.name || p.modeId} · {p.gridSize||p.puzzle?.length||'?'}×{p.gridSize||p.puzzle?.length||'?'} · {blanks} blank{blanks!==1?'s':''}
                      {p.targetSum ? ` · T=${p.targetSum}` : ''}
                    </div>
                  </div>
                  <button
                    onClick={e=>{e.stopPropagation(); loadFromCollection(i);}}
                    style={{...BTN('success'),padding:'4px 12px',fontSize:'.76rem',flexShrink:0}}>
                    Load
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── JSON FORMAT REFERENCE ── */}
      <div style={{background:'#fff',border:'1px solid #e0d6c8',borderRadius:'5px',padding:'14px 16px',marginBottom:'16px'}}>
        <div style={{fontWeight:700,color:'#3d2b1f',fontSize:'.84rem',marginBottom:'8px'}}>JSON Format Reference</div>
        <div style={{fontFamily:'monospace',fontSize:'.76rem',lineHeight:'1.8',color:'#444',
          background:'#fdf8f3',borderRadius:'3px',padding:'10px 12px',whiteSpace:'pre'}}>
{`// Single puzzle:
{
  "name":      "My Puzzle",
  "modeId":    "rowsOnly",
  "gridSize":  3,
  "puzzle":    [[1, 7, "?"], [13, "?", 1], ["?", 1, 13]],
  "targetSum": null
}

// Collection of puzzles:
{
  "puzzles": [
    { "name": "Easy 1", "modeId": "rowsOnly",  "gridSize": 3, "puzzle": [...] },
    { "name": "Boss 1", "modeId": "bossChamber","gridSize": 3, "puzzle": [...], "targetSum": 39 }
  ]
}`}
        </div>
        <div style={{marginTop:'8px',fontSize:'.78rem',color:'#8a7360'}}>
          <strong>Valid modeIds:</strong> {Object.keys(MODES).join(' · ')}
        </div>
      </div>

      <button style={BTN('primary')} onClick={onClose}>Back to Game</button>
    </div>
  );
};

/* ══════════════════════════════════════════════════
   ROOT APP
══════════════════════════════════════════════════ */
export default function CollapseApp({onQuit}) {
  const [view, setView] = useState('game');
  const [settings, setSettings] = useState(()=>{
    try { const s=localStorage.getItem('cts_v8'); return s?{...DEFAULTS,...JSON.parse(s)}:DEFAULTS; }
    catch { return DEFAULTS; }
  });
  const updateSettings = (s) => {
    setSettings(s);
    try { localStorage.setItem('cts_v8', JSON.stringify(s)); } catch {}
  };

  const [ps, setPs] = useState({puzzle:null, fixedCells:null, targetSum:null});

  const newGame = useCallback(()=>{
    const res = generatePuzzle(settings.gridSize, settings.blanks, settings.modeId);
    if (res) {
      const fixed = res.puzzle.map(r=>r.map(c=>c!=='?'));
      setPs({puzzle:res.puzzle, fixedCells:fixed, targetSum:res.targetSum});
      setView('game');
    } else {
      alert(`Could not generate a ${MODES[settings.modeId].name} puzzle. Try fewer blanks.`);
    }
  },[settings.gridSize, settings.blanks, settings.modeId]);

  const setPuzzle = (next) => setPs(prev=>({...prev, puzzle:typeof next==='function'?next(prev.puzzle):next}));

  const handleLoadPuzzle = ({puzzle, fixedCells, targetSum, modeId: loadedMode}) => {
    setPs({puzzle, fixedCells, targetSum: targetSum||null});
    // Switch to loaded mode if different
    if (loadedMode && loadedMode !== settings.modeId && MODES[loadedMode]) {
      updateSettings({...settings, modeId: loadedMode});
    }
    setView('game');
  };
  const {puzzle, fixedCells, targetSum} = ps;
  const modeColor = MODES[settings.modeId].color;

  const NAV = [
    {id:'game',        label:'Game'},
    {id:'new',         label:'New Game', action:newGame},
    {id:'puzzleio',     label:'Import/Export'},
    {id:'walkthrough', label:'Walkthrough'},
    {id:'solvex',      label:'Solve for X'},
    {id:'coherence',   label:'Coherence'},
    {id:'rules',       label:'Rules'},
    {id:'puzzleio',    label:'Import/Export'},
    {id:'setup',       label:'Setup'},
    ...(onQuit?[{id:'quit',label:'Quit',action:onQuit}]:[]),
  ];

  const nb = (active) => ({
    background:active?'#3d2b1f':'transparent', color:active?'#f5f2eb':'#3d2b1f',
    border:'1.5px solid #3d2b1f', padding:'4px 11px', cursor:'pointer',
    fontSize:'.74rem', letterSpacing:'.05em', textTransform:'uppercase',
    borderRadius:'2px', fontFamily:'inherit',
  });

  return (
    <div style={{minHeight:'100vh',background:settings.pageBg,fontFamily:"'Georgia','Times New Roman',serif",color:'#1a1a1a',display:'flex',flexDirection:'column',alignItems:'center'}}>
      <header style={{width:'100%',borderBottom:`2px solid ${modeColor}`,background:'#fff',padding:'11px 18px',display:'flex',alignItems:'center',justifyContent:'space-between',boxSizing:'border-box',boxShadow:'0 1px 8px rgba(0,0,0,.06)',flexWrap:'wrap',gap:'7px'}}>
        <div style={{fontSize:'.95rem',fontWeight:700,letterSpacing:'.04em',color:'#3d2b1f',textTransform:'uppercase',whiteSpace:'nowrap'}}>Collapse Through Symbol</div>
        <nav style={{display:'flex',gap:'4px',flexWrap:'wrap'}}>
          {NAV.map(item=>(
            <button key={item.id} style={nb(view===item.id&&!item.action)}
              onClick={()=>{if(item.action)item.action();else setView(item.id);}}>
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',padding:'24px 14px 56px',width:'100%',boxSizing:'border-box',maxWidth:'800px',margin:'0 auto'}}>
        <div style={{fontSize:'1.35rem',fontWeight:700,marginBottom:'2px',color:'#3d2b1f',letterSpacing:'.02em',textAlign:'center'}}>Collapse Through Symbol</div>
        <div style={{fontSize:'.72rem',color:'#8a7360',marginBottom:'22px',letterSpacing:'.06em',textTransform:'uppercase',textAlign:'center'}}>
          v8.01 Claude House Edition — <span style={{color:modeColor,fontWeight:700}}>{MODES[settings.modeId].tierName} · {MODES[settings.modeId].name}</span>
        </div>

        {view==='game'        && <GameplayView    puzzle={puzzle} setPuzzle={setPuzzle} fixedCells={fixedCells} settings={settings} modeId={settings.modeId} targetSum={targetSum} onSolve={()=>setView('solver')}/>}
        {view==='puzzleio'    && <PuzzleIOView
          puzzle={puzzle}
          fixedCells={fixedCells}
          modeId={settings.modeId}
          targetSum={targetSum}
          onLoadPuzzle={({puzzle:p, fixedCells:f, modeId:m, targetSum:t}) => {
            setPs({puzzle:p, fixedCells:f, targetSum:t});
            setSettings(prev => ({...prev, modeId:m}));
            setView('game');
          }}
          onClose={()=>setView('game')}
        />}
        {view==='walkthrough' && <WalkthroughView modeId={settings.modeId} onClose={()=>setView('game')}/>}
        {view==='coherence'   && <CoherenceView onClose={()=>setView('game')}/>}
        {view==='solvex'      && <SolveForXView   modeId={settings.modeId} onClose={()=>setView('game')}/>}
        {view==='rules'       && <RulesView       modeId={settings.modeId} onClose={()=>setView('game')}/>}
        {view==='setup'       && <SetupView       settings={settings} updateSettings={updateSettings} onClose={()=>setView('game')}/>}
        {view==='solver'      && <SolverView      puzzle={puzzle} modeId={settings.modeId} targetSum={targetSum} onClose={()=>setView('game')}/>}
      </main>
    </div>
  );
}
