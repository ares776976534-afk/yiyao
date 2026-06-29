import React, { useState } from 'react';
import { Dropdown, message } from 'antd';
import styles from './HistoryItem.module.css';
import { HistoryRecord } from './HistoryList';
import httpRequest from '@/services/httpRequest';
import { TrashCanIcon } from '@/components/Icon';
import { $t } from '@/i18n';
import { selApiBaseUrl, serviceBaseUrl } from '@/utils/env';

interface HistoryItemProps {
  item: HistoryRecord;
  isActive?: boolean;
  onClick?: (item: any) => void;
  onDelete?: (sessionId: string) => void;
}

const deleteHistory = async (sessionId: string) => {
  try {
    const res = await httpRequest(`${serviceBaseUrl}/opp/history/delete`, {
      method: 'POST',
      body: JSON.stringify({
        sessionIdList: [sessionId],
      }),
    });
    if (res.success) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

const HistoryItem: React.FC<HistoryItemProps> = ({
  item,
  isActive = false,
  onClick,
  onDelete,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleDeleteClick = async () => {
    const res = await deleteHistory(item.sessionId);
    if (res) {
      onDelete?.(item.sessionId);
      setDropdownOpen(false); // 删除成功后关闭 Dropdown
    } else {
      message.error('删除失败');
      setDropdownOpen(false); // 删除失败也关闭 Dropdown
    }
  };

  const handleRenameClick = () => {
    console.log('rename');
    setDropdownOpen(false);
  };

  const handleItemClick = () => {
    onClick?.(item);
  };

  const handleClick = ({ key, domEvent }) => {
    domEvent.stopPropagation();
    switch (key) {
      case '1':
        handleRenameClick();
        break;
      case '2':
        handleDeleteClick();
        break;
    }
  };

  return (
    <div
      className={`${styles.historyItem} ${isActive ? styles.historyItemActive : ''}`}
      onClick={handleItemClick}
      style={{ cursor: 'pointer' }}
    >
      <span className={`${styles.historyTitle} ${isActive ? styles.historyTitleActive : ''}`}>
        {item.sessionTitle}
      </span>
      <Dropdown
        open={dropdownOpen}
        onOpenChange={setDropdownOpen}
        menu={{
          items: [
            // {
            //   key: '1',
            //   label: '重命名',
            // },
            {
              key: '2',
              label: (
                <div className={styles.deleteItem} onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick();
                }}>
                  <TrashCanIcon color='#F55353' />
                  <div>{$t("global-1688-ai-app.select-product.ChatHistory.HistoryItem.delete", "删除")}</div>
                </div>
              ),
              danger: true,
            },
          ],
        }}
        trigger={['click']}
        overlayClassName={styles.historyItemDropdown}
      >
        <img
          className={styles.moreIcon}
          src="https://img.alicdn.com/imgextra/i2/6000000002797/O1CN01hghho11WX4tYX9v7z_!!6000000002797-2-gg_dtc.png"
          style={{ cursor: 'pointer' }}
          onClick={(e) => e.stopPropagation()}
        />
      </Dropdown>
    </div>
  );
};

export default HistoryItem;
