import { DownArrowIcon } from "@/components/Icon";
import LanguageSettings from "@/components/ChatFlow/LanguageSettings";
import styles from './index.module.css';
import { useState, useEffect } from 'react';
import jumpTo from '@/utils/jumpTo';
import { $t } from "@/i18n";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''}`}>
      <div className={styles.headerLeft} onClick={() => {
        jumpTo(`?type=selectProduct`);
      }}>
        <div className={styles.headerLeftIcon}>
          <DownArrowIcon style={{ transform: 'rotate(90deg)' }} fill='#fff' width={20} height={20} />
        </div>
        <div>{$t('global-1688-ai-app.ChatContent.header.returnHome', '返回首页')}</div>
      </div>
      <LanguageSettings />
    </div>
  )
}

export default Header;