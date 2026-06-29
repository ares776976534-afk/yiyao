/**
 * 找商表格组件 (SupplierSearchTable)
 * 用于展示供应商搜索结果的对比表格
 */

import React, { useState, useRef, useEffect } from 'react';
import { Popover, Table, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { type TypeSupplierData, type TypeSupplierSearchTableProps } from './types';
// import { EnumTagStyle } from '../../enum';
import styles from './index.module.scss';
// import mockSupplierSearchTableProps from './mock';
import Badges from '../Badges';
import { CloseIcon } from '@/components/Icons';
import { Checkmark2Icon, DownArrowIcon, EyeIcon, Start2Icon, ReportIcon } from '@/components/Icon';
import classNames from 'classnames';
import TableEmpty from '../TableEmpty';
import DemandAnalysisPopover from '../DemandAnalysisPopover';
import { $t } from '@/i18n';
import useToast from '@/components/Toast';
import jumpTo from '@/utils/jumpTo';
import SupplierSearch from '../SupplierSearch';
import { TypeFilterItem } from '../SupplierSearch';
import { resultProcess } from '../ProductSearchTable/services';

// 供应商标签展开限制
const DISPLAY_LIMIT = 3;
// 最大选择数量
const MAX_SELECTION_COUNT = 6;
const ProviderKjCustomTagsCell: React.FC<{
  providerKjCustomTags: string[];
}> = ({ providerKjCustomTags }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const shouldShowExpandButton = (providerKjCustomTags || []).length > DISPLAY_LIMIT;
  const displayItems = isExpanded ? (providerKjCustomTags || []) : (providerKjCustomTags || []).slice(0, DISPLAY_LIMIT);

  return (
    <div className={classNames(styles.providerKjCustomTags)}>
      <div className={styles.providerKjAttributesList}>
        {(displayItems || []).map((item) => (
          <div key={item} className={styles.providerKjCustomTagsItem}>
            <span className={styles.providerKjCustomTagsText}>{item || ''}</span>
          </div>
        ))}
      </div>
      {shouldShowExpandButton && (
        <div
          className={classNames(styles.expandButton, {
            [styles.open]: isExpanded,
          })}
          onClick={(event) => {
            event.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          <span className={styles.buttonText}>
            {isExpanded ? $t("global-1688-ai-app.select-business.SupplierSearchTable.zd", "折叠") : $t("global-1688-ai-app.select-business.SupplierSearchTable.zkqb", "展开全部")}
          </span>
          <span className={styles.rightIcon}>
            <DownArrowIcon width={12} height={12} fill="#6150FF" />
          </span>
        </div>
      )}
    </div>
  );
};


const SupplierSearchTable: React.FC<TypeSupplierSearchTableProps> = ({
  rawData,
  loading = false,
  pagination = false,
  onRowClick,
  onProductClick,
  isReplay,
}) => {
  const toast = useToast();
  const aiRequirementAnalysis = rawData?.providerInfo?.aiRequirementAnalysis || {};
  const supplierSearchRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [supplierSearchHeight, setSupplierSearchHeight] = useState(36);
  const [currentFilters, setCurrentFilters] = useState<TypeFilterItem[]>([]);
  const [currentSort, setCurrentSort] = useState<{ field: string; order?: 'ASC' | 'DESC' | null } | null>(null);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const expandedJustChanged = useRef(false);

  const handleExpandedChange = (val: boolean) => {
    expandedJustChanged.current = true;
    setSearchExpanded(val);
    setSupplierSearchHeight(val ? 123 : 36);
    setTimeout(() => {
      expandedJustChanged.current = false;
    }, 300);
  };

  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;
    const handleScroll = () => {
      if (expandedJustChanged.current) return;
      if (searchExpanded) {
        setSearchExpanded(false);
        setSupplierSearchHeight(36);
      }
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [searchExpanded]);
  // CreateInquiryModal 是否显示
  const [createInquiryMode, setCreateInquiryMode] = useState(false);
  const [checkedRowKeys, setCheckedRowKeys] = useState<React.Key[]>([]); // 选中的行
  const [dataSource, setDataSource] = useState<TypeSupplierData[]>([]);
  useEffect(() => {
    if (rawData) {
      setDataSource(rawData?.providerInfo?.providerList || []);
    }
  }, [rawData]);
  // 定义表格列
  const columns: ColumnsType<TypeSupplierData> = [
    {
      title: $t("global-1688-ai-app.select-business.SupplierSearchTable.gft", "供应商信息"),
      dataIndex: 'supplierInfo',
      key: 'supplierInfo',
      width: 200,
      align: 'left',
      fixed: 'left',
      render: (_, record) => (
        <div
          className={styles.supplierInfo}
        >
          <div
            onClick={() => {
              if (record?.factoryUrl) {
                window.open(record?.factoryUrl, '_blank');
              }
            }}
            className={styles.companyName}
          >{record?.companyName || ''}</div>
          <div className={styles.supplierBadges}>
            {(record?.providerTags || [])
              .map((tag, index) => (
                <React.Fragment key={index}>
                  <Badges tagStyle={tag.tagStyle} tagName={tag.tagName} />
                </React.Fragment>
              ))}
          </div>
          {createInquiryMode && checkedRowKeys.includes(getRowKey(record)) && record?.isLowRespRate && (
            <div className={styles.supplierReportIcon}>
              <ReportIcon />
              <div className={styles.supplierReportText}>
                {$t('global-1688-ai-app.select-business.ProductSearchTable.supplierReportText', '该供应商客服响应率较低，请谨慎选择')}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      title: (
        <div className={styles.aiHeader}>
          <span className={styles.aiIcon}><Start2Icon /></span>
          <span className={styles.aiText}>{$t("global-1688-ai-app.select-business.SupplierSearchTable.AIzl", "AI总览")}</span>
        </div>
      ),
      dataIndex: 'aiSummary',
      key: 'aiSummary',
      align: 'left',
      width: 200,
      render: (_, record) => (
        <div className={styles.aiSummary}>
          {(record?.aiAttentions || []).map((item, index) => (
            <div key={index} className={styles.aiSummaryItem}>
              {item || ''}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: $t("global-1688-ai-app.select-business.SupplierSearchTable.uqq", "用户需求解析&满足情况"),
      dataIndex: 'demandAnalysis',
      key: 'demandAnalysis',
      align: 'left',
      width: 200,
      render: (_, record) => (
        <div className={styles.demandAnalysis}>
          <div className={styles.demandAnalysisList}>
            {(record?.satisfyRequirements || []).map((item, index) => (
              <div key={index} className={styles.demandItem}>
                <div className={classNames(styles.demandIcon, {
                  [styles.isSatisfy]: item.isSatisfy,
                })}
                >
                  {
                    item.isSatisfy ? (
                      <Checkmark2Icon />
                    ) : (
                      <CloseIcon />
                    )
                  }
                </div>
                <span className={styles.demandText}>{item?.requirement || ''}</span>
              </div>
            ))}
          </div>
          <Popover
            content={<DemandAnalysisPopover items={record?.satisfyRequirements || []} />}
            trigger="hover"
            placement="bottomLeft"
            // classNames={{
            //   root: styles.demandAnalysisPopoverRoot,
            // }}
            arrow={false}
            overlayClassName={styles.demandAnalysisPopover}
          >
            <div className={styles.eyeIcon}>
              <EyeIcon width={12} height={12} fill="currentColor" />
            </div>
          </Popover>
        </div>
      ),
    },
    {
      title: $t("global-1688-ai-app.select-business.SupplierSearchTable.kjjdznl", "跨境及定制能力"),
      dataIndex: 'providerKjCustomTags',
      key: 'providerKjCustomTags',
      width: 200,
      align: 'left',
      render: (_, record) => (
        <ProviderKjCustomTagsCell providerKjCustomTags={record?.providerKjCustomTags || []} />
      ),
    },
    {
      title: $t("global-1688-ai-app.select-business.SupplierSearchTable.zylm", "主营类目"),
      dataIndex: 'mainCategory',
      key: 'mainCategory',
      width: 240,
      align: 'left',
      render: (_, record) => (
        <div className={styles.mainCategory}>{record?.mainCategoryName || ''}</div>
      ),
    },
    {
      title: $t("global-1688-ai-app.select-business.SupplierSearchTable.merchantService", "商家服务"),
      dataIndex: 'merchantService',
      key: 'merchantService',
      minWidth: 512,
      align: 'center',
      render: (_, record) => (
        <div className={styles.merchantService}>
          {(record?.providerServices || []).map((item, index) => (
            <div key={index} className={styles.serviceItem}>
              <span className={styles.serviceValue}>{item?.value || ''}</span>
              <span className={styles.serviceLabel}>{item?.label || ''}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: $t("global-1688-ai-app.select-business.SupplierSearchTable.recommendProduct", "推荐商品"),
      dataIndex: 'recommendedProducts',
      key: 'recommendedProducts',
      width: 300,
      align: 'center',
      render: (_, record) => (
        <div className={styles.recommendedProducts}>
          {(record?.recommendItems || []).slice(0, 3).map((product) => (
            <div
              key={product.itemId}
              className={styles.productCard}
            >
              {product?.imageUrl && (
                <img
                  onClick={(e) => {
                    e.stopPropagation();
                    // onProductClick?.(product, record);
                    if (product?.offerDetailUrl) {
                      window.open(product?.offerDetailUrl, '_blank');
                    }
                  }}
                  src={product.imageUrl}
                  alt={product.title}
                  className={styles.productImage}
                />
              )}
              <div className={styles.productInfo}>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    // onProductClick?.(product, record);
                    if (product?.offerDetailUrl) {
                      window.open(product?.offerDetailUrl, '_blank');
                    }
                  }}
                  className={styles.productTitle}
                >{product?.title || ''}</div>
                <div className={styles.productPrice}>¥{product?.itemPrice || ''}</div>
              </div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  // 计算表格最小宽度：从 columns 配置中获取所有列宽度之和
  const baseTableWidth = columns.filter((column) => {
    if (aiRequirementAnalysis?.isDisplay) {
      return true;
    }
    return column?.key !== 'demandAnalysis';
  }).reduce((total, column) => {
    // 优先使用 width，如果没有则使用 minWidth
    const columnWidth = (column.width as number) || (column.minWidth as number) || 0;
    return total + columnWidth;
  }, 0);

  // 复选框列宽度
  const checkboxColumnWidth = 40;
  const tableScrollX = createInquiryMode ? baseTableWidth + checkboxColumnWidth : 'max-content';

  // 获取行的唯一标识（优先使用 memberId，否则使用 loginId）
  const getRowKey = (record: TypeSupplierData) => {
    return record?.memberId || record?.loginId || '';
  };
  const fetchResultProcess = (filters: TypeFilterItem[], sort: { field: string; order?: 'ASC' | 'DESC' | null } | null) => {
    if (filters?.length === 0 && !sort) {
      setDataSource(rawData?.providerInfo?.providerList || []);
      return;
    }
    resultProcess({
      processParam: {
        filterList: filters,
        sort: sort || undefined
      },
      data: rawData,
    }).then((res) => {
      setDataSource(res?.result?.providerInfo?.providerList || []);
    });
  };

  const onFilterChange = (filters: TypeFilterItem[], isReset?: boolean) => {
    setCurrentFilters(filters);
    if (isReset) {
      setCurrentSort(null);
      fetchResultProcess(filters, null);
    } else {
      fetchResultProcess(filters, currentSort);
    }
  };

  const onSortChange = (sort: { field: string; order?: 'ASC' | 'DESC' | null } | null) => {
    setCurrentSort(sort);
    fetchResultProcess(currentFilters, sort);
  };
  return (
    <div className={styles.supplierSearchTable}>
      <div ref={contentRef} className={styles.supplierSearchContent}>
        {
          aiRequirementAnalysis?.isDisplay && (
            <>
              <div className={styles.supplierRecommendTitle}>AI 需求分析</div>
              <div className={styles.supplierRecommendContent}>
                <span>解析到您的需求为：</span>
                {
                  aiRequirementAnalysis?.requirements?.map((item, index) => (
                    <span key={index} style={{ color: '#6150FF', marginRight: '8px' }}>#{item}</span>
                  ))
                }
                。本次为您推荐&nbsp;
                <span>{aiRequirementAnalysis?.total || '0'}</span>&nbsp;个商家，其中&nbsp;
                <span style={{ color: '#21A84A' }}>{aiRequirementAnalysis?.fullSatisfy || '0'}</span>&nbsp;个商家完全满足您的需求，&nbsp;
                <span style={{ color: '#F55353' }}>{aiRequirementAnalysis?.partSatisfy || '0'}</span>&nbsp;个商家部分满足您的需求。
              </div>
            </>
          )
        }
        <div ref={supplierSearchRef} className={styles.supplierSearchWrapper}>
          <SupplierSearch onFilterChange={onFilterChange} onSortChange={onSortChange} type='direct_search' expanded={searchExpanded} onExpandedChange={handleExpandedChange} />
        </div>
        {/* <div className={styles.supplierRecommendTitle}>{$t("global-1688-ai-app.select-business.SupplierSearchTable.gcn", "供应商推荐")}</div> */}
        <div className={styles.supplierRecommendTable}>
          <Table
            className={createInquiryMode ? styles.createInquiryModeTable : ''}
            rowSelection={createInquiryMode ? {
            selectedRowKeys: checkedRowKeys,
            hideSelectAll: true,
            columnWidth: checkboxColumnWidth,
            onChange: (selectedRowKeys) => {
              // 最多只允许选择指定数量
              if (selectedRowKeys.length <= MAX_SELECTION_COUNT) {
                setCheckedRowKeys(selectedRowKeys);
              }
            },
            getCheckboxProps: (record) => {
              const rowKey = getRowKey(record);
              const isDisabled = checkedRowKeys.length >= MAX_SELECTION_COUNT &&
                !checkedRowKeys.includes(rowKey);
              return {
                className: isDisabled ? 'checkbox-disabled-style' : '',
              };
            },
            onSelect: (record, selected) => {
              // 如果是尝试选中且已达上限，显示提示并阻止选择
              if (selected && checkedRowKeys.length >= MAX_SELECTION_COUNT) {
                toast.warning($t("global-1688-ai-app.select-business.SupplierSearchTable.zzert", `最多只能选择${MAX_SELECTION_COUNT}个供应商发起询盘`, [MAX_SELECTION_COUNT]));
                return false; // 阻止选择
              }
              return true;
            },
          } : undefined}
            columns={(columns || []).filter((column) => {
              if (aiRequirementAnalysis?.isDisplay) {
                return true;
              }
              return column?.key !== 'demandAnalysis';
            })}
            dataSource={dataSource}
            loading={loading}
            pagination={pagination}
            scroll={{
              x: tableScrollX,
            }}
            locale={{
              emptyText: <TableEmpty />,
            }}
            sticky={{ offsetHeader: supplierSearchHeight }}
            rowKey={getRowKey}
            onRow={(record) => ({
            onClick: () => {
              if (createInquiryMode) {
                const rowKey = getRowKey(record);
                if (checkedRowKeys.includes(rowKey)) {
                  setCheckedRowKeys((oldKeys) => {
                    return oldKeys.filter((key) => key !== rowKey);
                  });
                } else {
                  if (checkedRowKeys.length < MAX_SELECTION_COUNT) {
                    setCheckedRowKeys((oldKeys) => {
                      return [...oldKeys, rowKey];
                    });
                  } else {
                    toast.warning($t("global-1688-ai-app.select-business.SupplierSearchTable.zzert", `最多只能选择${MAX_SELECTION_COUNT}个供应商发起询盘`, [MAX_SELECTION_COUNT]));
                  }
                }
              }
              onRowClick?.(record);
            },
          })}
          />
        </div>
      </div>
      {
        isReplay ? null
          : <div className={styles.supplierSearchBottom}>
            <Button
              className={classNames(styles.cancelButton, {
                [styles.show]: createInquiryMode,
              })}
              onClick={() => {
                setCreateInquiryMode(false);
              }}
            >取消</Button>
            <Button
              onClick={() => {
                if (createInquiryMode) {
                  if (checkedRowKeys?.length) {
                    // 使用 memberId 作为参数，如果没有则使用 loginId
                    const memberIds = dataSource
                      .filter((record) => checkedRowKeys.includes(getRowKey(record)))
                      .map((record) => record?.memberId || record?.loginId || '')
                      .filter(Boolean)
                      .join(',');
                    jumpTo(`/inquiry?fromPage=ZS&memberIds=${memberIds}`);
                    setCreateInquiryMode(false);
                  } else {
                    toast.warning('请选择至少一个供应商');
                  }
                } else {
                  setCreateInquiryMode(true);
                }
              }}
              type="primary"
              className={styles.primaryButton}
            >
              <span className={classNames(styles.buttonText, {
                [styles.confirmMode]: createInquiryMode,
              })}
              >
                {createInquiryMode ? (
                  <span>确认发起 ({checkedRowKeys.length || 0}/{MAX_SELECTION_COUNT})</span>
                ) : '发起询盘'}
              </span>
            </Button>
          </div>
      }
    </div>
  );
};

export default SupplierSearchTable;

