import React, { useState } from 'react';
import styles from './mobileMenu.module.scss';
import { Dropdown } from 'antd-mobile';
import MoreMenu from '@/components/Icon/MoreMenu';
import ArrowRight from '@/components/Icon/ArrowRight';
import { Modal } from 'antd';
import ContactService from '@/pages/seller-center/home/api-list/components/APIPackage/ContactService';

import './mobileMenuAntd.css';
import { $t } from '@/i18n';

export default function MobileMenu() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <>
      <Dropdown arrowIcon={null} getContainer={document.getElementById('layout-navigation')}>
        <Dropdown.Item
          key="mobileMenu"
          title={<span className={styles.moreMenuIcon}><MoreMenu /></span>}
          highlight={false}
        >
          <div className={styles.mobileMenuTrigger}>
            {/* <div className={styles.mobileMenuTriggerItem}>
              <span className={`${styles.mobileMenuTriggerItemText} ${styles.mobileMenuTriggerItemTextColor}`}>
                加入试用名单
              </span>
              <span className={styles.mobileMenuTriggerItemArrow}>
                <ArrowRight />
              </span>
            </div> */}
            <div
              className={styles.mobileMenuTriggerItem}
              onClick={() => {
                window.open('https://alidocs.dingtalk.com/i/nodes/KGZLxjv9VGkoG9YwH0Py1kezV6EDybno?corpId=dingd8e1123006514592&utm_medium=im_card&iframeQuery=utm_medium%3Dim_card%26utm_source%3Dim&utm_scene=team_space&utm_source=im',
                  '_blank');
              }}
            >
              <span className={styles.mobileMenuTriggerItemText}>{$t("global-1688-ai-app.seller-center.home.Navigation.mobileMenu.document", "文档")}</span>
              <span className={styles.mobileMenuTriggerItemArrow}>
                <ArrowRight />
              </span>
            </div>

            <div className={styles.mobileMenuTriggerItem} onClick={() => setIsModalOpen(true)}>
              <span className={styles.mobileMenuTriggerItemText}>{$t("global-1688-ai-app.seller-center.home.Navigation.mobileMenu.contactwm", "联系我们")}</span>
              <span className={styles.mobileMenuTriggerItemArrow}>
                <ArrowRight />
              </span>
            </div>

          </div>
        </Dropdown.Item>
      </Dropdown >
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={false}
        closable={false}
        title={null}
        centered
        styles={{
          content: {
            background: 'transparent',
            boxShadow: 'none',
          },
        }}
      >
        <ContactService onClose={() => setIsModalOpen(false)} />
      </Modal>
    </>
  );
}