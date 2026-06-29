import React, { useMemo, useRef, useState } from 'react';
import ChatInput from '../../ChatInput';
import showTaskLinkModal from '@/components/TaskLinkModel';
import styles from './index.module.scss';
import ExploreSection from '../../ExploreSection';
import { ActionSheet, Button } from 'antd-mobile';
import { EnumSearchMode } from '@/pages/mobile-agent-home/enum';
import { DownArrowIcon, PlanningIcon } from '@/components/Icon';
import { SearchOfferIcon, SearchProviderIcon } from '@/pages/select-business/components/ModeSelector/icons';
import type { Action, ActionSheetShowHandler } from 'antd-mobile/es/components/action-sheet';
import SelectSellerCard from './components/SelectSellerCard';
import { createLink } from '../index';
import { AgentType } from '../../../enum';
import { $t } from '@/i18n';

export const MODE_CONFIGS: Action[] = [
  {
    key: EnumSearchMode.SMART,
    // icon: 'https://img.alicdn.com/imgextra/i2/6000000001393/O1CN011WpkiM1MA2ooZjgTx_!!6000000001393-2-gg_dtc.png',
    text: $t("global-1688-ai-app.mobile-agent-home.Agents.SelectSeller.znms", "智能模式"),
    description: $t("global-1688-ai-app.mobile-agent-home.Agents.SelectSeller.mxzdppxq", "模型自动匹配需求"),
  },
  {
    key: EnumSearchMode.PRODUCT_TO_SUPPLIER,
    // icon: 'https://img.alicdn.com/imgextra/i2/6000000007113/O1CN016XY2xJ22PoJfxKFds_!!6000000007113-2-gg_dtc.png',
    text: $t("global-1688-ai-app.mobile-agent-home.Agents.SelectSeller.ypzs", "以品找商"),
    description: $t("global-1688-ai-app.mobile-agent-home.Agents.SelectSeller.xdth", "先定商品再推商家"),
  },
  {
    key: EnumSearchMode.DIRECT_SUPPLIER,
    // icon: 'https://img.alicdn.com/imgextra/i2/6000000004608/O1CN01idqRA61juWAgLZrqB_!!6000000004608-2-gg_dtc.png',
    text: $t("global-1688-ai-app.mobile-agent-home.Agents.SelectSeller.zsmerchant", "直搜商家"),
    description: $t("global-1688-ai-app.mobile-agent-home.Agents.SelectSeller.zcImn", "只搜商家信息"),
  },
];

