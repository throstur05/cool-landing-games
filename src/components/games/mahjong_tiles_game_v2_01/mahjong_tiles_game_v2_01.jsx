/**
 * mahjong_tiles_game_v2_01.jsx  — Claude's House Edition
 *
 * Full v1 game logic (500 canvas sets, AI, melds, jokers, teaching aids, save/load)
 * + inline styles (no separate CSS needed)
 * + light "Claude's House" warm-ivory palette
 * + Quit button → onQuit() prop
 *
 * Usage:
 *   import MahjongGame from "./mahjong_tiles_game_v2_01";
 *   <MahjongGame onQuit={() => setShowMahjong(false)} />
 */

import React, { useEffect, useMemo, useRef, useState } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const LS_SETTINGS_KEY = "mahjongTilesGame2.settings.v1";
const LS_SAVE_KEY     = "mahjongTilesGame2.save.v1";

const SUIT_ORDER  = { Character:0, Bamboo:1, Dot:2, Wind:3, Dragon:4, Joker:5 };
const HONOR_SUITS = new Set(["Wind","Dragon"]);

const PALETTE_SWATCHES = [
  "#000000","#ffffff","#ff0000","#00ff00","#0000ff",
  "#ffff00","#ff00ff","#00ffff","#a52a2a","#ffa500",
  "#800080","#008080","#4682b4","#2e8b57","#d2691e",
  "#808000","#708090","#ff1493","#1e90ff","#32cd32",
  "#ff4500","#ff6347","#ffd700","#adff2f","#20b2aa",
  "#7fffd4","#00ced1","#4169e1","#6a5acd","#8a2be2",
  "#9932cc","#ba55d3","#ff69b4","#cd5c5c","#f4a460",
  "#2f4f4f","#228b22","#8b4513","#5f9ea0","#00fa9a",
];

const PALETTES = {
  claudeHouse:{ char:"#c1440e", bamboo:"#1a7a4a", dot:"#1d5fa8", wind:"#6d4fba", dragon:"#b8290a", joker:"#d4900a" },
  classic:    { char:"#a86b3e", bamboo:"#138a3a", dot:"#1b6dd6", wind:"#7b5bd6", dragon:"#d64545", joker:"#f1a300" },
  hiContrast: { char:"#000",    bamboo:"#080",     dot:"#03c",   wind:"#50c",    dragon:"#c00",    joker:"#e88500" },
  bambooNight:{ char:"#e9c9a8", bamboo:"#34cc7a",  dot:"#67a6ff",wind:"#c4a6ff", dragon:"#ff8f8f", joker:"#ffd25a" },
  pastel:     { char:"#c09f80", bamboo:"#79c7a2",  dot:"#7aa7ff",wind:"#b6a4e6", dragon:"#ff9aa2", joker:"#ffd67a" },
  neon:       { char:"#ff6ec7", bamboo:"#39ff14",  dot:"#00d0ff",wind:"#b500ff", dragon:"#ff2d2d", joker:"#ffc800" },
  desert:     { char:"#a87438", bamboo:"#8a9f53",  dot:"#6b8bb2",wind:"#9b82c7", dragon:"#c76357", joker:"#c9a227" },
  sea:        { char:"#7aa3c8", bamboo:"#2ba675",  dot:"#1e6bd6",wind:"#5978d6", dragon:"#d65f6a", joker:"#f2b84b" },
  mono:       { char:"#333",    bamboo:"#333",      dot:"#333",   wind:"#333",    dragon:"#333",    joker:"#333"    },
};
function paletteFromSettings(s){
  if(s.colorTheme!=="custom") return PALETTES[s.colorTheme]||PALETTES.claudeHouse;
  return { char:s.customColors.char, bamboo:s.customColors.bamboo, dot:s.customColors.dot,
           wind:s.customColors.wind, dragon:s.customColors.dragon, joker:s.customColors.joker };
}

const CANVAS_BASES  = ["neon","glass","galaxy","wood","metal","paper","pixel","candy","ink","retro"];
const VARIANT_COUNT = 50;

function canvasThemeNames(){
  const out=[];
  for(const base of CANVAS_BASES)
    for(let i=1;i<=VARIANT_COUNT;i++)
      out.push({ value:`${base}Canvas:${i}`, label:`${titleCase(base)} ${String(i).padStart(2,"0")} (Canvas)`, base, variant:i });
  return out;
}
const CANVAS_THEMES = canvasThemeNames();
function isCanvasSet(n){ return n&&(n.includes("Canvas:")||n.endsWith("Canvas")); }
function parseCanvasSet(n){
  if(!n) return{base:"neon",variant:1};
  if(n.includes("Canvas:")){const[bc,v]=n.split(":");return{base:bc.replace("Canvas",""),variant:Math.max(1,Math.min(VARIANT_COUNT,parseInt(v,10)||1))};}
  return{base:n.replace("Canvas",""),variant:1};
}
function titleCase(s){ return s.charAt(0).toUpperCase()+s.slice(1); }

function buildWall(includeJokers,jokerCount){
  let id=1; const tiles=[];
  for(const suit of ["Character","Bamboo","Dot"])
    for(let r=1;r<=9;r++) for(let c=0;c<4;c++)
      tiles.push({id:id++,suit,rank:r,name:`${r} ${suit}`,isJoker:false});
  for(const w of ["E","S","W","N"]) for(let c=0;c<4;c++)
    tiles.push({id:id++,suit:"Wind",rank:w,name:`${w} Wind`,isJoker:false});
  for(const[r,label]of[["R","Red Dragon"],["G","Green Dragon"],["W","White Dragon"]])
    for(let c=0;c<4;c++) tiles.push({id:id++,suit:"Dragon",rank:r,name:label,isJoker:false});
  if(includeJokers) for(let j=0;j<Math.max(0,Math.min(16,Number(jokerCount)||0));j++)
    tiles.push({id:id++,suit:"Joker",rank:"*",name:"Joker",isJoker:true});
  return shuffle(tiles);
}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[a[i],a[j]]=[a[j],a[i]];}return a;}

function sortTiles(hand){
  return hand.slice().sort((a,b)=>{
    if(a.isJoker!==b.isJoker) return a.isJoker?1:-1;
    const so=SUIT_ORDER[a.suit]-SUIT_ORDER[b.suit]; if(so) return so;
    if(!HONOR_SUITS.has(a.suit)&&!a.isJoker&&!HONOR_SUITS.has(b.suit)&&!b.isJoker) return a.rank-b.rank;
    return String(a.rank).localeCompare(String(b.rank));
  });
}
function neededForRunOf3(ranks){
  if(ranks.length===0) return 3;
  if(ranks.length===1) return 2;
  if(ranks.length===2){const[a,b]=ranks;if(a===b)return 99;const d=b-a;return(d===1||d===2)?1:99;}
  const[a,b,c]=ranks;return(a+1===b&&b+1===c)?0:99;
}
function classifyMeld(tiles){
  const jokers=tiles.filter(t=>t.isJoker),non=tiles.filter(t=>!t.isJoker);
  if(tiles.length<3||tiles.length>4) return{ok:false};
  const same=non.length>0&&non.every(t=>t.suit===non[0].suit&&t.rank===non[0].rank);
  if(same){
    if(tiles.length===3&&non.length+jokers.length>=3) return{ok:true,type:"pung",points:2};
    if(tiles.length===4&&non.length+jokers.length>=4) return{ok:true,type:"kong",points:8};
  }
  if(tiles.length===3){
    if(non.some(t=>HONOR_SUITS.has(t.suit))) return{ok:false};
    const ranks=non.map(t=>t.rank).sort((a,b)=>a-b);
    const need=neededForRunOf3(ranks);
    if(need<=jokers.length) return{ok:true,type:"chow",points:1};
  }
  return{ok:false};
}
function tileKeepScore(hand,t){
  if(t.isJoker) return 10;
  let s=0; const same=hand.filter(x=>!x.isJoker&&x.suit===t.suit&&x.rank===t.rank&&x.id!==t.id).length; s+=same*3;
  if(!HONOR_SUITS.has(t.suit)){
    const ranks=new Set(hand.filter(x=>x.suit===t.suit&&!x.isJoker).map(x=>x.rank));
    if(ranks.has(t.rank-2))s+=1;if(ranks.has(t.rank-1))s+=2;if(ranks.has(t.rank+1))s+=2;if(ranks.has(t.rank+2))s+=1;
  }
  return s;
}
function analyzeBestMelds(hand){
  const tiles=sortTiles(hand),n=tiles.length;let best=null;
  const tryIdx=(arr)=>{const pick=arr.map(i=>tiles[i]);const r=classifyMeld(pick);if(r.ok){const score=r.points+(r.type==="kong"?0.5:0);if(!best||score>best.score)best={tiles:pick,info:r,score};}};
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)for(let k=j+1;k<n;k++)tryIdx([i,j,k]);
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)for(let k=j+1;k<n;k++)for(let m=k+1;m<n;m++)tryIdx([i,j,k,m]);
  return best;
}
function enumerateAllMelds(hand){
  const tiles=sortTiles(hand),n=tiles.length,out=[];
  const tryIdx=(arr)=>{const c=arr.map(i=>tiles[i]);const r=classifyMeld(c);if(r.ok)out.push({tiles:c,info:r});};
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)for(let k=j+1;k<n;k++)tryIdx([i,j,k]);
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)for(let k=j+1;k<n;k++)for(let m=k+1;m<n;m++)tryIdx([i,j,k,m]);
  const typeRank={kong:2,pung:1,chow:0};out.sort((a,b)=>(b.info.points-a.info.points)||(typeRank[b.info.type]-typeRank[a.info.type]));
  return out;
}
function aiChooseDiscard(hand,str=4){
  const scored=hand.map(t=>({t,s:tileKeepScore(hand,t)})).sort((a,b)=>a.s-b.s);
  const randomness=Math.max(0,10-str);const idx=Math.min(scored.length-1,(Math.random()*(randomness+1))|0);
  return scored[idx].t;
}
function aiFindMeldToPlay(hand,opened,need){
  const best=analyzeBestMelds(hand);if(!best)return null;
  if(!opened&&best.info.points<need)return null;
  return best.tiles;
}
const deepClone=(o)=>(typeof structuredClone==="function"?structuredClone(o):JSON.parse(JSON.stringify(o)));
const clampInt=(v,min,max)=>{const n=parseInt(v,10);if(isNaN(n))return min;return Math.max(min,Math.min(max,n));};
const safeReadLS=(k)=>{try{const r=localStorage.getItem(k);return r?JSON.parse(r):null;}catch{return null;}};
const safeWriteLS=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}};
function renderShort(t){if(t.isJoker)return"★J";if(HONOR_SUITS.has(t.suit))return t.name;const s=t.suit==="Character"?"C":t.suit==="Bamboo"?"B":"D";return`${t.rank}${s}`;}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=DM+Mono:wght@400;500&display=swap');

.mjv2 *, .mjv2 *::before, .mjv2 *::after { box-sizing: border-box; margin: 0; padding: 0; }

.mjv2 {
  --bg:      #faf7f2;
  --bg2:     #f4f0e8;
  --bg3:     #ede8de;
  --brd:     #d4ccbb;
  --brd2:    #bfb8a8;
  --tx:      #2a2520;
  --tx2:     #6b6156;
  --tx3:     #a09585;
  --acc:     #c1440e;
  --sh:      rgba(60,40,20,.1);
  font-family: 'Crimson Pro', Georgia, serif;
  background: var(--bg);
  min-height: 100vh;
  color: var(--tx);
  font-size: 15px;
}

/* ── topbar ── */
.mjv2-bar {
  position: sticky; top: 0; z-index: 20;
  background: var(--bg2); border-bottom: 1.5px solid var(--brd);
  padding: 7px 14px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
}
.mjv2-bar-stat {
  flex: 1; display: flex; gap: 16px; flex-wrap: wrap;
  font-family: 'DM Mono',monospace; font-size: 0.71rem; color: var(--tx2); letter-spacing:.04em;
}

