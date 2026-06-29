import {
  HomeLineIcon,
  MobileInsightIcon,
  SourcingLineIcon,
  DesignLineIcon,
  InquiryLineIcon,
  ConsultLineIcon,
  SettingsIcon,
  AccountIcon,
  MessageContactIcon,
  ExitIcon,
  MobileSettingIcon,
} from '@/components/Icon';

export const MobileMenuConfig = [
  {
    key: 'home',
    label: '首页',
    icon: <HomeLineIcon />,
  },
  { type: 'divider' },
  {
    key: 'insight',
    label: '选品',
    icon: <MobileInsightIcon fill="#000000" />,
  },
  {
    key: 'sourcing',
    label: '找商',
    icon: <SourcingLineIcon />,
  },
  {
    key: 'design',
    label: '素材',
    icon: <DesignLineIcon />,
  },
  {
    key: 'inquiry',
    label: '询盘',
    icon: <InquiryLineIcon />,
  },
  {
    key: 'chat',
    label: '咨询',
    icon: <ConsultLineIcon />,
  },
];

export const MobileFooterConfig = [
  // {
  //   key: 'language',
  //   icon: <img style={{ width: '14px', height: '14px' }} src="https://img.alicdn.com/imgextra/i2/O1CN01pmNskQ1vW2NLbgVpF_!!6000000006179-2-tps-32-32.png" alt="" srcSet="" />,
  // },
  {
    key: 'settings',
    label: '设置',
    icon: <MobileSettingIcon />,
  },
];

export const MobileNavBarConfig = [
  {
    type: 'header',
    showDivider: true,
    items: [
      {
        key: 'account',
        icon: <AccountIcon />,
        label: '账号',
        visible: true,
      },
      {
        key: 'settings',
        icon: <SettingsIcon width={16} height={16} />,
        label: '设置',
        visible: true,
      },
      {
        key: 'contact',
        icon: <MessageContactIcon />,
        label: '联系我们',
        visible: true,
      },
    ],
  },
  {
    type: 'footer',
    showDivider: false,
    items: [
      {
        key: 'logout',
        icon: <ExitIcon />,
        label: '退出登录',
        type: 'danger',
        visible: true,
      },
    ],
  },
];