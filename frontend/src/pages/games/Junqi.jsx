import { useState, useCallback, useEffect } from 'react';
import { Button, Card, Space, Tag, Segmented, Collapse } from 'antd';

const ROWS = 10;
const COLS = 5;
const RED = 'red';
const BLACK = 'black';
const RANK_NAME = ['炸弹', '地雷', '工兵', '排长', '连长', '营长', '团长', '旅长', '师长', '军长', '司令', '军旗'];
const POOL = [11, 10, 9, 8, 8, 7, 7, 6, 6, 5, 5, 4, 4, 4, 3, 3, 3, 2, 2, 2, 1, 1, 1, 0, 0];

function shuffle(a) {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function initBoard(hidden) {
  const b = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  const place = (side, r0) => {
    const ranks = shuffle(POOL);
    let i = 0;
    for (let r = r0; r < r0 + 5; r++) {
      for (let c = 0; c < COLS; c++) {
        b[r][c] = { rank: ranks[i++], side, hidden: hidden && true, revealed: !hidden };
      }
    }
  };
  place(BLACK, 0);
  place(RED, 5);
  return b;
}

function clone(b) { return b.map(r => r.map(c => c ? { ...c } : null)); }

function battle(att, def) {
  if (att.rank === 0 || def.rank === 0) return { attDead: true, defDead: true };
  if (att.rank === 2 && def.rank === 1) return { attDead: false, defDead: true };
  if (def.rank === 2 && att.rank === 1) return { attDead: true, defDead: false };
  if (att.rank === 2 && def.rank === 11) return { attDead: false, defDead: true };
  if (def.rank === 1 || att.rank === 1) return { attDead: true, defDead: false };
  if (att.rank === def.rank) return { attDead: true, defDead: true };
  if (att.rank > def.rank) return { attDead: false, defDead: true };
  return { attDead: true, defDead: false };
}

function canMove(p) {
  return p.rank !== 11 && p.rank !== 0 && p.rank !== 1;
}

function neighbors(r, c) {
  return [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].filter(([nr, nc]) => nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS);
}

function legalTargets(b, r, c) {
  const p = b[r][c];
  if (!p || !canMove(p)) return [];
  const out = [];
  for (const [nr, nc] of neighbors(r, c)) {
    const t = b[nr][nc];
    if (!t) out.push([nr, nc]);
    else if (t.side !== p.side) out.push([nr, nc]);
  }
  return out;
}

function allMoves(b, side) {
  const moves = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const p = b[r][c];
    if (!p || p.side !== side || !canMove(p)) continue;
    if (p.hidden && !p.revealed && side === RED) continue;
    for (const [nr, nc] of legalTargets(b, r, c)) moves.push({ fr: r, fc: c, tr: nr, tc: nc });
  }
  return moves;
}

function hasFlag(b, side) {
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const p = b[r][c];
    if (p && p.side === side && p.rank === 11) return true;
  }
  return false;
}

function aiMove(b) {
  const moves = allMoves(b, BLACK);
  if (!moves.length) return null;
  const scored = moves.map(m => {
    const t = b[m.tr][m.tc];
    let s = Math.random();
    if (t) s += t.rank * 2;
    if (m.tr >= 5) s += 3;
    return { m, s };
  });
  scored.sort((a, b) => b.s - a.s);
  return scored[0].m;
}

