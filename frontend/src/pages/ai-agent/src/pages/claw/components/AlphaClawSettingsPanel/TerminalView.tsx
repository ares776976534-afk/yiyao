import React from 'react';
import styles from './index.module.scss';

const ICON_BACK = 'https://img.alicdn.com/imgextra/i1/6000000003559/O1CN01PF8Qhz1cA4iztC8Da_!!6000000003559-2-gg_dtc.png';
const ICON_TERMINAL_TAB = 'https://img.alicdn.com/imgextra/i1/6000000006929/O1CN01v5cYGM213XSycDAe6_!!6000000006929-2-gg_dtc.png';

export interface TypeTerminalViewProps {
  /** 终端页面 URL，有则用 iframe 嵌入，无则显示占位 */
  terminalUrl: string | null;
  onBack: () => void;
}

const TerminalView: React.FC<TypeTerminalViewProps> = ({ terminalUrl, onBack }) => (
  <div className={styles.terminalViewWrap}>
    <div
      className={styles.terminalViewHeader}
      role="button"
      tabIndex={0}
      onClick={onBack}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onBack()}
    >
      <img className={styles.terminalViewBackIcon} src={ICON_BACK} alt="返回" />
      <span className={styles.terminalViewTitle}>终端</span>
    </div>
    <div className={styles.terminalViewBox}>
      <div className={styles.terminalViewTabBar}>
        <img className={styles.terminalViewTabIcon} src={ICON_TERMINAL_TAB} alt="" />
        <span className={styles.terminalViewTabPath}>～</span>
      </div>
      <div className={styles.terminalViewContent}>
        {terminalUrl ? (
          <iframe
            className={styles.terminalViewIframe}
            src={terminalUrl}
            title="终端"
          />
        ) : (
          <span className={styles.terminalViewPlaceholder}>
            复用一下开源的代码行样式
          </span>
        )}
      </div>
    </div>
  </div>
);

export default TerminalView;
