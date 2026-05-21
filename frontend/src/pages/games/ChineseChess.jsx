import { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Card, Space, Tag, Segmented, Collapse, message } from 'antd';

const RED = 'r';
const BLACK = 'b';
const LABEL = {
  r: { K: '帥', A: '仕', B: '相', N: '馬', R: '車', C: '砲', P: '兵' },
  b: { K: '將', A: '士', B: '象', N: '馬', R: '車', C: '炮', P: '卒' }
};

const PAD = 24;
const GAP = 54;
const PR = 23;
const W = PAD * 2 + GAP * 8;
const H = PAD * 2 + GAP * 9;
const xAt = (c) => PAD + c * GAP;
const yAt = (r) => PAD + r * GAP;

const clone = (b) => b.map((row) => row.map((c) => (c ? { ...c } : null)));

function createBoard() {
  const b = Array.from({ length: 10 }, () => Array(9).fill(null));
  const back = ['R', 'N', 'B', 'A', 'K', 'A', 'B', 'N', 'R'];
  for (let c = 0; c < 9; c++) b[0][c] = { t: back[c], s: BLACK };
  b[2][1] = { t: 'C', s: BLACK };
  b[2][7] = { t: 'C', s: BLACK };
  [0, 2, 4, 6, 8].forEach((c) => { b[3][c] = { t: 'P', s: BLACK }; });
  for (let c = 0; c < 9; c++) b[9][c] = { t: back[c], s: RED };
  b[7][1] = { t: 'C', s: RED };
  b[7][7] = { t: 'C', s: RED };
  [0, 2, 4, 6, 8].forEach((c) => { b[6][c] = { t: 'P', s: RED }; });
  return b;
}

const inPalace = (r, c, s) => c >= 3 && c <= 5 && (s === RED ? r >= 7 : r <= 2);
const crossed = (r, s) => (s === RED ? r <= 4 : r >= 5);

function kingsFace(b) {
  let rk, rkC, bk, bkC;
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const p = b[r][c];
      if (!p || p.t !== 'K') continue;
      if (p.s === RED) { rk = r; rkC = c; } else { bk = r; bkC = c; }
    }
  }
  if (rk === undefined || rkC !== bkC) return false;
  for (let r = Math.min(rk, bk) + 1; r < Math.max(rk, bk); r++) if (b[r][rkC]) return false;
  return true;
}

function pseudo(b, r, c, atkOnly = false) {
  const p = b[r][c];
  if (!p) return [];
  const out = [];
  const add = (nr, nc) => {
    if (nr < 0 || nr > 9 || nc < 0 || nc > 8) return;
    if (b[nr][nc]?.s === p.s) return;
    out.push([nr, nc]);
  };
  const ray = (dirs) => {
    for (const [dr, dc] of dirs) {
      let nr = r + dr, nc = c + dc;
      while (nr >= 0 && nr <= 9 && nc >= 0 && nc <= 8) {
        const t = b[nr][nc];
        if (!t) { if (!atkOnly) out.push([nr, nc]); }
        else { if (t.s !== p.s) out.push([nr, nc]); break; }
        nr += dr; nc += dc;
      }
    }
  };
  if (p.t === 'R') ray([[0, 1], [0, -1], [1, 0], [-1, 0]]);
  if (p.t === 'C') {
    for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      let nr = r + dr, nc = c + dc, hop = false;
      while (nr >= 0 && nr <= 9 && nc >= 0 && nc <= 8) {
        const t = b[nr][nc];
        if (!hop) { if (t) hop = true; }
        else {
          if (!t) { if (!atkOnly) out.push([nr, nc]); }
          else if (t.s !== p.s) out.push([nr, nc]);
          break;
        }
        nr += dr; nc += dc;
      }
    }
  }
  if (p.t === 'N') {
    const legs = [[-1, 0, [-2, -1], [-2, 1]], [1, 0, [2, -1], [2, 1]], [0, -1, [-1, -2], [1, -2]], [0, 1, [-1, 2], [1, 2]]];
    for (const [lr, lc, jumps] of legs) {
      if (b[r + lr]?.[c + lc]) continue;
      jumps.forEach(([jr, jc]) => add(r + jr, c + jc));
    }
  }
  if (p.t === 'B') {
    [[-2, -2, -1, -1], [-2, 2, -1, 1], [2, -2, 1, -1], [2, 2, 1, 1]].forEach(([br, bc, er, ec]) => {
      const nr = r + br, nc = c + bc;
      if (p.s === RED && nr < 5) return;
      if (p.s === BLACK && nr > 4) return;
      if (b[r + er]?.[c + ec]) return;
      add(nr, nc);
    });
  }
  if (p.t === 'A') {
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([dr, dc]) => {
      const nr = r + dr, nc = c + dc;
      if (inPalace(nr, nc, p.s)) add(nr, nc);
    });
  }
  if (p.t === 'K') {
    [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dr, dc]) => {
      const nr = r + dr, nc = c + dc;
      if (inPalace(nr, nc, p.s)) add(nr, nc);
    });
  }
  if (p.t === 'P') {
    const f = p.s === RED ? -1 : 1;
    add(r + f, c);
    if (crossed(r, p.s)) { add(r, c - 1); add(r, c + 1); }
  }
  return out;
}

