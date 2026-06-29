import { ActionSheet } from 'antd-mobile';
import styles from './index.module.scss';
import type { Action } from 'antd-mobile/es/components/action-sheet';

interface MobileActionSheetProps {
  visible: boolean;
  onClose: () => void;
  languageOptions: any[];
  onSelect: (option: any) => void;
}
const MobileSettings = ({
    visible,
    onClose,
    languageOptions,
    onSelect
}: MobileActionSheetProps) => {

  const actions: Action[] = languageOptions.map(option => ({
    text: option.label,
    key: option.value,
    onClick: () => {
      onSelect && onSelect(option);
      onClose && onClose()
    }
  }));
  return (
    <ActionSheet
      visible={visible}
      actions={actions}
      cancelText='取消'
      onClose={onClose}
      className={styles.settingsActionSheet}
    />
  );
};

export default MobileSettings;