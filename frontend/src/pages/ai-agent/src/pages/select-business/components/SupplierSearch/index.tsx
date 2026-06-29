import styles from './index.module.scss';
import { $t } from '@/i18n';
import { useState, useMemo } from 'react';
import { SortUpIcon, SortDownIcon, DownArrowIcon } from '@/components/Icon';
import { Popover, Input } from 'antd';

export interface TypeFilterItem {
  field: string;
  compareType: 'EQ' | 'GT';
  value: string;
}

interface TypeFilterOption {
  key: string;
  field: string;
  label: string;
  type: 'simple' | 'dropdown' | 'input';
  options?: { key: string; label: string; field: string }[];
  inputConfig?: { inputPrefix: string; prefix: string; suffix: string; placeholder: string };
}

interface TypeSortOption {
  key: string;
  label: string;
  type: 'simple' | 'toggle';
  toggleLabels?: { ASC: string; DESC: string };
  firstOrder?: 'ASC' | 'DESC';
}

interface TypeSupplierSearchProps {
  filterOptions?: TypeFilterOption[];
  sortOptions?: TypeSortOption[];
  onFilterChange?: (filters: TypeFilterItem[], isReset?: boolean) => void;
  onSortChange?: (sort: { field: string; order?: 'ASC' | 'DESC' | null } | null) => void;
  type?: string;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

const defaultFilterOptions: TypeFilterOption[] = [
  { key: 'sourceFactory', field: 'SOURCE_FACTORY', label: $t('global-1688-ai-app.select-business.ImageSearchTable.ytgc', '源头工厂'), type: 'simple' },
  { 
    key: 'merchantFeature', 
    field: '',
    label: $t('global-1688-ai-app.select-business.SupplierSearch.sjtz', '商家特色'), 
    type: 'dropdown',
    options: [
      { key: 'superFactory', field: 'SUPER_FACTORY', label: $t('global-1688-ai-app.select-business.ProductSearchTable.cjgc', '超级工厂') },
      { key: 'strongMerchant', field: 'POWER_FACTORY', label: $t('global-1688-ai-app.select-business.SupplierSearch.ssjs', '实力商家') }
    ]
  },
  { 
    key: 'trustYear', 
    field: 'TP',
    label: $t('global-1688-ai-app.select-business.SupplierSearch.cxstn', '诚信通年限'), 
    type: 'input',
    inputConfig: {
      inputPrefix: $t('global-1688-ai-app.select-business.SupplierSearch.dyjg', '大于'),
      prefix: $t('global-1688-ai-app.select-business.SupplierSearch.cttdyg', '诚信通大于'),
      suffix: $t('global-1688-ai-app.select-business.SupplierSearch.nian', '年'),
      placeholder: $t('global-1688-ai-app.inquiry.InquiryReport.autoOrderInfoSchema.quantity', '数量') }
  }
];

const defaultSortOptions: TypeSortOption[] = [
  { key: 'XYL', label: $t('global-1688-ai-app.select-business.SupplierSearch.gkfxyll', '高客服响应率'), type: 'simple' },
  { key: 'FWF', label: $t('global-1688-ai-app.select-business.SupplierSearch.gzzfhf', '高综合服务分'), type: 'simple' },
  { key: 'HTL', label: $t('global-1688-ai-app.select-business.SupplierSearch.gthhl', '高回头率'), type: 'simple' },
  {
    key: 'XL',
    label: $t('global-1688-ai-app.select-business.SupplierSearch.xlyl', '按销量'),
    type: 'toggle',
    toggleLabels: {
      ASC: $t('global-1688-ai-app.select-business.SupplierSearch.xlylcdgd', '销量从低到高'),
      DESC: $t('global-1688-ai-app.select-business.SupplierSearch.xlylcdg', '销量从高到低')
    },
    firstOrder: 'DESC'
  },
  {
    key: 'PRICE',
    label: $t('global-1688-ai-app.select-business.SupplierSearch.apjg', '按价格'),
    type: 'toggle',
    toggleLabels: {
      ASC: $t('global-1688-ai-app.select-business.SupplierSearch.jgcdgd', '价格从低到高'),
      DESC: $t('global-1688-ai-app.select-business.SupplierSearch.jgcdg', '价格从高到低')
    },
    firstOrder: 'ASC'
  }
];

const SupplierSearch = ({
  filterOptions = defaultFilterOptions,
  sortOptions = defaultSortOptions,
  onFilterChange,
  onSortChange,
  type,
  expanded: controlledExpanded,
  onExpandedChange
}: TypeSupplierSearchProps) => {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const expanded = controlledExpanded ?? internalExpanded;
  const setExpanded = (val: boolean) => {
    setInternalExpanded(val);
    onExpandedChange?.(val);
  };
  const [simpleFilters, setSimpleFilters] = useState<Set<string>>(new Set());
  const [dropdownValues, setDropdownValues] = useState<Record<string, string>>({});
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [openPopovers, setOpenPopovers] = useState<Record<string, boolean>>({});
  const [activeSort, setActiveSort] = useState<string | null>(null);
  const [toggleSortStates, setToggleSortStates] = useState<Record<string, number>>({});

  const hasActiveFilters = useMemo(() => {
    return simpleFilters.size > 0 || 
           Object.values(dropdownValues).some(v => v) || 
           Object.values(inputValues).some(v => v) ||
           activeSort !== null ||
           Object.values(toggleSortStates).some(v => v !== 0);
  }, [simpleFilters, dropdownValues, inputValues, activeSort, toggleSortStates]);

  const buildFilterData = (
    simple: Set<string>,
    dropdown: Record<string, string>,
    input: Record<string, string>
  ): TypeFilterItem[] => {
    const result: TypeFilterItem[] = [];
    simple.forEach(key => {
      const opt = filterOptions.find(f => f.key === key);
      if (opt?.field) {
        result.push({ field: opt.field, compareType: 'EQ', value: 'Y' });
      }
    });
    Object.entries(dropdown).forEach(([key, val]) => {
      if (!val) return;
      const opt = filterOptions.find(f => f.key === key);
      const selected = opt?.options?.find(o => o.key === val);
      if (selected?.field) {
        result.push({ field: selected.field, compareType: 'EQ', value: 'Y' });
      }
    });
    Object.entries(input).forEach(([key, val]) => {
      if (!val) return;
      const opt = filterOptions.find(f => f.key === key);
      if (opt?.field) {
        result.push({ field: opt.field, compareType: 'GT', value: val });
      }
    });
    return result;
  };

  const handleReset = () => {
    setSimpleFilters(new Set());
    setDropdownValues({});
    setInputValues({});
    setActiveSort(null);
    setToggleSortStates({});
    onFilterChange?.([], true);
  };

  const toggleSimpleFilter = (key: string) => {
    setSimpleFilters(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      onFilterChange?.(buildFilterData(next, dropdownValues, inputValues));
      return next;
    });
  };

