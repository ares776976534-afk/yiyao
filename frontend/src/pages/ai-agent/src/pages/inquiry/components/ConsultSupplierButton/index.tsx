import React, { useState, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'ice';
import { Button } from 'antd';
import { SupplierLibraryIcon } from '@/components/Icon';
import { useSelectProductStore } from '@/stores/select-product';
import { StatusEnum } from '@/pages/select-product/config';
import styles from './index.module.css';
import { $t } from '@/i18n';

interface TypeConsultSupplierButtonProps {
  onClick?: () => void;
}

const ConsultSupplierButton: React.FC<TypeConsultSupplierButtonProps> = ({ onClick }) => {
  const navigate = useNavigate();
  const selectProductStore = useSelectProductStore();
  const [leftOffset, setLeftOffset] = useState(241); // 默认展开状态宽度
  const observerRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    // 查找侧边栏元素
    const findSider = () => {
      // 尝试多种选择器来找到侧边栏
      const selectors = [
        '.ant-layout-sider',
        '[class*="ant-layout-sider"]',
        '[class*="AgentLayout"][class*="sider"]',
      ];

      for (const selector of selectors) {
        const sider = document.querySelector(selector);
        if (sider) {
          return sider as HTMLElement;
        }
      }
      return null;
    };

    const updatePosition = () => {
      const sider = findSider();
      if (sider) {
        const width = sider.offsetWidth;
        // 按钮距离侧边栏右边缘 24px
        setLeftOffset(width + 24);
      }
    };

    // 初始设置
    updatePosition();

    // 使用 ResizeObserver 监听侧边栏宽度变化
    const sider = findSider();
    if (sider) {
      observerRef.current = new ResizeObserver(() => {
        // 使用 requestAnimationFrame 确保在下一帧更新，响应更快
        requestAnimationFrame(updatePosition);
      });
      observerRef.current.observe(sider);
    }

    // 监听 localStorage 变化（作为备用方案）
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'agentLayoutCollapsed') {
        // 使用 requestAnimationFrame 确保在下一帧更新
        requestAnimationFrame(updatePosition);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // 监听自定义事件（如果侧边栏通过 postMessage 通信）
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.key?.startsWith('agentLayout::')) {
        // 使用 requestAnimationFrame 确保在下一帧更新
        requestAnimationFrame(updatePosition);
      }
    };
    window.addEventListener('message', handleMessage);

    // 定期检查（作为最后的备用方案，缩短间隔提高响应速度）
    const intervalId = setInterval(updatePosition, 50);

    return () => {
      if (observerRef.current) {
        const currentSider = findSider();
        if (currentSider) {
          observerRef.current.unobserve(currentSider);
        }
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('message', handleMessage);
      clearInterval(intervalId);
    };
  }, []);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate('/personalized-settings');
    }
  };

  // 根据状态决定是否显示按钮：当 status 不是 RUNNING 时显示
  if (selectProductStore.status === StatusEnum.RUNNING) {
    return null;
  }

  return (
    <div
      className={styles.consultSupplierButton}
      style={{ left: `${leftOffset}px` }}
      onClick={handleClick}
    >
      {/* <SupplierLibraryIcon width={16} height={16} className={styles.consultSupplierButtonIcon} />
      <span className={styles.text}>{$t("global-1688-ai-app.inquiry.ConsultSupplierButton.gysk", "供应商库")}</span> */}
      <Button
        // onClick={() => handleOpen(true)}
        type="text"
        icon={<SupplierLibraryIcon style={{ width: 16, height: 16 }} />}
        className={styles.chatHistoryButton}
      >{$t("global-1688-ai-app.inquiry.ConsultSupplierButton.gysk", "供应商库")}</Button>
    </div>
  );
};

export default observer(ConsultSupplierButton);

