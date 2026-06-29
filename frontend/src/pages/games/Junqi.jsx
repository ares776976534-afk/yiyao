import { useState, useCallback, useEffect } from 'react';
import { Button, Card, Space, Tag, Segmented, Collapse } from 'antd';

const ROWS = 12;
const COLS = 5;
const RED = 'red';
const BLACK = 'black';

const RANK_NAME = ['炸弹', '地雷', '工兵', '排长', '连长', '营长', '团长', '旅长', '师长', '军长', '司令', '军旗'];
const PIECE_NAME = ['炸', '雷', '工', '排', '连', '营', '团', '旅', '师', '军', '司', '旗'];
const POOL = [11, 10, 9, 8, 8, 7, 7, 6, 6, 5, 5, 4, 4, 4, 3, 3, 3, 2, 2, 2, 1, 1, 1, 0, 0];

const HQ_RED = [11, 2];
const HQ_BLACK = [0, 2];
const BUNKERS = [
  [1, 1], [1, 3], [2, 2],
  [5, 1], [5, 3], [6, 2],
  [9, 1], [9, 3], [10, 2],
];
const RAIL_POS = new Set([
  '0,0', '0,1', '0,2', '0,3', '0,4',
  '1,0', '1,2', '1,4',
  '2,0', '2,4',
  '3,0', '3,1', '3,2', '3,3', '3,4',
  '4,0', '4,1', '4,2', '4,3', '4,4',
  '5,0', '5,2', '5,4',
  '6,0', '6,4',
  '7,0', '7,1', '7,2', '7,3', '7,4',
  '8,0', '8,1', '8,2', '8,3', '8,4',
  '9,0', '9,2', '9,4',
  '10,0', '10,2', '10,4',
  '11,0', '11,1', '11,2', '11,3', '11,4',
]);

const RAIL_EDGES = [];
for (const key of RAIL_POS) {
  const [r, c] = key.split(',').map(Number);
  for (const [dr, dc] of [[0, 1], [1, 0]]) {
    const nr = r + dr, nc = c + dc;
    if (RAIL_POS.has(`${nr},${nc}`)) RAIL_EDGES.push([[r, c], [nr, nc]]);
  }
}

function shuffle(a) {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function makePiece(rank, side, hidden) {
  return { rank, side, hidden: hidden && true, revealed: !hidden };
}

function clone(b) { return b.map(r => r.map(c => c ? { ...c } : null)); }

function isRail(r, c) { return RAIL_POS.has(`${r},${c}`); }
function isBunker(r, c) { return BUNKERS.some(([br, bc]) => br === r && bc === c); }
function isHq(r, c, side) {
  const [hr, hc] = side === RED ? HQ_RED : HQ_BLACK;
  return r === hr && c === hc;
}
function inBounds(r, c) { return r >= 0 && r < ROWS && c >= 0 && c < COLS; }

function battle(att, def) {
  if (att.rank === 0 || def.rank === 0) return { attDead: true, defDead: true }; // 炸弹
  if (def.rank === 11) return { attDead: false, defDead: true }; // 任意子夺旗
  if (att.rank === 2 && def.rank === 1) return { attDead: false, defDead: true }; // 工兵挖地雷
  if (def.rank === 1) return { attDead: true, defDead: false }; // 地雷炸非工兵
  if (att.rank === def.rank) return { attDead: true, defDead: true }; // 同归于尽
  if (att.rank > def.rank) return { attDead: false, defDead: true }; // 大吃小
  return { attDead: true, defDead: false };
}

function canMove(p) {
  return p.rank !== 11 && p.rank !== 1; // 军旗、地雷不能动；炸弹能动
}

function roadTargets(b, r, c) {
  const targets = [];
  const p = b[r][c];
  for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
    const nr = r + dr, nc = c + dc;
    if (!inBounds(nr, nc)) continue;
    const t = b[nr][nc];
    if (!t || t.side !== p.side) targets.push([nr, nc]);
  }
  return targets;
}

