import React, { useState, useMemo, useRef } from 'react';
import { Modal, Menu } from 'antd';
import { observer } from 'mobx-react-lite';
import Basic from './components/Basic';
import Personalized from './components/Personalized';
import Knowledge from './components/Knowledge';
import KnowledgeEditor from './components/Knowledge/KnowledgeEditor';
import { IconBasic, IconPersonalized, IconKnowledgeBase } from './icons';
import { useStore } from '@/stores/context';
import styles from './index.module.scss';
import { $t } from '@/i18n';

interface UserPreferProps {
  visible: boolean;
  onClose: () => void;
}

const UserPrefer = observer(function UserPrefer({
  visible,
  onClose,
}: UserPreferProps) {
  const store = useStore();
  const userPreferStore = store.userPrefer;
  const [activeTab, setActiveTab] = useState<
    'basic' | 'personalized' | 'knowledge' | 'knowledgeEdit'
  >('basic');
  const postDataRef = useRef<any>(null);

  // 处理Modal关闭，进行最终保存
  const handleClose = () => {
    userPreferStore.handleClose();
    onClose();
  };

  const menuItems = useMemo(
    () => [
      {
        key: 'basic',
        icon: <IconBasic />,
        label: $t('global-1688-ai-app.UserPrefer.jcsettings', '基础设置'),
        component: Basic,
      },
      {
        key: 'personalized',
        icon: <IconPersonalized />,
        label: $t('global-1688-ai-app.UserPrefer.gts', '个性化设置'),
        component: Personalized,
      },
      {
        key: "knowledge",
        icon: <IconKnowledgeBase />,
        label: $t("global-1688-ai-app.UserPrefer.knowledgeBase", "知识库设置"),
        component: Knowledge,
        dataset: {
          classNames: {
            content: styles.knowledgeContent,
          },
        },
      },
      {
        key: "knowledgeEdit",
        icon: <IconKnowledgeBase />,
        label: $t("global-1688-ai-app.UserPrefer.knowledgeBase", "添加知识"),
        showInLeftSide: false,
        fullContent: true,
        component: KnowledgeEditor,
      },
    ],
    [],
  );

  const activeItem = useMemo(() => {
    return menuItems.find((item) => item.key === activeTab);
  }, [activeTab, menuItems]);


  const CurrentComponent = activeItem?.component || (() => <div />);

  const containerContext = {
    activeTab,
    setActiveTab(key: string, data?: any) {
      setActiveTab(key as typeof activeTab);
      postDataRef.current = data;
    },
    getPostData: () => postDataRef.current,
  };

  return (
    <Modal
      open={visible}
      title={null}
      footer={null}
      maskClosable={false}
      width={740}
      centered
      className={styles.modal}
      onCancel={handleClose}
    >
      <div className={styles.container}>
        {/* 左侧导航栏 */}
        {
          !activeItem?.fullContent ? (
            <>
              <div key="leftSide" className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                  <div className={styles.sidebarTitle}>
                    {$t('global-1688-ai-app.UserPrefer.settings', '设置')}
                  </div>
                </div>
                <Menu
                  mode="inline"
                  selectedKeys={[activeTab]}
                  items={menuItems.filter((item) => item.showInLeftSide !== false)}
                  onClick={({ key }) => setActiveTab(key as typeof activeTab)}
                  className={styles.menu}
                />
              </div>
              <div key="leftDivider" className={styles.divider} />

              {/* 右侧内容区 */}
              <div className={`${styles.content}${activeItem?.dataset?.classNames?.content ? ` ${activeItem?.dataset?.classNames?.content}` : ''}`}>
                <div className={styles.contentHeader}>{activeItem?.label}</div>

                <div className={styles.contentBody}>
                  <CurrentComponent userPreferStore={userPreferStore} containerContext={containerContext as any} />
                </div>
              </div>
            </>
          ) : (
            <CurrentComponent userPreferStore={userPreferStore} containerContext={containerContext as any} />
          )
        }
      </div>
    </Modal>
  );
});

export default UserPrefer;
