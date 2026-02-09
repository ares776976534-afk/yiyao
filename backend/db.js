import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, 'data.json');
const adapter = new JSONFile(file);
const defaultData = {
  drugs: [], personnel: [], drug_records: [],
  users: [], merchants: [], franchisees: [], riders: [],
  purchase_orders: [], coupon_orders: [], orders: [],
  withdrawals: [], transactions: [], news: [],
  lottery: [], carousel: [],
  settings: {}, lottery_settings: {}
};

const db = new Low(adapter, defaultData);
await db.read();
db.data = db.data || defaultData;
for (const k of Object.keys(defaultData)) {
  if (Array.isArray(defaultData[k]) && !Array.isArray(db.data[k])) db.data[k] = [];
  else if (typeof defaultData[k] === 'object' && defaultData[k] !== null && !Array.isArray(defaultData[k]) && (typeof db.data[k] !== 'object' || db.data[k] === null)) db.data[k] = {};
}
await db.write();

export default db;
