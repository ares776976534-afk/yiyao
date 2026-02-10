import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const d = (offset) => { const t = new Date('2026-02-09'); t.setDate(t.getDate() - offset); return t.toISOString().slice(0, 10); };
const ts = (offset) => { const t = new Date('2026-02-09T08:00:00Z'); t.setDate(t.getDate() - offset); t.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60)); return t.toISOString(); };
const pick = a => a[Math.floor(Math.random() * a.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const phone = () => '1' + pick(['38','39','50','51','52','58','59','86','87','88']) + Array.from({length:8},()=>rand(0,9)).join('');

const CITIES = ['广州市','北京市','上海市','深圳市','杭州市','成都市','武汉市','南京市','苏州市','长沙市','重庆市','天津市','郑州市','西安市','青岛市'];
const STAFF_TYPES = ['导游管家','导购管家','本地管家','分销管家'];
const USER_CHANNELS = ['抖音','小红书','微信','朋友介绍','百度搜索','线下推广','其他'];
const NEWS_CATS = ['公司动态','行业新闻','政策法规','健康知识'];

const drugs = [
  { id:1, name:'阿莫西林胶囊', code:'AMXL-001', specification:'0.5g×24粒/盒', unit:'盒' },
  { id:2, name:'布洛芬缓释胶囊', code:'BLFE-002', specification:'0.3g×20粒/盒', unit:'盒' },
  { id:3, name:'头孢克肟片', code:'TBKW-003', specification:'0.1g×10片/盒', unit:'盒' },
  { id:4, name:'板蓝根颗粒', code:'BLGK-004', specification:'10g×20袋/盒', unit:'盒' },
  { id:5, name:'复方甘草片', code:'FFGC-005', specification:'100片/瓶', unit:'瓶' },
  { id:6, name:'盐酸氨溴索口服液', code:'YSAN-006', specification:'100ml/瓶', unit:'瓶' },
  { id:7, name:'蒙脱石散', code:'MTSS-007', specification:'3g×10袋/盒', unit:'盒' },
  { id:8, name:'奥美拉唑肠溶胶囊', code:'AMLZ-008', specification:'20mg×14粒/盒', unit:'盒' },
  { id:9, name:'双氯芬酸钠肠溶片', code:'SLFN-009', specification:'25mg×30片/盒', unit:'盒' },
  { id:10, name:'对乙酰氨基酚片', code:'DYXA-010', specification:'0.5g×12片/盒', unit:'盒' },
  { id:11, name:'罗红霉素胶囊', code:'LHMS-011', specification:'0.15g×12粒/盒', unit:'盒' },
  { id:12, name:'维生素C片', code:'WSSC-012', specification:'0.1g×100片/瓶', unit:'瓶' },
  { id:13, name:'感冒灵颗粒', code:'GMLK-013', specification:'10g×9袋/盒', unit:'盒' },
  { id:14, name:'藿香正气水', code:'HXZQ-014', specification:'10ml×10支/盒', unit:'盒' },
  { id:15, name:'氯雷他定片', code:'LLTD-015', specification:'10mg×6片/盒', unit:'盒' },
].map(x => ({ ...x, created_at: ts(rand(20,60)) }));

const personnel = [
  { id:1, name:'张伟', type:'导游管家' },
  { id:2, name:'李娜', type:'导购管家' },
  { id:3, name:'王强', type:'本地管家' },
  { id:4, name:'刘芳', type:'本地管家' },
  { id:5, name:'陈明', type:'分销管家' },
  { id:6, name:'杨洋', type:'导游管家' },
  { id:7, name:'赵丽', type:'导购管家' },
  { id:8, name:'周杰', type:'本地管家' },
  { id:9, name:'孙磊', type:'本地管家' },
  { id:10, name:'吴静', type:'导游管家' },
  { id:11, name:'郑浩', type:'分销管家' },
  { id:12, name:'冯雪', type:'导购管家' },
].map(x => ({ ...x, phone: phone(), created_at: ts(rand(30,60)) }));

const drug_records = [];
let rid = 0;
for (let i = 30; i >= 0; i--) {
  const cnt = rand(3, 7);
  for (let j = 0; j < cnt; j++) {
    const type = Math.random() > 0.4 ? 'in' : 'out';
    rid++;
    drug_records.push({
      id: rid,
      drug_id: rand(1, 15),
      type,
      quantity: rand(5, 200),
      batch_no: 'B' + d(i).replace(/-/g, '') + '-' + String(j + 1).padStart(2, '0'),
      record_date: d(i),
      personnel_id: type === 'out' ? rand(1, 12) : null,
      city: pick(CITIES),
      note: pick(['', '', '', '急配', '补货', '退货', '赠品', '样品']),
      created_at: ts(i)
    });
  }
}

const firstNames = ['小明','小红','小刚','小丽','阿强','阿美','志华','建国','秀英','国强','春花','大伟','晓峰','婷婷','浩然','思琪','子涵','雨萱','梓轩','诗涵','一诺','欣怡','宇轩','佳琪','昊天','雅琴','博文','嘉怡','天佑','紫萱','文博','雅婷','皓宇','梦琪','鑫磊','慧敏','泽宇','佳慧','瑞琪','晓东','美琳','志远','淑芳','明辉','雪梅','建华','丽娜','永强','芳芳','军伟'];
const users = [];
for (let i = 0; i < 50; i++) {
  users.push({
    id: i + 1,
    username: firstNames[i] || '用户' + (i + 1),
    phone: phone(),
    password: '123456',
    role: i === 0 ? 'admin' : i < 3 ? 'manager' : i < 8 ? 'staff' : 'member',
    status: pick(['active','active','active','active','inactive','banned']),
    channel: pick(USER_CHANNELS),
    age: rand(18, 70),
    gender: Math.random() > 0.45 ? 'male' : 'female',
    city: pick(CITIES),
    created_at: ts(rand(0, 50))
  });
}

const merchants = [
  { id:1, name:'国药集团', contact:'王经理', address:'北京市朝阳区国贸大厦A座' },
  { id:2, name:'华润医药', contact:'李总', address:'深圳市南山区华润大厦' },
  { id:3, name:'上海医药', contact:'张经理', address:'上海市浦东新区陆家嘴金融中心' },
  { id:4, name:'广药集团', contact:'陈经理', address:'广州市天河区广药大厦' },
  { id:5, name:'修正药业', contact:'刘经理', address:'长春市高新区修正路1号' },
  { id:6, name:'云南白药', contact:'杨总', address:'昆明市呈贡区云白路88号' },
  { id:7, name:'同仁堂', contact:'赵经理', address:'北京市东城区同仁堂大厦' },
  { id:8, name:'九州通', contact:'孙经理', address:'武汉市东西湖区九州通大道' },
].map(x => ({ ...x, phone: phone(), created_at: ts(rand(20,50)) }));

const DIST_TYPES = ['本地管家','导游管家','分销管家'];
const franchisees = [
  { id:1, name:'仁和大药房', contact:'马店长', address:'成都市武侯区人民南路128号' },
  { id:2, name:'百姓大药房', contact:'黄店长', address:'杭州市西湖区文三路256号' },
  { id:3, name:'大参林药房', contact:'林店长', address:'广州市番禺区市桥大北路' },
  { id:4, name:'老百姓大药房', contact:'吴店长', address:'长沙市芙蓉区五一大道' },
  { id:5, name:'益丰药房', contact:'郑店长', address:'上海市徐汇区漕溪路' },
  { id:6, name:'一心堂', contact:'冯店长', address:'昆明市盘龙区北京路' },
  { id:7, name:'国大药房', contact:'钱经理', address:'北京市海淀区中关村大街' },
  { id:8, name:'海王星辰', contact:'周店长', address:'深圳市福田区福华路' },
  { id:9, name:'健之佳', contact:'吕经理', address:'南京市鼓楼区中山路' },
  { id:10, name:'漱玉平民大药房', contact:'曹店长', address:'济南市历下区泉城路' },
].map(x => ({
  ...x,
  phone: phone(),
  dist_type: pick(DIST_TYPES),
  sub_count: rand(50, 1000),
  order_count: rand(30, 400),
  total_amount: rand(2000, 20000),
  settled_amount: rand(1500, 18000),
  created_at: ts(rand(15,45))
}));

const riders = [
  { id:1, name:'张飞', status:'active', area:'城东区' },
  { id:2, name:'关羽', status:'active', area:'城西区' },
  { id:3, name:'刘备', status:'active', area:'城南区' },
  { id:4, name:'赵云', status:'active', area:'城北区' },
  { id:5, name:'马超', status:'active', area:'开发区' },
  { id:6, name:'黄忠', status:'rest', area:'城东区' },
  { id:7, name:'诸葛亮', status:'active', area:'高新区' },
  { id:8, name:'吕布', status:'inactive', area:'城南区' },
].map(x => ({ ...x, phone: phone(), created_at: ts(rand(15,50)) }));

const purchase_orders = [];
for (let i = 0; i < 20; i++) {
  purchase_orders.push({
    id: i + 1, drug_id: rand(1, 15), merchant_id: rand(1, 8), quantity: rand(50, 500),
    order_date: d(rand(0, 25)), order_no: 'PO' + Date.now() + String(i).padStart(3, '0'),
    status: pick(['pending','confirmed','confirmed','shipped','completed','completed']),
    created_at: ts(rand(0, 25))
  });
}

const couponNames = ['满100减20券','满200减50券','新人专享券','会员8折券','满减药品券','积分兑换券'];
const coupon_orders = [];
for (let i = 0; i < 15; i++) {
  coupon_orders.push({
    id: i + 1, order_no: 'CPN' + Date.now() + String(i).padStart(3, '0'),
    username: pick(users).username, coupon_name: pick(couponNames),
    quantity: rand(1, 3), created_at: ts(rand(0, 20))
  });
}

const withdrawals = [];
for (let i = 0; i < 12; i++) {
  withdrawals.push({
    id: i + 1, username: pick(users.filter(u => u.role === 'member')).username,
    amount: rand(50, 2000), status: pick(['pending','approved','approved','rejected']),
    created_at: ts(rand(0, 20))
  });
}

const txTypes = ['充值','消费','提现','退款','佣金','积分兑换'];
const transactions = [];
for (let i = 0; i < 25; i++) {
  const type = pick(txTypes);
  transactions.push({
    id: i + 1, trans_no: 'TX' + Date.now() + String(i).padStart(3, '0'),
    type, amount: (type === '退款' || type === '提现' ? -1 : 1) * rand(10, 3000),
    note: pick(['', '', type + '操作', '系统自动', '用户申请']), created_at: ts(rand(0, 25))
  });
}

const news = [
  { id:1, title:'2026年医药行业发展趋势分析', content:'随着医药改革的深入推进，2026年医药行业将迎来新的发展机遇...', author:'管理员', category:'行业新闻', status:'published' },
  { id:2, title:'新版药品管理法正式实施', content:'国家药品监督管理局发布最新药品管理法实施细则...', author:'管理员', category:'政策法规', status:'published' },
  { id:3, title:'公司获得ISO9001质量管理认证', content:'经过严格的审核流程，我公司正式获得ISO9001质量管理体系认证...', author:'张伟', category:'公司动态', status:'published' },
  { id:4, title:'春季常见疾病预防指南', content:'春季气温变化大，是各种疾病的高发季节。以下是常见疾病预防措施...', author:'李娜', category:'健康知识', status:'published' },
  { id:5, title:'新品上线通知：阿莫西林胶囊', content:'我司近日引进新批次阿莫西林胶囊，品质更优...', author:'管理员', category:'公司动态', status:'published' },
  { id:6, title:'关于调整配送时间的通知', content:'为提升服务质量，即日起配送时间调整为早8:00至晚20:00...', author:'管理员', category:'公司动态', status:'published' },
  { id:7, title:'国家集采第十批药品目录公布', content:'国家医保局正式公布第十批集采药品目录，涉及52个品种...', author:'管理员', category:'政策法规', status:'draft' },
  { id:8, title:'员工培训：药品存储规范', content:'为确保药品质量安全，将于本月15日开展药品存储规范培训...', author:'王强', category:'公司动态', status:'published' },
].map(x => ({ ...x, created_at: ts(rand(0, 30)) }));

const lottery = [
  { id:1, name:'新春好礼抽奖', status:'active', start_date:'2026-01-20', end_date:'2026-02-20', prize:'一等奖:免费体检套餐 二等奖:药品代金券50元 三等奖:积分100' },
  { id:2, name:'会员专属福利', status:'active', start_date:'2026-02-01', end_date:'2026-02-28', prize:'一等奖:保健品套装 二等奖:药品8折券 三等奖:积分50' },
  { id:3, name:'健康知识竞答', status:'ended', start_date:'2026-01-01', end_date:'2026-01-31', prize:'一等奖:血压计 二等奖:维生素礼盒 三等奖:口罩50只' },
  { id:4, name:'元宵节抽奖', status:'upcoming', start_date:'2026-02-15', end_date:'2026-02-17', prize:'一等奖:药品年卡 二等奖:代金券100元 三等奖:积分200' },
  { id:5, name:'三月女神节活动', status:'upcoming', start_date:'2026-03-01', end_date:'2026-03-10', prize:'一等奖:SPA体验券 二等奖:美容保健品 三等奖:积分100' },
].map(x => ({ ...x, created_at: ts(rand(5, 40)) }));

const carousel = [
  { id:1, title:'新春特惠 全场8折', image_url:'https://picsum.photos/800/300?random=1', link_url:'/drugs', sort:1, status:'active' },
  { id:2, title:'会员日 积分翻倍', image_url:'https://picsum.photos/800/300?random=2', link_url:'/lottery', sort:2, status:'active' },
  { id:3, title:'感冒季 常备药品推荐', image_url:'https://picsum.photos/800/300?random=3', link_url:'/drugs', sort:3, status:'active' },
  { id:4, title:'健康体检套餐上线', image_url:'https://picsum.photos/800/300?random=4', link_url:'/news', sort:4, status:'active' },
  { id:5, title:'春季养生指南', image_url:'https://picsum.photos/800/300?random=5', link_url:'/news', sort:5, status:'inactive' },
].map(x => ({ ...x, created_at: ts(rand(5, 30)) }));

const PROMO_TYPES = ['CPM','CPS','CPA','CPC','CPD'];
const promotions = [];
for (let i = 0; i < 15; i++) {
  const type = PROMO_TYPES[i % 5];
  promotions.push({
    id: i + 1,
    name: type + '推广计划' + (Math.floor(i / 5) + 1),
    type,
    input: rand(500, 5000),
    output: rand(300, 4000),
    month: d(rand(0, 25)).slice(0, 7),
    status: pick(['active','active','paused','completed']),
    created_at: ts(rand(0, 25))
  });
}

const data = {
  drugs, personnel, drug_records, users, merchants, franchisees, riders,
  purchase_orders, coupon_orders, orders: [], withdrawals, transactions,
  news, lottery, carousel, promotions,
  settings: { site_name: '医药后台管理系统', site_logo: '' },
  lottery_settings: { daily_limit: 3, points_cost: 10 }
};

writeFileSync(join(__dirname, 'data.json'), JSON.stringify(data, null, 2));
console.log('Mock data generated!');
Object.entries(data).forEach(([k, v]) => { if (Array.isArray(v)) console.log(`  ${k}: ${v.length}`); });
