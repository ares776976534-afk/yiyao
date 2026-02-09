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
  const { name, phone } = req.body;
  const id = nextId(db.data.personnel);
  db.data.personnel.push({ id, name: name || '', phone: phone || '', created_at: new Date().toISOString() });
  db.write();
  res.json({ id });
});

app.put('/api/personnel/:id', (req, res) => {
  const { name, phone } = req.body;
  const p = db.data.personnel.find(x => x.id === +req.params.id);
  if (p) { p.name = name || ''; p.phone = phone || ''; }
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
  const { drug_id, type, quantity, batch_no, record_date, personnel_id, note } = req.body;
  const id = nextId(db.data.drug_records);
  const r = {
    id,
    drug_id,
    type,
    quantity: +quantity || 0,
    batch_no: batch_no || '',
    record_date: record_date || new Date().toISOString().slice(0, 10),
    personnel_id: type === 'out' ? (personnel_id || null) : null,
    note: note || '',
    created_at: new Date().toISOString()
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

crud('users', 'users', ['username', 'phone', 'password']);
crud('merchants', 'merchants', ['name', 'contact', 'phone']);
crud('franchisees', 'franchisees', ['name', 'contact', 'phone']);
crud('riders', 'riders', ['name', 'phone']);
crud('news', 'news', ['title', 'content']);
crud('lottery', 'lottery', ['name']);
crud('carousel', 'carousel', ['title', 'image_url', 'sort']);

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
app.get('/api/transactions', (req, res) => {
  const { start_date, end_date } = req.query;
  let list = db.data.transactions || [];
  if (start_date) list = list.filter(r => r.created_at >= start_date);
  if (end_date) list = list.filter(r => r.created_at <= end_date);
  res.json([...list].reverse());
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
