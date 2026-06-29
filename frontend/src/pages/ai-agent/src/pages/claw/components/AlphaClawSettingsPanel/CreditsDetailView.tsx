import React from 'react';
import type { TypeCreditsRecord } from './types';
import styles from './index.module.scss';

const ICON_BACK = 'https://img.alicdn.com/imgextra/i1/6000000003559/O1CN01PF8Qhz1cA4iztC8Da_!!6000000003559-2-gg_dtc.png';
const ICON_PAGINATION_LEFT = 'https://img.alicdn.com/imgextra/i2/6000000004874/O1CN01rXHmul1lsLYFjnRyS_!!6000000004874-2-gg_dtc.png';
const ICON_PAGINATION_RIGHT = 'https://img.alicdn.com/imgextra/i3/6000000004123/O1CN01Cd4HBV1gKO6dcp4wF_!!6000000004123-2-gg_dtc.png';

export interface TypeCreditsDetailViewProps {
  creditsList: TypeCreditsRecord[];
  creditsPage: number;
  creditsTotalPages: number;
  onPageChange: (page: number) => void;
  onBack: () => void;
}

const CreditsDetailView: React.FC<TypeCreditsDetailViewProps> = ({
  creditsList,
  creditsPage = 1,
  creditsTotalPages = 1,
  onPageChange,
  onBack,
}) => {
  const list = creditsList ?? [];
  const page = creditsPage ?? 1;
  const totalPages = creditsTotalPages ?? 1;
  return (
  <div className={styles.creditsDetailWrap}>
    <div
      className={styles.creditsDetailHeader}
      role="button"
      tabIndex={0}
      onClick={onBack}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onBack()}
    >
      <img className={styles.creditsDetailBackIcon} src={ICON_BACK} alt="返回" />
      <span className={styles.creditsDetailTitle}>积分消耗</span>
    </div>
    <div className={styles.creditsTableWrap}>
      <div className={styles.creditsTableHeader}>
        <div className={styles.creditsTableHeaderCell}>调用时间</div>
        <div className={styles.creditsTableHeaderCell}>消耗积分数量</div>
      </div>
      <div className={styles.creditsTableBody}>
        {list.map((row, i) => (
          <div key={row?.callTime != null ? `${row.callTime}-${i}` : i} className={styles.creditsTableRow}>
            <div className={styles.creditsTableCell}>{row?.callTime ?? ''}</div>
            <div className={styles.creditsTableCell}>{row?.amount ?? 0}</div>
          </div>
        ))}
      </div>
    </div>
    <div className={styles.creditsPagination}>
      <img
        className={styles.creditsPaginationArrow}
        src={ICON_PAGINATION_LEFT}
        alt="上一页"
        role="button"
        tabIndex={0}
        onClick={() => onPageChange(Math.max(1, page - 1))}
        onKeyDown={(e) =>
          (e.key === 'Enter' || e.key === ' ') && onPageChange(Math.max(1, page - 1))
        }
      />
      <div
        className={`${styles.creditsPaginationPage} ${page === 1 ? styles.creditsPaginationPageActive : ''}`}
        role="button"
        tabIndex={0}
        onClick={() => onPageChange(1)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onPageChange(1)}
      >
        1
      </div>
      {[2, 3, 4, 5].map((n) => (
        <div
          key={n}
          className={`${styles.creditsPaginationPage} ${page === n ? styles.creditsPaginationPageActive : ''}`}
          role="button"
          tabIndex={0}
          onClick={() => onPageChange(n)}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onPageChange(n)}
        >
          {n}
        </div>
      ))}
      <div className={styles.creditsPaginationEllipsis}>...</div>
      <div
        className={`${styles.creditsPaginationPage} ${page === totalPages ? styles.creditsPaginationPageActive : ''}`}
        role="button"
        tabIndex={0}
        onClick={() => onPageChange(totalPages)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onPageChange(totalPages)}
      >
        {totalPages}
      </div>
      <img
        className={styles.creditsPaginationArrow}
        src={ICON_PAGINATION_RIGHT}
        alt="下一页"
        role="button"
        tabIndex={0}
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        onKeyDown={(e) =>
          (e.key === 'Enter' || e.key === ' ') &&
          onPageChange(Math.min(totalPages, page + 1))
        }
      />
    </div>
  </div>
  );
};

export default CreditsDetailView;
