import { useState, useCallback } from 'react';
import { Button, Card, Space, Tag, Segmented } from 'antd';

const SIZE = 15;
const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;

function createBoard() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(EMPTY));
}

function checkWin(board, r, c, player) {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (const [dr, dc] of dirs) {
    let count = 1;
    for (const sign of [1, -1]) {
      let nr = r + dr * sign, nc = c + dc * sign;
      while (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && board[nr][nc] === player) {
        count++;
        nr += dr * sign;
        nc += dc * sign;
      }
    }
    if (count >= 5) return true;
  }
  return false;
}

function getCandidates(board) {
  const set = new Set();
  let has = false;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!board[r][c]) continue;
      has = true;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && !board[nr][nc]) set.add(`${nr},${nc}`);
        }
      }
    }
  }
  if (!has) return [[7, 7]];
  return [...set].map(s => s.split(',').map(Number));
}

function lineScore(board, r, c, dr, dc, player) {
  let count = 0, open = 0;
  let nr = r + dr, nc = c + dc;
  while (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && board[nr][nc] === player) {
    count++;
    nr += dr;
    nc += dc;
  }
  if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && !board[nr][nc]) open++;
  nr = r - dr;
  nc = c - dc;
  while (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && board[nr][nc] === player) {
    count++;
    nr -= dr;
    nc -= dc;
  }
  if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && !board[nr][nc]) open++;
  return { count, open };
}

function scoreCell(board, r, c, player) {
  if (board[r][c]) return -1;
  let s = 0;
  for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
    const { count, open } = lineScore(board, r, c, dr, dc, player);
    if (count >= 4) s += 100000;
    else if (count === 3 && open === 2) s += 8000;
    else if (count === 3 && open === 1) s += 800;
    else if (count === 2 && open === 2) s += 80;
    else if (count === 2 && open === 1) s += 8;
    else if (count === 1 && open === 2) s += 4;
  }
  s += 14 - Math.abs(r - 7) - Math.abs(c - 7);
  return s;
}

function findWinMove(board, player) {
  for (const [r, c] of getCandidates(board)) {
    board[r][c] = player;
    const win = checkWin(board, r, c, player);
    board[r][c] = EMPTY;
    if (win) return [r, c];
  }
  return null;
}

function aiPick(board, ai, human) {
  const copy = board.map(r => [...r]);
  const win = findWinMove(copy, ai);
  if (win) return win;
  const block = findWinMove(copy.map(r => [...r]), human);
  if (block) return block;
  let best = null, bestS = -1;
  for (const [r, c] of getCandidates(board)) {
    const s = scoreCell(board, r, c, ai) + scoreCell(board, r, c, human) * 0.92;
    if (s > bestS) { bestS = s; best = [r, c]; }
  }
  return best || [7, 7];
}

