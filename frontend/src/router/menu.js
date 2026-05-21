import {
  DashboardOutlined, MedicineBoxOutlined, TeamOutlined, ShopOutlined,
  ShoppingCartOutlined, FileTextOutlined, DollarOutlined, BarChartOutlined,
  GiftOutlined, CarOutlined, BankOutlined, TrophyOutlined, SettingOutlined,
  PictureOutlined, UserOutlined, NotificationOutlined, IdcardOutlined, PlayCircleOutlined
} from '@ant-design/icons';
import { ROUTES } from './routes';

export const menuConfig = [
  { key: ROUTES.DASHBOARD, icon: DashboardOutlined, label: '数据看板' },
  {
    key: 'drug-manage',
    icon: MedicineBoxOutlined,
    label: '商品管理',
    children: [
      { key: ROUTES.DRUGS, label: '药品列表' },
      { key: ROUTES.STOCK, label: '库存查询' },
      { key: ROUTES.RECORDS, label: '出入库记录' },
      { key: ROUTES.PURCHASE, label: '进货订单' }
    ]
  },
  {
    key: 'client-manage',
    icon: TeamOutlined,
    label: '客户管理',
    children: [
      { key: ROUTES.USERS, label: '用户管理' },
      { key: ROUTES.MERCHANT, label: '商家管理' },
      { key: ROUTES.FRANCHISEE, label: '加盟商管理' }
    ]
  },
  {
    key: 'order-manage',
    icon: FileTextOutlined,
    label: '订单管理',
    children: [
      { key: ROUTES.ORDERS, label: '订单列表' },
      { key: ROUTES.COUPON, label: '积分券订单' }
    ]
  },
  {
    key: 'finance-manage',
    icon: DollarOutlined,
    label: '财务管理',
    children: [
      { key: ROUTES.TRANSACTION, label: '流水管理' },
      { key: ROUTES.WITHDRAW, label: '提现管理' }
    ]
  },
  {
    key: 'report-manage',
    icon: BarChartOutlined,
    label: '报表统计',
    children: [
      { key: ROUTES.SALES, label: '销售统计' },
      { key: ROUTES.SALES_DASHBOARD, label: '销售看板' }
    ]
  },
  {
    key: 'operation-manage',
    icon: ShopOutlined,
    label: '运营管理',
    children: [
      { key: ROUTES.MALL, label: '商城管理' },
      { key: ROUTES.CAROUSEL, label: '首页轮播' },
      { key: ROUTES.NEWS, label: '新闻公告' }
    ]
  },
  {
    key: 'marketing-manage',
    icon: GiftOutlined,
    label: '营销管理',
    children: [
      { key: ROUTES.LOTTERY, label: '抽奖列表' },
      { key: ROUTES.LOTTERY_SETTING, label: '抽奖设置' },
      { key: ROUTES.PROMOTIONS, label: '推广投放' }
    ]
  },
  {
    key: 'staff-manage',
    icon: UserOutlined,
    label: '人员管理',
    children: [
      { key: ROUTES.PERSONNEL, label: '员工管理' },
      { key: ROUTES.RIDERS, label: '骑手管理' }
    ]
  },
  {
    key: 'system-manage',
    icon: SettingOutlined,
    label: '系统配置',
    children: [
      { key: ROUTES.SETTINGS, label: '系统设置' }
    ]
  },
  { key: ROUTES.VISUALIZATION, icon: BarChartOutlined, label: '数据可视化' },
  { key: ROUTES.IDCARD, icon: IdcardOutlined, label: '身份证查询' },
  {
    key: 'game-manage',
    icon: PlayCircleOutlined,
    label: '游戏中心',
    children: [
      { key: ROUTES.TETRIS, label: '俄罗斯方块' },
      { key: ROUTES.GOMOKU, label: '五子棋' },
      { key: ROUTES.SPIDER, label: '蜘蛛纸牌' },
      { key: ROUTES.ONESTROKE, label: '一笔连珠' },
      { key: ROUTES.PLANE, label: '飞机大战' },
      { key: ROUTES.XIANGQI, label: '中国象棋' },
      { key: ROUTES.JUNQI, label: '军棋' },
      { key: ROUTES.CHESS, label: '国际象棋' }
    ]
  }
];
