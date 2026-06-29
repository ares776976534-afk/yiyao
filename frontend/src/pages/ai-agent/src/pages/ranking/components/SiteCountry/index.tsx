import styles from './index.module.css';
import { Popover } from 'antd';
import { useState, useMemo, useEffect, useRef } from 'react';
import type { platformCountryMappingProps } from '../../interface';
import log from '@/utils/log';
import { LOG_KEYS } from '@/utils/logConfig';
import { $t } from "@/i18n";

interface SiteCountryProps {
  platformCountryMapping: platformCountryMappingProps[];
  onChange?: (platform: string, country: string) => void;
}

const SiteCountry: React.FC<SiteCountryProps> = ({ platformCountryMapping, onChange }) => {
  const prevMappingRef = useRef<platformCountryMappingProps[]>([]);
  const channelExpRef = useRef(false);
  
  const [selectedPlatform, setSelectedPlatform] = useState(platformCountryMapping?.[0]?.platform || '');
  const [selectedCountry, setSelectedCountry] = useState(platformCountryMapping?.[0]?.countryList?.[0]?.code || '');

  // 当 platformCountryMapping 变化时更新默认值并通知
  useEffect(() => {
    if (platformCountryMapping?.length > 0) {
      const defaultPlatform = platformCountryMapping[0]?.platform || '';
      const defaultCountry = platformCountryMapping[0]?.countryList?.[0]?.code || '';
      
      // 比较数组引用，切换 tab 时会传入新的数组
      const hasChanged = prevMappingRef.current !== platformCountryMapping;
      
      if (hasChanged) {
        setSelectedPlatform(defaultPlatform);
        setSelectedCountry(defaultCountry);
        prevMappingRef.current = platformCountryMapping;
        
        // 通知父组件
        if (defaultPlatform && defaultCountry) {
          onChange?.(defaultPlatform, defaultCountry);
        }
      }
    }
  }, [platformCountryMapping, onChange]);

  const currentPlatform = useMemo(() => 
    platformCountryMapping?.find(p => p.platform === selectedPlatform),
    [platformCountryMapping, selectedPlatform]
  );

  const currentCountry = useMemo(() => 
    currentPlatform?.countryList?.find(c => c.code === selectedCountry),
    [currentPlatform, selectedCountry]
  );

  const handlePlatformChange = (platformId: string) => {
    setSelectedPlatform(platformId);
    const platform = platformCountryMapping?.find(p => p.platform === platformId);
    let newCountry = selectedCountry;
    if (platform?.countryList && !platform.countryList.some(c => c.code === selectedCountry)) {
      newCountry = platform.countryList[0]?.code || '';
      setSelectedCountry(newCountry);
    }
    if (platformId && newCountry) {
      onChange?.(platformId, newCountry);
    }
  };

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    if (selectedPlatform && countryCode) {
      onChange?.(selectedPlatform, countryCode);
    }
  };

  const content = (
    <div className={styles.content}>
      <div className={styles.leftPanel}>
        {platformCountryMapping?.map((item, index) => (
          <div
            key={item.platform}
            className={`${styles.activeCountry} ${selectedPlatform === item.platform ? styles.selected : ''}`}
            style={{
              borderTopLeftRadius: index === 0 ? 16 : 0,
              borderBottomLeftRadius: index === platformCountryMapping.length - 1 ? 16 : 0
            }}
            onClick={() => handlePlatformChange(item.platform)}
          >
            <div className={styles.tabContent}>
              <span className={styles.tabText}>{item.platformCn}</span>
              {selectedPlatform === item.platform && <div className={styles.activeIndicator} />}
            </div>
          </div>
        ))}
      </div>
      <div className={styles.rightPanel}>
        {currentPlatform?.countryList?.map(country => (
          <div
            key={country.code}
            className={`${styles.inactiveCountry} ${selectedCountry === country.code ? styles.countrySelected : ''}`}
            onClick={() => handleCountryChange(country.code)}
          >
            {country.name}
          </div>
        ))}
      </div>
    </div>
  );

  useEffect(() => {
    if (!channelExpRef.current && platformCountryMapping?.length > 0) {
      channelExpRef.current = true;
      log.record(LOG_KEYS.RANKINGLIST.SIDEBAR.CHANNEL, 'EXP');
    }
  }, [platformCountryMapping]);

  if (!platformCountryMapping || platformCountryMapping.length === 0) {
    return null;
  }

  return (
    <div className={styles.siteContainer}>
      <div className={styles.title}>{$t('global-1688-ai-app.ranking.SiteCountry.title', '站点国家')}</div>
      <Popover
        placement='right'
        content={content}
        overlayClassName={styles.popoverRoot}
        arrow={false}
        align={{ offset: [12, 0] }}
      >
        <div className={styles.siteRow}>
          <div className={styles.siteItem}>
            {currentPlatform?.platformCn} {currentCountry?.name}
          </div>
        </div>
      </Popover>
    </div>
  );
};

export default SiteCountry;