import { useState, useCallback, useEffect, useMemo } from 'react';
import { Button, Card, Space, Tag, Segmented, Collapse, Modal } from 'antd';

const WHITE = 'w';
const BLACK = 'b';
const SYM = { w: { K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙' }, b: { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' } };
const SYM_SOLID = { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' };
const VAL = { P: 100, N: 320, B: 330, R: 500, Q: 900, K: 20000 };
const VAL_DISP = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 0 };
const PROMO_PIECES = ['Q', 'R', 'B', 'N'];

const CSS = `
.chess-wrap { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; }
.chess-grid {
  display: grid;
  grid-template-columns: repeat(8, 50px);
  grid-template-rows: repeat(8, 50px);
  border-radius: 5px;
  overflow: hidden;
  box-shadow: 0 8px 28px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.15);
  user-select: none;
}
.chess-sq {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: filter 0.15s;
}
.chess-sq-light { background: #eedbbb; }
.chess-sq-dark  { background: #b07a4e; }
.chess-sq-light:hover { filter: brightness(1.08); }
.chess-sq-dark:hover  { filter: brightness(1.1); }
.chess-last-light { background: #f3e76e !important; }
.chess-last-dark  { background: #c4a93e !important; }
.chess-sel { box-shadow: inset 0 0 0 3px rgba(255,200,30,0.75); }
.chess-check { background: radial-gradient(circle, #e84545 25%, #b22222) !important; }
.chess-piece {
  font-size: 38px;
  line-height: 1;
  transition: transform 0.15s ease;
  cursor: pointer;
  position: relative;
  z-index: 2;
}
.chess-piece:hover { transform: translateY(-4px) scale(1.06); }
.chess-piece-w {
  color: #e8dcc0;
  text-shadow:
    -1px -1px 0 #fff8e8,
    0 -1px 1px rgba(255,248,232,0.9),
    -1px 0 1px rgba(220,210,190,0.5),
    1px 1px 0 #b8a890,
    0 2px 0 #a89880,
    1px 2px 0 #988870,
    2px 3px 5px rgba(0,0,0,0.4),
    0 6px 9px rgba(0,0,0,0.22);
}
.chess-piece-b {
  color: #3a3a3a;
  text-shadow:
    -1px -1px 0 #7a7a7a,
    0 -1px 1px rgba(140,140,140,0.5),
    -1px 0 1px rgba(100,100,100,0.4),
    1px 1px 0 #1a1a1a,
    0 2px 0 #222,
    1px 2px 0 #111,
    2px 3px 5px rgba(0,0,0,0.5),
    0 6px 9px rgba(0,0,0,0.3);
}
.chess-piece-ground {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 26px;
  height: 5px;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(0,0,0,0.35) 0%, transparent 70%);
  z-index: 1;
  pointer-events: none;
}
.chess-dot {
  position: absolute;
  width: 15px; height: 15px;
  border-radius: 50%;
  background: rgba(0,0,0,0.22);
  pointer-events: none;
}
.chess-ring {
  position: absolute;
  top: 3px; right: 3px; bottom: 3px; left: 3px;
  border-radius: 50%;
  border: 3px solid rgba(0,0,0,0.22);
  pointer-events: none;
  box-sizing: border-box;
}
.chess-coord {
  position: absolute;
  font-size: 9px;
  font-weight: 700;
  pointer-events: none;
  opacity: 0.55;
}
.chess-cap-row {
  display: flex;
  align-items: center;
  gap: 1px;
  min-height: 28px;
  padding: 2px 6px;
  font-size: 20px;
  line-height: 1;
}
.chess-cap-piece { filter: drop-shadow(0 1px 1px rgba(0,0,0,0.2)); }
.chess-cap-diff {
  font-size: 13px;
  font-weight: 700;
  margin-left: 6px;
  color: #666;
}
.chess-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.chess-promo-btn {
  width: 68px; height: 68px;
  font-size: 42px;
  cursor: pointer;
  border: 2px solid #ddd;
  border-radius: 10px;
  background: linear-gradient(145deg, #fff, #f0f0f0);
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.chess-promo-btn:hover {
  border-color: #4096ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64,150,255,0.3);
}
@keyframes chess-fade-in { from { opacity: 0; } to { opacity: 1; } }
.chess-fade { animation: chess-fade-in 0.2s ease; }
`;

