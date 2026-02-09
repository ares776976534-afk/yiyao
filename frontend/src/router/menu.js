import {
  UserOutlined, ShopOutlined, GiftOutlined, TeamOutlined, ShoppingCartOutlined,
  CarOutlined, FileTextOutlined, DollarOutlined, BankOutlined, FileOutlined,
  TrophyOutlined, SettingOutlined, MedicineBoxOutlined, BarChartOutlined
} from '@ant-design/icons';
import { ROUTES } from './routes';

export const menuConfig = [
  { key: ROUTES.USERS, icon: UserOutlined, label: '用户管理' },
  {
    key: 'merchant',
    icon: ShopOutlined,
    label: '商家管理',
    children: [{ key: ROUTES.MERCHANT, label: '商家列表' }]
  },
  { key: ROUTES.COUPON, icon: GiftOutlined, label: '积分券订单' },
  {
    key: 'franchisee',
    icon: TeamOutlined,
    label: '加盟商管理',
    children: [{ key: ROUTES.FRANCHISEE, label: '加盟商列表' }]
  },
  { key: ROUTES.PURCHASE, icon: ShoppingCartOutlined, label: '进货订单' },
  { key: ROUTES.RIDERS, icon: CarOutlined, label: '骑手管理' },
  { key: ROUTES.ORDERS, icon: FileTextOutlined, label: '订单管理' },
  {
    key: 'mall',
    icon: ShopOutlined,
    label: '商城管理',
    children: [{ key: ROUTES.MALL, label: '商城列表' }]
  },
  { key: ROUTES.WITHDRAW, icon: DollarOutlined, label: '提现管理' },
  { key: ROUTES.TRANSACTION, icon: BankOutlined, label: '流水管理' },
  { key: ROUTES.NEWS, icon: FileOutlined, label: '新闻管理' },
  {
    key: 'lottery',
    icon: TrophyOutlined,
    label: '抽奖中心',
    children: [
      { key: ROUTES.LOTTERY, label: '抽奖列表' },
      { key: ROUTES.LOTTERY_SETTING, label: '抽奖设置' }
    ]
  },
  {
    key: 'settings',
    icon: SettingOutlined,
    label: '设置',
    children: [{ key: ROUTES.SETTINGS, label: '系统设置' }]
  },
  { key: ROUTES.CAROUSEL, icon: MedicineBoxOutlined, label: '首页轮播' },
  { key: ROUTES.DRUGS, icon: MedicineBoxOutlined, label: '药品管理' },
  { key: ROUTES.STOCK, icon: BarChartOutlined, label: '库存查询' },
  { key: ROUTES.RECORDS, icon: FileTextOutlined, label: '出入库记录' },
  { key: ROUTES.PERSONNEL, icon: UserOutlined, label: '人员管理' },
  { key: ROUTES.SALES, icon: BarChartOutlined, label: '销售统计' }
];
