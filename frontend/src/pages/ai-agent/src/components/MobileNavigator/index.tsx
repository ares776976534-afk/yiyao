import React, { useEffect, ReactNode, useState } from 'react';
import { NavBar, SafeArea } from 'antd-mobile';
import classNames from 'classnames';
// import {
//   isWap,
//   isIOS,
//   isAndroid,
// } from '@ali/ctf-universal-env';
import { MobileNavigatorProps } from './type';
import styles from './index.module.scss';
import { ShareIcon } from '../Icons';
import { MobileLogoIcon, ReturnArrowIcon } from '../Icon';


const MobileNavigator = (props: MobileNavigatorProps) => {
  const {
    className,
    style,
    backIcon,
    right,
    moreItems = [],
    onBack,
    hasSafeArea = true,
    children,
    onShareClick,
    sticky,
    ...rest
  } = props;

  const handleBack = () => {
    if (typeof onBack === 'function') {
      onBack?.();
    } else {
      history.back();
    }
  };


  const backArrowNode = backIcon === undefined ? (
    <div className={styles.globalNavigatorBackIcon} >
      <ReturnArrowIcon width="6.4vw" height="6.4vw" fill="currentColor" />
    </div>
  ) : backIcon;

  let customRight: ReactNode | null = null;
  if (moreItems.length) {
    customRight = (<div className={styles.moreItems}>
      {
        moreItems.map((item) => {
          return (
            <div className={styles.moreIconItem} key={item.id}>
              <div
                className={classNames(styles.moreIcon, item.iconClass)}
                onClick={(event) => {
                  if (item.onClick) {
                    item.onClick?.(item, event);
                    return;
                  }
                  if (item.url) {
                    location.href = item.url;
                  }
                }}
              />
            </div>
          );
        })
      }
    </div>);
  } else if (right) {
    customRight = right;
  } else {
    // customRight = right === false ? null : <ShareIcon onClick={onShareClick} size="6.4vw" />;
    customRight = null;
  }

  return (
    <div
      className={classNames(styles.globaNavigator, {
        [styles.sticky]: sticky,
        className,
      })}
      style={style}
    >
      {hasSafeArea && <SafeArea position="top" />}
      <NavBar
        backIcon={backArrowNode}
        onBack={handleBack}
        right={customRight}
        {...rest}
      >
        <div className={styles.globalNavigatorTitle}>
          <div className={styles.globalNavigatorTitleContent}>
            {/* <LogoIcon />
            <span className={styles.globalNavigatorTitleText}>{children || '遨虾'}</span> */}
            <div className={styles.logoWrapper}>
              <MobileLogoIcon width="17.6vw" height="5.333333vw" />
            </div>
          </div>
        </div>
      </NavBar>
    </div>
  );
};

export default MobileNavigator;
