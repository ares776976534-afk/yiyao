import express from 'express';
import cors from 'cors';
import db from './db.js';
import { tableSchema } from './schema.js';

const app = express();
app.use(cors());
app.use(express.json());

const nextId = (arr) => (arr.length ? Math.max(...arr.map(x => x.id)) : 0) + 1;

app.get('/api/drugs', (req, res) => {
  res.json([...db.data.drugs].reverse());
});

app.post('/api/drugs', (req, res) => {
  const { name, code, specification, unit } = req.body;
  const id = nextId(db.data.drugs);
  db.data.drugs.push({ id, name: name || '', code: code || '', specification: specification || '', unit: unit || '盒', created_at: new Date().toISOString() });
  db.write();
  res.json({ id });
});

app.put('/api/drugs/:id', (req, res) => {
  const { name, code, specification, unit } = req.body;
  const d = db.data.drugs.find(x => x.id === +req.params.id);
  if (d) { d.name = name || ''; d.code = code || ''; d.specification = specification || ''; d.unit = unit || '盒'; }
  db.write();
  res.json({ ok: true });
});

app.delete('/api/drugs/:id', (req, res) => {
  db.data.drugs = db.data.drugs.filter(x => x.id !== +req.params.id);
  db.write();
  res.json({ ok: true });
});

app.get('/api/personnel', (req, res) => {
  res.json([...db.data.personnel].reverse());
});

app.post('/api/personnel', (req, res) => {
  const { name, phone, type } = req.body;
  const id = nextId(db.data.personnel);
  db.data.personnel.push({ id, name: name || '', phone: phone || '', type: type || '本地管家', created_at: new Date().toISOString() });
  db.write();
  res.json({ id });
});

app.put('/api/personnel/:id', (req, res) => {
  const { name, phone, type } = req.body;
  const p = db.data.personnel.find(x => x.id === +req.params.id);
  if (p) { p.name = name || ''; p.phone = phone || ''; if (type !== undefined) p.type = type; }
  db.write();
  res.json({ ok: true });
});

app.delete('/api/personnel/:id', (req, res) => {
  db.data.personnel = db.data.personnel.filter(x => x.id !== +req.params.id);
  db.write();
  res.json({ ok: true });
});

app.get('/api/records', (req, res) => {
  const { type, drug_id, personnel_id, start_date, end_date } = req.query;
  let list = db.data.drug_records;
  if (type) list = list.filter(r => r.type === type);
  if (drug_id) list = list.filter(r => r.drug_id === +drug_id);
  if (personnel_id) list = list.filter(r => r.personnel_id === +personnel_id);
  if (start_date) list = list.filter(r => r.record_date >= start_date);
  if (end_date) list = list.filter(r => r.record_date <= end_date);
  list = [...list].reverse();
  const drugs = Object.fromEntries(db.data.drugs.map(d => [d.id, d]));
  const personnel = Object.fromEntries(db.data.personnel.map(p => [p.id, p]));
  const result = list.map(r => ({
    ...r,
    drug_name: drugs[r.drug_id]?.name,
    unit: drugs[r.drug_id]?.unit,
    personnel_name: r.personnel_id ? personnel[r.personnel_id]?.name : null
  }));
  res.json(result);
});

app.post('/api/records', (req, res) => {
  const { drug_id, type, quantity, batch_no, record_date, personnel_id, note, city } = req.body;
  const id = nextId(db.data.drug_records);
  const r = {
    id, drug_id, type, quantity: +quantity || 0, batch_no: batch_no || '',
    record_date: record_date || new Date().toISOString().slice(0, 10),
    personnel_id: type === 'out' ? (personnel_id || null) : null,
    city: city || '', note: note || '', created_at: new Date().toISOString()
  };
  db.data.drug_records.push(r);
  db.write();
  res.json({ id });
});

