import { useState, useCallback, useRef } from 'react';
import { Button, Card, Space, Tag, message } from 'antd';
import { ReloadOutlined, UndoOutlined, TrophyOutlined } from '@ant-design/icons';

const DIRS = [[0, 1], [1, 0], [0, -1], [-1, 0]];
const PAD = 48;
const CELL = 56;
const R = 18;

const LEVEL_CFG = [
  { w: 3, h: 2, count: 6, decoy: 0 },
  { w: 4, h: 2, count: 8, decoy: 0.2 },
  { w: 3, h: 3, count: 9, decoy: 0.25 },
  { w: 4, h: 3, count: 12, decoy: 0.35 },
  { w: 4, h: 4, count: 14, decoy: 0.4 },
  { w: 5, h: 4, count: 16, decoy: 0.45 },
  { w: 5, h: 5, count: 18, decoy: 0.5 },
  { w: 6, h: 5, count: 22, decoy: 0.55 },
  { w: 6, h: 6, count: 24, decoy: 0.6 },
  { w: 7, h: 6, count: 28, decoy: 0.65 }
];

function shuffle(a) {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function findHamiltonianPath(w, h, target) {
  const used = Array.from({ length: h }, () => Array(w).fill(false));
  const path = [];
  const starts = shuffle([...Array(w * h)].map((_, i) => ({ r: Math.floor(i / w), c: i % w })));

  const dfs = (r, c) => {
    if (path.length === target) return true;
    const opts = shuffle(DIRS.map(([dr, dc]) => ({ r: r + dr, c: c + dc })))
      .filter(({ r: nr, c: nc }) => nr >= 0 && nr < h && nc >= 0 && nc < w && !used[nr][nc]);
    for (const { r: nr, c: nc } of opts) {
      used[nr][nc] = true;
      path.push({ r: nr, c: nc });
      if (dfs(nr, nc)) return true;
      path.pop();
      used[nr][nc] = false;
    }
    return false;
  };

  for (const { r, c } of starts) {
    path.length = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) used[y][x] = false;
    used[r][c] = true;
    path.push({ r, c });
    if (dfs(r, c)) return path;
  }
  return null;
}

function buildLevel(cfg) {
  let path = null;
  for (let t = 0; t < 80; t++) {
    path = findHamiltonianPath(cfg.w, cfg.h, cfg.count);
    if (path) break;
  }
  if (!path) {
    path = [];
    for (let r = 0; r < cfg.h && path.length < cfg.count; r++) {
      for (let c = 0; c < cfg.w && path.length < cfg.count; c++) path.push({ r, c });
    }
  }

  const nodes = path.map((p, id) => ({
    id,
    x: PAD + p.c * CELL,
    y: PAD + p.r * CELL
  }));

  const posId = new Map(path.map((p, id) => [`${p.r},${p.c}`, id]));
  const edgeKey = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);
  const edges = new Set();

  for (let i = 0; i < path.length - 1; i++) edges.add(edgeKey(i, i + 1));

  const decoys = [];
  for (let i = 0; i < path.length; i++) {
    for (const [dr, dc] of DIRS) {
      const nr = path[i].r + dr, nc = path[i].c + dc;
      const j = posId.get(`${nr},${nc}`);
      if (j === undefined || Math.abs(i - j) === 1) continue;
      decoys.push(edgeKey(i, j));
    }
  }
  shuffle(decoys).slice(0, Math.floor(decoys.length * cfg.decoy)).forEach(k => edges.add(k));

  return { nodes, edges: [...edges].map(k => k.split('-').map(Number)), w: cfg.w, h: cfg.h };
}

function generateAllLevels() {
  return LEVEL_CFG.map(cfg => buildLevel(cfg));
}