function kingPos(b, s) {
  for (let r = 0; r < 10; r++) for (let c = 0; c < 9; c++) {
    const p = b[r][c];
    if (p?.t === 'K' && p.s === s) return [r, c];
  }
  return null;
}

function isAttacked(b, tr, tc, by) {
  for (let r = 0; r < 10; r++) for (let c = 0; c < 9; c++) {
    const p = b[r][c];
    if (!p || p.s !== by) continue;
    if (pseudo(b, r, c, true).some(([nr, nc]) => nr === tr && nc === tc)) return true;
  }
  return false;
}

function inCheck(b, s) {
  const k = kingPos(b, s);
  return !k || isAttacked(b, k[0], k[1], s === RED ? BLACK : RED);
}

function movesFor(b, r, c) {
  const p = b[r][c];
  if (!p) return [];
  return pseudo(b, r, c).filter(([nr, nc]) => {
    const nb = clone(b);
    nb[nr][nc] = nb[r][c];
    nb[r][c] = null;
    return !kingsFace(nb) && !inCheck(nb, p.s);
  });
}

function allLegal(b, s) {
  const list = [];
  for (let r = 0; r < 10; r++) for (let c = 0; c < 9; c++) {
    const p = b[r][c];
    if (!p || p.s !== s) continue;
    movesFor(b, r, c).forEach(([tr, tc]) => list.push({ fr: r, fc: c, tr, tc }));
  }
  return list;
}

const SCORE = { P: 100, C: 450, N: 450, B: 200, A: 200, R: 900, K: 99999 };

function evaluate(b) {
  let v = 0;
  for (let r = 0; r < 10; r++) for (let c = 0; c < 9; c++) {
    const p = b[r][c];
    if (!p) continue;
    const base = SCORE[p.t] + (p.s === RED ? 9 - r : r);
    v += p.s === RED ? base : -base;
  }
  return v;
}

function aiMove(b) {
  const opts = allLegal(b, BLACK);
  if (!opts.length) return null;
  let best = opts[0], bestV = Infinity;
  for (const m of opts) {
    const nb = clone(b);
    nb[m.tr][m.tc] = nb[m.fr][m.fc];
    nb[m.fr][m.fc] = null;
    let v = evaluate(nb);
    const rep = allLegal(nb, RED);
    if (!rep.length) v += inCheck(nb, RED) ? -99999 : 0;
    else {
      let w = Infinity;
      for (const r of rep.slice(0, 20)) {
        const rb = clone(nb);
        rb[r.tr][r.tc] = rb[r.fr][r.fc];
        rb[r.fr][r.fc] = null;
        w = Math.min(w, evaluate(rb));
      }
      v = w;
    }
    if (v < bestV) { bestV = v; best = m; }
  }
  return best;
}

function scallop(r, n = 26) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((i + 0.5) / n) * Math.PI * 2 - Math.PI / 2;
    const a2 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
    const x0 = Math.cos(a0) * r, y0 = Math.sin(a0) * r;
    const x1 = Math.cos(a1) * r * 0.9, y1 = Math.sin(a1) * r * 0.9;
    const x2 = Math.cos(a2) * r, y2 = Math.sin(a2) * r;
    if (i === 0) d += `M${x0},${y0}`;
    d += `Q${x1},${y1} ${x2},${y2}`;
  }
  return `${d}Z`;
}