app.get('/api/sales-by-personnel', (req, res) => {
  const { start_date, end_date } = req.query;
  let list = db.data.drug_records.filter(r => r.type === 'out');
  if (start_date) list = list.filter(r => r.record_date >= start_date);
  if (end_date) list = list.filter(r => r.record_date <= end_date);
  const map = {};
  for (const r of list) {
    const k = `${r.record_date}-${r.personnel_id}-${r.drug_id}`;
    if (!map[k]) map[k] = { ...r, total_quantity: 0 };
    map[k].total_quantity += r.quantity;
  }
  const drugs = Object.fromEntries(db.data.drugs.map(d => [d.id, d]));
  const personnel = Object.fromEntries(db.data.personnel.map(p => [p.id, p]));
  const result = Object.values(map).map(r => ({
    record_date: r.record_date,
    personnel_id: r.personnel_id,
    personnel_name: personnel[r.personnel_id]?.name,
    drug_id: r.drug_id,
    drug_name: drugs[r.drug_id]?.name,
    unit: drugs[r.drug_id]?.unit,
    total_quantity: r.total_quantity
  })).sort((a, b) => b.record_date.localeCompare(a.record_date) || b.total_quantity - a.total_quantity);
  res.json(result);
});

app.get('/api/stock', (req, res) => {
  const drugs = db.data.drugs;
  const records = db.data.drug_records;
  const stock = {};
  for (const d of drugs) stock[d.id] = { ...d, stock: 0 };
  for (const r of records) {
    if (!stock[r.drug_id]) continue;
    stock[r.drug_id].stock += r.type === 'in' ? r.quantity : -r.quantity;
  }
  res.json(Object.values(stock));
});

const crud = (path, arr, fields) => {
  app.get(`/api/${path}`, (_, res) => res.json([...(db.data[arr] || [])].reverse()));
  app.post(`/api/${path}`, (req, res) => {
    const id = nextId(db.data[arr]);
    const obj = { id, ...Object.fromEntries(fields.map(f => [f, req.body[f] ?? ''])), created_at: new Date().toISOString() };
    db.data[arr].push(obj);
    db.write();
    res.json({ id });
  });
  app.put(`/api/${path}/:id`, (req, res) => {
    const o = db.data[arr].find(x => x.id === +req.params.id);
    if (o) fields.forEach(f => { if (req.body[f] !== undefined) o[f] = req.body[f]; });
    db.write();
    res.json({ ok: true });
  });
  app.delete(`/api/${path}/:id`, (req, res) => {
    db.data[arr] = db.data[arr].filter(x => x.id !== +req.params.id);
    db.write();
    res.json({ ok: true });
  });
};

crud('users', 'users', ['username', 'phone', 'password', 'role', 'status', 'channel', 'age', 'gender', 'city']);
crud('merchants', 'merchants', ['name', 'contact', 'phone', 'address']);
crud('franchisees', 'franchisees', ['name', 'contact', 'phone', 'address', 'dist_type', 'sub_count', 'order_count', 'total_amount', 'settled_amount']);
crud('riders', 'riders', ['name', 'phone', 'status', 'area']);
crud('promotions', 'promotions', ['name', 'type', 'input', 'output', 'month', 'status']);
crud('news', 'news', ['title', 'content', 'author', 'category', 'status']);
crud('lottery', 'lottery', ['name', 'status', 'start_date', 'end_date', 'prize']);
crud('carousel', 'carousel', ['title', 'image_url', 'link_url', 'sort', 'status']);

app.get('/api/coupon-orders', (req, res) => {
  const { start_date, end_date } = req.query;
  let list = db.data.coupon_orders || [];
  if (start_date) list = list.filter(r => r.created_at >= start_date);
  if (end_date) list = list.filter(r => r.created_at <= end_date);
  res.json([...list].reverse());
});

app.get('/api/purchase-orders', (req, res) => {
  const list = db.data.purchase_orders || [];
  const drugs = Object.fromEntries(db.data.drugs.map(d => [d.id, d]));
  const merchants = Object.fromEntries((db.data.merchants || []).map(m => [m.id, m]));
  res.json([...list].reverse().map(r => ({ ...r, drug_name: drugs[r.drug_id]?.name, merchant_name: merchants[r.merchant_id]?.name })));
});
app.post('/api/purchase-orders', (req, res) => {
  const { drug_id, merchant_id, quantity, order_date } = req.body;
  const id = nextId(db.data.purchase_orders || []);
  const arr = db.data.purchase_orders || [];
  arr.push({ id, drug_id, merchant_id, quantity, order_date: order_date || new Date().toISOString().slice(0, 10), order_no: 'PO' + Date.now(), created_at: new Date().toISOString() });
  db.data.purchase_orders = arr;
  db.write();
  res.json({ id });
});

