import { Modal, Tooltip } from 'antd';
import CommonTable from '@/components/ChatFlow/CommonTable';
import { useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import styles from './index.module.css';
import FrostedGlass from '@/components/ChatFlow/FrostedGlass';
import { $t } from '@/i18n';

const SameNumModal = ({
  open,
  onClose,
  apiRequest,
}: {
  open: boolean;
  onClose: () => void;
  apiRequest: (params: { pageSize: number; pageNum: number }) => Promise<{
    productList: any[];
    hasMore: boolean;
  }>;
}) => {
  const [tableData, setTableData] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(true);

  const isRequesting = useRef(false);
  const requestId = useRef<number>(0);

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
        );
      },
    },
    {
      title: $t("global-1688-ai-app.ChatFlow.SameNumModal.sjtime", "上架时间"),
      dataIndex: 'launchTime',
      key: 'launchTime',
    },
    {
      title: '价格',
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
    if (isRequesting.current) {
      return;
    }
    isRequesting.current = true;
    requestId.current++;
    const currentRequestId = requestId.current;

    setLoading(true);
    try {
      const { productList, hasMore: hasMoreData } = await apiRequest({
        pageSize,
        pageNum: page,
      });
      // const newData = res?.sameStyleProductVO?.productList || [];
      if (currentRequestId !== requestId.current) {
        return;
      }
      isRequesting.current = false;
      if (append) {
        setTableData(prev => [...prev, ...productList]);
      } else {
        setTableData(productList);
      }

      setHasMore(!!hasMoreData);
      setPageNum(page);
    } catch (error) {
      if (currentRequestId !== requestId.current) {
        return;
      }
      isRequesting.current = false;
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
          {
            loading && tableData.length <= 0 ? null
           : <CommonTable data={tableData} columns={columns as any} />
          }
        </InfiniteScroll>
      </div>
    </Modal>
  );
};

export default SameNumModal;