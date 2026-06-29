/**
 * 以品找商表格组件 (ProductSearchTable)
 * 用于展示以品找商搜索结果的商品对比表格
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button, Table, Popover } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { type TypeProductData, type TypeProductSearchTableProps } from './types';
import ConditionalTooltip from '../ConditionalTooltip';
import styles from './index.module.scss';
// import { mockProductSearchTableProps } from './mock';
import { Checkmark2Icon, DownArrowIcon, EyeIcon, Start2Icon, ReportIcon } from '@/components/Icon';
import Badges from '../Badges';
import classNames from 'classnames';
import { CloseIcon } from '@/components/Icons';
import useToast from '@/components/Toast';
import jumpTo from '@/utils/jumpTo';
import DemandAnalysisPopover from '../DemandAnalysisPopover';
import TableEmpty from '../TableEmpty';
import ImgDisplay from '@/components/ChatFlow/ImgDisplay';
import { $t } from '@/i18n';
import SupplierSearch from '../SupplierSearch';
import { TypeFilterItem } from '../SupplierSearch';
import { resultProcess } from './services';

// 最大选择数量
const MAX_SELECTION_COUNT = 6;
// 核心属性展开限制
const DISPLAY_LIMIT = 3;
// 跨境及定制能力展开限制
const PROVIDER_KJ_CUSTOM_TAGS_DISPLAY_LIMIT = 3;
// 核心属性单元格组件：支持展开/折叠功能
const CoreAttributesCell: React.FC<{
  coreAttributes: Array<{ label: string; value: string }>;
}> = ({ coreAttributes }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const shouldShowExpandButton = (coreAttributes || []).length > DISPLAY_LIMIT;
  const displayItems = isExpanded ? (coreAttributes || []) : (coreAttributes || []).slice(0, DISPLAY_LIMIT);

  return (
    <div className={classNames(styles.coreAttributes)}>
      <div className={styles.attributesList}>
        {(displayItems || []).map((item) => (
          <div key={item.label} className={styles.salesItem}>
            <span className={styles.salesLabel}>{item.label || ''}:</span>
            <ConditionalTooltip title={item.value || ''} placement="bottom">
              <span className={styles.salesValue}>{item.value || ''}</span>
            </ConditionalTooltip>
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
            {isExpanded ? $t("global-1688-ai-app.select-business.ProductSearchTable.zd", "折叠") : $t("global-1688-ai-app.select-business.ProductSearchTable.zkqb", "展开全部")}
          </span>
          <span className={styles.rightIcon}>
            <DownArrowIcon width={12} height={12} fill="#6150FF" />
          </span>
          {/* <img
            src={BUTTON_RIGHT_ICON}
            alt="展开"
            className={styles.rightIcon}
          /> */}
        </div>
      )}
    </div>
  );
};

const ProviderKjCustomTagsCell: React.FC<{
  providerKjCustomTags: string[];
}> = ({ providerKjCustomTags }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const shouldShowExpandButton = (providerKjCustomTags || []).length > PROVIDER_KJ_CUSTOM_TAGS_DISPLAY_LIMIT;
  const displayItems = isExpanded ? (providerKjCustomTags || [])
    : (providerKjCustomTags || []).slice(0, PROVIDER_KJ_CUSTOM_TAGS_DISPLAY_LIMIT);

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
            {isExpanded ? $t("global-1688-ai-app.select-business.ProductSearchTable.zd", "折叠") : $t("global-1688-ai-app.select-business.ProductSearchTable.zkqb", "展开全部")}
          </span>
          <span className={styles.rightIcon}>
            <DownArrowIcon width={12} height={12} fill="#6150FF" />
          </span>
        </div>
      )}
    </div>
  );
};

