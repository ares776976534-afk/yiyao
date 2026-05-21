import { useState, useCallback, useEffect } from 'react';
import { Button, Card, Space, Tag, Segmented, Collapse } from 'antd';

const WHITE = 'w';
const BLACK = 'b';
const SYM = { w: { K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙' }, b: { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' } };
const VAL = { P: 100, N: 320, B: 330, R: 500, Q: 900, K: 20000 };

function initBoard() {
  const b = Array.from({ length: 8 }, () => Array(8).fill(null));
  const back = ['R','N','B','Q','K','B','N','R'];
  for (let c = 0; c < 8; c++) {
    b[0][c] = { t: back[c], c: BLACK };
    b[1][c] = { t: 'P', c: BLACK };
    b[6][c] = { t: 'P', c: WHITE };
    b[7][c] = { t: back[c], c: WHITE };
  }
  return b;
}

function clone(b) { return b.map(r => r.map(c => c ? { ...c } : null)); }

function findKing(b, color) {
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const p = b[r][c];
    if (p && p.t === 'K' && p.c === color) return [r, c];
  }
  return null;
}

function attacked(b, tr, tc, by) {
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const p = b[r][c];
    if (!p || p.c !== by) continue;
    const moves = pseudoMoves(b, r, c, true);
    if (moves.some(([nr, nc]) => nr === tr && nc === tc)) return true;
  }
  return false;
}

function inCheck(b, color) {
  const k = findKing(b, color);
  return k ? attacked(b, k[0], k[1], color === WHITE ? BLACK : WHITE) : true;
}

function pseudoMoves(b, r, c, attackOnly = false) {
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
  if (p.t === 'R') slide([[0,1],[0,-1],[1,0],[-1,0]]);
  if (p.t === 'B') slide([[1,1],[1,-1],[-1,1],[-1,-1]]);
  if (p.t === 'Q') slide([[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]]);
  if (p.t === 'N') {
    for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) add(r + dr, c + dc);
  }
  if (p.t === 'K') {
    for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]]) add(r + dr, c + dc);
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
    }
  }
  return m;
}

