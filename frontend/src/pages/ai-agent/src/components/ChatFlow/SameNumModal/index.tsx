import { Modal } from 'antd';
import CommonTable from '@/components/ChatFlow/CommonTable';
import { querySameStyleProducts } from './services';
import { useEffect, useState } from 'react';
import { Tooltip } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import styles from './index.module.css';
import FrostedGlass from '../FrostedGlass';
import { $t } from '@/i18n';

export const SameNumModal = ({
  open,
  onClose,
  data,
}: {
  open: boolean;
  onClose: () => void;
  data: any;
}) => {
  const [tableData, setTableData] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const columns = [
    {
      title: $t("global-1688-ai-app.ChatFlow.SameNumModal.productImage", "商品图片"),
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 100,
      align: 'center',
      render: (text, record) => {
        return (
          <FrostedGlass
            style={{ width: 60, height: 60, borderRadius: '8px' }}
            riskStatus={record?.riskStatus}
            productUrl={record?.itemUrl || ''}
            imageUrl={text}
          />
        );
      },
    },
    {
      title: $t("global-1688-ai-app.ChatFlow.SameNumModal.productTitle", "商品标题"),
      dataIndex: 'title',
      key: 'title',
      width: 200,
      render: (text, record) => {
        return (
          text?.length < 40 ? (
            <div className={styles.itemTitle}>{text}</div>
          ) : (
            <Tooltip title={text}>
              <div className={styles.itemTitle}>
                {text}
              </div>
            </Tooltip>
          )
        )
      },
    },
    {
      title: $t("global-1688-ai-app.ChatFlow.SameNumModal.sjtime", "上架时间"),
      dataIndex: 'launchTime',
      key: 'launchTime',
    },
    {
      title: $t("global-1688-ai-app.ChatFlow.SameNumModal.price", "价格"),
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: $t("global-1688-ai-app.ChatFlow.SameNumModal.rating", "评分"),
      dataIndex: 'ratingScore',
      key: 'ratingScore',
    },
    {
      title: $t("global-1688-ai-app.ChatFlow.SameNumModal.monthSales", "月销量"),
      dataIndex: 'monthlySalesVolume',
      key: 'monthlySalesVolume',
    },
  ];

  // 加载数据
  const loadData = async (page: number, append: boolean = false) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const res = await querySameStyleProducts({
        pageSize,
        pageNum: page,
        ...data,
      });
      
      const newData = res?.sameStyleProductVO?.productList || [];
      
      if (append) {
        setTableData(prev => [...prev, ...newData]);
      } else {
        setTableData(newData);
      }
      
      setHasMore(!!res?.hasMore);
      setPageNum(page);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载更多数据
  const loadMore = () => {
    if (hasMore && !loading) {
      loadData(pageNum + 1, true);
    }
  };

  // 重置状态并加载第一页数据
  useEffect(() => {
    if (open) {
      setTableData([]);
      setPageNum(1);
      setHasMore(true);
      loadData(1, false);
    }
  }, [open]);
  return (
    <Modal
      title={$t("global-1688-ai-app.ChatFlow.SameNumModal.viewDetails", "查看详情")}
      open={open}
      onCancel={onClose}
      footer={false}
      style={{
        minWidth: 'calc(100vw - 48px)',
        height: 'calc(100vh - 132px)',
        top: '24px',
      }}
      className={styles.sameNumModalContentContainer}
    >
      <div 
        id="scrollableModalDiv" 
        style={{ 
          height: 'calc(100vh - 200px)', 
          overflow: 'auto',
        }}
        onScroll={(e) => {
          const target = e.target as HTMLDivElement;
          const { scrollTop, scrollHeight, clientHeight } = target;
          const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
          
          // 手动触发加载更多
          if (scrollPercentage > 0.8 && hasMore && !loading) {
            loadMore();
          }
        }}
      >
        <InfiniteScroll
          dataLength={tableData.length}
          next={loadMore}
          hasMore={hasMore}
          loader={
            <div style={{ textAlign: 'center', padding: 12, color: '#86909C' }}>{$t("global-1688-ai-app.ChatFlow.SameNumModal.loading", "加载中...")}</div>
          }
          endMessage={null}
          scrollThreshold={0.8}
        >
          <CommonTable data={tableData} columns={columns as any} />
        </InfiniteScroll>
      </div>
    </Modal>
  );
};