import { useState, useCallback, useEffect, useRef } from 'react';
import { Button, Space, Segmented, message } from 'antd';
import { ReloadOutlined, DeliveredProcedureOutlined, TrophyOutlined } from '@ant-design/icons';

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUIT_SYM = ['♠', '♥', '♣', '♦'];
const RED = new Set([1, 3]);
const CW = 68;
const CH = 96;
const OVERLAP = 26;

const felt = {
  background: 'linear-gradient(160deg, #1a6b42 0%, #0f4d2e 45%, #0a3d24 100%)',
  borderRadius: 16,
  boxShadow: 'inset 0 2px 24px rgba(0,0,0,0.25), 0 8px 32px rgba(0,0,0,0.15)',
  border: '3px solid #2d8a5a'
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(suitCount) {
  const cards = [];
  if (suitCount === 1) {
    for (let n = 0; n < 8; n++) {
      for (let r = 1; r <= 13; r++) cards.push({ suit: 0, rank: r, faceUp: false });
    }
  } else if (suitCount === 2) {
    for (let n = 0; n < 4; n++) {
      for (let s = 0; s < 2; s++) {
        for (let r = 1; r <= 13; r++) cards.push({ suit: s, rank: r, faceUp: false });
      }
    }
  } else {
    for (let d = 0; d < 2; d++) {
      for (let s = 0; s < 4; s++) {
        for (let r = 1; r <= 13; r++) cards.push({ suit: s, rank: r, faceUp: false });
      }
    }
  }
  return shuffle(cards);
}

const DECK_INFO = { 1: '2副牌·单色(104张)', 2: '2副牌·双色(104张)', 4: '2副牌·四色(104张)' };
const TABLEAU_DEAL = 54;
const STOCK_INIT = 104 - TABLEAU_DEAL;
const DEAL_ANIM_MS = 200;

function initialState(suitCount) {
  const deck = buildDeck(suitCount);
  const tableau = Array.from({ length: 10 }, () => []);
  let i = 0;
  for (let c = 0; c < 10; c++) {
    const n = c < 4 ? 6 : 5;
    for (let j = 0; j < n; j++) tableau[c].push({ ...deck[i++], faceUp: j === n - 1 });
  }
  return { tableau, stock: deck.slice(i), completed: 0 };
}

function sameSuitStack(stack) {
  if (!stack.length || !stack[0].faceUp) return false;
  for (let k = 0; k < stack.length - 1; k++) {
    const a = stack[k], b = stack[k + 1];
    if (!b.faceUp || a.suit !== b.suit || a.rank !== b.rank + 1) return false;
  }
  return true;
}

function findMovableStart(col) {
  if (!col.length) return -1;
  let start = col.length - 1;
  if (!col[start].faceUp) return -1;
  while (start > 0) {
    const a = col[start - 1], b = col[start];
    if (a.faceUp && a.suit === b.suit && a.rank === b.rank + 1) start--;
    else break;
  }
  return start;
}

function getDragStack(col, clickIdx) {
  if (!col[clickIdx]?.faceUp) return null;
  const stack = col.slice(clickIdx);
  if (stack.length > 1 && !sameSuitStack(stack)) return null;
  return { start: clickIdx, stack };
}

function canDrop(tableau, fromCol, start, toCol) {
  if (fromCol === toCol) return false;
  const stack = tableau[fromCol].slice(start);
  if (!stack.length || !stack[0].faceUp) return false;
  if (stack.length > 1 && !sameSuitStack(stack)) return false;
  const top = tableau[toCol].length ? tableau[toCol][tableau[toCol].length - 1] : null;
  return canPlaceOn(top, stack[0]);
}

function canPlaceOn(top, card) {
  return !top || top.rank === card.rank + 1;
}

function tryRemoveKSequence(col) {
  if (col.length < 13) return { col, removed: false };
  const tail = col.slice(-13);
  if (tail[0].rank !== 13 || tail[12].rank !== 1) return { col, removed: false };
  if (!tail.every(c => c.faceUp)) return { col, removed: false };
  for (let k = 0; k < 12; k++) {
    if (tail[k].suit !== tail[0].suit || tail[k].rank !== tail[k + 1].rank + 1) return { col, removed: false };
  }
  return { col: col.slice(0, -13), removed: true };
}

function flipColumnTop(col) {
  if (!col.length || col[col.length - 1].faceUp) return col;
  const c = [...col];
  c[c.length - 1] = { ...c[c.length - 1], faceUp: true };
  return c;
}

function finalizeTableau(tableau, completed) {
  let t = tableau.map(c => [...c]);
  let comp = completed;
  for (let c = 0; c < 10; c++) {
    let { col, removed } = tryRemoveKSequence(t[c]);
    while (removed) {
      comp++;
      ({ col, removed } = tryRemoveKSequence(col));
    }
    t[c] = flipColumnTop(col);
  }
  return { tableau: t, completed: comp };
}

function suitIndex(suit, mode) {
  if (mode === 1) return 0;
  if (mode === 2) return suit % 2 === 0 ? 0 : 1;
  return suit % 4;
}

function CardBack({ small }) {
  const w = small ? 48 : CW, h = small ? 68 : CH;
  return (
    <div style={{
      width: w, height: h, borderRadius: 8, boxSizing: 'border-box',
      background: 'linear-gradient(145deg, #1e4d8c 0%, #163a6e 50%, #0f2a52 100%)',
      border: '2px solid #fff',
      boxShadow: '0 4px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
      position: 'relative', overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', inset: 6, borderRadius: 4,
        border: '1px solid rgba(255,255,255,0.15)',
        background: `repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.06) 4px, rgba(255,255,255,0.06) 8px)`
      }} />
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: small ? 22 : 28, color: 'rgba(255,255,255,0.25)', fontWeight: 700
      }}>♠</div>
    </div>
  );
}

