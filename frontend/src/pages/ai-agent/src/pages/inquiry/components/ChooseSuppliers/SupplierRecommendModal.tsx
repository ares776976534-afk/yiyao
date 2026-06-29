import React, { useState, useEffect } from 'react';
import { Modal, Table, Button, Avatar, Popover } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CloseOutlined } from '@ant-design/icons';
import AiRecommendIcon from '@/components/Icon/AiRecommend';
import { StarBadgeIcon } from '@/components/Icons';
import { SuperFactoryTextIcon, SupplierInfoIcon } from '@/components/Icon';
import styles from './SupplierRecommendModal.module.css';
import { $t } from '@/i18n';

interface TypeSupplierRecommendData {
  providerInfo: {
    companyName: string;
    memberId: string;
    headImg: string;
    wangwangId: string;
    isAiRec: boolean;
    providerTags: Array<{ tagName: string; tagStyle: string }>;
    providerKjCustomTags: string[];
    providerServices: Array<{ label: string; value: string }>;
    purchaseInfos: Array<{ label: string; value: string }>;
    salesInfos: Array<{ label: string; value: string }>;
    shipInfos: Array<{ label: string; value: string }>;
  };
  itemInfo: {
    img: string;
    itemId: number;
    title: string;
    price: string;
  };
}

interface TypeSupplierRecommendModalProps {
  open: boolean;
  onClose: () => void;
  data: TypeSupplierRecommendData[];
  onConfirm?: (selectedSuppliers: TypeSupplierRecommendData[]) => void;
  maxSelection?: number;
  loading?: boolean; // loading状态
  selectedMemberIds?: Set<string>; // 已选供应商的memberId集合，用于关联ChooseSuppliers的已选项
  respBlockedRate?: string;
}

