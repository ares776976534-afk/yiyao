import React, { useState } from 'react';
import { useNavigate } from 'ice';
import styles from './index.module.scss';
import { $t } from '@/i18n';
import {
  ArrowLeftIcon,
  SelectProductIcon,
  SelectSellerIcon,
  StudioIcon,
  InquiryIcon,
  TalkIcon,
} from '@/components/Icon';
import Navigation from '../../components/AgentNavigation';
import Agents, { AgentType } from './Agent';
import { commonRecord } from '@/utils/log';
import { appVersionType, AppVersionType } from '@/utils/env';

const isGlobal = appVersionType === AppVersionType.GLOBAL;

const SimpleNote = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/seller-center/home/waiting-list');
  };

  const [activeAgent, setActiveAgent] = useState(AgentType.MATERIAL);
  const style = isGlobal ? { fontFamily: 'Poppins' } : {};
  const navigationItems = [
    {
      id: AgentType.SELECT_PRODUCT,
      icon: <SelectProductIcon />,
      text: $t('global-1688-ai-app.seller-center.home.SimpleNote.xp', '选品'),
    },
    {
      id: AgentType.SELECT_SELLER,
      icon: <SelectSellerIcon />,
      text: $t('global-1688-ai-app.seller-center.home.SimpleNote.zs', '找商'),
    },
    {
      id: AgentType.MATERIAL,
      icon: <StudioIcon />,
      text: $t('global-1688-ai-app.seller-center.home.SimpleNote.sc', '素材'),
    },
    {
      id: AgentType.INQUIRY,
      icon: <InquiryIcon />,
      text: $t('global-1688-ai-app.seller-center.home.SimpleNote.xp.2', '询盘'),
    },
    {
      id: AgentType.COMMON_CHAT,
      icon: <TalkIcon />,
      text: $t(
        'global-1688-ai-app.seller-center.home.SimpleNote.consultation',
        '咨询',
      ),
    },
  ];

  const handleNavigationClick = (id: string) => {
    setActiveAgent(id as AgentType);
    // commonRecord(`${navigationItems.find((item) => item.id === id)?.text}button`);
  };

  const onClick = () => {
    window.open('https://ecombench.ai/', '_blank')
  }

  return (
    <div className="flex justify-center overflow-x-hidden w-full h-screen">
      <div
        className={`flex flex-col items-center h-full w-[1200px] ${styles.contentWrapper}`}
      >
        {/* <div className={styles.btn}>
          <img
            className={styles.btnIcon}
            src="https://img.alicdn.com/imgextra/i1/O1CN01b6mG2l21f5v9ikB35_!!6000000007011-2-tps-47-52.png"
          />
          <span className={styles.btnText}>1</span>
          <div className={styles.btnArrow} />

          <div>
            <p className={styles.btnText2}>Ecom - Bench</p>
            <p className={styles.btnText3}>电商标准测评集</p>
          </div>

          <ArrowLeftIcon
            width={24}
            height={24}
            style={{
              color: 'rgba(83, 99, 245, 1)',
            }}
          />
        </div> */}

        {/* <p className={`mt-[49px] ${styles.titleContainer}`}> */}
        <div className={styles.titleImg}>
          {isGlobal ? (
            <div className={styles.titleGlobal} onClick={onClick}>
              <img className={styles.titleGlobalImg} src="https://img.alicdn.com/imgextra/i1/O1CN01uE6YQF26veKFi6b6u_!!6000000007724-2-tps-699-109.png" alt="" srcSet="" />
              <div className={`${styles.globalpm} ${styles.pm}`} style={style}>1</div>
              <div className={`${styles.titleGlobalPm} ${styles.titlePm}`} style={style}>1</div>
            </div>
          ) : (
            <div className={styles.titleCn} onClick={onClick}>
              <img className={styles.titleCnImg} src="https://img.alicdn.com/imgextra/i1/O1CN01qmh2An20n3C8ZaDtx_!!6000000006893-2-tps-551-109.png" alt="" srcSet="" />
              <div className={`${styles.cnpm} ${styles.pm}`} style={style}>1</div>
              <div className={`${styles.titleCnlPm} ${styles.titlePm}`} style={style}>1</div>
            </div>
          )}
        </div>
        <p className={styles.titleContainer}>
          <span className={styles.btnText4} style={style}>
            {$t('global-1688-ai-app.seller-center.home.SimpleNote.nd', '您的')}
          </span>
          {
            appVersionType === AppVersionType.CN && (
              <>
                <span className={styles.btnText5}>AI</span>
                <span className={styles.btnText4}>
                  {$t(
                    'global-1688-ai-app.seller-center.home.SimpleNote.kjdssy',
                    '电商生意运营',
                  )}
                </span>
              </>
            )
          }
          <span className={styles.btnText6}>
            {
              $t('global-1688-ai-app.seller-center.home.SimpleNote.agent', 'Agent')
            }
          </span>
        </p>

        <p className={styles.btnText7} style={style}>
          {$t(
            'global-1688-ai-app.seller-center.home.SimpleNote.zll',
            '智能节省人力，效率创造利润',
          )}
        </p>

        <div className={styles.content}>
          <Navigation
            items={navigationItems}
            activeId={activeAgent}
            onItemClick={handleNavigationClick}
            className={styles.navigationCustom}
          />

          <div className={styles.agentsContainer}>
            <div key={activeAgent} className={styles.agentsWrapper}>
              <Agents type={activeAgent as AgentType} />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottomBg} />
      <div className={styles.bottomBg2} />
    </div>
  );
};

export default SimpleNote;