export default function Gomoku() {
  const [mode, setMode] = useState('ai');
  const [board, setBoard] = useState(createBoard);
  const [turn, setTurn] = useState(BLACK);
  const [winner, setWinner] = useState(null);
  const [history, setHistory] = useState([]);
  const [thinking, setThinking] = useState(false);

  const reset = () => {
    setBoard(createBoard());
    setTurn(BLACK);
    setWinner(null);
    setHistory([]);
    setThinking(false);
  };

  const applyMove = useCallback((r, c, player, prevBoard) => {
    const next = prevBoard.map(row => [...row]);
    next[r][c] = player;
    if (checkWin(next, r, c, player)) {
      setBoard(next);
      setWinner(player);
      setThinking(false);
      return true;
    }
    setBoard(next);
    setTurn(player === BLACK ? WHITE : BLACK);
    return false;
  }, []);

  const runAi = useCallback((currentBoard) => {
    setThinking(true);
    setTimeout(() => {
      const b = currentBoard.map(row => [...row]);
      const [r, c] = aiPick(b, WHITE, BLACK);
      setHistory(h => [...h, { board: b, turn: WHITE }]);
      applyMove(r, c, WHITE, b);
      setThinking(false);
    }, 280);
  }, [applyMove]);

  const place = useCallback((r, c) => {
    if (winner || board[r][c] || thinking) return;
    if (mode === 'ai' && turn !== BLACK) return;
    setHistory(h => [...h, { board, turn }]);
    const ended = applyMove(r, c, turn, board);
    if (!ended && mode === 'ai' && turn === BLACK) {
      const nextBoard = board.map(row => [...row]);
      nextBoard[r][c] = BLACK;
      runAi(nextBoard);
    }
  }, [board, turn, winner, thinking, mode, applyMove, runAi]);

  const undo = () => {
    if (!history.length || winner) return;
    const steps = mode === 'ai' ? 2 : 1;
    if (history.length < steps) return;
    const prev = history[history.length - steps];
    setBoard(prev.board);
    setTurn(prev.turn);
    setHistory(h => h.slice(0, -steps));
    setThinking(false);
  };

  const statusText = () => {
    if (winner) return winner === BLACK ? '你赢了' : mode === 'ai' ? '电脑赢了' : '白棋胜';
    if (thinking) return '电脑思考中...';
    if (mode === 'ai') return turn === BLACK ? '你的回合（黑棋）' : '电脑回合';
    return turn === BLACK ? '黑棋回合' : '白棋回合';
  };

  const cell = 32;
  const pad = 16;
  const canClick = !winner && !thinking && (mode === 'pvp' || turn === BLACK);

  return (
    <div>
      <Card
        title="五子棋"
        extra={
          <Space wrap>
            <Segmented
              value={mode}
              onChange={v => { setMode(v); reset(); }}
              options={[
                { label: '人机对战', value: 'ai' },
                { label: '双人对战', value: 'pvp' }
              ]}
            />
            <Tag color={turn === BLACK ? 'default' : 'blue'}>{statusText()}</Tag>
            <Button onClick={undo} disabled={!history.length || !!winner || thinking}>悔棋</Button>
            <Button type="primary" onClick={reset}>重新开始</Button>
          </Space>
        }
      >
        <div
          style={{
            position: 'relative',
            width: pad * 2 + cell * (SIZE - 1),
            height: pad * 2 + cell * (SIZE - 1),
            background: '#dcb35c',
            borderRadius: 8,
            boxShadow: 'inset 0 0 0 2px #8b6914',
            opacity: thinking ? 0.85 : 1
          }}
        >
          {Array.from({ length: SIZE }, (_, i) => (
            <div key={`h${i}`} style={{ position: 'absolute', left: pad, top: pad + i * cell, width: cell * (SIZE - 1), height: 1, background: '#5c4a1f' }} />
          ))}
          {Array.from({ length: SIZE }, (_, i) => (
            <div key={`v${i}`} style={{ position: 'absolute', left: pad + i * cell, top: pad, width: 1, height: cell * (SIZE - 1), background: '#5c4a1f' }} />
          ))}
          {board.map((row, r) =>
            row.map((stone, c) => (
              <button
                key={`${r}-${c}`}
                type="button"
                onClick={() => place(r, c)}
                disabled={!canClick}
                style={{
                  position: 'absolute',
                  left: pad + c * cell - cell / 2,
                  top: pad + r * cell - cell / 2,
                  width: cell,
                  height: cell,
                  padding: 0,
                  border: 'none',
                  background: 'transparent',
                  cursor: canClick ? 'pointer' : 'default'
                }}
              >
                {stone !== EMPTY && (
                  <span style={{
                    display: 'block', width: cell - 8, height: cell - 8, margin: '4px auto',
                    borderRadius: '50%',
                    background: stone === BLACK ? '#1a1a1a' : '#fff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.35)',
                    border: stone === WHITE ? '1px solid #bbb' : 'none'
                  }} />
                )}
              </button>
            ))
          )}
        </div>
        <p style={{ marginTop: 12, color: '#666', fontSize: 13, marginBottom: 0 }}>
          {mode === 'ai' ? '你执黑先手，电脑执白；悔棋会撤回你和电脑各一步' : '黑棋先手，横竖斜先连成五子获胜'}
        </p>
      </Card>
    </div>
  );
}
