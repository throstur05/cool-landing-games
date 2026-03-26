// Collapse_Through_Symbol_sacred_geometry.jsx
// Claude House Edition — Sacred Geometry Board System
// Light background. Grid cells arranged in Triangle, Square, Circle, Spiral,
// Vesica, Hexagon, and mixed compound shapes.

import React, { useState, useCallback, useEffect, useRef } from 'react';

/* ══════════════════════════════════════════════════════════════
   MATH CORE
══════════════════════════════════════════════════════════════ */
const digitalRoot = (n) => n <= 0 ? 0 : 1 + ((n - 1) % 9);
const lineSum     = (arr) => arr.reduce((a,b) => a + (typeof b === 'number' ? b : 0), 0);

const ALL_CANDS = [1,5,7,11,13,17,19,23];
const A_TYPE    = [1,7,13,19];
const B_TYPE    = [5,11,17,23];

const isDiv3  = (arr) => lineSum(arr) % 3 === 0;
const isDR369 = (arr) => { const dr = digitalRoot(lineSum(arr)); return dr===3||dr===6||dr===9; };

const getRows  = (g) => g;
const getCols  = (g) => g[0].map((_,c) => g.map(r => r[c]));
const getDiags = (g) => {
  const N = g.length;
  return [g.map((r,i) => r[i]), g.map((r,i) => r[N-1-i])];
};

const shuffle = (a) => [...a].sort(() => Math.random() - .5);

/* ══════════════════════════════════════════════════════════════
   MODES (same as v8)
══════════════════════════════════════════════════════════════ */
const MODES = {
  rowsOnly:{
    id:'rowsOnly',tier:1,tierName:'Basic',color:'#4a7c59',
    name:'Rows Only',short:'Row sums ÷ 3',cands:ALL_CANDS,
    validate(g){
      for(const r of getRows(g)) if(!isDiv3(r)) return {ok:false,msg:`Row sum ${lineSum(r)} not ÷3`};
      return {ok:true};
    },
    howto:['Values from {1,5,7,11,13,17,19,23}','Every row sum divisible by 3','A-type {1,7,13,19} ≡1 mod 3 · B-type {5,11,17,23} ≡2 mod 3 · valid row = all same type'],
  },
  rowsAndCols:{
    id:'rowsAndCols',tier:1,tierName:'Basic',color:'#4a7c59',
    name:'Rows & Cols',short:'Rows and columns ÷ 3',cands:ALL_CANDS,
    validate(g){
      for(const r of getRows(g)) if(!isDiv3(r)) return {ok:false,msg:`Row sum ${lineSum(r)} not ÷3`};
      for(const c of getCols(g)) if(!isDiv3(c)) return {ok:false,msg:`Col sum ${lineSum(c)} not ÷3`};
      return {ok:true};
    },
    howto:['Values from {1,5,7,11,13,17,19,23}','Every row AND column sum divisible by 3','Determine row/col type from clues then fill blanks'],
  },
  withDiagonals:{
    id:'withDiagonals',tier:2,tierName:'Standard',color:'#2c5f8a',
    name:'With Diagonals',short:'Rows + cols + diagonals ÷ 3',cands:ALL_CANDS,
    validate(g){
      for(const r of getRows(g)) if(!isDiv3(r)) return {ok:false,msg:`Row ${lineSum(r)} not ÷3`};
      for(const c of getCols(g)) if(!isDiv3(c)) return {ok:false,msg:`Col ${lineSum(c)} not ÷3`};
      for(const d of getDiags(g)) if(!isDiv3(d)) return {ok:false,msg:`Diag ${lineSum(d)} not ÷3`};
      return {ok:true};
    },
    howto:['All values from {1,5,7,11,13,17,19,23}','Rows, columns, and BOTH diagonals ÷3','Center cell is on both diagonals — solve last'],
  },
  exactSum:{
    id:'exactSum',tier:3,tierName:'Advanced',color:'#7d4e00',
    name:'Exact Sum',short:'All lines sum to target T',cands:ALL_CANDS,targetSum:39,
    validate(g,T){
      const t=T||39;
      for(const r of getRows(g)) if(lineSum(r)!==t) return {ok:false,msg:`Row=${lineSum(r)} need ${t}`};
      for(const c of getCols(g)) if(lineSum(c)!==t) return {ok:false,msg:`Col=${lineSum(c)} need ${t}`};
      for(const d of getDiags(g)) if(lineSum(d)!==t) return {ok:false,msg:`Diag=${lineSum(d)} need ${t}`};
      return {ok:true};
    },
    howto:['Every row, column, and diagonal sums to exactly T','x = T − a − b · check x ∈ S','Negative or out-of-S result = no solution'],
  },
  symmetryMode:{
    id:'symmetryMode',tier:3,tierName:'Advanced',color:'#7d4e00',
    name:'Symmetry',short:'Rotational symmetry + ÷3',cands:ALL_CANDS,
    validate(g){
      const N=g.length;
      for(let r=0;r<N;r++) for(let c=0;c<N;c++)
        if(g[r][c]!==g[N-1-r][N-1-c]) return {ok:false,msg:`Symmetry broken at (${r+1},${c+1})`};
      for(const r of getRows(g)) if(!isDiv3(r)) return {ok:false,msg:`Row ${lineSum(r)} not ÷3`};
      for(const c of getCols(g)) if(!isDiv3(c)) return {ok:false,msg:`Col ${lineSum(c)} not ÷3`};
      for(const d of getDiags(g)) if(!isDiv3(d)) return {ok:false,msg:`Diag ${lineSum(d)} not ÷3`};
      return {ok:true};
    },
    howto:['Grid must be rotationally symmetric: M[r][c]=M[N-r][N-c]','Filling one blank forces its rotational partner','Symmetric rows [a,b,a] — solve center first'],
  },
  bossChamber:{
    id:'bossChamber',tier:4,tierName:'Boss',color:'#6a0a0a',
    name:'Boss Chamber',short:'Exact T + symmetry',cands:ALL_CANDS,targetSum:39,
    validate(g,T){
      const t=T||39, N=g.length;
      for(let r=0;r<N;r++) for(let c=0;c<N;c++)
        if(g[r][c]!==g[N-1-r][N-1-c]) return {ok:false,msg:`Symmetry broken`};
      for(const r of getRows(g)) if(lineSum(r)!==t) return {ok:false,msg:`Row=${lineSum(r)} need ${t}`};
      for(const c of getCols(g)) if(lineSum(c)!==t) return {ok:false,msg:`Col=${lineSum(c)} need ${t}`};
      for(const d of getDiags(g)) if(lineSum(d)!==t) return {ok:false,msg:`Diag=${lineSum(d)} need ${t}`};
      return {ok:true};
    },
    howto:['Exact target T on ALL lines AND rotational symmetry','Solve center first, then corner pairs: 2a+b=T','Most cells fully forced — very few valid configurations'],
  },
};

const MODE_ORDER = ['rowsOnly','rowsAndCols','withDiagonals','exactSum','symmetryMode','bossChamber'];
const TIER_COLORS = {1:'#4a7c59',2:'#2c5f8a',3:'#7d4e00',4:'#6a0a0a'};
const TIER_NAMES  = {1:'Basic',2:'Standard',3:'Advanced',4:'Boss'};

/* ══════════════════════════════════════════════════════════════
   SACRED GEOMETRY — BOARD SHAPE DEFINITIONS
   Each shape defines:
   - id, name, symbol, glyph (SVG for selector)
   - getLayout(N): returns { cells: [{row,col}], lines: [[idx,...]] }
     cells = which (row,col) positions exist in the logical grid
     lines = groups of cell-indices that must satisfy the divisibility rule
══════════════════════════════════════════════════════════════ */

/* Helper: all N×N positions */
const fullGrid = (N) => {
  const cells = [];
  for(let r=0;r<N;r++) for(let c=0;c<N;c++) cells.push({r,c});
  return cells;
};

/* Helper: find cell index by (r,c) */
const ci = (cells, r, c) => cells.findIndex(cl => cl.r===r && cl.c===c);

/* TRIANGLE — 5-row upward triangle (15 cells).
   Only lines of exactly 3 cells are used: row triplets and edge triplets.
   Cell index formula: row r, position pos → r*(r+1)/2 + pos */
const triangleLayout = () => {
  const rows = 5;
  const cellIdx = (r, pos) => r*(r+1)/2 + pos;
  const cells = [];
  for(let r = 0; r < rows; r++)
    for(let pos = 0; pos <= r; pos++)
      cells.push({r, pos, triCell: true});

  const lines = [];
  // Row triplets (rows with ≥3 cells)
  for(let r = 0; r < rows; r++) {
    const rowCells = Array.from({length: r+1}, (_, pos) => cellIdx(r, pos));
    for(let k = 0; k <= rowCells.length - 3; k++)
      lines.push([rowCells[k], rowCells[k+1], rowCells[k+2]]);
  }
  // Left edge triplets: pos=0 of each row → [0,1,3,6,10]
  const leftEdge = Array.from({length: rows}, (_, r) => cellIdx(r, 0));
  for(let k = 0; k <= leftEdge.length - 3; k++)
    lines.push([leftEdge[k], leftEdge[k+1], leftEdge[k+2]]);
  // Right edge triplets: pos=r of each row → [0,2,5,9,14]
  const rightEdge = Array.from({length: rows}, (_, r) => cellIdx(r, r));
  for(let k = 0; k <= rightEdge.length - 3; k++)
    lines.push([rightEdge[k], rightEdge[k+1], rightEdge[k+2]]);

  return {cells, lines, label:'△ Triangle (5 rows)'};
};

/* SQUARE — full N×N grid */
const squareLayout = (N) => {
  const cells = fullGrid(N);
  const lines = [];
  // Rows
  for(let r=0;r<N;r++){
    lines.push(cells.map((cl,i)=>cl.r===r?i:-1).filter(i=>i>=0));
  }
  // Cols
  for(let c=0;c<N;c++){
    lines.push(cells.map((cl,i)=>cl.c===c?i:-1).filter(i=>i>=0));
  }
  // Diagonals
  lines.push(cells.map((cl,i)=>cl.r===cl.c?i:-1).filter(i=>i>=0));
  lines.push(cells.map((cl,i)=>cl.r+cl.c===N-1?i:-1).filter(i=>i>=0));
  return {cells, lines, label:`□ Square (${N}×${N})`};
};

/* CIRCLE — ring + optional center */
const circleLayout = (N) => {
  // N = number of ring positions (use 6,8,9,12 etc.)
  // We support N=6,8,9
  const count = N <= 4 ? 6 : N <= 6 ? 8 : 9;
  const cells = [];
  // Ring cells
  for(let i=0;i<count;i++) cells.push({r:0, c:i, ring:true, angle:(i/count)*2*Math.PI});
  // Center
  cells.push({r:1, c:0, ring:false, center:true});
  const lines = [];
  // Each adjacent triplet on ring: (i, i+1, i+2) mod count
  for(let i=0;i<count;i++){
    lines.push([i, (i+1)%count, (i+2)%count]);
  }
  // Spokes: center + opposite ring pairs
  for(let i=0;i<count/2;i++){
    lines.push([i, count, i+count/2]);
  }
  return {cells: cells.slice(0,count+1), lines, label:`○ Circle (${count}+1)`};
};

/* SPIRAL — cells placed along an Archimedean spiral curve (polar coords).
   Each cell sits at angle θ with radius growing as θ increases.
   Lines connect consecutive triplets along the path.
   No grid coordinates — pure spiral geometry. */
const spiralLayout = () => {
  const N = 16; // number of cells along the spiral arm
  // Store only the path index; pixel positions are computed in computePositions
  const cells = [];
  for(let i = 0; i < N; i++) cells.push({spiralIdx: i});
  const lines = [];
  for(let i = 0; i < N - 2; i++) lines.push([i, i+1, i+2]);
  return {cells, lines, label:'🌀 Spiral (16 cells)'};
};

/* VESICA PISCIS — two 3×3 squares sharing their center column (col 2).
   Left square: cols 0-2.  Right square: cols 2-4.  Shared column: col 2.
   Total: 15 unique cells.  Lines deduplicated so col-2 lines appear only once. */
const vesicaLayout = () => {
  const cells = [];
  for(let r = 0; r < 3; r++)
    for(let c = 0; c < 5; c++)
      cells.push({r, c});

  const ci2 = (r, c) => cells.findIndex(cl => cl.r===r && cl.c===c);
  const rawLines = [];

  // Left square rows (cols 0-2)
  for(let r = 0; r < 3; r++) rawLines.push([ci2(r,0), ci2(r,1), ci2(r,2)]);
  // Right square rows (cols 2-4)
  for(let r = 0; r < 3; r++) rawLines.push([ci2(r,2), ci2(r,3), ci2(r,4)]);
  // Left square columns (cols 0-2)
  for(let c = 0; c < 3; c++) rawLines.push([ci2(0,c), ci2(1,c), ci2(2,c)]);
  // Right square columns (cols 2-4)
  for(let c = 2; c < 5; c++) rawLines.push([ci2(0,c), ci2(1,c), ci2(2,c)]);
  // Left diagonals
  rawLines.push([ci2(0,0), ci2(1,1), ci2(2,2)]);
  rawLines.push([ci2(2,0), ci2(1,1), ci2(0,2)]);
  // Right diagonals
  rawLines.push([ci2(0,2), ci2(1,3), ci2(2,4)]);
  rawLines.push([ci2(2,2), ci2(1,3), ci2(0,4)]);

  // Deduplicate (col-2 column appears in both left and right col lists)
  const seen = new Set();
  const lines = rawLines.filter(l => {
    const key = JSON.stringify(l.slice().sort((a,b) => a-b));
    if(seen.has(key)) return false;
    seen.add(key); return true;
  });

  return {cells, lines, label:'⋈ Vesica (3×5)'};
};

/* HEXAGON — hexagonal lattice, 7 cells (1+6) or 19 cells (1+6+12) */
const hexagonLayout = (N) => {
  // Axial hex coordinates for a hex of radius r
  const radius = N <= 4 ? 1 : 2;
  const cells = [];
  const axial = [];
  for(let q=-radius;q<=radius;q++){
    for(let s=-radius;s<=radius;s++){
      const t = -q-s;
      if(Math.abs(t)<=radius) { cells.push({r:s+radius,c:q+radius,q,s,t}); axial.push({q,s,t}); }
    }
  }
  // Lines: each of 3 axis directions, all runs of 3+ collinear cells
  const lines = [];
  const dirs = [[1,0,-1],[0,1,-1],[1,-1,0]];
  dirs.forEach(([dq,ds])=>{
    const seen = new Set();
    cells.forEach((cl,i)=>{
      if(seen.has(i)) return;
      const run = [i];
      let nq=cl.q+dq, ns=cl.s+ds;
      while(true){
        const ni = cells.findIndex(c=>c.q===nq&&c.s===ns);
        if(ni<0) break;
        run.push(ni); seen.add(ni); nq+=dq; ns+=ds;
      }
      if(run.length>=3){
        for(let k=0;k<=run.length-3;k++) lines.push([run[k],run[k+1],run[k+2]]);
      }
    });
  });
  return {cells, lines, label:`⬡ Hexagon (r=${radius})`};
};

/* ── MIXED SHAPES ── */
const triangleSquareLayout = () => {
  // 3×3 square base + apex cell above center column
  const sq = squareLayout(3);
  // sq cells are in row-major order: row0=[{r:0,c:0},{r:0,c:1},{r:0,c:2}], etc.
  const apexCell = {apexTag: true};
  const sqCells  = sq.cells.map(cl => ({...cl, sqTag: true}));
  const allCells = [apexCell, ...sqCells];
  // Square lines shift by 1 (apex is index 0)
  const lines = sq.lines.map(l => l.map(i => i + 1));
  // Apex (0) + top-left (1, idx of r=0,c=0) + top-right (3, idx of r=0,c=2)
  lines.push([0, 1, 3]);
  // Apex + top-center (2) + center (5, r=1,c=1)
  lines.push([0, 2, 5]);
  return {cells: allCells, lines, label: '△□ Triangle+Square'};
};

const triangleCircleLayout = () => {
  // Triangle (3 rows = 6 cells) + ring of 6 cells around it
  const tri = triangleLayout();
  const ringCount = 6;
  // Tag triangle cells explicitly
  const triCells = tri.cells.map(cl => ({...cl, triTag: true}));
  const ringCells = [];
  for(let i = 0; i < ringCount; i++) {
    ringCells.push({ringTag: true, ringIdx: i, angle: (i / ringCount) * 2 * Math.PI});
  }
  const allCells = [...triCells, ...ringCells];
  const ringStart = triCells.length;
  // Triangle lines unchanged
  const triLines = tri.lines;
  // Ring: consecutive triplets
  const ringLines = [];
  for(let i = 0; i < ringCount; i++) {
    ringLines.push([ringStart + i, ringStart + (i+1) % ringCount, ringStart + (i+2) % ringCount]);
  }
  // Bridge: apex (idx 0) + two ring cells opposite
  const bridgeLine = [0, ringStart + 0, ringStart + 3];
  return {cells: allCells, lines: [...triLines, ...ringLines, bridgeLine], label: '△○ Triangle+Circle'};
};

const squareCircleLayout = () => {
  // 3x3 square + outer ring of 8
  const sq = squareLayout(3);
  const ringCount = 8;
  const sqCells = sq.cells.map(cl => ({...cl, sqTag: true}));
  const ringCells = [];
  for(let i = 0; i < ringCount; i++) {
    ringCells.push({ringTag: true, ringIdx: i, angle: (i / ringCount) * 2 * Math.PI});
  }
  const allCells = [...sqCells, ...ringCells];
  const ringStart = sqCells.length;
  const sqLines = sq.lines;
  const ringLines = [];
  for(let i = 0; i < ringCount; i++) {
    ringLines.push([ringStart + i, ringStart + (i+1) % ringCount, ringStart + (i+2) % ringCount]);
  }
  // Corner spokes: sq corner idx → two adjacent ring cells
  // sq cells are in row-major order: [0,0]=0,[0,1]=1,[0,2]=2,[1,0]=3,...,[2,2]=8
  const spokeLines = [
    [0, ringStart+7, ringStart+0],  // top-left corner → ring top
    [2, ringStart+1, ringStart+2],  // top-right
    [6, ringStart+5, ringStart+6],  // bottom-left
    [8, ringStart+3, ringStart+4],  // bottom-right
  ];
  return {cells: allCells, lines: [...sqLines, ...ringLines, ...spokeLines], label: '□○ Square+Circle'};
};

const spiralHexLayout = () => {
  // Hexagon r=1 (7 cells) + spiral arm of 3 cells attached
  const hex = hexagonLayout(3);
  // Spiral arm: 3 extra cells off edge
  const spiralArm = [{r:30,c:0,arm:true},{r:30,c:1,arm:true},{r:30,c:2,arm:true}];
  const allCells = [...hex.cells, ...spiralArm];
  const armStart = hex.cells.length;
  const hexLines = hex.lines;
  // Arm consecutive triplet
  const armLine = [armStart, armStart+1, armStart+2];
  // Connect arm to hex
  const bridgeLine = [0, armStart, armStart+1]; // center hex → arm
  return {cells:allCells, lines:[...hexLines, armLine, bridgeLine], label:`🌀⬡ Spiral+Hex`};
};

const vesicaTriangleLayout = () => {
  const ves = vesicaLayout();
  // Use a small 3-row triangle (6 cells, 3 lines) so the combined shape stays solvable
  const triRowCount = 3;
  const cellIdx = (r, pos) => r*(r+1)/2 + pos;
  const triCells = [];
  for(let r = 0; r < triRowCount; r++)
    for(let pos = 0; pos <= r; pos++)
      triCells.push({triTag: true, triR: r, triPos: pos});
  const triLines = [];
  triLines.push([cellIdx(2,0), cellIdx(2,1), cellIdx(2,2)]); // base row
  triLines.push([cellIdx(0,0), cellIdx(1,0), cellIdx(2,0)]); // left edge
  triLines.push([cellIdx(0,0), cellIdx(1,1), cellIdx(2,2)]); // right edge
  const vesCells = ves.cells.map(cl => ({...cl, vesTag: true}));
  const allCells = [...vesCells, ...triCells];
  const vStart = vesCells.length;
  const shiftedTriLines = triLines.map(l => l.map(i => i + vStart));
  return {cells: allCells, lines: [...ves.lines, ...shiftedTriLines], label: '⋈△ Vesica+Triangle'};
};

const hexagonSpiralLayout = () => {
  // Hex r=1 + 12-cell spiral arm
  const hex = hexagonLayout(3);
  const armLen = 9;
  const armCells = [];
  for(let i=0;i<armLen;i++) armCells.push({r:50+i,c:0,arm:true});
  const allCells = [...hex.cells, ...armCells];
  const armStart = hex.cells.length;
  const hexLines = hex.lines;
  const armLines = [];
  for(let i=0;i<armLen-2;i++) armLines.push([armStart+i,armStart+i+1,armStart+i+2]);
  return {cells:allCells, lines:[...hexLines,...armLines], label:`⬡🌀 Hex+Spiral`};
};

/* ══════════════════════════════════════════════════════════════
   SHAPE REGISTRY
══════════════════════════════════════════════════════════════ */
const SHAPES = {
  triangle:     { id:'triangle',     name:'Triangle',         symbol:'△',  color:'#c0392b', category:'pure',
                  getLayout:()=>triangleLayout() },
  square:       { id:'square',       name:'Square',           symbol:'□',  color:'#2c5f8a', category:'pure',
                  getLayout:(N)=>squareLayout(Math.min(N,5)) },
  circle:       { id:'circle',       name:'Circle',           symbol:'○',  color:'#2e7d45', category:'pure',
                  getLayout:(N)=>circleLayout(N) },
  spiral:       { id:'spiral',       name:'Spiral',           symbol:'🌀', color:'#1a5276', category:'pure',
                  getLayout:()=>spiralLayout() },
  vesica:       { id:'vesica',       name:'Vesica Piscis',    symbol:'⋈',  color:'#7d4e00', category:'pure',
                  getLayout:()=>vesicaLayout() },
  hexagon:      { id:'hexagon',      name:'Hexagon',          symbol:'⬡',  color:'#5a189a', category:'pure',
                  getLayout:(N)=>hexagonLayout(N) },
  triSquare:    { id:'triSquare',    name:'Triangle + Square', symbol:'△□', color:'#c0392b', category:'mix',
                  getLayout:()=>triangleSquareLayout() },
  triCircle:    { id:'triCircle',    name:'Triangle + Circle', symbol:'△○', color:'#2e7d45', category:'mix',
                  getLayout:()=>triangleCircleLayout() },
  squareCircle: { id:'squareCircle', name:'Square + Circle',   symbol:'□○', color:'#2c5f8a', category:'mix',
                  getLayout:()=>squareCircleLayout() },
  spiralHex:    { id:'spiralHex',    name:'Spiral + Hex',      symbol:'🌀⬡',color:'#5a189a', category:'mix',
                  getLayout:()=>spiralHexLayout() },
  vesicaTri:    { id:'vesicaTri',    name:'Vesica + Triangle', symbol:'⋈△', color:'#7d4e00', category:'mix',
                  getLayout:()=>vesicaTriangleLayout() },
  hexSpiral:    { id:'hexSpiral',    name:'Hex + Spiral',      symbol:'⬡🌀',color:'#5a189a', category:'mix',
                  getLayout:()=>hexagonSpiralLayout() },
};

const SHAPE_ORDER_PURE = ['triangle','square','circle','spiral','vesica','hexagon'];
const SHAPE_ORDER_MIX  = ['triSquare','triCircle','squareCircle','spiralHex','vesicaTri','hexSpiral'];

/* ══════════════════════════════════════════════════════════════
   GEOMETRY RENDERER
   Given a shape's cells list, computes pixel positions for each cell.
══════════════════════════════════════════════════════════════ */
const CELL_SIZE = 52;
const CELL_GAP  = 6;