app.get('/api/orders', (req, res) => {
  const { start_date, end_date } = req.query;
  let list = db.data.drug_records.filter(r => r.type === 'out');
  if (start_date) list = list.filter(r => r.record_date >= start_date);
  if (end_date) list = list.filter(r => r.record_date <= end_date);
  const drugs = Object.fromEntries(db.data.drugs.map(d => [d.id, d]));
  const personnel = Object.fromEntries(db.data.personnel.map(p => [p.id, p]));
  res.json([...list].reverse().map(r => ({ ...r, order_no: 'ORD' + r.id, drug_name: drugs[r.drug_id]?.name, personnel_name: personnel[r.personnel_id]?.name, order_date: r.record_date })));
});

app.get('/api/withdrawals', (req, res) => res.json([...(db.data.withdrawals || [])].reverse()));
app.put('/api/withdrawals/:id', (req, res) => {
  const w = (db.data.withdrawals || []).find(x => x.id === +req.params.id);
  if (w && req.body.status) { w.status = req.body.status; w.updated_at = new Date().toISOString(); }
  db.write();
  res.json({ ok: true });
});
app.get('/api/transactions', (req, res) => {
  const { start_date, end_date } = req.query;
  let list = db.data.transactions || [];
  if (start_date) list = list.filter(r => r.created_at >= start_date);
  if (end_date) list = list.filter(r => r.created_at <= end_date);
  res.json([...list].reverse());
});

app.get('/api/dashboard', (req, res) => {
  const records = db.data.drug_records || [];
  const outRecords = records.filter(r => r.type === 'out');
  const inRecords = records.filter(r => r.type === 'in');
  const drugs = db.data.drugs || [];
  const users = db.data.users || [];
  const orders = db.data.purchase_orders || [];
  const withdrawals = db.data.withdrawals || [];

  const today = new Date().toISOString().slice(0, 10);
  const todayOut = outRecords.filter(r => r.record_date === today);
  const todayIn = inRecords.filter(r => r.record_date === today);

  const pendingWithdraw = withdrawals.filter(w => w.status === 'pending').length;
  const pendingOrders = orders.filter(o => !o.confirmed).length;

  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    const qty = outRecords.filter(r => r.record_date === ds).reduce((s, r) => s + r.quantity, 0);
    const inQty = inRecords.filter(r => r.record_date === ds).reduce((s, r) => s + r.quantity, 0);
    last7.push({ date: ds, outQty: qty, inQty });
  }

  res.json({
    pending: {
      orders: pendingOrders,
      withdraw: pendingWithdraw,
      inToday: todayIn.reduce((s, r) => s + r.quantity, 0),
      outToday: todayOut.reduce((s, r) => s + r.quantity, 0)
    },
    overview: {
      totalOut: outRecords.reduce((s, r) => s + r.quantity, 0),
      totalIn: inRecords.reduce((s, r) => s + r.quantity, 0),
      totalDrugs: drugs.length,
      totalUsers: users.length,
      totalRecords: records.length
    },
    trend: last7
  });
});

app.get('/api/sales-chart', (req, res) => {
  const { start_date, end_date } = req.query;
  const records = db.data.drug_records.filter(r => r.type === 'out');
  const drugs = Object.fromEntries(db.data.drugs.map(d => [d.id, d]));
  const personnel = Object.fromEntries(db.data.personnel.map(p => [p.id, p]));
  let list = records;
  if (start_date) list = list.filter(r => r.record_date >= start_date);
  if (end_date) list = list.filter(r => r.record_date <= end_date);

  const byDate = {};
  const byDrug = {};
  const byPerson = {};
  for (const r of list) {
    byDate[r.record_date] = (byDate[r.record_date] || 0) + r.quantity;
    const dn = drugs[r.drug_id]?.name || '未知';
    byDrug[dn] = (byDrug[dn] || 0) + r.quantity;
    const pn = personnel[r.personnel_id]?.name || '未知';
    byPerson[pn] = (byPerson[pn] || 0) + r.quantity;
  }

  res.json({
    byDate: Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b)).map(([date, qty]) => ({ date, qty })),
    byDrug: Object.entries(byDrug).sort(([, a], [, b]) => b - a).slice(0, 10).map(([name, qty]) => ({ name, qty })),
    byPerson: Object.entries(byPerson).sort(([, a], [, b]) => b - a).map(([name, qty]) => ({ name, qty })),
    total: list.reduce((s, r) => s + r.quantity, 0),
    totalDrugs: new Set(list.map(r => r.drug_id)).size,
    totalPersonnel: new Set(list.filter(r => r.personnel_id).map(r => r.personnel_id)).size,
    totalRecords: list.length
  });
});

