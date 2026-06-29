import type { CSSProperties } from 'react';
import { getVersionComponent } from '@/utils/versionRouter';
import { $t } from '@/i18n';
import styles from '../../../index.module.css';

const Title = ({ style }: { style?: CSSProperties }) => (
  <div className={styles.myInquiryTasksTitle} style={style}>
    {$t('global-1688-ai-app.inquiry.Dashborad.myxpTask', '我的询盘任务')}
  </div>
);

export default getVersionComponent({
  CN: () => <Title />,
  GLOBAL: () => <Title style={{ fontFamily: 'Poppins' }} />,
});