function PlayingCard({ card, suitMode, selected, lifted, dragging }) {
  if (!card.faceUp) return <CardBack />;
  const si = suitIndex(card.suit, suitMode);
  const red = RED.has(si);
  const color = red ? '#c41e3a' : '#1a1a2e';
  return (
    <div style={{
      width: CW, height: CH, borderRadius: 8, boxSizing: 'border-box',
      background: 'linear-gradient(180deg, #ffffff 0%, #f5f5f5 100%)',
      border: selected || dragging ? '2px solid #faad14' : '1px solid #d9d9d9',
      boxShadow: dragging
        ? '0 16px 36px rgba(0,0,0,0.45)'
        : lifted
          ? '0 12px 28px rgba(0,0,0,0.35), 0 0 0 2px rgba(250,173,20,0.5)'
          : '0 3px 10px rgba(0,0,0,0.2)',
      transform: lifted && !dragging ? 'translateY(-4px) scale(1.02)' : 'none',
      transition: dragging ? 'none' : 'transform 0.15s ease, box-shadow 0.15s ease',
      position: 'relative', userSelect: 'none', cursor: dragging ? 'grabbing' : 'grab'
    }}>
      <span style={{ position: 'absolute', top: 6, left: 8, fontSize: 15, fontWeight: 700, color, lineHeight: 1 }}>{RANKS[card.rank - 1]}</span>
      <span style={{ position: 'absolute', top: 22, left: 8, fontSize: 14, color, lineHeight: 1 }}>{SUIT_SYM[si]}</span>
      <span style={{
        position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
        fontSize: 36, color, opacity: 0.9
      }}>{SUIT_SYM[si]}</span>
      <span style={{
        position: 'absolute', bottom: 6, right: 8, fontSize: 15, fontWeight: 700, color,
        lineHeight: 1, transform: 'rotate(180deg)'
      }}>{RANKS[card.rank - 1]}</span>
      <span style={{
        position: 'absolute', bottom: 22, right: 8, fontSize: 14, color,
        lineHeight: 1, transform: 'rotate(180deg)'
      }}>{SUIT_SYM[si]}</span>
    </div>
  );
}

