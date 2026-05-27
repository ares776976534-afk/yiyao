import React, { useState } from 'react';
import { Card, Button, Space, message } from 'antd';
import boardImg from './images/board.jpg';
import rKImg from './images/rk.gif';
import rAImg from './images/ra.gif';
import rEImg from './images/rb.gif';
import rHImg from './images/rr.gif'; // 车
import rCImg from './images/rc.gif';
import rNImg from './images/rn.gif';
import rSImg from './images/rp.gif';
import bKImg from './images/bk.gif';
import bAImg from './images/ba.gif';
import bEImg from './images/bb.gif';
import bHImg from './images/br.gif'; // 车
import bCImg from './images/bc.gif';
import bNImg from './images/bn.gif';
import bSImg from './images/bp.gif';

const BOARD_ROWS = 10;
const BOARD_COLS = 9;
const CELL_SIZE = 48;

const PIECE_IMG = {
  rK: rKImg,
  rA: rAImg,
  rE: rEImg,
  rH: rHImg, // 车
  rC: rCImg,
  rN: rNImg,
  rS: rSImg,
  bK: bKImg,
  bA: bAImg,
  bE: bEImg,
  bH: bHImg, // 车
  bC: bCImg,
  bN: bNImg,
  bS: bSImg,
};

const INIT_BOARD = [
  ['rC', 'rH', 'rE', 'rA', 'rK', 'rA', 'rE', 'rH', 'rC'],
  [null, null, null, null, null, null, null, null, null],
  [null, 'rN', null, null, null, null, null, 'rN', null],
  ['rS', null, 'rS', null, 'rS', null, 'rS', null, 'rS'],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  ['bS', null, 'bS', null, 'bS', null, 'bS', null, 'bS'],
  [null, 'bN', null, null, null, null, null, 'bN', null],
  [null, null, null, null, null, null, null, null, null],
  ['bC', 'bH', 'bE', 'bA', 'bK', 'bA', 'bE', 'bH', 'bC'],
];

const getColor = (piece) => piece ? piece[0] : null;
const isSameColor = (a, b) => a && b && getColor(a) === getColor(b);
const inBoard = (x, y) => x >= 0 && x < BOARD_ROWS && y >= 0 && y < BOARD_COLS;

function getMoves(board, x, y) {
  const piece = board[x][y];
  if (!piece) return [];
  const color = getColor(piece);
  const moves = [];
  // 这里只实现了车、马、炮、兵/卒、将/帅的基本走法
  if (piece[1] === 'C') { // 车
    // 横向
    for (let i = x - 1; i >= 0; i--) {
      if (board[i][y]) { if (!isSameColor(piece, board[i][y])) moves.push([i, y]); break; }
      moves.push([i, y]);
    }
    for (let i = x + 1; i < BOARD_ROWS; i++) {
      if (board[i][y]) { if (!isSameColor(piece, board[i][y])) moves.push([i, y]); break; }
      moves.push([i, y]);
    }
    for (let j = y - 1; j >= 0; j--) {
      if (board[x][j]) { if (!isSameColor(piece, board[x][j])) moves.push([x, j]); break; }
      moves.push([x, j]);
    }
    for (let j = y + 1; j < BOARD_COLS; j++) {
      if (board[x][j]) { if (!isSameColor(piece, board[x][j])) moves.push([x, j]); break; }
      moves.push([x, j]);
    }
  } else if (piece[1] === 'H') { // 马
    const horse = [
      [-2, -1], [-2, 1], [2, -1], [2, 1],
      [-1, -2], [-1, 2], [1, -2], [1, 2],
    ];
    for (const [dx, dy] of horse) {
      const nx = x + dx, ny = y + dy;
      if (!inBoard(nx, ny)) continue;
      // "蹩马腿"
      if (Math.abs(dx) === 2 && board[x + dx / 2][y]) continue;
      if (Math.abs(dy) === 2 && board[x][y + dy / 2]) continue;
      if (!isSameColor(piece, board[nx][ny])) moves.push([nx, ny]);
    }
  } else if (piece[1] === 'N') { // 炮
    // 走法同车，吃子需隔一个
    // 不吃子
    for (let i = x - 1; i >= 0; i--) {
      if (board[i][y]) break;
      moves.push([i, y]);
    }
    for (let i = x + 1; i < BOARD_ROWS; i++) {
      if (board[i][y]) break;
      moves.push([i, y]);
    }
    for (let j = y - 1; j >= 0; j--) {
      if (board[x][j]) break;
      moves.push([x, j]);
    }
    for (let j = y + 1; j < BOARD_COLS; j++) {
      if (board[x][j]) break;
      moves.push([x, j]);
    }
    // 吃子
    const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
    for (const [dx, dy] of dirs) {
      let i = x + dx, j = y + dy, found = false;
      while (inBoard(i, j)) {
        if (!found && board[i][j]) { found = true; i += dx; j += dy; continue; }
        if (found && board[i][j]) { if (!isSameColor(piece, board[i][j])) moves.push([i, j]); break; }
        i += dx; j += dy;
      }
    }
  } else if (piece[1] === 'S') { // 兵/卒
    const dir = color === 'r' ? -1 : 1;
    const nx = x + dir;
    if (inBoard(nx, y) && !isSameColor(piece, board[nx][y])) moves.push([nx, y]);
    if ((color === 'r' && x <= 4) || (color === 'b' && x >= 5)) {
      // 过河后可左右走
      if (inBoard(x, y - 1) && !isSameColor(piece, board[x][y - 1])) moves.push([x, y - 1]);
      if (inBoard(x, y + 1) && !isSameColor(piece, board[x][y + 1])) moves.push([x, y + 1]);
    }
  } else if (piece[1] === 'K') { // 将/帅
    // 九宫格内移动
    const palace = color === 'r' ? [7, 9, 3, 5] : [0, 2, 3, 5];
    const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (nx >= palace[0] && nx <= palace[1] && ny >= palace[2] && ny <= palace[3]) {
        if (!isSameColor(piece, board[nx][ny])) moves.push([nx, ny]);
      }
    }
    // "将帅对面"
    let oppX = color === 'r' ? 0 : 9;
    let ok = true;
    for (let i = x + (color === 'r' ? -1 : 1); i !== oppX + (color === 'r' ? -1 : 1); i += (color === 'r' ? -1 : 1)) {
      if (board[i][y]) { ok = false; break; }
    }
    if (ok && board[oppX][y] && board[oppX][y][1] === 'K') moves.push([oppX, y]);
  }
  // 其他棋子可自行扩展
  return moves;
}