const list = [
  {
    id: "6d4762b6a5",
    title: $t("global-1688-ai-app.mobile-agent-home.Agents.SelectSeller.gxz", "跟卖热销品？找同款最优供应商"),
    image: "https://img.alicdn.com/imgextra/i3/O1CN01yWhw0q1TDR4HoZDf6_!!6000000002348-0-tps-3024-2268.jpg",
    model: EnumSearchMode.SMART,
  },
  {
    id: "b1b29fee02",
    title: $t("global-1688-ai-app.mobile-agent-home.Agents.SelectSeller.tkbtspzzjs", "同款不同色？拍照直接搜！"),
    image: "https://img.alicdn.com/imgextra/i1/O1CN01T3opW827iCIjtRhd5_!!6000000007830-2-tps-3024-2268.png",
    model: EnumSearchMode.SMART,
  },
  {
    id: "004b72d99b",
    title: $t("global-1688-ai-app.mobile-agent-home.Agents.SelectSeller.qyc", "全网无同款？一键找定制厂家"),
    image: "https://img.alicdn.com/imgextra/i2/O1CN01VHHPza1GNt6Ompce7_!!6000000000611-0-tps-3024-2268.jpg",
    model: EnumSearchMode.SMART,
  },
  {
    id: "8d1edae850",
    title: $t("global-1688-ai-app.mobile-agent-home.Agents.SelectSeller.srzj", "支持外贸定制的毛绒玩具工厂"),
    image: "https://img.alicdn.com/imgextra/i1/O1CN01TyoCad22zXDMNK8KX_!!6000000007191-0-tps-3024-2268.jpg",
    model: EnumSearchMode.SMART,
  },
  {
    id: "3531c95646",
    title: $t("global-1688-ai-app.mobile-agent-home.Agents.SelectSeller.xulaGh", "寻南美市场小单友好面护工厂"),
    image: "https://img.alicdn.com/imgextra/i2/O1CN01SNJeBk1OeOIcJfvwH_!!6000000001730-0-tps-3024-2268.jpg",
    model: EnumSearchMode.SMART,
  },
  {
    id: "30cc221f23",
    title: $t("global-1688-ai-app.mobile-agent-home.Agents.SelectSeller.ynt", "眼影出口东南亚，直搜源头工厂"),
    image: "https://img.alicdn.com/imgextra/i4/O1CN011wCI9f1fx1syYPzsV_!!6000000004072-0-tps-3024-2268.jpg",
    model: EnumSearchMode.SMART,
  },
];
const SelectSeller = () => {
  // 当前选中的模式配置
  // const currentMode = useMemo(() => {
  //   return MODE_CONFIGS.find((config) => config.key === value) || MODE_CONFIGS[0];
  // }, [value]);
  const [currentMode, setCurrentMode] = useState<Action>(MODE_CONFIGS[0]);


  const actionSheetRef = useRef<ActionSheetShowHandler>();

  return (
    <div className={styles.selectSeller}>
      <ChatInput
        placeholder={$t("global-1688-ai-app.mobile-agent-home.Agents.SelectSeller.qtdPcrtpmr", "请输入你想要找的1688商品或商家，如：支持外贸定制的毛绒玩具工厂")}
        enableUploadImage={currentMode.key !== EnumSearchMode.DIRECT_SUPPLIER}
        footer={
          <>
            <Button onClick={() => {
              actionSheetRef.current = ActionSheet.show({
                actions: MODE_CONFIGS,
                onAction: (action) => {
                  if (actionSheetRef.current) {
                    actionSheetRef.current.close();
                  }
                  setCurrentMode(action);
                },
                cancelText: $t("global-1688-ai-app.mobile-agent-home.Agents.SelectSeller.cancel", "取消"),
                onClose: () => {
                },
              });
            }}
            >
              <div className={styles.leftIcon}>
                {currentMode.key === EnumSearchMode.SMART && <PlanningIcon width="3.733vw" height="3.733vw" fill="currentColor" />}
                {currentMode.key === EnumSearchMode.PRODUCT_TO_SUPPLIER && <SearchOfferIcon width="3.733vw" height="3.733vw" />}
                {currentMode.key === EnumSearchMode.DIRECT_SUPPLIER && <SearchProviderIcon width="3.733vw" height="3.733vw" />}
              </div>
              <span className={styles.buttonText}>{currentMode.text}</span>
              <span className={styles.rightIcon}>
                <DownArrowIcon width="3.2vw" height="3.2vw" fill="currentColor" />
              </span>
            </Button>
          </>
        }
        onSubmit={(value) => {
          const intention = currentMode.key;
          createLink(AgentType.SELECT_SELLER, {
            ...value,
            intention,
            searchImageUrl: intention === EnumSearchMode.DIRECT_SUPPLIER ? undefined : value?.fileList?.[0]?.imgFileKey,
            query: value?.inputValue,
          }).then(link => {
            const handler = showTaskLinkModal({
              onClose: () => {
                handler.close();
              },
              url: link,
            });
          });
        }}
      />

      <div className={styles.exploreSectionContainer}>
        <ExploreSection title={$t("global-1688-ai-app.mobile-agent-home.Agents.SelectSeller.tsjxal", "探索精选案例")} />
        <div className={styles.selectSellerCardList}>
          {list.map(item => {
            return (
              <SelectSellerCard
                onClick={() => {
                  location.href = `/mobile/sourcing?__share_code__=${item.id}`;
                }}
                key={item.id}
                data={item}
              />
            );
          })}
        </div>
        {/* <ExploreSection title="到底了" /> */}
      </div>
    </div>
  );
};

export default SelectSeller;
