import { useEffect, useRef, useState, useCallback } from 'react';
import { Button, Card, Space, Statistic } from 'antd';

const W = 400;
const H = 640;

function drawPlane(ctx, x, y, scale, color, flip) {
  ctx.save();
  ctx.translate(x, y);
  if (flip) ctx.scale(1, -1);
  ctx.scale(scale, scale);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(-14, 12);
  ctx.lineTo(-6, 8);
  ctx.lineTo(0, 14);
  ctx.lineTo(6, 8);
  ctx.lineTo(14, 12);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillRect(-2, -8, 4, 10);
  ctx.restore();
}

function drawEnemy(ctx, e) {
  const colors = ['#ff6b6b', '#ffa94d', '#74c0fc', '#da77f2'];
  drawPlane(ctx, e.x, e.y, e.size, colors[e.type % colors.length], true);
  if (e.hp > 1) {
    ctx.fillStyle = '#fff';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(e.hp, e.x, e.y + 4);
  }
}

function hit(a, b, ar, br) {
  return Math.abs(a.x - b.x) < ar + br && Math.abs(a.y - b.y) < ar + br;
}

export default function PlaneWar() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem('planeWarBest') || 0));
  const [lives, setLives] = useState(3);
  const [status, setStatus] = useState('idle');
  const [difficulty, setDifficulty] = useState(0);
  const [bulletSpeed, setBulletSpeed] = useState(9);
  const [bulletCount, setBulletCount] = useState(2);
  const [bulletSize, setBulletSize] = useState(4);

  const gameRef = useRef({
    running: false,
    player: { x: W / 2, y: H - 80 },
    bullets: [],
    enemyBullets: [],
    enemies: [],
    powerUps: [],
    particles: [],
    stars: [],
    frame: 0,
    shootCd: 0,
    spawnCd: 0,
    score: 0,
    lives: 3,
    invincible: 0,
    bulletSpeed: 9,
    bulletCount: 2,
    bulletSize: 4
  });

  const initStars = useCallback(() => {
    const g = gameRef.current;
    g.stars = Array.from({ length: 60 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      s: 0.5 + Math.random() * 2,
      sp: 0.3 + Math.random() * 1.5
    }));
  }, []);

  const resetGame = useCallback(() => {
    const g = gameRef.current;
    g.player = { x: W / 2, y: H - 80 };
    g.bullets = [];
    g.enemyBullets = [];
    g.enemies = [];
    g.powerUps = [];
    g.particles = [];
    g.frame = 0;
    g.shootCd = 0;
    g.spawnCd = 0;
    g.score = 0;
    g.lives = 3;
    g.invincible = 120;
    g.bulletSpeed = 9;
    g.bulletCount = 2;
    g.bulletSize = 4;
    initStars();
    setScore(0);
    setLives(3);
    setDifficulty(0);
    setBulletSpeed(9);
    setBulletCount(2);
    setBulletSize(4);
  }, [initStars]);

  const getDifficulty = (score) => {
    if (score >= 5000) return 6;
    if (score >= 3500) return 5;
    if (score >= 2000) return 4;
    if (score >= 1000) return 3;
    if (score >= 500) return 2;
    if (score >= 200) return 1;
    return 0;
  };

  const spawnEnemy = (g) => {
    const diff = getDifficulty(g.score);
    const roll = Math.random();
    let type = 0, size = 0.7, hp = 1, sp = 1.2 + diff * 0.12, score = 10;
    if (roll > 0.92 - diff * 0.015) {
      type = 3; size = 1.4; hp = 6 + diff * 2; sp = 0.7 + diff * 0.05; score = 80;
    } else if (roll > 0.78 - diff * 0.02) {
      type = 2; size = 1.1; hp = 3 + Math.floor(diff / 2) * 2; sp = 0.95 + diff * 0.05; score = 30;
    } else if (roll > 0.55 - diff * 0.02) {
      type = 1; size = 0.9; hp = 2 + Math.floor(diff / 3); sp = 1.1 + diff * 0.05; score = 20;
    }
    g.enemies.push({
      x: 30 + Math.random() * (W - 60),
      y: -30,
      type,
      size,
      hp,
      maxHp: hp,
      sp,
      score,
      shootCd: Math.max(20, 50 - diff * 5) + Math.random() * 40
    });
  };

  const spawnPowerUp = (g, x, y) => {
    if (Math.random() > 0.18) return;
    const roll = Math.random();
    let type = 'life';
    if (roll > 0.65) type = 'power';
    else if (roll > 0.35) type = 'speed';
    g.powerUps.push({ x, y, type, vy: 1.8, r: 12 });
  };

  const applyPowerUp = (g, p) => {
    if (p.type === 'life') {
      g.lives = Math.min(5, g.lives + 1);
      setLives(g.lives);
    } else if (p.type === 'speed') {
      g.bulletSpeed = Math.min(16, g.bulletSpeed + 1.5);
      setBulletSpeed(g.bulletSpeed);
    } else if (p.type === 'power') {
      g.bulletCount = Math.min(5, g.bulletCount + 1);
      g.bulletSize = Math.min(10, g.bulletSize + 1);
      setBulletCount(g.bulletCount);
      setBulletSize(g.bulletSize);
    }
  };

  const boom = (g, x, y, n = 12, c = '#ffd43b') => {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = 1 + Math.random() * 4;
      g.particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 20 + Math.random() * 15, c });
    }
  };

  const endGame = (g) => {
    g.running = false;
    setStatus('over');
    setBest(prev => {
      const next = Math.max(prev, g.score);
      localStorage.setItem('planeWarBest', String(next));
      return next;
    });
  };

  const start = () => {
    resetGame();
    gameRef.current.running = true;
    setStatus('playing');
  };

  useEffect(() => {
    initStars();
  }, [initStars]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;

    const loop = () => {
      const g = gameRef.current;
      ctx.fillStyle = '#0a0e27';
      ctx.fillRect(0, 0, W, H);

      g.stars.forEach(s => {
        s.y += s.sp;
        if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
        ctx.fillStyle = `rgba(255,255,255,${0.3 + s.s / 3})`;
        ctx.fillRect(s.x, s.y, s.s, s.s);
      });

      if (g.running) {
        g.frame++;
        if (g.invincible > 0) g.invincible--;

        const diff = getDifficulty(g.score);
        if (diff !== g.difficulty) {
          g.difficulty = diff;
          setDifficulty(diff);
        }

        g.shootCd--;
        if (g.shootCd <= 0) {
          g.shootCd = Math.max(2, 7 - g.bulletCount);
          const spacing = Math.min(20, 7 + g.bulletCount * 2);
          const start = -(g.bulletCount - 1) * spacing / 2;
          for (let i = 0; i < g.bulletCount; i++) {
            g.bullets.push({
              x: g.player.x + start + i * spacing,
              y: g.player.y - 24,
              vy: -g.bulletSpeed,
              size: g.bulletSize
            });
          }
        }

        g.spawnCd--;
        if (g.spawnCd <= 0) {
          g.spawnCd = Math.max(12, 45 - diff * 6);
          spawnEnemy(g);
        }

        g.bullets = g.bullets.filter(b => {
          b.y += b.vy;
          return b.y > -10;
        });

        g.enemies.forEach(e => {
          e.y += e.sp;
          if (e.type >= 1) {
            e.shootCd--;
            if (e.shootCd <= 0) {
              e.shootCd = Math.max(20, 50 - diff * 4) + Math.random() * 40;
              g.enemyBullets.push({ x: e.x, y: e.y + 16, vy: 4 + e.type + diff * 0.2 });
            }
          }
        });
        g.enemies = g.enemies.filter(e => e.y < H + 40);

        g.enemyBullets = g.enemyBullets.filter(b => {
          b.y += b.vy;
          return b.y < H + 10;
        });

        g.powerUps.forEach(p => { p.y += p.vy; });
        g.powerUps = g.powerUps.filter(p => p.y < H + 20);

        for (const b of g.bullets) {
          for (const e of g.enemies) {
            if (hit(b, e, b.size || 4, 14 * e.size)) {
              b.dead = true;
              e.hp--;
              if (e.hp <= 0) {
                e.dead = true;
                g.score += e.score;
                setScore(g.score);
                boom(g, e.x, e.y, 16);
                spawnPowerUp(g, e.x, e.y);
              }
              break;
            }
          }
        }
        g.bullets = g.bullets.filter(b => !b.dead);
        g.enemies = g.enemies.filter(e => !e.dead);

        for (const p of g.powerUps) {
          if (hit(g.player, p, 12, p.r)) {
            p.dead = true;
            applyPowerUp(g, p);
            boom(g, p.x, p.y, 10, '#69db7c');
          }
        }
        g.powerUps = g.powerUps.filter(p => !p.dead);

        if (g.invincible <= 0) {
          for (const e of g.enemies) {
            if (hit(g.player, e, 12, 14 * e.size)) {
              boom(g, g.player.x, g.player.y, 20, '#69db7c');
              g.lives--;
              setLives(g.lives);
              g.invincible = 120;
              g.enemies = g.enemies.filter(x => x !== e);
              if (g.lives <= 0) endGame(g);
              break;
            }
          }
          for (const b of g.enemyBullets) {
            if (hit(g.player, b, 10, 6)) {
              b.dead = true;
              boom(g, g.player.x, g.player.y, 16, '#69db7c');
              g.lives--;
              setLives(g.lives);
              g.invincible = 120;
              if (g.lives <= 0) endGame(g);
            }
          }
          g.enemyBullets = g.enemyBullets.filter(b => !b.dead);
        }
      }

      g.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
      });
      g.particles = g.particles.filter(p => p.life > 0);

      g.bullets.forEach(b => {
        ctx.fillStyle = '#ffe066';
        const s = b.size || 4;
        ctx.fillRect(b.x - s / 2, b.y - s * 1.5, s, s * 3);
      });
      g.enemyBullets.forEach(b => {
        ctx.fillStyle = '#ff8787';
        ctx.beginPath();
        ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
      g.enemies.forEach(e => drawEnemy(ctx, e));
      g.powerUps.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#fff';
        ctx.beginPath();
        ctx.arc(0, 0, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.type === 'life' ? '#ff6b6b' : p.type === 'speed' ? '#74c0fc' : '#ffa94d';
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.type === 'life' ? '♥' : p.type === 'speed' ? '⚡' : '🔥', 0, 1);
        ctx.restore();
      });
      g.particles.forEach(p => {
        ctx.globalAlpha = p.life / 35;
        ctx.fillStyle = p.c;
        ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
        ctx.globalAlpha = 1;
      });

      if (g.invincible > 0 && Math.floor(g.frame / 4) % 2 === 0) {
        ctx.globalAlpha = 0.5;
      }
      drawPlane(ctx, g.player.x, g.player.y, 1, '#51cf66', false);
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const onPointer = (e) => {
    if (!gameRef.current.running) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const g = gameRef.current;
    g.player.x = Math.max(24, Math.min(W - 24, x));
    g.player.y = Math.max(H * 0.45, Math.min(H - 50, y));
  };

  return (
    <div style={{ maxWidth: 440, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ margin: 0, fontSize: 22 }}>飞机大战</h2>
        <Space wrap>
          <Statistic title="得分" value={score} valueStyle={{ fontSize: 18 }} />
          <Statistic title="最高" value={best} valueStyle={{ fontSize: 18 }} />
          <Statistic title="生命" value={lives} valueStyle={{ fontSize: 18, color: '#ff4d4f' }} />
          <Statistic title="难度" value={difficulty} valueStyle={{ fontSize: 18, color: '#722ed1' }} />
          <Statistic title="弹速" value={bulletSpeed.toFixed(1)} valueStyle={{ fontSize: 18, color: '#1890ff' }} />
          <Statistic title="弹量" value={bulletCount} valueStyle={{ fontSize: 18, color: '#fa8c16' }} />
        </Space>
      </div>
      <Card bodyStyle={{ padding: 8 }}>
        <div style={{ position: 'relative' }}>
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            style={{ width: '100%', display: 'block', borderRadius: 8, touchAction: 'none', cursor: 'crosshair' }}
            onPointerMove={onPointer}
            onPointerDown={onPointer}
          />
          {status !== 'playing' && (
            <div
              style={{
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)',
                borderRadius: 8, color: '#fff'
              }}
            >
              {status === 'over' && <div style={{ fontSize: 28, marginBottom: 8 }}>游戏结束</div>}
              {status === 'over' && <div style={{ marginBottom: 16 }}>得分 {score}</div>}
              {status === 'idle' && <div style={{ fontSize: 16, marginBottom: 16, opacity: 0.85 }}>拖动飞机射击敌机</div>}
              <Button type="primary" size="large" onClick={start}>
                {status === 'over' ? '再来一局' : '开始游戏'}
              </Button>
            </div>
          )}
        </div>
      </Card>
      <p style={{ textAlign: 'center', color: '#8c8c8c', fontSize: 12, marginTop: 8 }}>
        拖动战机自动射击；击落敌机掉落 ♥生命 ⚡弹速 🔥火力 道具
      </p>
    </div>
  );
}
