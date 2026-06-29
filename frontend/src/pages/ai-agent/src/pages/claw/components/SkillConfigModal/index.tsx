import React, { useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Modal } from 'antd';
import enableSkill from '@/services/claw/enableSkill';
import { clawSkillListStore } from '../stores/clawSkillListStore';
import type { TypeSkillConfigModalProps, TypeSkillConfigMenuItem, TypeSkillConfigCard } from './types';
import styles from './index.module.scss';

const SIDEBAR_ICON_URL = 'https://img.alicdn.com/imgextra/i1/6000000000393/O1CN01FtSqLs1Em2mPP5A5I_!!6000000000393-2-gg_dtc.png';
const ARROW_ICON_URL = 'https://img.alicdn.com/imgextra/i3/6000000005491/O1CN01E6gch31qQvvIfzwgo_!!6000000005491-2-gg_dtc.png';

const DEFAULT_MENU_ITEMS: TypeSkillConfigMenuItem[] = [
  { id: '铺货', label: '铺货' },
  { id: '选品', label: '选品' },
  { id: '询盘', label: '询盘' },
  { id: '素材', label: '素材' },
];

const SkillConfigModal = observer(({ open, onClose }: TypeSkillConfigModalProps) => {
  const [menuItems] = useState<TypeSkillConfigMenuItem[]>(DEFAULT_MENU_ITEMS);
  const [activeMenu, setActiveMenu] = useState<string>(DEFAULT_MENU_ITEMS[0].id);
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

  const cards: TypeSkillConfigCard[] = clawSkillListStore.skills;

  const handleSetActiveMenu = (menuId: string) => {
    setActiveMenu(menuId);
  };

  const toggleCardEnabled = useCallback((skillId: string, enabled: boolean) => {
    setTogglingIds((prev) => new Set(prev).add(skillId));

    enableSkill(skillId, enabled)
      .then((success) => {
        if (success) {
          clawSkillListStore.patchSkillEnabled(skillId, enabled);
        }
      })
      .finally(() => {
        setTogglingIds((prev) => {
          const next = new Set(prev);
          next.delete(skillId);
          return next;
        });
      });
  }, []);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      centered
      destroyOnHidden
      className={styles.modalWrap}
      styles={{ content: { padding: 0 } }}
    >
      <div className={styles.container}>
        <div className={styles.sidebar} style={{ display: 'none' }}>
          <div className={styles.sidebarHeaderWrapper}>
            <div className={styles.sidebarHeader}>
              <img className={styles.sidebarIcon} src={SIDEBAR_ICON_URL} alt="" />
              <span className={styles.sidebarTitle}>技能配置</span>
            </div>
          </div>
          <div className={styles.menuList}>
            {menuItems.map((item) => {
              const isActive = item.id === activeMenu;

              return (
                <div
                  key={item.id}
                  className={isActive ? styles.menuItemActive : styles.menuItem}
                  onClick={() => handleSetActiveMenu(item.id)}
                >
                  <span className={isActive ? styles.menuItemTextActive : styles.menuItemText}>{item.label}</span>
                </div>
              );
            })}
          </div>
          <div className={styles.sidebarFooterWrapper}>
            <button type="button" className={styles.sidebarFooterBtn}>
              <span>前往Skill社区</span>
              <img className={styles.sidebarFooterIcon} src={ARROW_ICON_URL} alt="" />
            </button>
          </div>
        </div>

        <div className={styles.mainContent}>
          <div className={styles.contentHeader}>
            <span className={styles.contentTitle}>技能配置</span>
          </div>
          <div className={styles.scrollArea}>
            {cards.map((card) => {
              const isToggling = togglingIds.has(card.skillId);
              const switchCls = [
                card.enabled ? styles.switchOn : styles.switchOff,
                isToggling ? styles.switchToggling : '',
              ].filter(Boolean).join(' ');
              return (
                <div key={card.skillId} className={`${styles.card} ${card.enabled ? '' : styles.cardDisabled}`}>
                  <div className={styles.cardTop}>
                    <div className={styles.cardTitleRow}>
                      <div className={styles.cardTitleLeft}>
                        <span className={styles.cardName}>{card.skillName}</span>
                        {card.isOfficial && (
                          <div className={styles.officialTag}>
                            <span className={styles.officialTagText}>官方</span>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        className={switchCls}
                        onClick={() => !isToggling && toggleCardEnabled(card.skillId, !card.enabled)}
                        aria-label={card.enabled ? '关闭技能' : '开启技能'}
                        aria-checked={card.enabled}
                        disabled={isToggling}
                      >
                        {isToggling ? <div className={styles.switchSpinner} /> : <div className={styles.switchKnob} />}
                      </button>
                    </div>
                    <span className={styles.cardDesc}>{card.description}</span>
                  </div>

                  {
                    (card.tags?.length ?? 0) > 0 && (
                      <div className={styles.cardTags}>
                        {card.tags?.map((tag) => (
                          <div key={tag} className={styles.tag}>
                            <span className={styles.tagText}>{tag}</span>
                          </div>
                        ))}
                      </div>
                    )
                  }
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
});

export default SkillConfigModal;
