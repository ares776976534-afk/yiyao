import { useState, useRef, useCallback, useEffect } from 'react';
import { Modal, Input, Button, message } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { SearchIcon, WantWantIcon } from '@/components/Icon';
import InfiniteScroll from 'react-infinite-scroll-component';
import styles from './addSupplierModal.module.css';
import { search } from '../services';
import { $t } from '@/i18n';

interface SupplierLibraryModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (suppliers: any[]) => void;
}

function AddSupplierModal({ open, onClose, onConfirm }: SupplierLibraryModalProps) {
  const [selectedSuppliers, setSelectedSuppliers] = useState<any[]>([]);
  const [supplierList, setSupplierList] = useState<any[]>([]);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalSupplierCount, setTotalSupplierCount] = useState(0);

  // 是否首次进入
  const [isFirstEntry, setIsFirstEntry] = useState(true);
  
  // 搜索定时器引用
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 判断供应商是否已被选中
  const isSupplierSelected = (supplier: any) => {
    return selectedSuppliers.some(selected => selected.wangwangId === supplier.wangwangId);
  };

  // 切换供应商选中状态
  const toggleSupplierSelection = (supplier: any) => {
    const isSelected = isSupplierSelected(supplier);
    if (isSelected) {
      // 移除供应商
      setSelectedSuppliers(selectedSuppliers.filter(selected => selected.wangwangId !== supplier.wangwangId));
    } else {
      // 添加供应商
      setSelectedSuppliers([...selectedSuppliers, supplier]);
    }
  };

  // 清空所有记录
  const clear = () => {
    onClose();
    setSelectedSuppliers([]);
    setSupplierList([]);
    setSearchTerm('');
    setPageNum(1);
    setPageSize(10);
    setTotalSupplierCount(0);
    
    // 清理搜索定时器
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
      searchTimerRef.current = null;
    }
  }

  const handleConfirm = () => {
    clear();
    onConfirm(selectedSuppliers);
    setIsFirstEntry(true);
  };

  const handleCancel = () => {
    clear();
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
        handleSearch({ value: searchValue, pageNum: 1, isAppend: false });
      } else {
        // 当输入框为空时，重置为初始状态
        setSupplierList([]);
        setIsFirstEntry(true);
        setTotalSupplierCount(0);
      }
    }, 500); // 0.5秒后执行搜索
  }, []);

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
        setSupplierList(prevList => [...prevList, ...(res?.data || [])]);
      } else {
        setSupplierList(res?.data || []);
      }
      
      setIsFirstEntry(false);
      setTotalSupplierCount(res?.total || 0);
    })
      .catch((err: any) => {
        message.error('系统异常，请稍后重试')
      });
  };

  // 滚动到底加载更多
  const handleLoadMore = () => {
    const nextPageNum = pageNum + 1;
    handleSearch({ 
      value: searchTerm, 
      pageNum: nextPageNum, 
      pageSize: pageSize,
      isAppend: true // 叠加数据
    });
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={800}
      centered
      closeIcon={<CloseOutlined />}
      title={
        <div className={styles.modalHeader}>{$t("global-1688-ai-app.personalized-settings.AddSupplierModal.sdaddgys", "手动添加供应商")}</div>
      }
      styles={{
        body: { padding: 0 },
        header: { marginBottom: 16 },
        content: { padding: '20px', borderRadius: '16px' }
      }}
    >
      <div>
        <Input
          placeholder={$t("global-1688-ai-app.personalized-settings.AddSupplierModal.srrsw", "支持搜索供应商名称及旺旺ID")}
          suffix={<SearchIcon style={{ color: '#86909c' }} onClick={() => handleSearch({ value: searchTerm, pageNum: 1, isAppend: false })} />}
          value={searchTerm}
          onChange={(e) => {
            const value = e.target.value;
            setSearchTerm(value);
            debouncedSearch(value);
          }}
          style={{ width: '100%', marginBottom: 16, borderRadius: '8px', border: '1px solid #E7E8EE' }}
          onPressEnter={() => handleSearch({ value: searchTerm, pageNum: 1, isAppend: false })}
        />
        {isFirstEntry ? (
          <div className={styles.firstEntry}>{$t("global-1688-ai-app.personalized-settings.AddSupplierModal.qshg", "请通过上方搜索框，添加供应商")}</div>
        ) : (
          <div id="supplierListScroll" style={{ height: '416px', overflow: 'auto' }}>
            <InfiniteScroll
              height={416}
              dataLength={supplierList?.length}
              next={handleLoadMore}
              hasMore={supplierList?.length < totalSupplierCount}
              loader={<div style={{ textAlign: 'center', padding: 12 }} />}
              style={supplierList?.length > 0 ? { display: 'flex', flexDirection: 'column', gap: 12 } : { display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center', alignItems: 'center' }}
            >
              {supplierList?.length > 0 ? supplierList.map((supplier) => {
                const { companyName, wangwangId, headImg, canAdd } = supplier;
                const isSelected = isSupplierSelected(supplier);
                return (
                  <div className={styles.supplierItem} key={wangwangId}>
                    <img className={styles.supplierItemImage} src={headImg} alt="" srcSet="" />
                    <div className={styles.supplierItemContent}>
                      <div className={styles.title}>{companyName}</div>
                      <div className={styles.shop}>
                        <WantWantIcon className={styles.shopIcon} />
                        <span className={styles.shopName}>{wangwangId}</span>
                      </div>
                    </div>
                    <div className={styles.supplierItemButton}>
                      {!canAdd ? (
                        <Button
                          type="primary"
                          disabled={true}
                          className={styles.canDisabledAdd}
                        >{$t("global-1688-ai-app.personalized-settings.AddSupplierModal.yadd", "已添加")}</Button>
                      ) : (
                        <Button
                          type="primary"
                          className={styles.canAdd}
                          onClick={() => toggleSupplierSelection(supplier)}
                        >
                          {isSelected ? $t("global-1688-ai-app.personalized-settings.AddSupplierModal.cancelAdd", "取消添加") : $t("global-1688-ai-app.personalized-settings.AddSupplierModal.add", "添加")}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              }) : <div className={styles.noSearchResult}>{$t("global-1688-ai-app.personalized-settings.AddSupplierModal.zrs", "暂无搜索结果")}</div>}
            </InfiniteScroll>
          </div>
        )}
        <div className={styles.modalFooter}>
          {isFirstEntry ? (
            <Button
              type="primary"
              disabled
              className={styles.confirmBtn}
            >{$t("global-1688-ai-app.personalized-settings.AddSupplierModal.confirm", "确认")}</Button>
          ) : (
            <Button
              type="primary"
              disabled={selectedSuppliers.length === 0}
              onClick={handleConfirm}
              className={styles.addBtn}
            >{$t("global-1688-ai-app.personalized-settings.AddSupplierModal.confirmAdd", `确认添加(${selectedSuppliers.length})`, [selectedSuppliers.length])}</Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default AddSupplierModal;