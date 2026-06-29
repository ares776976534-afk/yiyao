import styles from '../../index.module.css';
import style from './index.module.css';
import { $t } from '@/i18n';

interface TypeAppVersionProps {
  isGlobal?: boolean;
}

const featureItems = [
  {
    icon: 'https://img.alicdn.com/imgextra/i1/O1CN01ksBmLL1xxB62SfUhx_!!6000000006509-2-tps-32-32.png',
    textKey: 'global-1688-ai-app.inquiry.NewHomeContent.yhnjh',
    textDefault: '一键多发，Agent自动跟进，全天候执行',
  },
  {
    icon: 'https://img.alicdn.com/imgextra/i1/O1CN01ksBmLL1xxB62SfUhx_!!6000000006509-2-tps-32-32.png',
    textKey: 'global-1688-ai-app.inquiry.NewHomeContent.Arl',
    textDefault: 'AI模拟真人沟通，随时灵活介入',
  },
  {
    icon: 'https://img.alicdn.com/imgextra/i1/O1CN01ksBmLL1xxB62SfUhx_!!6000000006509-2-tps-32-32.png',
    textKey: 'global-1688-ai-app.inquiry.NewHomeContent.zcb',
    textDefault: '智能解析，生成AI分析报告',
  },
];

const centerImages = {
  cn: 'https://img.alicdn.com/imgextra/i4/O1CN016cHOvY208Hw58yhAy_!!6000000006804-2-tps-444-278.png',
  global: 'https://img.alicdn.com/imgextra/i2/O1CN018HEukG1v5TQlx35KF_!!6000000006121-2-tps-444-278.png',
};

const AppVersion = ({ isGlobal = false }: TypeAppVersionProps) => {
  const contentLeftStyle = isGlobal ? { width: 340, height: '100%', zIndex: 3, fontFamily: 'Poppins' } : undefined;
  const featureListStyle = isGlobal ? { width: 340, height: '100%', minWidth: '100%', fontFamily: 'Poppins' } : undefined;
  const imageContainerStyle = isGlobal ? { bottom: '-40px', right: '249px', fontFamily: 'Poppins' } : undefined;

  return (
    <>
      <div className={styles.contentLeft} style={contentLeftStyle}>
        <div className={styles.featureList} style={featureListStyle}>
          {featureItems.map((item, index) => (
            <div className={styles.featureItem} key={index}>
              <img className={styles.icon} src={item.icon} alt="icon" />
              <span className={`${styles.featureText}${isGlobal ? ` ${style.text}` : ''}`}>
                {$t(item.textKey, item.textDefault)}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.imageContainer} style={imageContainerStyle}>
        <img
          className={styles.centerImage}
          src={isGlobal ? centerImages.global : centerImages.cn}
          alt="center"
        />
      </div>
    </>
  );
};

export const Cn = () => <AppVersion isGlobal={false} />;
export const Global = () => <AppVersion isGlobal={true} />;

export default AppVersion;
