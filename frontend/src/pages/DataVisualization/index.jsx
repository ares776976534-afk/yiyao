import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as echarts from 'echarts';
import dayjs from 'dayjs';
import { get } from '../../api/request';
import chinaJson from './china.json';
import './style.css';

echarts.registerMap('china', chinaJson);

const COLORS = ['#0078d7','#00b4ff','#67e0e3','#37a2da','#ffdb5c','#ff9f7f','#fb7293','#e062ae','#a18cd1','#9fe6b8'];
const WEEKDAYS = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
const vw = (n) => {
  const w = window.innerWidth;
  if (w >= 1600) return n;
  const ratio = w / 1600;
  return Math.max(Math.round(n * ratio), Math.round(n * 0.6));
};
const DA = {
  axisLine: { lineStyle: { color: 'rgba(0,120,200,0.2)' } },
  axisTick: { show: false },
  axisLabel: { color: 'rgba(255,255,255,0.4)', fontSize: vw(11) },
  splitLine: { lineStyle: { color: 'rgba(0,120,200,0.06)', type: 'dashed' } }
};
const TT = { backgroundColor: 'rgba(2,14,31,0.9)', borderColor: 'rgba(0,120,200,0.3)', textStyle: { color: '#fff', fontSize: vw(12) } };

const EC = React.memo(function EC({ option, style }) {
  const el = useRef(null);
  const c = useRef(null);
  useEffect(() => {
    c.current = echarts.init(el.current);
    const ro = new ResizeObserver(() => c.current?.resize());
    ro.observe(el.current);
    return () => { ro.disconnect(); c.current?.dispose(); c.current = null; };
  }, []);
  useEffect(() => { c.current?.setOption(option, { notMerge: false, lazyUpdate: true }); }, [option]);
  return <div ref={el} style={style} />;
});

function Panel({ title, en, children, style }) {
  return (
    <div className="dv-panel" style={style}>
      <div className="dv-panel-inner" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
      <div className="dv-panel-hd">
        <span className="dv-panel-dot" />
        <span className="dv-panel-title">{title}</span>
        <span className="dv-panel-en">{en}</span>
      </div>
      {children}
    </div>
  );
}

function Legend({ data, colors, total, totalLabel }) {
  return (
    <div style={{ fontSize: 'inherit', flex: 1 }}>
      {totalLabel && <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '0.5vh' }}>{totalLabel} <span style={{ color: '#00d4ff', fontSize: '1.6em', fontWeight: 700 }}>{total}</span></div>}
      {data.map((d, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5, color: 'rgba(255,255,255,0.5)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: colors[i % colors.length], flexShrink: 0 }} />
            {d.name}
          </span>
          <span style={{ color: '#00d4ff' }}>{totalLabel ? Math.round(d.value / (total || 1) * 100) + '%' : d.value + '%'}</span>
        </div>
      ))}
    </div>
  );
}

function ScrollTable({ data, visibleRows = 5 }) {
  const bodyRef = useRef(null);
  const rowRef = useRef(null);
  const [rowH, setRowH] = useState(0);
  const [paused, setPaused] = useState(false);
  const needScroll = data.length > visibleRows;
  useEffect(() => { if (rowRef.current) setRowH(rowRef.current.offsetHeight); }, [data]);
  const bodyH = rowH ? rowH * visibleRows : 'auto';
  const rows = data.map((r, i) => (
    <tr key={i} ref={i === 0 ? rowRef : null}><td>NO.{i + 1}</td><td>{r.name}</td><td>{r.type}</td><td>{r.phone}</td><td>{r.sub}</td><td>{r.orders}</td><td>{r.amount}</td><td>{r.settled}</td></tr>
  ));
  const onWheel = (e) => { if (!needScroll || !bodyRef.current) return; e.preventDefault(); setPaused(true); bodyRef.current.scrollTop += e.deltaY; };
  useEffect(() => {
    if (!needScroll || paused) return;
    const el = bodyRef.current; if (!el) return;
    const id = setInterval(() => { el.scrollTop += 1; if (el.scrollTop >= el.scrollHeight / 2) el.scrollTop = 0; }, 50);
    return () => clearInterval(id);
  }, [needScroll, paused]);
  useEffect(() => { if (!paused) return; const t = setTimeout(() => setPaused(false), 3000); return () => clearTimeout(t); }, [paused]);
  const cols = ['排名','名称','用户类型','手机号','下级成员','分销订单','累计金额','已结算'];
  const widths = ['8%','14%','10%','14%','10%','10%','14%','14%'];
  const colgroup = <colgroup>{widths.map((w, i) => <col key={i} style={{ width: w }} />)}</colgroup>;
  return (
    <div className="dv-scroll-wrap">
      <table className="dv-table">{colgroup}<thead><tr>{cols.map((c, i) => <th key={i}>{c}</th>)}</tr></thead></table>
      <div className="dv-scroll-body" ref={bodyRef} style={{ maxHeight: bodyH, overflow: 'hidden' }} onWheel={onWheel} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <table className="dv-table">{colgroup}<tbody>{rows}</tbody></table>
        {needScroll && <table className="dv-table">{colgroup}<tbody>{rows}</tbody></table>}
      </div>
    </div>
  );
}

