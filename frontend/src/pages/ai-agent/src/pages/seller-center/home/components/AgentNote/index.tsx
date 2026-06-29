import React, { useState, useMemo, useEffect } from 'react';
import styles from './index.module.css';
import { NewNoteIcon, FindSellerIcon, MaterialIcon, InquiryIcon, ConsultIcon } from '@/components/Icon';
import { Button } from 'antd';
import { useNavigateWithScroll } from "@/hooks/useNavigateWithScroll";
import { $t } from '@/i18n';
import { appVersionType, AppVersionType } from '@/utils/env';

const isGlobal = appVersionType === AppVersionType.GLOBAL;

let timer = null;

const TABS_DATA = [
  {
    key: '1',
    label: $t("global-1688-ai-app.seller-center.home.AgentNote.xp", "选品"),
    titleCN: $t("global-1688-ai-app.seller-center.home.AgentNote.xp", "选品"),
    desc: $t("global-1688-ai-app.seller-center.home.AgentNote.sqquDzejepch", "深入了解全球电子商务趋势，利用多平台数据和专家产品选择经验，发现新产品、产品改进和市场转型的机会。"),
    IconComponent: NewNoteIcon,
    background: 'url(https://img.alicdn.com/imgextra/i2/O1CN01AftE1l1poSdG6hTyP_!!6000000005407-2-tps-2277-735.png)',
    image: isGlobal ? 'https://img.alicdn.com/imgextra/i3/O1CN01oDowFA1IAixPY01yJ_!!6000000000853-2-tps-915-617.png' : 'https://img.alicdn.com/imgextra/i1/O1CN01QifN2A1s01rvYkTmg_!!6000000005703-2-tps-2858-2010.png',
    imageWidth: '671.4px',
    imageHeight: '452.7px',
    path: '/insight',
  },
  {
    key: '2',
    label: $t("global-1688-ai-app.seller-center.home.AgentNote.zs", "找商"),
    titleCN: $t("global-1688-ai-app.seller-center.home.AgentNote.xyzs", "寻源找商"),
    desc: $t("global-1688-ai-app.seller-center.home.AgentNote.rdczq8", "人工智能驱动的全球市场洞察，帮你找最符合需求的1688供应商"),
    IconComponent: FindSellerIcon,
    background: 'url(https://img.alicdn.com/imgextra/i2/O1CN01qUBZ6y1iNFnHYAGPD_!!6000000004400-2-tps-2280-735.png)',
    image: isGlobal ? 'https://img.alicdn.com/imgextra/i4/O1CN01XjLbDh1x9FvzWFoT9_!!6000000006400-2-tps-1109-807.png' : 'https://img.alicdn.com/imgextra/i2/O1CN01384YcX1vb4kdSCvXI_!!6000000006190-2-tps-2952-2092.png',
    imageWidth: '671.4px',
    imageHeight: '522.7px',
    path: '/sourcing',
  },
  {
    key: '3',
    label: $t("global-1688-ai-app.seller-center.home.AgentNote.sc", "素材"),
    titleCN: $t("global-1688-ai-app.seller-center.home.AgentNote.sc", "素材"),
    desc: $t("global-1688-ai-app.seller-center.home.AgentNote.zsItosh3hcpMcjjs", "专为跨境电商设计的AI设计工作台，支持一站式设计、生成和上架。集成30多种AI生成工具，支持多套产品素材的集中管理，以及批量设计操作。"),
    IconComponent: MaterialIcon,
    background: 'url(https://img.alicdn.com/imgextra/i3/O1CN01agp3iE1OpNnsP0hPX_!!6000000001754-2-tps-2280-735.png)',
    image: isGlobal ? 'https://img.alicdn.com/imgextra/i2/O1CN01Ne6b7F1t6jHnOL6EG_!!6000000005853-2-tps-886-591.png' : 'https://img.alicdn.com/imgextra/i1/O1CN01Q5RyAo1ZLZnnrbTTT_!!6000000003178-2-tps-2772-1832.png',
    imageWidth: '671.4px',
    imageHeight: '469.7px',
    path: '/design',
  },
  {
    key: '4',
    label: $t("global-1688-ai-app.seller-center.home.AgentNote.xp.2", "询盘"),
    titleCN: $t("global-1688-ai-app.seller-center.home.AgentNote.xp.3", "询盘"),
    desc: $t("global-1688-ai-app.seller-center.home.AgentNote.yumtshgodf", "一键发起批量询价，模拟人际沟通，智能分析生成多维对比报告，并推荐最佳采购方案。"),
    IconComponent: InquiryIcon,
    background: 'url(https://img.alicdn.com/imgextra/i3/O1CN012r7qIV1tXke52aHqg_!!6000000005912-2-tps-2280-735.png)',
    image: isGlobal ? 'https://img.alicdn.com/imgextra/i1/O1CN01bccUda1oj8Q2catzS_!!6000000005260-2-tps-891-674.png' : 'https://img.alicdn.com/imgextra/i2/O1CN01gJBm871fZDI10VG3E_!!6000000004020-2-tps-2842-2104.png',
    imageWidth: '671.4px',
    imageHeight: '476.7px',
    path: '/inquiry',
  },
  {
    key: '5',
    label: $t("global-1688-ai-app.seller-center.home.AgentNote.consultation", "咨询"),
    titleCN: $t("global-1688-ai-app.seller-center.home.AgentNote.consultation", "咨询"),
    desc: $t("global-1688-ai-app.seller-center.home.AgentNote.ydkwtldzijhClo", "由代理驱动的助手，可从跨境电子商务知识库中提供实时答案和可操作的指导，高效解决商家的咨询"),
    IconComponent: ConsultIcon,
    background: 'url(https://img.alicdn.com/imgextra/i3/O1CN01zAAu2h25rhHbNzHvF_!!6000000007580-2-tps-2280-735.png)',
    image: isGlobal ? 'https://img.alicdn.com/imgextra/i2/O1CN01HdJlcm1JDlCMTnc6O_!!6000000000995-2-tps-897-685.png' : 'https://img.alicdn.com/imgextra/i1/O1CN01CDmKqJ1IjX3CANAar_!!6000000000929-2-tps-2826-2229.png',
    imageWidth: '671.4px',
    imageHeight: '508.7px',
    path: '/chat',
  },
] as const;

