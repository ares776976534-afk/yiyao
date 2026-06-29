import React, { useState, useMemo, useEffect } from 'react';
import { Modal, Input, Checkbox, Button, Avatar, Tooltip } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { SearchIcon, DeleteIcon, WantWantIcon, SupplierInfoIcon, RightArrowPurpleIcon, ReportIcon } from '@/components/Icon';
import { getCollectSupplierList } from '@/pages/inquiry/services';
import InfiniteScroll from 'react-infinite-scroll-component';

import styles from './supplierLibrary.module.css';
import { $t } from '@/i18n';
import { MainBtn } from '@/components/ChatFlow/Btn';
interface SupplierItemProps {
  supplier: any;
  isSelected?: boolean;
  onSelect?: (supplier: any, checked: boolean) => void;
  selectedSuppliers?: any[];
  maxSelection?: number;
  showCheckbox?: boolean;
  showDelete?: boolean;
  onDelete?: (supplier: any) => void;
  disableCardCursor?: boolean; // 是否禁用卡片的 cursor: pointer
  isLowRespRate?: boolean;
}

export const SupplierItem = ({ supplier, isSelected, onSelect, selectedSuppliers = [], maxSelection = 6, showCheckbox = true, showDelete = false, onDelete, disableCardCursor = false, isLowRespRate = false }: SupplierItemProps) => {
  const handleItemClick = (e: React.MouseEvent) => {
    // 如果点击的是checkbox区域或删除按钮区域，不执行选择逻辑
    const target = e.target as HTMLElement;
    if (target.closest(`.${styles.supplierCheckboxContainer}`) ||
      target.closest(`.${styles.supplierDeleteContainer}`)) {
      return;
    }
    onSelect?.(supplier, !isSelected);
  };

  const handleCheckboxChange = (e: CheckboxChangeEvent) => {
    e.nativeEvent?.stopPropagation();
    onSelect?.(supplier, e.target.checked);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(supplier);
  };

  return (
    <div
      key={supplier.memberId}
      className={`${styles.supplierItem} ${isSelected ? styles.selected : ''} ${disableCardCursor ? styles.disableCardCursor : ''}`}
      onClick={handleItemClick}
    >
      <div className={styles.supplierItemContent}>
        <Avatar
          src={supplier.headImg}
          size={46}
          shape="square"
          style={{ borderRadius: 4 }}
        />
        <div className={styles.supplierInfo}>
          {/* <div className={styles.supplierName}>{supplier.companyName}</div> */}
          <div className={styles.supplierInfoTitle}>
            <div className={styles.supplierName}>{supplier.companyName}</div>
            {isLowRespRate && (
              <Tooltip placement="bottom" title={$t('global-1688-ai-app.inquiry.ChooseSuppliers.SupplierLibrary.lowRespRateTip', '该商家的客服响应率较低，可能出现不回复现象，请谨慎选择')}>
                <div className={styles.supplierReportIcon}>
                  <ReportIcon />
                  <div className={styles.supplierReportText}>{$t('global-1688-ai-app.inquiry.ChooseSuppliers.SupplierLibrary.lowRespRate', '客服响应率较低')}</div>
                </div>
              </Tooltip>
            )}
          </div>
          <div className={styles.supplierMeta}>
            <WantWantIcon className={styles.supplierIcon} />
            <span className={styles.supplierId}>{supplier.wangwangId}</span>
          </div>
        </div>
      </div>
      {showCheckbox && (
        <div className={styles.supplierCheckboxContainer}>
          <Checkbox
            className={styles.supplierCheckbox}
            checked={isSelected}
            disabled={selectedSuppliers.length >= maxSelection && !isSelected}
            onChange={handleCheckboxChange}
          />
        </div>
      )}
      {showDelete && (
        <div className={`${styles.supplierDeleteContainer} ${disableCardCursor ? styles.deleteButtonCursor : ''}`} onClick={handleDeleteClick}>
          <DeleteIcon className={styles.supplierDeleteIcon} />
        </div>
      )}
    </div>
  );
};

interface SupplierLibraryModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (suppliers: any[]) => void;
  maxSelection: number;
  selectItems: any[];
}