function initBoard() {
  const b = Array.from({ length: 8 }, () => Array(8).fill(null));
  const back = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
  for (let c = 0; c < 8; c++) {
    b[0][c] = { t: back[c], c: BLACK };
    b[1][c] = { t: 'P', c: BLACK };
    b[6][c] = { t: 'P', c: WHITE };
    b[7][c] = { t: back[c], c: WHITE };
  }
  return b;
}

const initCastle = () => ({ wK: true, wQ: true, bK: true, bQ: true });

function clone(b) { return b.map(r => r.map(c => c ? { ...c } : null)); }

function findKing(b, color) {
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const p = b[r][c];
    if (p && p.t === 'K' && p.c === color) return [r, c];
  }
  return null;
}

function pseudoMoves(b, r, c, attackOnly = false, castle = null, ep = null) {
  const p = b[r][c];
  if (!p) return [];
  const m = [];
  const add = (nr, nc) => {
    if (nr < 0 || nr > 7 || nc < 0 || nc > 7) return;
    const t = b[nr][nc];
    if (t && t.c === p.c) return;
    m.push([nr, nc]);
  };
  const slide = (dirs) => {
    for (const [dr, dc] of dirs) {
      let nr = r + dr, nc = c + dc;
      while (nr >= 0 && nr <= 7 && nc >= 0 && nc <= 7) {
        const t = b[nr][nc];
        if (!t) { if (!attackOnly) m.push([nr, nc]); }
        else { if (t.c !== p.c) m.push([nr, nc]); break; }
        nr += dr; nc += dc;
      }
    }
  };
  if (p.t === 'R') slide([[0, 1], [0, -1], [1, 0], [-1, 0]]);
  if (p.t === 'B') slide([[1, 1], [1, -1], [-1, 1], [-1, -1]]);
  if (p.t === 'Q') slide([[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]);
  if (p.t === 'N') {
    for (const [dr, dc] of [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]) add(r + dr, c + dc);
  }
  if (p.t === 'K') {
    for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]) add(r + dr, c + dc);
    if (!attackOnly && castle) {
      const opp = p.c === WHITE ? BLACK : WHITE;
      const home = p.c === WHITE ? 7 : 0;
      if (r === home && c === 4 && !attacked(b, home, 4, opp)) {
        const kFlag = p.c === WHITE ? 'wK' : 'bK';
        const qFlag = p.c === WHITE ? 'wQ' : 'bQ';
        if (castle[kFlag] && !b[home][5] && !b[home][6] &&
          b[home][7]?.t === 'R' && b[home][7]?.c === p.c &&
          !attacked(b, home, 5, opp) && !attacked(b, home, 6, opp)) {
          m.push([home, 6]);
        }
        if (castle[qFlag] && !b[home][1] && !b[home][2] && !b[home][3] &&
          b[home][0]?.t === 'R' && b[home][0]?.c === p.c &&
          !attacked(b, home, 3, opp) && !attacked(b, home, 2, opp)) {
          m.push([home, 2]);
        }
      }
    }
  }
  if (p.t === 'P') {
    const dir = p.c === WHITE ? -1 : 1;
    const start = p.c === WHITE ? 6 : 1;
    if (!b[r + dir]?.[c]) {
      if (!attackOnly) m.push([r + dir, c]);
      if (r === start && !b[r + 2 * dir][c] && !attackOnly) m.push([r + 2 * dir, c]);
    }
    for (const dc of [-1, 1]) {
      const t = b[r + dir]?.[c + dc];
      if (t && t.c !== p.c) m.push([r + dir, c + dc]);
      if (!attackOnly && ep && ep[0] === r + dir && ep[1] === c + dc) {
        m.push([r + dir, c + dc]);
      }
    }
  }
  return m;
}

