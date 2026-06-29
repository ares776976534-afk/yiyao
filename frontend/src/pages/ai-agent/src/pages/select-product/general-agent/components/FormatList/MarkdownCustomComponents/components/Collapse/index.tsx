import React from "react";
import { Collapse } from "antd";
import CollapseArrow from "../../Icon/CollapseArrow";

import styles from './index.module.css';
import { $t } from '@/i18n';

export const CollapseExpandIcon = ({ isActive }) => {
  return (
    <span className={`${styles.expendAction} ${isActive ? styles.expendActionActive : ''}`}>
      {isActive ? $t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.Collapse.sqdetails", "收起详情") : $t("global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.Collapse.zkdetails", "展开详情")}
      <CollapseArrow className={styles.expendActionIcon} />
    </span>
  )
}

export const CollapseTitle = ({ title, subTitle }) => {
  return (
    <div className={styles.collapseTitle}>
      <div className={styles.collapseTitleName}>{title}</div>
      <div className={styles.collapseTitleSubTitle}>{subTitle}</div>
    </div>
  )
}

export const CollapseContent = ({ children }) => {
  return (
    <div className={styles.collapseContentContainer}>
      {children}
    </div>
  )
}

export default ({ items, ...props }) => {
  return (
    <Collapse
      defaultActiveKey={items.length > 0 ? 0 : ''}
      className={styles.collapseContainer}
      expandIcon={CollapseExpandIcon}
      items={items.map((item, index) => ({
        ...item,
        key: index,
        label: <CollapseTitle title={item.title} subTitle={item.subTitle} />,
        children: <CollapseContent>{item.content}</CollapseContent>,
        classNames: {
          header: styles.collapseHeader,
          body: styles.collapseContent,
        }
      }))}
      expandIconPosition="end"
    />
  );
};