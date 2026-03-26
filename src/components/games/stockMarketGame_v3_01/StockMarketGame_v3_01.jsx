import React, { useState, useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────
   CONSTANTS & DATA
───────────────────────────────────────────── */
const TICK_MS = 2800;

const INITIAL_STOCKS = [
  { id: 'TECH',   name: 'Tech Innovations',  price: 150.00, sector: 'Technology',  dividend: 0.3 },
  { id: 'AUTO',   name: 'Global Automotive', price: 25.50,  sector: 'Industrial',  dividend: 0.5 },
  { id: 'FOOD',   name: 'Gourmet Foods Co.', price: 75.25,  sector: 'Staples',     dividend: 0.6 },
  { id: 'PHARMA', name: 'Pharma Solutions',  price: 90.00,  sector: 'Healthcare',  dividend: 0.4 },
  { id: 'ENERGY', name: 'Green Energy Corp', price: 45.75,  sector: 'Energy',      dividend: 0.8 },
];

const AI_NAMES  = ['Apex AI', 'NovaTrade', 'OracleBot', 'MarketMind', 'VectorQ', 'SigmaBot', 'QuantumFX', 'AlphaEdge'];
const AI_STYLES = ['Conservative', 'Speculator', 'Balanced'];

const REGIMES = {
  Calm:        { trend: 0.00, vol: 0.8,  note: 'Steady market.' },
  Bull:        { trend: 0.07, vol: 1.0,  note: 'Upward drift.' },
  Bear:        { trend: -0.07, vol: 1.1, note: 'Downward pressure.' },
  'Vol Spike': { trend: 0.00, vol: 2.0,  note: 'Wild swings.' },
};

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const fmt   = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtInt= (n) => Math.round(n).toLocaleString('en-US');
const pick  = (arr) => arr[Math.floor(Math.random() * arr.length)];

function sparkPath(data, w = 100, h = 32, pad = 3) {
  if (!data || data.length < 2) return '';
  const min = Math.min(...data), max = Math.max(...data);
  const span = max - min || 1;
  const stepX = (w - pad * 2) / (data.length - 1);
  return data.map((v, i) => {
    const x = pad + i * stepX;
    const y = h - pad - ((v - min) / span) * (h - pad * 2);
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function StockMarketGame_v3_01() {
  /* Setup */
  const [screen, setScreen]         = useState('setup'); // setup | game | end
  const [initialMoney, setInitialMoney] = useState(10000);
  const [aiCount, setAiCount]       = useState(3);
  const [difficulty, setDifficulty] = useState(4);
  const [regimeName, setRegimeName] = useState('Calm');
  const [showRules, setShowRules]   = useState(false);

  /* Game state */
  const [tick, setTick]             = useState(0);
  const [running, setRunning]       = useState(false);
  const [stocks, setStocks]         = useState(() => INITIAL_STOCKS.map(s => ({ ...s })));
  const [priceHist, setPriceHist]   = useState(() => {
    const h = {}; INITIAL_STOCKS.forEach(s => { h[s.id] = [s.price]; }); return h;
  });
  const [news, setNews]             = useState([]);
  const [players, setPlayers]       = useState([]);
  const [tab, setTab]               = useState('market'); // market | portfolio | players | leaderboard
  const [selectedStock, setSelectedStock] = useState(null);
  const [buyQtyInput, setBuyQtyInput]   = useState(1);
  const [sellQtyInput, setSellQtyInput] = useState(1);
  const [flash, setFlash]           = useState({}); // { stockId: 'up'|'down' }

  const tickRef = useRef(0);
  tickRef.current = tick;

  /* ── Start Game ── */
  const startGame = () => {
    const n = clamp(Math.floor(aiCount), 1, 8);
    const cash = Math.max(500, Math.floor(initialMoney));
    const human = { name: 'You', role: 'Human', cash, portfolio: {}, wealthHist: [cash] };
    const ais = Array.from({ length: n }, (_, i) => ({
      name: AI_NAMES[i], role: AI_STYLES[i % 3], cash, portfolio: {}, wealthHist: [cash]
    }));
    setPlayers([human, ...ais]);
    setStocks(INITIAL_STOCKS.map(s => ({ ...s })));
    setPriceHist(() => { const h = {}; INITIAL_STOCKS.forEach(s => { h[s.id] = [s.price]; }); return h; });
    setNews([]);
    setTick(0);
    setTab('market');
    setSelectedStock(INITIAL_STOCKS[0].id);
    setScreen('game');
    setTimeout(() => setRunning(true), 200);
  };

  /* ── Tick Engine ── */
  useEffect(() => {
    if (!running || screen !== 'game') return;
    const id = setInterval(() => {
      const regime = REGIMES[regimeName] || REGIMES['Calm'];
      const newFlash = {};

      setStocks(prev => prev.map(s => {
        const rand  = (Math.random() - 0.5) * regime.vol * 6;
        const drift = regime.trend * s.price * 0.02;
        const delta = rand + drift;
        const np    = Math.max(0.5, s.price + delta);
        newFlash[s.id] = delta >= 0 ? 'up' : 'down';
        return { ...s, prev: s.price, price: parseFloat(np.toFixed(2)) };
      }));

      setPriceHist(prev => {
        const next = { ...prev };
        setStocks(cur => {
          cur.forEach(s => { next[s.id] = [...(prev[s.id] || [s.price]).slice(-80), s.price]; });
          return cur;
        });
        return next;
      });

      setFlash(newFlash);
      setTimeout(() => setFlash({}), 600);

      // Dividends + AI trades
      setPlayers(prev => {
        const arr = prev.map(p => ({ ...p, portfolio: { ...p.portfolio } }));
        // dividends for all
        arr.forEach(p => {
          INITIAL_STOCKS.forEach(s => {
            const qty = p.portfolio[s.id] || 0;
            if (qty > 0) p.cash += qty * s.dividend;
          });
        });
        // AI trades
        for (let i = 1; i < arr.length; i++) {
          aiTrade(arr[i], i);
        }
        // wealth trail
        return arr.map(p => ({
          ...p,
          wealthHist: [...(p.wealthHist || [p.cash]).slice(-80), totalWealth(p, getLatestPrices())]
        }));
      });

      // Random news
      if (Math.random() < 0.2) spawnNews();

      setTick(t => t + 1);
    }, TICK_MS);
    return () => clearInterval(id);
  // eslint-disable-next-line
  }, [running, screen, regimeName]);

  /* helpers needing closure over stocks */
  const getLatestPrices = () => {
    const m = {}; stocks.forEach(s => { m[s.id] = s.price; }); return m;
  };
  function totalWealth(p, priceMap) {
    const pm = priceMap || getLatestPrices();
    return p.cash + Object.entries(p.portfolio || {}).reduce((sum, [id, qty]) => sum + qty * (pm[id] || 0), 0);
  }
  function holdingsValue(p) {
    return Object.entries(p.portfolio || {}).reduce((sum, [id, qty]) => sum + qty * (stocks.find(s => s.id === id)?.price || 0), 0);
  }

  function aiTrade(player, idx) {
    if (Math.random() > 0.55) return;
    const s = pick(stocks);
    const smartness = difficulty / 8;
    const isSmart   = Math.random() < smartness;
    const initialPrice = INITIAL_STOCKS.find(x => x.id === s.id)?.price || s.price;
    const shouldBuy = isSmart ? s.price < initialPrice * 1.05 : Math.random() > 0.5;

    if (shouldBuy) {
      const cost = s.price * 1;
      if (player.cash >= cost) {
        player.cash -= cost;
        player.portfolio[s.id] = (player.portfolio[s.id] || 0) + 1;
      }
    } else {
      const qty = player.portfolio[s.id] || 0;
      if (qty > 0) {
        player.cash += s.price;
        player.portfolio[s.id] = qty - 1;
        if (player.portfolio[s.id] === 0) delete player.portfolio[s.id];
      }
    }
  }

  function spawnNews() {
    const s = pick(stocks);
    const templates = [
      { text: `${s.name} beats quarterly earnings`, impact: 'pos' },
      { text: `${s.name} faces regulatory probe`, impact: 'neg' },
      { text: `Analysts upgrade ${s.id} to Strong Buy`, impact: 'pos' },
      { text: `Supply chain issues hit ${s.name}`, impact: 'neg' },
      { text: `${s.sector} sector shows resilience`, impact: 'pos' },
      { text: `Fed signals rate hold — markets breathe`, impact: 'neu' },
      { text: `Global volatility spikes on macro data`, impact: 'neg' },
    ];
    const item = pick(templates);
    setNews(n => [{ id: Math.random().toString(36).slice(2), ...item, stock: s.id, ts: Date.now() }, ...n].slice(0, 20));
  }

  /* ── Human Trades ── */
  const humanBuy = (stockId, qty = 1) => {
    const s = stocks.find(x => x.id === stockId);
    if (!s) return;
    const cost = s.price * qty;
    setPlayers(prev => {
      const arr = [...prev];
      const p = { ...arr[0], portfolio: { ...arr[0].portfolio } };
      if (p.cash < cost) { alert('Not enough cash!'); return prev; }
      p.cash -= cost;
      p.portfolio[stockId] = (p.portfolio[stockId] || 0) + qty;
      arr[0] = p; return arr;
    });
  };
  const humanSell = (stockId, qty = 1) => {
    const s = stocks.find(x => x.id === stockId);
    if (!s) return;
    setPlayers(prev => {
      const arr = [...prev];
      const p = { ...arr[0], portfolio: { ...arr[0].portfolio } };
      if ((p.portfolio[stockId] || 0) < qty) { alert('Not enough shares!'); return prev; }
      p.cash += s.price * qty;
      p.portfolio[stockId] -= qty;
      if (p.portfolio[stockId] === 0) delete p.portfolio[stockId];
      arr[0] = p; return arr;
    });
  };

  /* ── Derived ── */
  const human = players[0];
  const humanNetWorth = human ? totalWealth(human) : 0;
  const sorted = [...players].sort((a, b) => totalWealth(b) - totalWealth(a));
  const humanRank = sorted.findIndex(p => p.name === 'You') + 1;

  const selStock = stocks.find(s => s.id === selectedStock);

  /* ─────────────────────────────────────────────
     RENDER — SETUP
  ───────────────────────────────────────────── */
  if (screen === 'setup') return (
    <div style={S.root}>
      <style>{CSS}</style>
      <div style={S.setupWrap}>
        <div style={S.setupCard}>
          <div style={S.setupLogo}>
            <span style={S.logoMark}>↗</span>
            <div>
              <div style={S.setupTitle}>Stock Market</div>
              <div style={S.setupSub}>Trading Simulator v3</div>
            </div>
          </div>

          <div style={S.fieldGrid}>
            <Field label="Starting Capital ($)">
              <input style={S.input} type="number" value={initialMoney}
                onChange={e => setInitialMoney(Math.max(500, parseInt(e.target.value) || 500))} min="500" />
            </Field>
            <Field label="AI Opponents (1–8)">
              <input style={S.input} type="number" value={aiCount}
                onChange={e => setAiCount(clamp(parseInt(e.target.value) || 1, 1, 8))} min="1" max="8" />
            </Field>
            <Field label={`AI Difficulty — ${['','Easy','','','Medium','','','','Hard'][difficulty] || difficulty}`}>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <input style={{ flex:1 }} type="range" value={difficulty}
                  onChange={e => setDifficulty(parseInt(e.target.value))} min="1" max="8" />
                <span style={{ width:20, textAlign:'center', fontWeight:700, color:'#1a3055' }}>{difficulty}</span>
              </div>
            </Field>
            <Field label="Market Regime">
              <select style={S.input} value={regimeName} onChange={e => setRegimeName(e.target.value)}>
                {Object.keys(REGIMES).map(k => <option key={k}>{k}</option>)}
              </select>
            </Field>
          </div>

          <p style={S.regimeNote}>{REGIMES[regimeName]?.note}</p>

          <div style={{ display:'flex', gap:10, marginTop:4 }}>
            <button style={S.btnPrimary} onClick={startGame}>Start Trading →</button>
            <button style={S.btnGhost} onClick={() => setShowRules(true)}>Rules</button>
          </div>
        </div>
      </div>
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </div>
  );

  /* ─────────────────────────────────────────────
     RENDER — GAME
  ───────────────────────────────────────────── */
  return (
    <div style={S.root}>
      <style>{CSS}</style>

      {/* TOP BAR */}
      <header style={S.topBar}>
        <div style={S.topLeft}>
          <span style={S.logoSmall}>↗ StockSim v3</span>
          <span style={S.tickBadge}>Tick {tick}</span>
          <span style={{ ...S.regimePill, background: regimeName === 'Bull' ? '#dcfce7' : regimeName === 'Bear' ? '#fee2e2' : regimeName === 'Vol Spike' ? '#fef9c3' : '#e0f2fe' }}>
            {regimeName}
          </span>
        </div>
        <div style={S.topRight}>
          {human && (
            <div style={S.netWorthBar}>
              <span style={S.nwLabel}>Net Worth</span>
              <span style={S.nwVal}>${fmtInt(humanNetWorth)}</span>
              <span style={S.nwRank}>#{humanRank}</span>
            </div>
          )}
          <button style={S.btnSm} onClick={() => setRunning(r => !r)}>
            {running ? '⏸' : '▶'} {running ? 'Pause' : 'Play'}
          </button>
          <button style={{ ...S.btnSm, color:'#dc2626' }} onClick={() => setScreen('setup')}>✕ Quit</button>
        </div>
      </header>

      {/* TABS */}
      <nav style={S.tabRow}>
        {['market','portfolio','players','leaderboard'].map(t => (
          <button key={t} style={tab === t ? S.tabOn : S.tabOff} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
        <button style={S.tabOff} onClick={() => setShowRules(true)}>Rules</button>
      </nav>

      {/* ── MARKET TAB ── */}
      {tab === 'market' && (
        <div style={S.mainGrid}>
          {/* Left: stock list + news */}
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

            {/* Stock Table */}
            <div style={S.card}>
              <div style={S.cardHead}>Market Overview</div>
              <table style={S.table}>
                <thead>
                  <tr>
                    {['Symbol','Name','Price','Chg','Sparkline',''].map(h => (
                      <th key={h} style={S.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stocks.map(s => {
                    const hist = priceHist[s.id] || [s.price];
                    const init = INITIAL_STOCKS.find(x => x.id === s.id)?.price || s.price;
                    const pct  = ((s.price - init) / init * 100).toFixed(2);
                    const isUp = s.price >= (s.prev || s.price);
                    const fl   = flash[s.id];
                    return (
                      <tr key={s.id} style={{ ...S.tr, background: selectedStock === s.id ? '#f0f7ff' : undefined }}
                          onClick={() => setSelectedStock(s.id)} className="smv3-row">
                        <td style={S.td}>
                          <span style={S.ticker}>{s.id}</span>
                        </td>
                        <td style={{ ...S.td, color:'#374151', fontSize:13 }}>{s.name}</td>
                        <td style={{ ...S.td, fontVariantNumeric:'tabular-nums', fontWeight:600,
                          color: fl === 'up' ? '#16a34a' : fl === 'down' ? '#dc2626' : '#1a3055',
                          transition:'color 0.3s' }}>
                          ${fmt(s.price)}
                        </td>
                        <td style={{ ...S.td, color: parseFloat(pct) >= 0 ? '#16a34a' : '#dc2626', fontWeight:500, fontSize:13 }}>
                          {parseFloat(pct) >= 0 ? '+' : ''}{pct}%
                        </td>
                        <td style={S.td}>
                          <svg width="100" height="32" viewBox="0 0 100 32">
                            <path d={sparkPath(hist)} fill="none"
                              stroke={isUp ? '#16a34a' : '#dc2626'}
                              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </td>
                        <td style={S.td}>
                          <div style={{ display:'flex', gap:5 }}>
                            <button style={S.buyBtn} onClick={e => { e.stopPropagation(); humanBuy(s.id, 1); }}>Buy</button>
                            <button style={S.sellBtn} onClick={e => { e.stopPropagation(); humanSell(s.id, 1); }}
                              disabled={!(human?.portfolio?.[s.id])}>Sell</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* News Feed */}
            <div style={S.card}>
              <div style={S.cardHead}>News Feed</div>
              <div style={{ maxHeight:180, overflowY:'auto' }}>
                {news.length === 0 && <p style={{ color:'#9ca3af', padding:'8px 0', margin:0, fontSize:13 }}>No news yet — market is quiet.</p>}
                {news.map(n => (
                  <div key={n.id} style={{ ...S.newsRow, borderLeft: `3px solid ${n.impact === 'pos' ? '#16a34a' : n.impact === 'neg' ? '#dc2626' : '#94a3b8'}` }}>
                    <span style={{ ...S.newsBadge, background: n.impact === 'pos' ? '#dcfce7' : n.impact === 'neg' ? '#fee2e2' : '#f1f5f9',
                      color: n.impact === 'pos' ? '#15803d' : n.impact === 'neg' ? '#b91c1c' : '#475569' }}>
                      {n.stock}
                    </span>
                    <span style={{ color:'#374151', fontSize:13 }}>{n.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: trade panel */}
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {selStock && (
              <div style={S.card}>
                <div style={S.cardHead}>Trade · {selStock.id}</div>
                <div style={{ padding:'4px 0 12px' }}>
                  <div style={{ fontSize:28, fontWeight:800, color:'#1a3055', letterSpacing:'-0.5px' }}>
                    ${fmt(selStock.price)}
                  </div>
                  <div style={{ fontSize:12, color:'#6b7280', marginTop:2 }}>{selStock.name} · {selStock.sector}</div>
                  <div style={{ marginTop:10 }}>
                    <svg width="100%" height="64" viewBox="0 0 260 64" preserveAspectRatio="none">
                      {(() => {
                        const hist = priceHist[selStock.id] || [selStock.price];
                        const isUp = hist[hist.length-1] >= hist[0];
                        return <>
                          <path d={sparkPath(hist, 260, 64, 4)} fill="none"
                            stroke={isUp ? '#16a34a' : '#dc2626'}
                            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </>;
                      })()}
                    </svg>
                  </div>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
                  <Stat label="Your Cash" val={`$${fmtInt(human?.cash || 0)}`} />
                  <Stat label="Owned Shares" val={(human?.portfolio?.[selStock.id] || 0).toString()} />
                  <Stat label="Dividend/share" val={`$${selStock.dividend.toFixed(2)}/tick`} />
                  <Stat label="Position Value" val={`$${fmt((human?.portfolio?.[selStock.id] || 0) * selStock.price)}`} />
                </div>

                <div style={S.tradeRow}>
                  <div style={{ flex:1 }}>
                    <label style={S.label}>Buy Qty</label>
                    <input style={S.input} type="number" value={buyQtyInput} min="1"
                      onChange={e => setBuyQtyInput(Math.max(1, parseInt(e.target.value)||1))} />
                  </div>
                  <button style={{ ...S.buyBtn, padding:'10px 18px', fontSize:14, marginTop:18 }}
                    onClick={() => humanBuy(selStock.id, buyQtyInput)}>
                    Buy {buyQtyInput}
                  </button>
                </div>
                <div style={S.tradeRow}>
                  <div style={{ flex:1 }}>
                    <label style={S.label}>Sell Qty</label>
                    <input style={S.input} type="number" value={sellQtyInput} min="1"
                      onChange={e => setSellQtyInput(Math.max(1, parseInt(e.target.value)||1))} />
                  </div>
                  <button style={{ ...S.sellBtn, padding:'10px 18px', fontSize:14, marginTop:18 }}
                    onClick={() => humanSell(selStock.id, sellQtyInput)}
                    disabled={!(human?.portfolio?.[selStock.id])}>
                    Sell {sellQtyInput}
                  </button>
                </div>
                <button style={{ ...S.btnGhost, width:'100%', marginTop:8 }}
                  onClick={() => humanBuy(selStock.id, Math.max(1, Math.floor((human?.cash || 0) / selStock.price)))}>
                  Buy Max ({Math.max(0, Math.floor((human?.cash || 0) / selStock.price))})
                </button>
              </div>
            )}

            {/* Cash summary */}
            <div style={{ ...S.card, background: 'linear-gradient(135deg, #1a3055 0%, #0e4d92 100%)' }}>
              <div style={{ color:'#93c5fd', fontSize:11, fontWeight:700, letterSpacing:1, textTransform:'uppercase', marginBottom:6 }}>Your Summary</div>
              <div style={{ display:'grid', gap:6 }}>
                <SummaryRow dark label="Cash" val={`$${fmt(human?.cash || 0)}`} />
                <SummaryRow dark label="Holdings" val={`$${fmt(holdingsValue(human || { portfolio:{} }))}`} />
                <div style={{ borderTop:'1px solid rgba(255,255,255,0.15)', margin:'4px 0' }} />
                <SummaryRow dark label="Net Worth" val={`$${fmt(humanNetWorth)}`} bold />
                <SummaryRow dark label="Rank" val={`#${humanRank} of ${players.length}`} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PORTFOLIO TAB ── */}
      {tab === 'portfolio' && (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={S.card}>
            <div style={S.cardHead}>Your Portfolio</div>
            {(!human || Object.keys(human.portfolio || {}).length === 0) ? (
              <p style={{ color:'#9ca3af', fontSize:13, margin:'12px 0' }}>No holdings yet. Go to Market tab to buy stocks.</p>
            ) : (
              <table style={S.table}>
                <thead>
                  <tr>
                    {['Symbol','Name','Shares','Avg Buy','Current','Gain/Loss','Value',''].map(h => (
                      <th key={h} style={S.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(human.portfolio || {}).map(([id, qty]) => {
                    if (!qty) return null;
                    const s = stocks.find(x => x.id === id);
                    if (!s) return null;
                    const init = INITIAL_STOCKS.find(x => x.id === id)?.price || s.price;
                    const val  = qty * s.price;
                    const gl   = ((s.price - init) / init * 100);
                    return (
                      <tr key={id} style={S.tr}>
                        <td style={S.td}><span style={S.ticker}>{id}</span></td>
                        <td style={{ ...S.td, fontSize:13, color:'#374151' }}>{s.name}</td>
                        <td style={{ ...S.td, fontWeight:600 }}>{qty}</td>
                        <td style={{ ...S.td, fontSize:13, color:'#6b7280' }}>${fmt(init)}</td>
                        <td style={{ ...S.td, fontWeight:600 }}>${fmt(s.price)}</td>
                        <td style={{ ...S.td, color: gl >= 0 ? '#16a34a' : '#dc2626', fontWeight:500 }}>
                          {gl >= 0 ? '+' : ''}{gl.toFixed(2)}%
                        </td>
                        <td style={{ ...S.td, fontWeight:700 }}>${fmt(val)}</td>
                        <td style={S.td}>
                          <div style={{ display:'flex', gap:5 }}>
                            <button style={S.buyBtn} onClick={() => humanBuy(id, 1)}>+1</button>
                            <button style={S.sellBtn} onClick={() => humanSell(id, 1)}>−1</button>
                            <button style={{ ...S.sellBtn, background:'#fef2f2', color:'#b91c1c', borderColor:'#fca5a5' }}
                              onClick={() => humanSell(id, qty)}>All</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Wealth chart */}
          {human && human.wealthHist && human.wealthHist.length > 1 && (
            <div style={S.card}>
              <div style={S.cardHead}>Wealth History</div>
              <svg width="100%" height="80" viewBox="0 0 400 80" preserveAspectRatio="none">
                <path d={sparkPath(human.wealthHist, 400, 80, 4)} fill="none"
                  stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>
      )}

      {/* ── PLAYERS TAB ── */}
      {tab === 'players' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:12 }}>
          {players.map((p, i) => {
            const tw = totalWealth(p);
            const isHuman = i === 0;
            return (
              <div key={i} style={{ ...S.card, border: isHuman ? '2px solid #2563eb' : S.card.border }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                  <div>
                    <div style={{ fontWeight:700, color:'#1a3055', fontSize:15 }}>
                      {isHuman ? '👤 ' : '🤖 '}{p.name}
                    </div>
                    <div style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>{p.role}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontWeight:800, fontSize:16, color:'#1a3055' }}>${fmtInt(tw)}</div>
                    <div style={{ fontSize:11, color:'#6b7280' }}>net worth</div>
                  </div>
                </div>

                <svg width="100%" height="36" viewBox="0 0 200 36" preserveAspectRatio="none">
                  {(() => {
                    const hist = p.wealthHist || [tw];
                    const isUp = hist[hist.length-1] >= hist[0];
                    return <path d={sparkPath(hist, 200, 36, 3)} fill="none"
                      stroke={isUp ? '#2563eb' : '#dc2626'} strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round" />;
                  })()}
                </svg>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginTop:10, fontSize:12 }}>
                  <div style={{ color:'#6b7280' }}>Cash</div><div style={{ textAlign:'right', fontWeight:600 }}>${fmtInt(p.cash)}</div>
                  <div style={{ color:'#6b7280' }}>Holdings</div><div style={{ textAlign:'right', fontWeight:600 }}>${fmtInt(holdingsValue(p))}</div>
                  <div style={{ color:'#6b7280' }}>Stocks held</div><div style={{ textAlign:'right', fontWeight:600 }}>
                    {Object.values(p.portfolio || {}).reduce((a, b) => a + b, 0)}
                  </div>
                </div>

                {Object.keys(p.portfolio || {}).length > 0 && (
                  <div style={{ marginTop:10, display:'flex', flexWrap:'wrap', gap:4 }}>
                    {Object.entries(p.portfolio || {}).filter(([,q]) => q > 0).map(([id, qty]) => (
                      <span key={id} style={S.chip}>{id} ×{qty}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── LEADERBOARD TAB ── */}
      {tab === 'leaderboard' && (
        <div style={S.card}>
          <div style={S.cardHead}>Leaderboard — Tick {tick}</div>
          <table style={S.table}>
            <thead>
              <tr>
                {['Rank','Player','Role','Cash','Holdings','Net Worth','Δ Start'].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((p, rank) => {
                const tw     = totalWealth(p);
                const start  = players[0]?.wealthHist?.[0] || initialMoney;
                const delta  = tw - start;
                const isHuman = p.name === 'You';
                return (
                  <tr key={rank} style={{ ...S.tr, background: isHuman ? '#f0f7ff' : undefined }}>
                    <td style={{ ...S.td, fontWeight:800, fontSize:18, color: rank === 0 ? '#ca8a04' : '#94a3b8' }}>
                      {rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : `#${rank+1}`}
                    </td>
                    <td style={{ ...S.td, fontWeight: isHuman ? 700 : 500 }}>{isHuman ? '👤 You' : `🤖 ${p.name}`}</td>
                    <td style={{ ...S.td, fontSize:12, color:'#9ca3af' }}>{p.role}</td>
                    <td style={S.td}>${fmtInt(p.cash)}</td>
                    <td style={S.td}>${fmtInt(holdingsValue(p))}</td>
                    <td style={{ ...S.td, fontWeight:700, color:'#1a3055' }}>${fmtInt(tw)}</td>
                    <td style={{ ...S.td, color: delta >= 0 ? '#16a34a' : '#dc2626', fontWeight:600 }}>
                      {delta >= 0 ? '+' : ''}${fmtInt(delta)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SUBCOMPONENTS
───────────────────────────────────────────── */
function Field({ label, children }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      <label style={{ fontSize:12, fontWeight:600, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</label>
      {children}
    </div>
  );
}
function Stat({ label, val }) {
  return (
    <div style={{ background:'#f8fafc', borderRadius:8, padding:'8px 10px', border:'1px solid #e2e8f0' }}>
      <div style={{ fontSize:10, color:'#94a3b8', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</div>
      <div style={{ fontWeight:700, color:'#1a3055', marginTop:2, fontSize:14 }}>{val}</div>
    </div>
  );
}
function SummaryRow({ label, val, bold, dark }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
      <span style={{ fontSize:12, color: dark ? '#93c5fd' : '#6b7280' }}>{label}</span>
      <span style={{ fontWeight: bold ? 800 : 600, color: dark ? '#fff' : '#1a3055', fontSize: bold ? 15 : 13 }}>{val}</span>
    </div>
  );
}
function RulesModal({ onClose }) {
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <h2 style={{ margin:0, fontSize:18, color:'#1a3055' }}>Game Rules</h2>
          <button style={S.btnGhost} onClick={onClose}>✕ Close</button>
        </div>
        <div style={{ fontSize:13, color:'#374151', lineHeight:1.7, maxHeight:'60vh', overflowY:'auto' }}>
          <h3 style={{ color:'#1a3055', marginTop:0 }}>Objective</h3>
          <p>Achieve the highest Net Worth (Cash + Portfolio Value) by the end of the game.</p>
          <h3 style={{ color:'#1a3055' }}>Trading</h3>
          <ul>
            <li>Buy and sell shares of the 5 listed companies.</li>
            <li>Prices update every few seconds based on market regime + random noise.</li>
            <li>You earn dividends on held shares every tick.</li>
            <li>No trading fees in this simulation.</li>
          </ul>
          <h3 style={{ color:'#1a3055' }}>Market Regimes</h3>
          <ul>
            <li><b>Calm</b> — Low volatility, steady prices.</li>
            <li><b>Bull</b> — Upward bias, moderate volatility.</li>
            <li><b>Bear</b> — Downward bias, higher volatility.</li>
            <li><b>Vol Spike</b> — Extreme swings both directions.</li>
          </ul>
          <h3 style={{ color:'#1a3055' }}>AI Opponents</h3>
          <ul>
            <li><b>Conservative</b> — Prefers steady, lower-risk trades.</li>
            <li><b>Speculator</b> — Chases momentum aggressively.</li>
            <li><b>Balanced</b> — Mixed strategy.</li>
          </ul>
          <p>Higher AI difficulty means the AI makes smarter buy/sell decisions.</p>
          <h3 style={{ color:'#1a3055' }}>Tips</h3>
          <ul>
            <li>Diversify across sectors to reduce risk.</li>
            <li>Watch the news feed for sector-specific events.</li>
            <li>Dividend-paying stocks provide passive income every tick.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const S = {
  root: {
    fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif",
    background: '#f5f7fa',
    minHeight: '100vh',
    padding: 16,
    color: '#1a2744',
  },
  setupWrap: {
    display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
    paddingTop: 48, minHeight: '100vh',
  },
  setupCard: {
    background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20,
    padding: '36px 40px', width: '100%', maxWidth: 500,
    boxShadow: '0 4px 24px rgba(26,48,85,0.08)',
  },
  setupLogo: { display:'flex', alignItems:'center', gap:16, marginBottom:28 },
  logoMark: {
    width: 48, height: 48, background: '#1a3055', color: '#fff', borderRadius: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 26, fontWeight: 900, flexShrink: 0,
  },
  setupTitle: { fontSize: 22, fontWeight: 800, color: '#1a3055', letterSpacing: '-0.4px' },
  setupSub:   { fontSize: 13, color: '#94a3b8', marginTop: 2 },
  fieldGrid:  { display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginBottom: 16 },
  regimeNote: { fontSize: 12, color: '#6b7280', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', margin: '0 0 16px' },

  topBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14,
    padding: '10px 16px', marginBottom: 10, gap: 12,
    boxShadow: '0 2px 8px rgba(26,48,85,0.05)',
  },
  topLeft:  { display:'flex', alignItems:'center', gap:10 },
  topRight: { display:'flex', alignItems:'center', gap:10 },
  logoSmall:{ fontWeight:800, color:'#1a3055', fontSize:15, letterSpacing:'-0.3px' },
  tickBadge:{ background:'#eff6ff', color:'#2563eb', fontSize:11, fontWeight:700, padding:'3px 8px', borderRadius:20, border:'1px solid #bfdbfe' },
  regimePill:{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, border:'1px solid transparent' },
  netWorthBar:{ display:'flex', alignItems:'center', gap:8, background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:10, padding:'6px 12px' },
  nwLabel:{ fontSize:11, color:'#94a3b8', fontWeight:600 },
  nwVal:  { fontSize:15, fontWeight:800, color:'#1a3055' },
  nwRank: { fontSize:11, color:'#2563eb', fontWeight:700, background:'#eff6ff', padding:'1px 6px', borderRadius:8 },

  tabRow: { display:'flex', gap:6, marginBottom:10 },
  tabOn:  { padding:'8px 16px', border:'none', borderRadius:10, background:'#1a3055', color:'#fff', fontWeight:700, cursor:'pointer', fontSize:13 },
  tabOff: { padding:'8px 16px', border:'1px solid #e2e8f0', borderRadius:10, background:'#fff', color:'#374151', fontWeight:500, cursor:'pointer', fontSize:13 },

  mainGrid: { display:'grid', gridTemplateColumns:'1fr 320px', gap:12, alignItems:'start' },

  card: {
    background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14,
    padding: '14px 16px', boxShadow: '0 2px 8px rgba(26,48,85,0.04)',
  },
  cardHead: { fontWeight:700, fontSize:13, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 },

  table: { width:'100%', borderCollapse:'collapse' },
  th: { fontSize:11, fontWeight:600, color:'#9ca3af', textAlign:'left', padding:'6px 8px', borderBottom:'2px solid #f1f5f9', textTransform:'uppercase', letterSpacing:'0.05em' },
  tr: { cursor:'pointer' },
  td: { padding:'10px 8px', borderBottom:'1px solid #f8fafc', fontSize:14, verticalAlign:'middle' },
  ticker: { background:'#eff6ff', color:'#1d4ed8', fontWeight:800, fontSize:12, padding:'2px 7px', borderRadius:5, letterSpacing:'0.04em' },

  buyBtn:  { padding:'5px 10px', background:'#dcfce7', color:'#15803d', border:'1px solid #86efac', borderRadius:7, fontWeight:700, cursor:'pointer', fontSize:12 },
  sellBtn: { padding:'5px 10px', background:'#fee2e2', color:'#b91c1c', border:'1px solid #fca5a5', borderRadius:7, fontWeight:700, cursor:'pointer', fontSize:12 },

  newsRow:   { display:'flex', alignItems:'center', gap:8, padding:'7px 0 7px 10px', borderBottom:'1px solid #f8fafc' },
  newsBadge: { fontSize:10, fontWeight:800, padding:'2px 6px', borderRadius:5, letterSpacing:'0.04em', flexShrink:0 },

  tradeRow: { display:'flex', gap:10, alignItems:'flex-end', marginBottom:8 },
  label: { fontSize:11, fontWeight:600, color:'#6b7280', display:'block', marginBottom:4 },
  input: { width:'100%', padding:'9px 12px', border:'1px solid #e2e8f0', borderRadius:10, fontSize:14, background:'#f9fafb', boxSizing:'border-box', outline:'none' },

  chip: { background:'#eff6ff', color:'#1d4ed8', fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:8, border:'1px solid #bfdbfe' },

  btnPrimary: { padding:'12px 24px', background:'#1a3055', color:'#fff', border:'none', borderRadius:12, fontWeight:700, fontSize:14, cursor:'pointer', letterSpacing:'0.01em' },
  btnGhost:   { padding:'10px 18px', background:'#fff', color:'#374151', border:'1px solid #e2e8f0', borderRadius:10, fontWeight:600, fontSize:13, cursor:'pointer' },
  btnSm:      { padding:'7px 13px', background:'#fff', color:'#374151', border:'1px solid #e2e8f0', borderRadius:9, fontWeight:600, fontSize:12, cursor:'pointer' },

  overlay: { position:'fixed', inset:0, background:'rgba(15,23,42,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 },
  modal: { background:'#fff', borderRadius:18, padding:'28px 32px', width:'100%', maxWidth:560, boxShadow:'0 20px 60px rgba(0,0,0,0.18)', maxHeight:'90vh', overflowY:'auto' },
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

.smv3-row:hover { background: #f8faff !important; }
.smv3-row:hover td { color: #1a3055; }

input[type="range"] {
  -webkit-appearance: none;
  height: 4px;
  background: #e2e8f0;
  border-radius: 4px;
  outline: none;
}
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #1a3055;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}

button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

* { box-sizing: border-box; }

@media (max-width: 860px) {
  .smv3-main-grid {
    grid-template-columns: 1fr !important;
  }
}
`;