function attacked(b, tr, tc, by) {
  // 兵：检查斜前方两格
  const pd = by === WHITE ? 1 : -1;
  for (const dc of [-1, 1]) {
    const r = tr + pd, c = tc + dc;
    if (r >= 0 && r <= 7 && c >= 0 && c <= 7) {
      const p = b[r][c];
      if (p && p.c === by && p.t === 'P') return true;
    }
  }
  // 马
  for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
    const r = tr + dr, c = tc + dc;
    if (r >= 0 && r <= 7 && c >= 0 && c <= 7) {
      const p = b[r][c];
      if (p && p.c === by && p.t === 'N') return true;
    }
  }
  // 王
  for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]]) {
    const r = tr + dr, c = tc + dc;
    if (r >= 0 && r <= 7 && c >= 0 && c <= 7) {
      const p = b[r][c];
      if (p && p.c === by && p.t === 'K') return true;
    }
  }
  // 车/后（直线滑动）
  for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
    let r = tr + dr, c = tc + dc;
    while (r >= 0 && r <= 7 && c >= 0 && c <= 7) {
      const p = b[r][c];
      if (p) { if (p.c === by && (p.t === 'R' || p.t === 'Q')) return true; break; }
      r += dr; c += dc;
    }
  }
  // 象/后（斜线滑动）
  for (const [dr, dc] of [[1,1],[1,-1],[-1,1],[-1,-1]]) {
    let r = tr + dr, c = tc + dc;
    while (r >= 0 && r <= 7 && c >= 0 && c <= 7) {
      const p = b[r][c];
      if (p) { if (p.c === by && (p.t === 'B' || p.t === 'Q')) return true; break; }
      r += dr; c += dc;
    }
  }
  return false;
}

function inCheck(b, color) {
  const k = findKing(b, color);
  return k ? attacked(b, k[0], k[1], color === WHITE ? BLACK : WHITE) : true;
}

function makeMove(b, m, color, castle, ep, promoPiece = 'Q') {
  const nb = clone(b);
  const p = nb[m.fr][m.fc];
  if (p.t === 'P' && m.fc !== m.tc && !b[m.tr][m.tc]) {
    nb[m.fr][m.tc] = null;
  }
  nb[m.tr][m.tc] = p;
  nb[m.fr][m.fc] = null;
  if (p.t === 'K' && Math.abs(m.tc - m.fc) === 2) {
    if (m.tc === 6) { nb[m.tr][5] = nb[m.tr][7]; nb[m.tr][7] = null; }
    else if (m.tc === 2) { nb[m.tr][3] = nb[m.tr][0]; nb[m.tr][0] = null; }
  }
  if (nb[m.tr][m.tc].t === 'P' && (m.tr === 0 || m.tr === 7)) {
    nb[m.tr][m.tc] = { t: promoPiece, c: color };
  }
  const nc = { ...castle };
  if (p.t === 'K') {
    if (color === WHITE) { nc.wK = false; nc.wQ = false; }
    else { nc.bK = false; nc.bQ = false; }
  }
  if (p.t === 'R') {
    if (m.fr === 7 && m.fc === 0) nc.wQ = false;
    if (m.fr === 7 && m.fc === 7) nc.wK = false;
    if (m.fr === 0 && m.fc === 0) nc.bQ = false;
    if (m.fr === 0 && m.fc === 7) nc.bK = false;
  }
  if (m.tr === 7 && m.tc === 0) nc.wQ = false;
  if (m.tr === 7 && m.tc === 7) nc.wK = false;
  if (m.tr === 0 && m.tc === 0) nc.bQ = false;
  if (m.tr === 0 && m.tc === 7) nc.bK = false;
  let newEp = null;
  if (p.t === 'P' && Math.abs(m.tr - m.fr) === 2) {
    newEp = [(m.tr + m.fr) / 2, m.tc];
  }
  return { board: nb, castle: nc, ep: newEp };
}

