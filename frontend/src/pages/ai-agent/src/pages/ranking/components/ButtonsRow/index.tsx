import React from 'react';
import styles from './index.module.css';
import { useNavigateWithScroll } from '@/hooks/useNavigateWithScroll';
import useChatQuery from '@/pages/select-product/hooks/useChatQuery';
import jumpTo from '@/utils/jumpTo';
import log from '@/utils/log';

interface TypeButtonLogKeys {
  trackanalysis?: string;
  sourcing1688?: string;
  report?: string;
  select?: string;
  inquiry?: string;
  design?: string;
}

interface ButtonsRowProps {
  buttons: {
    icon: React.ReactNode;
    text: string;
    type: string;
  }[];
  imageUrl?: string;
  keyword?: string;
  platform?: string;
  isItem?: boolean;
  country?: string;
  logKeys?: TypeButtonLogKeys;
  itemId?: string;
}

const ButtonsRow: React.FC<ButtonsRowProps> = ({ buttons = [], imageUrl, keyword, platform, isItem, country, logKeys, itemId }) => {
  const { navigateByCache } = useChatQuery();
  const navigate = useNavigateWithScroll();
  const handleClick = (event, type: string) => {
    event.preventDefault();
    if (logKeys) {
      const typeToLogKey: Record<string, string | undefined> = {
        opportunity: logKeys.trackanalysis,
        supply: logKeys.sourcing1688 || logKeys.select,
        report: logKeys.report,
        inquiry: logKeys.inquiry,
        studio: logKeys.design,
      };
      const lk = typeToLogKey[type];
      if (lk) {
        const gokey = itemId ? { item_id: itemId } : undefined;
        log.record(lk as `/${string}.${string}.${string}`, 'CLK', gokey);
      }
    }
    switch (type) {
      case 'opportunity': // 新品
        if (keyword) {
          jumpTo(`/select-product?keyword=${keyword}&platform=${platform}&country=${country}`);
        } else {
          navigate('/select-product', { target: 'blank' });
        }
        break;
      case 'supply': // 选商
        if (isItem) {
          if (imageUrl) {
            navigateByCache({
              chatInput: {
                searchImageUrl: imageUrl,
                intention: 'AUTO',
              },
              url: '/sourcing',
              isMakeSimilar: false,
              target: 'blank',
            });
          } else {
            navigate('/sourcing', { target: 'blank' });
          }
        } else {
          if (keyword) {
            navigateByCache({
              chatInput: {
                query: keyword,
                intention: 'AUTO',
              },
              url: '/sourcing',
              isMakeSimilar: false,
              target: 'blank',
            });
          } else {
            navigate('/sourcing', { target: 'blank' });
          }
        }
        break;
      case 'report': // 图搜
        if (imageUrl) {
          jumpTo(`/select-product/image-search-agent?imageUrl=${imageUrl}`);
        } else {
          navigate('/select-product/image-search-agent', { target: 'blank' });
        }
        break;
      case 'inquiry': // 询盘
        if (imageUrl) {
          jumpTo(`/inquiry?fromPage=ZS&imageUrl=${imageUrl}`);
        } else {
          navigate('/inquiry', { target: 'blank' });
        }
        break;
      case 'studio': // 素材
        if (imageUrl && keyword) {
          jumpTo(`/studio?images=${imageUrl}&keyword=${keyword}`);
        } else {
          navigate('/studio', { target: 'blank' });
        }
        break;
      default:
        break;
    }
  };
  return (
    <div className={styles.buttonsRow}>
      {buttons?.map((btn, i) => (
        <div key={`${btn.type}-${i}`} className={styles.button} onClick={(event) => handleClick(event, btn.type)}>
          <div className={styles.buttonContent}>
            {btn.icon}
            <span className={styles.buttonText}>{btn.text}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ButtonsRow;