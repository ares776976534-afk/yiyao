import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Card, Space, Statistic } from 'antd';

const COLS = 10;
const ROWS = 20;
const SHAPES = [
  { m: [[1, 1, 1, 1]], c: 0 },
  { m: [[1, 1], [1, 1]], c: 1 },
  { m: [[0, 1, 0], [1, 1, 1]], c: 2 },
  { m: [[1, 0, 0], [1, 1, 1]], c: 3 },
  { m: [[0, 0, 1], [1, 1, 1]], c: 4 },
  { m: [[0, 1, 1], [1, 1, 0]], c: 5 },
  { m: [[1, 1, 0], [0, 1, 1]], c: 6 }
];
const COLORS = ['#00f0f0', '#f0f000', '#a000f0', '#f0a000', '#0000f0', '#00f000', '#f00000'];

const emptyBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0));

function rotate(m) {
  const r = m.length, c = m[0].length;
  return Array.from({ length: c }, (_, i) => Array.from({ length: r }, (_, j) => m[r - 1 - j][i]));
}

function collides(board, shape, px, py) {
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (!shape[y][x]) continue;
      const ny = py + y, nx = px + x;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny >= 0 && board[ny][nx]) return true;
    }
  }
  return false;
}

function merge(board, shape, px, py, colorIdx) {
  const next = board.map(r => [...r]);
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x] && py + y >= 0) next[py + y][px + x] = colorIdx + 1;
    }
  }
  return next;
}

function clearLines(board) {
  let lines = 0;
  const next = board.filter(row => {
    if (row.every(c => c)) { lines++; return false; }
    return true;
  });
  while (next.length < ROWS) next.unshift(Array(COLS).fill(0));
  return { board: next, lines };
}

function randomPiece() {
  const { m, c } = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  return { shape: m.map(r => [...r]), color: c };
}

export default function Tetris() {
  const [board, setBoard] = useState(emptyBoard);
  const [cur, setCur] = useState(null);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const ref = useRef({ board: emptyBoard(), cur: null, gameOver: false, paused: false });

  const spawn = useCallback((b) => {
    const piece = randomPiece();
    const pos = { x: 3, y: 0 };
    if (collides(b, piece.shape, pos.x, pos.y)) {
      setGameOver(true);
      ref.current.gameOver = true;
      return;
    }
    const next = { ...piece, pos };
    setCur(next);
    ref.current.cur = next;
  }, []);

  const start = useCallback(() => {
    const b = emptyBoard();
    setBoard(b);
    setScore(0);
    setLines(0);
    setGameOver(false);
    setPaused(false);
    ref.current = { board: b, cur: null, gameOver: false, paused: false };
    spawn(b);
  }, [spawn]);

  const lockPiece = useCallback(() => {
    const { board: b, cur: c } = ref.current;
    if (!c) return;
    const merged = merge(b, c.shape, c.pos.x, c.pos.y, c.color);
    const { board: cleared, lines: n } = clearLines(merged);
    setBoard(cleared);
    setLines(l => l + n);
    setScore(s => s + ([0, 100, 300, 500, 800][n] || n * 200));
    ref.current.board = cleared;
    ref.current.cur = null;
    setCur(null);
    spawn(cleared);
  }, [spawn]);

  const tryMove = useCallback((dx, dy, rot = false) => {
    const { board: b, cur: c, gameOver: go, paused: pa } = ref.current;
    if (go || pa || !c) return;
    const shape = rot ? rotate(c.shape) : c.shape;
    const pos = { x: c.pos.x + dx, y: c.pos.y + dy };
    if (!collides(b, shape, pos.x, pos.y)) {
      const next = { ...c, shape, pos };
      setCur(next);
      ref.current.cur = next;
      return;
    }
    if (dy > 0) lockPiece();
  }, [lockPiece]);

  const hardDrop = useCallback(() => {
    const { board: b, cur: c, gameOver: go, paused: pa } = ref.current;
    if (go || pa || !c) return;
    let y = c.pos.y;
    while (!collides(b, c.shape, c.pos.x, y + 1)) y++;
    ref.current.cur = { ...c, pos: { x: c.pos.x, y } };
    setCur(ref.current.cur);
    requestAnimationFrame(() => lockPiece());
  }, [lockPiece]);

  useEffect(() => { start(); }, [start]);

  useEffect(() => {
    ref.current.board = board;
    ref.current.paused = paused;
    ref.current.gameOver = gameOver;
  }, [board, paused, gameOver]);

  useEffect(() => {
    const onKey = (e) => {
      if (ref.current.gameOver) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); tryMove(-1, 0); }
      if (e.key === 'ArrowRight') { e.preventDefault(); tryMove(1, 0); }
      if (e.key === 'ArrowDown') { e.preventDefault(); tryMove(0, 1); }
      if (e.key === 'ArrowUp') { e.preventDefault(); tryMove(0, 0, true); }
      if (e.key === ' ') { e.preventDefault(); hardDrop(); }
      if (e.key === 'p' || e.key === 'P') setPaused(p => { ref.current.paused = !p; return !p; });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tryMove, hardDrop]);

  useEffect(() => {
    if (gameOver || paused) return;
    const t = setInterval(() => tryMove(0, 1), 550);
    return () => clearInterval(t);
  }, [gameOver, paused, tryMove]);

  const display = board.map(r => [...r]);
  if (cur && !gameOver) {
    for (let y = 0; y < cur.shape.length; y++) {
      for (let x = 0; x < cur.shape[y].length; x++) {
        if (cur.shape[y][x] && cur.pos.y + y >= 0) {
          display[cur.pos.y + y][cur.pos.x + x] = cur.color + 1;
        }
      }
    }
  }

  return (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      <Card title="俄罗斯方块">
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, 26px)`, background: '#0f0f23', padding: 6, borderRadius: 8 }}>
          {display.map((row, i) => row.map((v, j) => (
            <div
              key={`${i}-${j}`}
              style={{
                width: 26, height: 26,
                background: v ? COLORS[(v - 1) % COLORS.length] : '#1a1a2e',
                border: '1px solid #16213e',
                boxSizing: 'border-box'
              }}
            />
          )))}
        </div>
        {gameOver && <div style={{ textAlign: 'center', marginTop: 12, color: '#f5222d', fontWeight: 600 }}>游戏结束</div>}
      </Card>
      <Card style={{ minWidth: 200 }}>
        <Space direction="vertical" size="large">
          <Statistic title="得分" value={score} />
          <Statistic title="消除行数" value={lines} />
          <Space>
            <Button type="primary" onClick={start}>重新开始</Button>
            <Button onClick={() => setPaused(p => !p)}>{paused ? '继续' : '暂停'}</Button>
          </Space>
          <div style={{ color: '#666', fontSize: 13, lineHeight: 1.8 }}>
            ← → 移动 · ↑ 旋转 · ↓ 下落 · 空格 硬降 · P 暂停
          </div>
        </Space>
      </Card>
    </div>
  );
}
