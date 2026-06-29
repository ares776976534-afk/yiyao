import styles from './sortOptions.module.scss';
import { SortArrowIcon } from '@/components/Icon';

function normalizeSupport(supportSortType: string[] | undefined): ('ASC' | 'DESC')[] {
  if (!Array.isArray(supportSortType)) return [];
  return supportSortType
    .map((t) => String(t).toUpperCase())
    .filter((t): t is 'ASC' | 'DESC' => t === 'ASC' || t === 'DESC');
}

interface SortOptionsProps {
  sortOptions: any[];
  sortKey: string;
  sortType: 'ASC' | 'DESC';
  onSortSelect: (sortField: string, sortType: 'ASC' | 'DESC') => void;
}
const SortOptions = ({
  sortOptions,
  sortKey,
  sortType,
  onSortSelect,
}: SortOptionsProps) => {
  return (
    <div className={styles.sortOptions}>
      {sortOptions.map(({ label, code, supportSortType }) => {
        const types = normalizeSupport(supportSortType);
        const hasAsc = types.includes('ASC');
        const hasDesc = types.includes('DESC');
        const showArrowUi = hasAsc && hasDesc;
        const isAscActive = sortKey === code && sortType === 'ASC';
        const isDescActive = sortKey === code && sortType === 'DESC';
        return (
          <div
            key={code}
            className={`${styles.sortItem} ${sortKey === code ? styles.sortItemActive : ''}`}
            onClick={() => {
              if (types.length === 1) {
                // 只支持单向排序：点击激活，再点击取消
                if (sortKey === code) {
                  onSortSelect('', 'ASC'); // 取消排序
                } else {
                  onSortSelect(code, types[0]);
                }
              } else if (showArrowUi) {
                if (sortKey === code) {
                  if (sortType === 'DESC') {
                    onSortSelect(code, 'ASC');
                  } else if (sortType === 'ASC') {
                    onSortSelect('', 'ASC');
                  }
                } else {
                  onSortSelect(code, 'DESC');
                }
              } else {
                onSortSelect(code, 'ASC');
              }
            }}
          >
            {label}
            {sortKey === code && showArrowUi && (
              <div className={styles.sortArrows}>
                <SortArrowIcon sortUpArrowfill={isAscActive ? "#6E50FF" : "#BBBDCA"} downArrowfill={isDescActive ? "#6E50FF" : "#BBBDCA"} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SortOptions;