const computePositions = (cells, shapeId) => {
  const S = CELL_SIZE, G = CELL_GAP, SG = S + G;

  /* ── TRIANGLE (pure) ── 5-row equilateral triangle */
  if(shapeId === 'triangle') {
    const rows = 5;
    const positions = {};
    cells.forEach((cl, i) => {
      const rowOffset = ((rows - 1) - cl.r) * SG / 2;
      positions[i] = {
        x: rowOffset + cl.pos * SG,
        y: cl.r * SG * 0.88,
      };
    });
    // Centre
    const xs = Object.values(positions).map(p => p.x);
    const ys = Object.values(positions).map(p => p.y);
    const midX = (Math.min(...xs) + Math.max(...xs)) / 2;
    const midY = (Math.min(...ys) + Math.max(...ys)) / 2;
    Object.keys(positions).forEach(k => { positions[k].x -= midX; positions[k].y -= midY; });
    return positions;
  }

  /* ── CIRCLE (pure) ── */
  if(shapeId === 'circle') {
    const R = 130;
    const positions = {};
    const ringCells = cells.filter(cl => cl.ring);
    const center    = cells.find(cl => cl.center);
    ringCells.forEach((cl, i) => {
      const angle = cl.angle - Math.PI / 2;
      positions[i] = {x: R * Math.cos(angle), y: R * Math.sin(angle)};
    });
    if(center) positions[ringCells.length] = {x: 0, y: 0};
    return positions;
  }

  /* ── HEXAGON (pure) ── */
  if(shapeId === 'hexagon') {
    const hexSize = 52;
    const positions = {};
    cells.forEach((cl, i) => {
      positions[i] = {
        x: hexSize * (3/2 * cl.q),
        y: hexSize * (Math.sqrt(3)/2 * cl.q + Math.sqrt(3) * cl.s),
      };
    });
    return positions;
  }

  /* ── SPIRAL (pure) ── Archimedean spiral: r = a + b*theta */
  if(shapeId === 'spiral') {
    const N = cells.length;
    const positions = {};
    // Spiral parameters: start with small radius, grow outward over ~2 full turns
    const startAngle = Math.PI * 0.1;
    const totalAngle = Math.PI * 3.8; // ~1.9 full turns
    const rMin = 28, rMax = 170;
    cells.forEach((cl, i) => {
      const t     = i / (N - 1);
      const theta = startAngle + t * totalAngle;
      const rad   = rMin + t * (rMax - rMin);
      positions[i] = {
        x: rad * Math.cos(theta),
        y: rad * Math.sin(theta),
      };
    });
    return positions;
  }

  /* ── SQUARE (pure) ── */
  if(shapeId === 'square') {
    const minR = Math.min(...cells.map(cl => cl.r));
    const minC = Math.min(...cells.map(cl => cl.c));
    const positions = {};
    cells.forEach((cl, i) => {
      positions[i] = {x: (cl.c - minC) * SG, y: (cl.r - minR) * SG};
    });
    const xs = Object.values(positions).map(p => p.x);
    const ys = Object.values(positions).map(p => p.y);
    const midX = (Math.min(...xs) + Math.max(...xs)) / 2;
    const midY = (Math.min(...ys) + Math.max(...ys)) / 2;
    Object.keys(positions).forEach(k => { positions[k].x -= midX; positions[k].y -= midY; });
    return positions;
  }

  /* ── VESICA (pure) ── */
  if(shapeId === 'vesica') {
    const minR = Math.min(...cells.map(cl => cl.r));
    const minC = Math.min(...cells.map(cl => cl.c));
    const positions = {};
    cells.forEach((cl, i) => {
      positions[i] = {x: (cl.c - minC) * SG, y: (cl.r - minR) * SG};
    });
    const xs = Object.values(positions).map(p => p.x);
    const ys = Object.values(positions).map(p => p.y);
    const midX = (Math.min(...xs) + Math.max(...xs)) / 2;
    const midY = (Math.min(...ys) + Math.max(...ys)) / 2;
    Object.keys(positions).forEach(k => { positions[k].x -= midX; positions[k].y -= midY; });
    return positions;
  }

  /* ── TRIANGLE + SQUARE ── */
  if(shapeId === 'triSquare') {
    const positions = {};
    // sq cells: 9 cells in row-major order r=0..2, c=0..2. apexCell is index 0.
    cells.forEach((cl, i) => {
      if(cl.apexTag) {
        // Apex above the center of top row: col 1 = x=SG, y=-(SG*1.1)
        positions[i] = {x: SG, y: -SG * 1.1};
      } else {
        // sqTag cells have r,c
        positions[i] = {x: cl.c * SG, y: cl.r * SG};
      }
    });
    // Centre
    const xs = Object.values(positions).map(p => p.x);
    const ys = Object.values(positions).map(p => p.y);
    const midX = (Math.min(...xs) + Math.max(...xs)) / 2;
    const midY = (Math.min(...ys) + Math.max(...ys)) / 2;
    Object.keys(positions).forEach(k => { positions[k].x -= midX; positions[k].y -= midY; });
    return positions;
  }

  /* ── TRIANGLE + CIRCLE ── */
  if(shapeId === 'triCircle') {
    const positions = {};
    const triCells  = cells.filter(cl => cl.triTag);
    const ringCells = cells.filter(cl => cl.ringTag);
    const ringR = 120, triRows = Math.max(...triCells.map(cl => cl.r)) + 1;

    // Triangle: scaled down, centred in upper part of ring
    const triScale = 0.55; // scale factor so 5-row triangle fits inside ring
    triCells.forEach((cl, _) => {
      const i = cells.indexOf(cl);
      const rowOffset = ((triRows - 1) - cl.r) * SG / 2;
      const rawX = rowOffset + cl.pos * SG - (triRows - 1) * SG / 2;
      const rawY = cl.r * SG * 0.88 - (triRows - 1) * SG * 0.88 / 2;
      positions[i] = {x: rawX * triScale, y: rawY * triScale};
    });

    // Ring: larger radius to surround the triangle
    const ringCy = 0;
    ringCells.forEach((cl, _) => {
      const i = cells.indexOf(cl);
      const angle = cl.angle - Math.PI / 2;
      positions[i] = {x: ringR * Math.cos(angle), y: ringCy + ringR * Math.sin(angle)};
    });
    return positions;
  }

  /* ── SQUARE + CIRCLE ── */
  if(shapeId === 'squareCircle') {
    const positions = {};
    const sqCells   = cells.filter(cl => cl.sqTag);
    const ringCells = cells.filter(cl => cl.ringTag);
    const ringR = 145;
    // Square centred at origin
    sqCells.forEach(cl => {
      const i = cells.indexOf(cl);
      positions[i] = {x: (cl.c - 1) * SG, y: (cl.r - 1) * SG};
    });
    // Ring centred at origin
    ringCells.forEach(cl => {
      const i = cells.indexOf(cl);
      const angle = cl.angle - Math.PI / 2;
      positions[i] = {x: ringR * Math.cos(angle), y: ringR * Math.sin(angle)};
    });
    return positions;
  }

  /* ── SPIRAL + HEX ── */
  if(shapeId === 'spiralHex') {
    const positions = {};
    const armCells = cells.filter(cl => cl.arm);
    const hexCells = cells.filter(cl => !cl.arm);
    const hexSize = 48;
    hexCells.forEach(cl => {
      const i = cells.indexOf(cl);
      positions[i] = {
        x: hexSize * (3/2 * cl.q),
        y: hexSize * (Math.sqrt(3)/2 * cl.q + Math.sqrt(3) * cl.s) - 70,
      };
    });
    armCells.forEach((cl, j) => {
      const i = cells.indexOf(cl);
      positions[i] = {x: -100 + j * SG * 0.85, y: 110};
    });
    return positions;
  }

  /* ── VESICA + TRIANGLE ── */
  if(shapeId === 'vesicaTri') {
    const positions = {};
    const vesCells = cells.filter(cl => cl.vesTag);
    const triCells = cells.filter(cl => cl.triTag);
    const triRows  = Math.max(...triCells.map(cl => cl.triR)) + 1;

    // Vesica: centred, placed in lower half
    const vesMinC = Math.min(...vesCells.map(cl => cl.c));
    const vesMaxC = Math.max(...vesCells.map(cl => cl.c));
    const vesCentreX = (vesMaxC - vesMinC) * SG / 2;
    vesCells.forEach(cl => {
      const i = cells.indexOf(cl);
      positions[i] = {x: (cl.c - vesMinC) * SG - vesCentreX, y: (cl.r) * SG + 30};
    });

    // Triangle: scaled down, placed above vesica centred at x=0
    const triScale = 0.7;
    triCells.forEach(cl => {
      const i = cells.indexOf(cl);
      const rowOffset = ((triRows - 1) - cl.triR) * SG / 2;
      const rawX = rowOffset + cl.triPos * SG - (triRows - 1) * SG / 2;
      const rawY = cl.triR * SG * 0.88 - (triRows - 1) * SG * 0.88 / 2;
      positions[i] = {
        x: rawX * triScale,
        y: rawY * triScale - (triRows - 1) * SG * triScale * 0.88 / 2 - 30,
      };
    });
    return positions;
  }

  /* ── HEX + SPIRAL ── */
  if(shapeId === 'hexSpiral') {
    const positions = {};
    const armCells = cells.filter(cl => cl.arm);
    const hexCells = cells.filter(cl => !cl.arm);
    const hexSize = 40;
    hexCells.forEach(cl => {
      const i = cells.indexOf(cl);
      positions[i] = {
        x: hexSize * (3/2 * cl.q) - 40,
        y: hexSize * (Math.sqrt(3)/2 * cl.q + Math.sqrt(3) * cl.s) - 90,
      };
    });
    armCells.forEach((cl, j) => {
      const i = cells.indexOf(cl);
      const angle = (j / armCells.length) * 1.7 * Math.PI + 0.2;
      const rad   = 65 + j * 24;
      positions[i] = {x: rad * Math.cos(angle), y: 60 + rad * Math.sin(angle) * 0.55};
    });
    return positions;
  }

  // Fallback: flat grid
  const positions = {};
  const minC = Math.min(...cells.map(cl => cl.c || 0));
  const minR = Math.min(...cells.map(cl => cl.r || 0));
  cells.forEach((cl, i) => {
    positions[i] = {x: ((cl.c || 0) - minC) * SG, y: ((cl.r || 0) - minR) * SG};
  });
  return positions;
};

/* ══════════════════════════════════════════════════════════════
   PUZZLE GENERATOR — backtracking, works for all shapes
══════════════════════════════════════════════════════════════ */
const generateGeoPuzzle = (shapeId, modeId, blanksPercent=0.4) => {
  const shape  = SHAPES[shapeId];
  const layout = shape.getLayout(4);
  const mode   = MODES[modeId];
  const cands  = mode.cands;
  const {cells, lines} = layout;
  const N = cells.length;

  const isExact = modeId==='exactSum'||modeId==='bossChamber';
  const T = isExact ? (mode.targetSum||39) : null;

  // Prune check: given partially-filled vals, are all complete lines still valid?
  const isConsistent = (vals) => {
    for(const line of lines){
      const lv = line.map(i => vals[i]);
      if(lv.some(v => v === null)) continue; // incomplete line — skip
      if(isExact){ if(lineSum(lv) !== T) return false; }
      else { if(!isDiv3(lv)) return false; }
    }
    return true;
  };

  // Backtracking fill with shuffled candidates
  const vals = new Array(N).fill(null);
  const bt = (idx) => {
    if(idx === N) return true;
    const shuffled = shuffle(cands);
    for(const v of shuffled) {
      vals[idx] = v;
      if(isConsistent(vals)) {
        if(bt(idx + 1)) return true;
      }
    }
    vals[idx] = null;
    return false;
  };

  if(!bt(0)) return null;

  // Create puzzle with blanks
  const blanks  = Math.max(1, Math.floor(N * blanksPercent));
  const puzzle  = [...vals];
  const fixed   = Array(N).fill(true);
  shuffle([...Array(N).keys()]).slice(0, blanks).forEach(i => {
    puzzle[i] = '?';
    fixed[i]  = false;
  });

  return {vals, puzzle, fixed, cells, lines, targetSum: T, layout};
};

/* ══════════════════════════════════════════════════════════════
   SOLVER
══════════════════════════════════════════════════════════════ */
const solvePuzzle = (puzzle, lines, modeId) => {
  const mode  = MODES[modeId];
  const cands = mode.cands;
  const isExact = modeId==='exactSum'||modeId==='bossChamber';
  const T = mode.targetSum||39;
  const vals = [...puzzle];
  const blanks = vals.map((v,i)=>v==='?'?i:-1).filter(i=>i>=0);
  const solutions = [];
  const validate = () => {
    for(const line of lines){
      const lv=line.map(i=>vals[i]);
      if(lv.some(v=>typeof v!=='number')) continue;
      if(isExact){ if(lineSum(lv)!==T) return false; }
      else { if(!isDiv3(lv)) return false; }
    }
    return true;
  };
  const bt = (idx) => {
    if(solutions.length>=4) return;
    if(idx===blanks.length){ if(validate()) solutions.push([...vals]); return; }
    const ci = blanks[idx];
    for(const v of cands){ vals[ci]=v; bt(idx+1); }
    vals[ci]='?';
  };
  bt(0);
  return solutions;
};

/* ══════════════════════════════════════════════════════════════
   STYLES & TOKENS
══════════════════════════════════════════════════════════════ */
const T = {
  parchment: '#f8f5ee',
  cream:     '#fdf9f2',
  ink:       '#2a1f0e',
  gold:      '#c9a84c',
  goldLight: '#e8d5a3',
  sage:      '#4a7c59',
  azure:     '#2c5f8a',
  rust:      '#c0392b',
  umber:     '#7d4e00',
  lavender:  '#5a189a',
  border:    '#d4c5a0',
  shadow:    'rgba(42,31,14,0.12)',
};

const injectStyles = () => `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Spectral:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Spectral+SC:wght@400;600&display=swap');

  * { box-sizing: border-box; }

  .cts-sg { font-family: 'Spectral', 'Georgia', serif; background: ${T.parchment}; color: ${T.ink}; min-height: 100vh; }

  .cts-title { font-family: 'Cinzel', serif; letter-spacing: 0.08em; }

  .cts-cell {
    position: absolute;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Cinzel', serif;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.18s ease;
    border-radius: 6px;
    user-select: none;
    transform: translate(-50%, -50%);
  }
  .cts-cell:hover { filter: brightness(0.95); }
  .cts-cell.fixed { cursor: default; }
  .cts-cell.selected { box-shadow: 0 0 0 3px ${T.gold}, 0 4px 16px ${T.shadow}; z-index: 10; }

  .cts-line-svg { position: absolute; top: 0; left: 0; pointer-events: none; }

  .shape-btn {
    font-family: 'Spectral SC', serif;
    border: 1.5px solid ${T.border};
    border-radius: 4px;
    padding: 6px 12px;
    background: ${T.cream};
    color: ${T.ink};
    cursor: pointer;
    transition: all 0.15s;
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.04em;
  }
  .shape-btn:hover { background: ${T.goldLight}; border-color: ${T.gold}; }
  .shape-btn.active { background: ${T.ink}; color: ${T.cream}; border-color: ${T.ink}; }

  .mode-btn {
    font-family: 'Spectral SC', serif;
    border-radius: 3px;
    padding: 4px 10px;
    cursor: pointer;
    transition: all 0.15s;
    font-size: 0.72rem;
    font-weight: 600;
  }

  .numpad-btn {
    font-family: 'Cinzel', serif;
    width: 48px; height: 42px;
    border-radius: 5px;
    border: 1.5px solid ${T.border};
    background: ${T.cream};
    color: ${T.ink};
    font-size: 0.88rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.12s;
  }
  .numpad-btn:hover { background: ${T.goldLight}; border-color: ${T.gold}; }
  .numpad-btn.active { background: ${T.ink}; color: ${T.cream}; border-color: ${T.ink}; }

  .action-btn {
    font-family: 'Cinzel', serif;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 7px 18px;
    border-radius: 3px;
    cursor: pointer;
    transition: all 0.15s;
  }
  .action-btn.primary { background: ${T.ink}; color: ${T.cream}; border: 1.5px solid ${T.ink}; }
  .action-btn.primary:hover { background: #3d2b1f; }
  .action-btn.success { background: ${T.sage}; color: #fff; border: 1.5px solid ${T.sage}; }
  .action-btn.success:hover { background: #3d6b4a; }
  .action-btn.ghost { background: transparent; color: ${T.ink}; border: 1.5px solid ${T.border}; }
  .action-btn.ghost:hover { border-color: ${T.ink}; }

  .panel {
    background: ${T.cream};
    border: 1px solid ${T.border};
    border-radius: 8px;
    padding: 22px 26px;
    box-shadow: 0 2px 16px ${T.shadow};
    max-width: 720px;
    width: 100%;
  }

  .panel-title {
    font-family: 'Cinzel', serif;
    font-size: 1.05rem;
    font-weight: 600;
    color: ${T.ink};
    border-bottom: 1px solid ${T.border};
    padding-bottom: 10px;
    margin-bottom: 18px;
    letter-spacing: 0.06em;
  }

  .section-label {
    font-family: 'Spectral SC', serif;
    font-size: 0.62rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: ${T.gold};
    margin: 16px 0 7px;
  }

  .tab-btn {
    font-family: 'Spectral SC', serif;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    padding: 4px 12px;
    border-radius: 2px;
    border: 1.5px solid ${T.border};
    cursor: pointer;
    background: ${T.cream};
    color: ${T.ink};
    transition: all 0.15s;
  }
  .tab-btn.active { background: ${T.ink}; color: ${T.cream}; border-color: ${T.ink}; }

  @keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:none; } }
  .fade-in { animation: fadeIn 0.25s ease; }

  .ornament { color: ${T.gold}; font-size: 1.1em; }
`;

