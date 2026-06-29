import { Modal, Table } from 'antd';
import { queryReviewTagReviews } from '../../services';
import { useEffect, useState, useRef } from 'react';
import PaginationComponent from '@/pages/select-product/components/ImproveComponents/PaginationComponent';
import style from './reviewDetailModal.module.css';
import { $t } from '@/i18n';

const columns = [
  {
    title: $t("global-1688-ai-app.select-product.ImproveComponents.ImproveDetailModal.userID", "用户ID"),
    dataIndex: 'reviewUserNick',
    key: 'reviewUserNick',
  },
  {
    title: $t("global-1688-ai-app.select-product.ImproveComponents.ImproveDetailModal.commentTitle", "评论标题"),
    dataIndex: 'title',
    key: 'title',
  },
  {
    title: $t("global-1688-ai-app.select-product.ImproveComponents.ImproveDetailModal.commentTime", "评论时间"),
    dataIndex: 'reviewTime',
    key: 'reviewTime',
  },
  {
    title: $t("global-1688-ai-app.select-product.ImproveComponents.ImproveDetailModal.commentImage", "评论图片"),
    dataIndex: 'mainImgUrl',
    key: 'mainImgUrl',
    width: 100,
    render: (text, record) => {
      if (text) {
        return <img src={text} alt={$t("global-1688-ai-app.select-product.ImproveComponents.ImproveDetailModal.commentImage", "评论图片")} className="w-12 h-12 object-cover rounded" />;
      } else {
        return <span>-</span>;
      }
    },
  },
  {
    title: $t("global-1688-ai-app.select-product.ImproveComponents.ImproveDetailModal.commentContent", "评论内容"),
    dataIndex: 'reviewContent',
    key: 'reviewContent',
    render: (text, record) => {
      return (
        <div className={style.reviewContentContainer}>
          <div>{record?.reviewContentTransCn}</div>
          <div>{record?.reviewContent}</div>
        </div>
      )
    },
  },
];
// 骨架屏列配置
const skeletonColumns = [
  {
    title: $t("global-1688-ai-app.select-product.ImproveComponents.ImproveDetailModal.userID", "用户ID"),
    dataIndex: 'reviewUserNick',
    key: 'reviewUserNick',
    render: () => <div className={style.skeletonLine} style={{ height: '16px', width: '80%' }} />
  },
  {
    title: $t("global-1688-ai-app.select-product.ImproveComponents.ImproveDetailModal.commentTitle", "评论标题"),
    dataIndex: 'title',
    key: 'title',
    render: () => <div className={style.skeletonLine} style={{ height: '16px', width: '85%' }} />
  },
  {
    title: $t("global-1688-ai-app.select-product.ImproveComponents.ImproveDetailModal.commentTime", "评论时间"),
    dataIndex: 'reviewTime',
    key: 'reviewTime',
    render: () => <div className={style.skeletonLine} style={{ height: '16px', width: '85%' }} />
  },
  {
    title: $t("global-1688-ai-app.select-product.ImproveComponents.ImproveDetailModal.commentImage", "评论图片"),
    dataIndex: 'mainImgUrl',
    key: 'mainImgUrl',
    width: 100,
    render: () => <div className={style.skeletonLine} style={{ height: '16px', width: '85%' }} />
  },
  {
    title: $t("global-1688-ai-app.select-product.ImproveComponents.ImproveDetailModal.commentContent", "评论内容"),
    dataIndex: 'reviewContent',
    key: 'reviewContent',
    render: () => (
      <div>
        <div className={style.skeletonLine} style={{ height: '16px', width: `${60 + Math.random() * 30}%`, marginBottom: '8px' }} />
        <div className={style.skeletonLine} style={{ height: '16px', width: `${40 + Math.random() * 40}%` }} />
      </div>
    )
  },
];

// 生成骨架屏数据
const generateSkeletonData = (count: number) => {
  return Array.from({ length: count }, (_, index) => ({
    key: `skeleton-${index}`,
    reviewUserNick: '',
    title: '',
    reviewTime: '',
    mainImgUrl: '',
    reviewContent: ''
  }));
};

export const ImproveDetailModal = ({
  open,
  onClose,
  data,
}: {
  open: boolean;
  onClose: () => void;
  data: any;
}) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { sentimentTypeName, reviewTag, productIds, labelCategory, reviewCnt } = data || {};

  const loadData = async (page: number, isLoadMore = false, pageSize: number = 10) => {
    setLoading(true);
    
    try {
      const res = await queryReviewTagReviews({
        pageNum: page,
        pageSize: pageSize,
        productList: productIds,
        labelCategory: labelCategory,
        reviewTag: reviewTag,
        sentimentTypeName: sentimentTypeName,
      });

      const newList = res?.reviewTagEntryVO?.reviewVOList || [];
      setList(newList);
      setTotal(res?.totalCount || 0);
      setPageNum(page);
      setPageSize(pageSize || 10);
      setLoading(false);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && data) {
      setList([]);
      setPageNum(1);
      setTotal(0);
      setPageSize(10);
      loadData(1, false, 10);
    }
  }, [data, open]);

  const onChange = (page: number, pageSize: number) => {
    setList([]); // 清空列表，确保骨架屏显示
    setPageNum(page);
    setPageSize(pageSize);
    loadData(page, false, pageSize);
  };
  return (
    <Modal
      style={{
        minWidth: 'calc(100vw - 48px)',
        height: 'calc(100vh - 132px)',
        top: '24px',
      }}
      title={
        <div className={style.reviewDetailModalTitle}>
          {$t("global-1688-ai-app.select-product.ImproveComponents.ImproveDetailModal.d", `${sentimentTypeName}点：${reviewTag}`, [sentimentTypeName, reviewTag])} 
          {/* <span className="text-gray-500 text-sm">{$t("global-1688-ai-app.select-product.ImproveComponents.ImproveDetailModal.t", `(${reviewCnt})条`, [reviewCnt])}</span> */}
          {loading && (
            <div className={style.reviewDetailModalTitleLoading}>
              <img className={style.reviewDetailModalTitleLoadingImg} src="https://img.alicdn.com/imgextra/i3/O1CN01Yu0qef1F81lqaUqSH_!!6000000000441-54-tps-244-180.apng" alt="" srcSet="" />
              <div className={style.reviewDetailModalTitleLoadingText}>{$t("global-1688-ai-app.select-product.ImproveComponents.ImproveDetailModal.AIznfyz", "AI智能翻译中")}
                <span className={style.loadingDots}>
                  <span className={style.dot}>.</span>
                  <span className={style.dot}>.</span>
                  <span className={style.dot}>.</span>
                </span>
              </div>
            </div>
          )}
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      className={style.reviewDetailModalContentContainer}
    >
      <div
        ref={scrollRef}
        style={{ height: 'calc(100vh - 200px)', overflow: 'auto' }}
      >
        <Table
          columns={loading ? skeletonColumns : columns}
          dataSource={loading ? generateSkeletonData(8) : list}
          pagination={false}
          loading={false}
        />
      </div>
      <PaginationComponent 
        key={open ? 'open' : 'closed'} 
        current={pageNum} 
        pageSize={pageSize} 
        total={total} 
        onChange={onChange} 
      />
    </Modal>
  );
};