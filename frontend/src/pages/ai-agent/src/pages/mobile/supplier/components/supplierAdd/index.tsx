import styles from './index.module.scss';
import AgentPopup from '@/pages/mobile/components/agentPopup';
import { Input } from 'antd';
import { SearchIcon } from '@/components/Icon';
import { useState, useCallback, useRef, useEffect } from 'react';
import { search, add } from '@/pages/personalized-settings/services';
import { Toast, InfiniteScroll } from 'antd-mobile';
import { ExclamationCircleFilled } from '@ant-design/icons';
import SupplierAddCard from '../supplierAddCard';
import { MainBtn } from '@/components/ChatFlow/Btn';
import { CloseIcon } from '@/components/Icons';

interface SupplierAddProps {
  visible: boolean,
  onMaskClick: () => void,
  searchList: (params: { pageNum?: number, pageSize?: number }) => void,
}

export default function SupplierAdd({
  visible,
  onMaskClick,
  searchList,
}: SupplierAddProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [supplierList, setSupplierList] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [selectedSuppliers, setSelectedSuppliers] = useState<Map<string, any>>(new Map());
  // 是否首次进入
  const [isFirstEntry, setIsFirstEntry] = useState(true);
  // 搜索定时器引用
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 监听弹窗关闭，清空状态
  useEffect(() => {
    if (!visible) {
      setSearchTerm('');
      setSupplierList([]);
      setSelectedSuppliers(new Map());
      setHasMore(true);
      setPageNum(1);
    }
  }, [visible]);
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
  // 防抖搜索函数
  const debouncedSearch = useCallback((searchValue: string) => {
    // 清除之前的定时器
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    // 设置新的定时器
    searchTimerRef.current = setTimeout(() => {
      if (searchValue.trim()) {
        // 当输入框有内容时，发起搜索
        setHasMore(true); // 重置 hasMore 状态
        handleSearch({ value: searchValue, pageNum: 1, isAppend: false });
      } else {
        // 当输入框为空时，重置为初始状态
        setSupplierList([]);
        setIsFirstEntry(true);
        setHasMore(true);
      }
    }, 500);
  }, []);
  
  // 滚动加载更多
  const handleLoadMore = async () => {
    const nextPageNum = pageNum + 1;
    handleSearch({ value: searchTerm, pageNum: nextPageNum, pageSize: pageSize, isAppend: true });
  };

  // 处理供应商选中状态变化
  const handleSelectChange = (supplier: any, checked: boolean) => {
    setSelectedSuppliers(prev => {
      const newMap = new Map(prev);
      if (checked) {
        newMap.set(supplier.wangwangId, supplier);
      } else {
        newMap.delete(supplier.wangwangId);
      }
      return newMap;
    });
  };
  const handleSearch = ({ value = '', pageNum = 1, pageSize = 10, isAppend = false }: { value?: string, pageNum?: number, pageSize?: number, isAppend?: boolean }) => {
    search({
      companyName: value,
      pageNum: pageNum,
      pageSize: pageSize,
    }).then((res: any) => {
      setPageNum(pageNum);
      setPageSize(pageSize);
      
      // 根据isAppend决定是叠加还是替换数据
      if (isAppend) {
        const newList = [...supplierList, ...(res?.data || [])];
        setSupplierList(newList);
        // 判断是否还有更多数据
        setHasMore(newList.length < (res?.total || 0));
      } else {
        setSupplierList(res?.data || []);
        // 判断是否还有更多数据
        setHasMore((res?.data || []).length < (res?.total || 0));
      }
      setIsFirstEntry(false);
    })
      .catch((err: any) => {
        MessageContact({
          content: '系统异常，请稍后重试',
          icon: <ExclamationCircleFilled style={{ color: '#fff', fontSize: 16 }} />,
        })
      });
  };
  const deleteSelectedSupplier = (wangwangId: string) => {
    setSelectedSuppliers(prev => {
      const newMap = new Map(prev);
      newMap.delete(wangwangId);
      return newMap;
    });
  };
  // 添加
  const onConfirm = (wangwangId: string[]) => {
    add({ wangwangId }).then((res: any) => {
      if (res.success) {
        MessageContact({content: '添加成功'})
        searchList({ pageNum: 1, pageSize: 10 });
        setSelectedSuppliers(new Map()); 
        onMaskClick();
      } else {
        MessageContact({content: res.msg || '系统异常'})
        onMaskClick();
      }
    })
    setIsFirstEntry(true);
  };
  return (
    <AgentPopup visible={visible} onMaskClick={onMaskClick} title="手动添加供应商">
      <div className={styles.supplierAddContent}>
        <Input
          placeholder='支持搜索供应商名称及旺旺ID'
          suffix={<SearchIcon style={{ color: '#86909c' }} onClick={() => handleSearch({ value: searchTerm, pageNum: 1, isAppend: false })} />}
          value={searchTerm}
          onChange={(e) => {
            const value = e.target.value;
            setSearchTerm(value);
            debouncedSearch(value);
          }}
          style={{ width: '100%', height: 36, boxShadow: 'none', borderRadius: '8px', border: '1px solid #E7E8EE' }}
          onPressEnter={() => handleSearch({ value: searchTerm, pageNum: 1, isAppend: false })}
        />
        {isFirstEntry ? (
          <div className={styles.entry}>支持搜索供应商名称及旺旺ID</div>
        ) : (
          supplierList.length > 0 ? (
            <div className={styles.supplierAddList}>
              {supplierList.map((item) => (
                <SupplierAddCard 
                  key={item.wangwangId} 
                  {...item}
                  checked={selectedSuppliers.has(item.wangwangId)}
                  onSelectChange={handleSelectChange}
                />
              ))}
              {hasMore && (
                <InfiniteScroll loadMore={handleLoadMore} hasMore={hasMore}>
                  <div className={styles.loadingText}>加载中...</div>
                </InfiniteScroll>
              )}
            </div>
          ) : (
            <div className={styles.entry}>暂无搜索结果</div>
          )
        )}
        
        <div className={styles.footerBtnContainer}>
          <div className={styles.selectedCount}>
            {Array.from(selectedSuppliers.values()).map(item => (
              <div key={item.wangwangId} className={styles.selectedSupplierItem}>
                <div className={styles.selectedSupplierItemText}>{item.companyName}</div>
                <CloseIcon onClick={() => deleteSelectedSupplier(item.wangwangId)} fill='#7C7F9A' />
              </div>
            ))}
          </div>
          <MainBtn
            text={`确认添加${selectedSuppliers.size > 0 ? `（${selectedSuppliers.size}）` : ''}`}
            handleBtn={() => {
              const selectedList = Array.from(selectedSuppliers.values());
              // 这里可以添加确认添加的逻辑
              onConfirm(selectedList.map(s => s.wangwangId));
            }}
            other={{
              disabled: selectedSuppliers.size === 0,
            }}
          />
        </div>
      </div>
    </AgentPopup>
  )
}