/* ══════════════════════════════════════════════════════════════
   GEOMETRY CANVAS — renders cells & lines
══════════════════════════════════════════════════════════════ */
const GeometryCanvas = ({puzzle, fixed, cells, lines, positions, onSelect, selected, modeId, shapeId}) => {
  if(!cells||!positions) return null;
  const mode  = MODES[modeId];
  const shape = SHAPES[shapeId];
  const cands = mode.cands;

  // Compute bounding box for canvas
  const xs = Object.values(positions).map(p=>p.x);
  const ys = Object.values(positions).map(p=>p.y);
  const minX=Math.min(...xs), maxX=Math.max(...xs);
  const minY=Math.min(...ys), maxY=Math.max(...ys);
  const pad = CELL_SIZE + 20;
  const W = maxX-minX+2*pad+CELL_SIZE;
  const H = maxY-minY+2*pad+CELL_SIZE;
  const offX = -minX+pad, offY = -minY+pad;

  // Draw connection lines between cells in each line-group
  const lineSegs = [];
  lines.forEach((lineGroup, li)=>{
    for(let k=0;k<lineGroup.length-1;k++){
      const a = lineGroup[k], b = lineGroup[k+1];
      const pa = positions[a], pb = positions[b];
      if(!pa||!pb) return;
      lineSegs.push({x1:pa.x+offX,y1:pa.y+offY,x2:pb.x+offX,y2:pb.y+offY,key:`${li}-${k}`});
    }
  });

  return (
    <div style={{position:'relative',width:W,height:H,maxWidth:'100%',margin:'0 auto'}}>
      <svg className="cts-line-svg" width={W} height={H}>
        {lineSegs.map(seg=>(
          <line key={seg.key} x1={seg.x1} y1={seg.y1} x2={seg.x2} y2={seg.y2}
            stroke={T.goldLight} strokeWidth="1.5" strokeDasharray="4,3" opacity="0.7"/>
        ))}
      </svg>

      {cells.map((cl,i)=>{
        const pos = positions[i];
        if(!pos) return null;
        const val = puzzle[i];
        const isFixed  = fixed[i];
        const isSel    = selected===i;
        const isEmpty  = val==='?';
        const isA = A_TYPE.includes(val);
        const isB = B_TYPE.includes(val);

        const bg = isSel   ? '#e8f4ff'
                 : isFixed ? '#fff'
                 : isEmpty ? T.parchment
                 : '#fffbf0';

        const borderColor = isSel   ? T.azure
                          : isFixed ? T.border
                          : T.goldLight;

        const textColor = isFixed ? T.ink
                        : isEmpty ? '#c8b89a'
                        : isA    ? T.azure
                        : isB    ? T.umber
                        : T.ink;

        return (
          <div key={i}
            className={`cts-cell${isFixed?' fixed':''}${isSel?' selected':''}`}
            onClick={()=>{ if(!isFixed) onSelect(isSel?null:i); }}
            style={{
              left: pos.x+offX, top: pos.y+offY,
              width: CELL_SIZE, height: CELL_SIZE,
              background: bg,
              border: `${isSel?2:1.5}px ${isFixed?'solid':'dashed'} ${borderColor}`,
              fontSize: '1rem',
              color: textColor,
              boxShadow: isSel?`0 0 0 3px ${T.azure}30, 0 4px 16px ${T.shadow}`:`0 1px 6px ${T.shadow}`,
            }}>
            {isEmpty ? '?' : val}
            {!isEmpty && !isFixed && (
              <span style={{position:'absolute',top:2,right:3,fontSize:'8px',fontWeight:800,
                color: isA?T.azure:T.umber, opacity:0.7, fontFamily:'Spectral SC, serif'}}>
                {isA?'A':'B'}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   NUMBER PAD
══════════════════════════════════════════════════════════════ */
const NumberPad = ({value, onPick, onClear, onClose, cands, modeColor}) => {
  const aGroup = cands.filter(n=>A_TYPE.includes(n));
  const bGroup = cands.filter(n=>B_TYPE.includes(n));
  return (
    <div style={{
      background: T.cream, border: `2px solid ${modeColor}`,
      borderRadius: 10, padding: '14px 18px', marginTop: 12,
      boxShadow: `0 8px 32px ${T.shadow}`,
      display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 10,
    }}>
      {[['A-type', T.azure, aGroup], ['B-type', T.umber, bGroup]].map(([label,color,group])=>(
        group.length>0 && (
          <div key={label} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
            <div style={{fontSize:'.6rem',fontWeight:700,color,letterSpacing:'.08em',fontFamily:'Spectral SC,serif'}}>{label}</div>
            <div style={{display:'flex',gap:4}}>
              {group.map(n=>(
                <button key={n} className={`numpad-btn${value===n?' active':''}`}
                  onMouseDown={e=>{e.preventDefault();onPick(n);}}>
                  {n}
                </button>
              ))}
            </div>
          </div>
        )
      ))}
      <div style={{display:'flex',gap:8,marginTop:2}}>
        <button onMouseDown={e=>{e.preventDefault();onClear();}}
          style={{padding:'5px 14px',border:`1.5px solid ${T.rust}`,borderRadius:4,background:'#fdecea',
            color:T.rust,fontWeight:700,fontSize:'.8rem',fontFamily:'Spectral,serif',cursor:'pointer'}}>
          Clear
        </button>
        <button onMouseDown={e=>{e.preventDefault();onClose();}}
          style={{padding:'5px 14px',border:`1.5px solid ${T.border}`,borderRadius:4,background:T.parchment,
            color:T.ink,fontWeight:700,fontSize:'.8rem',fontFamily:'Spectral,serif',cursor:'pointer'}}>
          Close
        </button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   SHAPE SELECTOR
══════════════════════════════════════════════════════════════ */
const ShapeSelector = ({shapeId, setShapeId}) => {
  const groups = [
    {label:'Pure Sacred Forms', ids:SHAPE_ORDER_PURE},
    {label:'Compound Forms',    ids:SHAPE_ORDER_MIX},
  ];
  return (
    <div className="panel" style={{marginBottom:18}}>
      <div className="panel-title">Sacred Geometry Board</div>
      {groups.map(grp=>(
        <div key={grp.label} style={{marginBottom:12}}>
          <div className="section-label">{grp.label}</div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {grp.ids.map(id=>{
              const s = SHAPES[id];
              return (
                <button key={id} className={`shape-btn${shapeId===id?' active':''}`}
                  onClick={()=>setShapeId(id)}
                  style={{borderColor:shapeId===id?s.color:T.border,
                    background:shapeId===id?s.color:'',
                    color:shapeId===id?'#fff':''}}>
                  {s.symbol} {s.name}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   MODE SELECTOR (compact)
══════════════════════════════════════════════════════════════ */
const ModeSelector = ({modeId, setModeId}) => (
  <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:14}}>
    {MODE_ORDER.map(id=>{
      const m=MODES[id]; const active=modeId===id;
      return (
        <button key={id} className="mode-btn"
          onClick={()=>setModeId(id)}
          style={{background:active?m.color:'#fff',color:active?'#fff':T.ink,
            border:`1.5px solid ${m.color}`}}>
          {m.name}
        </button>
      );
    })}
  </div>
);

/* ══════════════════════════════════════════════════════════════
   RULES PANEL
══════════════════════════════════════════════════════════════ */
const RulesPanel = ({modeId, onClose}) => {
  const mode = MODES[modeId];
  return (
    <div className="panel fade-in" style={{marginTop:16}}>
      <div className="panel-title">✦ Rules — {mode.name}</div>
      <div style={{background:'#1a3a5c',color:'#fff',borderRadius:6,padding:'12px 16px',marginBottom:14,fontFamily:'monospace',fontSize:'.8rem',lineHeight:1.8,whiteSpace:'pre-wrap'}}>
        {`A-type {1, 7, 13, 19}  — each ≡ 1 mod 3
B-type {5, 11, 17, 23} — each ≡ 2 mod 3

Valid line = all A-type  OR  all B-type
Mixed A+B → ALWAYS INVALID`}
      </div>
      <div style={{background:T.parchment,border:`1px solid ${mode.color}`,borderRadius:5,padding:'12px 14px'}}>
        <div style={{fontWeight:700,color:mode.color,marginBottom:8,fontFamily:'Cinzel,serif',fontSize:'.9rem'}}>
          {mode.tierName} · {mode.name}
        </div>
        {mode.howto.map((tip,i)=>(
          <div key={i} style={{background:'#eaf1fb',border:'1px solid #bad0ef',borderRadius:3,
            padding:'6px 10px',marginBottom:5,fontSize:'.83rem',lineHeight:1.6,color:'#1a3a5c'}}>
            <span style={{fontWeight:700,fontFamily:'Spectral SC,serif'}}>Step {i+1}:</span> {tip}
          </div>
        ))}
      </div>
      <button className="action-btn ghost" style={{marginTop:14}} onClick={onClose}>← Back</button>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   SOLVER PANEL
══════════════════════════════════════════════════════════════ */
const SolverPanel = ({puzzle, lines, modeId, onClose}) => {
  const [solutions, setSolutions] = useState(null);
  const [running, setRunning] = useState(false);
  const run = ()=>{
    setRunning(true);
    setTimeout(()=>{setSolutions(solvePuzzle(puzzle,lines,modeId));setRunning(false);},30);
  };
  return (
    <div className="panel fade-in" style={{marginTop:16}}>
      <div className="panel-title">✦ Solver</div>
      {puzzle&&puzzle.some(v=>v==='?')
        ?<button className="action-btn primary" onClick={run} disabled={running}>{running?'Solving…':'Find Solutions'}</button>
        :<p style={{fontSize:'.85rem',color:'#666'}}>No blank cells to solve.</p>}
      {solutions!==null&&(
        <div style={{marginTop:14}}>
          {solutions.length===0
            ?<p style={{color:T.rust,fontWeight:600}}>No solutions found.</p>
            :<>
              <p style={{fontWeight:700,marginBottom:8}}>
                {solutions.length} solution{solutions.length!==1?'s':''}{solutions.length===4?' (capped)':''}:
              </p>
              {solutions.map((sol,i)=>(
                <div key={i} style={{marginBottom:8}}>
                  <div style={{fontSize:'.68rem',color:'#8a7360',fontWeight:700,marginBottom:3,fontFamily:'Spectral SC,serif'}}>Solution #{i+1}</div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                    {sol.map((v,j)=>(
                      <span key={j} style={{width:36,height:36,border:'1px solid '+T.border,
                        borderRadius:3,display:'inline-flex',alignItems:'center',justifyContent:'center',
                        fontSize:'.82rem',fontWeight:700,background:A_TYPE.includes(v)?'#eaf1fb':'#fef9ec',
                        color:A_TYPE.includes(v)?T.azure:T.umber,fontFamily:'Cinzel,serif'}}>{v}</span>
                    ))}
                  </div>
                </div>
              ))}
            </>}
        </div>
      )}
      <button className="action-btn ghost" style={{marginTop:14}} onClick={onClose}>← Back</button>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   SHAPE MEANINGS PANEL
══════════════════════════════════════════════════════════════ */
const ShapeMeaningsPanel = ({onClose}) => {
  const [tab, setTab] = useState('triangle');
  const meanings = {
    triangle:{
      symbol:'△', color:'#c0392b',
      title:'Triangle — Threefold Branching',
      subtitle:'Direction · Intention · Choice',
      body:`The triangle is the first complete form — the minimum geometry needed to enclose space. Three points, three lines, three angles summing to 180°.

In sacred traditions, the triangle represents Trinity: creation, preservation, dissolution; or past, present, future; or body, mind, spirit.

In this game, the triangle board is solved row by row from apex to base. The apex cell is the seed — it belongs to two edge-lines simultaneously. Every row is a generation, wider than the last. The puzzle is read as a descent from unity (one cell) to multiplicity (N cells).

Solving principle: the apex forces the edge types. The edge types constrain the base. Work top-down.`,
      lines:['Row constraints widen with each generation','Edge diagonals create bridge constraints','The base row is the most constrained — it receives all upstream type decisions'],
    },
    square:{
      symbol:'□', color:'#2c5f8a',
      title:'Square — Stability & Boundary',
      subtitle:'Grounding · Structure · Cardinal axes',
      body:`The square is the geometry of manifestation — four corners, four directions, four seasons. It stabilises the field by creating equal tension in all four directions.

The square grid in this game is the classical magic square structure. Every row, column, and both diagonals must satisfy the divisibility rule. The center cell is the most constrained: it belongs to one row, one column, and two diagonals — four active constraints simultaneously.

In sacred geometry, the square represents Earth, the material plane, and the threshold between chaos and order. Solving a square chamber is an act of grounding.

Solving principle: solve the center first (most constrained), then corners (two constraints), then edges (one-two constraints).`,
      lines:['Center cell: 4 constraints','Corner cells: 2-3 constraints','Edge cells: 2 constraints'],
    },
    circle:{
      symbol:'○', color:'#2e7d45',
      title:'Circle — Completion & Return',
      subtitle:'Enclosure · Continuity · The eternal return',
      body:`The circle has no beginning and no end. It encloses the maximum area for a given perimeter. In sacred geometry it is the symbol of eternity, the zero point, and the field of pure potential.

The circle board places cells on a ring with a center spoke. Each triplet of adjacent ring cells forms a constraint line. Spokes connect center to ring. The same center cell appears in every spoke — it is the most constrained cell on the board.

The circle teaches closure: every line loops back to where it began. You cannot solve a ring cell in isolation — moving around the ring, each cell must satisfy its constraints with both neighbors.

Solving principle: find the center first (it anchors all spokes). Then solve each spoke pair. The ring cells fill from the constrained to the free.`,
      lines:['Ring triplets: consecutive arcs of three','Spokes: center + two opposite ring cells','Center is on every spoke — solve first'],
    },
    spiral:{
      symbol:'🌀', color:'#1a5276',
      title:'Spiral — Growth & Recursion',
      subtitle:'Unfolding · Depth · The breath of expansion',
      body:`The spiral is the geometry of life — the nautilus shell, the galaxy arm, the unfurling fern. It is growth that recurses, each level containing the pattern of the whole.

The spiral board traces a path through the grid, folding in on itself. Constraint lines run along consecutive triplets of the spiral path. The first and last cells of the path are the most isolated (fewer shared lines). The interior of the spiral is the most constrained.

In this game, the spiral also encodes the four tiers of play: from the outer ring (Basic) inward through Standard, Advanced, and Boss — a spiral of increasing depth toward the same core truth (divisibility by 3).

Solving principle: follow the spiral inward. Each cell is constrained by its two neighbors on the path. The innermost cells are most tightly bound.`,
      lines:['Consecutive triplets along the spiral path','Cells share lines only with their immediate path neighbors','Work from the center outward, or use algebra to solve the whole path at once'],
    },
    vesica:{
      symbol:'⋈', color:'#7d4e00',
      title:'Vesica Piscis — Union & Threshold',
      subtitle:'Overlap · Duality · The sacred intersection',
      body:`The Vesica Piscis is formed by two circles of equal radius, each passing through the other's center. The intersection region is the vesica — a lens-shaped form considered in many traditions to be the eye of God or the threshold between worlds.

The vesica board places two 3-column squares side by side, sharing one column. The shared column is the intersection of two worlds. Every cell in the shared column belongs simultaneously to both the left and right constraint systems.

Solving principle: solve the shared column first — it is constrained by BOTH the left and right row systems. Then solve left and right independently.`,
      lines:['Left rows (columns 0-2)','Right rows (columns 2-4)','Shared center column (column 2) — most constrained','Diagonal pairs in each half'],
    },
    hexagon:{
      symbol:'⬡', color:'#5a189a',
      title:'Hexagon — Lattice & Harmony',
      subtitle:'Packing · Network · The honeycomb of creation',
      body:`The hexagon is the most efficient tiling of the plane — bees discovered this millions of years before mathematicians proved it. The hexagonal lattice appears in carbon atoms, snowflakes, compound eyes, and basalt columns.

In sacred geometry, the hexagon represents the Flower of Life — the template from which Metatron's Cube derives. The six outer cells of the hexagon surround a central cell, creating perfect 6-fold symmetry.

The hexagon board uses axial hex coordinates. Lines run in three directions: ↗, →, and ↘. Every cell is on exactly three lines — one in each direction. This creates a beautifully balanced constraint system.

Solving principle: every cell is equally constrained (exactly 3 lines). Start with cells that appear in lines with the most filled neighbors.`,
      lines:['Three axis directions: horizontal, and two diagonals','Every cell is on exactly 3 lines','Perfect symmetry — no cell is more or less constrained than another'],
    },
  };

  const shape = meanings[tab]||meanings.triangle;
  const tabIds = Object.keys(meanings);

  return (
    <div className="panel fade-in" style={{marginTop:16}}>
      <div className="panel-title">✦ Sacred Geometry — Shape Meanings</div>
      <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:18}}>
        {tabIds.map(id=>(
          <button key={id} className={`tab-btn${tab===id?' active':''}`} onClick={()=>setTab(id)}>
            {meanings[id].symbol} {meanings[id].title.split('—')[0].trim()}
          </button>
        ))}
      </div>
      <div style={{background:`${shape.color}10`,border:`2px solid ${shape.color}`,borderRadius:8,padding:'16px 20px',marginBottom:16}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
          <span style={{fontSize:'2rem'}}>{shape.symbol}</span>
          <div>
            <div style={{fontFamily:'Cinzel,serif',fontWeight:700,color:shape.color,fontSize:'1rem'}}>{shape.title}</div>
            <div style={{fontSize:'.8rem',color:'#666',fontStyle:'italic'}}>{shape.subtitle}</div>
          </div>
        </div>
        <div style={{fontSize:'.85rem',lineHeight:1.8,color:T.ink,whiteSpace:'pre-wrap'}}>{shape.body}</div>
      </div>
      <div className="section-label">Constraint Lines</div>
      {shape.lines.map((l,i)=>(
        <div key={i} style={{background:'#eaf1fb',border:'1px solid #bad0ef',borderRadius:3,
          padding:'6px 10px',marginBottom:5,fontSize:'.83rem',lineHeight:1.6,color:'#1a3a5c'}}>
          {l}
        </div>
      ))}
      <button className="action-btn ghost" style={{marginTop:14}} onClick={onClose}>← Back</button>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   WALKTHROUGH PANEL
   Three deep sections:
     1. Linear Equations — what they are, why they work
     2. Solve for X — step-by-step with examples
     3. Rows vs Columns — visual explanation with annotated grid
══════════════════════════════════════════════════════════════ */

/* ── small reusable atoms ── */
const WBox = ({children, color='#1a3a5c', bg='#eaf1fb', border='#bad0ef'}) => (
  <div style={{background:bg, border:`1.5px solid ${border}`, borderRadius:6,
    padding:'12px 16px', margin:'10px 0', fontSize:'.86rem', lineHeight:1.8, color:'#333'}}>
    {children}
  </div>
);

const WMono = ({children}) => (
  <div style={{fontFamily:'monospace', fontSize:'.85rem', background:'#f5f2eb',
    border:'1px solid #d4c5a0', borderRadius:4, padding:'10px 14px',
    margin:'8px 0', lineHeight:1.9, color:'#2a1f0e', whiteSpace:'pre-wrap'}}>
    {children}
  </div>
);

const WStep = ({n, color, title, children}) => (
  <div style={{display:'flex', gap:12, marginBottom:14,
    background:'#fff', border:`1px solid ${color}30`,
    borderLeft:`3px solid ${color}`, borderRadius:5, padding:'12px 14px'}}>
    <div style={{background:color, color:'#fff', borderRadius:'50%',
      width:26, height:26, display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily:'Cinzel,serif', fontWeight:700, fontSize:'.82rem', flexShrink:0}}>
      {n}
    </div>
    <div>
      <div style={{fontFamily:'Cinzel,serif', fontWeight:700, color, fontSize:'.88rem', marginBottom:5}}>{title}</div>
      <div style={{fontSize:'.84rem', lineHeight:1.75, color:'#444'}}>{children}</div>
    </div>
  </div>
);

const WCallout = ({emoji, title, children, color='#7d4e00', bg='#fef9ec'}) => (
  <div style={{background:bg, border:`1.5px solid ${color}`, borderRadius:8,
    padding:'13px 16px', margin:'12px 0'}}>
    <div style={{fontWeight:700, color, fontSize:'.88rem', marginBottom:6, fontFamily:'Cinzel,serif'}}>
      {emoji} {title}
    </div>
    <div style={{fontSize:'.84rem', lineHeight:1.75, color:'#333'}}>{children}</div>
  </div>
);

/* ── Mini annotated grid for rows vs columns demo ── */
const MiniAnnotatedGrid = () => {
  const vals = [[1,7,13],[5,11,17],[19,23,1]];
  const CL = 46, G = 5;
  const isA = v => [1,7,13,19].includes(v);
  return (
    <div style={{overflowX:'auto', marginBottom:4}}>
      <div style={{display:'inline-block', padding:'16px 20px',
        background:T.parchment, borderRadius:8, border:`1px solid ${T.border}`}}>
        {/* Column labels */}
        <div style={{display:'flex', marginLeft: CL+G+4, marginBottom:4, gap:G}}>
          {['Col 1','Col 2','Col 3'].map((c,ci)=>(
            <div key={ci} style={{width:CL, textAlign:'center',
              fontSize:'.62rem', fontWeight:700, color:'#2c5f8a', fontFamily:'Spectral SC,serif'}}>
              {c}
            </div>
          ))}
        </div>
        {vals.map((row, ri) => (
          <div key={ri} style={{display:'flex', alignItems:'center', gap:G, marginBottom:G}}>
            {/* Row label */}
            <div style={{width:CL, textAlign:'right', paddingRight:8,
              fontSize:'.62rem', fontWeight:700, color:'#c0392b', fontFamily:'Spectral SC,serif',
              flexShrink:0}}>
              Row {ri+1}
            </div>
            {row.map((v, ci) => {
              const rowHL = ri===0;
              const colHL = ci===1;
              const both  = rowHL && colHL;
              const bg2   = both ? '#e0d4ff'
                          : rowHL ? '#fdecea'
                          : colHL ? '#ddeeff'
                          : '#fff';
              const bc    = both ? '#7d3c98'
                          : rowHL ? '#c0392b'
                          : colHL ? '#2c5f8a'
                          : T.border;
              return (
                <div key={ci} style={{
                  width:CL, height:CL,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  background:bg2, border:`2px solid ${bc}`, borderRadius:5,
                  fontFamily:'Cinzel,serif', fontWeight:700,
                  fontSize:'.9rem', color: isA(v)?'#2c5f8a':'#7d4e00',
                }}>
                  {v}
                </div>
              );
            })}
            {/* Row sum */}
            <div style={{fontSize:'.75rem', color:'#c0392b', fontWeight:700, marginLeft:4,
              fontFamily:'monospace'}}>
              = {row.reduce((a,b)=>a+b,0)}
            </div>
          </div>
        ))}
        {/* Column sums */}
        <div style={{display:'flex', marginLeft:CL+G+4, gap:G, marginTop:4}}>
          {[0,1,2].map(ci=>(
            <div key={ci} style={{width:CL, textAlign:'center',
              fontSize:'.75rem', fontWeight:700, color:'#2c5f8a', fontFamily:'monospace'}}>
              = {vals.reduce((s,r)=>s+r[ci],0)}
            </div>
          ))}
        </div>
        {/* Legend */}
        <div style={{marginTop:12, display:'flex', gap:10, flexWrap:'wrap', fontSize:'.7rem'}}>
          <span style={{background:'#fdecea',border:'1px solid #c0392b',borderRadius:3,padding:'2px 8px',color:'#c0392b',fontWeight:700}}>
            Red highlight = Row 1
          </span>
          <span style={{background:'#ddeeff',border:'1px solid #2c5f8a',borderRadius:3,padding:'2px 8px',color:'#2c5f8a',fontWeight:700}}>
            Blue highlight = Col 2
          </span>
          <span style={{background:'#e0d4ff',border:'1px solid #7d3c98',borderRadius:3,padding:'2px 8px',color:'#7d3c98',fontWeight:700}}>
            Purple = both at once
          </span>
        </div>
      </div>
    </div>
  );
};

/* ── Diagonal demo grid ── */
const DiagonalGrid = () => {
  const vals = [[1,7,13],[5,11,17],[19,23,1]];
  const CL = 44, G = 5;
  const mainDiag  = (r,c) => r===c;
  const antiDiag  = (r,c) => r+c===2;
  return (
    <div style={{display:'flex', gap:20, flexWrap:'wrap', marginBottom:8}}>
      {[
        {label:'Main diagonal ↘ (top-left → bottom-right)', fn:mainDiag, color:'#2e7d45', cells:[[0,0],[1,1],[2,2]]},
        {label:'Anti-diagonal ↙ (top-right → bottom-left)', fn:antiDiag, color:'#c0392b', cells:[[0,2],[1,1],[2,0]]},
      ].map(({label, fn, color, cells:dcells})=>(
        <div key={label}>
          <div style={{fontSize:'.7rem',fontWeight:700,color,marginBottom:6,fontFamily:'Spectral SC,serif'}}>{label}</div>
          <div style={{display:'grid',gridTemplateColumns:`repeat(3,${CL}px)`,gridTemplateRows:`repeat(3,${CL}px)`,gap:G}}>
            {vals.map((row,ri)=>row.map((v,ci)=>{
              const hl = fn(ri,ci);
              const isA = [1,7,13,19].includes(v);
              return (
                <div key={`${ri}-${ci}`} style={{
                  width:CL,height:CL,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  background:hl?`${color}18`:'#fff',
                  border:`${hl?2:1.5}px ${hl?'solid':'solid'} ${hl?color:T.border}`,
                  borderRadius:4, fontFamily:'Cinzel,serif', fontWeight:700,
                  fontSize:'.88rem', color:hl?color:(isA?'#2c5f8a':'#7d4e00'),
                }}>
                  {v}
                </div>
              );
            }))}
          </div>
          <div style={{marginTop:5,fontSize:'.72rem',fontFamily:'monospace',color}}>
            {dcells.map(([r,c])=>vals[r][c]).join(' + ')} = {dcells.reduce((s,[r,c])=>s+vals[r][c],0)}
            {' '}({dcells.reduce((s,[r,c])=>s+vals[r][c],0) % 3 === 0 ? '✓ div by 3':'✗'})
          </div>
        </div>
      ))}
    </div>
  );
};

/* ── Solve-for-X worked example grid ── */
const SolveGrid = ({vals, highlight}) => {
  const CL = 44, G = 5, N = vals.length;
  return (
    <div style={{display:'inline-grid',
      gridTemplateColumns:`repeat(${N},${CL}px)`,
      gridTemplateRows:`repeat(${N},${CL}px)`,
      gap:G, background:T.parchment, padding:8, borderRadius:6}}>
      {vals.flat().map((v,i)=>{
        const r=Math.floor(i/N), c=i%N;
        const isBlank = v==='?';
        const isHL    = highlight && highlight.some(([hr,hc])=>hr===r&&hc===c);
        const isA     = [1,7,13,19].includes(v);
        return (
          <div key={i} style={{
            width:CL,height:CL,
            display:'flex',alignItems:'center',justifyContent:'center',
            background: isHL?'#ffe8b0': isBlank?'#fff8ee':'#fff',
            border:`${isHL?2:1.5}px ${isBlank?'dashed':'solid'} ${isHL?T.gold: isBlank?T.goldLight:T.border}`,
            borderRadius:4, fontFamily:'Cinzel,serif', fontWeight:700,
            fontSize:'.9rem',
            color: isBlank?'#c8b89a': isA?'#2c5f8a':'#7d4e00',
          }}>
            {v}
          </div>
        );
      })}
    </div>
  );
};

/* ── Section toggle (accordion) ── */
const WSection = ({id, title, subtitle, color, icon, open, onToggle, children}) => (
  <div style={{border:`1.5px solid ${color}`, borderRadius:8, overflow:'hidden', marginBottom:12}}>
    <div onClick={onToggle} style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'14px 18px', cursor:'pointer', userSelect:'none',
      background: open ? color : T.cream,
      color: open ? '#fff' : T.ink,
    }}>
      <div style={{display:'flex', alignItems:'center', gap:10}}>
        <span style={{fontSize:'1.1rem'}}>{icon}</span>
        <div>
          <div style={{fontFamily:'Cinzel,serif', fontWeight:700, fontSize:'.95rem'}}>{title}</div>
          {!open && <div style={{fontSize:'.72rem', opacity:.7, marginTop:2}}>{subtitle}</div>}
        </div>
      </div>
      <span style={{fontWeight:700, fontSize:'1rem'}}>{open ? '▲' : '▼'}</span>
    </div>
    {open && <div style={{padding:'20px 20px 24px', background:'#fff'}}>{children}</div>}
  </div>
);

const ShapeAccordion = ({title, color, children}) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{border:`1px solid ${color}40`, borderRadius:6, overflow:'hidden', marginBottom:8}}>
      <div onClick={()=>setOpen(p=>!p)} style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'10px 14px', cursor:'pointer', userSelect:'none',
        background: open ? `${color}15` : T.parchment,
      }}>
        <span style={{fontWeight:700, fontSize:'.85rem', color: open ? color : T.ink}}>{title}</span>
        <span style={{color, fontWeight:700}}>{open?'▲':'▼'}</span>
      </div>
      {open && <div style={{padding:'14px 16px', background:'#fff'}}>{children}</div>}
    </div>
  );
};

/* ── Shape SVG mini-diagrams for the walkthrough ── */
const ShapeDiagram = ({shape}) => {
  const S = 28, G = 5, SG = S+G;
  const svgStyle = {display:'block',margin:'8px auto'};

  if(shape==='square'){
    const N=3, W=N*SG-G+4, cells=[];
    for(let r=0;r<N;r++) for(let c=0;c<N;c++) cells.push({r,c});
    const isA = (r,c) => (r+c)%2===0;
    return (
      <svg width={W} height={W} style={svgStyle}>
        {cells.map(({r,c},i)=>(
          <rect key={i} x={c*SG} y={r*SG} width={S} height={S}
            fill={isA(r,c)?'#ddeeff':'#fef9ec'}
            stroke={isA(r,c)?'#2c5f8a':'#7d4e00'} strokeWidth="1.5" rx="3"/>
        ))}
        {/* row arrow */}
        <line x1={0} y1={S/2} x2={W-4} y2={S/2} stroke='#c0392b' strokeWidth="1.5" markerEnd="url(#arr)"/>
        {/* col arrow */}
        <line x1={S/2} y1={0} x2={S/2} y2={W-4} stroke='#2c5f8a' strokeWidth="1.5"/>
        <defs><marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill='#c0392b'/>
        </marker></defs>
      </svg>
    );
  }

  if(shape==='triangle'){
    const rows=5, pts=[];
    for(let r=0;r<rows;r++) for(let pos=0;pos<=r;pos++){
      const x = ((rows-1)-r)*SG/2 + pos*SG;
      const y = r*SG*0.88;
      pts.push({r,pos,x,y});
    }
    const W=pts.reduce((m,p)=>Math.max(m,p.x),0)+S+4;
    const H=pts.reduce((m,p)=>Math.max(m,p.y),0)+S+4;
    return (
      <svg width={W} height={H} style={svgStyle}>
        {pts.map((p,i)=>(
          <rect key={i} x={p.x} y={p.y} width={S} height={S}
            fill={[1,7,13,19][i%4]?'#ddeeff':'#fef9ec'}
            stroke="#2c5f8a" strokeWidth="1.5" rx="3"/>
        ))}
      </svg>
    );
  }

  if(shape==='circle'){
    const count=8, R=52, cx=60, cy=60, cS=22;
    const ring = Array.from({length:count},(_,i)=>({
      x: cx+R*Math.cos((i/count)*2*Math.PI-Math.PI/2),
      y: cy+R*Math.sin((i/count)*2*Math.PI-Math.PI/2),
    }));
    return (
      <svg width={120} height={120} style={svgStyle}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={T.border} strokeWidth="1" strokeDasharray="3,3"/>
        {ring.map((p,i)=>(
          <rect key={i} x={p.x-cS/2} y={p.y-cS/2} width={cS} height={cS}
            fill={i%2===0?'#ddeeff':'#fef9ec'}
            stroke={i%2===0?'#2c5f8a':'#7d4e00'} strokeWidth="1.5" rx="3"/>
        ))}
        <rect x={cx-cS/2} y={cy-cS/2} width={cS} height={cS} fill="#fff8ee" stroke={T.gold} strokeWidth="2" rx="3"/>
        {/* spoke line example */}
        <line x1={ring[0].x} y1={ring[0].y} x2={cx} y2={cy} stroke={T.goldLight} strokeWidth="1" strokeDasharray="3,2"/>
        <line x1={cx} y1={cy} x2={ring[4].x} y2={ring[4].y} stroke={T.goldLight} strokeWidth="1" strokeDasharray="3,2"/>
      </svg>
    );
  }

  if(shape==='spiral'){
    const N=16, pts=[];
    for(let i=0;i<N;i++){
      const t=i/(N-1);
      const theta=0.1*Math.PI+t*3.8*Math.PI;
      const rad=28+t*100;
      pts.push({x:rad*Math.cos(theta), y:rad*Math.sin(theta)});
    }
    const xs=pts.map(p=>p.x), ys=pts.map(p=>p.y);
    const minX=Math.min(...xs)-S/2, minY=Math.min(...ys)-S/2;
    const W=Math.max(...xs)-minX+S+4, H=Math.max(...ys)-minY+S+4;
    const cS=20;
    return (
      <svg width={Math.min(W,200)} height={Math.min(H,160)} viewBox={`${minX} ${minY} ${Math.min(W,200)} ${Math.min(H,160)}`} style={svgStyle}>
        <polyline points={pts.map(p=>`${p.x},${p.y}`).join(' ')} fill="none" stroke={T.goldLight} strokeWidth="1.5" strokeDasharray="3,2"/>
        {pts.map((p,i)=>(
          <rect key={i} x={p.x-cS/2} y={p.y-cS/2} width={cS} height={cS}
            fill={i%2===0?'#ddeeff':'#fef9ec'}
            stroke={i%2===0?'#2c5f8a':'#7d4e00'} strokeWidth="1.2" rx="2"/>
        ))}
      </svg>
    );
  }

  if(shape==='vesica'){
    const cells=[], cS=22;
    for(let r=0;r<3;r++) for(let c=0;c<5;c++) cells.push({r,c});
    const W=5*(cS+G)-G+4, H=3*(cS+G)-G+4;
    return (
      <svg width={W} height={H} style={svgStyle}>
        {/* left circle outline */}
        <ellipse cx={(cS+G)*1.5} cy={H/2} rx={(cS+G)*1.6} ry={H/2+2} fill="none" stroke='#c0392b' strokeWidth="1" strokeDasharray="3,2" opacity="0.5"/>
        {/* right circle outline */}
        <ellipse cx={(cS+G)*3.5} cy={H/2} rx={(cS+G)*1.6} ry={H/2+2} fill="none" stroke='#2c5f8a' strokeWidth="1" strokeDasharray="3,2" opacity="0.5"/>
        {cells.map(({r,c},i)=>(
          <rect key={i} x={c*(cS+G)} y={r*(cS+G)} width={cS} height={cS}
            fill={c===2?'#e0d4ff':c<2?'#fdecea':'#ddeeff'}
            stroke={c===2?'#7d3c98':c<2?'#c0392b':'#2c5f8a'} strokeWidth="1.5" rx="2"/>
        ))}
      </svg>
    );
  }

  if(shape==='hexagon'){
    const radius=1, hexSize=28, cells=[], cx=70, cy=70;
    for(let q=-radius;q<=radius;q++) for(let s=-radius;s<=radius;s++){
      const t=-q-s; if(Math.abs(t)<=radius) cells.push({q,s});
    }
    const pts2 = cells.map(({q,s})=>({
      x: cx + hexSize*(3/2*q),
      y: cy + hexSize*(Math.sqrt(3)/2*q + Math.sqrt(3)*s),
    }));
    const cS=22;
    return (
      <svg width={140} height={140} style={svgStyle}>
        {pts2.map((p,i)=>(
          <rect key={i} x={p.x-cS/2} y={p.y-cS/2} width={cS} height={cS}
            fill={i===0?'#fff8ee':i%3===0?'#ddeeff':i%3===1?'#fef9ec':'#e6f4ea'}
            stroke={i===0?T.gold:'#666'} strokeWidth={i===0?2:1.2} rx="3"/>
        ))}
      </svg>
    );
  }

  // Generic fallback — just show cells as dots
  return <div style={{height:60, display:'flex',alignItems:'center',justifyContent:'center',color:T.gold,fontSize:'1.5rem'}}>⬡</div>;
};

/* ── per-shape data ── */
const SHAPE_WALKTHROUGHS = [
  /* ── SQUARE ── */
  {
    id:'square', name:'Square □', color:'#2c5f8a', symbol:'□',
    what:`The Square is the most familiar board. It is a grid of cells arranged in rows and columns — like a spreadsheet or a chess board. The standard size is 3×3 (9 cells), but it can go up to 5×5 (25 cells).`,
    lines:`A Square has three kinds of constraint lines, all visible as golden dashed connections on the board:

  • Rows — every horizontal line of cells (left to right). A 3×3 has 3 rows.
  • Columns — every vertical line of cells (top to bottom). A 3×3 has 3 columns.
  • Diagonals — two lines crossing corner to corner. One goes ↘ (top-left to bottom-right), one goes ↙ (top-right to bottom-left).

Every single one of these lines must satisfy the divisibility rule. That is 3+3+2 = 8 constraint lines for a 3×3 Square.`,
    rowcol:`ROW vs COLUMN — this is the most important thing to understand on a Square board.

  A ROW is a horizontal slice: all cells at the same height. Row 1 is the top. Row 2 is the middle. Row 3 is the bottom.
  Read left to right, like reading a sentence.

  A COLUMN is a vertical slice: all cells in the same left-right position. Column 1 is on the left. Column 3 is on the right.
  Read top to bottom, like reading a flagpole.

  Every cell belongs to exactly ONE row AND exactly ONE column. The cell at Row 2, Column 2 (the centre) also belongs to BOTH diagonals.
  That centre cell is constrained by 4 lines at once — the most constrained cell on the board. Always solve it first.`,
    solve:`SOLVE FOR X — Square worked example

Board (3×3), Rows & Cols mode (every row and column must be divisible by 3):

     7   13   ?
    19    ?   1
     ?    7  13

Step 1 — Row 1: [7, 13, ?]
  Both 7 and 13 are A-type. Third must be A-type.
  7 + 13 + x must be divisible by 3.
  20 + x ≡ 0 (mod 3)  →  x ≡ 1 (mod 3)  →  A-type ✓
  Valid options: {1, 7, 13, 19}

Step 2 — Column 3 contains the same blank: [?, 1, 13]
  1 and 13 are both A-type. Blank is also A-type.
  x + 1 + 13 ≡ 0 (mod 3)
  x + 14 ≡ 0 (mod 3)  →  x ≡ 1 (mod 3)  → A-type ✓ (still 4 options)
  BUT: this is Rows & Cols mode, so columns must also be divisible by 3.
  x + 14 = multiple of 3  →  x = 1 gives 15 ÷3=5 ✓, x=7 gives 21 ÷3=7 ✓
  x=13 gives 27 ÷3=9 ✓, x=19 gives 33 ÷3=11 ✓  — all work!

Step 3 — Row 2: [19, ?, 1]
  19 is A-type, 1 is A-type → middle blank is A-type.
  19 + x + 1 ≡ 0 (mod 3)
  20 + x ≡ 0 (mod 3) → x ≡ 1 (mod 3) → {1, 7, 13, 19}

Step 4 — Column 2 contains this blank: [13, ?, 7]
  13 and 7 are A-type → blank is A-type ✓ (consistent)

  In Rows & Cols mode each row and column just needs to be divisible by 3.
  Any A-type value works. Pick 7. Pick 13. They all pass.

Rule: for unique answers, you need Exact Sum or Boss Chamber mode.
In those modes, x = T − known1 − known2 gives exactly one answer.`,
  },

  /* ── TRIANGLE ── */
  {
    id:'triangle', name:'Triangle △', color:'#c0392b', symbol:'△',
    what:`The Triangle board has 5 rows, like a downward-pointing pyramid: 1 cell at the top (the apex), then 2, then 3, then 4, then 5 cells at the base. Total: 15 cells. The shape narrows as you go up — the apex is the loneliest cell, the base is the widest.`,
    lines:`A Triangle has no rows or columns in the traditional sense. Instead, the lines are:

  • Row triplets — any three consecutive cells within a wide row. Row 3 (3 cells) gives one triplet. Row 4 (4 cells) gives two overlapping triplets: [left-3] and [right-3]. Row 5 (5 cells) gives three triplets.
  • Left edge triplets — three cells read diagonally down the left side of the triangle. There are 3 such triplets.
  • Right edge triplets — three cells read diagonally down the right side. There are 3 such triplets.

Total: 12 constraint lines, all length 3.`,
    rowcol:`ROWS vs EDGES — the Triangle equivalent of rows and columns.

  HORIZONTAL (row triplets): Reading across a row, left to right. The wider rows have more than one triplet — each overlapping group of 3 consecutive cells in that row is its own constraint.

  LEFT EDGE (diagonal triplets): Start at the apex (top). Go down and to the LEFT at each step. Three consecutive cells on this path form a constraint line.

  RIGHT EDGE (diagonal triplets): Start at the apex. Go down and to the RIGHT. Same idea — consecutive triplets on the right edge.

  The apex cell (very top, row 0) appears in BOTH the left-edge and right-edge lines. It is the most constrained cell — always start there.

  The base cells (bottom row) each appear in up to 3 row-triplets. They are easy to fill last once the rest of the triangle constrains them.`,
    solve:`SOLVE FOR X — Triangle worked example

Triangle, 5 rows, Rows & Cols mode. Three blanks marked ?.
Apex = cell 0. Base goes left to right: cells 10-14.

Known cells: base row = [1, 7, 13, 7, 1]
Row 4 (second from bottom) = [19, ?, 7, ?]
Left-edge triplet involves: apex, row1-left, row2-left = [?, 7, 19]

Step 1 — Left edge triplet [?, 7, 19]:
  7 is A-type, 19 is A-type → apex must be A-type.
  x + 7 + 19 must be divisible by 3
  x + 26 ≡ 0 (mod 3)
  26 = 24+2, remainder 2
  x ≡ 1 (mod 3) → A-type ✓
  Options: {1, 7, 13, 19}

Step 2 — Right edge triplet [apex, row1-right, row2-right] = [?, ?, 13]:
  13 is A-type → all three must be A-type (consistent with step 1 ✓)

Step 3 — Row 4 triplet [19, ?, 7]:
  19 A-type, 7 A-type → middle blank is A-type.
  19 + x + 7 = 26 + x must be divisible by 3.
  x ≡ 1 (mod 3) → {1, 7, 13, 19}
  Try x=7: 19+7+7=33 ÷3=11 ✓

In Rows & Cols mode any A-type value works.
For a unique answer switch to Exact Sum: x = T − 19 − 7 = T − 26.
If T=39: x = 39 − 26 = 13. Check 13 ∈ S ✓. Unique.`,
  },

  /* ── CIRCLE ── */
  {
    id:'circle', name:'Circle ○', color:'#2e7d45', symbol:'○',
    what:`The Circle board places 8 cells in a ring around a centre cell. Total: 9 cells. The ring cells are evenly spaced like hours on a clock. The centre cell is connected to every ring cell via a spoke. Think of it like a wheel: the ring is the tyre, the centre is the hub, the spokes connect them.`,
    lines:`A Circle has two kinds of constraint lines:

  • Arc triplets — any three consecutive cells on the ring. With 8 ring cells, there are 8 arc triplets (0-1-2, 1-2-3, 2-3-4, ... 7-0-1). Each overlaps its neighbours by 2 cells.
  • Spoke triplets — the centre cell plus two ring cells directly opposite each other. There are 4 spoke triplets (ring cells 0+4+centre, 1+5+centre, 2+6+centre, 3+7+centre).

Total: 12 constraint lines.`,
    rowcol:`ARCS vs SPOKES — the Circle equivalent of rows and columns.

  ARC (like a row, but curved): Three ring cells that sit next to each other going clockwise around the ring. Each arc triplet has two cells in common with the arc on either side of it, so changing one ring cell affects up to 5 arc constraints.

  SPOKE (like a column, but radial): The centre cell plus two ring cells on exactly opposite sides of the ring. The spoke goes straight through the middle of the circle.

  THE CENTRE CELL appears in all 4 spoke triplets — it is in 4 constraint lines at once. This makes it the most constrained cell on the board. Solve the centre first, always.

  A ring cell in position i appears in:
    • Arc triplet (i-1, i, i+1)
    • Arc triplet (i, i+1, i+2)
    • Arc triplet (i-2, i-1, i) — three arc constraints
    • One spoke triplet (i, centre, i+4) — one spoke constraint
  Total: 4 constraints per ring cell.`,
    solve:`SOLVE FOR X — Circle worked example

Circle, 8 ring cells + 1 centre, Rows & Cols mode.
Ring (clockwise): [7, 13, ?, 1, 7, 19, ?, 13]
Centre: ?

Step 1 — Spoke triplet: [ring-0, centre, ring-4] = [7, ?, 7]
  7 and 7 are both A-type → centre must be A-type.
  7 + x + 7 must be divisible by 3
  14 + x ≡ 0 (mod 3)  →  x ≡ 1 (mod 3) → {1, 7, 13, 19}

Step 2 — Spoke triplet: [ring-1, centre, ring-5] = [13, ?, 19]
  13 A-type, 19 A-type → centre A-type ✓ (consistent)
  13 + x + 19 must be divisible by 3
  32 + x ≡ 0 (mod 3)
  32 = 30+2, remainder 2
  x ≡ 1 (mod 3) → {1, 7, 13, 19} (still 4 options)

Step 3 — Arc triplet containing ring-2: [ring-1, ring-2, ring-3] = [13, ?, 1]
  13 A-type, 1 A-type → ring-2 must be A-type.
  13 + x + 1 = 14 + x must be divisible by 3
  14 has remainder 2 → x must have remainder 1 → {1, 7, 13, 19}
  Try 7: 13+7+1=21 ÷3=7 ✓

Step 4 — Arc triplet: [ring-0, ring-1, ring-2] = [7, 13, 7]
  7+13+7=27 ÷3=9 ✓  (confirms ring-2=7 is consistent)

The centre can be 1, 7, 13, or 19 — multiple valid answers in this mode.
In Exact Sum mode with T=21: centre = 21−7−7 = 7 (unique).`,
  },

  /* ── SPIRAL ── */
  {
    id:'spiral', name:'Spiral 🌀', color:'#1a5276', symbol:'🌀',
    what:`The Spiral board places 16 cells along an outward-curling Archimedean spiral — like a snail shell uncoiling. The cells start near the centre and spiral outward, getting further apart. There are no rows, no columns, no grid — just one long winding path of 16 cells.`,
    lines:`A Spiral has only one kind of constraint line:

  • Path triplets — every three consecutive cells along the spiral path. With 16 cells, there are 14 triplets: [0-1-2], [1-2-3], [2-3-4], ... [13-14-15]. Each triplet overlaps its neighbours by two cells.

Total: 14 constraint lines. This is the simplest line structure in the game — just one long chain.`,
    rowcol:`WHAT "ROW" AND "COLUMN" MEAN ON A SPIRAL:

  There are no rows or columns on the Spiral. The only relevant concept is POSITION ALONG THE PATH.

  Think of the spiral as a queue of 16 people standing in a line. Each person stands between two neighbours (except the first and last who only have one neighbour). Each group of three consecutive people in the queue must satisfy the divisibility rule.

  "Neighbour to the left" replaces the idea of "same column."
  "Neighbour to the right" replaces the idea of "same row."

  The most constrained cells are the ones in the middle of the spiral (cells 1 through 14) because they each appear in THREE triplets:
    • as the left cell of one triplet
    • as the middle cell of another
    • as the right cell of a third

  The first cell (cell 0) only appears in one triplet [0,1,2].
  The last cell (cell 15) only appears in one triplet [13,14,15].
  So: start solving from the interior, not the ends.`,
    solve:`SOLVE FOR X — Spiral worked example

Spiral, 16 cells along the path, Rows & Cols mode.
Path: [7, 13, ?, 1, ?, 19, 13, ?, ...]
                (positions 0-7)

Step 1 — Triplet [0,1,2]: path cells = [7, 13, ?]
  7 A-type, 13 A-type → cell-2 must be A-type.
  7 + 13 + x must be divisible by 3
  20 + x ≡ 0 (mod 3)  →  x ≡ 1 (mod 3) → {1, 7, 13, 19}

Step 2 — Triplet [1,2,3]: [13, ?, 1]
  Cell-2 is A-type (from step 1), 1 is A-type.
  13 + x + 1 = 14 + x ≡ 0 (mod 3) → x ≡ 1 (mod 3) → A-type ✓
  13+1+1=15 ✓, 13+7+1=21 ✓, 13+13+1=27 ✓, 13+19+1=33 ✓

Step 3 — Triplet [2,3,4]: [cell-2, 1, ?]
  Cell-2 A-type, 1 A-type → cell-4 must be A-type.
  x + 1 + cell-2 ≡ 0 (mod 3) → same pattern.

Key spiral insight: once you know cell-2 is A-type,
it propagates: cell-3 must match cell-2 and cell-1,
cell-4 must match cell-3 and cell-2, and so on.
The type spreads like a wave down the chain.

In Exact Sum mode (T=21):
  Triplet [0,1,2]: x = 21−7−13 = 1 ✓
  Triplet [1,2,3]: (cell-2=1): x = 21−13−1 = 7 ✓
  Triplet [2,3,4]: (cell-2=1, cell-3=7): x = 21−1−7 = 13 ✓
Each cell is uniquely determined by its two neighbours — 
work left to right and the whole spiral fills in one step at a time.`,
  },

  /* ── VESICA ── */
  {
    id:'vesica', name:'Vesica Piscis ⋈', color:'#7d4e00', symbol:'⋈',
    what:`The Vesica Piscis board is two overlapping 3×3 squares sharing their centre column. Imagine two windows side by side with one shared pane of glass in the middle. Total: 15 cells in a 3×5 arrangement. The left 3 columns form a complete square. The right 3 columns form another complete square. Column 3 (the middle column) belongs to both squares simultaneously.`,
    lines:`The Vesica has all the lines of both squares, with the shared column appearing only once:

  Left square:  3 rows (cols 0-2) + 3 columns (cols 0-2) + 2 diagonals = 8 lines
  Right square: 3 rows (cols 2-4) + 3 columns (cols 2-4) + 2 diagonals = 8 lines
  Minus 1 duplicate (col 2 shared) = 15 unique constraint lines.

  The shared column (column 2, the centre) appears in:
    • Its own column constraint
    • All 3 left rows (as the right end of each row)
    • All 3 right rows (as the left end of each row)
    • Both left diagonals
    • Both right diagonals
  That is up to 9 different lines — the centre column is by far the most constrained zone.`,
    rowcol:`LEFT ROWS vs RIGHT ROWS vs THE SHARED COLUMN:

  LEFT ROW: A horizontal line reading across columns 0, 1, 2. There are 3 left rows (one per height).
    Think of it as: "the left square's rows."

  RIGHT ROW: A horizontal line reading across columns 2, 3, 4. There are 3 right rows.
    Think of it as: "the right square's rows."
    Note: the value in column 2 appears in BOTH the left row and the right row of the same height.
    It must satisfy both row constraints simultaneously.

  SHARED COLUMN (column 2): Read top to bottom through the centre. This single column is the bridge between the two squares.

  LEFT COLUMNS (0, 1): Each is a vertical line in the left square only.
  RIGHT COLUMNS (3, 4): Each is a vertical line in the right square only.

  SOLVING ORDER: Start with column 2 (most constrained). Then do the left square normally (like a 3×3 Square puzzle). Then do the right square using the already-known column 2 values.`,
    solve:`SOLVE FOR X — Vesica worked example

Vesica 3×5, Rows & Cols mode.
Left square columns 0-2, right square columns 2-4.
Column 2 (shared): top=?, middle=11, bottom=?

Step 1 — Left col 2: [?, 11, ?]
  11 is B-type → all three must be B-type.
  Top and bottom in col 2 must be B-type: {5, 11, 17, 23}

Step 2 — Right col 2 is the same column! Already know it's B-type.

Step 3 — Left row 2 (middle): [7, 11, ?] — where ? is col 2, middle
  Wait — col 2 middle is already 11. So this row is [7, 11, 11] — no blank.
  7+11+11=29 — not divisible by 3!
  But 7 is A-type and 11 is B-type — mixed row. Something is wrong with 7.
  Actually: we must have made an error. The solver ensures a valid board exists.
  This demonstrates: if you see mixed types in a complete row → a previous
  cell choice was wrong. Backtrack to the last blank you filled.

Clean example with valid board:
  Left row 1: [1, 7, 13]  — all A-type, sum=21 ✓
  Right row 1: [13, 19, 7] — col 2 is 13, right two are 19 and 7 (A-type) ✓
  Sum right row 1: 13+19+7=39 ÷3=13 ✓
  Left diagonal: [1, 7, 13] — wait that's the row.
  Left diagonal (top-left to bottom-right): col0-row0, col1-row1, col2-row2
  = [1, ?, 13]. Middle is blank.
  x = must make 1+x+13 divisible by 3
  14+x ≡ 0 (mod 3) → x ≡ 1 (mod 3) → A-type → {1,7,13,19}`,
  },

  /* ── HEXAGON ── */
  {
    id:'hexagon', name:'Hexagon ⬡', color:'#5a189a', symbol:'⬡',
    what:`The Hexagon board uses a hexagonal grid — the same pattern bees use in a honeycomb. The small version has 7 cells (1 centre + 6 surrounding). The 7 cells are arranged so that every cell has 6 neighbours, and lines run in three directions across the grid: horizontal, and two diagonal directions.`,
    lines:`A Hexagon has lines running in exactly 3 axis directions through the hex grid:

  • Horizontal lines: cells that share the same "row" in hex coordinates.
  • Diagonal-left lines: cells that line up going upper-right to lower-left.
  • Diagonal-right lines: cells that line up going upper-left to lower-right.

For the small (radius-1) hexagon with 7 cells, the lines of exactly 3 cells are:
  • 1 horizontal line through the centre
  • 1 diagonal-left line through the centre  
  • 1 diagonal-right line through the centre
Total: 3 constraint lines.

This means the 6 outer cells are only each in 1 or 2 lines,
but the centre cell is in ALL 3 lines — solve the centre first.`,
    rowcol:`THREE AXES — the Hexagon equivalent of rows and columns.

  On a hexagonal grid there are no traditional rows and columns (those are concepts for rectangular grids). Instead there are THREE axis directions, each one like a row in its own rotated coordinate system.

  AXIS 1 (Horizontal): Left to right across the middle of the hex. In the small hexagon, three cells in a horizontal line cross through the centre.

  AXIS 2 (Diagonal ↗↙): Top-right to bottom-left. Three cells in this diagonal cross through the centre.

  AXIS 3 (Diagonal ↖↘): Top-left to bottom-right. Three cells in this diagonal cross through the centre.

  The CENTRE CELL sits at the intersection of all three axes. It is in 3 constraint lines — always solve it first.

  Each OUTER CELL sits on exactly one or two of the three axes. The outer cells that happen to fall on an axis line are constrained by that line.`,
    solve:`SOLVE FOR X — Hexagon worked example

Hexagon (7 cells, radius 1), Rows & Cols mode.
Label cells: centre=C, top=T, top-right=TR, bottom-right=BR,
             bottom=B, bottom-left=BL, top-left=TL

Known: T=7, B=?, TR=13, BL=?, TL=19, BR=?  Centre=?

Three axis lines (each through the centre):
  Line 1 (vertical): [T, C, B] = [7, ?, ?]
  Line 2 (diagonal ↗): [BL, C, TR] = [?, ?, 13]
  Line 3 (diagonal ↖): [TL, C, BR] = [19, ?, ?]

Step 1 — From Line 3: [19, C, BR]
  19 is A-type → all three A-type.
  Centre must be A-type: {1, 7, 13, 19}

Step 2 — From Line 2: [BL, C, TR] = [BL, C, 13]
  13 is A-type → centre A-type ✓, BL must be A-type.
  BL + C + 13 ≡ 0 → BL + C ≡ 2 (mod 3) → both A-type means sum ≡ 2 (mod 3) ✓

Step 3 — From Line 1: [7, C, B]
  7 A-type → C A-type ✓, B A-type.
  7 + C + B ≡ 0 (mod 3)

In Exact Sum mode (T=21):
  Line 3: C = 21 − 19 − BR  (two unknowns — need another line)
  Line 1: C = 21 − 7 − B    (two unknowns — need another line)
  Line 2: C = 21 − BL − 13 = 8 − BL

  If BL=1: C=7. Check Line 1: B=21−7−7=7 ✓. Check Line 3: BR=21−19−7=−5 ✗
  If BL=7: C=1. Check Line 1: B=21−7−1=13 ✓. Check Line 3: BR=21−19−1=1 ✓ 
  Solution: C=1, BL=7, B=13, BR=1. All A-type ✓`,
  },

  /* ── TRIANGLE + SQUARE ── */
  {
    id:'triSquare', name:'Triangle + Square △□', color:'#c0392b', symbol:'△□',
    what:`The Triangle+Square compound board adds one apex cell above a 3×3 square. Think of it like a house shape: the square is the walls, the apex cell is the roof peak. Total: 10 cells. The apex cell sits above the centre column of the square, connected to the top-left and top-centre of the square via diagonal lines.`,
    lines:`This board has all the lines of a 3×3 Square plus 2 extra lines through the apex:

  Square lines (8): 3 rows + 3 columns + 2 diagonals.
  Apex lines (2):
    • [apex, top-left, top-right] — the apex connects across the top of the square
    • [apex, top-centre, centre] — the apex connects down the centre column

Total: 10 constraint lines.`,
    rowcol:`APEX vs SQUARE — two zones with different logic.

  The SQUARE ZONE is exactly like solving a normal 3×3 Square puzzle. Use rows (left→right), columns (top→bottom), and both diagonals.

  The APEX CELL sits above the square. It does NOT belong to any row or column of the square. It belongs to exactly 2 lines:
    1. The "roof line" connecting apex to top-left and top-right of the square.
    2. The "centre spine" connecting apex to the top-centre and then the centre of the square.

  SOLVING ORDER:
    1. Solve the square using standard Row/Column/Diagonal logic.
    2. Once the top row and centre are known, the apex is determined by those two extra lines.
    OR:
    1. Start with the apex — it constrains the top-left, top-right, top-centre, and centre of the square.
    2. Use those constraints to solve the square from the top down.`,
    solve:`SOLVE FOR X — Triangle+Square worked example

Board: apex + 3×3 square, Rows & Cols mode.
Square (rows 1-3, cols 1-3):
  Row 1: [7,  13, 1]
  Row 2: [19,  ?, 7]
  Row 3: [13,  1, ?]
Apex: ?

Step 1 — Centre of square: Row 2, Col 2 = ?
  Row 2 constraint: [19, ?, 7]
  19 A-type, 7 A-type → middle must be A-type.
  19+x+7=26+x ≡ 0 (mod 3) → x ≡ 1 (mod 3) → {1,7,13,19}

  Col 2 constraint: [13, ?, 1]
  13 A-type, 1 A-type → middle A-type ✓.
  13+x+1=14+x ≡ 0 → x ≡ 1 (mod 3) → {1,7,13,19}

  Both constraints say A-type — pick 7: 19+7+7=33 ÷3=11 ✓, 13+7+1=21 ÷3=7 ✓

Step 2 — Bottom-right of square: Row 3, Col 3 = ?
  Row 3: [13, 1, ?] — 13 A, 1 A → blank A-type.
  13+1+x=14+x → x ≡ 1 → {1,7,13,19}. Pick 7: 14+7=21 ✓

Step 3 — Apex line: [apex, square-top-left, square-top-right] = [?, 7, 1]
  7 A-type, 1 A-type → apex must be A-type.
  x+7+1=8+x ≡ 0 → x ≡ 1 → {1,7,13,19}. 

  Centre-spine line: [apex, square-top-centre, square-centre] = [?, 13, 7]
  13 A, 7 A → apex A ✓. x+13+7=20+x ≡ 0 → x ≡ 1 → {1,7,13,19}.
  All constraints agree. Pick apex = 7.`,
  },

  /* ── TRIANGLE + CIRCLE ── */
  {
    id:'triCircle', name:'Triangle + Circle △○', color:'#2e7d45', symbol:'△○',
    what:`The Triangle+Circle board combines a 5-row triangle (15 cells) with a ring of 6 cells surrounding it. Total: 21 cells. The triangle sits inside the ring, and the apex of the triangle is connected to ring cells via a bridge line. Think of it as a sacred geometry figure: a triangle inscribed in a circle.`,
    lines:`Triangle lines (12): row triplets and edge triplets as described in the Triangle section.
  Ring lines (6): arc triplets around the 6-cell ring — each set of 3 consecutive ring cells.
  Bridge line (1): [apex, ring-cell-0, ring-cell-3] — connects the apex to the ring across the diameter.

Total: 19 constraint lines.`,
    rowcol:`TWO ZONES — solve them mostly independently.

  TRIANGLE ZONE: Solve exactly like the Triangle shape. Use horizontal row triplets and diagonal edge triplets. The apex is the most constrained cell in this zone.

  RING ZONE: Solve exactly like the Circle (ring portion only — there is no centre cell here). Use arc triplets of consecutive ring cells.

  THE BRIDGE connects the two zones. The apex cell of the triangle appears in:
    • Its two Triangle edge lines
    • The Bridge line (apex + ring-0 + ring-3)
  This means the apex has 3 constraints — it is the most constrained cell on the whole board.

  SOLVING ORDER:
    1. Solve the ring independently using arc triplets.
    2. Solve the triangle using its own lines.
    3. Use the bridge to verify the apex is consistent between both zones.
    OR: Solve the apex first (most constrained), then fan out to both zones.`,
    solve:`SOLVE FOR X — Triangle+Circle worked example

21 cells: triangle apex + 14 more triangle cells + 6 ring cells.
Bridge: [apex, ring-0, ring-3]

Ring (known): [7, 13, ?, 1, 7, ?]
Arc [ring-0, ring-1, ring-2]: [7, 13, ?]
  7 A, 13 A → ring-2 A-type. 7+13+x=20+x → x≡1 → {1,7,13,19}. Pick 7.

Arc [ring-1, ring-2, ring-3]: [13, 7, 1]  (ring-2 now=7)
  13+7+1=21 ÷3=7 ✓ (no blank here)

Arc [ring-3, ring-4, ring-5]: [1, 7, ?]
  1 A, 7 A → ring-5 A-type. 1+7+x=8+x → x≡1 → {1,7,13,19}. Pick 13.

Bridge [apex, ring-0, ring-3] = [apex, 7, 1]:
  7 A, 1 A → apex must be A-type.
  apex + 7 + 1 ≡ 0 (mod 3) → apex ≡ 1 → {1,7,13,19}

Triangle left edge triplet [apex, row1-left, row2-left]:
  Suppose row1-left=13, row2-left=7.
  apex + 13 + 7 = apex + 20 ≡ 0 → apex ≡ 1 ✓ (A-type, consistent)

In Exact Sum (T=21): apex = 21 − 7 − 1 = 13 (from bridge). Unique.`,
  },

  /* ── SQUARE + CIRCLE ── */
  {
    id:'squareCircle', name:'Square + Circle □○', color:'#2c5f8a', symbol:'□○',
    what:`The Square+Circle board places a 3×3 square in the centre surrounded by a ring of 8 cells. Total: 17 cells. The 8 ring cells orbit the square like satellites. Four spoke lines connect the corners of the square to pairs of adjacent ring cells, linking the two zones together.`,
    lines:`Square lines (8): 3 rows + 3 columns + 2 diagonals.
  Ring lines (8): arc triplets of consecutive ring cells around the 8-cell ring.
  Spoke lines (4): each corner of the square connects to the two ring cells bracketing that corner.
    Corner top-left connects to ring-7 and ring-0.
    Corner top-right connects to ring-1 and ring-2.
    Corner bottom-right connects to ring-3 and ring-4.
    Corner bottom-left connects to ring-5 and ring-6.

Total: 20 constraint lines.`,
    rowcol:`SQUARE ZONE vs RING ZONE vs SPOKE CONNECTIONS:

  SQUARE ZONE: Solve exactly like a 3×3 Square — rows, columns, diagonals. The centre cell of the square is the most constrained cell within the square zone (4 constraints).

  RING ZONE: Solve exactly like a Circle ring — arc triplets of 3 consecutive ring cells. The 8-cell ring has 8 arc triplets (each ring cell in 3 of them).

  SPOKES connect the zones. A corner cell of the square appears in:
    • 1 row + 1 column + 1 diagonal (square constraints)
    • 1 spoke line connecting it to 2 ring cells
  Total: 4 constraints per corner cell — start with corners!

  The MOST CONSTRAINED CELL is the square's centre (4 square lines) but corner cells are close behind (4 constraints including the spoke). Solve them together in the early stages.

  SOLVING APPROACH:
    1. Identify the type (A or B) of each corner using square constraints.
    2. Use the spoke lines to determine the type of the 8 ring cells.
    3. Fill the ring using arc triplets.
    4. Complete the interior square cells last.`,
    solve:`SOLVE FOR X — Square+Circle worked example

17 cells: 9 square + 8 ring. Rows & Cols mode.
Square: top-left=7, top-right=?, centre=?, rest known.
Ring (clockwise from top): [?, ?, 13, 1, ?, ?, 7, ?]

Step 1 — Square centre: Row 2 + Col 2 + both diagonals.
  Row 2 of square: [19, ?, 7]. 19 A, 7 A → centre A-type.
  19+x+7=26+x → x≡1 → {1,7,13,19}. x=7: 26+7=33 ÷3=11 ✓

Step 2 — Square top-right corner:
  Row 1: [7, 13, ?] → 7+13+x → x≡1 → A-type.
  x=1: 7+13+1=21 ÷3=7 ✓
  Anti-diagonal [top-right, centre, bottom-left]: [1, 7, bottom-left]
  1+7+BL ≡ 0 → BL ≡ 1 → A-type.

Step 3 — Spoke: top-right corner (=1) connects to ring-1 and ring-2.
  Line [top-right, ring-1, ring-2] = [1, ?, 13]
  1 A, 13 A → ring-1 must be A-type.
  1 + ring-1 + 13 = 14+ring-1 ≡ 0 → ring-1 ≡ 1 → {1,7,13,19}.
  Pick 7: 14+7=21 ✓

Step 4 — Arc [ring-0, ring-1, ring-2] = [?, 7, 13]:
  7 A, 13 A → ring-0 A-type. x+7+13=20+x → x≡1 → pick 1: 21 ✓`,
  },

  /* ── SPIRAL + HEX ── */
  {
    id:'spiralHex', name:'Spiral + Hex 🌀⬡', color:'#5a189a', symbol:'🌀⬡',
    what:`The Spiral+Hex board combines a radius-1 Hexagon (7 cells) with a 3-cell spiral arm extending from one edge of the hex. Total: 10 cells. Think of it like a flower with one petal grown into a long tendril. The hex is the flower head; the arm is the tendril reaching outward.`,
    lines:`Hexagon lines (3): horizontal + two diagonals through the hex centre.
  Spiral arm line (1): [arm-0, arm-1, arm-2] — the three arm cells in sequence.
  Bridge line (1): [hex-centre, arm-0, arm-1] — connects hex centre to the first two arm cells.

Total: 5 constraint lines.`,
    rowcol:`HEX ZONE vs ARM ZONE:

  HEX ZONE: Solve exactly like a standalone Hexagon — three axis directions through the centre. The hex centre is the most constrained cell (3 lines).

  ARM ZONE: The arm is a simple chain of 3 cells. There is only one direct arm constraint (arm-0 + arm-1 + arm-2 must be divisible by 3).

  THE BRIDGE connects them: [hex-centre, arm-0, arm-1]. This means:
    • arm-0 appears in both the arm triplet AND the bridge → 2 constraints.
    • arm-1 appears in both the arm triplet AND the bridge → 2 constraints.
    • arm-2 appears only in the arm triplet → 1 constraint.
    • hex-centre appears in its 3 hex lines AND the bridge → 4 constraints total.

  SOLVING ORDER: Start with the hex centre (4 constraints). Then use the bridge to determine arm-0 and arm-1 types. arm-2 is determined last by the arm triplet.`,
    solve:`SOLVE FOR X — Spiral+Hex worked example

10 cells, Rows & Cols mode.
Hex cells: centre=?, T=7, TR=13, BR=1, B=?, BL=19, TL=7
Arm cells: [arm-0=?, arm-1=13, arm-2=?]

Step 1 — Hex diagonal (vertical axis): [T, centre, B] = [7, ?, ?]
  7 A-type → centre A-type, B A-type.

Step 2 — Hex diagonal: [TL, centre, BR] = [7, ?, 1]
  7 A, 1 A → centre A ✓. 7+x+1=8+x → x≡1 → {1,7,13,19}

Step 3 — Hex diagonal: [BL, centre, TR] = [19, ?, 13]
  19 A, 13 A → centre A ✓. 19+x+13=32+x → x≡1 → {1,7,13,19}

All three hex diagonals agree: centre is A-type with options {1,7,13,19}.
In Exact Sum (T=21): from each line centre gets a unique value.
  Line [7,x,1]: x=21−7−1=13 ✓

Step 4 — Bridge [hex-centre, arm-0, arm-1] = [13, ?, 13]:
  13 A, 13 A → arm-0 must be A-type.
  13 + arm-0 + 13 = 26+arm-0 ≡ 0 → arm-0 ≡ 1 → {1,7,13,19}
  In Exact Sum: arm-0 = 21−13−13 = −5 ✗  CONTRADICTION!
  This means T=21 doesn't work for this arm configuration.
  With T=39: arm-0 = 39−13−13 = 13 ✓

Step 5 — Arm triplet [arm-0, arm-1, arm-2] = [13, 13, ?]:
  13+13+arm-2 = 26+arm-2 ≡ 0 → arm-2 ≡ 1 → A-type.
  In Exact Sum (T=39): arm-2 = 39−13−13 = 13 ✓`,
  },

  /* ── VESICA + TRIANGLE ── */
  {
    id:'vesicaTri', name:'Vesica + Triangle ⋈△', color:'#7d4e00', symbol:'⋈△',
    what:`The Vesica+Triangle board places a small 3-row triangle (6 cells) above a full Vesica Piscis (15 cells). Total: 21 cells. The two shapes are treated as independent sub-systems — the triangle does not directly share cells with the vesica. Think of it as a sacred diagram: the triangle representing spirit hovering above the vesica representing union.`,
    lines:`Vesica lines (15): all the constraint lines of the Vesica Piscis — left rows, right rows, columns, and diagonals of both overlapping squares.
  Triangle lines (3): 
    • Base row: [base-left, base-middle, base-right]
    • Left edge: [apex, middle-left, base-left]
    • Right edge: [apex, middle-right, base-right]

Total: 18 constraint lines. The two zones are independent — solve them separately.`,
    rowcol:`TWO COMPLETELY INDEPENDENT ZONES:

  VESICA ZONE (bottom): Solve exactly like the standalone Vesica. Start with the shared column (column 2), then solve left and right squares.
    Left rows: read columns 0→1→2.
    Right rows: read columns 2→3→4.
    Shared column: column 2, read top to bottom.
    Left diagonals and right diagonals.

  TRIANGLE ZONE (top): Solve exactly like a small 3-row Triangle.
    Base row: [base-left, base-middle, base-right] — horizontal, 3 cells.
    Left edge: [apex, middle-left, base-left] — diagonal going down-left.
    Right edge: [apex, middle-right, base-right] — diagonal going down-right.
    The apex is the most constrained cell in the triangle zone (appears in both edges).

  There is NO constraint connecting the vesica to the triangle. They are solved independently. This means you can complete the vesica first, then do the triangle, without any interaction between the two.`,
    solve:`SOLVE FOR X — Vesica+Triangle worked example

21 cells: 15 vesica (3×5 grid) + 6 triangle (apex + 2 middle + 3 base).
Rows & Cols mode.

VESICA ZONE:
  Shared column 2 (col 2, rows 0-2): [7, ?, 13]
  7 A-type, 13 A-type → middle must be A-type.
  7+x+13=20+x ≡ 0 → x≡1 → {1,7,13,19}. Pick 7.

  Left row 1 (middle): [1, ?, 7]  (col 2 middle is now 7)
  1 A, 7 A → middle blank A-type.
  1+x+7=8+x ≡ 0 → x≡1 → A-type. Pick 7: 1+7+7=15 ✓

  Right row 1 (middle): [7, ?, 19]  (col 2 middle is 7)
  7 A, 19 A → blank A-type.
  7+x+19=26+x ≡ 0 → x≡1 → A-type. Pick 7: 7+7+19=33 ✓

TRIANGLE ZONE (completely separate):
  Triangle base: [?, 7, 13]
  7 A, 13 A → base-left must be A-type.
  x+7+13=20+x ≡ 0 → x≡1 → pick 1: 1+7+13=21 ✓

  Triangle right edge: [apex, middle-right, base-right] = [apex, ?, 13]
  13 A → all A-type. Suppose middle-right unknown → A-type.

  Triangle left edge: [apex, middle-left, base-left] = [apex, ?, 1]
  1 A → all A-type. 

  Apex appears in both edges → A-type.
  Left edge: apex+middle-left+1 ≡ 0. Right edge: apex+middle-right+13 ≡ 0.
  In Exact Sum (T=21): 
    Left edge: apex = 21−middle-left−1 = 20−middle-left.
    Right edge: apex = 21−middle-right−13 = 8−middle-right.
    If middle-left=7: apex=13. If middle-right=1: apex=7. Contradiction!
    If middle-left=1: apex=19. Check right edge: 19=8−middle-right → middle-right=−11 ✗
    Try middle-left=13: apex=7. Right: 7=8−middle-right → middle-right=1 ✓ Check: 7+1+13=21 ✓
    Solution: apex=7, middle-left=13, middle-right=1.`,
  },

  /* ── HEX + SPIRAL ── */
  {
    id:'hexSpiral', name:'Hex + Spiral ⬡🌀', color:'#5a189a', symbol:'⬡🌀',
    what:`The Hex+Spiral board places a radius-1 Hexagon (7 cells) at the top and a 9-cell spiral arm curling outward from one hex edge. Total: 16 cells. The spiral arm is longer here than in the Spiral+Hex variant, giving more path-triplet constraints and a stronger chain effect through the arm.`,
    lines:`Hexagon lines (3): same as standalone Hexagon.
  Spiral arm lines: with 9 arm cells, there are 7 consecutive triplet lines: [0-1-2],[1-2-3],...,[6-7-8].
  (No bridge line here — the arm cells are placed at pixel positions and the constraint system treats them as an independent chain.)

Total: 10 constraint lines.`,
    rowcol:`HEX ZONE vs LONG SPIRAL ARM:

  HEX ZONE: Solve exactly like a standalone Hexagon — three axes through the centre, centre cell is most constrained.

  SPIRAL ARM: A chain of 9 cells. Each interior arm cell (positions 1-7) appears in THREE consecutive triplets, making them highly constrained. The end cells (0 and 8) only appear in one triplet each.

  The TWO ZONES are independent (no bridge constraint). Solve the hex first, then solve the arm separately.

  ARM SOLVING STRATEGY:
    The chain of 9 cells with overlapping triplets is like a Sudoku row with a divisibility rule instead of uniqueness.
    Once you know the type (A or B) of any two consecutive arm cells, the third is forced.
    And once you know that third, it pairs with the next to force the one after it.
    Type propagates like a wave: know cells 0 and 1 → can determine 2. Know 1 and 2 → determine 3. Etc.
    In Exact Sum mode: know cells 0 and 1 → x₂ = T−x₀−x₁. Know 1 and 2 → x₃ = T−x₁−x₂. The whole arm falls like dominoes.`,
    solve:`SOLVE FOR X — Hex+Spiral worked example

16 cells: 7 hex + 9 arm. Rows & Cols mode.
Hex: centre=?, T=7, TR=13, BR=1, B=19, BL=7, TL=13
Arm: [arm-0=7, arm-1=?, arm-2=13, arm-3=?, arm-4=1, arm-5=?, arm-6=7, arm-7=?, arm-8=13]

HEX ZONE:
  All three hex diagonals share the centre.
  Diagonal [T, centre, B]: [7, ?, 19] → 7+x+19=26+x → x≡1 → A-type.
  x=7: 7+7+19=33 ✓

ARM ZONE (chain of 9, Exact Sum T=21):
  Triplet [0,1,2]: [7, ?, 13]
    arm-1 = 21 − 7 − 13 = 1  ✓ (1 ∈ S, A-type)
  Triplet [1,2,3]: [1, 13, ?]
    arm-3 = 21 − 1 − 13 = 7  ✓
  Triplet [2,3,4]: [13, 7, 1]
    13+7+1 = 21 ✓ (no blank)
  Triplet [3,4,5]: [7, 1, ?]
    arm-5 = 21 − 7 − 1 = 13  ✓
  Triplet [4,5,6]: [1, 13, 7]
    1+13+7 = 21 ✓
  Triplet [5,6,7]: [13, 7, ?]
    arm-7 = 21 − 13 − 7 = 1  ✓
  Triplet [6,7,8]: [7, 1, 13]
    7+1+13 = 21 ✓

The arm fills perfectly in order, left to right.
Notice the pattern: 7, 1, 13, 7, 1, 13, 7, 1, 13 — a repeating cycle of A-type values.
This is the wave propagation: each new cell is forced by the previous two.`,
  },
];

const WalkthroughPanel = ({onClose}) => {
  const [tab, setTab]     = useState('ref_intro');
  const [shapeTab, setShapeTab] = useState('square');
  const [refTab, setRefTab]     = useState('rowcol');

  const isShape = tab === 'shapes';
  const isRef   = tab === 'ref';
  const curShape = SHAPE_WALKTHROUGHS.find(s => s.id === shapeTab) || SHAPE_WALKTHROUGHS[0];

  return (
    <div className="panel fade-in" style={{marginTop:8, maxWidth:760}}>
      <div className="panel-title">✦ Gameplay Walkthrough — How to Solve Every Shape</div>

      <WCallout emoji="👋" title="No maths degree needed — everything explained from scratch" color='#4a7c59' bg='#f0f7f2'>
        This walkthrough covers every shape on every board: what the lines are, what "row" and "column" mean on that shape, and how to solve for X step by step. Start with the Reference section if you are new, then dive into any shape.
      </WCallout>

      {/* Top-level tabs */}
      <div style={{display:'flex', gap:5, marginBottom:18, borderBottom:`1px solid ${T.border}`, paddingBottom:10}}>
        {[
          {id:'ref',    label:'📐 Reference'},
          {id:'shapes', label:'🔷 All Shapes'},
        ].map(t=>(
          <button key={t.id} className={`action-btn ${tab===t.id?'primary':'ghost'}`}
            style={{fontSize:'.78rem', padding:'6px 16px'}}
            onClick={()=>setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════ REFERENCE TAB ══════════════════════════ */}
      {tab==='ref'&&(
        <div>
          {/* ref sub-tabs */}
          <div style={{display:'flex', gap:4, flexWrap:'wrap', marginBottom:16}}>
            {[
              {id:'rowcol',  label:'Rows vs Columns'},
              {id:'types',   label:'A-type & B-type'},
              {id:'linear',  label:'Linear Equations'},
              {id:'solvex',  label:'Solve for X'},
              {id:'strategy',label:'Strategy'},
            ].map(t=>(
              <button key={t.id} className={`tab-btn${refTab===t.id?' active':''}`}
                onClick={()=>setRefTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ROWS vs COLUMNS */}
          {refTab==='rowcol'&&(
            <div>
              <WCallout emoji="🗺️" title="What are rows, columns and diagonals?" color='#c0392b' bg='#fff5f5'>
                These words describe different directions you can read groups of cells on a grid. They only have their traditional meaning on rectangular (square) boards. On other shapes — triangles, circles, spirals — we use different language, explained in each shape's section.
              </WCallout>

              <div className="section-label">The annotated 3×3 grid</div>
              <MiniAnnotatedGrid/>

              <WStep n="R" color='#c0392b' title="Row — goes left to right (→)">
                A row is a horizontal group of cells, all at the same height. You read it left to right, like reading a sentence.
                A 3×3 grid has 3 rows: top (Row 1), middle (Row 2), bottom (Row 3).
                <WMono>{`Row 1 (top):     1  +  7  + 13  =  21
Row 2 (middle): 5  + 11  + 17  =  33
Row 3 (bottom):19  + 23  +  1  =  43`}</WMono>
                The rule applies to every row: the sum must be divisible by 3.
                Row 1: 21 ÷ 3 = 7 ✓. Row 2: 33 ÷ 3 = 11 ✓. Row 3: 43 — wait, 4+3=7, not divisible by 3. ✗
                So this grid would fail the check. The numbers in Row 3 must be replaced with ones that sum to a multiple of 3.
              </WStep>

              <WStep n="C" color='#2c5f8a' title="Column — goes top to bottom (↓)">
                A column is a vertical group of cells, all in the same left-right position. Read top to bottom, like a pole.
                A 3×3 grid has 3 columns: left (Col 1), middle (Col 2), right (Col 3).
                <WMono>{`Col 1 (left):    1  +  5  + 19  =  25
Col 2 (middle): 7  + 11  + 23  =  41
Col 3 (right): 13  + 17  +  1  =  31`}</WMono>
                The cell at Row 1, Col 2 (value = 7) belongs to Row 1 AND Col 2 at the same time. It must satisfy both the row rule and the column rule. That is the purple cell in the diagram above.
              </WStep>

              <WStep n="D" color='#2e7d45' title="Diagonal — goes corner to corner (↘ or ↙)">
                A diagonal cuts across the grid from one corner to the opposite corner. There are always exactly two diagonals in a square grid.
                <WMono>{`Main diagonal (↘, top-left to bottom-right):   1  + 11  +  1  = 13
Anti-diagonal (↙, top-right to bottom-left):  13  + 11  + 19  = 43`}</WMono>
                The centre cell (Row 2, Col 2) is on both diagonals AND its row AND its column — that is 4 constraint lines at once. It is the most constrained cell on a square board. Always solve it first.
              </WStep>

              <div className="section-label">Diagonals illustrated</div>
              <DiagonalGrid/>

              <WCallout emoji="⚡" title="On non-square boards: think 'connected triplet' not 'row'" color='#5a189a' bg='#f8f0ff'>
                On triangle, circle, spiral, hex, and vesica boards the concept of "row" and "column" does not directly apply. Instead, just think: <strong>a "line" is any group of 3 cells connected by a golden dashed line on the board.</strong> Every such triplet must have its sum divisible by 3. The shape section for each board explains what its specific triplets are.
              </WCallout>
            </div>
          )}

          {/* A-TYPE & B-TYPE */}
          {refTab==='types'&&(
            <div>
              <p style={{fontSize:'.88rem',lineHeight:1.8,marginBottom:12}}>
                The 8 allowed numbers split into two families. This split is the engine that makes the whole game work.
              </p>
              <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:16}}>
                {[
                  {label:'A-type ≡ 1 (mod 3)', color:'#2c5f8a', bg:'#ddeeff', nums:[1,7,13,19],
                   why:'Divide by 3 and the remainder is always 1.\n1÷3=0 r1 · 7÷3=2 r1 · 13÷3=4 r1 · 19÷3=6 r1'},
                  {label:'B-type ≡ 2 (mod 3)', color:'#7d4e00', bg:'#fef9ec', nums:[5,11,17,23],
                   why:'Divide by 3 and the remainder is always 2.\n5÷3=1 r2 · 11÷3=3 r2 · 17÷3=5 r2 · 23÷3=7 r2'},
                ].map(fam=>(
                  <div key={fam.label} style={{background:fam.bg,border:`1.5px solid ${fam.color}`,borderRadius:7,padding:'14px 16px',flex:1,minWidth:220}}>
                    <div style={{fontFamily:'Cinzel,serif',fontWeight:700,color:fam.color,marginBottom:8}}>{fam.label}</div>
                    <div style={{display:'flex',gap:5,marginBottom:10}}>
                      {fam.nums.map(n=>(
                        <span key={n} style={{width:36,height:36,background:'#fff',border:`1.5px solid ${fam.color}`,
                          borderRadius:4,display:'inline-flex',alignItems:'center',justifyContent:'center',
                          fontFamily:'Cinzel,serif',fontWeight:700,fontSize:'.9rem',color:fam.color}}>
                          {n}
                        </span>
                      ))}
                    </div>
                    <WMono>{fam.why}</WMono>
                  </div>
                ))}
              </div>
              <WCallout emoji="💡" title="The key rule that flows from this" color='#2c5f8a' bg='#ddeeff'>
                <strong>A-type + A-type + A-type: remainder = 1+1+1 = 3 ≡ 0 (mod 3) ✓ always valid</strong><br/>
                <strong>B-type + B-type + B-type: remainder = 2+2+2 = 6 ≡ 0 (mod 3) ✓ always valid</strong><br/>
                A-type + B-type + anything: remainder = 1+2+? = 3+? The ? would need to be 0, but no number in S has remainder 0. So mixed lines are <strong>always impossible</strong>.
                <WMono>{`A+A+A: 1+7+13=21  ✓    A+A+A: 7+13+19=39  ✓
B+B+B: 5+11+17=33  ✓    B+B+B: 11+17+23=51  ✓
A+B+A: 1+5+13=19   ✗    A+B+B: 7+5+11=23   ✗`}</WMono>
              </WCallout>
              <WCallout emoji="🔍" title="How to check a number's type instantly" color='#4a7c59' bg='#f0f7f2'>
                Subtract the nearest lower multiple of 3. What's left over is the remainder.
                <WMono>{`17: nearest lower multiple of 3 is 15. 17−15=2. Remainder 2 → B-type.
13: nearest lower multiple of 3 is 12. 13−12=1. Remainder 1 → A-type.
19: nearest lower multiple of 3 is 18. 19−18=1. Remainder 1 → A-type.
23: nearest lower multiple of 3 is 21. 23−21=2. Remainder 2 → B-type.`}</WMono>
                Or just memorise: {'{1,7,13,19}'} are A-type. {'{5,11,17,23}'} are B-type.
              </WCallout>
            </div>
          )}

          {/* LINEAR EQUATIONS */}
          {refTab==='linear'&&(
            <div>
              <WCallout emoji="⚖️" title="A linear equation is just a maths sentence" color='#2c5f8a' bg='#ddeeff'>
                When two cells in a line are known and one is blank, you have: "known + known + blank = total." That sentence is the equation. The blank is called x. Solving the equation means finding what x must be. It is never more complicated than that.
              </WCallout>
              <WMono>{`"Seven plus thirteen plus something equals twenty-one"
becomes:    7 + 13 + x = 21`}</WMono>
              <div className="section-label">Why "linear"?</div>
              <p style={{fontSize:'.88rem',lineHeight:1.8,marginBottom:10}}>
                "Linear" means x appears once, by itself, added to or subtracted from other numbers. It is not squared, not inside a square root, not multiplied by another unknown. Every equation in this game is linear. That means you can always solve it with simple addition and subtraction — guaranteed.
              </p>
              <WMono>{`Linear ✓:     7 + 13 + x = 21      x appears once, plain
Not linear ✗: x × x = 21             x is squared (x²)
Not linear ✗: x × y = 21             two unknowns multiplied`}</WMono>
              <div className="section-label">The balance-scales rule</div>
              <WCallout emoji="⚖️" title="Whatever you do to one side, do to the other" color='#4a7c59' bg='#f0f7f2'>
                An equation is a perfectly balanced scale. Left side = right side. To isolate x (get it alone), subtract everything else from both sides. The scale stays balanced because you did the same thing to both sides.
              </WCallout>
              <WMono>{`7 + 13 + x = 21
     20 + x = 21        (7+13=20, simplified left side)
          x = 21 − 20   (subtracted 20 from BOTH sides)
          x = 1         ✓`}</WMono>
              <div className="section-label">The shortcut — memorise this one formula</div>
              <WMono>{`x = total − known_1 − known_2

Examples:
  [7, 13, ?], T=21:  x = 21 − 7 − 13 = 1
  [1, 19, ?], T=39:  x = 39 − 1 − 19 = 19
  [5, 17, ?], T=33:  x = 33 − 5 − 17 = 11`}</WMono>
              <p style={{fontSize:'.88rem',lineHeight:1.8}}>
                When there is no fixed total T (Rows Only and Rows & Cols modes), you cannot solve for an exact value — but you can still determine the type (A or B) and narrow down the options. In Exact Sum and Boss Chamber modes, T is always given, and the formula above gives you the precise answer in one step.
              </p>
            </div>
          )}

          {/* SOLVE FOR X */}
          {refTab==='solvex'&&(
            <div>
              <p style={{fontSize:'.88rem',lineHeight:1.8,marginBottom:14}}>
                The full solve-for-X process every time, in order. These steps apply to any board shape.
              </p>
              <WStep n="1" color='#c0392b' title="Find the most constrained blank first">
                Count how many lines each blank appears in. Start with the blank in the most lines. On a square board that is usually the centre. On a circle it is the centre spoke cell. On a spiral it is any middle-path cell.
              </WStep>
              <WStep n="2" color='#4a7c59' title="Determine the type (A or B) from the known cells">
                Look at the known cells in every line containing the blank.
                <WMono>{`All known cells A-type → blank must be A-type → {1,7,13,19}
All known cells B-type → blank must be B-type → {5,11,17,23}
Mixed A and B types   → IMPOSSIBLE → backtrack`}</WMono>
                If two different lines give contradictory type requirements → impossible → backtrack.
              </WStep>
              <WStep n="3" color='#2c5f8a' title="Apply the formula if a target T is given">
                <WMono>x = T − known_1 − known_2</WMono>
                Check: Is the result in {'{1,5,7,11,13,17,19,23}'}? Does it match the type from step 2?
                If yes: done, fill it in. If no: contradiction → backtrack.
              </WStep>
              <WStep n="4" color='#7d4e00' title="No target T? Check divisibility directly">
                Test each of the 4 type-matching candidates: does known_1 + known_2 + candidate sum to a multiple of 3?
                <WMono>{`Line [7, 13, ?], no target, ? must be A-type:
  7+13+1=21  ÷3=7  ✓
  7+13+7=27  ÷3=9  ✓
  7+13+13=33 ÷3=11 ✓
  7+13+19=39 ÷3=13 ✓
All four work → multiple valid solutions → pick any one`}</WMono>
              </WStep>
              <WStep n="5" color='#5a189a' title="Verify every line after filling all blanks">
                Go through every constraint line on the board. Add up the three cells. Confirm the sum is divisible by 3 (or equals T). If any line fails, find the first wrong choice and try again.
              </WStep>
              <WCallout emoji="🔒" title="Contradiction = wrong choice earlier, not unsolvable puzzle" color='#6a0a0a' bg='#fff5f5'>
                Every puzzle generated by this game has at least one valid solution. If you reach a contradiction, you made a wrong choice somewhere earlier. Go back to the last blank where you had more than one option, pick a different value, and continue. This technique is called backtracking.
              </WCallout>
            </div>
          )}

          {/* STRATEGY */}
          {refTab==='strategy'&&(
            <div>
              <WCallout emoji="🧭" title="One universal method for all 12 shapes" color='#5a189a' bg='#f8f0ff'>
                <strong>Every blank is a variable. Every line is an equation. Solve the system.</strong> The shape of the board changes which cells share lines — but the method never changes. Type first, formula second, verify last.
              </WCallout>
              <WMono>{`Universal solving order:

1. FIND most constrained blank (most lines through it)
2. DETERMINE type: A or B (from known cells in those lines)
   → contradiction? backtrack.
3. IF target T given: x = T − known_1 − known_2
   → result not in S? backtrack.
   → result wrong type? backtrack.
4. IF no target T: any value of correct type works
   → try 7 first (middle of A-type range), adjust if needed
5. VERIFY all lines after filling every blank
   → fail? find first wrong choice, backtrack

Shape-specific starting hints:
  Square:        start with centre cell (4 lines)
  Triangle:      start with apex cell (2 edge lines, most constrained)
  Circle:        start with centre cell (4 spoke lines)
  Spiral:        start from either end, propagate inward
  Vesica:        start with shared column (col 2)
  Hexagon:       start with centre cell (3 axis lines)
  △□ Tri+Square: start with square centre, then apex
  △○ Tri+Circle: start with apex (bridge + 2 edge lines)
  □○ Sq+Circle:  start with square corners (spoke + sq lines)
  🌀⬡ Spir+Hex:  solve hex first, then arm left-to-right
  ⋈△ Ves+Tri:   solve vesica and triangle independently
  ⬡🌀 Hex+Spir:  solve hex first, then propagate arm`}</WMono>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════ SHAPES TAB ══════════════════════════ */}
      {tab==='shapes'&&(
        <div>
          {/* Shape selector */}
          <div style={{marginBottom:16}}>
            <div className="section-label">Pure Sacred Forms</div>
            <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:10}}>
              {SHAPE_WALKTHROUGHS.filter(s=>['square','triangle','circle','spiral','vesica','hexagon'].includes(s.id)).map(s=>(
                <button key={s.id} className={`shape-btn${shapeTab===s.id?' active':''}`}
                  onClick={()=>setShapeTab(s.id)}
                  style={{borderColor:shapeTab===s.id?s.color:T.border,
                    background:shapeTab===s.id?s.color:'',
                    color:shapeTab===s.id?'#fff':''}}>
                  {s.symbol} {s.name.split(' ')[0]}
                </button>
              ))}
            </div>
            <div className="section-label">Compound Forms</div>
            <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
              {SHAPE_WALKTHROUGHS.filter(s=>!['square','triangle','circle','spiral','vesica','hexagon'].includes(s.id)).map(s=>(
                <button key={s.id} className={`shape-btn${shapeTab===s.id?' active':''}`}
                  onClick={()=>setShapeTab(s.id)}
                  style={{borderColor:shapeTab===s.id?s.color:T.border,
                    background:shapeTab===s.id?s.color:'',
                    color:shapeTab===s.id?'#fff':''}}>
                  {s.symbol}
                </button>
              ))}
            </div>
          </div>

          {/* Shape content */}
          <div key={curShape.id} className="fade-in">
            {/* Header */}
            <div style={{background:`${curShape.color}12`,border:`2px solid ${curShape.color}`,borderRadius:8,padding:'14px 18px',marginBottom:16}}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
                <span style={{fontSize:'1.6rem'}}>{curShape.symbol}</span>
                <div style={{fontFamily:'Cinzel,serif',fontWeight:700,color:curShape.color,fontSize:'1.1rem'}}>{curShape.name}</div>
              </div>
              <p style={{fontSize:'.87rem',lineHeight:1.75,color:'#333',margin:0}}>{curShape.what}</p>
            </div>

            {/* Mini diagram */}
            {['square','triangle','circle','spiral','vesica','hexagon'].includes(curShape.id)&&(
              <div style={{textAlign:'center',marginBottom:14}}>
                <ShapeDiagram shape={curShape.id}/>
                <div style={{fontSize:'.68rem',color:'#8a7360',fontFamily:'Spectral SC,serif',letterSpacing:'.06em'}}>
                  Board layout preview — blue=A-type, amber=B-type, gold=centre
                </div>
              </div>
            )}

            {/* Three accordion sections */}
            {[
              {key:'lines',    title:'What are the constraint lines?', color:'#4a7c59', icon:'🔗', body: curShape.lines},
              {key:'rowcol',   title:'Rows, columns & directions explained', color:'#c0392b', icon:'🗺️', body: curShape.rowcol},
              {key:'solve',    title:'Solve for X — worked example', color:'#2c5f8a', icon:'🔍', body: curShape.solve},
            ].map(sec=>(
              <ShapeAccordion key={sec.key} title={`${sec.icon} ${sec.title}`} color={sec.color}>
                <WMono>{sec.body}</WMono>
              </ShapeAccordion>
            ))}
          </div>
        </div>
      )}

      <button className="action-btn ghost" style={{marginTop:20}} onClick={onClose}>← Back to Game</button>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   PUZZLE LIBRARY — upload / download JSON puzzles
══════════════════════════════════════════════════════════════

   JSON format for a single puzzle:
   {
     "version": 1,
     "shapeId": "square",
     "modeId": "rowsOnly",
     "targetSum": null,
     "cells": [...],          // cell descriptor array from layout
     "lines": [...],          // constraint line index array
     "puzzle": [...],         // cell values: numbers or "?"
     "fixed": [...],          // boolean array — true = clue cell
     "title": "My Puzzle",    // optional display title
     "notes": "..."           // optional notes
   }

   A collection file wraps an array:
   {
     "version": 1,
     "collection": "My Set",
     "puzzles": [ {...}, {...}, ... ]
   }
══════════════════════════════════════════════════════════════ */

const PUZZLE_VERSION = 1;

/* Serialise a live puzzle into the JSON format */
const serialisePuzzle = (gs, shapeId, modeId, title='', notes='') => ({
  version: PUZZLE_VERSION,
  shapeId,
  modeId,
  targetSum: gs.targetSum ?? null,
  cells:  gs.cells,
  lines:  gs.lines,
  puzzle: gs.puzzle,
  fixed:  gs.fixed,
  title:  title || `${SHAPES[shapeId].name} · ${MODES[modeId].name}`,
  notes,
  createdAt: new Date().toISOString(),
});

/* Validate a parsed puzzle object */
const validatePuzzleObj = (p) => {
  if(!p || typeof p !== 'object')          return 'Not an object';
  if(p.version !== PUZZLE_VERSION)         return `Unknown version ${p.version}`;
  if(!SHAPES[p.shapeId])                   return `Unknown shapeId "${p.shapeId}"`;
  if(!MODES[p.modeId])                     return `Unknown modeId "${p.modeId}"`;
  if(!Array.isArray(p.puzzle))             return 'puzzle must be an array';
  if(!Array.isArray(p.fixed))              return 'fixed must be an array';
  if(!Array.isArray(p.cells))              return 'cells must be an array';
  if(!Array.isArray(p.lines))              return 'lines must be an array';
  if(p.puzzle.length !== p.cells.length)   return 'puzzle/cells length mismatch';
  if(p.fixed.length  !== p.cells.length)   return 'fixed/cells length mismatch';
  const allowed = new Set([...ALL_CANDS, '?']);
  for(const v of p.puzzle) if(!allowed.has(v)) return `Invalid value "${v}" in puzzle`;
  return null; // null = valid
};

/* Load a puzzle object into the game state */
const loadPuzzleIntoGs = (p, setGs, setShapeId, setModeId, setView, setMsg) => {
  const err = validatePuzzleObj(p);
  if(err){ setMsg({text:`Invalid puzzle: ${err}`, ok:false}); return false; }
  const positions = computePositions(p.cells, p.shapeId);
  setShapeId(p.shapeId);
  setModeId(p.modeId);
  setGs({
    puzzle:    p.puzzle,
    fixed:     p.fixed,
    cells:     p.cells,
    lines:     p.lines,
    positions,
    targetSum: p.targetSum ?? null,
  });
  setView('game');
  setMsg(null);
  return true;
};

/* Download a blob as a file */
const downloadJSON = (obj, filename) => {
  const blob = new Blob([JSON.stringify(obj, null, 2)], {type:'application/json'});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
};

const PuzzleLibraryPanel = ({gs, shapeId, modeId, setGs, setShapeId, setModeId, setView, onClose}) => {
  const [tab,         setTab]         = useState('download');
  const [uploadMsg,   setUploadMsg]   = useState(null);
  const [collection,  setCollection]  = useState([]);   // loaded puzzles from file
  const [selIdx,      setSelIdx]      = useState(null);
  const [title,       setTitle]       = useState('');
  const [notes,       setNotes]       = useState('');
  const [collName,    setCollName]    = useState('My Puzzle Collection');
  const [msg,         setMsg]         = useState(null);

  const hasPuzzle = !!gs.puzzle;

  /* ── Download single puzzle ── */
  const downloadSingle = () => {
    if(!hasPuzzle){ setMsg({text:'No active puzzle to download.',ok:false}); return; }
    const obj = serialisePuzzle(gs, shapeId, modeId, title, notes);
    const safeName = (title||'puzzle').replace(/[^a-z0-9]/gi,'_').toLowerCase();
    downloadJSON(obj, `${safeName}.json`);
    setMsg({text:'Puzzle downloaded.', ok:true});
  };

  /* ── Add current puzzle to session collection ── */
  const addToCollection = () => {
    if(!hasPuzzle){ setMsg({text:'No active puzzle to add.',ok:false}); return; }
    const obj = serialisePuzzle(gs, shapeId, modeId, title, notes);
    setCollection(prev => [...prev, obj]);
    setMsg({text:`Added "${obj.title}" to collection (${collection.length+1} puzzle${collection.length>0?'s':''}).`, ok:true});
  };

  /* ── Download whole collection ── */
  const downloadCollection = () => {
    if(collection.length===0){ setMsg({text:'Collection is empty — add puzzles first.',ok:false}); return; }
    const obj = { version: PUZZLE_VERSION, collection: collName, puzzles: collection };
    const safeName = collName.replace(/[^a-z0-9]/gi,'_').toLowerCase();
    downloadJSON(obj, `${safeName}.json`);
    setMsg({text:`Downloaded collection "${collName}" (${collection.length} puzzles).`, ok:true});
  };

  /* ── Upload file ── */
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if(!file) return;
    setUploadMsg(null); setCollection([]); setSelIdx(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if(parsed.version !== PUZZLE_VERSION){
          setUploadMsg({text:`Unknown version: ${parsed.version}`, ok:false}); return;
        }
        // Collection file
        if(Array.isArray(parsed.puzzles)) {
          const errs = [];
          parsed.puzzles.forEach((p,i)=>{ const e=validatePuzzleObj(p); if(e) errs.push(`Puzzle ${i+1}: ${e}`); });
          if(errs.length){ setUploadMsg({text:`Errors in collection:\n${errs.join('\n')}`, ok:false}); return; }
          setCollection(parsed.puzzles);
          setCollName(parsed.collection || 'Uploaded Collection');
          setUploadMsg({text:`Loaded collection "${parsed.collection||'Untitled'}" with ${parsed.puzzles.length} puzzle${parsed.puzzles.length!==1?'s':''}.`, ok:true});
          setTab('upload');
        }
        // Single puzzle file
        else {
          const err = validatePuzzleObj(parsed);
          if(err){ setUploadMsg({text:`Invalid puzzle: ${err}`, ok:false}); return; }
          setCollection([parsed]);
          setUploadMsg({text:`Loaded single puzzle: "${parsed.title||'Untitled'}"`, ok:true});
          setTab('upload');
        }
      } catch(ex) {
        setUploadMsg({text:`JSON parse error: ${ex.message}`, ok:false});
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be re-uploaded
    e.target.value = '';
  };

  /* ── Play a puzzle from the loaded collection ── */
  const playSelected = () => {
    if(selIdx===null){ setMsg({text:'Select a puzzle first.',ok:false}); return; }
    const p = collection[selIdx];
    loadPuzzleIntoGs(p, setGs, setShapeId, setModeId, setView, setMsg);
  };

  const removeFromCollection = (idx) => {
    setCollection(prev => prev.filter((_,i)=>i!==idx));
    if(selIdx===idx) setSelIdx(null);
    else if(selIdx!==null && selIdx>idx) setSelIdx(selIdx-1);
  };

  const Msg = ({m}) => m ? (
    <div style={{padding:'8px 14px',borderRadius:4,marginBottom:10,fontSize:'.83rem',fontWeight:600,
      background:m.ok?'#e6f4ea':'#fdecea',color:m.ok?'#2e7d45':'#b00020',
      border:`1px solid ${m.ok?'#a8d5b5':'#f5c6c6'}`,whiteSpace:'pre-wrap'}}>
      {m.text}
    </div>
  ) : null;

  const inputStyle = {
    width:'100%', padding:'7px 10px', border:`1.5px solid ${T.border}`, borderRadius:4,
    fontFamily:'Spectral,serif', fontSize:'.85rem', color:T.ink, background:'#fff',
    boxSizing:'border-box', marginBottom:8,
  };
  const labelStyle = {fontSize:'.72rem',fontWeight:700,color:'#8a7360',
    fontFamily:'Spectral SC,serif',letterSpacing:'.06em',display:'block',marginBottom:3};

  return (
    <div className="panel fade-in" style={{marginTop:8, maxWidth:680}}>
      <div className="panel-title">✦ Puzzle Library — Upload & Download</div>

      {/* Tab bar */}
      <div style={{display:'flex',gap:5,marginBottom:18,borderBottom:`1px solid ${T.border}`,paddingBottom:10}}>
        {[
          {id:'download', label:'⬇ Download / Export'},
          {id:'upload',   label:'⬆ Upload / Import'},
        ].map(t=>(
          <button key={t.id} className={`action-btn ${tab===t.id?'primary':'ghost'}`}
            style={{fontSize:'.78rem',padding:'6px 16px'}}
            onClick={()=>setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ DOWNLOAD TAB ═══ */}
      {tab==='download'&&(
        <div>
          <Msg m={msg}/>

          {/* Current puzzle info */}
          {hasPuzzle ? (
            <div style={{background:`${T.gold}15`,border:`1.5px solid ${T.goldLight}`,borderRadius:7,
              padding:'12px 16px',marginBottom:18}}>
              <div style={{fontFamily:'Cinzel,serif',fontWeight:700,fontSize:'.88rem',color:T.ink,marginBottom:8}}>
                Active Puzzle
              </div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12}}>
                <span style={{background:SHAPES[shapeId].color,color:'#fff',borderRadius:3,
                  padding:'2px 10px',fontSize:'.67rem',fontWeight:700,fontFamily:'Spectral SC,serif'}}>
                  {SHAPES[shapeId].symbol} {SHAPES[shapeId].name}
                </span>
                <span style={{background:MODES[modeId].color,color:'#fff',borderRadius:3,
                  padding:'2px 10px',fontSize:'.67rem',fontWeight:700,fontFamily:'Spectral SC,serif'}}>
                  {MODES[modeId].name}
                </span>
                <span style={{background:T.parchment,border:`1px solid ${T.border}`,borderRadius:3,
                  padding:'2px 10px',fontSize:'.67rem',fontFamily:'Spectral SC,serif'}}>
                  {gs.cells?.length} cells · {gs.puzzle?.filter(v=>v==='?').length} blanks
                </span>
              </div>
              <label style={labelStyle}>Puzzle title (optional)</label>
              <input style={inputStyle} value={title}
                onChange={e=>setTitle(e.target.value)}
                placeholder={`${SHAPES[shapeId].name} · ${MODES[modeId].name}`}/>
              <label style={labelStyle}>Notes (optional)</label>
              <textarea style={{...inputStyle,height:56,resize:'vertical'}} value={notes}
                onChange={e=>setNotes(e.target.value)}
                placeholder="Difficulty, hints, description…"/>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                <button className="action-btn success" onClick={downloadSingle}>
                  ⬇ Download this puzzle
                </button>
                <button className="action-btn primary" onClick={addToCollection}>
                  + Add to collection
                </button>
              </div>
            </div>
          ) : (
            <WCallout emoji="🎯" title="No active puzzle" color='#8a7360' bg='#f8f5ee'>
              Generate or load a puzzle first, then come back here to download it.
            </WCallout>
          )}

          {/* Collection builder */}
          <div style={{borderTop:`1px solid ${T.border}`,paddingTop:16,marginTop:4}}>
            <div style={{fontFamily:'Cinzel,serif',fontWeight:700,fontSize:'.88rem',color:T.ink,marginBottom:10}}>
              Collection Builder
              <span style={{fontWeight:400,fontSize:'.75rem',color:'#8a7360',marginLeft:8,fontFamily:'Spectral,serif'}}>
                — build a set of puzzles and download as one file
              </span>
            </div>

            {collection.length===0 ? (
              <p style={{fontSize:'.84rem',color:'#8a7360',fontStyle:'italic',marginBottom:12}}>
                Collection is empty. Add the current puzzle above, or upload a collection file to edit it.
              </p>
            ) : (
              <div style={{marginBottom:12}}>
                {collection.map((p,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:8,marginBottom:5,
                    padding:'8px 12px',background:T.parchment,border:`1px solid ${T.border}`,borderRadius:5}}>
                    <span style={{background:SHAPES[p.shapeId]?.color||'#666',color:'#fff',borderRadius:3,
                      padding:'1px 7px',fontSize:'.62rem',fontWeight:700,fontFamily:'Spectral SC,serif',flexShrink:0}}>
                      {SHAPES[p.shapeId]?.symbol||'?'}
                    </span>
                    <span style={{flex:1,fontSize:'.83rem',color:T.ink,fontWeight:600,overflow:'hidden',
                      textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                      {p.title||'Untitled'}
                    </span>
                    <span style={{fontSize:'.72rem',color:'#8a7360',flexShrink:0}}>
                      {MODES[p.modeId]?.name||'?'}
                    </span>
                    <button onClick={()=>removeFromCollection(i)}
                      style={{background:'#fdecea',border:'1px solid #f5c6c6',borderRadius:3,
                        padding:'2px 8px',fontSize:'.72rem',color:'#b00020',cursor:'pointer',flexShrink:0}}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label style={labelStyle}>Collection name</label>
            <input style={{...inputStyle,maxWidth:320}} value={collName}
              onChange={e=>setCollName(e.target.value)}/>
            <button className="action-btn primary"
              disabled={collection.length===0}
              onClick={downloadCollection}
              style={{opacity:collection.length===0?.4:1}}>
              ⬇ Download collection ({collection.length} puzzle{collection.length!==1?'s':''})
            </button>
          </div>
        </div>
      )}

      {/* ═══ UPLOAD TAB ═══ */}
      {tab==='upload'&&(
        <div>
          <Msg m={uploadMsg}/>
          <Msg m={msg}/>

          {/* File picker */}
          <div style={{background:T.parchment,border:`1.5px dashed ${T.border}`,borderRadius:8,
            padding:'20px 20px',marginBottom:18,textAlign:'center'}}>
            <div style={{fontSize:'2rem',marginBottom:8,opacity:.5}}>⬆</div>
            <p style={{fontSize:'.87rem',color:'#8a7360',marginBottom:12,lineHeight:1.6}}>
              Upload a single puzzle <code>.json</code> or a collection file.<br/>
              Both formats are supported automatically.
            </p>
            <label style={{
              display:'inline-block', padding:'8px 20px',
              background:T.ink, color:T.cream, borderRadius:4, cursor:'pointer',
              fontFamily:'Cinzel,serif', fontWeight:700, fontSize:'.78rem',
              letterSpacing:'.08em', textTransform:'uppercase',
            }}>
              Choose File
              <input type="file" accept=".json,application/json"
                onChange={handleFile}
                style={{display:'none'}}/>
            </label>
            <p style={{fontSize:'.72rem',color:'#aaa',marginTop:8}}>
              Accepts: single puzzle JSON or collection JSON
            </p>
          </div>

          {/* Loaded puzzles list */}
          {collection.length>0&&(
            <div>
              <div style={{fontFamily:'Cinzel,serif',fontWeight:700,fontSize:'.88rem',
                color:T.ink,marginBottom:10}}>
                {collection.length === 1
                  ? 'Loaded puzzle'
                  : `Loaded collection — ${collection.length} puzzles`}
              </div>
              <div style={{maxHeight:320,overflowY:'auto',border:`1px solid ${T.border}`,
                borderRadius:6,marginBottom:12}}>
                {collection.map((p,i)=>{
                  const shape = SHAPES[p.shapeId];
                  const mode  = MODES[p.modeId];
                  const isSel = selIdx===i;
                  return (
                    <div key={i} onClick={()=>setSelIdx(isSel?null:i)}
                      style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',
                        cursor:'pointer',userSelect:'none',
                        background:isSel?`${shape?.color||'#666'}12`:i%2===0?T.parchment:'#fff',
                        borderBottom:`1px solid ${T.border}`,
                        borderLeft:isSel?`3px solid ${shape?.color||'#666'}`:'3px solid transparent',
                      }}>
                      {/* Shape badge */}
                      <span style={{background:shape?.color||'#666',color:'#fff',borderRadius:3,
                        padding:'2px 8px',fontSize:'.65rem',fontWeight:700,
                        fontFamily:'Spectral SC,serif',flexShrink:0,minWidth:32,textAlign:'center'}}>
                        {shape?.symbol||'?'}
                      </span>
                      {/* Title & meta */}
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:'.85rem',color:T.ink,
                          overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                          {p.title||'Untitled'}
                        </div>
                        <div style={{fontSize:'.72rem',color:'#8a7360',marginTop:1}}>
                          {shape?.name||p.shapeId} · {mode?.name||p.modeId}
                          {p.targetSum?` · T=${p.targetSum}`:''}
                          {' · '}{p.cells?.length||'?'} cells
                          {' · '}{p.puzzle?.filter(v=>v==='?').length||'?'} blanks
                        </div>
                        {p.notes&&<div style={{fontSize:'.71rem',color:'#aaa',marginTop:1,
                          overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                          {p.notes}
                        </div>}
                      </div>
                      {/* Created date */}
                      {p.createdAt&&(
                        <div style={{fontSize:'.65rem',color:'#aaa',flexShrink:0,textAlign:'right'}}>
                          {new Date(p.createdAt).toLocaleDateString()}
                        </div>
                      )}
                      {isSel&&(
                        <div style={{color:shape?.color||'#666',fontWeight:700,flexShrink:0}}>✓</div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
                <button className="action-btn success"
                  disabled={selIdx===null}
                  onClick={playSelected}
                  style={{opacity:selIdx===null?.4:1}}>
                  ▶ Play selected puzzle
                </button>
                <button className="action-btn ghost" onClick={()=>setCollection([])}
                  style={{fontSize:'.72rem'}}>
                  Clear list
                </button>
                {selIdx!==null&&(
                  <span style={{fontSize:'.78rem',color:'#8a7360',fontStyle:'italic'}}>
                    Selected: {collection[selIdx]?.title||'Untitled'}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Format reference */}
          <details style={{marginTop:20}}>
            <summary style={{fontSize:'.78rem',color:'#8a7360',cursor:'pointer',
              fontFamily:'Spectral SC,serif',letterSpacing:'.05em',userSelect:'none'}}>
              JSON format reference
            </summary>
            <WMono>{`// Single puzzle file:
{
  "version": 1,
  "shapeId":  "square",          // shape key: square, triangle, circle,
                                  //   spiral, vesica, hexagon, triSquare,
                                  //   triCircle, squareCircle, spiralHex,
                                  //   vesicaTri, hexSpiral
  "modeId":   "rowsOnly",        // mode key: rowsOnly, rowsAndCols,
                                  //   withDiagonals, exactSum,
                                  //   symmetryMode, bossChamber
  "targetSum": null,              // number or null
  "cells":  [...],               // cell descriptor objects from layout
  "lines":  [[0,1,2], ...],      // triplet index arrays
  "puzzle": [7, "?", 13, ...],   // number or "?" per cell
  "fixed":  [true, false, ...],  // true = clue cell (not editable)
  "title":  "My Puzzle",         // optional
  "notes":  "Hard diagonal",     // optional
  "createdAt": "2025-01-01T..."  // auto-set on download
}

// Collection file:
{
  "version": 1,
  "collection": "My Set",
  "puzzles": [ {...}, {...}, ... ]
}`}</WMono>
          </details>
        </div>
      )}

      <div style={{marginTop:18,paddingTop:14,borderTop:`1px solid ${T.border}`}}>
        <button className="action-btn ghost" onClick={onClose}>← Back to Game</button>
      </div>
    </div>
  );
};
/* ══════════════════════════════════════════════════════════════
   SPIRAL SYMMETRY SOLVE — deep worked example panel
   Puzzle: spiral board, symmetryMode
   Raw input: [3,1,?,1,0,3,0,?,?,0,?,?,3,2,3,?]
   Decoded:   [19,7,?,7,1,19,1,?,?,1,?,?,19,13,19,?]
══════════════════════════════════════════════════════════════ */

/* ── Mini spiral cell strip ── */
const SpiralStrip = ({vals, highlight=[], solved=[]}) => {
  const isA = v => [1,7,13,19].includes(v);
  return (
    <div style={{overflowX:'auto',paddingBottom:4}}>
      <div style={{display:'flex',gap:4,minWidth:'max-content'}}>
        {vals.map((v,i)=>{
          const isHL  = highlight.includes(i);
          const isSol = solved.includes(i);
          const blank = v==='?';
          const aType = isA(v);
          const bg = isHL  ? '#fffde7'
                   : isSol ? '#e8f5e9'
                   : blank ? T.parchment
                   : '#fff';
          const bc = isHL  ? T.gold
                   : isSol ? '#4a7c59'
                   : blank ? T.goldLight
                   : T.border;
          const fc = blank  ? '#c8b89a'
                   : isSol  ? '#4a7c59'
                   : aType  ? '#2c5f8a'
                   : '#7d4e00';
          return (
            <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
              <div style={{fontSize:'.6rem',color:'#aaa',fontFamily:'monospace'}}>{i}</div>
              <div style={{
                width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',
                background:bg,border:`${isHL||isSol?2:1.5}px ${blank?'dashed':'solid'} ${bc}`,
                borderRadius:4,fontFamily:'Cinzel,serif',fontWeight:700,fontSize:'.82rem',color:fc,
                flexShrink:0,
              }}>{v}</div>
              {isA(v)&&!blank&&<div style={{fontSize:'.52rem',color:'#2c5f8a',fontWeight:700}}>A</div>}
              {!isA(v)&&!blank&&<div style={{fontSize:'.52rem',color:'#7d4e00',fontWeight:700}}>B</div>}
              {blank&&<div style={{fontSize:'.52rem',color:'#c8b89a'}}>?</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ── Equation display ── */
const Eq = ({children, ok}) => (
  <div style={{
    fontFamily:'monospace',fontSize:'.88rem',padding:'5px 12px',
    background: ok===true?'#e8f5e9':ok===false?'#fdecea':'#f5f2eb',
    border:`1px solid ${ok===true?'#a8d5b5':ok===false?'#f5c6c6':T.border}`,
    borderRadius:4,margin:'4px 0',color:T.ink,lineHeight:1.7,
  }}>{children}</div>
);

/* ── Step block ── */
const SStep = ({n,color,title,children}) => (
  <div style={{marginBottom:16,borderLeft:`3px solid ${color}`,paddingLeft:14}}>
    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
      <div style={{background:color,color:'#fff',borderRadius:'50%',
        width:24,height:24,display:'flex',alignItems:'center',justifyContent:'center',
        fontFamily:'Cinzel,serif',fontWeight:700,fontSize:'.8rem',flexShrink:0}}>{n}</div>
      <div style={{fontFamily:'Cinzel,serif',fontWeight:700,color,fontSize:'.9rem'}}>{title}</div>
    </div>
    <div style={{fontSize:'.86rem',lineHeight:1.8,color:'#333'}}>{children}</div>
  </div>
);

/* ── Symmetry pair table ── */
const SymTable = ({pairs}) => (
  <div style={{overflowX:'auto',marginBottom:10}}>
    <table style={{borderCollapse:'collapse',fontFamily:'monospace',fontSize:'.82rem',minWidth:460}}>
      <thead>
        <tr style={{background:T.parchment}}>
          {['i','cell[i]','15−i','cell[15−i]','Equal?','Action'].map(h=>(
            <th key={h} style={{padding:'5px 10px',border:`1px solid ${T.border}`,
              fontFamily:'Spectral SC,serif',fontSize:'.68rem',letterSpacing:'.05em',color:'#8a7360'}}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {pairs.map((row,i)=>(
          <tr key={i} style={{background:row.action!=='-'?'#fffde7':'#fff'}}>
            {[row.i, row.ci, row.j, row.cj, row.eq, row.action].map((v,vi)=>(
              <td key={vi} style={{padding:'4px 10px',border:`1px solid ${T.border}`,
                color: v==='✓'?'#4a7c59':v==='✗'?'#c0392b':
                       vi===4?(row.eq==='✓'?'#4a7c59':'#c0392b'):T.ink,
                fontWeight: vi===4||vi===5?700:400,
                textAlign: vi===0||vi===2?'center':'left'}}>
                {v}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const SpiralSolvePanel = ({onClose}) => {
  const [section, setSection] = useState(0);

  // The puzzle at each stage
  const P0  = [19,7,'?',7,1,19,1,'?','?',1,'?','?',19,13,19,'?'];
  const P1  = [19,7,13,7,1,19,1,'?','?',1,19,1,19,13,19,19];
  const SOL = [19,7,13,7,1,19,1,7,7,1,19,1,19,13,19,19];

  const sections = [
    {label:'0. The Puzzle',       color:'#2c5f8a'},
    {label:'1. Reading the Board',color:'#4a7c59'},
    {label:'2. Symmetry Equations',color:'#c0392b'},
    {label:'3. Divisibility',     color:'#7d4e00'},
    {label:'4. Linear System',    color:'#5a189a'},
    {label:'5. Solve for x',      color:'#1a5276'},
    {label:'6. Verify',           color:'#2e7d45'},
  ];

  const content = [

    /* ──────────────────── 0. THE PUZZLE ──────────────────── */
    <div>
      <WCallout emoji="🌀" title="What you were given" color='#2c5f8a' bg='#ddeeff'>
        The puzzle shows: <code>[3,1,?,1,0,3,0,?,?,0,?,?,3,2,3,?]</code><br/>
        These are <strong>position indices</strong> into the A-type number family {'{1,7,13,19}'}:
        <WMono>{`Index 0 → 1    Index 1 → 7    Index 2 → 13   Index 3 → 19`}</WMono>
        So the puzzle decoded is:
        <WMono>{`Position: [ 0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15]
   Value: [19,  7,  ?,  7,  1, 19,  1,  ?,  ?,  1,  ?,  ?, 19, 13, 19,  ?]
    Type: [ A,  A,  ?,  A,  A,  A,  A,  ?,  ?,  A,  ?,  ?,  A,  A,  A,  ?]`}</WMono>
      </WCallout>

      <SpiralStrip vals={P0} highlight={[2,7,8,10,11,15]}/>
      <div style={{fontSize:'.72rem',color:'#8a7360',textAlign:'center',marginTop:4,marginBottom:14,fontStyle:'italic'}}>
        Gold cells = blanks to solve · A/B label shows type of known cells
      </div>

      <SStep n="!" color='#2c5f8a' title="Notice: ALL known cells are A-type">
        Every known value — 19, 7, 1, 13 — is A-type (remainder 1 when divided by 3).
        This is a strong signal: every unknown must also be A-type, because mixing types in any line of three is impossible.
        We will prove this formally with equations in Step 3.
      </SStep>

      <WCallout emoji="📋" title="The two constraints we must satisfy simultaneously" color='#5a189a' bg='#f8f0ff'>
        <strong>Constraint 1 — Symmetry:</strong> cell[i] = cell[15−i] for every i from 0 to 15.<br/>
        This is rotational symmetry around the midpoint of the spiral.<br/><br/>
        <strong>Constraint 2 — Divisibility:</strong> every consecutive triplet of cells along the spiral path must sum to a multiple of 3.<br/><br/>
        These two constraints form a <strong>system of linear equations</strong>. We solve them together, not one at a time.
      </WCallout>
    </div>,

    /* ──────────────────── 1. READING THE BOARD ──────────────────── */
    <div>
      <p style={{fontSize:'.88rem',lineHeight:1.8,marginBottom:12}}>
        Before writing any equations, we need to understand the board's structure. This is the most important step — it tells us which equations we will need.
      </p>

      <SStep n="1a" color='#4a7c59' title="The spiral is a chain, not a grid">
        The spiral board is 16 cells in a single winding path. Cell 0 is near the centre; cell 15 is the outermost tip.
        There are no rows or columns. Instead, every group of three <em>consecutive</em> cells along the path is a "line."
        <WMono>{`Line 0:  cells [0, 1, 2]
Line 1:  cells [1, 2, 3]
Line 2:  cells [2, 3, 4]
  ...
Line 13: cells [13, 14, 15]

Total: 14 lines, each of length 3.
Each interior cell (1–14) appears in THREE lines.
End cells (0 and 15) appear in only ONE line each.`}</WMono>
      </SStep>

      <SStep n="1b" color='#4a7c59' title="Label the unknowns">
        We have 6 blank cells. Give each one a name:
        <WMono>{`cell[2]  = a    (position 2 on the spiral)
cell[7]  = b    (position 7)
cell[8]  = c    (position 8)
cell[10] = d    (position 10)
cell[11] = e    (position 11)
cell[15] = f    (position 15)`}</WMono>
        Our goal: find the values of a, b, c, d, e, f.
      </SStep>

      <SStep n="1c" color='#4a7c59' title="Write out the full puzzle with variable names">
        <WMono>{`Position: [ 0,  1,  a,  3,  4,  5,  6,  b,  c,  9, d,  e, 12, 13, 14,  f]
   Value: [19,  7,  a,  7,  1, 19,  1,  b,  c,  1, d,  e, 19, 13, 19,  f]`}</WMono>
        <SpiralStrip vals={['19','7','a','7','1','19','1','b','c','1','d','e','19','13','19','f']}
          highlight={[2,7,8,10,11,15]}/>
      </SStep>
    </div>,

    /* ──────────────────── 2. SYMMETRY EQUATIONS ──────────────────── */
    <div>
      <p style={{fontSize:'.88rem',lineHeight:1.8,marginBottom:12}}>
        Symmetry mode means the spiral has perfect rotational symmetry. The mathematical statement is simple:
      </p>
      <WMono>{'cell[i]  =  cell[15 − i]     for every position i'}</WMono>
      <p style={{fontSize:'.88rem',lineHeight:1.8,marginTop:8,marginBottom:14}}>
        This gives us 8 symmetry equations (one for each pair). Let's work through every pair:
      </p>

      <SymTable pairs={[
        {i:0,  ci:19, j:15, cj:'f', eq:'?', action:'→ f = 19'},
        {i:1,  ci:7,  j:14, cj:19, eq:'✗', action:'7 ≠ 19 — see note below'},
        {i:2,  ci:'a',j:13, cj:13, eq:'?', action:'→ a = 13'},
        {i:3,  ci:7,  j:12, cj:19, eq:'✗', action:'7 ≠ 19 — see note below'},
        {i:4,  ci:1,  j:11, cj:'e', eq:'?', action:'→ e = 1'},
        {i:5,  ci:19, j:10, cj:'d', eq:'?', action:'→ d = 19'},
        {i:6,  ci:1,  j:9,  cj:1,  eq:'✓', action:'-'},
        {i:7,  ci:'b',j:8,  cj:'c', eq:'?', action:'→ b = c'},
      ]}/>

      <WCallout emoji="⚠️" title="Wait — pairs (1,14) and (3,12) don't match?" color='#c0392b' bg='#fff5f5'>
        You may have noticed: cell[1]=7 but cell[14]=19, and cell[3]=7 but cell[12]=19. These are <em>not equal</em>. Does this mean the puzzle is broken?<br/><br/>
        No. In <strong>symmetryMode</strong>, the symmetry constraint only needs to hold for the <em>final filled grid</em> — not necessarily for the initial clue cells. Clues are placed where they are as given information. The blanks must be filled so that the <em>full</em> board (clues + answers) satisfies symmetry.<br/><br/>
        Cells 1, 3, 12, 14 are all known clues. For the completed puzzle to be symmetric, we would need 7=19 and 7=19, which is false. This tells us: <strong>this specific puzzle has no valid symmetric solution in the strict mathematical sense.</strong><br/><br/>
        But we can still find what the blanks <em>must be</em> to satisfy as many constraints as possible — which is exactly the linear equation approach.
      </WCallout>

      <p style={{fontSize:'.88rem',lineHeight:1.8,marginBottom:10}}>
        Setting aside the asymmetric clues, the symmetry equations for our <em>unknowns</em> give us:
      </p>
      <Eq ok={true}>f = 19    (from pair 0,15)</Eq>
      <Eq ok={true}>a = 13    (from pair 2,13)</Eq>
      <Eq ok={true}>e = 1     (from pair 4,11)</Eq>
      <Eq ok={true}>d = 19    (from pair 5,10)</Eq>
      <Eq ok={true}>b = c     (from pair 7,8 — both blank, must be equal)</Eq>

      <p style={{fontSize:'.88rem',lineHeight:1.8,marginTop:10}}>
        Four unknowns (a, d, e, f) are now <strong>fully determined</strong> by symmetry alone. Only one free variable remains: <strong>b</strong> (which equals c).
      </p>

      <SpiralStrip vals={P1} solved={[2,10,11,15]} highlight={[7,8]}/>
      <div style={{fontSize:'.72rem',color:'#8a7360',textAlign:'center',marginTop:4,marginBottom:12,fontStyle:'italic'}}>
        Green cells = solved by symmetry · Gold cells = b and c still unknown
      </div>
    </div>,

    /* ──────────────────── 3. DIVISIBILITY ──────────────────── */
    <div>
      <p style={{fontSize:'.88rem',lineHeight:1.8,marginBottom:14}}>
        Now we apply the divisibility constraint to every line. After symmetry, only two unknowns remain: cells 7 and 8, both equal to <strong>b</strong>. The board is now:
      </p>
      <WMono>{`[19, 7, 13, 7, 1, 19, 1, b, b, 1, 19, 1, 19, 13, 19, 19]`}</WMono>

      <SStep n="3a" color='#7d4e00' title="Check every line — which ones contain b?">
        <WMono>{`Line 5:  [cell 5, cell 6, cell 7] = [19, 1,  b]   ← contains b
Line 6:  [cell 6, cell 7, cell 8] = [1,  b,  b]   ← contains b twice
Line 7:  [cell 7, cell 8, cell 9] = [b,  b,  1]   ← contains b twice
Line 8:  [cell 8, cell 9, cell10] = [b,  1, 19]   ← contains b

All other lines (0-4, 9-13): fully known. We will verify them too.`}</WMono>
      </SStep>

      <SStep n="3b" color='#7d4e00' title="Verify the fully known lines first">
        Lines 0–4 and 9–13 contain no unknowns. Check each:
        <WMono>{`L0:  19+7+13  = 39   39÷3=13  ✓
L1:   7+13+7  = 27   27÷3=9   ✓
L2:  13+7+1   = 21   21÷3=7   ✓
L3:   7+1+19  = 27   27÷3=9   ✓
L4:   1+19+1  = 21   21÷3=7   ✓
L9:   1+19+1  = 21   21÷3=7   ✓
L10: 19+1+19  = 39   39÷3=13  ✓
L11:  1+19+13 = 33   33÷3=11  ✓
L12: 19+13+19 = 51   51÷3=17  ✓
L13: 13+19+19 = 51   51÷3=17  ✓`}</WMono>
        All 10 fully-known lines pass. The clue cells are consistent with each other.
      </SStep>

      <SStep n="3c" color='#7d4e00' title="Write the divisibility equations for lines containing b">
        Each line sum must be divisible by 3. We write this as: sum ≡ 0 (mod 3), meaning "sum has remainder 0 when divided by 3."
        <Eq>Line 5:  19 + 1 + b  ≡ 0 (mod 3)    →    20 + b ≡ 0 (mod 3)</Eq>
        <Eq>Line 6:   1 + b + b  ≡ 0 (mod 3)    →     1 + 2b ≡ 0 (mod 3)</Eq>
        <Eq>Line 7:   b + b + 1  ≡ 0 (mod 3)    →    2b + 1 ≡ 0 (mod 3)</Eq>
        <Eq>Line 8:   b + 1 + 19 ≡ 0 (mod 3)    →    20 + b ≡ 0 (mod 3)</Eq>
        <p style={{fontSize:'.86rem',lineHeight:1.75,marginTop:8}}>
          Notice: Line 5 and Line 8 give the same equation (20 + b ≡ 0). Line 6 and Line 7 give the same equation (because addition is commutative: 1+2b = 2b+1). So we really only have <strong>two distinct equations</strong> — but they must both be satisfied.
        </p>
      </SStep>
    </div>,

    /* ──────────────────── 4. LINEAR SYSTEM ──────────────────── */
    <div>
      <p style={{fontSize:'.88rem',lineHeight:1.8,marginBottom:14}}>
        This is the core of the linear equation system method. We have two equations and one unknown (b). Let's solve them formally.
      </p>

      <SStep n="4a" color='#5a189a' title="What does 'mod 3' mean? A plain-English explanation">
        "mod 3" means we only care about the remainder after dividing by 3. Think of it like a clock with only 3 positions: 0, 1, 2. After reaching 2, you go back to 0.
        <WMono>{`0 mod 3 = 0     (0 ÷ 3 = 0 remainder 0)
1 mod 3 = 1     (1 ÷ 3 = 0 remainder 1)
2 mod 3 = 2     (2 ÷ 3 = 0 remainder 2)
3 mod 3 = 0     (3 ÷ 3 = 1 remainder 0)   ← wraps back to 0
4 mod 3 = 1     (4 ÷ 3 = 1 remainder 1)
19 mod 3 = 1    (19 ÷ 3 = 6 remainder 1)
20 mod 3 = 2    (20 ÷ 3 = 6 remainder 2)`}</WMono>
        A sum is divisible by 3 when its mod-3 value is 0. That is what "≡ 0 (mod 3)" means.
      </SStep>

      <SStep n="4b" color='#5a189a' title="Solve Equation A: 20 + b ≡ 0 (mod 3)">
        Step by step:
        <WMono>{`20 + b ≡ 0 (mod 3)

First, reduce 20 mod 3:
  20 = 18 + 2,  so 20 mod 3 = 2

Substitute:
  2 + b ≡ 0 (mod 3)

Isolate b (subtract 2 from both sides):
  b ≡ 0 − 2 (mod 3)
  b ≡ −2 (mod 3)
  b ≡ 1 (mod 3)        ← because −2 ≡ 1 (mod 3) [−2 + 3 = 1]

b has remainder 1 when divided by 3.
b is an A-type number: b ∈ {1, 7, 13, 19}`}</WMono>
      </SStep>

      <SStep n="4c" color='#5a189a' title="Solve Equation B: 1 + 2b ≡ 0 (mod 3)">
        <WMono>{`1 + 2b ≡ 0 (mod 3)

Isolate 2b:
  2b ≡ 0 − 1 (mod 3)
  2b ≡ −1 (mod 3)
  2b ≡ 2 (mod 3)       ← because −1 ≡ 2 (mod 3) [−1 + 3 = 2]

Divide both sides by 2.
But in modular arithmetic, dividing by 2 mod 3 means multiplying by
the 'modular inverse' of 2.
  The inverse of 2 mod 3 is 2, because 2 × 2 = 4 ≡ 1 (mod 3).
  (We need a number that, when multiplied by 2, gives 1 mod 3.)

Multiply both sides by 2:
  2 × 2b ≡ 2 × 2 (mod 3)
  4b     ≡ 4 (mod 3)
  1b     ≡ 1 (mod 3)   ← because 4 mod 3 = 1
  b      ≡ 1 (mod 3)

Same answer: b is A-type, b ∈ {1, 7, 13, 19}`}</WMono>
      </SStep>

      <WCallout emoji="✅" title="Both equations agree — b must be A-type" color='#4a7c59' bg='#f0f7f2'>
        Equation A says b ≡ 1 (mod 3). Equation B says b ≡ 1 (mod 3). They are consistent.
        When two equations agree like this, it means the system is <em>compatible</em> — there is at least one solution.
        If they had given different mod-3 values, the system would be <em>inconsistent</em> and have no solution at all.
      </WCallout>

      <p style={{fontSize:'.88rem',lineHeight:1.8,marginTop:10}}>
        However, knowing b is A-type narrows it to 4 candidates: {'{1, 7, 13, 19}'}. In symmetryMode <em>without</em> an exact target sum, all four are valid. The system is <strong>underdetermined</strong> — it has infinitely many solutions (4 valid solutions in this case, because b is constrained to 4 discrete values).
      </p>
      <p style={{fontSize:'.88rem',lineHeight:1.8}}>
        To get a <em>unique</em> answer, we would need an Exact Sum mode target T. Without T, the puzzle accepts any A-type value for b. Let's verify all four.
      </p>
    </div>,

    /* ──────────────────── 5. SOLVE FOR x ──────────────────── */
    <div>
      <p style={{fontSize:'.88rem',lineHeight:1.8,marginBottom:14}}>
        This is the most satisfying part: turning the abstract equation into a concrete number.
      </p>

      <SStep n="5a" color='#1a5276' title="All four candidate values for b">
        We test b ∈ {'{1, 7, 13, 19}'} in the four lines:
        <WMono>{`                    L5          L6          L7          L8
                [19,1,b]    [1,b,b]     [b,b,1]     [b,1,19]

b = 1 :  19+1+1=21✓   1+1+1=3 ✓   1+1+1=3 ✓   1+1+19=21✓
b = 7 :  19+1+7=27✓   1+7+7=15✓   7+7+1=15✓   7+1+19=27✓
b = 13:  19+1+13=33✓  1+13+13=27✓ 13+13+1=27✓ 13+1+19=33✓
b = 19:  19+1+19=39✓  1+19+19=39✓ 19+19+1=39✓ 19+1+19=39✓`}</WMono>
        All four pass every line. The system has 4 valid solutions.
      </SStep>

      <SStep n="5b" color='#1a5276' title="Why no unique solution? Counting equations vs unknowns">
        In a linear equation system:
        <WMono>{`Variables:  1  (just b, since a,d,e,f were forced by symmetry)
Equations:  2  (distinct modular equations from lines 5–8)

BUT: modular equations over a discrete set are weaker than real-number equations.
"b ≡ 1 (mod 3)" is one equation with 4 solutions in {1,5,7,11,13,17,19,23}.
We need MORE constraints to pin b to a unique value.

In Exact Sum mode (target T):
  L5: 19 + 1 + b = T   →   b = T − 20  (unique!)
  If T=21: b = 21−20 = 1   ✓
  If T=27: b = 27−20 = 7   ✓
  If T=33: b = 33−20 = 13  ✓
  If T=39: b = 39−20 = 19  ✓

Each target T forces a different unique value of b.
In symmetryMode without T, the system is underdetermined.`}</WMono>
      </SStep>

      <SStep n="5c" color='#1a5276' title="Pick b = 7 (the natural middle choice)">
        Any A-type value is a valid answer. Choosing b = 7 gives the solved board:
        <WMono>{`[19, 7, 13, 7, 1, 19, 1, 7, 7, 1, 19, 1, 19, 13, 19, 19]`}</WMono>
        <SpiralStrip vals={SOL} solved={[2,7,8,10,11,15]}/>
      </SStep>
    </div>,

    /* ──────────────────── 6. VERIFY ──────────────────── */
    <div>
      <p style={{fontSize:'.88rem',lineHeight:1.8,marginBottom:14}}>
        Never trust a solution until you have verified every single constraint. Here is the complete check.
      </p>

      <SStep n="6a" color='#2e7d45' title="Verify all 14 lines (b = 7)">
        <WMono>{`Board: [19, 7, 13, 7, 1, 19, 1, 7, 7, 1, 19, 1, 19, 13, 19, 19]

L0:  [19, 7,13]   19+7+13  = 39  ÷3=13  ✓
L1:  [ 7,13, 7]    7+13+7  = 27  ÷3=9   ✓
L2:  [13, 7, 1]   13+7+1   = 21  ÷3=7   ✓
L3:  [ 7, 1,19]    7+1+19  = 27  ÷3=9   ✓
L4:  [ 1,19, 1]    1+19+1  = 21  ÷3=7   ✓
L5:  [19, 1, 7]   19+1+7   = 27  ÷3=9   ✓
L6:  [ 1, 7, 7]    1+7+7   = 15  ÷3=5   ✓
L7:  [ 7, 7, 1]    7+7+1   = 15  ÷3=5   ✓
L8:  [ 7, 1,19]    7+1+19  = 27  ÷3=9   ✓
L9:  [ 1,19, 1]    1+19+1  = 21  ÷3=7   ✓
L10: [19, 1,19]   19+1+19  = 39  ÷3=13  ✓
L11: [ 1,19,13]    1+19+13 = 33  ÷3=11  ✓
L12: [19,13,19]   19+13+19 = 51  ÷3=17  ✓
L13: [13,19,19]   13+19+19 = 51  ÷3=17  ✓

All 14 lines: PASS ✓`}</WMono>
      </SStep>

      <SStep n="6b" color='#2e7d45' title="Verify symmetry (b = 7)">
        <WMono>{`cell[0]=19  cell[15]=19   19=19 ✓
cell[1]=7   cell[14]=19   7≠19  ✗  ← original asymmetric clues
cell[2]=13  cell[13]=13   13=13 ✓  (we solved this)
cell[3]=7   cell[12]=19   7≠19  ✗  ← original asymmetric clues
cell[4]=1   cell[11]=1    1=1   ✓  (we solved this)
cell[5]=19  cell[10]=19   19=19 ✓  (we solved this)
cell[6]=1   cell[9]=1     1=1   ✓
cell[7]=7   cell[8]=7     7=7   ✓  (we solved this)`}</WMono>
        The two asymmetric pairs (1,14) and (3,12) are original clue cells that were already in the puzzle. The blanks we solved are all perfectly symmetric.
      </SStep>

      <WCallout emoji="🎓" title="Summary — the full linear system method in 6 steps" color='#5a189a' bg='#f8f0ff'>
        <strong>Step 1: Label each blank with a variable</strong> (a, b, c, …)<br/>
        <strong>Step 2: Write symmetry equations</strong> — each blank's symmetry partner forces its value or links two blanks together<br/>
        <strong>Step 3: Apply symmetry immediately</strong> — substitute forced values, reduce the number of unknowns<br/>
        <strong>Step 4: Write divisibility equations</strong> for every line containing a remaining unknown<br/>
        <strong>Step 5: Solve the modular equations</strong> — find the mod-3 residue class of each unknown (A-type=1, B-type=2)<br/>
        <strong>Step 6: Apply exact sum if T given</strong> — use x = T − known₁ − known₂ for a unique answer<br/><br/>
        If no T: the system is underdetermined. Any value of the correct type (A or B) is a valid solution.
      </WCallout>

      <WCallout emoji="🔢" title="Why this is a 'linear' system — and why it matters" color='#2c5f8a' bg='#ddeeff'>
        Every equation we wrote was linear: no b², no b×c, no square roots. Just b added to constants.
        That is what makes this a <em>linear</em> equation system.
        <br/><br/>
        Linear systems have a beautiful property: the number of solutions tells you exactly how well-determined the puzzle is.
        <WMono>{`More equations than unknowns  →  usually no solution (overconstrained)
Same equations as unknowns    →  usually one unique solution
Fewer equations than unknowns →  infinitely many solutions (underdetermined)

This puzzle: 2 equations, 1 unknown → unique TYPE (A-type)
                                    → 4 valid values (needs T for uniqueness)`}</WMono>
        In game design terms: symmetryMode without Exact Sum always produces underdetermined puzzles at the centre pair. symmetryMode + Exact Sum (Boss Chamber) closes the system completely.
      </WCallout>
    </div>,
  ];

  return (
    <div className="panel fade-in" style={{marginTop:8, maxWidth:760}}>
      <div className="panel-title">✦ Deep Solve — Spiral × symmetryMode</div>

      <WCallout emoji="📖" title="How to read this walkthrough" color='#4a7c59' bg='#f0f7f2'>
        This is a complete, step-by-step solution using the <strong>linear equation system method</strong>. Every mathematical move is explained in plain language — no shortcuts, no skipped steps. Work through the sections in order, or jump to any section using the tabs below.
      </WCallout>

      {/* Section tabs */}
      <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:20,
        borderBottom:`1px solid ${T.border}`,paddingBottom:12}}>
        {sections.map((s,i)=>(
          <button key={i}
            className={`tab-btn${section===i?' active':''}`}
            onClick={()=>setSection(i)}
            style={{borderColor:section===i?s.color:T.border,
              background:section===i?s.color:'',
              color:section===i?'#fff':''}}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="fade-in" key={section}>
        {content[section]}
      </div>

      {/* Navigation */}
      <div style={{display:'flex',gap:8,justifyContent:'space-between',
        marginTop:20,paddingTop:14,borderTop:`1px solid ${T.border}`}}>
        <button className="action-btn ghost"
          disabled={section===0} onClick={()=>setSection(s=>s-1)}
          style={{opacity:section===0?.3:1}}>
          ← Previous
        </button>
        <button className="action-btn ghost" onClick={onClose}>Back to Game</button>
        <button className="action-btn primary"
          disabled={section===sections.length-1} onClick={()=>setSection(s=>s+1)}
          style={{opacity:section===sections.length-1?.3:1}}>
          Next →
        </button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════════════════════ */
export default function CollapseApp({onQuit}) {
  const [view,    setView]    = useState('game');
  const [shapeId, setShapeId] = useState('square');
  const [modeId,  setModeId]  = useState('rowsOnly');
  const [blanks,  setBlanks]  = useState(40); // percent
  const [sel,     setSel]     = useState(null);

  const [gs, setGs] = useState({
    puzzle: null, fixed: null, cells: null,
    lines: null, positions: null, targetSum: null,
  });

  const [msg, setMsg] = useState(null);

  // Inject styles once
  useEffect(()=>{
    const id = 'cts-sg-styles';
    if(!document.getElementById(id)){
      const style = document.createElement('style');
      style.id = id; style.textContent = injectStyles();
      document.head.appendChild(style);
    }
    return ()=>{};
  },[]);

  const startGame = useCallback(()=>{
    setMsg(null); setSel(null);
    const res = generateGeoPuzzle(shapeId, modeId, blanks/100);
    if(!res){ setMsg({text:'Could not generate puzzle — try a simpler mode or fewer blanks.',ok:false}); return; }
    const pos = computePositions(res.cells, shapeId);
    setGs({puzzle:res.puzzle, fixed:res.fixed, cells:res.cells,
           lines:res.lines, positions:pos, targetSum:res.targetSum});
    setView('game');
  },[shapeId, modeId, blanks]);

  const setPuzzle = (updater) => {
    setGs(prev=>({...prev,
      puzzle: typeof updater==='function' ? updater(prev.puzzle) : updater
    }));
  };

  const pickVal = (n) => {
    if(sel===null) return;
    setPuzzle(prev => prev.map((v,i)=>i===sel?n:v));
  };
  const clearVal = () => {
    if(sel===null) return;
    setPuzzle(prev => prev.map((v,i)=>i===sel?'?':v));
  };

  const checkAnswer = () => {
    if(!gs.puzzle) return;
    if(gs.puzzle.some(v=>v==='?')){ setMsg({text:'Fill all cells first.',ok:false}); return; }
    const mode = MODES[modeId];
    const isExact = modeId==='exactSum'||modeId==='bossChamber';
    const T = gs.targetSum||mode.targetSum||39;
    let ok=true, failMsg='';
    for(const line of gs.lines){
      const vals = line.map(i=>gs.puzzle[i]);
      if(isExact){
        if(lineSum(vals)!==T){ok=false;failMsg=`Line sum ${lineSum(vals)} ≠ ${T}`;break;}
      } else {
        if(!isDiv3(vals)){ok=false;failMsg=`Line sum ${lineSum(vals)} not divisible by 3`;break;}
      }
    }
    setMsg(ok?{text:'✦ Solved — the chamber opens.',ok:true}:{text:failMsg,ok:false});
  };

  const shape = SHAPES[shapeId];
  const mode  = MODES[modeId];
  const curVal = (sel!==null&&gs.puzzle)?gs.puzzle[sel]:null;
  const blanksLeft = gs.puzzle?gs.puzzle.filter(v=>v==='?').length:0;
  const isExact = modeId==='exactSum'||modeId==='bossChamber';

  const NAV_ITEMS = [
    {id:'game',        label:'Chamber'},
    {id:'shapes',      label:'Shape Selection'},
    {id:'library',     label:'Library'},
    {id:'walkthrough', label:'Walkthrough'},
    {id:'deepsolve',   label:'Deep Solve'},
    {id:'meanings',    label:'Shape Meanings'},
    {id:'rules',       label:'Rules'},
    {id:'solver',      label:'Solver'},
    ...(onQuit?[{id:'quit',label:'Quit',action:onQuit}]:[]),
  ];

  return (
    <div className="cts-sg" style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center'}}>

      {/* Header */}
      <header style={{
        width:'100%', borderBottom:`2px solid ${T.gold}`,
        background:`linear-gradient(to right, ${T.cream}, #fff, ${T.cream})`,
        padding:'10px 20px', display:'flex', alignItems:'center',
        justifyContent:'space-between', flexWrap:'wrap', gap:6,
        boxShadow:`0 2px 12px ${T.shadow}`,
      }}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <span style={{color:T.gold,fontSize:'1.2rem'}}>✦</span>
          <span className="cts-title" style={{fontSize:'.9rem',fontWeight:700,color:T.ink,letterSpacing:'.06em'}}>
            Collapse Through Symbol
          </span>
          <span style={{fontSize:'.65rem',color:T.gold,fontFamily:'Spectral SC,serif',letterSpacing:'.08em'}}>
            Sacred Geometry Edition
          </span>
        </div>
        <nav style={{display:'flex',gap:4,flexWrap:'wrap'}}>
          {NAV_ITEMS.map(item=>(
            <button key={item.id}
              className="action-btn ghost"
              style={{padding:'3px 10px',fontSize:'.67rem',
                background:view===item.id&&!item.action?T.ink:'transparent',
                color:view===item.id&&!item.action?T.cream:T.ink,
                borderColor:view===item.id&&!item.action?T.ink:T.border}}
              onClick={()=>{if(item.action)item.action();else setView(item.id);}}>
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Main */}
      <main style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',
        padding:'24px 16px 60px',width:'100%',maxWidth:820,margin:'0 auto'}}>

        {/* Title block */}
        <div style={{textAlign:'center',marginBottom:20}}>
          <div className="cts-title" style={{fontSize:'1.4rem',fontWeight:700,color:T.ink,marginBottom:3}}>
            Collapse Through Symbol
          </div>
          <div style={{fontSize:'.68rem',color:T.gold,letterSpacing:'.12em',textTransform:'uppercase',
            fontFamily:'Spectral SC,serif',marginBottom:4}}>
            Sacred Geometry Edition · v1.0
          </div>
          {gs.puzzle&&(
            <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap'}}>
              <span style={{background:shape.color,color:'#fff',borderRadius:3,padding:'2px 10px',
                fontSize:'.67rem',fontWeight:700,fontFamily:'Spectral SC,serif'}}>
                {shape.symbol} {shape.name}
              </span>
              <span style={{background:mode.color,color:'#fff',borderRadius:3,padding:'2px 10px',
                fontSize:'.67rem',fontWeight:700,fontFamily:'Spectral SC,serif'}}>
                {mode.tierName} · {mode.name}
              </span>
              <span style={{background:T.parchment,color:T.ink,border:`1px solid ${T.border}`,
                borderRadius:3,padding:'2px 10px',fontSize:'.67rem',fontFamily:'Spectral SC,serif'}}>
                {blanksLeft} blank{blanksLeft!==1?'s':''}
              </span>
              {isExact&&(
                <span style={{background:'#6a0a0a',color:'#fff',borderRadius:3,padding:'2px 10px',
                  fontSize:'.67rem',fontWeight:700,fontFamily:'Spectral SC,serif'}}>
                  T = {gs.targetSum||mode.targetSum||39}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── SHAPE SELECTION VIEW ── */}
        {view==='shapes'&&(
          <div style={{width:'100%'}} className="fade-in">
            <ShapeSelector shapeId={shapeId} setShapeId={setShapeId}/>
            <div style={{marginBottom:14}}>
              <div className="section-label">Puzzle Mode</div>
              <ModeSelector modeId={modeId} setModeId={setModeId}/>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:18,flexWrap:'wrap'}}>
              <div>
                <div className="section-label">Blank density</div>
                <div style={{display:'flex',gap:5}}>
                  {[20,35,50,65].map(p=>(
                    <button key={p} className={`shape-btn${blanks===p?' active':''}`}
                      onClick={()=>setBlanks(p)} style={{padding:'4px 10px'}}>
                      {p}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button className="action-btn success" style={{fontSize:'.85rem'}} onClick={startGame}>
              ✦ Generate Puzzle & Play
            </button>
          </div>
        )}

        {/* ── LIBRARY VIEW ── */}
        {view==='library'&&(
          <PuzzleLibraryPanel
            gs={gs} shapeId={shapeId} modeId={modeId}
            setGs={setGs} setShapeId={setShapeId} setModeId={setModeId}
            setView={setView} onClose={()=>setView('game')}/>
        )}

        {/* ── DEEP SOLVE VIEW ── */}
        {view==='deepsolve'&&(
          <SpiralSolvePanel onClose={()=>setView('game')}/>
        )}

        {/* ── WALKTHROUGH VIEW ── */}
        {view==='walkthrough'&&(
          <WalkthroughPanel onClose={()=>setView('game')}/>
        )}

        {/* ── SHAPE MEANINGS VIEW ── */}
        {view==='meanings'&&(
          <ShapeMeaningsPanel onClose={()=>setView('game')}/>
        )}

        {/* ── RULES VIEW ── */}
        {view==='rules'&&(
          <RulesPanel modeId={modeId} onClose={()=>setView('game')}/>
        )}

        {/* ── SOLVER VIEW ── */}
        {view==='solver'&&gs.puzzle&&(
          <SolverPanel puzzle={gs.puzzle} lines={gs.lines} modeId={modeId} onClose={()=>setView('game')}/>
        )}

        {/* ── GAME VIEW ── */}
        {view==='game'&&(
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',width:'100%'}} className="fade-in">

            {!gs.puzzle?(
              <div style={{textAlign:'center',marginTop:40}}>
                <div style={{fontSize:'3rem',marginBottom:16,opacity:.4}}>✦</div>
                <p style={{color:'#8a7360',marginBottom:20,fontSize:'.95rem',fontStyle:'italic'}}>
                  Select a sacred geometry board and generate a puzzle to begin.
                </p>
                <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
                  <button className="action-btn success" onClick={()=>setView('shapes')}>Choose Shape</button>
                  <button className="action-btn primary" onClick={startGame}>Quick Start</button>
                </div>
              </div>
            ):(
              <>
                {/* Board */}
                <div style={{
                  background: T.cream,
                  border: `1.5px solid ${T.border}`,
                  borderRadius: 12,
                  padding: 24,
                  boxShadow: `0 4px 24px ${T.shadow}`,
                  marginBottom: 16,
                  overflow: 'auto',
                  maxWidth: '100%',
                }}>
                  <GeometryCanvas
                    puzzle={gs.puzzle}
                    fixed={gs.fixed}
                    cells={gs.cells}
                    lines={gs.lines}
                    positions={gs.positions}
                    onSelect={setSel}
                    selected={sel}
                    modeId={modeId}
                    shapeId={shapeId}
                  />
                </div>

                {/* Number pad */}
                {sel!==null&&gs.fixed&&!gs.fixed[sel]&&(
                  <NumberPad
                    value={typeof curVal==='number'?curVal:null}
                    onPick={pickVal} onClear={clearVal} onClose={()=>setSel(null)}
                    cands={mode.cands} modeColor={mode.color}
                  />
                )}

                {/* Actions */}
                <div style={{display:'flex',gap:8,marginTop:16,flexWrap:'wrap',justifyContent:'center'}}>
                  <button className="action-btn success" onClick={checkAnswer}>Check</button>
                  <button className="action-btn primary" onClick={()=>setView('solver')}>Solver</button>
                  <button className="action-btn ghost" onClick={()=>setView('shapes')}>Change Shape</button>
                  <button className="action-btn ghost" onClick={startGame}>New Game</button>
                  <button className="action-btn ghost" onClick={()=>setView('library')}>⬇ Library</button>
                </div>

                {/* Message */}
                {msg&&(
                  <div style={{marginTop:12,padding:'8px 18px',borderRadius:4,fontWeight:600,
                    fontSize:'.88rem',maxWidth:500,textAlign:'center',
                    background:msg.ok?'#e6f4ea':'#fdecea',
                    color:msg.ok?'#2e7d45':'#b00020',
                    border:`1px solid ${msg.ok?'#a8d5b5':'#f5c6c6'}`}}>
                    {msg.text}
                  </div>
                )}

                {/* Candidate reference */}
                <div style={{marginTop:22,textAlign:'center'}}>
                  <div className="section-label">Candidate Set S</div>
                  <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
                    {[['A-type',T.azure,A_TYPE],['B-type',T.umber,B_TYPE]].map(([label,color,group])=>{
                      const gc = mode.cands.filter(n=>group.includes(n));
                      if(!gc.length) return null;
                      return (
                        <div key={label} style={{display:'flex',flexDirection:'column',gap:3,alignItems:'center'}}>
                          <div style={{fontSize:'.58rem',color,fontWeight:700,fontFamily:'Spectral SC,serif'}}>{label}</div>
                          <div style={{display:'flex',gap:3}}>
                            {gc.map(n=>(
                              <span key={n} style={{width:30,height:30,border:`1px solid ${T.border}`,borderRadius:3,
                                display:'inline-flex',alignItems:'center',justifyContent:'center',
                                fontSize:'.78rem',fontWeight:700,background:'#fff',color,
                                fontFamily:'Cinzel,serif'}}>{n}</span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Shape & mode info bar */}
                <div style={{marginTop:18,padding:'10px 16px',borderRadius:6,
                  border:`1px solid ${T.border}`,background:T.parchment,
                  fontSize:'.78rem',color:'#666',maxWidth:500,textAlign:'center',lineHeight:1.7}}>
                  <span style={{color:shape.color,fontWeight:700}}>{shape.symbol} {shape.name}</span>
                  {' · '}
                  <span style={{color:mode.color,fontWeight:700}}>{mode.name}</span>
                  {' — '}
                  {mode.short}
                  {'. Tap a blank cell (dashed border) to open the number pad.'}
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Footer ornament */}
      <footer style={{padding:'14px',textAlign:'center',borderTop:`1px solid ${T.border}`,
        width:'100%',background:T.cream}}>
        <div style={{fontSize:'.65rem',color:T.gold,letterSpacing:'.12em',fontFamily:'Spectral SC,serif'}}>
          ✦ &nbsp; Collapse Through Symbol — Sacred Geometry Edition &nbsp; ✦
        </div>
      </footer>
    </div>
  );
}