function straightRailTargets(b, r, c) {
  const targets = [];
  const p = b[r][c];
  for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
    let nr = r + dr, nc = c + dc;
    while (inBounds(nr, nc) && isRail(nr, nc)) {
      const t = b[nr][nc];
      if (!t) targets.push([nr, nc]);
      else {
        if (t.side !== p.side) targets.push([nr, nc]);
        break;
      }
      nr += dr; nc += dc;
    }
  }
  return targets;
}

function graphRailTargets(b, r, c) {
  const targets = [];
  const p = b[r][c];
  const visited = new Set([`${r},${c}`]);
  const queue = [[r, c]];
  let qi = 0;
  while (qi < queue.length) {
    const [cr, cc] = queue[qi++];
    for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const nr = cr + dr, nc = cc + dc;
      if (!inBounds(nr, nc) || !isRail(nr, nc)) continue;
      const key = `${nr},${nc}`;
      if (visited.has(key)) continue;
      const t = b[nr][nc];
      if (!t) {
        visited.add(key);
        queue.push([nr, nc]);
        targets.push([nr, nc]);
      } else if (t.side !== p.side) {
        targets.push([nr, nc]);
      }
    }
  }
  return targets;
}

function legalTargets(b, r, c) {
  const p = b[r][c];
  if (!p || !canMove(p)) return [];

  let targets = roadTargets(b, r, c);
  if (isRail(r, c)) {
    const railTargets = p.rank === 2 ? graphRailTargets(b, r, c) : straightRailTargets(b, r, c);
    targets = targets.concat(railTargets);
  }

  // 行营中的棋子不能被攻击；也不能走进敌方行营（若已有子则已被 side 过滤）
  targets = targets.filter(([tr, tc]) => {
    const t = b[tr][tc];
    return !(t && isBunker(tr, tc));
  });

  const seen = new Set();
  return targets.filter(([tr, tc]) => {
    const key = `${tr},${tc}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function initBoard(hidden) {
  const b = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

  const setupSide = (side) => {
    const r0 = side === BLACK ? 0 : 7;
    const hq = side === BLACK ? HQ_BLACK : HQ_RED;
    const backRows = side === BLACK ? [0, 1] : [10, 11];
    const frontRow = side === BLACK ? 4 : 7;

    const allPos = [];
    for (let r = r0; r < r0 + 5; r++) {
      for (let c = 0; c < COLS; c++) allPos.push([r, c]);
    }

    // 军旗固定司令部
    b[hq[0]][hq[1]] = makePiece(11, side, hidden);
    let positions = allPos.filter(([r, c]) => !(r === hq[0] && c === hq[1]));

    let pool = shuffle([...POOL]);
    pool.splice(pool.indexOf(11), 1);

    const mineCount = pool.filter(r => r === 1).length;
    const backPos = shuffle(positions.filter(([r, c]) => backRows.includes(r)));
    for (let i = 0; i < mineCount; i++) {
      const [r, c] = backPos[i];
      b[r][c] = makePiece(1, side, hidden);
    }
    const mineSet = new Set(backPos.slice(0, mineCount).map(([r, c]) => `${r},${c}`));
    positions = positions.filter(([r, c]) => !mineSet.has(`${r},${c}`));

    const bombCount = pool.filter(r => r === 0).length;
    const nonFrontPos = shuffle(positions.filter(([r, c]) => r !== frontRow));
    for (let i = 0; i < bombCount; i++) {
      const [r, c] = nonFrontPos[i];
      b[r][c] = makePiece(0, side, hidden);
    }
    const bombSet = new Set(nonFrontPos.slice(0, bombCount).map(([r, c]) => `${r},${c}`));
    positions = positions.filter(([r, c]) => !bombSet.has(`${r},${c}`));

    const rest = shuffle(pool.filter(r => r !== 1 && r !== 0));
    for (let i = 0; i < rest.length; i++) {
      const [r, c] = positions[i];
      b[r][c] = makePiece(rest[i], side, hidden);
    }
  };

  setupSide(BLACK);
  setupSide(RED);
  return b;
}

function hasFlag(b, side) {
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const p = b[r][c];
    if (p && p.side === side && p.rank === 11) return true;
  }
  return false;
}

function hasMovablePiece(b, side) {
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const p = b[r][c];
    if (p && p.side === side && canMove(p) && legalTargets(b, r, c).length > 0) return true;
  }
  return false;
}

function allMoves(b, side, viewer) {
  const moves = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const p = b[r][c];
    if (!p || p.side !== side || !canMove(p)) continue;
    if (p.hidden && !p.revealed && side !== viewer) continue;
    for (const [tr, tc] of legalTargets(b, r, c)) moves.push({ fr: r, fc: c, tr, tc });
  }
  return moves;
}

function findFlag(b, side) {
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const p = b[r][c];
    if (p && p.side === side && p.rank === 11) return [r, c];
  }
  return null;
}

function aiMove(b) {
  const moves = allMoves(b, BLACK, BLACK);
  if (!moves.length) return null;

  const enemyFlag = findFlag(b, RED);
  const ownFlag = findFlag(b, BLACK);

  const scored = moves.map(m => {
    const piece = b[m.fr][m.fc];
    const target = b[m.tr][m.tc];
    let score = Math.random() * 0.6;

    if (target) {
      const res = battle(piece, target);
      if (!res.attDead && res.defDead) {
        score += target.rank * 2 + 6;
        if (target.rank === 11) score += 200; // 夺旗
        if (target.rank >= 8) score += 8; // 吃高官
      } else if (res.attDead && !res.defDead) {
        score -= piece.rank * 2 + 3;
      } else {
        score += (target.rank - piece.rank) * 0.8;
      }
    }

    // 向敌方推进
    if (m.tr > m.fr) score += 0.6;

    // 铁路机动加分
    if (isRail(m.tr, m.tc)) score += 0.35;

    // 护旗：高阶子向自家司令部靠拢
    if (ownFlag && piece.rank >= 8) {
      const dBefore = Math.abs(m.fr - ownFlag[0]) + Math.abs(m.fc - ownFlag[1]);
      const dAfter = Math.abs(m.tr - ownFlag[0]) + Math.abs(m.tc - ownFlag[1]);
      if (dAfter < dBefore) score += 0.9;
    }

    // 工兵向敌方地雷/军旗靠拢
    if (piece.rank === 2) {
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        const p = b[r][c];
        if (p && p.side === RED && (p.rank === 1 || p.rank === 11)) {
          const dist = Math.abs(r - m.tr) + Math.abs(c - m.tc);
          score += 3 / (dist + 1);
        }
      }
    }

    // 炸弹去兑高官或地雷
    if (piece.rank === 0 && target && target.rank >= 8) score += 12;

    // 夺旗路径：向敌方司令部靠近
    if (enemyFlag) {
      const dist = Math.abs(m.tr - enemyFlag[0]) + Math.abs(m.tc - enemyFlag[1]);
      score += 1.5 / (dist + 1);
    }

    return { m, score };
  });

  scored.sort((a, b) => b.score - a.score);
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
  const [moveCount, setMoveCount] = useState(0);
  const [lastMove, setLastMove] = useState(null);
  const [history, setHistory] = useState([]);

  const reset = () => {
    const hid = mode === 'ai' || hiddenPlay;
    setBoard(initBoard(hid));
    setTurn(RED);
    setSel(null);
    setTargets([]);
    setWinner(null);
    setThinking(false);
    setMoveCount(0);
    setLastMove(null);
    setHistory([]);
  };

  const reveal = (p) => ({ ...p, hidden: false, revealed: true });

  const finishGame = useCallback((who, reason) => {
    setWinner(who);
    setSel(null);
    setTargets([]);
  }, []);

  const applyMove = useCallback((m, who, b) => {
    setHistory(prev => [...prev, { board: clone(b), turn: who, moveCount, lastMove, winner }]);
    const nb = clone(b);
    const piece = nb[m.fr][m.fc];
    const target = nb[m.tr][m.tc];
    nb[m.fr][m.fc] = null;
    let res = null;
    if (!target) {
      nb[m.tr][m.tc] = reveal(piece);
    } else {
      res = battle(piece, target);
      if (res.attDead && res.defDead) nb[m.tr][m.tc] = null;
      else if (res.defDead) nb[m.tr][m.tc] = reveal(piece);
      else if (res.attDead) nb[m.tr][m.tc] = reveal(target);
    }
    const opp = who === RED ? BLACK : RED;
    setBoard(nb);
    setSel(null);
    setTargets([]);
    setLastMove({ fr: m.fr, fc: m.fc, tr: m.tr, tc: m.tc, res });
    setMoveCount(n => n + 1);

    if (!hasFlag(nb, opp)) finishGame(who, '夺旗');
    else if (!hasMovablePiece(nb, opp)) finishGame(who, '困毙');
    else setTurn(opp);
  }, [finishGame, moveCount, lastMove, winner]);

  useEffect(() => {
    if (mode !== 'ai' || turn !== BLACK || winner) return;
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
    }, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, turn, winner, board, applyMove]);

  const viewer = mode === 'ai' ? RED : turn;

  const showPiece = (p) => {
    if (!p) return '';
    if (p.hidden && !p.revealed && p.side !== viewer) return '?';
    return PIECE_NAME[p.rank];
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

  const undo = () => {
    if (!history.length || thinking) return;
    setThinking(false);
    setSel(null);
    setTargets([]);

    if (mode === 'ai') {
      // 人机模式一次性回退到上一个红方回合（撤销电脑+玩家各一步）
      let idx = history.length - 1;
      while (idx >= 0 && history[idx].turn !== RED) idx--;
      if (idx < 0) idx = 0;
      const state = history[idx];
      setBoard(state.board);
      setTurn(state.turn);
      setMoveCount(state.moveCount);
      setLastMove(state.lastMove);
      setWinner(state.winner);
      setHistory(history.slice(0, idx));
    } else {
      const state = history[history.length - 1];
      setBoard(state.board);
      setTurn(state.turn);
      setMoveCount(state.moveCount);
      setLastMove(state.lastMove);
      setWinner(state.winner);
      setHistory(history.slice(0, -1));
    }
  };

  const cell = 44;
  const gap = 2;
  const padding = 8;
  const boardW = COLS * cell + (COLS - 1) * gap + 2 * padding;
  const boardH = ROWS * cell + (ROWS - 1) * gap + 2 * padding;

  const cellCenter = (r, c) => ({
    x: padding + c * (cell + gap) + cell / 2,
    y: padding + r * (cell + gap) + cell / 2,
  });

  const statusText = winner
    ? `${winner === RED ? '红方' : '黑方'}胜`
    : thinking
      ? '电脑思考中…'
      : `${turn === RED ? '红方' : '黑方'}走棋`;

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <Card title={<span style={{ fontSize: 18, fontWeight: 700 }}>军棋（陆战棋）</span>} extra={
        <Space wrap>
          <Segmented value={mode} onChange={v => { setMode(v); reset(); }} options={[{ label: '人机', value: 'ai' }, { label: '双人', value: 'pvp' }]} size="small" />
          {mode === 'pvp' && (
            <Segmented value={hiddenPlay} onChange={v => { setHiddenPlay(v); reset(); }} options={[{ label: '暗棋', value: true }, { label: '明棋', value: false }]} size="small" />
          )}
          <Button size="small" onClick={undo} disabled={!history.length || thinking}>悔棋</Button>
          <Button size="small" onClick={reset}>重新开始</Button>
        </Space>
      }>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Tag color={winner ? 'red' : turn === RED ? 'red' : 'default'} style={{ fontSize: 13, padding: '2px 12px' }}>
            {statusText}
          </Tag>
          <span style={{ fontSize: 12, color: '#999' }}>第 {moveCount} 手</span>
        </div>

        <div style={{ position: 'relative', width: boardW, height: boardH, background: '#4a5d3a', borderRadius: 8, overflow: 'hidden', margin: '0 auto' }}>
          {/* 铁路线 SVG 底层 */}
          <svg style={{ position: 'absolute', top: 0, left: 0, zIndex: 0, pointerEvents: 'none' }} width={boardW} height={boardH}>
            {RAIL_EDGES.map(([[r1, c1], [r2, c2]], i) => {
              const p1 = cellCenter(r1, c1);
              const p2 = cellCenter(r2, c2);
              return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#c4b080" strokeWidth="5" strokeLinecap="round" opacity="0.75" />;
            })}
            {BUNKERS.map(([r, c], i) => {
              const p = cellCenter(r, c);
              return <circle key={`b-${i}`} cx={p.x} cy={p.y} r="14" fill="none" stroke="#d4c490" strokeWidth="2" opacity="0.6" />;
            })}
          </svg>

          {/* 棋盘格子 */}
          <div style={{
            position: 'absolute', top: padding, left: padding,
            display: 'grid', gridTemplateColumns: `repeat(${COLS}, ${cell}px)`, gap,
            zIndex: 1,
          }}>
            {board.map((row, r) => row.map((p, c) => {
              const hl = sel && sel[0] === r && sel[1] === c;
              const dot = targets.some(([tr, tc]) => tr === r && tc === c);
              const isLast = lastMove && ((lastMove.fr === r && lastMove.fc === c) || (lastMove.tr === r && lastMove.tc === c));
              const isCap = dot && p && p.side !== turn;
              const isHqCell = isHq(r, c, RED) || isHq(r, c, BLACK);
              const isBunkerCell = isBunker(r, c);
              const hidden = p && p.hidden && !p.revealed && p.side !== viewer;

              let bg = '#5e7a4a';
              if (isHqCell) bg = isHq(r, c, RED) ? '#8a4a4a' : '#4a4a4a';
              else if (isBunkerCell) bg = '#6e7a3a';
              if (isLast) bg = '#d4b85c';
              if (hl) bg = '#ffccc7';
              else if (dot) bg = '#ffe58f';

              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  onClick={() => click(r, c)}
                  style={{
                    width: cell, height: cell,
                    border: '1px solid #3d4f30',
                    borderRadius: 4,
                    background: bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {isHqCell && <span style={{ position: 'absolute', top: 2, right: 3, fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>司</span>}
                  {isBunkerCell && <span style={{ position: 'absolute', bottom: 2, left: 3, fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>营</span>}
                  {p && (
                    <span
                      className={`junqi-piece junqi-piece-${p.side}`}
                      style={{
                        fontSize: hidden ? 18 : 22,
                        fontWeight: 800,
                        lineHeight: 1,
                        color: p.side === RED ? '#e85c4a' : '#2a2a2a',
                        textShadow: p.side === RED
                          ? '-1px -1px 0 #ff9a8a, 0 -1px 1px rgba(255,154,138,0.7), 1px 1px 0 #8a2a1a, 0 2px 0 #7a2010, 2px 3px 4px rgba(0,0,0,0.4), 0 4px 6px rgba(0,0,0,0.25)'
                          : '-1px -1px 0 #555, 0 -1px 1px rgba(120,120,120,0.4), 1px 1px 0 #000, 0 2px 0 #111, 2px 3px 4px rgba(0,0,0,0.5), 0 4px 6px rgba(0,0,0,0.3)',
                        userSelect: 'none',
                      }}
                    >
                      {showPiece(p)}
                    </span>
                  )}
                  {dot && !p && <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'rgba(0,0,0,0.25)' }} />}
                  {isCap && <div style={{ position: 'absolute', inset: 3, borderRadius: '50%', border: '3px solid rgba(0,0,0,0.25)', boxSizing: 'border-box' }} />}
                </button>
              );
            }))}
          </div>
        </div>

        <Collapse style={{ marginTop: 12 }} size="small" items={[{
          key: '1', label: '规则说明',
          children: (
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.9 }}>
              <li>棋盘 12×5：双方各占 5 行，中间 2 行为对峙带；司令部（司）必须插军旗。</li>
              <li>行营（营）为安全区：行营中的棋子不能被攻击。</li>
              <li>公路：任意棋子一步走四邻；铁路：棋子可沿铁路直线任意格，工兵可在铁路拐弯。</li>
              <li>司令 &gt; 军长 &gt; 师长 &gt; 旅长 &gt; 团长 &gt; 营长 &gt; 连长 &gt; 排长 &gt; 工兵；同级同归于尽。</li>
              <li>工兵可吃地雷；除工兵外踩地雷则亡。炸弹与任何子对碰同归于尽。</li>
              <li>军旗、地雷不能移动；夺旗或困毙对方（无子可动）即获胜。</li>
            </ul>
          )
        }]} />
      </Card>
    </div>
  );
}