const PAGE_SIZE = 5;
const PagedRank = React.memo(function PagedRank({ title, en, data, page, setPage, hBarOpt }) {
  const totalPages = Math.ceil(data.length / PAGE_SIZE);
  const sliced = data.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const opt = useMemo(() => hBarOpt(sliced), [sliced, hBarOpt]);
  return (
    <Panel title={title} en={en}>
      <EC option={opt} style={{ width: '100%', flex: 1, minHeight: 80 }} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginTop: 4 }}>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{page + 1}/{totalPages || 1}</span>
        <span className="dv-page-btn" onClick={() => setPage(p => Math.max(0, p - 1))} style={{ opacity: page === 0 ? 0.2 : 1 }}>◁</span>
        <span className="dv-page-btn" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} style={{ opacity: page >= totalPages - 1 ? 0.2 : 1 }}>▷</span>
      </div>
    </Panel>
  );
});

function buildProvinces(o) {
  const names = ['北京市','天津市','河北省','山西省','内蒙古自治区','辽宁省','吉林省','黑龙江省','上海市','江苏省','浙江省','安徽省','福建省','江西省','山东省','河南省','湖北省','湖南省','广东省','广西壮族自治区','海南省','重庆市','四川省','贵州省','云南省','西藏自治区','陕西省','甘肃省','青海省','宁夏回族自治区','新疆维吾尔自治区','台湾省','香港特别行政区','澳门特别行政区'];
  const total = (o.totalOut || 0) + (o.totalIn || 0);
  return names.map(name => ({ name, value: Math.max(5, Math.round(Math.random() * (total / 5))) }));
}

