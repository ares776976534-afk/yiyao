import { useState, useEffect } from 'react';
import { Tabs, message } from 'antd';
import { InfiniteScroll } from 'antd-mobile';
import styles from './index.module.scss';
import { InputContainer } from '../inputContainer';
import { InquiryFilters } from '@/pages/mobile/config';
import { getTaskList } from '@/pages/inquiry/services';
import type { TaskProps } from '@/pages/mobile/types';
import TaskCard from '@/pages/inquiry/components/TaskCard';
import { AgentType } from '@/pages/mobile-agent-home/enum';
import Agents from '@/pages/mobile-agent-home/components/Agents';
import { Empty } from '@/pages/mobile/components/empty';

export const Task = () => {
  const [activeFilter, setActiveFilter] = useState(InquiryFilters[0].key);
  const [pageNum, setPageNum] = useState(1);
  const [tasks, setTasks] = useState<TaskProps[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 10;

  const fetchTaskList = async (page: number, isRefresh = false) => {
    try {
      const res = await getTaskList({
        pageNum: page,
        pageSize: pageSize,
        status: activeFilter === 'all' ? undefined : activeFilter,
      });
      const { data = [], msg = '', success = false } = res as { data: TaskProps[]; msg: string; success: boolean };
      
      if (success) {
        if (isRefresh) {
          setTasks(data);
        } else {
          setTasks([...tasks, ...data]);
        }
        setHasMore(data.length >= pageSize);
        return data.length > 0;
      } else {
        message.error(msg);
        return false;
      }
    } catch (err) {
      console.log(err, 'errxssss');
      return false;
    }
  };

  const loadMore = async () => {
    const nextPage = pageNum + 1;
    const hasData = await fetchTaskList(nextPage, false);
    if (hasData) {
      setPageNum(nextPage);
    }
  };

  useEffect(() => {
    setPageNum(1);
    setHasMore(true);
    fetchTaskList(1, true)
  }, [activeFilter]);
  if (tasks?.length <= 0 && activeFilter === 'all') {
    return <Agents type={AgentType.INQUIRY} />;
  }

  return (
    <div className={styles.task}>
      <InputContainer type={AgentType.INQUIRY} />
      <div className={styles.taskContent}>
        <div className={styles.taskContentHeader}>我的询盘任务</div>
        <Tabs
          onChange={setActiveFilter}
          defaultActiveKey={activeFilter}
          items={InquiryFilters}
          tabBarGutter={24}
        />
        {tasks.length > 0 ? (
          <div className={styles.cardGrid}>
            {tasks?.map(task => <TaskCard key={task.taskId} {...task} isCreateNew={false} type='mobile' />)}
            <InfiniteScroll loadMore={loadMore} hasMore={hasMore}>
              {hasMore && (<div className={styles.loadingText}>加载中...</div>)}
            </InfiniteScroll>
          </div>
        ): (
          <Empty text='暂无任务' style={{ height: 420, paddingTop: 80 }} />          
        )}
      </div>
    </div>
  )
}