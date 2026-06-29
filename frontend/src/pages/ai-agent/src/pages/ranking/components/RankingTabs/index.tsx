import styles from './index.module.css';
import { RankingQuestionMarkIcon } from "@/components/Icon";
import { Tooltip } from 'antd';

interface RankingTabsProps {
  tabs: {
    key: string;
    label: string;
    tip: string;
    disabled?: boolean;
  }[];
  activeKey: string;
  handleClick: (key: string) => void;
}
const RankingTabs = ({tabs, activeKey, handleClick}: RankingTabsProps) => {
  return (
    <div className={styles.container}>
      {tabs?.map(tab => (
        <div
          key={tab.key}
          className={`${activeKey === tab.key ? styles.activeTab : styles.normalTab}`}
          onClick={() => handleClick(tab.key)}
        >
          <span className={`${activeKey === tab.key ? styles.activeText : styles.normalText}`}>
            {tab.label}
          </span>
          <Tooltip placement="top" title={tab.tip}>
            <RankingQuestionMarkIcon fill={activeKey === tab.key ? undefined : '#BBBDCA'} />
          </Tooltip>
        </div>
      ))}
    </div>
  )
}

export default RankingTabs;