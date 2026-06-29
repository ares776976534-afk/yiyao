import React, { useEffect, useRef, useState } from 'react';
import { $t } from '@/i18n';

// 与 @ali/eraser-editor 一致的掩码判定：R 通道 > 0 代表 1
const TINT = { r: 216, g: 255, b: 0, a: 255 }; // rgba(216,255,0,1)
const DEFAULT_BRUSH = 40;

type Tool = 'brush' | 'eraser';

function array2rle(imgData: Uint8ClampedArray) {
  const out: number[] = [];
  // 把 R 通道非 0 视为 1，其余为 0
  // 注意：imgData 是 RGBA 连续数组
  let curPos = -1;
  let count = 0;
  let idx = 0;
  for (let i = 0; i < imgData.length; i += 4) {
    const isOne = imgData[i] ? 1 : 0; // R 通道
    if (isOne) {
      if (curPos === -1) curPos = idx;
      count++;
    } else if (count > 0) {
      out.push(curPos, count);
      curPos = -1;
      count = 0;
    }
    if (i === imgData.length - 4 && count > 0) {
      out.push(curPos, count);
    }
    idx++;
  }
  return out.join(' ');
}

export default function EraserBrushRLEProPage() {
  // 示例底图，可根据需要替换
  const [imgUrl, setImgUrl] = useState<string>(
    'https://img.alicdn.com/imgextra/i2/O1CN01XSLen31YyfnRWcgPl_!!6000000003128-2-tps-87-87.png'
  );
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [brushSize, setBrushSize] = useState<number>(DEFAULT_BRUSH);
  const [tool, setTool] = useState<Tool>('brush');
  const [rle, setRle] = useState<string>('');

  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null); // 显示/绘制遮罩
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const drawingRef = useRef(false);
  const lastPtRef = useRef<{ x: number; y: number } | null>(null);

  // 撤销/重做栈
  const undoStackRef = useRef<ImageData[]>([]);
  const redoStackRef = useRef<ImageData[]>([]);
  const MAX_STACK = 50;

  // 初始化 Canvas Context
  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctxRef.current = ctx;
    }
  }, []);

  // 图片加载完成后，设置画布尺寸
  const onImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    const w = target.naturalWidth;
    const h = target.naturalHeight;
    setNatural({ w, h });
    if (canvasRef.current && ctxRef.current) {
      canvasRef.current.width = w;
      canvasRef.current.height = h;
      // 重置遮罩
      clearMask();
      // 推入初始状态
      pushUndoSnapshot();
    }
  };

  const getCanvasPos = (ev: React.MouseEvent | React.PointerEvent) => {
    const rect = (canvasRef.current as HTMLCanvasElement).getBoundingClientRect();
    const x = (ev.clientX - rect.left) * (natural.w / rect.width);
    const y = (ev.clientY - rect.top) * (natural.h / rect.height);
    return { x, y };
  };

  const beginDraw = (ev: React.MouseEvent) => {
    if (!ctxRef.current || !canvasRef.current) return;
    drawingRef.current = true;
    redoStackRef.current = []; // 新动作后清空重做栈
    const p = getCanvasPos(ev);
    lastPtRef.current = p;

    const ctx = ctxRef.current;
    if (tool === 'brush') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = `rgba(${TINT.r},${TINT.g},${TINT.b},${TINT.a / 255})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // eraser: 擦除为透明（清除像素）
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(p.x, p.y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const moveDraw = (ev: React.MouseEvent) => {
    if (!drawingRef.current || !ctxRef.current || !canvasRef.current) return;
    const p = getCanvasPos(ev);
    const last = lastPtRef.current || p;
    const ctx = ctxRef.current;

    if (tool === 'brush') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = `rgba(${TINT.r},${TINT.g},${TINT.b},${TINT.a / 255})`;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    } else {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }

    lastPtRef.current = p;
  };

  const endDraw = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    lastPtRef.current = null;
    pushUndoSnapshot();
  };

  const pushUndoSnapshot = () => {
    if (!ctxRef.current || !canvasRef.current) return;
    try {
      const snap = ctxRef.current.getImageData(0, 0, natural.w, natural.h);
      undoStackRef.current.push(snap);
      if (undoStackRef.current.length > MAX_STACK) undoStackRef.current.shift();
    } catch {}
  };

  const handleUndo = () => {
    if (!ctxRef.current || !canvasRef.current) return;
    if (undoStackRef.current.length <= 1) return; // 保留至少一个初始状态
    const cur = undoStackRef.current.pop();
    if (cur) redoStackRef.current.push(cur);
    const prev = undoStackRef.current[undoStackRef.current.length - 1];
    ctxRef.current.putImageData(prev, 0, 0);
  };

  const handleRedo = () => {
    if (!ctxRef.current || !canvasRef.current) return;
    const snap = redoStackRef.current.pop();
    if (!snap) return;
    undoStackRef.current.push(snap);
    ctxRef.current.putImageData(snap, 0, 0);
  };

  const clearMask = () => {
    if (!ctxRef.current || !canvasRef.current) return;
    const ctx = ctxRef.current;
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, natural.w, natural.h);
  };

  const handleReset = () => {
    clearMask();
    undoStackRef.current = [];
    redoStackRef.current = [];
    // 保存空遮罩快照
    pushUndoSnapshot();
    setRle('');
  };

  const exportRLE = () => {
    if (!ctxRef.current || !canvasRef.current) return;
    try {
      const data = ctxRef.current.getImageData(0, 0, natural.w, natural.h).data;
      // 转成图片base64
      const imgBase64 = canvasRef.current.toDataURL();
      const rleStr = array2rle(data);
      setRle(rleStr);
      // 可对接后端：removeElements({ imageUrl: imgUrl, mask: rleStr })
    } catch {}
  };

  return (
    <div style={{ padding: 16 }}>
      <h3>{$t("global-1688-ai-app.PictureEditor.brush.ztcexR", "遮罩编辑（画笔 / 擦除 / 撤销 / 重做 / 重置 / 导出 RLE）")}</h3>

      <div style={{ marginBottom: 12 }}>
        <label>{$t("global-1688-ai-app.PictureEditor.brush.iAs", "图片地址：")}</label>
        <input
          style={{ width: 520 }}
          value={imgUrl}
          onChange={(e) => setImgUrl(e.target.value)}
          placeholder={$t("global-1688-ai-app.PictureEditor.brush.iIU", "输入图片 URL")}
        />
        <button style={{ marginLeft: 8 }} onClick={handleReset}>{$t("global-1688-ai-app.PictureEditor.brush.resetzz", "重置遮罩")}</button>
      </div>

      <div style={{ marginBottom: 12 }}>
        <span>{$t("global-1688-ai-app.PictureEditor.brush.gj", "工具：")}</span>
        <button
          onClick={() => setTool('brush')}
          style={{
            marginRight: 8,
            background: tool === 'brush' ? '#1677ff' : '#f5f5f5',
            color: tool === 'brush' ? '#fff' : '#333',
          }}
        >{$t("global-1688-ai-app.PictureEditor.brush.hb", "画笔")}</button>
        <button
          onClick={() => setTool('eraser')}
          style={{
            marginRight: 16,
            background: tool === 'eraser' ? '#1677ff' : '#f5f5f5',
            color: tool === 'eraser' ? '#fff' : '#333',
          }}
        >{$t("global-1688-ai-app.PictureEditor.brush.cc", "擦除")}</button>

        <label>{$t("global-1688-ai-app.PictureEditor.brush.hgl", `画笔大小：${brushSize}px`, [brushSize])}</label>
        <input
          type="range"
          min={1}
          max={100}
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          style={{ marginLeft: 8, verticalAlign: 'middle' }}
        />

        <button style={{ marginLeft: 16 }} onClick={handleUndo}>{$t("global-1688-ai-app.PictureEditor.brush.cx", "撤销")}</button>
        <button style={{ marginLeft: 8 }} onClick={handleRedo}>{$t("global-1688-ai-app.PictureEditor.brush.zz", "重做")}</button>
        <button style={{ marginLeft: 8 }} onClick={exportRLE}>{$t("global-1688-ai-app.PictureEditor.brush.exportRLE", "导出 RLE")}</button>
      </div>

      <div
        style={{ position: 'relative', display: 'inline-block', border: '1px solid #eee' }}
      >
        <img
          ref={imgRef}
          src={imgUrl}
          alt="bg"
          onLoad={onImgLoad}
          style={{ display: 'block', userSelect: 'none' }}
        />
        <canvas
          ref={canvasRef}
          width={natural.w}
          height={natural.h}
          onMouseDown={beginDraw}
          onMouseMove={moveDraw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            // 半透明显示绘制层
            opacity: 0.6,
            cursor: tool === 'brush' ? 'crosshair' : 'cell',
          }}
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <div>{$t("global-1688-ai-app.PictureEditor.brush.Rzg", "RLE（起点+长度 空格分隔）：")}</div>
        <textarea value={rle} readOnly rows={8} style={{ width: 800 }} />
      </div>
    </div>
  );
}
