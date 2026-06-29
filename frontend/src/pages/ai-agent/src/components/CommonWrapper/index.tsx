import React, { useEffect } from 'react';
import { ConfigProvider } from 'antd';
import theme from '@/theme/default.json';
import zhCN from 'antd/locale/zh_CN';
import { checkAuthAndLogin } from '@/utils/login';

import 'dayjs/locale/zh-cn';


export default ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    checkAuthAndLogin();
  }, []);

  return (
    <ConfigProvider theme={theme} locale={zhCN}>
      {children}
    </ConfigProvider>
  );
}