export default function Junqi() {
  const [mode, setMode] = useState('ai');
  const [hiddenPlay, setHiddenPlay] = useState(true);
  const [board, setBoard] = useState(() => initBoard(true));
  const [turn, setTurn] = useState(RED);
  const [sel, setSel] = useState(null);
  const [targets, setTargets] = useState([]);
  const [winner, setWinner] = useState(null);
  const [thinking, setThinking] = useState(false);

  const reset = () => {
    const hid = mode === 'ai' || hiddenPlay;
    setBoard(initBoard(hid));
    setTurn(RED);
    setSel(null);
    setTargets([]);
    setWinner(null);
    setThinking(false);
  };

  const reveal = (p) => ({ ...p, hidden: false, revealed: true });

  const applyMove = useCallback((m, who, b) => {
    const nb = clone(b);
    const piece = nb[m.fr][m.fc];
    const target = nb[m.tr][m.tc];
    nb[m.fr][m.fc] = null;
    if (!target) {
      nb[m.tr][m.tc] = reveal(piece);
    } else {
      const res = battle(piece, target);
      if (res.attDead && res.defDead) nb[m.tr][m.tc] = null;
      else if (res.defDead) nb[m.tr][m.tc] = reveal(piece);
      else if (res.attDead) nb[m.tr][m.tc] = reveal(target);
    }
    const opp = who === RED ? BLACK : RED;
    setBoard(nb);
    setSel(null);
    setTargets([]);
    if (!hasFlag(nb, opp)) setWinner(who);
    else setTurn(opp);
  }, []);

  useEffect(() => {
    if (mode !== 'ai' || turn !== BLACK || winner || thinking) return;
    setThinking(true);
    const t = setTimeout(() => {
      const m = aiMove(board);
      if (m) {
        const nb = clone(board);
        const p = nb[m.fr][m.fc];
        if (p) nb[m.fr][m.fc] = reveal(p);
        applyMove(m, BLACK, nb);
      }
      setThinking(false);
    }, 400);
    return () => clearTimeout(t);
  }, [mode, turn, winner, thinking, board, applyMove]);

  const showPiece = (p, viewer) => {
    if (!p) return '';
    if (p.hidden && !p.revealed) {
      if (mode === 'pvp' && hiddenPlay) return '?';
      if (mode === 'ai' && p.side === BLACK && viewer === RED) return '?';
    }
    return RANK_NAME[p.rank];
  };

  const click = (r, c) => {
    if (winner || thinking) return;
    if (mode === 'ai' && turn !== RED) return;
    const p = board[r][c];
    if (sel) {
      const ok = targets.find(([tr, tc]) => tr === r && tc === c);
      if (ok) {
        const nb = clone(board);
        const sp = nb[sel[0]][sel[1]];
        if (sp) nb[sel[0]][sel[1]] = reveal(sp);
        applyMove({ fr: sel[0], fc: sel[1], tr: r, tc: c }, turn, nb);
        return;
      }
    }
    if (p && p.side === turn) {
      const np = reveal(p);
      const nb = clone(board);
      nb[r][c] = np;
      setBoard(nb);
      setSel([r, c]);
      setTargets(legalTargets(nb, r, c));
    } else {
      setSel(null);
      setTargets([]);
    }
  };

  const cell = 56;

  return (
    <div style={{ maxWidth: 360 }}>
      <Card title="军棋（陆战棋）" extra={
        <Space wrap>
          <Segmented value={mode} onChange={v => { setMode(v); reset(); }} options={[{ label: '人机', value: 'ai' }, { label: '双人', value: 'pvp' }]} />
          {mode === 'pvp' && (
            <Segmented value={hiddenPlay} onChange={v => { setHiddenPlay(v); reset(); }} options={[{ label: '暗棋', value: true }, { label: '明棋', value: false }]} />
          )}
          <Tag>{winner ? (winner === RED ? '红方胜' : '黑方胜') : thinking ? '电脑…' : turn === RED ? '红方' : '黑方'}</Tag>
          <Button onClick={reset}>重新开始</Button>
        </Space>
      }>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS},${cell}px)`, gap: 2, background: '#3d5c3a', padding: 8, borderRadius: 8 }}>
          {board.map((row, r) => row.map((p, c) => {
            const hl = sel && sel[0] === r && sel[1] === c;
            const dot = targets.some(([tr, tc]) => tr === r && tc === c);
            return (
              <button key={`${r}-${c}`} type="button" onClick={() => click(r, c)} style={{
                width: cell, height: cell, border: '1px solid #2a4028', borderRadius: 4,
                background: dot ? '#ffe58f' : hl ? '#ffccc7' : p ? (p.side === RED ? '#ff7875' : '#595959') : '#6b8f68',
                color: '#fff', fontSize: p && (p.hidden && !p.revealed) ? 18 : 11, fontWeight: 700, cursor: 'pointer'
              }}>
                {p && showPiece(p, turn)}
              </button>
            );
          }))}
        </div>
        <Collapse style={{ marginTop: 12 }} items={[{
          key: '1', label: '规则说明',
          children: (
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.8 }}>
              <li>双方各 25 枚棋子布于己方 5×5 区域，本版为简化亮棋/暗棋陆战棋。</li>
              <li>司令 &gt; 军长 &gt; … &gt; 排长；同级对碰同归于尽；大吃小。</li>
              <li>工兵可吃地雷；炸弹与除工兵外对碰均死；炸弹碰地雷则炸弹死。</li>
              <li>军旗、地雷不能移动；吃掉对方军旗获胜。</li>
              <li>选中己方棋子后走上下左右一格，空格则移动，有敌子则对碰。</li>
              <li>人机模式红方在下，电脑黑方在上且棋子暗面；双人暗棋靠轮流背对屏幕。</li>
              <li>完整军棋含铁路线、行营、公路等，本版省略以便在网页快速对弈。</li>
            </ul>
          )
        }]} />
      </Card>
    </div>
  );
}
