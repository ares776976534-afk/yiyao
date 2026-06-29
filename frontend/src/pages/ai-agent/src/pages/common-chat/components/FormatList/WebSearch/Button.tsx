import React, { useCallback, useEffect, useState } from 'react';
import styles from './button.module.css';
import { commonRecord } from '@/utils/log';
import { $t } from '@/i18n';

const defaultIcon = 'https://img.alicdn.com/imgextra/i1/O1CN01jgduqp1wCdEAp9X2F_!!6000000006272-2-tps-36-36.png';
interface SearchResultProps {
  id?: string;
  title?: string;
  icon?: string;
  onMoreClick: (rightSideType: string, rightSideData: any) => void;
  cardType: string;
  webSearchToolModelList?: any[];
}

export const LoadImage = ({ src = defaultIcon, alt, ...props }) => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setLoaded(true);
    };
  }, [src]);
  return loaded ? <img src={src} alt={alt} {...props} /> : <img src={defaultIcon} alt={alt} {...props} />;
};

const WebSearchButton: React.FC<SearchResultProps> = (props) => {
  const { title = $t("global-1688-ai-app.common-chat.FormatList.WebSearch.Button.wyjs", "网页检索"), icon = "https://img.alicdn.com/imgextra/i2/O1CN01U3RL7727yE8sycux3_!!6000000007865-2-tps-32-32.png", onMoreClick, webSearchToolModelList = [] } = props;

  const displayBadges = webSearchToolModelList?.slice(0, 3).map(item => ({
    icon: item.hostLogo,
    title: item.title,
    url: item.url,
  }));

  const handleMoreClick = useCallback(() => {
    onMoreClick('WEB_SEARCH', props);
    commonRecord(`查看网页检索`);
  }, [onMoreClick, props]);


  return (
    <div className={styles.container} onClick={handleMoreClick}>
      <img
        className={styles.icon}
        src={icon}
        alt={$t("global-1688-ai-app.common-chat.FormatList.WebSearch.Button.jsicon", "检索图标")}
      />
      <div className={styles.content}>
        <span className={styles.title}>{title}</span>
        {displayBadges.map((badge, index) => (
          <LoadImage src={badge.icon} alt={badge.title} style={{ marginLeft: index > 0 ? '-10px' : '0' }} className={styles.badge} />
        ))}
        <span className={styles.count}>{$t("global-1688-ai-app.common-chat.FormatList.WebSearch.Button.ggwy", `共${webSearchToolModelList?.length}个网页`, [webSearchToolModelList?.length])}</span>
      </div>
    </div>
  );
};

export default WebSearchButton;