  const handleDropdownSelect = (filterKey: string, optionKey: string) => {
    setDropdownValues(prev => {
      const next = { ...prev, [filterKey]: prev[filterKey] === optionKey ? '' : optionKey };
      onFilterChange?.(buildFilterData(simpleFilters, next, inputValues));
      return next;
    });
    setOpenPopovers(prev => ({ ...prev, [filterKey]: false }));
  };

  const handleInputChange = (key: string, value: string) => {
    setInputValues(prev => ({ ...prev, [key]: value }));
  };

  const handleInputConfirm = (key: string) => {
    setOpenPopovers(prev => ({ ...prev, [key]: false }));
    onFilterChange?.(buildFilterData(simpleFilters, dropdownValues, inputValues));
  };

  const clearAllSorts = () => {
    setActiveSort(null);
    setToggleSortStates({});
  };

  const handleSimpleSortClick = (key: string) => {
    clearAllSorts();
    if (activeSort !== key) {
      setActiveSort(key);
      onSortChange?.({ field: key, order: "DESC" });
    } else {
      onSortChange?.(null);
    }
  };

  const handleToggleSortClick = (option: TypeSortOption) => {
    const currentState = toggleSortStates[option.key] || 0;
    const nextState = (currentState + 1) % 3;
    clearAllSorts();
    setToggleSortStates({ [option.key]: nextState });
    const firstOrder = option.firstOrder || 'DESC';
    const secondOrder = firstOrder === 'DESC' ? 'ASC' : 'DESC';
    if (nextState === 1) onSortChange?.({ field: option.key, order: firstOrder });
    else if (nextState === 2) onSortChange?.({ field: option.key, order: secondOrder });
    else onSortChange?.(null);
  };

