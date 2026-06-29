import React, { useState, useEffect, useCallback, useRef } from 'react';
import { message } from 'antd';
import { getTaskList } from '../../services';
import styles from '../../index.module.css';
import NewHomeContent from '../NewHomeContent';
import FilterTabs from '../FilterTabs';
import TaskCard from '../TaskCard';
import { commonRecord } from '@/utils/log';
import { $t } from '@/i18n';
import DemoList from '@/pages/agent-home/components/DemoList';
import { httpRequest } from '@/services/mtop';
import { serviceBaseUrl } from '@/utils/env';
import MyInquiryTasksTitle from './MyInquiryTasksTitle';
import { getUserInfo } from '@/utils/login';

interface TaskProps {
  taskId?: string;
  status?: string;
  name?: string;
  type?: string;
  createTime?: string;
  itemInfo?: {
    imgUrl?: string;
    offerId?: string;
    title?: string;
  };
  supplierCnt?: number;
  isReportFinished?: boolean;
  isCreateNew?: boolean;
}
interface DashboradProps {
  onNewClick?: () => void;
  onlyShowDemo?: boolean; // 是否只显示 DemoList，跳过任务列表加载
}

export default ({ onNewClick, onlyShowDemo = false }: DashboradProps) => {
  const [activeFilter, setActiveFilter] = useState(null);
  const [tasks, setTasks] = useState<TaskProps[]>([]);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize] = useState(10);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true); // 用于跟踪是否还有更多数据
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null); // 轮询定时器
  const [hasMore, setHasMore] = useState(true); // 用于控制哨兵元素显示
  const sentinelRef = useRef<HTMLDivElement>(null); // 哨兵元素引用
  const anchorRef = useRef<HTMLDivElement>(null); // 锚点元素引用，用于滚动定位
  const [shouldShowTaskList, setShouldShowTaskList] = useState<boolean | null>(null); // null 表示还未决定，true/false 表示已决定
  const hasDecidedRef = useRef(false); // 用于跟踪是否已经决定过显示哪个组件
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // null 表示还在检查登录状态，true/false 表示已确定

  const getTaskListData = useCallback(({ pNum = 1, pSize = 10, status }: { pNum?: number; pSize?: number; status?: any }) => {
    if (loadingRef.current) return; // 防止重复请求
    loadingRef.current = true;
    getTaskList({
      pageNum: pNum,
      pageSize: pSize,
      status: status,
    }).then((res) => {
      const { data = [], msg = '', success = false } = res as { data: TaskProps[]; msg: string; success: boolean };
      if (!success) {
        message.error(msg);
        loadingRef.current = false;
        return;
      }
      const _data = data;
      // const _data = data.map(item => ({
      //   ...item,
      //   status: item.status === 'FINISHED' && !item.isReportFinished ? 'RUNNING' : item.status,
      // }));
      // 如果接口没有返回数据，使用模拟数据
      // const actualData = data.length === 0 ? generateMockTasks(pSize) : data;

      // const _data = actualData.map(item => ({
      //   ...item,
      //   status: item.status === 'FINISHED' && !item.isReportFinished ? 'RUNNING' : item.status,
      // }));

      const totalCount = res?.total || 0;
      setTasks(prevTasks => {
        const newTasks = pNum === 1 ? _data : [...prevTasks, ..._data];
        // 判断是否还有更多数据：
        // 1. 如果返回数据长度小于 pageSize，说明没有更多数据了
        // 2. 如果 totalCount > 0，则检查已加载数量是否小于总数
        // 3. 如果 totalCount === 0，但返回数据长度等于 pageSize，认为可能还有更多数据
        // 使用模拟数据时，限制最多显示2页数据
        // const isMockData = data.length === 0;
        // const maxMockPages = 2;
        // const hasMoreData = isMockData
        //   ? pNum < maxMockPages && _data.length >= pSize
        //   : _data.length >= pSize && (totalCount === 0 || newTasks.length < totalCount);
        const hasMoreData = _data.length >= pSize && (totalCount === 0 || newTasks.length < totalCount);
        hasMoreRef.current = hasMoreData;
        setHasMore(hasMoreData);

        // 只在初次加载第一页时决定显示哪个组件
        if (pNum === 1 && !hasDecidedRef.current) {
          hasDecidedRef.current = true;
          setShouldShowTaskList(newTasks.length > 0);
        }

        // 检查是否有 REPORTING 状态的任务，如果有则继续轮询
        const hasReporting = newTasks.some(task => task.status === 'REPORTING');
        if (hasReporting) {
          if (pollingTimerRef.current) {
            clearTimeout(pollingTimerRef.current);
          }
          pollingTimerRef.current = setTimeout(() => {
            loadingRef.current = false;
            getTaskListData({ pNum: 1, pSize: 10, status });
          }, 5000);
        } else {
          if (pollingTimerRef.current) {
            clearTimeout(pollingTimerRef.current);
            pollingTimerRef.current = null;
          }
        }

        return newTasks;
      });
      setPageNum(pNum);
      loadingRef.current = false;
    }).catch(() => {
      loadingRef.current = false;
    });
  }, []);

  const handleFilterChange = (filter) => {
    if (filter === activeFilter) {
      return;
    }
    setActiveFilter(filter);
    setTasks([]); // 重置任务列表
    hasMoreRef.current = true; // 重置更多数据标志
    setHasMore(true); // 重置更多数据标志
    getTaskListData({
      pNum: 1,
      pSize: 10,
      status: filter,
    });

    // 滚动到 FilterTabs 位置，支持可配置的偏移量
    setTimeout(() => {
      if (anchorRef.current) {
        const anchorElement = anchorRef.current;
        const rect = anchorElement.getBoundingClientRect();
        const scrollOffset = 0; // 可以调整这个值来微调锚定位置（正数向下，负数向上）
        const targetPosition = window.scrollY + rect.top - scrollOffset;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth',
        });
      }
    }, 0);
  };

  useEffect(() => {
    return () => {
      if (pollingTimerRef.current) {
        clearTimeout(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    };
  }, []);

  // 检查登录状态
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // 直接调用接口获取原始数据，以便检查完整的返回结构
        const data = await getUserInfo();

        // 判断是否登录：userId 或 loginId 不为 null，且 hasAccessPermission 为 true
        const loggedIn = !!(data?.loginId) && data?.hasAccessPermission !== false;
        setIsLoggedIn(loggedIn);

        // 如果未登录，直接设置不显示任务列表
        if (!loggedIn) {
          setShouldShowTaskList(false);
          hasDecidedRef.current = true;
        }
      } catch (error) {
        // 请求失败，认为未登录
        setIsLoggedIn(false);
        setShouldShowTaskList(false);
        hasDecidedRef.current = true;
      }
    };

    checkLoginStatus();
  }, []);

  useEffect(() => {
    // 如果 onlyShowDemo 为 true，跳过任务列表加载
    if (onlyShowDemo) {
      setShouldShowTaskList(false);
      return;
    }

    // 只有在已登录的情况下才请求任务列表
    if (isLoggedIn === true) {
      getTaskListData({
        pNum: 1,
        pSize: 10,
        status: activeFilter,
      });
    }
  }, [activeFilter, getTaskListData, onlyShowDemo, isLoggedIn]);

  // 使用 Intersection Observer 实现滚动加载更多
  useEffect(() => {
    // 只有当 shouldShowTaskList 为 true 时才设置 observer（此时哨兵元素已渲染）
    if (shouldShowTaskList !== true) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // 当哨兵元素进入视口时
        if (entry.isIntersecting) {
          // 如果正在加载或没有更多数据，则不执行
          if (loadingRef.current || !hasMoreRef.current) {
            return;
          }

          // 加载下一页
          const nextPage = pageNum + 1;
          getTaskListData({
            pNum: nextPage,
            pSize: pageSize,
            status: activeFilter,
          });
        }
      },
      {
        root: null, // 使用视口作为根
        rootMargin: '200px', // 提前 200px 触发
        threshold: 0.1, // 当 10% 的元素可见时触发
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [pageNum, pageSize, activeFilter, getTaskListData, shouldShowTaskList]);

  return (
    <>
      <div className={styles.newHomeContent}>
        <NewHomeContent
          onNewClick={() => {
            commonRecord(`新增询盘任务按钮`);
            onNewClick?.();
          }}
        />
      </div>
      {onlyShowDemo || isLoggedIn === false ? (
        <div style={{ marginTop: '120px' }}>
          <DemoList scene="INQUIRY" />
        </div>
      ) : isLoggedIn === null ? null : shouldShowTaskList === null ? null : shouldShowTaskList ? (
        <>
          <MyInquiryTasksTitle />
          {/* 锚点元素，用于滚动定位到 FilterTabs，高度为0不影响布局 */}
          <div ref={anchorRef} style={{ height: 0, margin: 0, padding: 0 }} />
          <FilterTabs
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            onNewClick={onNewClick}
          /> 
          <div className={styles.cardGrid}>
            {tasks?.map(task => (
              <div key={`${task.taskId}-${activeFilter}`} className={styles.taskCardWrapper}>
                <TaskCard
                  {...task}
                  isCreateNew={false}
                  getTaskListData={getTaskListData}
                  activeFilter={activeFilter}
                />
              </div>
            ))}
          </div>
          {/* 哨兵元素：用于检测是否滚动到底部 */}
          {hasMore && (
            <div
              ref={sentinelRef}
              style={{
                height: '1px',
                width: '100%',
                marginTop: '20px',
              }}
            />
          )}
        </>
      ) : (
        <div style={{ marginTop: '100px' }}>
          <DemoList scene="INQUIRY" />
        </div>
      )}
    </>
  );
};