export default function DataVisualization() {
  const [time, setTime] = useState(dayjs());
  const [data, setData] = useState(null);
  const [vis, setVis] = useState(null);
  const [outPage, setOutPage] = useState(0);
  const [inPage, setInPage] = useState(0);

  useEffect(() => { const t = setInterval(() => setTime(dayjs()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => {
    get('/dashboard').then(setData);
    get('/vis/all').then(setVis);
  }, []);

  const o = data?.overview || {};
  const p = data?.pending || {};
  const staffData = vis?.staff || [];
  const channelData = vis?.channels || [];
  const ageData = vis?.ageData || [];
  const cityOutRank = vis?.cityOutRank || [];
  const cityInRank = vis?.cityInRank || [];
  const cityDaily = vis?.cityDaily || [];
  const promoData = vis?.promotions || [];
  const distData = vis?.distRank || [];

  const staffTotal = staffData.reduce((a, b) => a + b.value, 0);

  const topStats = [
    { label: '累计用户数', value: o.totalUsers || '--', unit: '人', color: '#00d4ff' },
    { label: '累计药品数', value: o.totalDrugs || '--', unit: '种', color: '#00e676' },
    { label: '总出库量', value: o.totalOut || '--', unit: '件', color: '#ffd600' },
    { label: '总入库量', value: o.totalIn || '--', unit: '件', color: '#ffab00' },
    { label: '出入库记录', value: o.totalRecords || '--', unit: '条', color: '#ff5252' },
  ];

  const todayItems = [
    { label: '待处理订单', value: p.orders || 0, unit: '单' },
    { label: '待提现', value: p.withdraw || 0, unit: '笔' },
    { label: '今日入库', value: p.inToday || 0, unit: '件' },
    { label: '今日出库', value: p.outToday || 0, unit: '件' },
    { label: '药品总数', value: o.totalDrugs || 0, unit: '种' },
    { label: '用户总数', value: o.totalUsers || 0, unit: '人' },
    { label: '出库总量', value: o.totalOut || 0, unit: '件' },
    { label: '入库总量', value: o.totalIn || 0, unit: '件' },
  ];

  const provinces = useMemo(() => buildProvinces(o), [o.totalOut, o.totalIn]);

  const donutOpt = (d) => ({
    color: COLORS,
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)', ...TT, confine: true, appendToBody: true },
    series: [{ type: 'pie', radius: ['45%', '68%'], center: ['40%', '50%'], data: d, label: { show: false }, itemStyle: { borderColor: '#020e1f', borderWidth: 2 }, emphasis: { scale: true, scaleSize: 4 } }]
  });

  const ageOpt = useMemo(() => ({
    color: ['#37a2da','#ff7f50'],
    tooltip: { trigger: 'axis', ...TT },
    legend: { data: ['男','女'], textStyle: { color: 'rgba(255,255,255,0.5)', fontSize: vw(11) }, top: 0, right: 0, itemWidth: vw(10), itemHeight: vw(8) },
    grid: { top: '16%', bottom: '14%', left: '10%', right: '3%' },
    xAxis: { type: 'category', data: ageData.map(d => d.age), ...DA },
    yAxis: { type: 'value', ...DA },
    series: [
      { name: '男', type: 'bar', data: ageData.map(d => d.m), barWidth: 10, itemStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'#37a2da'},{offset:1,color:'rgba(55,162,218,0.2)'}]), borderRadius: [2,2,0,0] } },
      { name: '女', type: 'bar', data: ageData.map(d => d.f), barWidth: 10, itemStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'#ff7f50'},{offset:1,color:'rgba(255,127,80,0.2)'}]), borderRadius: [2,2,0,0] } },
    ]
  }), [ageData]);

  const mapOpt = useMemo(() => ({
    tooltip: {
      trigger: 'item', ...TT, enterable: true, hideDelay: 200, confine: true,
      formatter: p => p.data ? `<div style="font-weight:700;color:#00d4ff;margin-bottom:4px">${p.name}</div>数据量: <b style="color:#00d4ff">${p.value}</b>` : p.name
    },
    visualMap: { min: 0, max: 300, show: false, inRange: { color: ['#041a30','#0a2e50','#0e4070','#1565a0','#00b4ff'] } },
    series: [{
      type: 'map', map: 'china', roam: false, zoom: 1.2, center: [104, 36],
      data: provinces,
      emphasis: { disabled: false, itemStyle: { areaColor: '#1a6aaa', borderColor: '#00d4ff', borderWidth: 1.5 }, label: { show: true, color: '#fff', fontSize: vw(14), fontWeight: 700 } },
      itemStyle: { areaColor: '#0a2e50', borderColor: 'rgba(0,180,255,0.25)', borderWidth: 0.5 },
      label: { show: true, color: 'rgba(255,255,255,0.25)', fontSize: vw(8) },
      select: { disabled: true }
    }]
  }), [provinces]);

  const hBarOpt = (d) => ({
    grid: { top: 2, bottom: 2, left: 52, right: 40 },
    xAxis: { type: 'value', show: false },
    yAxis: { type: 'category', data: [...d].reverse().map(v => v.name), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: vw(11) } },
    series: [{
      type: 'bar', data: [...d].reverse().map((v, i) => ({
        value: v.value,
        itemStyle: { color: new echarts.graphic.LinearGradient(0,0,1,0,[
          {offset:0,color: i < 3 ? '#00b4ff' : '#0060a0'},
          {offset:1,color: i < 3 ? '#00e0ff' : '#00a0e0'}
        ]) }
      })),
      barWidth: 8, itemStyle: { borderRadius: [0,3,3,0] },
      label: { show: true, position: 'right', color: '#00d4ff', fontSize: vw(11), fontWeight: 600 }
    }],
    tooltip: { trigger: 'item', ...TT }
  });

  const dailyOpt = useMemo(() => ({
    grid: { top: '14%', bottom: '14%', left: '10%', right: '3%' },
    xAxis: { type: 'category', data: cityDaily.map(d => d.city), ...DA, axisLabel: { ...DA.axisLabel, fontSize: vw(10) } },
    yAxis: { type: 'value', ...DA },
    series: [{ type: 'bar', data: cityDaily.map((d, i) => ({
      value: d.value,
      itemStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:COLORS[i % COLORS.length]},{offset:1,color:'rgba(0,60,120,0.3)'}]), borderRadius: [3,3,0,0] }
    })), barWidth: 16, label: { show: true, position: 'top', color: 'rgba(255,255,255,0.5)', fontSize: vw(10) } }],
    tooltip: { trigger: 'item', formatter: '{b}: {c}', ...TT }
  }), [cityDaily]);

  const channelOpt = useMemo(() => ({
    color: ['#37a2da','#ffdb5c'],
    legend: { data: ['投入','产出'], textStyle: { color: 'rgba(255,255,255,0.5)', fontSize: vw(11) }, top: 0, right: 0, itemWidth: vw(10), itemHeight: vw(8) },
    grid: { top: '16%', bottom: '14%', left: '10%', right: '3%' },
    xAxis: { type: 'category', data: promoData.map(c => c.name), ...DA },
    yAxis: { type: 'value', ...DA },
    series: [
      { name: '投入', type: 'bar', data: promoData.map(c => c.input), barWidth: 10, itemStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'#37a2da'},{offset:1,color:'rgba(55,162,218,0.2)'}]), borderRadius: [2,2,0,0] } },
      { name: '产出', type: 'bar', data: promoData.map(c => c.output), barWidth: 10, itemStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'#ffdb5c'},{offset:1,color:'rgba(255,219,92,0.2)'}]), borderRadius: [2,2,0,0] } },
    ],
    tooltip: { trigger: 'axis', ...TT }
  }), [promoData]);

  const staffDonutOpt = useMemo(() => donutOpt(staffData), [staffData]);
  const channelDonutOpt = useMemo(() => donutOpt(channelData), [channelData]);

  return (
    <div className="dv-wrap">
      <div className="dv-header">
        <div className="dv-time">{time.format('YYYY.MM.DD')} | {WEEKDAYS[time.day()]} | {time.format('HH:mm:ss')}</div>
        <div className="dv-header-center">
          <span className="dv-deco">&gt;&gt;&gt;&gt;&gt;&gt;</span>
          <span className="dv-main-title">医药后台数据可视化平台</span>
          <span className="dv-deco">&lt;&lt;&lt;&lt;&lt;&lt;</span>
        </div>
        <div className="dv-time" style={{ textAlign: 'right' }}>{vis ? '数据已加载' : '加载中...'}</div>
      </div>

      <div className="dv-top-stats">
        {topStats.map((s, i) => (
          <div key={i} className="dv-stat-card">
            <div className="dv-stat-val" style={{ color: s.color }}>{s.value}<span className="dv-stat-unit">{s.unit}</span></div>
            <div className="dv-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="dv-body">
        <div className="dv-col dv-left">
          <Panel title="今日数据概览" en="DATA PROFILE">
            <div className="dv-today-grid">
              {todayItems.map((it, i) => (
                <div key={i} className="dv-today-item">
                  <div className="dv-today-val">{it.value}<span>{it.unit}</span></div>
                  <div className="dv-today-label">{it.label}</div>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="管家占比" en="PROPORTION OF HOUSEKEEPERS">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
              <EC option={staffDonutOpt} style={{ width: '50%', height: '100%', minHeight: 100 }} />
              <Legend data={staffData} colors={COLORS} total={staffTotal} totalLabel="管家总人数" />
            </div>
          </Panel>
          <Panel title="用户渠道占比" en="PROPORTION OF CHANNELS">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
              <EC option={channelDonutOpt} style={{ width: '50%', height: '100%', minHeight: 100 }} />
              <Legend data={channelData} colors={COLORS} />
            </div>
          </Panel>
          <Panel title="年龄性别分布" en="AGE DISTRIBUTION">
            <EC option={ageOpt} style={{ width: '100%', flex: 1, minHeight: 100 }} />
          </Panel>
        </div>

        <div className="dv-col dv-center">
          <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
            <EC option={mapOpt} style={{ width: '100%', height: '100%' }} />
            <div className="dv-map-stats">
              <div>总出库: <span>{o.totalOut || 0}</span> 件</div>
              <div>总入库: <span>{o.totalIn || 0}</span> 件</div>
            </div>
          </div>
          <Panel title="分销榜单" en="DISTRIBUTION RANKING">
            <ScrollTable data={distData} />
          </Panel>
        </div>

        <div className="dv-col dv-right">
          <PagedRank title="地市出库排名 TOP10" en="OUTBOUND RANKING" data={cityOutRank} page={outPage} setPage={setOutPage} hBarOpt={hBarOpt} />
          <PagedRank title="地市入库排名 TOP10" en="INBOUND RANKING" data={cityInRank} page={inPage} setPage={setInPage} hBarOpt={hBarOpt} />
          <Panel title="地市日活" en="CITY DAILY ACTIVITIES">
            <EC option={dailyOpt} style={{ width: '100%', flex: 1, minHeight: 80 }} />
          </Panel>
          <Panel title="推广投放" en="RATINGS">
            <EC option={channelOpt} style={{ width: '100%', flex: 1, minHeight: 80 }} />
          </Panel>
        </div>
      </div>
    </div>
  );
}
