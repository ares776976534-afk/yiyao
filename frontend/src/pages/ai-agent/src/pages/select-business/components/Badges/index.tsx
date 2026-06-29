import React from 'react';
import { EnumTagStyle } from '../../enum';
import { SuperFactoryIcon, CattleIcon } from '@/components/Icon';
import styles from './index.module.scss';

function Badges({ tagStyle, tagName }: { tagStyle: EnumTagStyle | string; tagName: string }) {
  switch (tagStyle) {
    case EnumTagStyle.SUPER_FACTORY:
      return (
        <span className={styles.superfactoryBadge}>
          <span className={styles.superfactoryIcon}>
            <SuperFactoryIcon />
          </span>
          <span className={styles.text}>{tagName || ''}</span>
        </span>
      );
    case EnumTagStyle.POWER_FACTORY:
      return (
        <span className={styles.powerfactoryBadge}>
          <span className={styles.powerfactoryIcon}>
            <CattleIcon />
          </span>
          <span className={styles.text}>{tagName || ''}</span>
        </span>
      );
    case EnumTagStyle.SOURCE_FACTORY:
      return <span className={styles.sourcefactoryTag}>{tagName || ''}</span>;
    case EnumTagStyle.GENERAL:
    default:
      return <span className={styles.factoryTag}>{tagName || ''}</span>;
  }
}

export default Badges;
