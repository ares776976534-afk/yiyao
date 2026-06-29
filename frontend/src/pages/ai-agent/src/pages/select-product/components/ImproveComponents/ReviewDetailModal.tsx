import { Modal } from 'antd';
import { useCallback, useState, useEffect } from 'react';
import style from './reviewDetailModal.module.css';
import { $t } from '@/i18n';
import { SkeletonTable } from './SkeletonTable';
import { queryProductReviews } from '../../services';
const columns = [
  {
    title: $t("global-1688-ai-app.select-product.ImproveComponents.ReviewDetailModal.userID", "用户ID"),
    dataIndex: 'reviewUserNick',
    key: 'reviewUserNick',
    width: 200,
  },
  {
    title: $t("global-1688-ai-app.select-product.ImproveComponents.ReviewDetailModal.commentTime", "评论时间"),
    dataIndex: 'reviewTime',
    key: 'reviewTime',
    width: 200,
  },
  {
    title: $t("global-1688-ai-app.select-product.ImproveComponents.ReviewDetailModal.commentContent", "评论内容"),
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
    title: $t("global-1688-ai-app.select-product.ImproveComponents.ReviewDetailModal.userID", "用户ID"),
    dataIndex: 'reviewUserNick',
    key: 'reviewUserNick',
    width: 200,
    render: () => <div className={style.skeletonLine} style={{ height: '16px', width: '80%' }} />
  },
  {
    title: $t("global-1688-ai-app.select-product.ImproveComponents.ReviewDetailModal.commentTime", "评论时间"),
    dataIndex: 'reviewTime',
    key: 'reviewTime',
    width: 200,
    render: () => <div className={style.skeletonLine} style={{ height: '16px', width: '85%' }} />
  },
  {
    title: $t("global-1688-ai-app.select-product.ImproveComponents.ReviewDetailModal.commentContent", "评论内容"),
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
    reviewTime: '',
    reviewContent: ''
  }));
};
export const ReviewDetailModal = ({ open, onClose, data }: { open: boolean; onClose: () => void; data: any }) => {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<any[]>([]);
  const [pageNum, setPageNum] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  // 加载数据函数
  const loadData = useCallback(async (page: number, pageSize: number = 10) => {
    try {
      setLoading(true);
      const params = {
        ...data,
        pageNum: page,
        pageSize: pageSize || 10,
      };

      const res = await queryProductReviews(params);
      const newList = res?.reviewVOList || [];
      setList(newList);
      setTotal(res?.totalCount || 0);
      setPageNum(page);
      setPageSize(pageSize || 10);
      setLoading(false);
    } catch (error) {
      setList([]);
      setTotal(0);
      setLoading(false);
    }
  }, [data]);

  // 初始加载
  useEffect(() => {
    if (open && data) {
      setList([]);
      setPageNum(1);
      setTotal(0);
      loadData(1);
    }
  }, [open, data, loadData]);

  return (
    <Modal
      title={
        <div className={style.reviewDetailModalTitle}>
          <div className={style.reviewDetailModalTitleText}>{$t("global-1688-ai-app.select-product.ImproveComponents.ReviewDetailModal.viewComment", "查看评论")}</div>
          {loading && (
            <div className={style.reviewDetailModalTitleLoading}>
              <img className={style.reviewDetailModalTitleLoadingImg} src="https://img.alicdn.com/imgextra/i3/O1CN01Yu0qef1F81lqaUqSH_!!6000000000441-54-tps-244-180.apng" alt="" srcSet="" />
              <div className={style.reviewDetailModalTitleLoadingText}>{$t("global-1688-ai-app.select-product.ImproveComponents.ReviewDetailModal.AIznfyz", "AI智能翻译中")}
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
      style={{
        minWidth: 'calc(100vw - 48px)',
        height: 'calc(100vh - 132px)',
        top: '24px',
      }}
      className={style.reviewDetailModalContentContainer}
      centered
    >
      <SkeletonTable
        loading={loading}
        list={list}
        pageSize={pageSize}
        total={total}
        open={open}
        columns={columns}
        skeletonColumns={skeletonColumns}
        generateSkeletonData={generateSkeletonData}
        onPageChange={loadData}
        currentPage={pageNum}
      />
    </Modal>
  );
};