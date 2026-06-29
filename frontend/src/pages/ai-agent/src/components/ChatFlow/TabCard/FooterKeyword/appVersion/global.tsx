import styles from '../../index.module.css';
import styleGlobal from './global.module.css';
import { $t } from '@/i18n';

interface GlobalProps {
  keywordLevel: string;
  iconList: number[];
  keywordLevelIconCount: { [key: string]: number };
  iconColors: any[];
  keywordLevelColorMap: { [key: string]: string };
  keywordLevelMap: { [key: string]: string };
}

const Global = ({ keywordLevel, iconList, keywordLevelIconCount, iconColors, keywordLevelColorMap, keywordLevelMap }: GlobalProps) => {
  return (
    <div className={styleGlobal.footerKeywordGlobal}>
      <div className={styles.footerKeywordTitle}>{$t("global-1688-ai-app.ChatFlow.TabCard.kri", "关键词评价:")}</div>
      {keywordLevel ? (
        <div className={styles.footerKeywordContent}>
          <div className={styles.iconContent}>
            {iconList.map((iconIndex) => {
              const highlightCount = keywordLevelIconCount[keywordLevel] || 0;
              const isHighlight = iconIndex < highlightCount;
              return (
                <div
                  key={iconIndex}
                  className={styles.footerKeywordContentIcon}
                  style={{
                      background: isHighlight ? iconColors[iconIndex] : 'var(--fill-primary)'
                  }}
                />
              );
            })}
          </div>
          <div className={styles.footerKeywordContentName} style={{ color: keywordLevelColorMap[keywordLevel] }}>{keywordLevelMap[keywordLevel]}</div>
        </div>
      ) : (
        <div className={styles.footerKeywordContentEmpty}>{$t("global-1688-ai-app.ChatFlow.TabCard.bgwfxdjfx", "报告未分析，点击分析")}</div>
      )}
    </div>
  );
};

export default Global;