function BoardView({ board, sel, hints, last, uid }) {
  const path = scallop(PR);
  const lifted = sel ? board[sel[0]]?.[sel[1]] : null;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }}>
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8c07a" />
          <stop offset="100%" stopColor="#c9983e" />
        </linearGradient>
        <radialGradient id={`${uid}-disk`} cx="38%" cy="32%">
          <stop offset="0%" stopColor="#fff8eb" />
          <stop offset="100%" stopColor="#e2b56a" />
        </radialGradient>
        <filter id={`${uid}-sh`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity=".35" />
        </filter>
      </defs>
      <rect width={W} height={H} rx="8" fill={`url(#${uid}-bg)`} />
      <g stroke="#4a3728" strokeWidth="1.6" fill="none">
        {Array.from({ length: 9 }, (_, c) => (
          <line key={`v${c}`} x1={xAt(c)} y1={yAt(0)} x2={xAt(c)} y2={yAt(9)} />
        ))}
        {Array.from({ length: 5 }, (_, i) => (
          <line key={`t${i}`} x1={xAt(0)} y1={yAt(i)} x2={xAt(8)} y2={yAt(i)} />
        ))}
        {Array.from({ length: 5 }, (_, i) => (
          <line key={`b${i}`} x1={xAt(0)} y1={yAt(i + 5)} x2={xAt(8)} y2={yAt(i + 5)} />
        ))}
        <line x1={xAt(3)} y1={yAt(0)} x2={xAt(5)} y2={yAt(2)} />
        <line x1={xAt(5)} y1={yAt(0)} x2={xAt(3)} y2={yAt(2)} />
        <line x1={xAt(3)} y1={yAt(7)} x2={xAt(5)} y2={yAt(9)} />
        <line x1={xAt(5)} y1={yAt(7)} x2={xAt(3)} y2={yAt(9)} />
      </g>
      <text x={xAt(1.2)} y={(yAt(4) + yAt(5)) / 2 + 5} fill="#6b4a2a" fontSize="16" fontWeight="700" fontFamily="KaiTi,serif">楚河</text>
      <text x={xAt(5.5)} y={(yAt(4) + yAt(5)) / 2 + 5} fill="#6b4a2a" fontSize="16" fontWeight="700" fontFamily="KaiTi,serif">汉界</text>
      {last && (
        <rect x={xAt(last.tc) - 26} y={yAt(last.tr) - 26} width={52} height={52}
          fill="none" stroke="#faad14" strokeWidth="2" rx="4" />
      )}
      {board.map((row, r) => row.map((p, c) => {
        if (!p) return null;
        if (sel && sel[0] === r && sel[1] === c) {
          return (
            <g key={`g${r}-${c}`} transform={`translate(${xAt(c)},${yAt(r)})`} opacity=".3">
              <circle r={PR} fill="none" stroke="#ffd666" strokeWidth="2" strokeDasharray="4 3" />
            </g>
          );
        }
        return (
          <g key={`p${r}-${c}`} transform={`translate(${xAt(c)},${yAt(r)})`}>
            <path d={path} fill="#7a5a32" transform="translate(0,2)" opacity=".3" />
            <path d={path} fill={`url(#${uid}-disk)`} stroke="#8b6914" strokeWidth="1.2" filter={`url(#${uid}-sh)`} />
            <text textAnchor="middle" dominantBaseline="central" fontSize="25" fontWeight="800"
              fill={p.s === RED ? '#c62828' : '#212121'} fontFamily="KaiTi,serif">{LABEL[p.s][p.t]}</text>
          </g>
        );
      }))}
      {lifted && (
        <g transform={`translate(${xAt(sel[1])},${yAt(sel[0]) - 14}) scale(1.12)`}>
          <ellipse cx="0" cy="30" rx="20" ry="6" fill="rgba(0,0,0,0.25)" />
          <circle r={PR + 8} fill="none" stroke="#ffd666" strokeWidth="3" />
          <path d={path} fill={`url(#${uid}-disk)`} stroke="#8b6914" strokeWidth="1.2" filter={`url(#${uid}-sh)`} />
          <text textAnchor="middle" dominantBaseline="central" fontSize="25" fontWeight="800"
            fill={lifted.s === RED ? '#c62828' : '#212121'} fontFamily="KaiTi,serif">{LABEL[lifted.s][lifted.t]}</text>
        </g>
      )}
    </svg>
  );
}