  const renderFilterItem = (option: TypeFilterOption) => {
    if (option.type === 'simple') {
      const isActive = simpleFilters.has(option.key);
      return (
        <div 
          key={option.key}
          className={`${styles.supplierSearchItem} ${isActive ? styles.supplierSearchItemActive : ''}`}
          onClick={() => toggleSimpleFilter(option.key)}
        >
          {option.label}
        </div>
      );
    }

    if (option.type === 'dropdown') {
      const selectedValue = dropdownValues[option.key];
      const selectedOption = option.options?.find(o => o.key === selectedValue);
      const isOpen = openPopovers[option.key];
      const content = (
        <div className={styles.itemPopoverContent}>
          {option.options?.map(opt => (
            <div 
              key={opt.key}
              className={`${styles.itemPopoverContentItem} ${selectedValue === opt.key ? styles.itemPopoverContentItemActive : ''}`}
              onClick={() => handleDropdownSelect(option.key, opt.key)}
            >
              {opt.label}
            </div>
          ))}
        </div>
      );
      // 选完超级工厂或者实力商家，点击按钮恢复为商家特色
      const onDropdownClick = () => {
        if (selectedValue === 'superFactory' || selectedValue === 'strongMerchant') {
          setDropdownValues(prev => ({ ...prev, [option.key]: '' }));
          onFilterChange?.([], true);
        }
      };
      return (
        <Popover
          key={option.key}
          placement="bottom"
          content={content}
          rootClassName={`${styles.popover} ${styles.itemPopover}`}
          align={{ offset: [0, 7] }}
          open={isOpen}
          onOpenChange={(open) => setOpenPopovers(prev => ({ ...prev, [option.key]: open }))}
        >
          <div onClick={onDropdownClick} className={`${styles.supplierSearchItem} ${styles.merchant_features} ${selectedValue ? styles.merchantSelected : ''} ${isOpen ? styles.arrowRotated : ''}`}>
            <div>{selectedOption?.label || option.label}</div>
            <DownArrowIcon/>
          </div>
        </Popover>
      );
    }

    if (option.type === 'input') {
      const value = inputValues[option.key] || '';
      const isOpen = openPopovers[option.key];
      const config = option.inputConfig!;
      const content = (
        <div className={styles.yearContent}>
          <div>{config.inputPrefix}</div>
          <Input 
            placeholder={config.placeholder}
            className={styles.yearNum}
            value={value}
            onChange={(e) => handleInputChange(option.key, e.target.value.replace(/\D/g, ''))}
            onPressEnter={() => handleInputConfirm(option.key)}
          />
          <div>{config.suffix}</div>
        </div>
      );
      const onInputClick = () => {
        if (value) {
          setInputValues(prev => ({ ...prev, [option.key]: '' }));
          onFilterChange?.([], true);
        }
      };
      return (
        <Popover
          key={option.key}
          placement="bottom"
          content={content}
          rootClassName={`${styles.popover} ${styles.yearPopover}`}
          align={{ offset: [0, 7] }}
          open={isOpen}
          onOpenChange={(open) => {
            setOpenPopovers(prev => ({ ...prev, [option.key]: open }));
            if (!open) {
              onFilterChange?.(buildFilterData(simpleFilters, dropdownValues, inputValues));
            }
          }}
        >
          <div onClick={onInputClick} className={`${styles.supplierSearchItem} ${styles.merchant_features} ${value ? styles.yearSelected : ''} ${isOpen ? styles.arrowRotated : ''}`}>
            <div>
              {value ? `${config.prefix}${value}${config.suffix}` : option.label}
            </div>
            <DownArrowIcon/>
          </div>
        </Popover>
      );
    }
    return null;
  };