function legalMoves(b, color, castle, ep) {
  const all = [];
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const p = b[r][c];
    if (!p || p.c !== color) continue;
    for (const [nr, nc] of pseudoMoves(b, r, c, false, castle, ep)) {
      const { board: nb } = makeMove(b, { fr: r, fc: c, tr: nr, tc: nc }, color, castle, ep);
      if (!inCheck(nb, color)) all.push({ fr: r, fc: c, tr: nr, tc: nc });
    }
  }
  return all;
}

function evalBoard(b) {
  let s = 0;
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const p = b[r][c];
    if (!p) continue;
    s += (p.c === WHITE ? 1 : -1) * (VAL[p.t] + (p.c === WHITE ? 7 - r : r));
  }
  return s;
}

function aiPick(b, castle, ep) {
  const moves = legalMoves(b, BLACK, castle, ep);
  if (!moves.length) return null;
  let best = moves[0], bestS = Infinity;
  for (const m of moves) {
    const { board: nb, castle: nc, ep: ne } = makeMove(b, m, BLACK, castle, ep);
    let s = evalBoard(nb);
    const reply = legalMoves(nb, WHITE, nc, ne);
    if (!reply.length && inCheck(nb, WHITE)) s -= 50000;
    else {
      let worst = Infinity;
      for (const r of reply.slice(0, 16)) {
        const { board: rb } = makeMove(nb, r, WHITE, nc, ne);
        worst = Math.min(worst, evalBoard(rb));
      }
      if (worst !== Infinity) s = worst;
    }
    if (s < bestS) { bestS = s; best = m; }
  }
  return best;
}

function getCaptured(board) {
  const init = { P: 8, N: 2, B: 2, R: 2, Q: 1, K: 1 };
  const cur = { w: { P: 0, N: 0, B: 0, R: 0, Q: 0, K: 0 }, b: { P: 0, N: 0, B: 0, R: 0, Q: 0, K: 0 } };
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const p = board[r][c];
    if (p) cur[p.c][p.t]++;
  }
  const byWhite = [], byBlack = [];
  for (const t of ['Q', 'R', 'B', 'N', 'P']) {
    for (let i = cur.b[t]; i < init[t]; i++) byWhite.push({ t, c: BLACK });
    for (let i = cur.w[t]; i < init[t]; i++) byBlack.push({ t, c: WHITE });
  }
  return { byWhite, byBlack };
}