export default function SpiderSolitaire() {
  const [suits, setSuits] = useState(1);
  const [tableau, setTableau] = useState(() => initialState(1).tableau);
  const [stock, setStock] = useState(() => initialState(1).stock);
  const stockLayers = Math.min(5, Math.ceil(stock.length / 10) || (stock.length > 0 ? 1 : 0));
  const [completed, setCompleted] = useState(0);
  const [drag, setDrag] = useState(null);
  const [hoverCol, setHoverCol] = useState(null);
  const [dealing, setDealing] = useState(false);
  const [dealingCol, setDealingCol] = useState(null);
  const [flyDeal, setFlyDeal] = useState(null);
  const [won, setWon] = useState(false);
  const tableauRef = useRef(tableau);
  const completedRef = useRef(completed);
  const wonRef = useRef(won);
  const stockBtnRef = useRef(null);
  const colRefs = useRef([]);

  useEffect(() => { tableauRef.current = tableau; }, [tableau]);
  useEffect(() => { completedRef.current = completed; }, [completed]);
  useEffect(() => { wonRef.current = won; }, [won]);

  const reset = useCallback((suitCount) => {
    const s = suitCount ?? suits;
    const st = initialState(s);
    setTableau(st.tableau);
    setStock(st.stock);
    setCompleted(0);
    setDrag(null);
    setHoverCol(null);
    setDealing(false);
    setDealingCol(null);
    setFlyDeal(null);
    setWon(false);
  }, [suits]);

  const dealRow = useCallback(() => {
    if (wonRef.current || dealing) return;
    if (stock.length < 10) return message.warning('牌堆不足');
    if (tableau.some(c => !c.length)) return message.warning('有空列时不能发牌');

    const st = [...stock];
    const cards = [];
    for (let i = 0; i < 10; i++) cards.push({ ...st.pop(), faceUp: true });
    setStock(st);
    setDealing(true);
    setDrag(null);
    setHoverCol(null);

    const working = tableau.map(c => [...c]);

    const dealOne = (col) => new Promise(resolve => {
      const card = cards[col];
      const fromRect = stockBtnRef.current?.getBoundingClientRect();
      const colRect = colRefs.current[col]?.getBoundingClientRect();
      const colLen = working[col].length;

      const place = () => {
        working[col] = [...working[col], card];
        setTableau(working.map(c => [...c]));
        setDealingCol(col);
        setTimeout(() => setDealingCol(c => (c === col ? null : c)), DEAL_ANIM_MS * 0.5);
        resolve();
      };

      if (!fromRect || !colRect) {
        place();
        return;
      }

      const tx = colRect.left + 2;
      const ty = colRect.top + colLen * OVERLAP + 4;
      setFlyDeal({ card, x: fromRect.left, y: fromRect.top, tx, ty, move: false });

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setFlyDeal(f => (f ? { ...f, x: f.tx, y: f.ty, move: true } : null));
        });
      });

      setTimeout(() => {
        setFlyDeal(null);
        place();
      }, DEAL_ANIM_MS);
    });

    (async () => {
      for (let c = 0; c < 10; c++) await dealOne(c);
      const fin = finalizeTableau(working, completedRef.current);
      setTableau(fin.tableau);
      setCompleted(fin.completed);
      if (fin.completed >= 8) setWon(true);
      setDealing(false);
      setDealingCol(null);
    })();
  }, [dealing, stock, tableau]);

  const applyMove = useCallback((fromCol, start, toCol, tb = tableauRef.current, comp = completedRef.current) => {
    const from = tb[fromCol];
    const stack = from.slice(start);
    if (!stack.length || !stack[0].faceUp) return false;
    if (stack.length > 1 && !sameSuitStack(stack)) return false;
    const target = tb[toCol];
    const top = target.length ? target[target.length - 1] : null;
    if (!canPlaceOn(top, stack[0])) return false;
    const t = tb.map(c => [...c]);
    t[toCol] = [...t[toCol], ...stack];
    t[fromCol] = flipColumnTop(t[fromCol].slice(0, start));
    const fin = finalizeTableau(t, comp);
    setTableau(fin.tableau);
    setCompleted(fin.completed);
    if (fin.completed >= 8) setWon(true);
    return true;
  }, []);

  const onCardPointerDown = (e, colIdx, cardIdx) => {
    if (wonRef.current || drag || dealing) return;
    const col = tableau[colIdx];
    const ds = getDragStack(col, cardIdx);
    if (!ds) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({
      fromCol: colIdx,
      start: ds.start,
      stack: ds.stack,
      x: e.clientX,
      y: e.clientY,
      offX: CW / 2,
      offY: 20
    });
  };

  useEffect(() => {
    document.body.style.cursor = drag ? 'grabbing' : '';
    return () => { document.body.style.cursor = ''; };
  }, [drag]);

  useEffect(() => {
    if (!drag) return;
    const onMove = (e) => {
      const d = drag;
      setDrag(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const colEl = el?.closest('[data-col]');
      const col = colEl ? +colEl.getAttribute('data-col') : null;
      if (col !== null && !Number.isNaN(col) && d && canDrop(tableauRef.current, d.fromCol, d.start, col)) {
        setHoverCol(col);
      } else setHoverCol(null);
    };
    const onUp = (e) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const colEl = el?.closest('[data-col]');
      const toCol = colEl ? +colEl.getAttribute('data-col') : null;
      if (toCol !== null && !Number.isNaN(toCol) && canDrop(tableauRef.current, drag.fromCol, drag.start, toCol)) {
        applyMove(drag.fromCol, drag.start, toCol);
      }
      setDrag(null);
      setHoverCol(null);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [drag, applyMove]);

  const colHeight = (col) => Math.max(CH, col.length ? CH + (col.length - 1) * OVERLAP : CH);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12, marginBottom: 16
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>蜘蛛纸牌</h2>
          <span style={{ color: '#8c8c8c', fontSize: 13 }}>{DECK_INFO[suits]} · 开局牌堆 {STOCK_INIT} 张</span>
        </div>
        <Space wrap>
          <Segmented value={suits} onChange={v => { setSuits(v); reset(v); }} options={[
            { label: '单色', value: 1 },
            { label: '双色', value: 2 },
            { label: '四色', value: 4 }
          ]} />
          <Button icon={<DeliveredProcedureOutlined />} onClick={dealRow} disabled={won || dealing || stock.length < 10} loading={dealing}>
            发牌 ({Math.floor(stock.length / 10)})
          </Button>
          <Button type="primary" icon={<ReloadOutlined />} onClick={() => reset()}>新游戏</Button>
        </Space>
      </div>

      <div style={{ ...felt, padding: 20, position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.04,
          backgroundImage: 'radial-gradient(circle at 20% 30%, #fff 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, width: '100%', marginBottom: 4 }}>收牌区</span>
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} style={{
                width: 52, height: 72, borderRadius: 8,
                border: '2px dashed rgba(255,255,255,0.25)',
                background: i < completed ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: i < completed ? 'inset 0 0 12px rgba(255,215,0,0.3)' : 'none'
              }}>
                {i < completed ? <TrophyOutlined style={{ color: '#ffd666', fontSize: 22 }} /> : null}
              </div>
            ))}
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, alignSelf: 'center', marginLeft: 8 }}>{completed} / 8</span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, display: 'block', marginBottom: 4 }}>
              待发牌堆 · 剩余 {stock.length} 张
            </span>
            <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, display: 'block', marginBottom: 8 }}>
              还可发 {Math.floor(stock.length / 10)} 轮（每轮 10 张）
            </span>
            <button
              ref={stockBtnRef}
              type="button"
              onClick={dealRow}
              disabled={won || dealing || stock.length < 10}
              style={{
                background: 'none', border: 'none', padding: 0,
                cursor: stock.length >= 10 && !won && !dealing ? 'pointer' : 'not-allowed',
                position: 'relative', width: CW + 20, height: CH + 20 + stockLayers * 3
              }}
            >
              {stock.length > 0 ? (
                Array.from({ length: stockLayers }, (_, i) => (
                  <div key={i} style={{ position: 'absolute', left: i * 3, top: i * 3, zIndex: i }}>
                    <CardBack />
                  </div>
                ))
              ) : (
                <div style={{
                  width: CW, height: CH, borderRadius: 8,
                  border: '2px dashed rgba(255,255,255,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,0.5)', fontSize: 13
                }}>已发完</div>
              )}
              {stock.length > 0 && (
                <span style={{
                  position: 'absolute', bottom: -6, right: -10, background: '#faad14', color: '#1a1a1a',
                  fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 10,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)', zIndex: 10
                }}>{stock.length}</span>
              )}
            </button>
          </div>
        </div>

        <div style={{
          display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap',
          position: 'relative', zIndex: 1, minHeight: 380
        }}>
          {tableau.map((col, ci) => {
            const h = colHeight(col);
            const isHover = hoverCol === ci;
            const draggingFrom = drag?.fromCol === ci;
            const isDealingHere = dealingCol === ci;
            return (
              <div
                key={ci}
                ref={el => { colRefs.current[ci] = el; }}
                data-col={ci}
                style={{
                  position: 'relative', width: CW + 4, minHeight: h + 8,
                  borderRadius: 10,
                  background: isDealingHere
                    ? 'rgba(255,255,255,0.18)'
                    : isHover
                      ? 'rgba(82,196,26,0.25)'
                      : 'transparent',
                  boxShadow: isDealingHere
                    ? 'inset 0 0 0 2px rgba(255,255,255,0.6)'
                    : isHover
                      ? 'inset 0 0 0 2px rgba(82,196,26,0.9)'
                      : 'none',
                  transition: 'background 0.15s, box-shadow 0.15s'
                }}
              >
                {!col.length && (
                  <div style={{
                    width: CW, height: CH, marginTop: 4,
                    border: '2px dashed rgba(255,255,255,0.2)', borderRadius: 8,
                    background: 'rgba(0,0,0,0.1)'
                  }} />
                )}
                {col.map((card, i) => {
                  const isDragging = draggingFrom && drag && i >= drag.start;
                  const canDrag = !dealing && card.faceUp && getDragStack(col, i);
                  const justDealt = isDealingHere && i === col.length - 1;
                  return (
                    <div
                      key={i}
                      onPointerDown={canDrag ? e => onCardPointerDown(e, ci, i) : undefined}
                      style={{
                        position: 'absolute', top: i * OVERLAP, left: 2, zIndex: i,
                        opacity: isDragging ? 0.35 : 1,
                        transition: 'opacity 0.15s, transform 0.2s ease-out',
                        transform: justDealt ? 'scale(1.05)' : 'none',
                        touchAction: 'none'
                      }}
                    >
                      <PlayingCard card={card} suitMode={suits} />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {flyDeal && (
          <div style={{
            position: 'fixed', left: flyDeal.x, top: flyDeal.y, zIndex: 10001, pointerEvents: 'none',
            transition: flyDeal.move ? `left ${DEAL_ANIM_MS}ms ease-out, top ${DEAL_ANIM_MS}ms ease-out` : 'none',
            filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.45))'
          }}>
            <PlayingCard card={flyDeal.card} suitMode={suits} dragging />
          </div>
        )}

        {drag && (
          <div style={{
            position: 'fixed', left: drag.x - drag.offX, top: drag.y - drag.offY,
            zIndex: 9999, pointerEvents: 'none',
            filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.4))'
          }}>
            {drag.stack.map((card, i) => (
              <div key={i} style={{ position: 'absolute', top: i * OVERLAP, left: 0 }}>
                <PlayingCard card={card} suitMode={suits} dragging />
              </div>
            ))}
          </div>
        )}

        {won && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 10,
            background: 'rgba(0,0,0,0.55)', borderRadius: 16,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}>
            <TrophyOutlined style={{ fontSize: 64, color: '#ffd666', marginBottom: 16 }} />
            <div style={{ color: '#fff', fontSize: 28, fontWeight: 700, marginBottom: 20 }}>恭喜通关！</div>
            <Button type="primary" size="large" icon={<ReloadOutlined />} onClick={() => reset()}>再来一局</Button>
          </div>
        )}
      </div>

      <p style={{ marginTop: 14, color: '#8c8c8c', fontSize: 13, textAlign: 'center' }}>
        拖动牌组到目标列放置 · 同花色 K→A 十三张自动收牌 · 十列均有牌时可发牌
      </p>
    </div>
  );
}