  const renderSortItem = (option: TypeSortOption) => {
    if (option.type === 'simple') {
      const isActive = activeSort === option.key;
      return (
        <div 
          key={option.key}
          className={`${styles.supplierSearchItem} ${isActive ? styles.supplierSearchItemActive : ''}`}
          onClick={() => handleSimpleSortClick(option.key)}
        >
          {option.label}
        </div>
      );
    }

    if (option.type === 'toggle') {
      const state = toggleSortStates[option.key] || 0;
      const labels = option.toggleLabels!;
      const firstOrder = option.firstOrder || 'DESC';
      let label = option.label;
      let isDesc = false;
      if (state === 1) {
        label = firstOrder === 'DESC' ? labels.DESC : labels.ASC;
        isDesc = firstOrder === 'DESC';
      } else if (state === 2) {
        label = firstOrder === 'DESC' ? labels.ASC : labels.DESC;
        isDesc = firstOrder !== 'DESC';
      }
      return (
        <div 
          key={option.key}
          className={`${styles.supplierSearchItem} ${state !== 0 ? styles.supplierSearchItemActive : ''}`}
          onClick={() => handleToggleSortClick(option)}
        >
          <div>{label}</div>
          {state !== 0 && (isDesc ? <SortDownIcon /> : <SortUpIcon />)}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.supplierSearch}>
      <div className={styles.supplierSearchHeader}>
        <div className={styles.supplierRecommendTitle}>
          {$t("global-1688-ai-app.select-business.SupplierSearchTable.gcn", "供应商推荐")}
        </div>
        <div className={styles.supplierSearchRight}>
          {hasActiveFilters && (
            <>
              <div className={styles.supplierSearchReset} onClick={handleReset}>
                {$t("global-1688-ai-app.select-business.SupplierSearchTable.zzch", "重置")}
              </div>
              <div className={styles.divider}/>
            </>
          )}
          <div className={styles.supplierSearchSort} onClick={() => setExpanded(!expanded)}>
            <div className={styles.supplierSearchSortText}>
              {expanded 
                ? $t("global-1688-ai-app.select-business.SupplierSearchTable.sqps", "收起筛选及排序")
                : $t("global-1688-ai-app.select-business.SupplierSearchTable.zkps", "展开筛选及排序")
              }
            </div>
            <DownArrowIcon className={expanded ? styles.arrowUp : ''} />
          </div>
        </div>
      </div>
      <div className={`${styles.supplierSearchContent} ${expanded ? styles.contentExpanded : styles.contentCollapsed}`}>
          <div className={styles.supplierSearchFilter}>
            <div className={styles.supplierSearchFilterText}>
              {$t('global-1688-ai-app.select-business.SupplierSearch.sxfl', '筛选')}
            </div>
            <div className={styles.supplierSearchList}>
              {filterOptions.map(renderFilterItem)}
            </div>
          </div>
          <div className={styles.supplierSearchFilter}>
            <div className={styles.supplierSearchFilterText}>
              {$t('global-1688-ai-app.select-business.SupplierSearch.ppxz', '排序')}
            </div>
            <div className={styles.supplierSearchList}>
            {sortOptions
              .filter(opt => type !== 'direct_search' || (opt.key !== 'XL' && opt.key !== 'PRICE'))
              .map(renderSortItem)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierSearch;