/* ── buttons ── */
.mjv2-btn {
  appearance: none; border: 1.5px solid var(--brd2); background: var(--bg3);
  padding: 5px 10px; border-radius: 6px; font-family: inherit; font-size: 0.86rem;
  color: var(--tx); cursor: pointer; white-space: nowrap;
  transition: background .13s, border-color .13s, color .13s;
}
.mjv2-btn:hover { background: var(--bg); border-color: var(--acc); color: var(--acc); }
.mjv2-btn:disabled { opacity: .45; cursor: not-allowed; pointer-events: none; }
.mjv2-btn.pri { background: var(--acc); border-color: var(--acc); color: #fff; font-weight: 700; }
.mjv2-btn.pri:hover { background: #a83a0c; border-color: #a83a0c; }
.mjv2-btn.dan { background: #fff0ee; border-color: #f5b8a8; color: #a33000; }
.mjv2-btn.sub { background: transparent; border-color: var(--brd); color: var(--tx2); font-size: 0.78rem; padding: 3px 8px; }
.mjv2-btn.sub:hover { background: var(--bg3); border-color: var(--acc); color: var(--acc); }

/* ── board layout ── */
.mjv2-board { display: grid; grid-template-columns: 1fr; gap: 12px; padding: 12px; }
@media(min-width:1100px){
  .mjv2-board { grid-template-columns: minmax(0,1.15fr) minmax(0,.85fr); }
  .mjv2-disc-section { grid-column: 1/-1; }
}
.mjv2-sec {
  background: #fff; border: 1.5px solid var(--brd); border-radius: 10px; padding: 11px 13px;
  box-shadow: 0 1px 4px var(--sh);
}
.mjv2-sec-hd {
  font-family: 'DM Mono',monospace; font-size: 0.63rem; letter-spacing: .12em;
  text-transform: uppercase; color: var(--tx3); margin-bottom: 9px;
}

/* ── TILE ROW — always horizontal ── */
.mjv2-row {
  display: flex;
  flex-direction: row;   /* explicit: never column */
  flex-wrap: wrap;
  gap: 6px;
  align-items: flex-end;
  min-height: calc(var(--tile-h,76px) + 8px);
}

/* ── TILES ── */
.mjv2-tile {
  width: var(--tile-w,52px);
  height: var(--tile-h,76px);
  flex: 0 0 var(--tile-w,52px);   /* fixed width, never stretch */
  background: linear-gradient(160deg,#fffdf8 0%,#faf6ef 100%);
  border: 1.5px solid var(--brd2);
  border-radius: 8px;
  box-shadow: 0 2px 5px var(--sh), inset 0 1px 0 rgba(255,255,255,.8);
  display: flex; flex-direction: column;
  user-select: none; position: relative; overflow: hidden;
  cursor: pointer;
  transition: transform .12s, box-shadow .12s, border-color .12s;
}
.mjv2-tile:not(.dis):hover { transform: translateY(-3px); box-shadow: 0 6px 14px var(--sh); }
.mjv2-tile.sel {
  transform: translateY(-8px);
  border-color: var(--acc);
  box-shadow: 0 8px 20px var(--sh), 0 0 0 2.5px rgba(193,68,14,.22);
}
.mjv2-tile.dis { opacity: .7; pointer-events: none; cursor: default; transform: none !important; }

.mjv2-tile::before {
  content:''; position:absolute; left:0; top:0; bottom:0; width:3px; border-radius:6px 0 0 6px;
}
.mjv2-tile[data-suit="Character"]::before { background: var(--s-char,#c1440e); }
.mjv2-tile[data-suit="Bamboo"]::before    { background: var(--s-bamboo,#1a7a4a); }
.mjv2-tile[data-suit="Dot"]::before       { background: var(--s-dot,#1d5fa8); }
.mjv2-tile[data-suit="Wind"]::before      { background: var(--s-wind,#6d4fba); }
.mjv2-tile[data-suit="Dragon"]::before    { background: var(--s-dragon,#b8290a); }
.mjv2-tile[data-suit="Joker"]::before     { background: var(--s-joker,#d4900a); }

.mjv2-ttop, .mjv2-tbot {
  height: 17px; line-height: 17px; text-align: center;
  font-size: 10px; font-family: 'DM Mono',monospace;
  white-space: nowrap; overflow: hidden; color: var(--tx2); padding: 0 3px;
}
.mjv2-tface {
  flex: 1; display: flex; align-items: center; justify-content: center;
  overflow: hidden; padding: 2px;
  font-size: var(--tile-face,26px); font-weight: 700; line-height: 1;
}
.mjv2-tface canvas { width:100% !important; height:100% !important; display:block; }

.mjv2-tile[data-suit="Character"] .mjv2-tface { color: var(--s-char,#c1440e); }
.mjv2-tile[data-suit="Bamboo"]    .mjv2-tface { color: var(--s-bamboo,#1a7a4a); }
.mjv2-tile[data-suit="Dot"]       .mjv2-tface { color: var(--s-dot,#1d5fa8); }
.mjv2-tile[data-suit="Wind"]      .mjv2-tface { color: var(--s-wind,#6d4fba); }
.mjv2-tile[data-suit="Dragon"]    .mjv2-tface { color: var(--s-dragon,#b8290a); }
.mjv2-tile[data-suit="Joker"]     .mjv2-tface { color: var(--s-joker,#d4900a); }

/* ── controls ── */
.mjv2-ctrl { display:flex; flex-wrap:wrap; gap:6px; margin-top:9px; align-items:center; }
.mjv2-hint-txt { font-size:0.8rem; color:var(--tx2); font-style:italic; padding:3px 0; }

/* ── melds ── */
.mjv2-melds { margin-top:10px; }
.mjv2-meld-list { display:flex; flex-wrap:wrap; gap:7px; margin-top:5px; }
.mjv2-meld {
  display:flex; align-items:center; gap:4px; padding:4px 7px;
  border:1.5px dashed var(--brd2); border-radius:7px; background:#f8fdf9;
}
.mjv2-meld-tag {
  font-family:'DM Mono',monospace; font-size:0.6rem;
  background:#e8f5ed; border:1px solid #c0ddc8; border-radius:4px; padding:2px 5px; color:#1a7a4a; margin-left:3px;
}

/* ── score ── */
.mjv2-score { margin-top:7px; font-family:'DM Mono',monospace; font-size:0.76rem; color:var(--tx2); font-weight:500; }

/* ── teaching aids ── */
.mjv2-aid-hd { font-family:'DM Mono',monospace; font-size:0.62rem; letter-spacing:.1em; text-transform:uppercase; color:var(--tx3); margin-bottom:5px; }
.mjv2-aid-box { background:#f8f6ff; border:1.5px solid #e0d8f8; border-radius:7px; padding:7px 9px; margin-top:6px; }
.mjv2-aid-box h5 { font-size:0.76rem; color:#5a3fa8; margin-bottom:4px; font-weight:600; }
.mjv2-aid-meld { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:2px 0; font-size:0.8rem; }

/* ── log ── */
.mjv2-log {
  max-height: 190px; overflow-y:auto;
  background:#fdfcfa; border:1.5px solid var(--brd); border-radius:7px; padding:5px 8px;
  font-family:'DM Mono',monospace; font-size:0.7rem; color:var(--tx2);
}
.mjv2-log-ln { padding:2px 0; border-bottom:1px solid var(--bg3); white-space:nowrap; }
.mjv2-log-ln:last-child { border-bottom:none; }

/* ── modal ── */
.mjv2-back { position:fixed;inset:0;background:rgba(42,37,32,.45);z-index:100;display:flex;justify-content:flex-end;align-items:stretch; }
.mjv2-panel {
  width:min(580px,96vw); background:var(--bg); border-left:1.5px solid var(--brd);
  box-shadow:-6px 0 24px rgba(42,37,32,.18); display:flex; flex-direction:column;
}
.mjv2-panel h2 { font-size:1.1rem; font-weight:700; padding:14px 16px 0; color:var(--tx); }
.mjv2-pscroll { flex:1; overflow:auto; padding:10px 16px 14px; }
.mjv2-pscroll-inner { min-width:860px; }
.mjv2-pactions { display:flex;gap:7px;justify-content:flex-end;padding:10px 16px;border-top:1.5px solid var(--brd);background:var(--bg2); }

/* ── form ── */
.mjv2-form { display:grid;grid-template-columns:1fr 1fr;gap:11px; }
.mjv2-form label { display:flex;flex-direction:column;gap:4px;font-size:0.85rem;color:var(--tx); }
.mjv2-form input[type="number"],.mjv2-form select {
  padding:5px 7px; border:1.5px solid var(--brd); border-radius:5px;
  background:#fff; font:inherit; font-size:0.83rem; color:var(--tx);
}
.mjv2-form input[type="range"] { width:100%; }
.mjv2-chkrow { flex-direction:row!important; align-items:center; justify-content:space-between; gap:8px; }

/* ── color picker ── */
.mjv2-col-grid { display:grid;grid-template-columns:repeat(2,1fr);gap:7px; }
.mjv2-pal { display:grid;grid-template-columns:repeat(10,1fr);gap:4px;margin-top:4px; }
.mjv2-sw { width:100%;padding-bottom:100%;border-radius:4px;border:1px solid var(--brd);cursor:pointer; }

/* ── rules table ── */
.mjv2-rule-wrap { min-width:860px; }
.mjv2-rtbl { border-collapse:collapse;width:100%; }
.mjv2-rtbl th,.mjv2-rtbl td { border:1px solid var(--brd);padding:6px 9px;text-align:left;font-size:0.83rem; }
.mjv2-rtbl th { background:var(--bg2);font-weight:600; }

/* ── game over ── */
.mjv2-go { position:fixed;inset:0;background:rgba(42,37,32,.4);z-index:90;display:flex;align-items:center;justify-content:center; }
.mjv2-go-box {
  background:var(--bg); border:1.5px solid var(--brd); border-radius:12px; padding:22px 26px;
  text-align:center; box-shadow:0 16px 40px rgba(42,37,32,.2); min-width:230px;
}
.mjv2-go-box h2 { font-size:1.3rem; margin-bottom:12px; color:var(--tx); }

@media(max-width:640px){
  .mjv2-form{grid-template-columns:1fr;}
  .mjv2-panel{width:100vw;}
  .mjv2-pscroll-inner{min-width:unset;}
}
`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function roman(n){ return["","Ⅰ","Ⅱ","Ⅲ","Ⅳ","Ⅴ","Ⅵ","Ⅶ","Ⅷ","Ⅸ"][n]||String(n); }
function greek(n){ return["","α","β","γ","δ","ε","ζ","η","θ","ι"][n]||String(n); }

const HIDDEN_TILE = { suit:"Character", rank:0, name:"Hidden", isJoker:false, id:-1 };

function tileFace(t, set){
  if(!t||t===HIDDEN_TILE) return "■";
  if(["photographic","neon","circuit","origami"].includes(set)){
    let file="";
    if(t.isJoker) file="joker.png";
    else if(t.suit==="Dot") file=`dot${t.rank}.png`;
    else if(t.suit==="Bamboo") file=`bamboo${t.rank}.png`;
    else if(t.suit==="Character") file=`char${t.rank}.png`;
    else if(t.suit==="Wind") file=({E:"east",S:"south",W:"west",N:"north"})[t.rank]+".png";
    else if(t.suit==="Dragon") file=({R:"red",G:"green",W:"white"})[t.rank]+".png";
    return <img src={`/tiles/${set}/${file}`} alt={t.name} style={{width:"90%",height:"90%",objectFit:"contain"}} draggable={false}/>;
  }
  if(t.isJoker){ if(set==="emoji")return"⭐"; if(["shapes","outline","kanji","symbols"].includes(set))return"★"; return"J"; }
  switch(set){
    case"letters":return HONOR_SUITS.has(t.suit)?(typeof t.rank==="string"?t.rank:t.suit[0]):`${t.rank}`;
    case"emoji":return t.suit==="Character"?"🈶":t.suit==="Bamboo"?"🎋":t.suit==="Dot"?"⚫":t.suit==="Wind"?(typeof t.rank==="string"?t.rank:"🧭"):"🐉";
    case"kanji":return t.suit==="Character"?"萬":t.suit==="Bamboo"?"索":t.suit==="Dot"?"筒":t.suit==="Wind"?(typeof t.rank==="string"?t.rank:"風"):(t.rank==="R"?"中":t.rank==="G"?"發":"白");
    case"western":return HONOR_SUITS.has(t.suit)?(typeof t.rank==="string"?t.rank:t.suit[0]):`${t.rank}`;
    case"shapes":return t.suit==="Character"?"◆":t.suit==="Bamboo"?"▲":t.suit==="Dot"?"●":t.suit==="Wind"?"■":"✚";
    case"minimal":return HONOR_SUITS.has(t.suit)?(typeof t.rank==="string"?t.rank:t.suit[0]):`${t.rank}`;
    case"outline":return t.suit==="Character"?"□":t.suit==="Bamboo"?"△":t.suit==="Dot"?"○":t.suit==="Wind"?"◧":"✚";
    case"roman":return HONOR_SUITS.has(t.suit)?(typeof t.rank==="string"?t.rank:t.suit[0]):roman(t.rank);
    case"greek":return HONOR_SUITS.has(t.suit)?(typeof t.rank==="string"?t.rank:t.suit[0]):greek(t.rank);
    case"dots":return HONOR_SUITS.has(t.suit)?(typeof t.rank==="string"?t.rank:t.suit[0]):"•".repeat(Math.max(1,Math.min(9,t.rank)));
    case"bars":return HONOR_SUITS.has(t.suit)?(typeof t.rank==="string"?t.rank:t.suit[0]):"|".repeat(Math.max(1,Math.min(9,t.rank)));
    case"zodiac":{const z=["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];return HONOR_SUITS.has(t.suit)?t.name[0]||"★":z[(t.rank-1)%z.length];}
    case"planets":{const p=["☿","♀","♂","♃","♄","♅","♆","♇","☉","☽"];return HONOR_SUITS.has(t.suit)?t.name[0]||"★":p[(t.rank-1)%p.length];}
    case"alchemy":{const a=["☉","☽","🜁","🜂","🜃","🜄","🜔","🜍","🜏"];return HONOR_SUITS.has(t.suit)?t.name[0]||"★":a[(t.rank-1)%a.length];}
    case"runes":{const r=["ᚠ","ᚢ","ᚦ","ᚨ","ᚱ","ᚲ","ᚷ","ᚹ","ᚺ"];return HONOR_SUITS.has(t.suit)?t.name[0]||"★":r[(t.rank-1)%r.length];}
    case"cards":{const s=["♠","♥","♦","♣"];return HONOR_SUITS.has(t.suit)?t.name[0]||"★":`${t.rank}${s[(t.rank-1)%4]}`;}
    default:return t.suit==="Character"?"文":t.suit==="Bamboo"?"竹":t.suit==="Dot"?"●":t.suit==="Wind"?(typeof t.rank==="string"?t.rank:"風"):(t.rank==="R"?"中":t.rank==="G"?"發":"白");
  }
}
function tileLabel(t){ if(!t) return""; if(t.isJoker) return"Joker"; if(HONOR_SUITS.has(t.suit)) return t.name; return`${t.rank}`; }

// ─── TILE COMPONENT ───────────────────────────────────────────────────────────

// All layout via inline styles so external CSS cannot break structure
function Tile({ tile, onClick, onDoubleClick, selected, disabled, titlePos="top", tileSet="symbols" }){
  const TW = "var(--tile-w,52px)";
  const TH = "var(--tile-h,76px)";
  const TF = "var(--tile-face,26px)";
  const suitColor = {
    Character:"var(--s-char,#c1440e)", Bamboo:"var(--s-bamboo,#1a7a4a)",
    Dot:"var(--s-dot,#1d5fa8)", Wind:"var(--s-wind,#6d4fba)",
    Dragon:"var(--s-dragon,#b8290a)", Joker:"var(--s-joker,#d4900a)",
  }[tile.suit] || "#888";

  const wrapStyle = {
    // core box
    display: "flex",
    flexDirection: "column",
    width: TW,
    height: TH,
    flexShrink: 0,
    flexGrow: 0,
    flexBasis: TW,
    // appearance
    background: selected
      ? "linear-gradient(160deg,#fff8f5 0%,#fdf0ea 100%)"
      : "linear-gradient(160deg,#fffdf8 0%,#faf6ef 100%)",
    border: selected ? `2px solid var(--acc,#c1440e)` : "1.5px solid var(--brd2,#bfb8a8)",
    borderLeft: `3px solid ${suitColor}`,
    borderRadius: 8,
    boxShadow: selected
      ? "0 8px 20px rgba(60,40,20,.18), 0 0 0 2.5px rgba(193,68,14,.2)"
      : "0 2px 5px rgba(60,40,20,.1)",
    transform: selected ? "translateY(-8px)" : "none",
    cursor: disabled ? "default" : "pointer",
    userSelect: "none",
    position: "relative",
    overflow: "hidden",
    opacity: disabled ? 0.7 : 1,
    transition: "transform .12s, box-shadow .12s, border-color .12s",
    boxSizing: "border-box",
  };

  const labelStyle = {
    height: 17, lineHeight: "17px", textAlign: "center",
    fontSize: 10, fontFamily: "'DM Mono',monospace",
    whiteSpace: "nowrap", overflow: "hidden",
    color: "var(--tx2,#6b6156)", padding: "0 3px",
    flexShrink: 0,
  };
  const faceStyle = {
    flex: 1,
    display: "flex", alignItems: "center", justifyContent: "center",
    overflow: "hidden", padding: 2,
    fontSize: TF, fontWeight: 700, lineHeight: 1,
    color: suitColor,
  };

  const label = tileLabel(tile);
  const face  = isCanvasSet(tileSet)
    ? <CanvasTile tile={tile} setName={tileSet}/>
    : tileFace(tile, tileSet);

  return (
    <div
      style={wrapStyle}
      data-suit={tile.suit}
      onClick={disabled ? undefined : onClick}
      onDoubleClick={disabled ? undefined : onDoubleClick}
      title={tile.name}
    >
      {titlePos === "top"    && <div style={labelStyle}>{label}</div>}
      <div style={faceStyle}>{face}</div>
      {titlePos === "bottom" && <div style={labelStyle}>{label}</div>}
    </div>
  );
}

function MeldArea({ melds, name, tileSet }){
  if(!melds.length) return null;
  return (
    <div className="mjv2-melds">
      <div className="mjv2-aid-hd">{name}</div>
      <div className="mjv2-meld-list">
        {melds.map((m,i)=>(
          <div className="mjv2-meld" key={i} title={`${m.info.type} (+${m.info.points})`}>
            {m.tiles.map(t=><Tile key={t.id} tile={t} disabled titlePos="bottom" tileSet={tileSet}/>)}
            <span className="mjv2-meld-tag">{m.info.type.toUpperCase()} +{m.info.points}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ColorPicker({ label, value, onChange }){
  return (
    <div>
      <span style={{fontWeight:600,display:"block",marginBottom:3,fontSize:"0.82rem"}}>{label}</span>
      <input type="color" value={value} onChange={e=>onChange(e.target.value)}
        style={{width:"100%",height:32,border:"1.5px solid var(--brd)",borderRadius:5}}/>
      <div className="mjv2-pal">
        {PALETTE_SWATCHES.map(col=>(
          <div key={col} className="mjv2-sw" style={{background:col}} title={col} onClick={()=>onChange(col)}/>
        ))}
      </div>
    </div>
  );
}

// ─── CANVAS RENDERER ──────────────────────────────────────────────────────────

function CanvasTile({ tile, setName }){
  const ref=useRef(null);
  useEffect(()=>{
    const el=ref.current; if(!el) return;
    const rect=el.parentElement.getBoundingClientRect();
    const cssW=Math.max(1,rect.width),cssH=Math.max(1,rect.height);
    const dpr=Math.min(2,window.devicePixelRatio||1);
    el.style.width=`${cssW}px`; el.style.height=`${cssH}px`;
    el.width=Math.round(cssW*dpr); el.height=Math.round(cssH*dpr);
    const ctx=el.getContext("2d"); if(!ctx) return;
    ctx.setTransform(1,0,0,1,0,0);
    const p=parseCanvasSet(setName);
    drawCanvasBySet(ctx,el.width,el.height,tile,p.base+"Canvas",p.variant);
  },[tile,setName]);
  return <canvas ref={ref}/>;
}

function clipCard(ctx,W,H,r=16,pad=4){const x=pad,y=pad,w=W-2*pad,h=H-2*pad;ctx.save();ctx.beginPath();rrp(ctx,x,y,w,h,r);ctx.clip();ctx.fillStyle="#fff";ctx.fillRect(x,y,w,h);ctx.lineWidth=2;ctx.strokeStyle="#d8d8d8";ctx.stroke();return{x,y,w,h};}
function rrp(ctx,x,y,w,h,r){ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function sp(ctx,cx,cy,r1,r2,p=5){ctx.beginPath();for(let i=0;i<p*2;i++){const a=i*Math.PI/p;const r=i%2===0?r1:r2;i?ctx.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r):ctx.moveTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);}ctx.closePath();}
function rings(ctx,cx,cy,rs,col,lw=3,al=1){ctx.save();ctx.strokeStyle=col;ctx.globalAlpha=al;ctx.lineWidth=lw;rs.forEach(r=>{ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();});ctx.restore();}
function smc(suit,rank){const h=(rank*37)%360,a=(x)=>`hsl(${(h+x)%360} 80% 55%)`;switch(suit){case"Dot":return a(0);case"Bamboo":return a(120);case"Character":return a(240);case"Wind":return a(300);case"Dragon":return a(30);default:return a(180);}}
function dgs(ctx,W,H,t,opt){const cx=W/2,cy=H/2,col=opt.color||smc(t.suit,Number(t.rank)||1);ctx.save();ctx.lineJoin="round";ctx.lineCap="round";
  if(t.suit==="Dot"&&!t.isJoker){const b=Math.min(W,H)*0.12;rings(ctx,cx,cy,[b*2,b*3,b*4],col,opt.ringWidth||4,opt.ringAlpha||1);ctx.fillStyle=opt.centerFill||"#fff";ctx.strokeStyle=col;ctx.lineWidth=opt.centerStroke||4;ctx.beginPath();ctx.arc(cx,cy,b*1.4,0,Math.PI*2);ctx.fill();ctx.stroke();}
  else if(t.suit==="Bamboo"&&!t.isJoker){const st=Math.min(5,Math.max(2,Math.ceil((Number(t.rank)||1)/2)));for(let i=0;i<st;i++){const x=W*0.25+i*((W*0.5)/Math.max(1,st-1));ctx.strokeStyle=col;ctx.lineWidth=opt.stalkWidth||6;ctx.beginPath();ctx.moveTo(x,H*0.28);ctx.lineTo(x,H*0.72);ctx.stroke();ctx.lineWidth=opt.nodeWidth||3;for(let y=H*0.34;y<=H*0.66;y+=H*0.08){ctx.beginPath();ctx.moveTo(x-10,y);ctx.lineTo(x+10,y);ctx.stroke();}}}
  else if(t.suit==="Character"&&!t.isJoker){ctx.fillStyle="rgba(0,0,0,.15)";ctx.font=`${Math.floor(H*0.42)}px system-ui,sans-serif`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(String(t.rank),cx+2,cy-6);ctx.fillStyle="#111";ctx.fillText(String(t.rank),cx,cy-8);ctx.fillStyle=col;ctx.font=`${Math.floor(H*0.22)}px system-ui,sans-serif`;ctx.fillText("C",cx,cy+44);}
  else if(t.suit==="Wind"){const map={E:[1,0],S:[0,1],W:[-1,0],N:[0,-1]},v=map[t.rank]||[1,0];ctx.strokeStyle=col;ctx.lineWidth=opt.arrowWidth||8;const len=Math.min(W,H)*0.32;const ex=cx+v[0]*len,ey=cy+v[1]*len;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(ex,ey);ctx.stroke();ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(ex-v[1]*16,ey+v[0]*16);ctx.lineTo(ex+v[1]*16,ey-v[0]*16);ctx.closePath();ctx.fill();}
  else if(t.suit==="Dragon"){const map={R:"#e04545",G:"#2aa866",W:"#e9e9e9"},dc=map[t.rank]||col;ctx.fillStyle=dc;ctx.strokeStyle="#444";ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx,cy,Math.min(W,H)*0.18,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle="#222";ctx.font=`${Math.floor(H*0.28)}px system-ui,sans-serif`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(t.rank,cx,cy);}
  else{ctx.strokeStyle=col;ctx.lineWidth=4;sp(ctx,cx,cy,Math.min(W,H)*0.28,Math.min(W,H)*0.12,5);ctx.stroke();ctx.fillStyle="#222";ctx.font=`${Math.floor(H*0.2)}px system-ui,sans-serif`;ctx.textAlign="center";ctx.fillText("J",cx,26);}
  ctx.restore();}
function neb(ctx,W,H,h){const g=ctx.createRadialGradient(W*0.3,H*0.3,10,W*0.5,H*0.5,Math.max(W,H)*0.7);g.addColorStop(0,`hsla(${h},90%,60%,.25)`);g.addColorStop(1,`hsla(${(h+200)%360},90%,50%,.05)`);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.fillStyle="rgba(255,255,255,.6)";for(let i=0;i<40;i++){ctx.fillRect(Math.random()*W,Math.random()*H,1,1);}}
function glB(ctx,c,h){const g=ctx.createLinearGradient(c.x,c.y,c.x,c.y+c.h);g.addColorStop(0,`hsla(${h},60%,98%,.9)`);g.addColorStop(1,`hsla(${h},60%,92%,.9)`);ctx.fillStyle=g;ctx.fillRect(c.x,c.y,c.w,c.h);ctx.fillStyle="rgba(255,255,255,.35)";ctx.fillRect(c.x+8,c.y+8,c.w-16,10);}
function wdB(ctx,c){ctx.fillStyle="#f8f0e2";ctx.fillRect(c.x,c.y,c.w,c.h);ctx.strokeStyle="rgba(160,120,70,.35)";for(let y=c.y+10;y<c.y+c.h;y+=12){ctx.beginPath();ctx.moveTo(c.x+6,y);ctx.lineTo(c.x+c.w-6,y);ctx.stroke();}}
function mtB(ctx,c){const r=Math.max(c.w,c.h);const g=ctx.createRadialGradient(c.x+c.w/2,c.y+c.h/2,10,c.x+c.w/2,c.y+c.h/2,r);g.addColorStop(0,"#f2f2f2");g.addColorStop(1,"#c7c7c7");ctx.fillStyle=g;ctx.fillRect(c.x,c.y,c.w,c.h);ctx.fillStyle="#aaa";[[16,16],[c.w-16,16],[16,c.h-16],[c.w-16,c.h-16]].forEach(([dx,dy])=>{ctx.beginPath();ctx.arc(c.x+dx,c.y+dy,3,0,Math.PI*2);ctx.fill();});}
function ppB(ctx,c){ctx.fillStyle="#fffef8";ctx.fillRect(c.x,c.y,c.w,c.h);for(let i=0;i<14;i++){ctx.fillStyle=`hsla(${(i*33)%360},70%,85%,.35)`;ctx.beginPath();ctx.moveTo(c.x+Math.random()*c.w,c.y+Math.random()*c.h);ctx.lineTo(c.x+Math.random()*c.w,c.y+Math.random()*c.h);ctx.lineTo(c.x+Math.random()*c.w,c.y+Math.random()*c.h);ctx.closePath();ctx.fill();}}
function pxB(ctx,c){ctx.fillStyle="#f2f6ff";ctx.fillRect(c.x,c.y,c.w,c.h);ctx.fillStyle="rgba(0,0,0,.06)";for(let y=c.y+8;y<c.y+c.h-8;y+=8)for(let x=c.x+8;x<c.x+c.w-8;x+=8)ctx.fillRect(x,y,1,1);}
function cdB(ctx,c,h){for(let i=0;i<c.h;i+=12){ctx.fillStyle=`hsla(${(h+i)%360},80%,85%,.55)`;ctx.fillRect(c.x,c.y+i,c.w,10);}}
function ikB(ctx,c){ctx.fillStyle="#fff";ctx.fillRect(c.x,c.y,c.w,c.h);ctx.strokeStyle="rgba(20,20,20,.12)";for(let i=0;i<9;i++){ctx.lineWidth=(i%3===0?3:1);ctx.beginPath();ctx.moveTo(c.x+10,c.y+10+i*18);ctx.quadraticCurveTo(c.x+c.w/2,c.y+Math.random()*c.h,c.x+c.w-10,c.y+10+i*18);ctx.stroke();}}
function rtB(ctx,c){const g=ctx.createLinearGradient(c.x,c.y,c.x,c.y+c.h);g.addColorStop(0,"#ffdde1");g.addColorStop(1,"#ee9ca7");ctx.fillStyle=g;ctx.fillRect(c.x,c.y,c.w,c.h);ctx.strokeStyle="rgba(0,0,0,.15)";for(let x=c.x+10;x<c.x+c.w-10;x+=14){ctx.beginPath();ctx.moveTo(x,c.y+c.h-12);ctx.lineTo(x-60,c.y+c.h-2);ctx.stroke();}}
function drawCanvasBySet(ctx,W,H,t,sn,variant=1){
  ctx.clearRect(0,0,W,H);const clip=clipCard(ctx,W,H,18,6);
  const bh=((Number(t.rank)||1)*35+(variant-1)*7)%360;
  const dg=(o={})=>dgs(ctx,W,H,t,o);
  if(sn==="neonCanvas"){ctx.fillStyle="#0b0b12";ctx.fillRect(clip.x,clip.y,clip.w,clip.h);neb(ctx,W,H,bh);dg({color:`hsl(${bh} 90% 60%)`,ringWidth:5,ringAlpha:.9,centerStroke:5});}
  else if(sn==="glassCanvas"){glB(ctx,clip,bh);dg({color:`hsl(${bh} 70% 50%)`});}
  else if(sn==="galaxyCanvas"){ctx.fillStyle="#07090f";ctx.fillRect(clip.x,clip.y,clip.w,clip.h);neb(ctx,W,H,(bh+140)%360);dg({color:`hsl(${bh} 100% 65%)`,ringAlpha:.8});}
  else if(sn==="woodCanvas"){wdB(ctx,clip);dg({color:`hsl(${(bh+40)%360} 70% 40%)`});}
  else if(sn==="metalCanvas"){mtB(ctx,clip);dg({color:`hsl(${bh} 70% 35%)`,centerFill:"#f6f6f6"});}
  else if(sn==="paperCanvas"){ppB(ctx,clip);dg({color:`hsl(${bh} 70% 45%)`});}
  else if(sn==="pixelCanvas"){pxB(ctx,clip);dg({color:`hsl(${bh} 90% 40%)`,ringWidth:3});}
  else if(sn==="candyCanvas"){cdB(ctx,clip,bh);dg({color:`hsl(${(bh+300)%360} 80% 45%)`});}
  else if(sn==="inkCanvas"){ikB(ctx,clip);dg({color:`hsl(${(bh+200)%360} 70% 30%)`});}
  else if(sn==="retroCanvas"){rtB(ctx,clip);dg({color:`hsl(${(bh+260)%360} 90% 40%)`});}
  else{dg({});}
  ctx.restore();
}

// ─── HOW TO PLAY HELPERS ─────────────────────────────────────────────────────

const td = {border:"1px solid var(--brd,#d4ccbb)",padding:"6px 10px",verticalAlign:"top"};
const kbdStyle = {
  display:"inline-block",background:"var(--bg3,#ede8de)",border:"1.5px solid var(--brd2,#bfb8a8)",
  borderRadius:4,padding:"1px 7px",fontFamily:"'DM Mono',monospace",fontSize:"0.78rem",
};
function Section({ title, children }){
  return (
    <div style={{marginBottom:22}}>
      <div style={{fontWeight:700,fontSize:"1rem",color:"var(--tx,#2a2520)",marginBottom:7,
        paddingBottom:5,borderBottom:"1.5px solid var(--bg3,#ede8de)"}}>{title}</div>
      <div style={{color:"var(--tx2,#6b6156)"}}>{children}</div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function MahjongTilesGame({ onQuit }){

  const defaultSettings = useMemo(()=>{
    const saved=safeReadLS(LS_SETTINGS_KEY);
    return saved||{
      aiStrength:4, includeJokers:true, numJokers:4, initialMeldPoints:6,
      rememberOptions:true, practiceMode:false,
      tileSet:"neonCanvas:1", colorTheme:"claudeHouse",
      customColors:{ char:"#c1440e", bamboo:"#1a7a4a", dot:"#1d5fa8", wind:"#6d4fba", dragon:"#b8290a", joker:"#d4900a" },
      tileSize:52, fastMode:false, shortcuts:true,
      campaignMode:true, totalRounds:40,
    };
  },[]);

  const [settings,setSettings]       = useState(defaultSettings);
  const [pending,setPending]         = useState(defaultSettings);  // editable copy in setup panel

  const [phase,setPhase]             = useState("idle");
  const [wall,setWall]               = useState([]);
  const [discard,setDiscard]         = useState([]);
  const [players,setPlayers]         = useState([
    {name:"You",hand:[],melds:[],opened:false,score:0},
    {name:"AI", hand:[],melds:[],opened:false,score:0},
  ]);
  const [current,setCurrent]         = useState(0);
  const [selectedIds,setSelectedIds] = useState(new Set());
  const [messageLog,setMessageLog]   = useState([]);
  const [showRules,setShowRules]     = useState(false);
  const [showSetup,setShowSetup]     = useState(true);

  // ── Campaign state ──
  const [roundNum,setRoundNum]           = useState(1);
  const [roundHistory,setRoundHistory]   = useState([]); // [{round,winner,youScore,aiScore,youMelds,aiMelds,turns,outcome}]
  const [showRoundEnd,setShowRoundEnd]   = useState(false);
  const [lastRoundSummary,setLastRoundSummary] = useState(null);
  const [showCampaignEnd,setShowCampaignEnd]   = useState(false);
  const [roundTurns,setRoundTurns]       = useState(0); // turns taken this round
  const roundTurnsRef                    = useRef(0);   // ref copy — safe inside closures
  const [showDiary,setShowDiary]         = useState(false);
  const [showHowTo,setShowHowTo]         = useState(false);
  const [howToTab,setHowToTab]           = useState("rules");
  const [narrativeLoading,setNarrativeLoading] = useState(false);

  useEffect(()=>{ if(settings.rememberOptions) safeWriteLS(LS_SETTINGS_KEY,settings); },[settings]);

  const palette   = paletteFromSettings(settings);
  const rootStyle = {
    "--s-char":   palette.char,
    "--s-bamboo": palette.bamboo,
    "--s-dot":    palette.dot,
    "--s-wind":   palette.wind,
    "--s-dragon": palette.dragon,
    "--s-joker":  palette.joker,
    "--tile-w":   `${settings.tileSize}px`,
    "--tile-h":   `${Math.round(settings.tileSize*1.45)}px`,
    "--tile-face":`${Math.max(18,Math.round(settings.tileSize*0.5))}px`,
  };

  const you = players[0], ai = players[1];
  const mustDiscard = useMemo(()=>players[current]?.hand?.length>13,[players,current]);
  const selectedCount = useMemo(()=>you.hand.filter(t=>selectedIds.has(t.id)).length,[you.hand,selectedIds]);

  function saveGame(){safeWriteLS(LS_SAVE_KEY,{phase,wall,discard,players,current,settings});pushLog("Game saved.");}
  function loadGame(){
    const s=safeReadLS(LS_SAVE_KEY);if(!s){alert("No saved game.");return;}
    setPhase(s.phase);setWall(s.wall||[]);setDiscard(s.discard||[]);
    setPlayers(s.players||players);setCurrent(s.current||0);setSettings(s.settings||settings);
    setShowSetup(false);pushLog("Game loaded.");
  }

  function startNewGame(s, roundN){
    const cfg=s||settings;
    const newWall=buildWall(cfg.includeJokers,cfg.numJokers);
    const p0={name:"You",hand:[],melds:[],opened:false,score:0};
    const p1={name:"AI", hand:[],melds:[],opened:false,score:0};
    for(let i=0;i<13;i++){p0.hand.push(newWall.pop());p1.hand.push(newWall.pop());}
    p0.hand=sortTiles(p0.hand);p1.hand=sortTiles(p1.hand);
    p0.hand.push(newWall.pop());p0.hand=sortTiles(p0.hand);
    setPlayers([p0,p1]);setWall(newWall);setDiscard([]);setCurrent(0);
    setSelectedIds(new Set());setPhase("playing");setShowSetup(false);
    setRoundTurns(0); roundTurnsRef.current=0;
    const rn = roundN ?? roundNum;
    const total = cfg.campaignMode ? (cfg.totalRounds||40) : "∞";
    setMessageLog([`Round ${rn}${cfg.campaignMode?` of ${total}`:""} — AI=${cfg.practiceMode?"Practice":cfg.aiStrength}, Jokers=${cfg.includeJokers?cfg.numJokers:0}, Init=${cfg.initialMeldPoints}`]);
  }

  // Open setup: copy active settings into pending
  function openSetup(){ setPending(deepClone(settings)); setShowSetup(true); }

  // Apply only (no new game)
  function applyOnly(){ setSettings(pending); setShowSetup(false); }

  // Apply & Start: reset campaign counters, then start round 1
  function applyAndStart(){
    setSettings(pending);
    setRoundNum(1);
    setRoundHistory([]);
    setShowRoundEnd(false);
    setShowCampaignEnd(false);
    setShowSetup(false);
    startNewGame(pending, 1);
  }

  function endTurn(next){
    setCurrent(next);
    setSelectedIds(new Set());
    setRoundTurns(t=>{ const n=t+1; roundTurnsRef.current=n; return n; });
  }
  function pushLog(m){setMessageLog(prev=>[m,...prev].slice(0,80));}

  // Called whenever a round ends — record stats, decide next step
  function finishRound(outcome, finalPlayers, finalTurns){
    const p0 = finalPlayers[0], p1 = finalPlayers[1];
    const winner = outcome==="you" ? "You" : outcome==="ai" ? "AI" : "Draw";
    const logSnapshot = [...messageLog].reverse(); // oldest first for narrative
    const summary = {
      round:    roundNum,
      outcome,
      winner,
      youScore:  p0.score,
      aiScore:   p1.score,
      youMelds:  p0.melds.length,
      aiMelds:   p1.melds.length,
      youMeldPts:p0.score,
      aiMeldPts: p1.score,
      turns:     finalTurns,
      youMeldTypes: p0.melds.map(m=>m.info.type),
      aiMeldTypes:  p1.melds.map(m=>m.info.type),
      log:       logSnapshot,
      narrative: null, // filled async
    };
    const newHistory = [...roundHistory, summary];
    setRoundHistory(newHistory);
    setLastRoundSummary(summary);
    const total = settings.campaignMode ? (settings.totalRounds||40) : Infinity;
    if(settings.campaignMode && roundNum >= total){
      setShowCampaignEnd(true);
    } else {
      setShowRoundEnd(true);
    }
    // Generate narrative async — update roundHistory entry when done
    generateRoundNarrative(summary, newHistory.length-1);
  }

  async function generateRoundNarrative(summary, histIdx){
    setNarrativeLoading(true);
    const meldLabel = t => t==="pung"?"Pung":t==="kong"?"Kong":"Chow";
    const meldSummary = arr => {
      const c={}; arr.forEach(t=>{c[t]=(c[t]||0)+1;});
      return Object.entries(c).map(([t,n])=>`${n}×${meldLabel(t)}`).join(", ")||"none";
    };
    const prompt = `You are a vivid sports commentator narrating a round of simplified Mahjong Tiles. Write an engaging, friendly 3-paragraph story (around 180 words) of this round for a player who is still learning the game. Be specific about what happened using the data provided. Explain any mahjong terms briefly inline. Use plain conversational English, no bullet points.

Round ${summary.round} data:
- Winner: ${summary.winner} (${summary.outcome==="draw"?"wall ran out — draw":summary.outcome==="you"?"you melded out":"AI melded out"})
- Your score: ${summary.youScore} pts | AI score: ${summary.aiScore} pts
- Your melds: ${summary.youMelds} (${meldSummary(summary.youMeldTypes)})
- AI melds: ${summary.aiMelds} (${meldSummary(summary.aiMeldTypes)})
- Total turns taken: ${summary.turns}
- Move log (oldest first): ${summary.log.slice(0,30).join(" | ")}

Paragraph 1: Set the scene — how the round started, early moves.
Paragraph 2: The key turning point or tension — melds scored, discards, anything notable.
Paragraph 3: How it ended, what the player can learn from this round.`;

    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:400,
          messages:[{role:"user",content:prompt}],
        }),
      });
      const data = await resp.json();
      const text = (data.content||[]).map(b=>b.text||"").join("").trim();
      if(text){
        setRoundHistory(prev=>{
          const updated=[...prev];
          if(updated[histIdx]) updated[histIdx]={...updated[histIdx],narrative:text};
          return updated;
        });
        setLastRoundSummary(prev=>prev?{...prev,narrative:text}:prev);
      }
    } catch(e){
      // narrative stays null — handled gracefully in UI
    } finally {
      setNarrativeLoading(false);
    }
  }

  function startNextRound(){
    const nextRound = roundNum + 1;
    setRoundNum(nextRound);
    setShowRoundEnd(false);
    setPhase("idle");
    startNewGame(settings, nextRound);
  }

  function drawFromWall(){
    if(phase!=="playing"||current!==0) return;
    if(wall.length===0){setPhase("gameover");pushLog("Wall exhausted — draw.");finishRound("draw",players,roundTurnsRef.current);return;}
    setPlayers(prev=>{const cp=deepClone(prev);cp[0].hand.push(wall[wall.length-1]);cp[0].hand=sortTiles(cp[0].hand);return cp;});
    setWall(prev=>prev.slice(0,-1));
  }
  function toggleSelect(tile){setSelectedIds(prev=>{const s=new Set(prev);s.has(tile.id)?s.delete(tile.id):s.add(tile.id);return s;});}
  function getSelected(hand){return hand.filter(t=>selectedIds.has(t.id));}
  function removeFromHand(hand,tiles){const ids=new Set(tiles.map(t=>t.id));return hand.filter(t=>!ids.has(t.id));}

  function handleMeld(){
    const me=players[current];const sel=getSelected(me.hand);
    if(sel.length<3||sel.length>4){alert("Select 3 (Chow/Pung) or 4 (Kong).");return;}
    const res=classifyMeld(sel);if(!res.ok){alert("Not a valid meld.");return;}
    if(!me.opened&&res.points<(Number(settings.initialMeldPoints)||0)){alert(`First meld must be ≥ ${settings.initialMeldPoints} points.`);return;}
    const np=deepClone(players);const p=np[current];
    p.hand=removeFromHand(p.hand,sel);p.melds.push({tiles:sel,info:res});
    p.opened=p.opened||res.points>=(Number(settings.initialMeldPoints)||0);
    p.score+=res.points;p.hand=sortTiles(p.hand);
    setPlayers(np);setSelectedIds(new Set());
    pushLog(`${p.name} melded ${res.type.toUpperCase()} (+${res.points}).`);
    if(p.hand.length===0){setPhase("gameover");pushLog(`${p.name} wins by melding out!`);finishRound(current===0?"you":"ai",np,roundTurnsRef.current);}
  }

  function handleDiscard(tile){
    const me=players[current];
    if(!mustDiscard){alert("Draw first — hand must reach 14.");return;}
    const t=tile||getSelected(me.hand)[0];if(!t){alert("Select one tile to discard.");return;}
    const np=deepClone(players);np[current].hand=np[current].hand.filter(x=>x.id!==t.id);
    setPlayers(np);setDiscard(d=>[...d,t]);
    pushLog(`${me.name} discarded ${renderShort(t)}.`);endTurn((current+1)%2);
  }
  function handleDiscardButton(){
    if(current!==0){alert("Wait for your turn.");return;}
    const sel=getSelected(players[0].hand);
    if(sel.length!==1){alert("Select exactly one tile to discard.");return;}
    if(!mustDiscard){alert("Draw first — hand must reach 14.");return;}
    handleDiscard(sel[0]);
  }

  const claimBest=useMemo(()=>{
    if(discard.length===0||current!==0) return null;
    const top=discard[discard.length-1];
    let best=null;
    you.hand.forEach((a,i)=>you.hand.forEach((b,j)=>{
      if(i>=j) return;
      const res=classifyMeld([a,b,top]);
      if(res.ok){
        if(!you.opened&&res.points<(Number(settings.initialMeldPoints)||0)) return;
        if(!best||res.points>best.res.points) best={pair:[a,b],res};
      }
    }));
    return best;
  },[discard,you.hand,you.opened,settings.initialMeldPoints,current]);

  function claimDiscardForMeld(){
    if(!claimBest) return;
    const top=discard[discard.length-1];
    const res=classifyMeld([...claimBest.pair,top]);if(!res.ok) return;
    if(!you.opened&&res.points<(Number(settings.initialMeldPoints)||0)){alert(`First meld must be ≥ ${settings.initialMeldPoints} pts.`);return;}
    const np=deepClone(players);
    np[0].hand=removeFromHand(np[0].hand,claimBest.pair);
    np[0].melds.push({tiles:[...claimBest.pair,top],info:res});
    np[0].opened=np[0].opened||res.points>=(Number(settings.initialMeldPoints)||0);
    np[0].score+=res.points;np[0].hand=sortTiles(np[0].hand);
    setPlayers(np);setDiscard(d=>d.slice(0,-1));setSelectedIds(new Set());
    pushLog(`You claimed & melded ${res.type.toUpperCase()} (+${res.points}).`);
    if(np[0].hand.length===0){setPhase("gameover");pushLog("You win by melding out!");finishRound("you",np,roundTurnsRef.current);}
  }

  // AI turn
  useEffect(()=>{
    if(phase!=="playing"||current!==1||settings.practiceMode) return;
    const dd=settings.fastMode?120:400, md=settings.fastMode?90:300, xd=settings.fastMode?120:350;
    const t=setTimeout(()=>{
      if(wall.length===0){setPhase("gameover");pushLog("Wall exhausted — draw.");finishRound("draw",players,roundTurnsRef.current);return;}
      setPlayers(prev=>{const cp=deepClone(prev);cp[1].hand.push(wall[wall.length-1]);cp[1].hand=sortTiles(cp[1].hand);return cp;});
      setWall(prev=>prev.slice(0,-1));
      setTimeout(()=>{
        setPlayers(prev=>{const cp=deepClone(prev);const A=cp[1];
          const tiles=aiFindMeldToPlay(A.hand,A.opened,Number(settings.initialMeldPoints)||0);
          if(tiles){const r=classifyMeld(tiles);A.hand=removeFromHand(A.hand,tiles);A.melds.push({tiles,info:r});
            A.opened=A.opened||r.points>=(Number(settings.initialMeldPoints)||0);A.score+=r.points;A.hand=sortTiles(A.hand);
            pushLog(`AI melded ${r.type.toUpperCase()} (+${r.points}).`);
            if(A.hand.length===0){setPhase("gameover");pushLog("AI wins!");finishRound("ai",cp,roundTurnsRef.current);}}
          return cp;});
        setTimeout(()=>{
          setPlayers(prev=>{const cp=deepClone(prev);const A=cp[1];if(A.hand.length<=13)return cp;
            const d=aiChooseDiscard(A.hand,Number(settings.aiStrength)||4);
            A.hand=A.hand.filter(x=>x.id!==d.id);setDiscard(x=>[...x,d]);pushLog(`AI discarded ${renderShort(d)}.`);return cp;});
          endTurn(0);
        },xd);
      },md);
    },dd);
    return()=>clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[current,phase,settings.practiceMode,settings.fastMode]);

  const allMelds=useMemo(()=>enumerateAllMelds(you.hand),[you.hand]);
  const suggestedMelds=useMemo(()=>{
    const th=Number(settings.initialMeldPoints)||0;
    return(you.opened?allMelds:allMelds.filter(m=>m.info.points>=th)).slice(0,10);
  },[you.opened,allMelds,settings.initialMeldPoints]);
  const suggestedDiscards=useMemo(()=>{
    const ranked=you.hand.map(t=>({t,score:tileKeepScore(you.hand,t)})).sort((a,b)=>a.score-b.score);
    const out=[];for(const r of ranked){if(out.length>=3)break;if(!out.find(o=>o.t.id===r.t.id))out.push(r);}return out.map(x=>x.t);
  },[you.hand]);

  useEffect(()=>{
    if(!settings.shortcuts||phase!=="playing") return;
    const onKey=(e)=>{
      if(current!==0) return;
      const k=e.key.toLowerCase();
      if(k==="d") drawFromWall();
      else if(k==="m") handleMeld();
      else if(k==="x") handleDiscardButton();
      else if(k==="c") setSelectedIds(new Set());
      else if(k==="h"){const best=analyzeBestMelds(you.hand);if(best)setSelectedIds(new Set(best.tiles.map(t=>t.id)));}
    };
    window.addEventListener("keydown",onKey);
    return()=>window.removeEventListener("keydown",onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[settings.shortcuts,phase,current,players,selectedIds]);

  const handleQuit=()=>{ if(typeof onQuit==="function") onQuit(); else window.location.reload(); };

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{CSS}</style>
      <div className="mjv2" style={rootStyle}>

        {/* TOPBAR */}
        <header className="mjv2-bar">
          <button className="mjv2-btn dan" onClick={handleQuit}>← Quit</button>
          <div className="mjv2-bar-stat">
            <span>Wall: <strong>{wall.length}</strong></span>
            <span>Discards: <strong>{discard.length}</strong></span>
            <span>Turn: <strong>{players[current]?.name||"—"}</strong></span>
            <span>You: <strong>{you.score}pt</strong></span>
            <span>AI: <strong>{ai.score}pt</strong></span>
            {settings.campaignMode&&<span style={{color:"var(--acc,#c1440e)",fontWeight:700}}>
              Round {roundNum}/{settings.totalRounds||40}
            </span>}
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            <button className="mjv2-btn" onClick={openSetup}>Setup</button>
            <button className="mjv2-btn" onClick={()=>setShowHowTo(true)}>How to Play</button>
            <button className="mjv2-btn" onClick={()=>setShowRules(true)}>Rules</button>
            {roundHistory.length>0&&<button className="mjv2-btn" onClick={()=>setShowDiary(true)}>📖 Diary ({roundHistory.length})</button>}
            <button className="mjv2-btn" onClick={saveGame}>Save</button>
            <button className="mjv2-btn" onClick={loadGame}>Load</button>
          </div>
        </header>

        {/* BOARD */}
        <div className="mjv2-board">

          {/* Discard pile */}
          <section className="mjv2-sec mjv2-disc-section">
            <div className="mjv2-sec-hd">Discard Pile — top card rightmost</div>
            <div style={{display:"flex",flexDirection:"row",flexWrap:"wrap",gap:6,alignItems:"flex-end",padding:"4px 0",minHeight:54}}>
              {discard.map(t=><Tile key={t.id} tile={t} disabled titlePos="bottom" tileSet={settings.tileSet}/>)}
              {!discard.length&&<span style={{color:"var(--tx3)",fontStyle:"italic",fontSize:"0.82rem"}}>Empty</span>}
            </div>
            <div style={{marginTop:8}}>
              <button className="mjv2-btn" disabled={!claimBest} onClick={claimDiscardForMeld}>
                Claim Top Discard for Meld
              </button>
            </div>
          </section>

          {/* AI */}
          <section className="mjv2-sec">
            <div className="mjv2-sec-hd">AI Hand — {ai.hand.length} tiles</div>
            <div style={{display:"flex",flexDirection:"row",flexWrap:"wrap",gap:6,alignItems:"flex-end",padding:"4px 0"}}>
              {ai.hand.map(t=>(
                <div key={t.id} data-suit={t.suit} style={{
                  display:"flex",flexDirection:"column",
                  width:"var(--tile-w,52px)",height:"var(--tile-h,76px)",
                  flexShrink:0,flexGrow:0,flexBasis:"var(--tile-w,52px)",
                  background:"repeating-linear-gradient(45deg,var(--bg3,#ede8de) 0 5px,var(--brd,#d4ccbb) 5px 8px)",
                  border:"1.5px solid var(--brd2,#bfb8a8)",borderRadius:8,
                  opacity:.65,overflow:"hidden",boxSizing:"border-box",
                }}>
                  <div style={{height:17,flexShrink:0}}/>
                  <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",opacity:.3,fontSize:"1.1rem"}}>■</div>
                  <div style={{height:17,flexShrink:0}}/>
                </div>
              ))}
            </div>
            <MeldArea melds={ai.melds} name="AI Melds" tileSet={settings.tileSet}/>
            <div className="mjv2-score">AI Score: {ai.score}</div>
          </section>

          {/* Your hand */}
          <section className="mjv2-sec">
            <div className="mjv2-sec-hd">
              Your Hand — {you.hand.length} tiles
              {current===0&&phase==="playing"&&<span style={{marginLeft:8,color:"var(--acc)"}}>
                {mustDiscard?"● Select 1 tile → Discard":"● Draw a tile first"}
              </span>}
            </div>

            {/* HAND: all inline styles — immune to external CSS */}
            <div style={{
              display:"flex",flexDirection:"row",flexWrap:"wrap",
              gap:6,alignItems:"flex-end",
              minHeight:"calc(var(--tile-h,76px) + 12px)",
              padding:"4px 0",
            }}>
              {you.hand.map(t=>(
                <Tile key={t.id} tile={t}
                  selected={selectedIds.has(t.id)}
                  onClick={()=>toggleSelect(t)}
                  onDoubleClick={()=>mustDiscard&&handleDiscard(t)}
                  tileSet={settings.tileSet}
                />
              ))}
              {!you.hand.length&&<span style={{color:"var(--tx3,#a09585)",fontStyle:"italic"}}>No tiles</span>}
            </div>

            <div className="mjv2-ctrl">
              <button className="mjv2-btn pri" disabled={current!==0||mustDiscard} onClick={drawFromWall}>Draw [D]</button>
              <button className="mjv2-btn pri" disabled={current!==0||selectedCount!==1||!mustDiscard} onClick={handleDiscardButton}>Discard [X]</button>
              <button className="mjv2-btn"
                disabled={
                  current!==0||
                  !classifyMeld(getSelected(you.hand)).ok||
                  (!you.opened&&classifyMeld(getSelected(you.hand)).points<(Number(settings.initialMeldPoints)||0))
                }
                onClick={handleMeld}>Meld [M]</button>
              <button className="mjv2-btn sub" onClick={()=>setSelectedIds(new Set())}>Clear [C]</button>
              <button className="mjv2-btn sub" onClick={()=>{const b=analyzeBestMelds(you.hand);if(b)setSelectedIds(new Set(b.tiles.map(t=>t.id)));else alert("No obvious meld.");}}>Hint [H]</button>
            </div>

            <div className="mjv2-hint-txt">
              {current!==0&&"⏳ AI's turn…"}
              {current===0&&!mustDiscard&&`🃏 Draw a tile (hand has ${you.hand.length}, need 14).`}
              {current===0&&mustDiscard&&selectedCount===0&&"👉 Click a tile to select it, then press Discard."}
              {current===0&&mustDiscard&&selectedCount===1&&"✅ Ready — click Discard Selected or press X."}
              {current===0&&mustDiscard&&selectedCount>1&&`${selectedCount} tiles selected — for discard select exactly 1 (for meld select 3–4).`}
            </div>

            {/* Teaching aids */}
            <div style={{marginTop:12}}>
              <div className="mjv2-aid-hd">Teaching Aids</div>

              <div className="mjv2-aid-box">
                <h5>Possible Melds in Your Hand</h5>
                {suggestedMelds.length
                  ? suggestedMelds.map((m,i)=>(
                    <div className="mjv2-aid-meld" key={i}>
                      <span>{m.tiles.map(renderShort).join(" + ")} → {m.info.type.toUpperCase()} (+{m.info.points})</span>
                      <button className="mjv2-btn sub" onClick={()=>setSelectedIds(new Set(m.tiles.map(t=>t.id)))}>Select</button>
                    </div>
                  ))
                  : <p style={{fontSize:"0.8rem",color:"var(--tx3)"}}>No melds meeting threshold yet.</p>
                }
              </div>

              <div className="mjv2-aid-box">
                <h5>Suggested Discards (worst tiles)</h5>
                <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:4}}>
                  {suggestedDiscards.map((t,i)=>(
                    <button key={i} className="mjv2-btn sub" onClick={()=>setSelectedIds(new Set([t.id]))}>
                      {renderShort(t)} <span style={{opacity:.5}}>({tileKeepScore(you.hand,t)})</span>
                    </button>
                  ))}
                </div>
              </div>

              {claimBest&&current===0&&(
                <div className="mjv2-aid-box">
                  <h5>Claim Opportunity!</h5>
                  <p style={{fontSize:"0.82rem",marginBottom:6}}>
                    Top discard <strong>{renderShort(discard[discard.length-1])}</strong> + {claimBest.pair.map(renderShort).join(" + ")} → {claimBest.res.type.toUpperCase()} (+{claimBest.res.points})
                  </p>
                  <button className="mjv2-btn" onClick={()=>{setSelectedIds(new Set(claimBest.pair.map(t=>t.id)));setTimeout(claimDiscardForMeld,0);}}>
                    Claim &amp; Meld
                  </button>
                </div>
              )}
            </div>

            <MeldArea melds={you.melds} name="Your Melds" tileSet={settings.tileSet}/>
            <div className="mjv2-score">Your Score: {you.score}</div>
          </section>

          {/* Log */}
          <section className="mjv2-sec">
            <div className="mjv2-sec-hd">Game Log</div>
            <div className="mjv2-log">
              {!messageLog.length&&<div className="mjv2-log-ln" style={{color:"var(--tx3)"}}>No moves yet.</div>}
              {messageLog.map((m,i)=><div key={i} className="mjv2-log-ln">{m}</div>)}
            </div>
          </section>
        </div>

        {/* ── SETUP PANEL ── */}
        {showSetup&&(
          <div className="mjv2-back">
            <div className="mjv2-panel">
              <h2>Game Setup</h2>
              <div className="mjv2-pscroll">
                <div className="mjv2-pscroll-inner">
                  <div className="mjv2-form" style={{paddingTop:8,paddingBottom:12}}>

                    <label>AI Strength (1–8)
                      <input type="number" min="1" max="8" value={pending.aiStrength}
                        onChange={e=>setPending(s=>({...s,aiStrength:clampInt(e.target.value,1,8)}))}/>
                    </label>

                    <label>Initial Meld Points
                      <select value={pending.initialMeldPoints}
                        onChange={e=>setPending(s=>({...s,initialMeldPoints:clampInt(e.target.value,0,24)}))}>
                        {[0,3,4,6,8,10,12,16,20,24].map(v=><option key={v} value={v}>{v}</option>)}
                      </select>
                    </label>

                    <label className="mjv2-chkrow">Include Jokers
                      <input type="checkbox" checked={pending.includeJokers}
                        onChange={e=>setPending(s=>({...s,includeJokers:e.target.checked}))}/>
                    </label>

                    <label># Jokers (0–16)
                      <input type="number" min="0" max="16" value={pending.numJokers}
                        onChange={e=>setPending(s=>({...s,numJokers:clampInt(e.target.value,0,16)}))}/>
                    </label>

                    <label className="mjv2-chkrow">Practice Mode (no AI)
                      <input type="checkbox" checked={pending.practiceMode}
                        onChange={e=>setPending(s=>({...s,practiceMode:e.target.checked}))}/>
                    </label>

                    <label className="mjv2-chkrow">Fast AI Animations
                      <input type="checkbox" checked={pending.fastMode}
                        onChange={e=>setPending(s=>({...s,fastMode:e.target.checked}))}/>
                    </label>

                    <label className="mjv2-chkrow">Keyboard Shortcuts
                      <input type="checkbox" checked={pending.shortcuts}
                        onChange={e=>setPending(s=>({...s,shortcuts:e.target.checked}))}/>
                    </label>

                    <label>Tile Size ({pending.tileSize}px)
                      <input type="range" min="36" max="80" value={pending.tileSize}
                        onChange={e=>setPending(s=>({...s,tileSize:clampInt(e.target.value,36,80)}))}/>
                    </label>

                    <label style={{display:"flex",alignItems:"flex-end",gap:7}}>
                      <span style={{flex:"1 1 auto"}}>Tile Set</span>
                      <button type="button" className="mjv2-btn sub" onClick={()=>{
                        const r=CANVAS_THEMES[Math.floor(Math.random()*CANVAS_THEMES.length)];
                        setPending(s=>({...s,tileSet:r.value}));
                      }}>🎲 Random</button>
                    </label>
                    <select value={pending.tileSet} onChange={e=>setPending(s=>({...s,tileSet:e.target.value}))}>
                      <option value="symbols">Symbols (漢/竹/●)</option>
                      <option value="letters">Letters</option>
                      <option value="emoji">Emoji</option>
                      <option value="kanji">Kanji</option>
                      <option value="western">Western</option>
                      <option value="shapes">Shapes</option>
                      <option value="minimal">Minimal</option>
                      <option value="outline">Outline</option>
                      <option value="roman">Roman</option>
                      <option value="greek">Greek</option>
                      <option value="dots">Dots</option>
                      <option value="bars">Bars</option>
                      <option value="zodiac">Zodiac</option>
                      <option value="planets">Planets</option>
                      <option value="alchemy">Alchemy</option>
                      <option value="runes">Runes</option>
                      <option value="cards">Mini Cards</option>
                      <option value="photographic">Photographic (PNG)</option>
                      <option value="neon">Neon (PNG)</option>
                      <option value="circuit">Circuit (PNG)</option>
                      <option value="origami">Origami (PNG)</option>
                      {CANVAS_THEMES.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>

                    <label>Color Theme
                      <select value={pending.colorTheme} onChange={e=>setPending(s=>({...s,colorTheme:e.target.value}))}>
                        <option value="claudeHouse">Claude's House</option>
                        <option value="classic">Classic</option>
                        <option value="hiContrast">Hi-Contrast</option>
                        <option value="bambooNight">Bamboo Night</option>
                        <option value="pastel">Pastel</option>
                        <option value="neon">Neon</option>
                        <option value="desert">Desert</option>
                        <option value="sea">Sea</option>
                        <option value="mono">Mono</option>
                        <option value="custom">Custom…</option>
                      </select>
                    </label>

                    {pending.colorTheme==="custom"&&(
                      <div style={{gridColumn:"1/-1"}}>
                        <div className="mjv2-col-grid">
                          {["char","bamboo","dot","wind","dragon","joker"].map(k=>(
                            <ColorPicker key={k}
                              label={k[0].toUpperCase()+k.slice(1)}
                              value={pending.customColors?.[k]||"#000000"}
                              onChange={col=>setPending(s=>({...s,customColors:{...s.customColors,[k]:col}}))}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <label className="mjv2-chkrow">Remember settings
                      <input type="checkbox" checked={pending.rememberOptions}
                        onChange={e=>setPending(s=>({...s,rememberOptions:e.target.checked}))}/>
                    </label>

                  </div>
                </div>
              </div>

              {/* Campaign section — full width, outside the horizontal scroll area */}
              <div style={{padding:"12px 16px 0",borderTop:"1.5px solid var(--brd,#d4ccbb)"}}>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:"0.62rem",letterSpacing:".12em",textTransform:"uppercase",color:"var(--tx3,#a09585)",marginBottom:8}}>
                  Campaign Mode
                </div>
                <div style={{fontSize:"0.88rem",color:"var(--tx2,#6b6156)",lineHeight:1.7,marginBottom:12,background:"var(--bg2,#f4f0e8)",border:"1.5px solid var(--brd,#d4ccbb)",borderRadius:8,padding:"10px 14px"}}>
                  <strong>40 rounds, You vs AI, back to back.</strong> Each round is a complete independent game — fresh wall, fresh hands, your settings carry over throughout.
                  After every round a full breakdown appears: who won, meld types scored, turns taken, running win tallies and cumulative points.
                  At the end of all rounds a complete report covers win rates, average turns, your best and worst rounds, AI's best round, total melds by type for both sides, and a full round-by-round table with a totals row.
                  Set AI strength to 8 for a serious 40-round fight.
                </div>
                <div style={{display:"flex",gap:14,alignItems:"center",flexWrap:"wrap",marginBottom:4}}>
                  <label style={{display:"flex",alignItems:"center",gap:8,fontSize:"0.88rem",color:"var(--tx,#2a2520)",cursor:"pointer"}}>
                    <input type="checkbox" checked={pending.campaignMode}
                      onChange={e=>setPending(s=>({...s,campaignMode:e.target.checked}))}/>
                    Enable Campaign Mode
                  </label>
                  <label style={{display:"flex",alignItems:"center",gap:8,fontSize:"0.88rem",color:"var(--tx,#2a2520)"}}>
                    Rounds:
                    <select value={pending.totalRounds||40}
                      onChange={e=>setPending(s=>({...s,totalRounds:parseInt(e.target.value,10)}))}
                      disabled={!pending.campaignMode}
                      style={{padding:"4px 8px",border:"1.5px solid var(--brd,#d4ccbb)",borderRadius:5,background:"#fff",font:"inherit",fontSize:"0.85rem",color:"var(--tx,#2a2520)"}}>
                      {[10,20,30,40,50,60,80,100].map(v=><option key={v} value={v}>{v}</option>)}
                    </select>
                  </label>
                </div>
              </div>
              <div className="mjv2-pactions">
                <button className="mjv2-btn pri" onClick={applyAndStart}>▶ Apply &amp; Start New Game</button>
                <button className="mjv2-btn" onClick={applyOnly}>Apply</button>
                <button className="mjv2-btn sub" onClick={()=>setShowSetup(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* ── RULES ── */}
        {showRules&&(
          <div className="mjv2-back" onClick={()=>setShowRules(false)}>
            <div className="mjv2-panel" onClick={e=>e.stopPropagation()}>
              <h2>Rules — Simplified Mahjong</h2>
              <div className="mjv2-pscroll">
                <div className="mjv2-rule-wrap">
                  <p style={{marginBottom:10,fontSize:"0.88rem",lineHeight:1.6}}>Turn: <strong>Draw → (optional) Meld → Discard</strong>. First to meld out wins.</p>
                  <ul style={{paddingLeft:18,marginBottom:12,fontSize:"0.85rem",lineHeight:1.9}}>
                    <li><strong>Suits</strong>: Characters, Bamboo, Dots; Honors: Winds (E,S,W,N), Dragons (R,G,W); optional Jokers.</li>
                    <li><strong>Melds</strong>: Chow (1 pt), Pung (2 pts), Kong (8 pts). Jokers fill gaps.</li>
                    <li><strong>Opening Threshold</strong>: First meld must meet "Initial Meld Points".</li>
                    <li><strong>Claim</strong>: Top discard + 2 of your tiles = valid meld → you may claim it.</li>
                    <li><strong>Keys</strong>: D=Draw, M=Meld, X=Discard, C=Clear selection, H=Hint</li>
                  </ul>
                  <table className="mjv2-rtbl">
                    <thead><tr><th>Suit</th><th>Ranks</th><th>Meld types</th><th>Points</th><th>Tips</th></tr></thead>
                    <tbody>
                      {[
                        ["Characters","1–9","Chow/Pung/Kong","1/2/8","Build runs"],
                        ["Bamboo","1–9","Chow/Pung/Kong","1/2/8","Keep pairs"],
                        ["Dots","1–9","Chow/Pung/Kong","1/2/8","Watch gaps"],
                        ["Winds","E,S,W,N","Pung/Kong only","2/8","Triplets"],
                        ["Dragons","R,G,W","Pung/Kong only","2/8","Triplets"],
                        ["Joker","*","Wild (any gap)","—","Most flexible"],
                      ].map(([a,b,c,d,e])=><tr key={a}><td>{a}</td><td>{b}</td><td>{c}</td><td>{d}</td><td>{e}</td></tr>)}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="mjv2-pactions">
                <button className="mjv2-btn pri" onClick={()=>setShowRules(false)}>Close</button>
                <button className="mjv2-btn dan" onClick={()=>{setShowRules(false);handleQuit();}}>← Exit to Menu</button>
              </div>
            </div>
          </div>
        )}

        {/* ── GAME OVER (non-campaign or fallback) ── */}
        {phase==="gameover"&&!settings.campaignMode&&!showRoundEnd&&!showCampaignEnd&&(
          <div className="mjv2-go">
            <div className="mjv2-go-box">
              <h2>Game Over</h2>
              <p style={{fontSize:"0.88rem",color:"var(--tx2,#6b6156)",marginBottom:14}}>{messageLog[0]}</p>
              <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
                <button className="mjv2-btn pri" onClick={openSetup}>New Game</button>
                <button className="mjv2-btn dan" onClick={handleQuit}>← Quit</button>
              </div>
            </div>
          </div>
        )}

        {/* ── BETWEEN-ROUND MODAL ── */}
        {showRoundEnd&&lastRoundSummary&&(()=>{
          const s=lastRoundSummary;
          const total=settings.totalRounds||40;
          const youTotal=roundHistory.reduce((a,r)=>a+r.youScore,0);
          const aiTotal=roundHistory.reduce((a,r)=>a+r.aiScore,0);
          const youWins=roundHistory.filter(r=>r.outcome==="you").length;
          const aiWins=roundHistory.filter(r=>r.outcome==="ai").length;
          const draws=roundHistory.filter(r=>r.outcome==="draw").length;
          const meldLabel=t=>t==="pung"?"Pung":t==="kong"?"Kong":t==="chow"?"Chow":t;
          const meldSummary=(arr)=>{
            const counts={};arr.forEach(t=>{counts[t]=(counts[t]||0)+1;});
            return Object.entries(counts).map(([t,n])=>`${n}×${meldLabel(t)}`).join(", ")||"none";
          };
          return (
            <div className="mjv2-back" style={{justifyContent:"center",alignItems:"center"}}>
              <div style={{
                background:"var(--bg,#faf7f2)", border:"1.5px solid var(--brd,#d4ccbb)",
                borderRadius:12, padding:28, width:"min(580px,94vw)",
                maxHeight:"90vh", overflow:"auto",
                boxShadow:"0 20px 50px rgba(42,37,32,.2)",
              }}>
                {/* Round header */}
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:"0.65rem",letterSpacing:".12em",textTransform:"uppercase",color:"var(--tx3,#a09585)",marginBottom:6}}>
                  Round {s.round} of {total} Complete
                </div>
                <h2 style={{fontSize:"1.35rem",fontWeight:700,marginBottom:4,color:
                  s.outcome==="you"?"var(--acc,#c1440e)":s.outcome==="ai"?"var(--s-dot,#1d5fa8)":"var(--tx2,#6b6156)"}}>
                  {s.outcome==="you"?"🏆 You won this round!":s.outcome==="ai"?"🤖 AI won this round.":"🤝 Draw — wall exhausted."}
                </h2>

                {/* Round detail */}
                <div style={{background:"var(--bg2,#f4f0e8)",border:"1.5px solid var(--brd,#d4ccbb)",borderRadius:8,padding:"10px 14px",marginTop:12,fontSize:"0.84rem",lineHeight:1.8}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 20px"}}>
                    <div><strong>Your score:</strong> {s.youScore} pts</div>
                    <div><strong>AI score:</strong> {s.aiScore} pts</div>
                    <div><strong>Your melds:</strong> {s.youMelds} ({meldSummary(s.youMeldTypes)})</div>
                    <div><strong>AI melds:</strong> {s.aiMelds} ({meldSummary(s.aiMeldTypes)})</div>
                    <div><strong>Turns taken:</strong> {s.turns}</div>
                    <div><strong>Score diff:</strong> {s.youScore>s.aiScore?"+":""}{s.youScore-s.aiScore} (You vs AI)</div>
                  </div>
                </div>

                {/* Running campaign totals */}
                <div style={{marginTop:14,fontSize:"0.84rem",lineHeight:1.8}}>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:"0.61rem",letterSpacing:".1em",textTransform:"uppercase",color:"var(--tx3,#a09585)",marginBottom:5}}>
                    Campaign so far — {s.round} of {total} rounds
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"4px 14px",background:"var(--bg2,#f4f0e8)",border:"1.5px solid var(--brd,#d4ccbb)",borderRadius:8,padding:"10px 14px"}}>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontSize:"1.4rem",fontWeight:700,color:"var(--acc,#c1440e)"}}>{youWins}</div>
                      <div style={{fontSize:"0.72rem",color:"var(--tx2,#6b6156)"}}>Your wins</div>
                    </div>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontSize:"1.4rem",fontWeight:700,color:"var(--s-dot,#1d5fa8)"}}>{aiWins}</div>
                      <div style={{fontSize:"0.72rem",color:"var(--tx2,#6b6156)"}}>AI wins</div>
                    </div>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontSize:"1.4rem",fontWeight:700,color:"var(--tx2,#6b6156)"}}>{draws}</div>
                      <div style={{fontSize:"0.72rem",color:"var(--tx2,#6b6156)"}}>Draws</div>
                    </div>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontSize:"1.2rem",fontWeight:700,color:"var(--acc,#c1440e)"}}>{youTotal}</div>
                      <div style={{fontSize:"0.72rem",color:"var(--tx2,#6b6156)"}}>Your total pts</div>
                    </div>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontSize:"1.2rem",fontWeight:700,color:"var(--s-dot,#1d5fa8)"}}>{aiTotal}</div>
                      <div style={{fontSize:"0.72rem",color:"var(--tx2,#6b6156)"}}>AI total pts</div>
                    </div>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontSize:"1.2rem",fontWeight:700,color:"var(--tx,#2a2520)"}}>{total-s.round}</div>
                      <div style={{fontSize:"0.72rem",color:"var(--tx2,#6b6156)"}}>Rounds left</div>
                    </div>
                  </div>
                </div>

                {/* Mini history table — last 5 rounds */}
                {roundHistory.length>1&&(
                  <div style={{marginTop:14}}>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:"0.61rem",letterSpacing:".1em",textTransform:"uppercase",color:"var(--tx3,#a09585)",marginBottom:5}}>
                      Recent rounds
                    </div>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.78rem"}}>
                      <thead>
                        <tr style={{background:"var(--bg2,#f4f0e8)"}}>
                          {["Rd","Winner","Your pts","AI pts","Melds (You)","Melds (AI)","Turns"].map(h=>(
                            <th key={h} style={{border:"1px solid var(--brd,#d4ccbb)",padding:"4px 7px",textAlign:"left",fontWeight:600}}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {roundHistory.slice(-5).reverse().map(r=>(
                          <tr key={r.round} style={{background:r.round===s.round?"#fff8f5":"#fff"}}>
                            <td style={{border:"1px solid var(--brd,#d4ccbb)",padding:"3px 7px"}}>{r.round}</td>
                            <td style={{border:"1px solid var(--brd,#d4ccbb)",padding:"3px 7px",
                              color:r.outcome==="you"?"var(--acc,#c1440e)":r.outcome==="ai"?"var(--s-dot,#1d5fa8)":"var(--tx2,#6b6156)",fontWeight:600}}>
                              {r.winner}
                            </td>
                            <td style={{border:"1px solid var(--brd,#d4ccbb)",padding:"3px 7px"}}>{r.youScore}</td>
                            <td style={{border:"1px solid var(--brd,#d4ccbb)",padding:"3px 7px"}}>{r.aiScore}</td>
                            <td style={{border:"1px solid var(--brd,#d4ccbb)",padding:"3px 7px"}}>{r.youMelds} ({meldSummary(r.youMeldTypes)})</td>
                            <td style={{border:"1px solid var(--brd,#d4ccbb)",padding:"3px 7px"}}>{r.aiMelds} ({meldSummary(r.aiMeldTypes)})</td>
                            <td style={{border:"1px solid var(--brd,#d4ccbb)",padding:"3px 7px"}}>{r.turns}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Narrative */}
                <div style={{marginTop:14}}>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:"0.61rem",letterSpacing:".1em",textTransform:"uppercase",color:"var(--tx3,#a09585)",marginBottom:6}}>
                    Round story
                  </div>
                  <div style={{background:"#fffdf8",border:"1.5px solid var(--brd,#d4ccbb)",borderRadius:8,padding:"12px 14px",fontSize:"0.88rem",lineHeight:1.8,color:"var(--tx,#2a2520)",whiteSpace:"pre-wrap"}}>
                    {narrativeLoading&&!s.narrative&&(
                      <span style={{color:"var(--tx3,#a09585)",fontStyle:"italic"}}>✍️ Writing the story of this round…</span>
                    )}
                    {!narrativeLoading&&!s.narrative&&(
                      <span style={{color:"var(--tx3,#a09585)",fontStyle:"italic"}}>Story unavailable — check your connection.</span>
                    )}
                    {s.narrative&&s.narrative}
                  </div>
                </div>

                <div style={{display:"flex",gap:8,marginTop:18,justifyContent:"flex-end",flexWrap:"wrap"}}>
                  <button className="mjv2-btn pri" onClick={startNextRound}>
                    ▶ Round {s.round+1} of {total}
                  </button>
                  <button className="mjv2-btn" onClick={()=>{setShowRoundEnd(false);setShowDiary(true);}}>📖 Diary</button>
                  <button className="mjv2-btn" onClick={openSetup}>Settings</button>
                  <button className="mjv2-btn dan" onClick={handleQuit}>← Quit</button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── CAMPAIGN END MODAL ── */}
        {showCampaignEnd&&(()=>{
          const total=settings.totalRounds||40;
          const youTotal=roundHistory.reduce((a,r)=>a+r.youScore,0);
          const aiTotal=roundHistory.reduce((a,r)=>a+r.aiScore,0);
          const youWins=roundHistory.filter(r=>r.outcome==="you").length;
          const aiWins=roundHistory.filter(r=>r.outcome==="ai").length;
          const draws=roundHistory.filter(r=>r.outcome==="draw").length;
          const campaignWinner=youWins>aiWins?"You":aiWins>youWins?"AI":"Tied";
          const bestYouRound=roundHistory.reduce((b,r)=>r.youScore>b.youScore?r:b,roundHistory[0]);
          const bestAiRound=roundHistory.reduce((b,r)=>r.aiScore>b.aiScore?r:b,roundHistory[0]);
          const longestRound=roundHistory.reduce((b,r)=>r.turns>b.turns?r:b,roundHistory[0]);
          const shortestRound=roundHistory.reduce((b,r)=>r.turns<b.turns?r:b,roundHistory[0]);
          const avgTurns=Math.round(roundHistory.reduce((a,r)=>a+r.turns,0)/roundHistory.length);
          const meldLabel=t=>t==="pung"?"Pung":t==="kong"?"Kong":t==="chow"?"Chow":t;
          const meldSummary=(arr)=>{const counts={};arr.forEach(t=>{counts[t]=(counts[t]||0)+1;});return Object.entries(counts).map(([t,n])=>`${n}×${meldLabel(t)}`).join(", ")||"none";};
          const allYouMelds=roundHistory.flatMap(r=>r.youMeldTypes);
          const allAiMelds=roundHistory.flatMap(r=>r.aiMeldTypes);

          return (
            <div className="mjv2-back" style={{justifyContent:"center",alignItems:"center"}}>
              <div style={{
                background:"var(--bg,#faf7f2)",border:"1.5px solid var(--brd,#d4ccbb)",
                borderRadius:12,padding:28,width:"min(680px,96vw)",
                maxHeight:"92vh",overflow:"auto",
                boxShadow:"0 20px 50px rgba(42,37,32,.25)",
              }}>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:"0.65rem",letterSpacing:".12em",textTransform:"uppercase",color:"var(--tx3,#a09585)",marginBottom:6}}>
                  Campaign Complete — {total} Rounds
                </div>
                <h2 style={{fontSize:"1.5rem",fontWeight:700,marginBottom:4,color:
                  campaignWinner==="You"?"var(--acc,#c1440e)":campaignWinner==="AI"?"var(--s-dot,#1d5fa8)":"var(--tx2,#6b6156)"}}>
                  {campaignWinner==="You"?"🏆 You won the campaign!":campaignWinner==="AI"?"🤖 AI won the campaign.":"🤝 Campaign tied!"}
                </h2>
                <p style={{fontSize:"0.88rem",color:"var(--tx2,#6b6156)",marginBottom:14}}>
                  {total} rounds played — AI strength {settings.aiStrength}{settings.practiceMode?" (practice)":""}
                </p>

                {/* Big scoreboard */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
                  {[
                    {label:"Your wins",val:youWins,pct:`${Math.round(youWins/total*100)}%`,col:"var(--acc,#c1440e)"},
                    {label:"AI wins",val:aiWins,pct:`${Math.round(aiWins/total*100)}%`,col:"var(--s-dot,#1d5fa8)"},
                    {label:"Your total pts",val:youTotal,pct:`avg ${Math.round(youTotal/total)}/rd`,col:"var(--acc,#c1440e)"},
                    {label:"AI total pts",val:aiTotal,pct:`avg ${Math.round(aiTotal/total)}/rd`,col:"var(--s-dot,#1d5fa8)"},
                    {label:"Draws",val:draws,pct:`${Math.round(draws/total*100)}%`,col:"var(--tx2,#6b6156)"},
                    {label:"Avg turns/round",val:avgTurns,pct:"turns",col:"var(--tx,#2a2520)"},
                  ].map(({label,val,pct,col})=>(
                    <div key={label} style={{background:"var(--bg2,#f4f0e8)",border:"1.5px solid var(--brd,#d4ccbb)",borderRadius:8,padding:"10px 14px"}}>
                      <div style={{fontSize:"0.72rem",color:"var(--tx2,#6b6156)",marginBottom:2}}>{label}</div>
                      <div style={{fontSize:"1.5rem",fontWeight:700,color:col,lineHeight:1}}>{val}</div>
                      <div style={{fontSize:"0.72rem",color:"var(--tx3,#a09585)",marginTop:2}}>{pct}</div>
                    </div>
                  ))}
                </div>

                {/* Highlights */}
                <div style={{background:"var(--bg2,#f4f0e8)",border:"1.5px solid var(--brd,#d4ccbb)",borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:"0.83rem",lineHeight:1.9}}>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:"0.61rem",letterSpacing:".1em",textTransform:"uppercase",color:"var(--tx3,#a09585)",marginBottom:5}}>Highlights</div>
                  <div>🎯 Your best round: <strong>Rd {bestYouRound.round}</strong> — {bestYouRound.youScore} pts ({meldSummary(bestYouRound.youMeldTypes)})</div>
                  <div>🤖 AI's best round: <strong>Rd {bestAiRound.round}</strong> — {bestAiRound.aiScore} pts ({meldSummary(bestAiRound.aiMeldTypes)})</div>
                  <div>⚡ Shortest round: <strong>Rd {shortestRound.round}</strong> — {shortestRound.turns} turns</div>
                  <div>🐢 Longest round: <strong>Rd {longestRound.round}</strong> — {longestRound.turns} turns</div>
                  <div>🀄 Your melds total: {allYouMelds.length} ({meldSummary(allYouMelds)})</div>
                  <div>🤖 AI melds total: {allAiMelds.length} ({meldSummary(allAiMelds)})</div>
                </div>

                {/* Full round-by-round table */}
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:"0.61rem",letterSpacing:".1em",textTransform:"uppercase",color:"var(--tx3,#a09585)",marginBottom:5}}>
                  All {total} rounds
                </div>
                <div style={{overflowX:"auto",marginBottom:18}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.75rem",minWidth:500}}>
                    <thead>
                      <tr style={{background:"var(--bg2,#f4f0e8)"}}>
                        {["Rd","Winner","You","AI","Δ","Your melds","AI melds","Turns"].map(h=>(
                          <th key={h} style={{border:"1px solid var(--brd,#d4ccbb)",padding:"4px 7px",textAlign:"left",fontWeight:600}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {roundHistory.map(r=>(
                        <tr key={r.round} style={{background:r.outcome==="you"?"#fff8f5":r.outcome==="ai"?"#f5f8ff":"#fff"}}>
                          <td style={{border:"1px solid var(--brd,#d4ccbb)",padding:"3px 7px",fontWeight:600}}>{r.round}</td>
                          <td style={{border:"1px solid var(--brd,#d4ccbb)",padding:"3px 7px",
                            color:r.outcome==="you"?"var(--acc,#c1440e)":r.outcome==="ai"?"var(--s-dot,#1d5fa8)":"var(--tx2,#6b6156)",fontWeight:600}}>
                            {r.winner}
                          </td>
                          <td style={{border:"1px solid var(--brd,#d4ccbb)",padding:"3px 7px"}}>{r.youScore}</td>
                          <td style={{border:"1px solid var(--brd,#d4ccbb)",padding:"3px 7px"}}>{r.aiScore}</td>
                          <td style={{border:"1px solid var(--brd,#d4ccbb)",padding:"3px 7px",
                            color:r.youScore>=r.aiScore?"var(--acc,#c1440e)":"var(--s-dot,#1d5fa8)"}}>
                            {r.youScore>r.aiScore?"+":""}{r.youScore-r.aiScore}
                          </td>
                          <td style={{border:"1px solid var(--brd,#d4ccbb)",padding:"3px 7px"}}>{meldSummary(r.youMeldTypes)}</td>
                          <td style={{border:"1px solid var(--brd,#d4ccbb)",padding:"3px 7px"}}>{meldSummary(r.aiMeldTypes)}</td>
                          <td style={{border:"1px solid var(--brd,#d4ccbb)",padding:"3px 7px"}}>{r.turns}</td>
                        </tr>
                      ))}
                      {/* Totals row */}
                      <tr style={{background:"var(--bg2,#f4f0e8)",fontWeight:700}}>
                        <td style={{border:"1px solid var(--brd,#d4ccbb)",padding:"4px 7px"}} colSpan={2}>TOTAL</td>
                        <td style={{border:"1px solid var(--brd,#d4ccbb)",padding:"4px 7px",color:"var(--acc,#c1440e)"}}>{youTotal}</td>
                        <td style={{border:"1px solid var(--brd,#d4ccbb)",padding:"4px 7px",color:"var(--s-dot,#1d5fa8)"}}>{aiTotal}</td>
                        <td style={{border:"1px solid var(--brd,#d4ccbb)",padding:"4px 7px",color:youTotal>=aiTotal?"var(--acc,#c1440e)":"var(--s-dot,#1d5fa8)"}}>
                          {youTotal>aiTotal?"+":""}{youTotal-aiTotal}
                        </td>
                        <td style={{border:"1px solid var(--brd,#d4ccbb)",padding:"4px 7px"}}>{allYouMelds.length} melds</td>
                        <td style={{border:"1px solid var(--brd,#d4ccbb)",padding:"4px 7px"}}>{allAiMelds.length} melds</td>
                        <td style={{border:"1px solid var(--brd,#d4ccbb)",padding:"4px 7px"}}>{roundHistory.reduce((a,r)=>a+r.turns,0)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div style={{display:"flex",gap:8,justifyContent:"flex-end",flexWrap:"wrap"}}>
                  <button className="mjv2-btn pri" onClick={()=>{setShowCampaignEnd(false);setRoundNum(1);setRoundHistory([]);applyAndStart();}}>
                    ▶ Play Again
                  </button>
                  <button className="mjv2-btn" onClick={()=>{setShowCampaignEnd(false);setShowDiary(true);}}>📖 Full Diary</button>
                  <button className="mjv2-btn" onClick={openSetup}>Settings</button>
                  <button className="mjv2-btn dan" onClick={handleQuit}>← Quit</button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── CAMPAIGN DIARY MODAL ── */}
        {showDiary&&(
          <div className="mjv2-back" style={{justifyContent:"center",alignItems:"flex-start",paddingTop:20}}>
            <div style={{
              background:"var(--bg,#faf7f2)",border:"1.5px solid var(--brd,#d4ccbb)",
              borderRadius:12,width:"min(700px,96vw)",maxHeight:"92vh",
              display:"flex",flexDirection:"column",
              boxShadow:"0 20px 50px rgba(42,37,32,.22)",
            }}>
              {/* Header */}
              <div style={{padding:"18px 22px 12px",borderBottom:"1.5px solid var(--brd,#d4ccbb)",display:"flex",alignItems:"baseline",gap:12,flexWrap:"wrap"}}>
                <div>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:"0.62rem",letterSpacing:".12em",textTransform:"uppercase",color:"var(--tx3,#a09585)",marginBottom:3}}>
                    Campaign Diary
                  </div>
                  <h2 style={{fontSize:"1.2rem",fontWeight:700,color:"var(--tx,#2a2520)"}}>
                    {roundHistory.length} Round{roundHistory.length!==1?"s":""} Recorded
                  </h2>
                </div>
                <button className="mjv2-btn dan" style={{marginLeft:"auto"}} onClick={()=>setShowDiary(false)}>Close ✕</button>
              </div>

              {/* Scrollable entries */}
              <div style={{flex:1,overflowY:"auto",padding:"16px 22px"}}>
                {roundHistory.length===0&&(
                  <p style={{color:"var(--tx3,#a09585)",fontStyle:"italic",fontSize:"0.9rem"}}>No rounds played yet.</p>
                )}
                {[...roundHistory].reverse().map(r=>{
                  const meldLabel=t=>t==="pung"?"Pung":t==="kong"?"Kong":"Chow";
                  const meldSummary=arr=>{const c={};arr.forEach(t=>{c[t]=(c[t]||0)+1;});return Object.entries(c).map(([t,n])=>`${n}×${meldLabel(t)}`).join(", ")||"—";};
                  const outcomeColor=r.outcome==="you"?"var(--acc,#c1440e)":r.outcome==="ai"?"var(--s-dot,#1d5fa8)":"var(--tx2,#6b6156)";
                  return (
                    <div key={r.round} style={{marginBottom:24,paddingBottom:24,borderBottom:"1.5px solid var(--bg3,#ede8de)"}}>
                      {/* Round header */}
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,flexWrap:"wrap"}}>
                        <div style={{fontFamily:"'DM Mono',monospace",fontSize:"0.72rem",color:"var(--tx3,#a09585)"}}>ROUND {r.round}</div>
                        <div style={{fontWeight:700,fontSize:"1rem",color:outcomeColor}}>
                          {r.outcome==="you"?"🏆 You won":r.outcome==="ai"?"🤖 AI won":"🤝 Draw"}
                        </div>
                        <div style={{fontFamily:"'DM Mono',monospace",fontSize:"0.72rem",color:"var(--tx2,#6b6156)",marginLeft:"auto"}}>
                          {r.turns} turns · You {r.youScore}pt · AI {r.aiScore}pt
                        </div>
                      </div>

                      {/* Stats row */}
                      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"3px 16px",fontSize:"0.82rem",color:"var(--tx2,#6b6156)",background:"var(--bg2,#f4f0e8)",borderRadius:7,padding:"8px 12px",marginBottom:10}}>
                        <div>Your melds: <strong>{r.youMelds}</strong> ({meldSummary(r.youMeldTypes)})</div>
                        <div>AI melds: <strong>{r.aiMelds}</strong> ({meldSummary(r.aiMeldTypes)})</div>
                        <div>Your points: <strong style={{color:"var(--acc,#c1440e)"}}>{r.youScore}</strong></div>
                        <div>AI points: <strong style={{color:"var(--s-dot,#1d5fa8)"}}>{r.aiScore}</strong></div>
                      </div>

                      {/* AI Narrative */}
                      {r.narrative?(
                        <div style={{fontSize:"0.88rem",lineHeight:1.82,color:"var(--tx,#2a2520)",whiteSpace:"pre-wrap"}}>
                          {r.narrative}
                        </div>
                      ):(
                        <div style={{fontSize:"0.85rem",color:"var(--tx3,#a09585)",fontStyle:"italic"}}>
                          {narrativeLoading?"✍️ Generating story…":"Story unavailable."}
                        </div>
                      )}

                      {/* Move log toggle */}
                      <details style={{marginTop:8}}>
                        <summary style={{fontSize:"0.76rem",fontFamily:"'DM Mono',monospace",color:"var(--tx3,#a09585)",cursor:"pointer",userSelect:"none"}}>
                          View move log ({r.log?.length||0} entries)
                        </summary>
                        <div style={{marginTop:6,maxHeight:140,overflowY:"auto",background:"var(--bg2,#f4f0e8)",borderRadius:6,padding:"6px 10px",fontSize:"0.72rem",fontFamily:"'DM Mono',monospace",color:"var(--tx2,#6b6156)"}}>
                          {(r.log||[]).map((line,i)=><div key={i} style={{padding:"1px 0",borderBottom:"1px solid var(--bg3,#ede8de)"}}>{line}</div>)}
                        </div>
                      </details>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── HOW TO PLAY MODAL ── */}
        {showHowTo&&(
          <div className="mjv2-back" style={{justifyContent:"center",alignItems:"flex-start",paddingTop:16}}>
            <div style={{
              background:"var(--bg,#faf7f2)",border:"1.5px solid var(--brd,#d4ccbb)",
              borderRadius:12,width:"min(700px,96vw)",maxHeight:"94vh",
              display:"flex",flexDirection:"column",
              boxShadow:"0 20px 50px rgba(42,37,32,.22)",
            }}>
              {/* Header */}
              <div style={{padding:"16px 22px 0",borderBottom:"1.5px solid var(--brd,#d4ccbb)"}}>
                <div style={{display:"flex",alignItems:"center",marginBottom:12}}>
                  <div>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:"0.62rem",letterSpacing:".12em",textTransform:"uppercase",color:"var(--tx3,#a09585)",marginBottom:2}}>Beginner Guide</div>
                    <h2 style={{fontSize:"1.2rem",fontWeight:700,color:"var(--tx,#2a2520)"}}>How to Play Mahjong Tiles</h2>
                  </div>
                  <button className="mjv2-btn dan" style={{marginLeft:"auto"}} onClick={()=>setShowHowTo(false)}>Close ✕</button>
                </div>
                {/* Tabs */}
                <div style={{display:"flex",gap:0}}>
                  {[["rules","📖 How to Play"],["campaign","🏆 40-Round Campaign"]].map(([id,label])=>(
                    <button key={id} onClick={()=>setHowToTab(id)} style={{
                      padding:"8px 18px",border:"none",
                      borderBottom: howToTab===id ? "2.5px solid var(--acc,#c1440e)" : "2.5px solid transparent",
                      background:"none",fontFamily:"'Crimson Pro',Georgia,serif",fontSize:"0.95rem",
                      fontWeight: howToTab===id ? 700 : 400,
                      color: howToTab===id ? "var(--acc,#c1440e)" : "var(--tx2,#6b6156)",
                      cursor:"pointer",transition:"color .13s",
                    }}>{label}</button>
                  ))}
                </div>
              </div>

              <div style={{flex:1,overflowY:"auto",padding:"20px 24px",fontSize:"0.9rem",lineHeight:1.82,color:"var(--tx,#2a2520)"}}>

              {howToTab==="rules"&&(
                <>
                  <Section title="🀄 The goal">
                    Be the first to empty your hand by forming all your tiles into valid groups called <strong>melds</strong>. Think of it like Rummy but with tiles instead of cards.
                  </Section>

                  <Section title="🃏 The tiles">
                    You play with a wall of 136+ tiles divided into five types:
                    <ul style={{paddingLeft:20,marginTop:8,lineHeight:2}}>
                      <li><strong>Characters (文)</strong> — numbered 1–9, four copies each</li>
                      <li><strong>Bamboo (竹)</strong> — numbered 1–9, four copies each</li>
                      <li><strong>Dots (●)</strong> — numbered 1–9, four copies each</li>
                      <li><strong>Winds</strong> — East, South, West, North — four copies each. Honour tiles — can't form sequences.</li>
                      <li><strong>Dragons</strong> — Red, Green, White — four copies each. Also honour tiles.</li>
                      <li><strong>Jokers</strong> (optional) — wild tiles that substitute for anything in a meld.</li>
                    </ul>
                  </Section>

                  <Section title="🔄 Starting the game">
                    Open <strong>Setup</strong>, configure AI strength, jokers, initial meld points and tile set, then click <strong>▶ Apply &amp; Start New Game</strong>. Both you and the AI are dealt 13 tiles. You immediately draw one extra giving you 14 — your first turn begins right away.
                  </Section>

                  <Section title="🔄 Every turn — three steps">
                    <strong>Step 1 — Draw.</strong> Click <strong>Draw</strong> (or press <kbd>D</kbd>). You take the top tile from the wall. Your hand now has 14 tiles.<br/><br/>
                    <strong>Step 2 — Meld (optional).</strong> If 3 or 4 tiles in your hand form a valid group, select them by clicking (selected tiles lift upward), then click <strong>Meld</strong> (or press <kbd>M</kbd>). The tiles are removed from your hand and scored. You can meld multiple times in one turn.<br/><br/>
                    <strong>Step 3 — Discard.</strong> You must end your turn with 13 tiles. Click one tile to select it, then click <strong>Discard</strong> (or press <kbd>X</kbd>). It goes face-up on the discard pile and the AI's turn begins.
                  </Section>

                  <Section title="🏆 The three types of melds">
                    <div style={{overflowX:"auto",marginTop:8}}>
                      <table style={{borderCollapse:"collapse",width:"100%",fontSize:"0.85rem"}}>
                        <thead><tr style={{background:"var(--bg2,#f4f0e8)"}}>
                          {["Meld","What it is","Points","Example"].map(h=><th key={h} style={{border:"1px solid var(--brd,#d4ccbb)",padding:"6px 10px",textAlign:"left"}}>{h}</th>)}
                        </tr></thead>
                        <tbody>
                          <tr><td style={td}>Chow</td><td style={td}>3 consecutive tiles, same suit</td><td style={td}>1 pt</td><td style={td}>4, 5, 6 Bamboo</td></tr>
                          <tr><td style={td}>Pung</td><td style={td}>3 identical tiles</td><td style={td}>2 pts</td><td style={td}>three East Winds</td></tr>
                          <tr><td style={td}>Kong</td><td style={td}>4 identical tiles</td><td style={td}>8 pts</td><td style={td}>four Red Dragons</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <p style={{marginTop:10,color:"var(--tx2,#6b6156)"}}>Winds and Dragons can't form Chows — only Pungs and Kongs. Jokers can fill any missing tile: 3 Dot + Joker + 5 Dot = a valid Chow.</p>
                  </Section>

                  <Section title="🚪 The Opening Threshold">
                    If set above 0 (default <strong>6 points</strong>), your very first meld must score at least that many points. A single Chow (1 pt) isn't enough to open — you need at least a Pung (2 pts) or a combination. Once you've made your first qualifying meld you're "opened" and can meld anything. The AI follows the same rule.
                  </Section>

                  <Section title="🎯 Claiming a discard">
                    After the AI discards, check the Teaching Aids panel. If a <strong>Claim Opportunity</strong> appears, that discarded tile + two tiles in your hand form a valid meld. Click <strong>Claim &amp; Meld</strong> to grab it before drawing from the wall. This can completely change a round.
                  </Section>

                  <Section title="💡 Teaching Aids panel">
                    <ul style={{paddingLeft:20,lineHeight:2,marginTop:6}}>
                      <li><strong>Possible Melds</strong> — every valid meld hiding in your current hand. Click Select to highlight, then Meld.</li>
                      <li><strong>Suggested Discards</strong> — the 3 tiles your hand can most afford to lose. Click to select, then Discard.</li>
                      <li><strong>Claim Opportunity</strong> — appears when the AI's last discard completes a meld with your tiles. Don't miss it.</li>
                      <li><strong>Hint</strong> (press <kbd>H</kbd>) — highlights your single best available meld.</li>
                    </ul>
                  </Section>

                  <Section title="🏁 Winning a round">
                    Win by <strong>melding out</strong> — getting your entire hand into melds with nothing left. If the wall runs out first it's a <strong>draw</strong> — no points, campaign continues.
                  </Section>

                  <Section title="⚡ Strategy tips">
                    <ul style={{paddingLeft:20,lineHeight:2,marginTop:6}}>
                      <li>Keep pairs and near-sequences — 6 and 7 Bamboo together are one draw away from a Chow.</li>
                      <li>Discard isolated honour tiles early — a lone Wind with no partners just wastes a slot.</li>
                      <li>Watch AI discards — if it gives you something you needed, claim it immediately.</li>
                      <li>Never discard a Joker. Ever. It fills any gap in any meld.</li>
                      <li>Kongs are devastating — 8 points from four identical tiles. Play one whenever you can.</li>
                      <li>When the wall drops below 20 tiles, discard aggressively rather than waiting for the perfect meld.</li>
                    </ul>
                  </Section>

                  <Section title="⌨️ Keyboard shortcuts">
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:"0.82rem",lineHeight:2.2,color:"var(--tx2,#6b6156)"}}>
                      <div><kbd style={kbdStyle}>D</kbd> Draw a tile &nbsp;&nbsp; <kbd style={kbdStyle}>M</kbd> Meld selected &nbsp;&nbsp; <kbd style={kbdStyle}>X</kbd> Discard selected</div>
                      <div><kbd style={kbdStyle}>C</kbd> Clear selection &nbsp;&nbsp; <kbd style={kbdStyle}>H</kbd> Hint</div>
                    </div>
                  </Section>
                </>
              )}

              {howToTab==="campaign"&&(
                <>
                  <Section title="🌱 Rounds 1–5 — Finding Your Feet">
                    Round 1 is disorienting. You have 14 tiles, most of them strangers to each other. The AI draws quietly on the other side. You'll probably discard a lone Dragon or a Wind tile with no partners — good instinct. The AI at strength 4 plays solidly but not brilliantly; it too is sorting out its hand.
                    <br/><br/>
                    By Round 2 you start noticing patterns. That 7 and 8 of Bamboo you kept? Draw a 6 or 9 and you have a Chow. The Teaching Aids panel becomes your best friend — check <strong>Possible Melds</strong> every turn before you discard.
                    <br/><br/>
                    Rounds 3 and 4 are where the opening threshold bites. If it's set to 6 points you can't open with a single Chow (1 pt) — you need a Pung (2 pts) or accumulate multiple melds in one turn. The AI faces the same rule. Rounds sometimes end as draws because neither side can open fast enough and the wall runs out.
                    <br/><br/>
                    Round 5: you likely have your first win or loss, a feel for the discard pace, and a growing sense of which tiles to keep. Campaign score is close — this is normal.
                  </Section>

                  <Section title="⚔️ Rounds 6–12 — Learning the AI's Habits">
                    The AI at strength 4 discards the lowest-scoring tile in its hand each turn — isolated tiles with no sequence or pair potential go first. You'll start to notice it dumps honour tiles (Winds, Dragons) early if they're unpaired. When it discards an East Wind, ask yourself: do I have two East Winds already? If yes, that's a free Pung claim.
                    <br/><br/>
                    Round 7 or 8 is often where you get your first Claim. The AI discards something you needed, the gold banner appears in Teaching Aids. You grab it, the tiles vanish into a meld, and suddenly you're two tiles lighter and 2 points richer without drawing from the wall. Enormously satisfying.
                    <br/><br/>
                    By Round 10 you've seen the full range of outcomes: quick wins, exhausting draws, and rounds that dragged to near-depletion. The Diary entries from the AI tell these stories in prose — worth reading back to spot patterns in your play.
                  </Section>

                  <Section title="🔥 Rounds 13–20 — Mid-Campaign Pressure">
                    This is where the campaign feels real. You have a win/loss record. If you're behind, there's urgency. If you're ahead, there's something to protect.
                    <br/><br/>
                    Round 15 is a good moment to raise AI strength to 5 or 6 in Setup if you're consistently winning. Higher strength means the AI's discard choices get smarter — it starts protecting near-complete sequences rather than dumping them.
                    <br/><br/>
                    The Kong becomes your obsession around this stretch. Eight points from a single meld is enormous. If you have three 9-Characters and draw the fourth, don't hesitate — play the Kong immediately. That one move might be the margin of victory for the whole round.
                    <br/><br/>
                    Watch your wall counter in rounds 18–19. When it drops below 20 tiles shift strategy toward discarding more aggressively rather than holding for the perfect meld.
                  </Section>

                  <Section title="🧩 Rounds 21–28 — The Strategic Middle">
                    By Round 21 you understand the rhythm: Draw → scan Teaching Aids → meld if valid → discard the weakest tile → repeat. The question now is subtlety — <em>which</em> weak tile?
                    <br/><br/>
                    The Suggested Discards tool scores tiles by isolation. A score of 0 means nothing in your hand connects to it. A score of 6 or 8 means it sits inside a dense cluster — throwing it away would hurt your sequences. Trust the scores but use your judgment too.
                    <br/><br/>
                    Jokers (if enabled) feel like a second currency by now. One Joker means any sequence you're one tile short of — you already have it. <strong>Never discard a Joker for any reason whatsoever.</strong>
                    <br/><br/>
                    Rounds 25–28 often produce your highest-scoring rounds. Both sides know what they're doing — melds come faster, fewer tiles hit the discard pile before someone closes. A round where you score two Pungs and a Chow in quick succession before the AI even opens feels like clockwork.
                  </Section>

                  <Section title="🌊 Rounds 29–34 — Late Campaign Swings">
                    This is where momentum can shift sharply. A string of three AI wins in rounds 29–31 can close a 6-round gap in the standings. The AI isn't getting smarter — but you may be fatiguing, making slightly worse discard decisions, missing claim opportunities.
                    <br/><br/>
                    Keep checking Teaching Aids. In long sessions the claim opportunity is the most commonly missed feature. After every AI discard, glance at the panel bottom. If the Claim Opportunity box is there, that's free points on the table.
                    <br/><br/>
                    Round 32 or 33 is typically the longest round of the whole campaign — both hands well-built, wall grinding down to single digits, neither player able to finish. A draw here with 4 tiles left in the wall feels dramatic. The Diary will write this one well.
                    <br/><br/>
                    The score difference at Round 33 is usually 3–8 points (cumulative win count). It genuinely comes down to the final rounds.
                  </Section>

                  <Section title="🏁 Rounds 35–40 — The Final Fight">
                    Every round matters now. Round 35 — you play more carefully, hold tiles longer, watch for claims. Round 36 — the AI plays a Kong (8 points!) and wins by melding out, eating into your lead.
                    <br/><br/>
                    Round 37 is often the pivot. Win this and you carry real momentum into 38–40. Lose it and you need to sweep the last three to equalise.
                    <br/><br/>
                    Rounds 38 and 39 are high tension. The wall feels faster — you're both playing aggressively, discarding quickly, going for melds rather than waiting for ideals. One bad discard — giving the AI a tile it needed for a Pung — can cost the round.
                    <br/><br/>
                    <strong>Round 40: the final.</strong> Whatever the score gap, this round feels different. Play it the same way you've played every other — Draw, scan, meld if valid, discard the weakest tile, claim if the opportunity appears. The only mistake you can make is playing nervously.
                  </Section>

                  <Section title="📊 After Round 40 — The Campaign Report">
                    The final screen shows everything: who won the campaign by round wins and total points, your win rate as a percentage, your best and worst rounds, AI's best round, shortest and longest rounds by turns, total melds by type for both sides, a complete round-by-round table with scores, delta and meld breakdown, and a totals row at the bottom.
                    <br/><br/>
                    The <strong>📖 Diary</strong> button lets you read the AI-written narrative of every single round — 40 stories, from your first confused discard to the final tile.
                  </Section>

                  <Section title="🎯 Quick campaign targets">
                    <div style={{overflowX:"auto",marginTop:8}}>
                      <table style={{borderCollapse:"collapse",width:"100%",fontSize:"0.85rem"}}>
                        <thead><tr style={{background:"var(--bg2,#f4f0e8)"}}>
                          <th style={td}>Target</th><th style={td}>What it means</th>
                        </tr></thead>
                        <tbody>
                          {[
                            ["Win 20+ of 40 rounds","You beat the AI overall"],
                            ["Score a Kong in 10+ rounds","You're spotting 4-of-a-kind consistently"],
                            ["Make 3+ claims across the campaign","You're watching discards well"],
                            ["Average under 25 turns per round","You're closing hands efficiently"],
                            ["Win Round 40","The only one that feels like it counts"],
                          ].map(([a,b])=><tr key={a}><td style={td}>{a}</td><td style={td}>{b}</td></tr>)}
                        </tbody>
                      </table>
                    </div>
                  </Section>
                </>
              )}

              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
