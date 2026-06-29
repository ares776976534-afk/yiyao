import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
// import styles from './index.module.css';
import NavigationComponent from './Navigation';
interface NavigationItem {
  id: string;
  icon: React.ReactNode;
  text: string;
}

interface NavigationProps {
  items: NavigationItem[];
  activeId?: string;
  onItemClick?: (id: string) => void;
  className?: string;
}

export interface TypeNavigationRef {
  stopAutoSwitch: () => void;
}

const Navigation = forwardRef<TypeNavigationRef, NavigationProps>(({
  items,
  activeId = 'product',
  onItemClick,
  className,
}, ref) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isManualClick, setIsManualClick] = useState(false); // 标记用户是否手动点击过
  const selectedId = items[currentIndex]?.id || activeId;

  // 暴露停止自动切换的方法
  useImperativeHandle(ref, () => ({
    stopAutoSwitch: () => {
      setIsManualClick(true);
    },
  }));

  // 监听输入框激活事件，停止自动切换
  useEffect(() => {
    const handleChatInputFocus = () => {
      setIsManualClick(true);
    };

    window.addEventListener('chatInputFocus', handleChatInputFocus);

    return () => {
      window.removeEventListener('chatInputFocus', handleChatInputFocus);
    };
  }, []);

  // 同步外部传入的 activeId 到内部 currentIndex
  useEffect(() => {
    if (activeId && items.length > 0) {
      const index = items.findIndex((item) => item.id === activeId);
      if (index !== -1) {
        setCurrentIndex((prevIndex) => {
          // 只有当索引真正改变时才更新
          return index === prevIndex ? prevIndex : index;
        });
      }
    }
  }, [activeId, items]);

  useEffect(() => {
    // 如果用户手动点击过，就不再自动切换
    if (isManualClick) return;

    // 依次激活每个按钮，每个按钮5秒间隔
    if (items.length === 0) return;

    setIsAnimating(true);
    setIsCompleted(false);

    const timer = setTimeout(() => {
      setIsAnimating(false);
      setIsCompleted(true);
    }, 5000);

    // 5秒后切换到下一个按钮
    const nextTimer = setTimeout(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % items.length;
        // 自动切换时也触发回调，联动更新 activeAgent
        const nextId = items[nextIndex]?.id;
        if (nextId) {
          onItemClick?.(nextId);
        }
        return nextIndex;
      });
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(nextTimer);
    };
  }, [currentIndex, items.length, items, onItemClick, isManualClick]);

  const handleItemClick = (id: string) => {
    const clickedIndex = items.findIndex((item) => item.id === id);
    if (clickedIndex !== -1) {
      setIsManualClick(true); // 标记用户已手动点击
      setCurrentIndex(clickedIndex);
      onItemClick?.(id);
    }
  };

  return (
    <NavigationComponent
      className={className}
      items={items}
      selectedId={selectedId}
      handleItemClick={handleItemClick}
      isAnimating={isAnimating}
      isCompleted={isCompleted}
    />
  );
});

Navigation.displayName = 'Navigation';

export default Navigation;
