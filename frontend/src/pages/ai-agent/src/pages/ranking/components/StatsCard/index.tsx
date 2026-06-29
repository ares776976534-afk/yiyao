import React, { useState, useEffect, useRef } from 'react';
import styles from './index.module.css';
import { DownArrowIcon } from '@/components/Icon';
import { checkAuthAndLogin } from '@/utils/login';
import ProductModal from '../ProductModal';
import { Tooltip } from 'antd';
import log from '@/utils/log';
import { LOG_KEYS } from '@/utils/logConfig';
import { $t } from "@/i18n";

interface StatsCardProps {
  stats: any[];
  index?: number;
  isIcon?: boolean;
  gap?: number;
  modalData?: {
    list: any[];
    imageList: string[];
    platform: string;
    title: string;
  };
  country?: string;
  width?: string;
  userInfo: any;
  queryUserInfo: () => void;
  rankingName?: string;
  rankingType?: string;
}

const backgroundMap = {
  0: '#FFF7E7',
  1: '#F5F6FD',
  2: '#FFF6F3',
} 

const StatsCard: React.FC<StatsCardProps> = ({ stats, index, isIcon = true, gap = 20, modalData, country, width, userInfo, queryUserInfo, rankingName, rankingType }) => {
  const backgroundColor = index !== undefined && index < 3 ? backgroundMap[index] : '#F7F7FA';
  const [open, setOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const loginExpRef = useRef(false);
  useEffect(() => {
    if (!userInfo?.loginId && isHovered && !loginExpRef.current) {
      loginExpRef.current = true;
      log.record(LOG_KEYS.RANKINGLIST.LOGIN, 'EXP');
    }
  }, [userInfo, isHovered]);

  const handleLogin = () => {
    log.record(LOG_KEYS.RANKINGLIST.LOGIN, 'CLK');
    checkAuthAndLogin({
      onSuccess: () => {
        window.location.reload();
      },
    }).then((result) => {
      if (result) {
        queryUserInfo();
      }
    });
  };
  return (
    <div>
      <div 
        className={styles.statsCard} 
        style={{ backgroundColor, position: 'relative', cursor: userInfo?.loginId && isIcon ? 'pointer' : 'default' }} 
        onClick={() => (userInfo?.loginId && isIcon) && setOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={styles.statsRow} style={{ gap: gap }}>
          {stats.map((stat, i) => (
              <div className={styles.statItem} style={{ width: width }}>
                <span className={styles.statLabel}>{stat.label}</span>
                <Tooltip key={i} placement="top" title={userInfo?.loginId ? stat.value : undefined}>
                  <span className={styles.statValue} style={{ maxWidth: width }}>{userInfo?.loginId ? stat.value : '***'}</span>
                </Tooltip>
              </div>
          ))}
        </div>
        {isIcon && <DownArrowIcon style={{ transform: 'rotate(270deg)' }} fill="#BBBDCA" />}
        {!userInfo?.loginId && isHovered && (
          <div className={styles.loginMask}>
            <div className={styles.loginMaskBtn} onClick={handleLogin}>{$t('global-1688-ai-app.ranking.components.StatsCard.login', '登录查看完整内容')}</div>
          </div>
        )}
      </div>
      <ProductModal isModalOpen={open} onCancel={() => setOpen(false)} data={modalData} country={country} rankingName={rankingName} rankingType={rankingType} />
    </div>
  );
};

export default StatsCard;