import styles from './modeSwitch.module.scss';
import { BigImageIcon, ListModeIcon } from '@/components/Icon';
import { $t } from "@/i18n";

export type TypeViewMode = 'big' | 'list';

interface ModeSwitchProps {
  mode: TypeViewMode;
  onModeChange: (mode: TypeViewMode) => void;
}

const ModeSwitch = ({ mode, onModeChange }: ModeSwitchProps) => {
  return (
    <div className={styles.modeSwitch}>
      <div className={styles.modeSwitchTitle}>
        {$t("global-1688-ai-app.select-product.general-agent.ModeSwitch.title", "选品推荐")}
      </div>
      <div className={styles.modeSwitchRight}>
        <div
          className={`${styles.btn} ${mode === 'big' ? styles.btnActive : ''}`}
          onClick={() => {
            onModeChange('big');
          }}
        >
          <BigImageIcon />
          {$t("global-1688-ai-app.select-product.general-agent.ModeSwitch.bigImageMode", "大图模式")}
        </div>
        <div
          className={`${styles.btn} ${mode === 'list' ? styles.btnActive : ''}`}
          onClick={() => {
            onModeChange('list');
          }}
        >
          <ListModeIcon />
          {$t("global-1688-ai-app.select-product.general-agent.ModeSwitch.listMode", "列表模式")}
        </div>
      </div>
    </div>
  );
};

export default ModeSwitch;