export default function Chess() {
  const [mode, setMode] = useState('ai');
  const [board, setBoard] = useState(initBoard);
  const [castle, setCastle] = useState(initCastle);
  const [ep, setEp] = useState(null);
  const [turn, setTurn] = useState(WHITE);
  const [sel, setSel] = useState(null);
  const [hints, setHints] = useState([]);
  const [winner, setWinner] = useState(null);
  const [thinking, setThinking] = useState(false);
  const [lastMove, setLastMove] = useState(null);
  const [promo, setPromo] = useState(null);
  const [moveCount, setMoveCount] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const reset = () => {
    setBoard(initBoard());
    setCastle(initCastle());
    setEp(null);
    setTurn(WHITE);
    setSel(null);
    setHints([]);
    setWinner(null);
    setThinking(false);
    setLastMove(null);
    setPromo(null);
    setMoveCount(0);
  };

  const finishMove = useCallback((m, who, b, ca, e, promoPiece = 'Q') => {
    const { board: nb, castle: nc, ep: ne } = makeMove(b, m, who, ca, e, promoPiece);
    const opp = who === WHITE ? BLACK : WHITE;
    setBoard(nb);
    setCastle(nc);
    setEp(ne);
    setSel(null);
    setHints([]);
    setLastMove({ fr: m.fr, fc: m.fc, tr: m.tr, tc: m.tc });
    setMoveCount(c => c + 1);
    const oppMoves = legalMoves(nb, opp, nc, ne);
    if (!oppMoves.length) setWinner(inCheck(nb, opp) ? who : 'draw');
    else setTurn(opp);
  }, []);

  const apply = useCallback((m, who, b, ca, e) => {
    const p = b[m.fr][m.fc];
    if (p.t === 'P' && (m.tr === 0 || m.tr === 7)) {
      if (mode === 'ai' && who === BLACK) {
        finishMove(m, who, b, ca, e, 'Q');
      } else {
        setPromo({ fr: m.fr, fc: m.fc, tr: m.tr, tc: m.tc, color: who, castle: ca, ep: e });
      }
      return;
    }
    finishMove(m, who, b, ca, e);
  }, [mode, finishMove]);

  const handlePromo = (piece) => {
    if (!promo) return;
    const { fr, fc, tr, tc, color, castle: ca, ep: e } = promo;
    setPromo(null);
    finishMove({ fr, fc, tr, tc }, color, board, ca, e, piece);
  };

  useEffect(() => {
    if (mode !== 'ai' || turn !== BLACK || winner || promo) return;
    setThinking(true);
    const t = setTimeout(() => {
      const m = aiPick(board, castle, ep);
      if (m) apply(m, BLACK, board, castle, ep);
      setThinking(false);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, turn, winner, board, castle, ep, apply, promo]);

  const click = (r, c) => {
    if (winner || thinking || promo) return;
    if (mode === 'ai' && turn !== WHITE) return;
    if (sel) {
      const ok = hints.find(([nr, nc]) => nr === r && nc === c);
      if (ok) { apply({ fr: sel[0], fc: sel[1], tr: r, tc: c }, turn, board, castle, ep); return; }
    }
    const p = board[r][c];
    if (p && p.c === turn) {
      setSel([r, c]);
      setHints(legalMoves(board, turn, castle, ep).filter(m => m.fr === r && m.fc === c).map(m => [m.tr, m.tc]));
    } else { setSel(null); setHints([]); }
  };

  const { byWhite, byBlack } = useMemo(() => getCaptured(board), [board]);
  const matDiff = byWhite.reduce((s, p) => s + VAL_DISP[p.t], 0) - byBlack.reduce((s, p) => s + VAL_DISP[p.t], 0);
  const checkColor = !winner && inCheck(board, turn) ? turn : null;
  const rowOrder = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const colOrder = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

  const statusText = winner === 'draw' ? '和棋' : winner ? (winner === WHITE ? '白方胜' : '黑方胜') : thinking ? '电脑思考中…' : checkColor ? `${checkColor === WHITE ? '白方' : '黑方'}被将军` : turn === WHITE ? '白方行棋' : '黑方行棋';

  const renderCaptured = (pieces, diff) => (
    <div className="chess-cap-row">
      {pieces.map((p, i) => (
        <span key={i} className="chess-cap-piece" style={{ color: p.c === WHITE ? '#ddd' : '#333', textShadow: p.c === WHITE ? '0 0 1px #555' : '0 0 1px #000' }}>
          {SYM_SOLID[p.t]}
        </span>
      ))}
      {diff > 0 && <span className="chess-cap-diff">+{diff}</span>}
    </div>
  );

  return (
    <div className="chess-wrap" style={{ maxWidth: 520, margin: '0 auto' }}>
      <style>{CSS}</style>
      <Card title={
        <span style={{ fontSize: 18, fontWeight: 700 }}>♚ 国际象棋</span>
      } extra={
        <Space wrap>
          <Segmented value={mode} onChange={v => { setMode(v); reset(); }} options={[{ label: '人机', value: 'ai' }, { label: '双人', value: 'pvp' }]} size="small" />
          <Button size="small" onClick={() => setFlipped(f => !f)}>翻转</Button>
          <Button size="small" onClick={reset}>重开</Button>
        </Space>
      }>
        <div className="chess-bar">
          <Tag color={checkColor ? 'red' : turn === WHITE ? 'default' : 'purple'} style={{ fontSize: 13, padding: '2px 12px' }}>
            {statusText}
          </Tag>
          <span style={{ fontSize: 12, color: '#999' }}>第 {moveCount} 手</span>
        </div>

        {/* 黑方被吃棋子 */}
        {renderCaptured(byBlack, matDiff < 0 ? -matDiff : 0)}

        {/* 棋盘 */}
        <div className="chess-grid chess-fade">
          {rowOrder.flatMap(r =>
            colOrder.map(c => {
              const p = board[r][c];
              const dark = (r + c) % 2 === 1;
              const isSel = sel && sel[0] === r && sel[1] === c;
              const isDot = hints.some(([nr, nc]) => nr === r && nc === c);
              const isCapture = isDot && p;
              const isLast = lastMove && ((lastMove.fr === r && lastMove.fc === c) || (lastMove.tr === r && lastMove.tc === c));
              const isCheck = checkColor && p && p.t === 'K' && p.c === checkColor;
              const showFile = flipped ? r === 0 : r === 7;
              const showRank = flipped ? c === 7 : c === 0;
              const fileChar = String.fromCharCode(97 + (flipped ? 7 - c : c));
              const rankNum = flipped ? r + 1 : 8 - r;
              const coordColor = dark ? '#eedbb6' : '#b07a4e';
              return (
                <div
                  key={`${r}-${c}`}
                  className={`chess-sq ${dark ? 'chess-sq-dark' : 'chess-sq-light'} ${isLast ? (dark ? 'chess-last-dark' : 'chess-last-light') : ''} ${isCheck ? 'chess-check' : ''} ${isSel ? 'chess-sel' : ''}`}
                  onClick={() => click(r, c)}
                >
                  {showRank && <span className="chess-coord" style={{ top: 1, left: 3, color: coordColor }}>{rankNum}</span>}
                  {showFile && <span className="chess-coord" style={{ bottom: 1, right: 3, color: coordColor }}>{fileChar}</span>}
                  {p && (
                    <>
                      <div className="chess-piece-ground" />
                      <span className={`chess-piece chess-piece-${p.c}`}>
                        {SYM[p.c][p.t]}
                      </span>
                    </>
                  )}
                  {isDot && !isCapture && <div className="chess-dot" />}
                  {isCapture && <div className="chess-ring" />}
                </div>
              );
            })
          )}
        </div>

        {/* 白方被吃棋子 */}
        {renderCaptured(byWhite, matDiff > 0 ? matDiff : 0)}

        <Collapse style={{ marginTop: 10 }} size="small" items={[{
          key: '1', label: '规则说明',
          children: (
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, lineHeight: 1.8 }}>
              <li>白方先手；将死对方王即胜，无法应将且未被将军则为和棋。</li>
              <li>兵直走一格、首步可两格、斜吃；到底线升变为后/车/象/马。</li>
              <li>车直线；象斜线；后直线+斜线；马走日字；王走周围一格。</li>
              <li>王车易位：王和车未动、中间无子、王不将军且不经过被攻击格。</li>
              <li>吃过路兵：对方兵首步走两格到你兵旁，下一回合可斜吃该格。</li>
              <li>被将军时王格红色高亮。绿色圆点=可走空格，圆环=可吃子。</li>
              <li>人机模式你执白，电脑执黑。可点"翻转"切换视角。</li>
            </ul>
          )
        }]} />
      </Card>
      <Modal
        title="兵升变"
        open={!!promo}
        footer={null}
        closable={false}
        centered
      >
        <p style={{ textAlign: 'center', marginBottom: 16, color: '#666' }}>选择升变的棋子</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 14 }}>
          {PROMO_PIECES.map(t => (
            <button key={t} className="chess-promo-btn" onClick={() => handlePromo(t)}>
              <span className={`chess-piece chess-piece-${promo?.color || 'w'}`}>{SYM[promo?.color || WHITE][t]}</span>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
