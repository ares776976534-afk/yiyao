import { ReturnHeader } from '../components/returnHeader';
import styles from './index.module.scss';
import { SupplierMain } from '../supplier/components/supplierMain';
import { useState, useEffect, useCallback, useRef } from 'react';
import { list, canStatus, sync } from '@/pages/personalized-settings/services';
import { Input } from 'antd';
import { SearchIcon } from '@/components/Icon';
import { CheckCircleFilled, ExclamationCircleFilled, InfoCircleFilled, WarningFilled, SyncOutlined, PlusOutlined } from '@ant-design/icons';
import SupplierMainCard from './components/supplierMainCard';
import { InfiniteScroll, Toast } from 'antd-mobile';
import SupplierAdd from './components/supplierAdd';
import { MainBtn } from '@/components/ChatFlow/Btn';

export default function Supplier() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isFirstSearch, setIsFirstSearch] = useState(true);
  const [canStatusText, setCanStatusText] = useState('同步1688收藏');
  const [syncPollingTimer, setSyncPollingTimer] = useState<NodeJS.Timeout | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [supplierList, setSupplierList] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [visible, setVisible] = useState(false);
  const onMaskClick = () => {
    setVisible(false);
  }
  const MessageContact = (params) => {
    Toast.show({
      maskClassName: styles.messageContactMask,
      content: (
        <div className={styles.messageContactContent}>
          <div>{params.icon}</div>
          <div>{params.content}</div>
        </div>
      ),
    })
  };
  const handleSync1688Collect = async () => {
    if (isSyncing) {
      MessageContact({
        content: '正在同步中，请稍候...',
        icon: <WarningFilled style={{ color: '#fff', fontSize: 16 }} />,
      })
      return;
    }
    try {
      setIsSyncing(true);
      setCanStatusText('正在同步...');
      const syncRes = await sync({});
      if (syncRes?.success) {
        MessageContact({
          content: '开始同步1688收藏，请稍候...',
          icon: <InfoCircleFilled style={{ color: '#fff', fontSize: 16 }} />,
        })
        startSyncPolling();
      } else {
        resetSyncStatus();
        MessageContact({
          content: syncRes?.msg || '启动同步失败，请稍后重试',
          icon: <ExclamationCircleFilled style={{ color: '#fff', fontSize: 16 }} />,
        })
      }
    } catch (error) {
      resetSyncStatus();
      MessageContact({
        content: '启动同步失败，请稍后重试',
        icon: <ExclamationCircleFilled style={{ color: '#fff', fontSize: 16 }} />,
      })
    }
  };
  const onAddSupplier = () => {
    setVisible(true);
  }
  // 统一的列表请求处理函数
  const updateSupplierList = (res: any, params: any, isLoadMore: boolean = false) => {
    const { data = [], success = false, msg = '', total = 0 } = res;
    if (success) {
      setPageNum(params.pageNum || 1);
      setPageSize(params.pageSize || 10);
      if (isLoadMore && params.pageNum > 1) {
        setSupplierList(prevList => {
          const newList = [...prevList, ...data];
          // 判断是否还有更多数据
          setHasMore(newList.length < total);
          return newList;
        });
      } else {
        setSupplierList(data);
        // 判断是否还有更多数据
        setHasMore(data.length < total);
      }
      return data;
    } else {
      MessageContact({
          content: msg,
          icon: <ExclamationCircleFilled style={{ color: '#fff', fontSize: 16 }} />,
      })
      return [];
    }
  };
  // 重置同步状态
  const resetSyncStatus = () => {
    setIsSyncing(false);
    setCanStatusText('同步1688收藏');
    if (syncPollingTimer) {
        clearInterval(syncPollingTimer);
        setSyncPollingTimer(null);
    }
  };
  // 常用的搜索参数
  const getSearchParams = (customParams = {}) => ({
    companyName,
    pageNum: 1,
    pageSize: 10,
    ...customParams
  });
  // 获取供应商库状态,如果返回的data为true,则同步完成，否则继续同步，一值到同步结束为止
  const getCanStatus = async () => {
    try {
      const res = await canStatus({});
      if (res?.success && res?.data === true) {
        resetSyncStatus();
        // 同步完成后发起list请求，并更新isFirstSearch状态
        const listParams = getSearchParams();
        list(listParams).then((res: any) => {
          const data = updateSupplierList(res, listParams, false);
          setIsFirstSearch(data.length === 0);
        });
        MessageContact({
          icon: <CheckCircleFilled style={{ color: '#fff', fontSize: 16 }} />,
          content: '同步完成！',
        })
        return true; // 同步完成
      }
      return false; // 继续同步
    } catch (error) {
      resetSyncStatus();
      MessageContact({
          content: '检查同步状态失败，请稍后重试',
          icon: <ExclamationCircleFilled style={{ color: '#fff', fontSize: 16 }} />,
      })
      return true; // 停止轮询
    }
  };
  // 开始轮询同步状态
  const startSyncPolling = () => {
    const timer = setInterval(async () => {
      const isCompleted = await getCanStatus();
      if (isCompleted) {
        clearInterval(timer);
        setSyncPollingTimer(null);
      }
    }, 2000); // 每2秒检查一次
    
    setSyncPollingTimer(timer);
  };
  // 检查初始同步状态
  const checkInitialSyncStatus = async () => {
    try {
      const res = await canStatus({});
      // 如果返回的data不为true，说明可能正在同步中
      if (res?.success && res?.data !== true) {
        setIsSyncing(true);
        setCanStatusText('正在同步...');
        // 开始轮询检查同步状态
        startSyncPolling();
      }
    } catch (error) {
      // 初始检查失败不需要特别处理，保持默认状态即可
      console.warn('初始同步状态检查失败:', error);
    }
  };
  useEffect(() => {
    // 初始化时获取供应商列表
    const initParams = { pageNum: 1, pageSize: 10 };
    list(initParams).then((res: any) => {
      const data = updateSupplierList(res, initParams, false);
      setIsFirstSearch(data.length === 0);
    });
    // 检查是否正在同步中
    checkInitialSyncStatus();
  }, []);
  const handleSearch = (params: { companyName?: string, pageNum?: number, pageSize?: number }) => {
    // 确保搜索时从第1页开始
    const searchParams = { ...params, pageNum: params.pageNum || 1 };
    setHasMore(true); // 重置 hasMore 状态
    list(searchParams).then((res: any) => updateSupplierList(res, searchParams, false));
  };
  // 防抖搜索函数
  const debouncedSearch = useCallback((searchValue: string) => {
    // 清除之前的定时器
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    // 设置新的定时器
    searchTimerRef.current = setTimeout(() => {
      // 直接发起搜索，允许空字符串查询所有数据
      const searchParams = { companyName: searchValue, pageNum: 1, pageSize: 10 };
      setHasMore(true); // 重置 hasMore 状态
      list(searchParams).then((res: any) => updateSupplierList(res, searchParams, false));
    }, 500); // 0.5秒后执行搜索
  }, []);
  // 滚动到底加载更多
  const handleLoadMore = async () => {
    const nextPageParams = { companyName, pageNum: pageNum + 1, pageSize: pageSize };  
    const res = await list(nextPageParams);
    updateSupplierList(res, nextPageParams, true);
  };
  return (
    <div>
      <ReturnHeader
        rightAction={
          !isFirstSearch && (
            <div className={styles.rightAction} onClick={handleSync1688Collect}>
              <SyncOutlined spin={isSyncing} />
              <div className={styles.rightActionText}>{canStatusText}</div>
            </div>
          )
        }
      />
      {isFirstSearch ? (
        <div className={styles.supplierContainer}>
          <SupplierMain
            canStatusText={canStatusText}
            isSyncing={isSyncing}
            onSync1688Collect={handleSync1688Collect}
            onAddSupplier={onAddSupplier}
          />
        </div>
      ) : (
        <div className={styles.supplierContent}>
          <Input
            placeholder='支持搜索供应商名称及旺旺ID'
            suffix={<SearchIcon style={{ color: '#86909c', cursor: 'pointer' }} onClick={() => handleSearch(getSearchParams())} />}
            value={companyName}
            onChange={(e) => {
              const value = e.target.value;
              setCompanyName(value);
              debouncedSearch(value);
            }}
            style={{ width: '100%', height: 36, boxShadow: 'none', borderRadius: '8px', border: '1px solid #E7E8EE' }}
            onPressEnter={() => handleSearch(getSearchParams())}
          />
          {supplierList?.length > 0 ? (
            <div className={styles.supplierList}>
              {supplierList?.map((item) => (
                <SupplierMainCard key={item.wangwangId} {...item} />
              ))}
              {hasMore && (
                <InfiniteScroll loadMore={handleLoadMore} hasMore={hasMore}>
                  <div className={styles.loadingText}>加载中...</div>
                </InfiniteScroll>
              )}
            </div>
          ) : (
            <div className={styles.noSearchResult}>暂无搜索结果</div>
          )}
          <div className={styles.addSupplierBtnContainer}>
            <MainBtn
              icon={<PlusOutlined />}
              text='手动添加供应商'
              handleBtn={onAddSupplier}
            />
          </div>
        </div>
      )}
      <SupplierAdd visible={visible} onMaskClick={onMaskClick} searchList={handleSearch} />
    </div>
  )
}