const ProductSearchTable: React.FC<TypeProductSearchTableProps> = (props) => {
  const {
    // dataSource = [],
    rawData,
    isReplay,
    loading = false,
    pagination = false,
    onRowClick,
  } = props;

  const toast = useToast();

  const [createInquiryMode, setCreateInquiryMode] = useState(false);
  const [checkedRowKeys, setCheckedRowKeys] = useState<React.Key[]>([]);
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
  const [dataSource, setDataSource] = useState<TypeProductData[]>([]);
  useEffect(() => {
    if (rawData) {
      setDataSource(rawData?.offerInfo?.offerList || []);
    }
  }, [rawData]);
  const aiRequirementAnalysis = rawData?.offerInfo?.aiRequirementAnalysis || {};

  // 定义表格列
  const columns: ColumnsType<TypeProductData> = [
    {
      title: $t("global-1688-ai-app.select-business.ProductSearchTable.productInformation", "商品信息"),
      dataIndex: 'productInfo',
      key: 'productInfo',
      width: 240,
      fixed: 'left',
      align: 'left',
      render: (_, record, index) => (
        <div
          className={styles.productInfo}
        >
          <ImgDisplay src={record.imageUrl || ''}>
            <div
              onClick={() => {
                if (record?.offerDetailUrl) {
                  window.open(record?.offerDetailUrl, '_blank');
                }
              }}
              className={styles.imageWrapper}
            >
              <img
                src={record.imageUrl}
                alt={record.title}
                className={styles.productImage}
              />
              <div className={styles.rankBadge}>
                <span>{index + 1}</span>
              </div>
            </div>
          </ImgDisplay>
          <div className={styles.productDetails}>
            <div
              onClick={() => {
                if (record?.offerDetailUrl) {
                  window.open(record?.offerDetailUrl, '_blank');
                }
              }}
              className={styles.productTitle}
            >{record.title || ''}</div>
            <div className={styles.productPrice}>{record.itemPrice ? '¥' : ''}{record.itemPrice || ''}</div>
          </div>
        </div>
      ),
    },
    {
      title: $t("global-1688-ai-app.select-business.ProductSearchTable.gft", "供应商信息"),
      dataIndex: 'supplierInfo',
      key: 'supplierInfo',
      width: 200,
      align: 'left',
      render: (_, record) => (
        <div
          className={styles.supplierInfo}
        >
          <div
            onClick={() => {
              if (record?.providerInfo?.factoryUrl) {
                window.open(record?.providerInfo?.factoryUrl, '_blank');
              }
            }}
            className={styles.supplierName}
          >{record?.providerInfo?.companyName || '-'}</div>
          <div className={styles.supplierBadges}>
            {(record?.providerInfo?.providerTags || [])
              .map((tag, index) => (
                <React.Fragment key={index}>
                  <Badges tagStyle={tag.tagStyle} tagName={tag.tagName} />
                </React.Fragment>
              ))}
          </div>
          {createInquiryMode && checkedRowKeys.includes(record?.itemId || '') && record?.providerInfo?.isLowRespRate && (
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
          <span className={styles.aiText}>{$t("global-1688-ai-app.select-business.ProductSearchTable.AIzl", "AI总览")}</span>
        </div>
      ),
      dataIndex: 'aiSummary',
      key: 'aiSummary',
      width: 200,
      align: 'left',
      render: (_, record) => (
        <div className={styles.aiSummary}>
          {(record?.aiAttentions || []).map((item, index) => (
            <div key={index} className={styles.aiSummaryItem}>
              {item}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: $t("global-1688-ai-app.select-business.ProductSearchTable.uqq", "用户需求解析&满足情况"),
      dataIndex: 'demandAnalysis',
      key: 'demandAnalysis',
      width: 200,
      align: 'left',
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
                <span className={styles.demandText}>{item?.requirement || '-'}</span>
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
      title: $t("global-1688-ai-app.select-business.ProductSearchTable.jys", "销量"),
      dataIndex: 'sales',
      key: 'sales',
      width: 200,
      align: 'left',
      render: (_, record) => (
        <div className={styles.salesInfo}>
          {
            (record?.salesInfos || [])?.map((item, index) => (
              <div key={index} className={styles.salesItem}>
                <span className={styles.salesLabel}>{item.label || ''}:</span>
                <span className={styles.salesValue}>{item.value || ''}</span>
              </div>
            ))
          }
        </div>
      ),
    },
    {
      title: $t("global-1688-ai-app.select-business.ProductSearchTable.kjjdznl", "跨境及定制能力"),
      dataIndex: 'providerKjCustomTags',
      key: 'providerKjCustomTags',
      width: 200,
      align: 'left',
      render: (_, record) => (
        <ProviderKjCustomTagsCell providerKjCustomTags={record?.providerKjCustomTags || []} />
      ),
    },
    {
      title: $t("global-1688-ai-app.select-business.ProductSearchTable.hre", "核心属性"),
      dataIndex: 'coreAttributes',
      key: 'coreAttributes',
      width: 360,
      align: 'left',
      render: (_, record) => (
        <CoreAttributesCell coreAttributes={record?.coreAttributes || []} />
      ),
    },
    {
      title: $t("global-1688-ai-app.select-business.ProductSearchTable.coi", "采购信息"),
      dataIndex: 'purchaseInfo',
      key: 'purchaseInfo',
      width: 200,
      align: 'left',
      render: (_, record) => (
        <div className={styles.salesInfo}>
          {(record?.purchaseInfos || []).map((item, index) => (
            <div key={index} className={styles.salesItem}>
              <span className={styles.salesLabel}>{item.label || ''}:</span>
              <span className={styles.salesValue}>{item.value || ''}</span>
            </div>
          ))}
          {/* <div className={styles.purchaseItem}>
            <span className={styles.purchaseLabel}>起批量:</span>
            <span className={styles.purchaseValue}>{record.purchaseInfo.minOrderQuantity}</span>
          </div>
          <div className={styles.purchaseItem}>
            <span className={styles.purchaseLabel}>服务:</span>
            <span className={styles.purchaseValue}>{record.purchaseInfo.service}</span>
          </div> */}
        </div>
      ),
    },
    {
      title: $t("global-1688-ai-app.select-business.ProductSearchTable.shiply", "发货履约"),
      dataIndex: 'deliveryInfo',
      key: 'deliveryInfo',
      width: 200,
      align: 'left',
      render: (_, record) => (
        <div className={styles.salesInfo}>
          {(record?.shipInfos || []).map((item, index) => (
            <div key={index} className={styles.salesItem}>
              <span className={styles.salesLabel}>{item.label || ''}:</span>
              <span className={styles.salesValue}>{item.value || ''}</span>
            </div>
          ))}
          {/* <div className={styles.deliveryItem}>
            <span className={styles.deliveryLabel}>发货履约率:</span>
            <span className={styles.deliveryValue}>{record.deliveryInfo.fulfillmentRate}</span>
          </div>
          <div className={styles.deliveryItem}>
            <span className={styles.deliveryLabel}>48小时揽收率:</span>
            <span className={styles.deliveryValue}>{record.deliveryInfo.pickupRate}</span>
          </div>
          <div className={styles.deliveryItem}>
            <span className={styles.deliveryLabel}>发货地:</span>
            <span className={styles.deliveryValue}>{record.deliveryInfo.location}</span>
          </div> */}
        </div>
      ),
    },
    {
      title: $t("global-1688-ai-app.select-business.ProductSearchTable.merchantService", "商家服务"),
      dataIndex: 'merchantService',
      key: 'merchantService',
      minWidth: 512,
      align: 'center',
      render: (_, record) => (
        <div className={styles.merchantService}>
          {(record?.providerServices || []).map((item, index) => (
            <div key={index} className={styles.serviceItem}>
              <span className={styles.serviceValue}>{item.value || ''}</span>
              <span className={styles.serviceLabel}>{item.label || ''}</span>
            </div>
          ))}
          {/* <div className={styles.serviceItem}>
            <span className={styles.serviceValue}>{record.merchantService.qualityRefundRate}</span>
            <span className={styles.serviceLabel}>品质退款率</span>
          </div>
          <div className={styles.serviceItem}>
            <span className={styles.serviceValue}>{record.merchantService.customerServiceResponseRate}</span>
            <span className={styles.serviceLabel}>客服响应率</span>
          </div>
          <div className={styles.serviceItem}>
            <span className={styles.serviceValue}>{record.merchantService.repeatPurchaseRate90Days}</span>
            <span className={styles.serviceLabel}>90天回头率</span>
          </div>
          <div className={styles.serviceItem}>
            <span className={styles.serviceValue}>{record.merchantService.comprehensiveServiceScore}</span>
            <span className={styles.serviceLabel}>综合服务分</span>
          </div>
          <div className={styles.serviceItem}>
            <span className={styles.serviceValue}>{record.merchantService.orders180Days}</span>
            <span className={styles.serviceLabel}>180天订单</span>
          </div>
          <div className={styles.serviceItem}>
            <span className={styles.serviceValue}>{record.merchantService.buyers180Days}</span>
            <span className={styles.serviceLabel}>180天买家</span>
          </div>
          <div className={styles.serviceItem}>
            <span className={styles.serviceValue}>{record.merchantService.totalProducts}</span>
            <span className={styles.serviceLabel}>全部商品</span>
          </div>
          <div className={styles.serviceItem}>
            <span className={styles.serviceValue}>{record.merchantService.newProducts30Days}</span>
            <span className={styles.serviceLabel}>近30天上新</span>
          </div> */}
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
  const tableScrollX = createInquiryMode ? baseTableWidth + checkboxColumnWidth : baseTableWidth;
  const fetchResultProcess = (filters: TypeFilterItem[], sort: { field: string; order?: 'ASC' | 'DESC' | null } | null) => {
    if (filters?.length === 0 && !sort) {
      setDataSource(rawData?.offerInfo?.offerList || []);
      return;
    }
    resultProcess({
      processParam: {
        filterList: filters,
        sort: sort || undefined
      },
      data: rawData,
    }).then((res) => {
      setDataSource(res?.result?.offerInfo?.offerList || []);
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
    <div className={styles.productSearchTable}>
      <div ref={contentRef} className={styles.productSearchContent}>
        {
          /* 别再删了 这是AI需求分析 */
          aiRequirementAnalysis?.isDisplay && (
            <>
              <div className={styles.productRecommendTitle}>{$t("global-1688-ai-app.select-business.ProductSearchTable.AIxqfx", "AI 需求分析")}</div>
              <div className={styles.productRecommendContent}>
                <span>{$t("global-1688-ai-app.select-business.SupplierSearchTable.jxdywj", '解析到您的需求为：')}</span>
                {
                  aiRequirementAnalysis?.requirements?.map((item, index) => (
                    <span key={index} style={{ color: '#6150FF', marginRight: '8px' }}>#{item}</span>
                  ))
                }
                {$t("global-1688-ai-app.select-business.SupplierSearchTable.bwjytjsm", '本次为您推荐')}&nbsp;
                <span>{aiRequirementAnalysis?.total || '0'}</span>&nbsp;
                {$t("global-1688-ai-app.select-business.ProductSearchTable.beeppnczqz", '款产品，其中')}&nbsp;
                <span style={{ color: '#21A84A' }}>{aiRequirementAnalysis?.fullSatisfy || '0'}</span>
                &nbsp;{$t("global-1688-ai-app.mobile-select-business.ProductSearchTable.gmq", "个产品完全满足您的需求，")}&nbsp;
                <span style={{ color: '#F55353' }}>{aiRequirementAnalysis?.partSatisfy || '0'}</span>
                &nbsp;{$t("global-1688-ai-app.mobile-select-business.ProductSearchTable.gmq.2", '个产品部分满足您的需求。')}
              </div>
            </>
          )
        }
        <div ref={supplierSearchRef} className={styles.supplierSearchWrapper}>
          <SupplierSearch onFilterChange={onFilterChange} onSortChange={onSortChange} expanded={searchExpanded} onExpandedChange={handleExpandedChange} />
        </div>
        <div>
          <div className={styles.productRecommendTable}>
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
                  const isDisabled = checkedRowKeys.length >= MAX_SELECTION_COUNT &&
                    !checkedRowKeys.includes(record?.itemId || '');
                  return {
                    className: isDisabled ? 'checkbox-disabled-style' : '',
                  };
                },
                onSelect: (record, selected) => {
                  // 如果是尝试选中且已达上限，显示提示并阻止选择
                  if (selected && checkedRowKeys.length >= MAX_SELECTION_COUNT) {
                    toast.warning($t("global-1688-ai-app.select-business.ProductSearchTable.zzert", `最多只能选择${MAX_SELECTION_COUNT}个商品发起询盘`, [MAX_SELECTION_COUNT]));
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
              locale={{
                emptyText: <TableEmpty />,
              }}
              pagination={pagination}
              scroll={{
                x: tableScrollX,
              }}
              sticky={{ offsetHeader: supplierSearchHeight }}
              rowKey="itemId"
              onRow={(record) => ({
                onClick: () => {
                  if (createInquiryMode) {
                    if (checkedRowKeys.includes(record?.itemId || '')) {
                      setCheckedRowKeys((oldKeys) => {
                        return oldKeys.filter((key) => key !== record?.itemId || '');
                      });
                    } else {
                      if (checkedRowKeys.length < MAX_SELECTION_COUNT) {
                        setCheckedRowKeys((oldKeys) => {
                          return [...oldKeys, record?.itemId || ''];
                        });
                      } else {
                        toast.warning($t("global-1688-ai-app.select-business.ProductSearchTable.zzert", `最多只能选择${MAX_SELECTION_COUNT}个商品发起询盘`, [MAX_SELECTION_COUNT]));
                      }
                    }
                  }
                  onRowClick?.(record);
                },
              })}
            />
          </div>
        </div>
      </div>
      {
        isReplay ? null
          : <div className={styles.productSearchBottom}>
            <Button
              className={classNames(styles.cancelButton, {
                [styles.show]: createInquiryMode,
              })}
              onClick={() => {
                setCreateInquiryMode(false);
              }}
            >{$t("global-1688-ai-app.select-business.ProductSearchTable.cancel", "取消")}</Button>
            <Button
              onClick={() => {
                if (createInquiryMode) {
                  if (checkedRowKeys?.length) {
                    // 判断一下 将 dataSource 中选中的商品都获取出来，看看供应商的id是否一样。
                    // 如果有一样的供应商，需要阻断
                    const supplierIdMap = {};
                    let isSameSupplier = false;
                    dataSource.forEach((record) => {
                      if (checkedRowKeys.includes(record?.itemId || '')) {
                        if (supplierIdMap[record?.providerInfo?.memberId || record?.providerInfo?.userId || '']) {
                          isSameSupplier = true;
                        } else {
                          supplierIdMap[record?.providerInfo?.memberId || record?.providerInfo?.userId || ''] = record?.providerInfo?.memberId || record?.providerInfo?.userId || '';
                        }
                      }
                    });
                    if (isSameSupplier) {
                      toast.warning($t("global-1688-ai-app.select-business.ProductSearchTable.joyfpuec", "仅支持向同一家供应商发送一个询盘商品，请重新选择"));
                      return;
                    } 
                    jumpTo(`/inquiry?fromPage=ZS&offerIds=${checkedRowKeys.join(',')}`);
                    setCreateInquiryMode(false);
                  } else {
                    toast.warning($t("global-1688-ai-app.select-business.ProductSearchTable.qctgu", "请选择至少一个商品"));
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
                  <span>{$t("global-1688-ai-app.select-business.ProductSearchTable.confirmfq", `确认发起 (${checkedRowKeys.length || 0}/${MAX_SELECTION_COUNT})`, [checkedRowKeys.length || 0, MAX_SELECTION_COUNT])}</span>
                ) : $t("global-1688-ai-app.select-business.ProductSearchTable.fqxp", "发起询盘")}
              </span>
            </Button>
          </div>
      }
    </div>
  );
};

export default ProductSearchTable;