function hasEdge(edges, a, b) {
  return edges.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

function isPathEdge(visited, a, b) {
  const ia = visited.indexOf(a), ib = visited.indexOf(b);
  return ia >= 0 && ib >= 0 && Math.abs(ia - ib) === 1;
}

function extendPath(path, id, edges) {
  if (!path.length) return [id];
  const cur = path[path.length - 1];
  if (id === cur) return path;
  if (path.length >= 2 && path[path.length - 2] === id) return path.slice(0, -1);
  if (path.includes(id)) return path;
  if (!hasEdge(edges, cur, id)) return path;
  return [...path, id];
}

export default function OneStroke() {
  const [levels, setLevels] = useState(() => generateAllLevels());
  const [lv, setLv] = useState(0);
  const [visited, setVisited] = useState([]);
  const [wonAll, setWonAll] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [cursor, setCursor] = useState(null);
  const svgRef = useRef(null);
  const draggingRef = useRef(false);

  const level = levels[lv];
  const svgW = PAD * 2 + (level.w - 1) * CELL + R * 2;
  const svgH = PAD * 2 + (level.h - 1) * CELL + R * 2;

  const resetLevel = useCallback(() => setVisited([]), []);

  const regen = () => {
    setLevels(generateAllLevels());
    setLv(0);
    setVisited([]);
    setWonAll(false);
    draggingRef.current = false;
    setDragging(false);
    setCursor(null);
  };

  const checkWin = useCallback((next) => {
    if (next.length !== level.nodes.length) return;
    message.success(`第 ${lv + 1} 关通过！`);
    if (lv >= 9) setWonAll(true);
    else setTimeout(() => { setLv(l => l + 1); setVisited([]); }, 600);
  }, [level.nodes.length, lv]);

  const clientToSvg = (clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  };

  const hitNode = (x, y) => {
    const hitR = R + 10;
    for (let i = level.nodes.length - 1; i >= 0; i--) {
      const n = level.nodes[i];
      const dx = x - n.x, dy = y - n.y;
      if (dx * dx + dy * dy <= hitR * hitR) return n.id;
    }
    return null;
  };

  const applyNode = (id) => {
    setVisited(prev => {
      const next = extendPath(prev, id, level.edges);
      if (next !== prev && next.length === level.nodes.length) checkWin(next);
      return next;
    });
  };

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    const pt = clientToSvg(e.clientX, e.clientY);
    if (!pt) return;
    const id = hitNode(pt.x, pt.y);
    if (id === null) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingRef.current = true;
    setDragging(true);
    setCursor({ x: pt.x, y: pt.y });
    applyNode(id);
  };

  const onPointerMove = (e) => {
    const pt = clientToSvg(e.clientX, e.clientY);
    if (!pt) return;
    setCursor({ x: pt.x, y: pt.y });
    if (!draggingRef.current) return;
    const id = hitNode(pt.x, pt.y);
    if (id !== null) applyNode(id);
  };

  const onPointerUp = () => {
    draggingRef.current = false;
    setDragging(false);
    setCursor(null);
  };

  const pathD = visited.length > 1
    ? visited.map((id, i) => {
        const n = level.nodes[id];
        return `${i === 0 ? 'M' : 'L'} ${n.x} ${n.y}`;
      }).join(' ')
    : '';

  const lastNode = visited.length ? level.nodes[visited[visited.length - 1]] : null;
  const diffLabel = ['简单', '简单', '一般', '一般', '中等', '中等', '较难', '较难', '困难', '困难'][lv];

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>一笔连珠</h2>
          <span style={{ color: '#8c8c8c', fontSize: 13 }}>按住圆珠拖动连线，每颗只能点亮一次</span>
        </div>
        <Space wrap>
          <Tag color="blue">第 {lv + 1} / 10 关</Tag>
          <Tag>{diffLabel}</Tag>
          <Tag>{visited.length} / {level.nodes.length}</Tag>
          <Button icon={<UndoOutlined />} onClick={() => visited.length && setVisited(v => v.slice(0, -1))} disabled={!visited.length}>撤销</Button>
          <Button icon={<ReloadOutlined />} onClick={resetLevel}>重开本关</Button>
          <Button onClick={regen}>重新随机关卡</Button>
        </Space>
      </div>

      <Card>
        <svg
          ref={svgRef}
          width="100%"
          viewBox={`0 0 ${svgW} ${svgH}`}
          style={{ display: 'block', background: 'linear-gradient(160deg,#1a1a2e,#16213e)', borderRadius: 12, touchAction: 'none', cursor: dragging ? 'grabbing' : 'default', userSelect: 'none' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {level.edges.map(([a, b], i) => {
            const na = level.nodes[a], nb = level.nodes[b];
            const lit = isPathEdge(visited, a, b);
            return (
              <line
                key={i}
                x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                stroke={lit ? '#ffd666' : 'rgba(255,255,255,0.15)'}
                strokeWidth={lit ? 4 : 2}
                strokeLinecap="round"
              />
            );
          })}
          {pathD && (
            <path d={pathD} fill="none" stroke="#ffec3d" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
          )}
          {dragging && lastNode && cursor && (
            <line
              x1={lastNode.x} y1={lastNode.y} x2={cursor.x} y2={cursor.y}
              stroke="rgba(255,236,61,0.45)" strokeWidth={3} strokeLinecap="round"
            />
          )}
          {level.nodes.map((n) => {
            const on = visited.includes(n.id);
            const order = visited.indexOf(n.id);
            const isLast = order === visited.length - 1;
            return (
              <g key={n.id} style={{ pointerEvents: 'none' }}>
                <circle cx={n.x} cy={n.y} r={R + 6} fill="transparent" />
                <circle
                  cx={n.x} cy={n.y} r={R}
                  fill={on ? (isLast ? '#ff7875' : '#ffc53d') : '#434343'}
                  stroke={on ? '#fff' : '#8c8c8c'}
                  strokeWidth={on ? 3 : 2}
                />
                {on && (
                  <text x={n.x} y={n.y + 5} textAnchor="middle" fontSize={12} fontWeight={700} fill="#1a1a1a">
                    {order + 1}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </Card>

      {wonAll && (
        <Card style={{ marginTop: 16, textAlign: 'center', background: 'linear-gradient(135deg,#fff7e6,#fff1b8)' }}>
          <TrophyOutlined style={{ fontSize: 48, color: '#faad14', marginBottom: 8 }} />
          <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>全部通关！</div>
          <Button type="primary" onClick={regen}>再玩一次</Button>
        </Card>
      )}

      <p style={{ marginTop: 12, color: '#8c8c8c', fontSize: 13, textAlign: 'center' }}>
        按住任意圆珠拖动滑过相邻圆珠，滑回上一颗可撤销一步
      </p>
    </div>
  );
}