function SupplierLibraryModal({ open, onClose, onConfirm, maxSelection = 2, selectItems = [] }: SupplierLibraryModalProps) {
  const navigate = useNavigate();
  const [selectedSuppliers, setSelectedSuppliers] = useState<any[]>([]);
  const [supplierList, setSupplierList] = useState<any[]>([]);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalSupplierCount, setTotalSupplierCount] = useState(0);

  const handleSupplierSelect = (supplier, checked) => {
    setSelectedSuppliers(prev => {
      if (checked) {
        if (prev.length < maxSelection) {
          return [...prev, supplier];
        }
        return prev;
      } else {
        return prev.filter(s => s.memberId !== supplier.memberId);
      }
    });
  };

  const handleConfirm = () => {
    onConfirm(selectedSuppliers);
    setSelectedSuppliers([]);
    onClose();
  };

  const handleCancel = () => {
    onClose();
    setSelectedSuppliers([]);
  };

  const handleGoToSettings = () => {
    onClose();
    navigate('/personalized-settings');
  };

  const handleSearch = ({ value = '', pageNum = 1, pageSize = 10 }: { value?: string; pageNum?: number; pageSize?: number }) => {
    getCollectSupplierList({
      companyName: value,
      pageNum: pageNum,
      pageSize: pageSize,
    }).then((res: any) => {
      setPageNum(pageNum);
      setPageSize(pageSize);
      setSupplierList(pageNum === 1 ? res?.data || [] : [...supplierList, ...res?.data || []]);
      setTotalSupplierCount(res?.total || 0);
    })
      .catch((err: any) => {
        console.log(err);
      });
  };

  // 滚动到底加载更多
  const handleLoadMore = () => {
    handleSearch({ value: searchTerm, pageNum: pageNum + 1, pageSize: pageSize });
  };

  useEffect(() => {
    if (!open) {
      setSupplierList([]);
      setPageNum(1);
      setPageSize(10);
      setSearchTerm('');
      setSelectedSuppliers([]);
      return;
    }
    handleSearch({});
    setSelectedSuppliers(selectItems);
  }, [open]);

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={800}
      centered
      closeIcon={<CloseOutlined />}
      title={
        <div className={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h2 className={styles.modalTitle}>{$t("global-1688-ai-app.inquiry.ChooseSuppliers.SupplierLibrary.mygysk", "我的供应商库")}</h2>
            <Tooltip
              title={$t("global-1688-ai-app.inquiry.ChooseSuppliers.SupplierLibrary.cxtzat", "此为您在个性化设置中的个人收藏供应商")}
              overlayInnerStyle={{ whiteSpace: 'nowrap' }}
              overlayStyle={{ maxWidth: 'none' }}
            >
              <span style={{ marginLeft: '6px', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                <SupplierInfoIcon />
              </span>
            </Tooltip>
          </div>
        </div>
      }
      styles={{
        body: { padding: 0 },
        header: { marginBottom: 16 },
        content: { padding: '20px', borderRadius: '16px' },
      }}
    >
      <div>
        <div className={styles.searchContainer}>
          <Input
            className={styles.searchInput}
            placeholder={$t("global-1688-ai-app.inquiry.ChooseSuppliers.SupplierLibrary.srrsw", "支持搜索供应商名称或旺旺id")}
            suffix={<SearchIcon style={{ color: '#86909c' }} onClick={() => handleSearch({ value: searchTerm })} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '260px', height: '36px', borderRadius: '8px', border: '1px solid #E7E8EE' }}
            onPressEnter={() => handleSearch({ value: searchTerm })}
          />
          <div className={styles.goToManage} onClick={handleGoToSettings}>{$t("global-1688-ai-app.inquiry.ChooseSuppliers.SupplierLibrary.qgl", "去管理")}<RightArrowPurpleIcon />
          </div>
        </div>

        <div id="supplierListScroll" style={{ height: '464px', overflow: 'auto' }}>
          <InfiniteScroll
            height={464}
            dataLength={supplierList.length}
            next={handleLoadMore}
            hasMore={supplierList.length < totalSupplierCount}
            loader={<div style={{ textAlign: 'center', padding: 12 }} />}
            // endMessage={<div style={{ textAlign: 'center', padding: 12 }}>没有更多了</div>}
            style={supplierList.length > 0 ? { display: 'flex', flexDirection: 'column', gap: 12 } : { display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center', alignItems: 'center' }}
          >
            {supplierList.length > 0 ? supplierList.map((supplier) => {
              const isSelected = selectedSuppliers.some(s => s.memberId === supplier.memberId);
              return (
                <SupplierItem
                  key={supplier.memberId}
                  supplier={supplier}
                  isSelected={isSelected}
                  onSelect={handleSupplierSelect}
                  selectedSuppliers={selectedSuppliers}
                  maxSelection={maxSelection}
                  showCheckbox
                  isLowRespRate={supplier?.isLowRespRate}
                />
              );
            }) : <div className={styles.noSearchResult}>{$t("global-1688-ai-app.inquiry.ChooseSuppliers.SupplierLibrary.zrs", "暂无搜索结果")}</div>}
          </InfiniteScroll>
        </div>

        <div className={styles.modalFooter}>
          <div className={styles.selectionInfo}>{$t("global-1688-ai-app.inquiry.ChooseSuppliers.SupplierLibrary.kxgdqyxg", `可选${maxSelection}个，当前已选${selectedSuppliers.length}个`, [maxSelection, selectedSuppliers.length])}</div>
          <MainBtn
            text={$t("global-1688-ai-app.inquiry.ChooseSuppliers.SupplierLibrary.confirmSelect", "确认选择")}
            handleBtn={handleConfirm}
            other={{
              disabled: selectedSuppliers.length === 0,
            }}
            style={{ fontSize: 16, height: 40 }}
          />
        </div>
      </div>
    </Modal>
  );
}

export default SupplierLibraryModal;