app.get('/api/vis/all', (req, res) => {
  const records = db.data.drug_records || [];
  const users = db.data.users || [];
  const personnel = db.data.personnel || [];
  const franchisees = db.data.franchisees || [];
  const promos = db.data.promotions || [];

  const staffMap = {};
  for (const p of personnel) { const t = p.type || '其他'; staffMap[t] = (staffMap[t] || 0) + 1; }
  const staff = Object.entries(staffMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const chMap = {};
  for (const u of users) { const c = u.channel || '其他'; chMap[c] = (chMap[c] || 0) + 1; }
  const channels = Object.entries(chMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const ageRanges = ['0-25岁','26-30岁','31-45岁','46-60岁','60岁以上'];
  const getIdx = (age) => { if (age <= 25) return 0; if (age <= 30) return 1; if (age <= 45) return 2; if (age <= 60) return 3; return 4; };
  const ageData = ageRanges.map(age => ({ age, m: 0, f: 0 }));
  for (const u of users) { if (!u.age || !u.gender) continue; const idx = getIdx(u.age); if (u.gender === 'male') ageData[idx].m++; else ageData[idx].f++; }

  const outMap = {}, inMap = {};
  for (const r of records) {
    const city = r.city || '未知';
    if (r.type === 'out') outMap[city] = (outMap[city] || 0) + r.quantity;
    else inMap[city] = (inMap[city] || 0) + r.quantity;
  }
  const cityOutRank = Object.entries(outMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);
  const cityInRank = Object.entries(inMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);

  const d7 = new Date(); d7.setDate(d7.getDate() - 7); const startDate = d7.toISOString().slice(0, 10);
  const dailyMap = {};
  for (const r of records) { if (r.record_date < startDate) continue; const city = r.city || '未知'; dailyMap[city] = (dailyMap[city] || 0) + 1; }
  const cityDaily = Object.entries(dailyMap).map(([city, value]) => ({ city, value })).sort((a, b) => b.value - a.value).slice(0, 8);

  const promoMap = {};
  for (const p of promos) { if (!promoMap[p.type]) promoMap[p.type] = { name: p.type, input: 0, output: 0 }; promoMap[p.type].input += +p.input || 0; promoMap[p.type].output += +p.output || 0; }
  const promotions = Object.values(promoMap);

  const distRank = franchisees.map(f => ({
    name: f.name, type: f.dist_type || '本地管家',
    phone: f.phone ? f.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '',
    sub: f.sub_count || 0, orders: f.order_count || 0,
    amount: (+f.total_amount || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    settled: (+f.settled_amount || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  })).sort((a, b) => b.orders - a.orders);

  res.json({ staff, channels, ageData, cityOutRank, cityInRank, cityDaily, promotions, distRank });
});

app.get('/api/schema/:module', (req, res) => {
  const s = tableSchema[req.params.module];
  if (!s) return res.status(404).json({ error: 'Schema not found' });
  res.json(s);
});

app.get('/api/settings', (req, res) => res.json(db.data.settings || {}));
app.post('/api/settings', (req, res) => { db.data.settings = { ...db.data.settings, ...req.body }; db.write(); res.json({ ok: true }); });
app.get('/api/lottery-settings', (req, res) => res.json(db.data.lottery_settings || {}));
app.post('/api/lottery-settings', (req, res) => { db.data.lottery_settings = { ...db.data.lottery_settings, ...req.body }; db.write(); res.json({ ok: true }); });

const PORT = 3001;
app.listen(PORT, () => console.log(`API http://localhost:${PORT}`));
