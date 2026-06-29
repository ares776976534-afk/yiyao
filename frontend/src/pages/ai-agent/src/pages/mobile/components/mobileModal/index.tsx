import { Modal } from 'antd';
import { Tabs } from 'antd';
import styles from './index.module.scss';
import { MobileLogoIcon } from '@/components/Icon';
import Account from '@/components/AgentLayout/components/Account';
import Concat from './concat';
import Settings from './settings';

const items = [
  {
    key: 'account',
    label: '账户',
    children: <Account />,
  },
  // {
  //   key: 'settings',
  //   label: '设置',
  //   children: <Settings />,
  // },
  {
    key: 'contact',
    label: '联系我们',
    children: <Concat />,
  },
];
const MobileModal = ({ selected = 'account', isModalOpen, handleCancel }: { selected: string; isModalOpen: boolean; handleCancel: () => void }) => {
  return (
    <Modal
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null}
      className={styles.mobileModal}
      destroyOnHidden
      title={
        <div>
          <MobileLogoIcon width="72.16px" height="20px" />
        </div>
      }
    >
      <Tabs defaultActiveKey={selected} items={items} tabBarGutter={24} />
    </Modal>
  );
};

export default MobileModal;