export default () => {
  const [activeKey, setActiveKey] = useState('1');
  const navigate = useNavigateWithScroll();
  const style = isGlobal ? { fontFamily: 'Poppins' } : {};
  const tabs = useMemo(() => {
    return TABS_DATA.map(tab => ({
      ...tab,
      icon: <tab.IconComponent />,
    }));
  }, []);

  const activeTab = useMemo(() => {
    return tabs.find(tab => tab.key === activeKey) || tabs[0];
  }, [activeKey, tabs]);

  const autoSetActiveKey = () => {
    timer = setTimeout(() => {
      const nextTabIndex = tabs.findIndex(tab => tab.key === activeKey) + 1;
      if (tabs[nextTabIndex]?.key) {
        setActiveKey(`${tabs[nextTabIndex]?.key}`);
      } else {
        setActiveKey(`${tabs[0]?.key}`);
      }
    }, 5000);
  };

  useEffect(() => {
    autoSetActiveKey();
    return () => clearTimeout(timer as any);
  }, [activeKey]);

  return (
    <div className="flex justify-center overflow-x-hidden w-full h-full">
      <div className="flex flex-col items-center w-[1200px] h-[100vh]">

        <p className="text-[34px] text-[#1D1E29] font-['FZLTHProS'] h-[49px] mt-[120px]" style={style}>{$t("global-1688-ai-app.seller-center.home.AgentNote.hxfunction", "核心功能")}</p>

        <div className={styles.tabContainer}>
          {tabs.map((tab, index) => (
            <React.Fragment key={tab.key}>
              {index === 0 && <div className={styles.longline} />}

              {index > 0 && index < tabs.length && <div className={styles.line} />}

              <div
                className={`${styles.tabTitle} ${activeKey === tab.key ? styles.activeTabTitle : ''}`}
                onClick={() => setActiveKey(tab.key)}
              >
                {tab.icon && <span className={styles.iconWrapper}>{tab.icon}</span>}
                <span className={styles.tabLabel}>{tab.label}</span>
              </div>

              {index === tabs.length - 1 && <div className={styles.longline} />}

            </React.Fragment>
          ))}
        </div>

        <div className={styles.contentWrapper}>
          {tabs.map((tab) => {
            const { IconComponent, key, image, titleCN, desc, path, imageWidth, imageHeight } = tab;
            return (
              <div
                key={key}
                className={`${styles.content} ${activeKey === key ? styles.active : styles.hidden}`}
              >
                <img
                  className={styles.contentImage}
                  src={image}
                  alt={titleCN}
                  style={{
                    width: imageWidth,
                    height: imageHeight,
                  }}
                />

                <div className={styles.titleContainer}>
                  <div>

                    <p className="flex items-center">
                      <span className={styles.titleCN} style={{ ...style, marginRight: isGlobal ? 10 : 4}}>
                        {titleCN}
                      </span>
                      <span className={styles.agentEN} style={style}>Agent</span>
                    </p>

                    <p className={styles.desc} style={style}>
                      {desc}
                    </p>
                  </div>

                  <Button
                    onClick={() => {
                      navigate(path);
                    }}
                    className={styles.btn}
                  >
                    <IconComponent className={styles.btnIcon} style={style}/>{$t("global-1688-ai-app.seller-center.home.AgentNote.iiy", "立即体验")}</Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        key={activeKey}
        style={{
          position: 'absolute',
          background: activeTab.background,
          bottom: 0,
          left: 0,
          right: 0,
          height: '490px',
          zIndex: 1,
          backgroundPosition: 'center center',
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          transition: 'background 0.3s ease-in-out',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};