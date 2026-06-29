import { Popup } from 'antd-mobile'
import styles from './index.module.scss';
import { CloseIcon } from '@/components/Icons';

interface Props {
  visible: boolean,
  onMaskClick: () => void,
  children: React.ReactNode,
  title: string,
}

const AgentPopup = ({
  visible,
  onMaskClick,
  children,
  title,
}: Props) => {
  return (
    <Popup
      visible={visible}
      onMaskClick={onMaskClick}
      bodyStyle={{
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px',
        padding: '16px',
        height: '90%',
      }}
    >
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.title}>{title}</div>
          <CloseIcon onClick={onMaskClick} />
        </div>
        {children}
      </div>
    </Popup>
  );
};

export default AgentPopup;