const SupplierRecommendModal: React.FC<TypeSupplierRecommendModalProps> = ({
  open,
  onClose,
  data = [],
  onConfirm,
  maxSelection = 6,
  loading = false,
  selectedMemberIds = new Set(),
  respBlockedRate,
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [expandedPurchaseRows, setExpandedPurchaseRows] = useState<Set<number>>(new Set());
  const [expandedCustomRows, setExpandedCustomRows] = useState<Set<number>>(new Set());
  const [expandedServiceRows, setExpandedServiceRows] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (open) {
      // 如果有已选供应商，根据selectedMemberIds来设置选中状态
      if (selectedMemberIds.size > 0) {
        const selectedKeys = (data || [])
          .map((item, index) => {
            // 如果该供应商已在ChooseSuppliers中选中，则选中
            if (selectedMemberIds.has(item.providerInfo.memberId)) {
              return index;
            }
            return null;
          })
          .filter((key): key is number => key !== null);
        setSelectedRowKeys(selectedKeys);
      } else {
        // 如果没有已选供应商，默认全选（不超过maxSelection限制）
        const defaultSelectedKeys = (data || [])
          .map((item, index) => index)
          .slice(0, maxSelection);
        setSelectedRowKeys(defaultSelectedKeys);
      }
    } else {
      setExpandedRows(new Set());
      setExpandedPurchaseRows(new Set());
      setExpandedCustomRows(new Set());
      setExpandedServiceRows(new Set());
      // 关闭时不重置选中状态，保持状态以便下次打开时使用
    }
  }, [open, data, maxSelection, selectedMemberIds]);

  const handleConfirm = () => {
    const selectedSuppliers = data.filter((item, index) => selectedRowKeys.includes(index));
    onConfirm?.(selectedSuppliers);
    setSelectedRowKeys([]);
    onClose();
  };

  const columns: ColumnsType<TypeSupplierRecommendData> = [
    {
      title: $t("global-1688-ai-app.inquiry.ChooseSuppliers.SupplierRecommendModal.gft", "供应商信息"),
      dataIndex: 'providerInfo',
      key: 'providerInfo',
      width: 280,
      render: (providerInfo: TypeSupplierRecommendData['providerInfo']) => {
        const powerFactoryTags: Array<{ tag: { tagName: string; tagStyle: string }; idx: number }> = [];
        const sourceFactoryTags: Array<{ tag: { tagName: string; tagStyle: string }; idx: number }> = [];
        const generalTags: Array<{ tag: { tagName: string; tagStyle: string }; idx: number }> = [];

        (providerInfo?.providerTags || []).forEach((tag, idx) => {
          if (tag.tagStyle === 'POWER_FACTORY') {
            powerFactoryTags.push({ tag, idx });
          } else if (tag.tagStyle === 'SOURCE_FACTORY') {
            sourceFactoryTags.push({ tag, idx });
          } else {
            generalTags.push({ tag, idx });
          }
        });

        return (
          <div className={styles.supplierInfoCell}>
            {providerInfo.isAiRec && (
              <div className={styles.aiRecommendIcon}>
                <AiRecommendIcon />
              </div>
            )}
            <div className={styles.supplierInfoContent}>
              <Avatar src={providerInfo.headImg} size={46} className={styles.supplierAvatar} />
              <div className={styles.supplierDetails}>
                <div className={styles.companyName}>{providerInfo.companyName}</div>
                {(powerFactoryTags.length > 0 || sourceFactoryTags.length > 0) && (
                  <div className={styles.specialTags}>
                    {(powerFactoryTags || []).map(({ idx }) => (
                      <span key={idx} className={styles.powerFactoryTag}>
                        <SuperFactoryTextIcon />
                      </span>
                    ))}
                    {(sourceFactoryTags || []).map(({ tag, idx }) => (
                      <span key={idx} className={styles.sourceFactoryTag}>
                        {tag.tagName}
                      </span>
                    ))}
                  </div>
                )}
                {generalTags.length > 0 && (
                  <div className={styles.generalTags}>
                    {(generalTags || []).map(({ tag, idx }) => (
                      <span key={idx} className={styles.generalTag}>
                        {tag.tagName}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: $t("global-1688-ai-app.inquiry.ChooseSuppliers.SupplierRecommendModal.productInformation", "商品信息"),
      dataIndex: 'itemInfo',
      key: 'itemInfo',
      width: 176,
      minWidth: 176,
      render: (itemInfo: TypeSupplierRecommendData['itemInfo']) => (
        <div className={styles.itemInfoCell}>
          <Popover
            content={
              <div className={styles.itemImagePreview}>
                <img src={itemInfo.img} alt={itemInfo.title} className={styles.itemImageLarge} />
              </div>
            }
            trigger="hover"
            placement="rightBottom"
            overlayClassName={styles.itemImagePopover}
            align={{
              offset: [6, 238],
            }}
          >
            <img src={itemInfo.img} alt={itemInfo.title} className={styles.itemImage} />
          </Popover>
          <div className={styles.itemDetails}>
            <div className={styles.itemTitle}>{itemInfo.title}</div>
            <div className={styles.itemPrice}>¥{itemInfo.price}</div>
          </div>
        </div>
      ),
    },
    {
      title: $t("global-1688-ai-app.inquiry.ChooseSuppliers.SupplierRecommendModal.sales", "销量"),
      dataIndex: 'providerInfo',
      key: 'sales',
      width: 190,
      render: (providerInfo: TypeSupplierRecommendData['providerInfo'], record, index) => {
        const { salesInfos } = providerInfo;
        if (!salesInfos || salesInfos.length === 0) {
          return <span>-</span>;
        }

        const isExpanded = expandedRows.has(index);
        const displayInfos = isExpanded ? salesInfos : salesInfos.slice(0, 5);
        const hasMore = salesInfos.length > 5;

        const handleToggleExpand = (event: React.MouseEvent) => {
          event.stopPropagation();
          const newExpandedRows = new Set(expandedRows);
          if (isExpanded) {
            newExpandedRows.delete(index);
          } else {
            newExpandedRows.add(index);
          }
          setExpandedRows(newExpandedRows);
        };

        return (
          <div className={styles.salesCell}>
            {displayInfos.map((info, idx) => (
              <div key={idx} className={styles.salesItem}>
                <span className={`${styles.salesLabel} ${styles.salesTitle}`}>{info.label}:</span>
                <span className={styles.salesValue}>{info.value}</span>
              </div>
            ))}
            {hasMore && (
              <div
                className={styles.expandLink}
                onClick={handleToggleExpand}
                style={{ cursor: 'pointer', marginTop: '4px' }}
              >
                {isExpanded ? <div className={styles.collapse}>
                  <span>{$t("global-1688-ai-app.inquiry.ChooseSuppliers.SupplierRecommendModal.sq", "收起")}</span>
                  <img className={styles.collapseIcon} src="https://img.alicdn.com/imgextra/i3/O1CN01dbmZOG1J6tFXtVjOg_!!6000000000980-2-tps-48-48.png" alt="" />
                </div> : <div className={styles.collapse}>
                  <span>{$t("global-1688-ai-app.inquiry.ChooseSuppliers.SupplierRecommendModal.zkqb", "展开全部")}</span>
                  <img className={styles.expandIcon} src="https://img.alicdn.com/imgextra/i3/O1CN01dbmZOG1J6tFXtVjOg_!!6000000000980-2-tps-48-48.png" alt="" />
                </div>}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: $t("global-1688-ai-app.inquiry.ChooseSuppliers.SupplierRecommendModal.coi", "采购信息"),
      dataIndex: 'providerInfo',
      key: 'purchase',
      width: 176,
      render: (providerInfo: TypeSupplierRecommendData['providerInfo'], record, index) => {
        const { purchaseInfos } = providerInfo;
        if (!purchaseInfos || purchaseInfos.length === 0) {
          return <span>-</span>;
        }

        const isExpanded = expandedPurchaseRows.has(index);
        const displayInfos = isExpanded ? purchaseInfos : purchaseInfos.slice(0, 5);
        const hasMore = purchaseInfos.length > 5;

        const handleToggleExpand = (event: React.MouseEvent) => {
          event.stopPropagation();
          const newExpandedRows = new Set(expandedPurchaseRows);
          if (isExpanded) {
            newExpandedRows.delete(index);
          } else {
            newExpandedRows.add(index);
          }
          setExpandedPurchaseRows(newExpandedRows);
        };

        return (
          <div className={styles.salesCell}>
            {displayInfos.map((info, idx) => (
              <div key={idx} className={styles.salesItem}>
                <span className={styles.salesLabel}>{info.label}:</span>
                <span className={styles.salesValue}>{info.value}</span>
              </div>
            ))}
            {hasMore && (
              <div
                className={styles.expandLink}
                onClick={handleToggleExpand}
                style={{ cursor: 'pointer', marginTop: '4px' }}
              >
                {isExpanded ? <div className={styles.collapse}>
                  <span>{$t("global-1688-ai-app.inquiry.ChooseSuppliers.SupplierRecommendModal.sq", "收起")}</span>
                  <img className={styles.collapseIcon} src="https://img.alicdn.com/imgextra/i3/O1CN01dbmZOG1J6tFXtVjOg_!!6000000000980-2-tps-48-48.png" alt="" />
                </div> : <div className={styles.collapse}>
                  <span>{$t("global-1688-ai-app.inquiry.ChooseSuppliers.SupplierRecommendModal.zkqb", "展开全部")}</span>
                  <img className={styles.expandIcon} src="https://img.alicdn.com/imgextra/i3/O1CN01dbmZOG1J6tFXtVjOg_!!6000000000980-2-tps-48-48.png" alt="" />
                </div>}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: $t("global-1688-ai-app.inquiry.ChooseSuppliers.SupplierRecommendModal.kjjdznl", "跨境及定制能力"),
      dataIndex: 'providerInfo',
      key: 'custom',
      width: 176,
      render: (providerInfo: TypeSupplierRecommendData['providerInfo'], record, index) => {
        const { providerKjCustomTags } = providerInfo;
        if (!providerKjCustomTags || providerKjCustomTags.length === 0 || providerKjCustomTags[0] === '-') {
          return <span>-</span>;
        }

        const isExpanded = expandedCustomRows.has(index);
        const displayTags = isExpanded ? providerKjCustomTags : providerKjCustomTags.slice(0, 5);
        const hasMore = providerKjCustomTags.length > 5;

        const handleToggleExpand = (event: React.MouseEvent) => {
          event.stopPropagation();
          const newExpandedRows = new Set(expandedCustomRows);
          if (isExpanded) {
            newExpandedRows.delete(index);
          } else {
            newExpandedRows.add(index);
          }
          setExpandedCustomRows(newExpandedRows);
        };

        return (
          <div className={styles.salesCell}>
            {displayTags.map((tag, idx) => (
              <div key={idx} className={styles.salesItem}>
                <span className={styles.salesValue}>{tag}</span>
              </div>
            ))}
            {hasMore && (
              <div
                className={styles.expandLink}
                onClick={handleToggleExpand}
                style={{ cursor: 'pointer', marginTop: '4px' }}
              >
                {isExpanded ? <div className={styles.collapse}>
                  <span>{$t("global-1688-ai-app.inquiry.ChooseSuppliers.SupplierRecommendModal.sq", "收起")}</span>
                  <img className={styles.collapseIcon} src="https://img.alicdn.com/imgextra/i3/O1CN01dbmZOG1J6tFXtVjOg_!!6000000000980-2-tps-48-48.png" alt="" />
                </div> : <div className={styles.collapse}>
                  <span>{$t("global-1688-ai-app.inquiry.ChooseSuppliers.SupplierRecommendModal.zkqb", "展开全部")}</span>
                  <img className={styles.expandIcon} src="https://img.alicdn.com/imgextra/i3/O1CN01dbmZOG1J6tFXtVjOg_!!6000000000980-2-tps-48-48.png" alt="" />
                </div>}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: $t("global-1688-ai-app.inquiry.ChooseSuppliers.SupplierRecommendModal.merchantService", "商家服务"),
      dataIndex: 'providerInfo',
      key: 'services',
      width: 176,
      render: (providerInfo: TypeSupplierRecommendData['providerInfo'], record, index) => {
        const { providerServices } = providerInfo;
        if (!providerServices || providerServices.length === 0) {
          return <span>-</span>;
        }

        const isExpanded = expandedServiceRows.has(index);
        const displayServices = isExpanded ? providerServices : providerServices.slice(0, 5);
        const hasMore = providerServices.length > 5;

        const handleToggleExpand = (event: React.MouseEvent) => {
          event.stopPropagation();
          const newExpandedRows = new Set(expandedServiceRows);
          if (isExpanded) {
            newExpandedRows.delete(index);
          } else {
            newExpandedRows.add(index);
          }
          setExpandedServiceRows(newExpandedRows);
        };

        return (
          <div className={styles.servicesCell}>
            {displayServices.map((service, idx) => (
              <div key={idx} className={styles.serviceItem}>
                <span className={styles.serviceLabel}>{service.label}:</span>
                <span className={styles.serviceValue}>{service.value}</span>
              </div>
            ))}
            {hasMore && (
              <div
                className={styles.expandLink}
                onClick={handleToggleExpand}
                style={{ cursor: 'pointer', marginTop: '4px' }}
              >
                {isExpanded ? <div className={styles.collapse}>
                  <span>{$t("global-1688-ai-app.inquiry.ChooseSuppliers.SupplierRecommendModal.sq", "收起")}</span>
                  <img className={styles.collapseIcon} src="https://img.alicdn.com/imgextra/i3/O1CN01dbmZOG1J6tFXtVjOg_!!6000000000980-2-tps-48-48.png" alt="" />
                </div> : <div className={styles.collapse}>
                  <span>{$t("global-1688-ai-app.inquiry.ChooseSuppliers.SupplierRecommendModal.zkqb", "展开全部")}</span>
                  <img className={styles.expandIcon} src="https://img.alicdn.com/imgextra/i3/O1CN01dbmZOG1J6tFXtVjOg_!!6000000000980-2-tps-48-48.png" alt="" />
                </div>}
              </div>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={1300}
      centered
      closeIcon={<CloseOutlined />}
      title={
        <div className={styles.modalHeader}>
          <div className={styles.headerLeft}>
            <StarBadgeIcon size={20} />
            <h2 className={styles.modalTitle}>{$t("global-1688-ai-app.inquiry.ChooseSuppliers.SupplierRecommendModal.zod", "智能推荐供应商")}</h2>
            <div className={styles.headerSubtitle}>{$t("global-1688-ai-app.inquiry.ChooseSuppliers.SupplierRecommendModal.glxdhcn", "根据所上传的询盘商品进行图搜推荐")}</div>
          </div>
        </div>
      }
      styles={{
        header: { marginBottom: 16 },
        content: { borderRadius: '16px', padding: '20px' },
      }}
    >
      <div className={styles.modalContent}>
        <Table
          columns={columns}
          dataSource={(data || []).map((item, index) => ({ ...item, key: index }))}
          pagination={false}
          scroll={{ y: 500 }}
          loading={loading}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => {
              if (keys.length <= maxSelection) {
                setSelectedRowKeys(keys);
              }
            },
            hideSelectAll: true,
            getCheckboxProps: (record) => {
              // 当选满maxSelection个时，未选中的checkbox置灰，但已选中的仍可取消
              const recordKey = (record as TypeSupplierRecommendData & { key: number }).key;
              const isSelected = selectedRowKeys.includes(recordKey);
              const isMaxReached = selectedRowKeys.length >= maxSelection;
              return {
                disabled: isMaxReached && !isSelected,
              };
            },
          }}
          rowClassName={(record, index) => {
            const baseClass = record.providerInfo.isAiRec ? styles.aiRecRow : '';
            return selectedRowKeys.includes(index) ? `${baseClass} ${styles.selectedRow}`.trim() : baseClass;
          }}
        />
        {respBlockedRate && (
          <div className={styles.footer}>
            <SupplierInfoIcon />
            <div className={styles.footerText}>
              {$t('global-1688-ai-app.inquiry.ChooseSuppliers.SupplierRecommendModal.footerText',
                `已为您剔除客服响应率低于${respBlockedRate}的商家`, [respBlockedRate])}
            </div>
          </div>
        )}
        <div className={styles.modalFooter}>
          <Button type="primary" onClick={handleConfirm} className={styles.modalFooterBtn}>{$t("global-1688-ai-app.inquiry.ChooseSuppliers.SupplierRecommendModal.cre", `确认选择 (${selectedRowKeys.length}/${maxSelection})`, [selectedRowKeys.length, maxSelection])}</Button>
        </div>
      </div>
    </Modal>
  );
};

export default SupplierRecommendModal;