export default function ChineseChess() {
  const uid = useRef(`xq${Date.now()}`).current;
  const [mode, setMode] = useState('ai');
  const [board, setBoard] = useState(() => createBoard());
  const [turn, setTurn] = useState(RED);
  const [sel, setSel] = useState(null);
  const [hints, setHints] = useState([]);
  const [last, setLast] = useState(null);
  const [winner, setWinner] = useState(null);
  const [busy, setBusy] = useState(false);
  const [hist, setHist] = useState([]);
  const boardRef = useRef(board);

  boardRef.current = board;

  const canPlay = !winner && !busy && !(mode === 'ai' && turn !== RED);

  const reset = () => {
    const b = createBoard();
    setBoard(b);
    boardRef.current = b;
    setTurn(RED);
    setSel(null);
    setHints([]);
    setLast(null);
    setWinner(null);
    setBusy(false);
    setHist([]);
  };

  const commit = useCallback((m, side, b) => {
    const nb = clone(b);
    nb[m.tr][m.tc] = nb[m.fr][m.fc];
    nb[m.fr][m.fc] = null;
    setBoard(nb);
    boardRef.current = nb;
    setSel(null);
    setHints([]);
    setLast(m);
    const opp = side === RED ? BLACK : RED;
    if (!allLegal(nb, opp).length) {
      setWinner(inCheck(nb, opp) ? side : opp);
      message.success(inCheck(nb, opp) ? (side === RED ? '红方胜！' : '黑方胜！') : '和棋');
      return;
    }
    setTurn(opp);
  }, []);

  useEffect(() => {
    if (mode !== 'ai' || turn !== BLACK || winner) return;
    setBusy(true);
    const t = setTimeout(() => {
      const b = boardRef.current;
      const m = aiMove(b);
      if (m) commit(m, BLACK, b);
      setBusy(false);
    }, 450);
    return () => clearTimeout(t);
  }, [mode, turn, winner, commit]);

  const onCell = (r, c) => {
    if (!canPlay) return;
    const p = board[r][c];
    if (sel) {
      if (hints.some(([hr, hc]) => hr === r && hc === c)) {
        setHist((x) => [...x, { board: clone(board), turn, sel, hints, last }]);
        commit({ fr: sel[0], fc: sel[1], tr: r, tc: c }, turn, board);
        return;
      }
      if (p?.s === turn) {
        setSel([r, c]);
        setHints(movesFor(board, r, c));
        return;
      }
      setSel(null);
      setHints([]);
      return;
    }
    if (p?.s === turn) {
      setSel([r, c]);
      setHints(movesFor(board, r, c));
    }
  };

  const undo = () => {
    if (!hist.length || busy) return;
    const prev = hist[hist.length - 1];
    setBoard(prev.board);
    boardRef.current = prev.board;
    setTurn(prev.turn);
    setSel(prev.sel);
    setHints(prev.hints);
    setLast(prev.last);
    setWinner(null);
    setHist((x) => x.slice(0, -1));
    setBusy(false);
  };

  const status = winner
    ? (winner === RED ? '红方胜' : '黑方胜')
    : busy ? '电脑思考中…' : turn === RED ? '红方行棋' : '黑方行棋';

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <Card
        title="中国象棋"
        styles={{ body: { padding: '12px 16px 16px', background: '#f5f0e1' } }}
        extra={
          <Space wrap size="small">
            <Segmented size="small" value={mode} onChange={(v) => { setMode(v); reset(); }}
              options={[{ label: '人机', value: 'ai' }, { label: '双人', value: 'pvp' }]} />
            <Tag color={turn === RED ? 'red' : 'default'}>{status}</Tag>
            <Button size="small" onClick={undo} disabled={!hist.length || busy}>悔棋</Button>
            <Button size="small" type="primary" onClick={reset}>新局</Button>
          </Space>
        }
      >
        <div style={{
          background: 'linear-gradient(180deg,#5d4037,#3e2723)',
          padding: 14, borderRadius: 12, boxShadow: '0 6px 20px rgba(0,0,0,.25)'
        }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 430, margin: '0 auto' }}>
            <BoardView board={board} sel={sel} hints={[]} last={last} uid={uid} />
            <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
              {Array.from({ length: 10 }, (_, r) =>
                Array.from({ length: 9 }, (_, c) => {
                  const isHint = hints.some(([hr, hc]) => hr === r && hc === c);
                  return (
                    <button
                      key={`btn-${r}-${c}`}
                      type="button"
                      disabled={!canPlay}
                      onClick={() => onCell(r, c)}
                      style={{
                        position: 'absolute',
                        left: `${(xAt(c) / W) * 100}%`,
                        top: `${(yAt(r) / H) * 100}%`,
                        transform: 'translate(-50%, -50%)',
                        width: 48,
                        height: 48,
                        padding: 0,
                        border: 'none',
                        background: 'transparent',
                        cursor: canPlay ? 'pointer' : 'default'
                      }}
                      aria-label={`${r}-${c}`}
                    >
                      {isHint && (
                        <span
                          style={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            background: '#52c41a',
                            border: '3px solid #fff',
                            boxShadow: '0 0 10px #52c41a, 0 2px 8px rgba(0,0,0,0.4)',
                            pointerEvents: 'none'
                          }}
                        />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
        <p style={{ margin: '10px 0 0', textAlign: 'center', color: '#8c6d4a', fontSize: 12 }}>
          {sel ? `已选中 · ${hints.length} 个绿点可走` : '点击己方棋子选中，再点绿点落子（你执红）'}
        </p>
        <Collapse size="small" style={{ marginTop: 10 }} items={[{
          key: 'r', label: '规则说明',
          children: (
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, lineHeight: 1.9, color: '#666' }}>
              <li>红方在下先手，将死对方将/帅获胜。</li>
              <li>帅/将九宫内走一步；士/仕斜走；象/相不过河；马走日；车直线；炮隔子打。</li>
              <li>兵/卒过河前只能向前，过河后可横走。</li>
            </ul>
          )
        }]} />
      </Card>
    </div>
  );
}