function legalMoves(b, color) {
  const all = [];
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const p = b[r][c];
    if (!p || p.c !== color) continue;
    for (const [nr, nc] of pseudoMoves(b, r, c)) {
      const nb = clone(b);
      nb[nr][nc] = nb[r][c];
      nb[r][c] = null;
      if (nb[nr][nc].t === 'P' && (nr === 0 || nr === 7)) nb[nr][nc] = { t: 'Q', c: color };
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

function aiPick(b) {
  const moves = legalMoves(b, BLACK);
  if (!moves.length) return null;
  let best = moves[0], bestS = Infinity;
  for (const m of moves) {
    const nb = clone(b);
    nb[m.tr][m.tc] = nb[m.fr][m.fc];
    nb[m.fr][m.fc] = null;
    if (nb[m.tr][m.tc].t === 'P' && (m.tr === 0 || m.tr === 7)) nb[m.tr][m.tc] = { t: 'Q', c: BLACK };
    let s = evalBoard(nb);
    const reply = legalMoves(nb, WHITE);
    if (!reply.length && inCheck(nb, WHITE)) s -= 50000;
    else {
      let worst = Infinity;
      for (const r of reply.slice(0, 28)) {
        const rb = clone(nb);
        rb[r.tr][r.tc] = rb[r.fr][r.fc];
        rb[r.fr][r.fc] = null;
        if (rb[r.tr][r.tc].t === 'P' && (r.tr === 0 || r.tr === 7)) rb[r.tr][r.tc] = { t: 'Q', c: WHITE };
        worst = Math.min(worst, evalBoard(rb));
      }
      if (worst !== Infinity) s = worst;
    }
    if (s < bestS) { bestS = s; best = m; }
  }
  return best;
}

export default function Chess() {
  const [mode, setMode] = useState('ai');
  const [board, setBoard] = useState(initBoard);
  const [turn, setTurn] = useState(WHITE);
  const [sel, setSel] = useState(null);
  const [hints, setHints] = useState([]);
  const [winner, setWinner] = useState(null);
  const [thinking, setThinking] = useState(false);

  const reset = () => {
    setBoard(initBoard());
    setTurn(WHITE);
    setSel(null);
    setHints([]);
    setWinner(null);
    setThinking(false);
  };

  const apply = useCallback((m, who, b) => {
    const nb = clone(b);
    nb[m.tr][m.tc] = nb[m.fr][m.fc];
    nb[m.fr][m.fc] = null;
    if (nb[m.tr][m.tc].t === 'P' && (m.tr === 0 || m.tr === 7)) nb[m.tr][m.tc] = { t: 'Q', c: who };
    const opp = who === WHITE ? BLACK : WHITE;
    setBoard(nb);
    setSel(null);
    setHints([]);
    const oppMoves = legalMoves(nb, opp);
    if (!oppMoves.length) setWinner(inCheck(nb, opp) ? who : 'draw');
    else setTurn(opp);
  }, []);

  useEffect(() => {
    if (mode !== 'ai' || turn !== BLACK || winner || thinking) return;
    setThinking(true);
    const t = setTimeout(() => {
      const m = aiPick(board);
      if (m) apply(m, BLACK, board);
      setThinking(false);
    }, 400);
    return () => clearTimeout(t);
  }, [mode, turn, winner, thinking, board, apply]);

  const click = (r, c) => {
    if (winner || thinking) return;
    if (mode === 'ai' && turn !== WHITE) return;
    if (sel) {
      const ok = hints.find(([nr, nc]) => nr === r && nc === c);
      if (ok) { apply({ fr: sel[0], fc: sel[1], tr: r, tc: c }, turn, board); return; }
    }
    const p = board[r][c];
    if (p && p.c === turn) {
      setSel([r, c]);
      setHints(legalMoves(board, turn).filter(m => m.fr === r && m.fc === c).map(m => [m.tr, m.tc]));
    } else { setSel(null); setHints([]); }
  };

  const cell = 48;

  return (
    <div style={{ maxWidth: 480 }}>
      <Card title="国际象棋" extra={
        <Space wrap>
          <Segmented value={mode} onChange={v => { setMode(v); reset(); }} options={[{ label: '人机', value: 'ai' }, { label: '双人', value: 'pvp' }]} />
          <Tag>{winner === 'draw' ? '和棋' : winner ? (winner === WHITE ? '白方胜' : '黑方胜') : thinking ? '电脑思考…' : turn === WHITE ? '白方' : '黑方'}</Tag>
          <Button onClick={reset}>重新开始</Button>
        </Space>
      }>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8,48px)', border: '2px solid #333' }}>
          {board.map((row, r) => row.map((p, c) => {
            const dark = (r + c) % 2 === 1;
            const hl = sel && sel[0] === r && sel[1] === c;
            const dot = hints.some(([nr, nc]) => nr === r && nc === c);
            return (
              <button key={`${r}-${c}`} type="button" onClick={() => click(r, c)} style={{
                width: cell, height: cell, border: 'none', padding: 0, cursor: 'pointer',
                background: dot ? 'rgba(255,77,79,0.4)' : dark ? '#769656' : '#eeeed2',
                outline: hl ? '2px solid #ff4d4f' : 'none', fontSize: 30
              }}>
                {p && <span style={{ color: p.c === WHITE ? '#fff' : '#111', textShadow: p.c === WHITE ? '0 0 2px #000' : 'none' }}>{SYM[p.c][p.t]}</span>}
              </button>
            );
          }))}
        </div>
        <Collapse style={{ marginTop: 12 }} items={[{
          key: '1', label: '规则说明',
          children: (
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.8 }}>
              <li>白方在下先手，黑方在上；将死对方王即胜，无法应将且未被将军则为和棋。</li>
              <li>兵直走一格，首步可进两格；斜吃。升变本版自动变为后。</li>
              <li>车直线任意格；象斜线；后直线+斜线；马走日字；王走周围一格。</li>
              <li>不能送王（走后仍被将军的着法不合法）。</li>
              <li>人机模式你执白，电脑执黑。</li>
            </ul>
          )
        }]} />
      </Card>
    </div>
  );
}
