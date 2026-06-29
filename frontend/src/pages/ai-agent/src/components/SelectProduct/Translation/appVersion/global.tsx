import styles from './global.module.css';
import { TranslationIcon } from '@/components/Icon';

export interface TypeTranslationProps {
  onTranslation?: () => void;
}

const Global: React.FC<TypeTranslationProps> = ({ onTranslation }) => {
  return (
    <div className={styles.global} onClick={onTranslation}>
      <TranslationIcon />
      <div className={styles.seeOriginal}>
        See original
      </div>
    </div>
  );
};

export default Global;