// 检查是否胜负
function checkWinner(board) {
  let rK = false, bK = false;
  for (let i = 0; i < BOARD_ROWS; i++) {
    for (let j = 0; j < BOARD_COLS; j++) {
      if (board[i][j] === 'rK') rK = true;
      if (board[i][j] === 'bK') bK = true;
    }
  }
  if (!rK) return '黑方胜';
  if (!bK) return '红方胜';
  return null;
}

// 棋盘主组件
export default function ChineseChess() {
  const [board, setBoard] = useState(JSON.parse(JSON.stringify(INIT_BOARD)));
  const [turn, setTurn] = useState('r');
  const [selected, setSelected] = useState(null);
  const [moves, setMoves] = useState([]);
  const [winner, setWinner] = useState(null);

  // 选中棋子
  const handleSelect = (x, y) => {
    if (winner) return;
    const piece = board[x][y];
    if (!piece || getColor(piece) !== turn) return;
    setSelected([x, y]);
    setMoves(getMoves(board, x, y));
  };

  // 落子
  const handleMove = (x, y) => {
    if (!selected) return;
    const [sx, sy] = selected;
    if (sx === x && sy === y) { setSelected(null); setMoves([]); return; }
    if (!moves.some(([mx, my]) => mx === x && my === y)) return;
    const newBoard = board.map(row => row.slice());
    newBoard[x][y] = newBoard[sx][sy];
    newBoard[sx][sy] = null;
    setBoard(newBoard);
    setSelected(null);
    setMoves([]);
    const win = checkWinner(newBoard);
    if (win) {
      setWinner(win);
      message.success(win);
    } else {
      setTurn(turn === 'r' ? 'b' : 'r');
    }
  };

  // 重置
  const handleReset = () => {
    setBoard(JSON.parse(JSON.stringify(INIT_BOARD)));
    setTurn('r');
    setSelected(null);
    setMoves([]);
    setWinner(null);
  };

  // 棋盘渲染
  return (
    <Card title="中国象棋" extra={<Button onClick={handleReset}>重置</Button>} style={{ maxWidth: CELL_SIZE * BOARD_COLS + 32, margin: '0 auto' }}>
      <div style={{ marginBottom: 12 }}>
        {winner ? <b style={{ color: 'red' }}>{winner}</b> : `当前回合：${turn === 'r' ? '红方' : '黑方'}`}
      </div>
      <div style={{
        position: 'relative',
        width: CELL_SIZE * BOARD_COLS,
        height: CELL_SIZE * BOARD_ROWS,
        margin: '0 auto',
        background: `url(${boardImg})`,
        backgroundSize: 'cover',
        border: '2px solid #888',
      }}>
        {/* 棋子 */}
        {[...board].reverse().map((row, i) =>
          row.map((piece, j) => {
            // 反转后，实际棋盘行号为 BOARD_ROWS-1-i
            const realI = BOARD_ROWS - 1 - i;
            return piece ? (
              <img
                key={piece + '-' + realI + '-' + j}
                src={PIECE_IMG[piece]}
                alt={piece}
                style={{
                  position: 'absolute',
                  left: j * CELL_SIZE,
                  top: i * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  zIndex: 2,
                  cursor: winner ? 'not-allowed' : getColor(piece) === turn ? 'pointer' : 'default',
                  boxShadow: selected && selected[0] === realI && selected[1] === j ? '0 0 8px 4px #ffe066' : undefined,
                  borderRadius: '50%',
                  border: selected && selected[0] === realI && selected[1] === j ? '2px solid #ffe066' : undefined,
                }}
                onClick={() => {
                  if (winner) return;
                  if (getColor(piece) === turn) handleSelect(realI, j);
                }}
              />
            ) : null;
          })
        )}
        {/* 走法提示 */}
        {selected && moves.map(([mx, my]) => (
          <div
            key={`hint-${mx}-${my}`}
            style={{
              position: 'absolute',
              left: my * CELL_SIZE,
              top: (BOARD_ROWS - 1 - mx) * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
              background: 'rgba(50,200,255,0.35)',
              borderRadius: '50%',
              zIndex: 3,
              border: '2px solid #40c9ff',
              cursor: 'pointer',
            }}
            onClick={() => handleMove(mx, my)}
          />
        ))}
        {/* 点击空格落子 */}
        {selected && moves.map(([mx, my]) => !board[mx][my] && (
          <div
            key={`empty-${mx}-${my}`}
            style={{
              position: 'absolute',
              left: my * CELL_SIZE,
              top: (BOARD_ROWS - 1 - mx) * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
              zIndex: 1,
              cursor: 'pointer',
            }}
            onClick={() => handleMove(mx, my)}
          />
        ))}
      </div>
      <Space style={{ marginTop: 16 }}>
        <span>操作说明：</span>
        <span>点击己方棋子高亮，点击蓝色提示圈完成移动。</span>
      </Space>
    </Card>
  );
}
