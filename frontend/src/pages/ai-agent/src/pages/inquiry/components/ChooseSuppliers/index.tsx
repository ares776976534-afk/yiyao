import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Select, Button, Form, message } from 'antd';
import IndexBlock from '../IndexBlock';
import { AddIcon, WantWantIcon } from '@/components/Icon';
import SupplierLibrary, { SupplierItem } from './SupplierLibrary';
import SupplierRecommendModal from './SupplierRecommendModal';
import { getSupplierList, getSupplierRecommend } from '../../services';
import debounce from 'lodash/debounce';
import QueueAnim from 'rc-queue-anim';
import { getNumberIcon } from '../FormatList/RightComponents/numberIconConfig';

import styles from './index.module.css';
import { $t } from '@/i18n';
import { StarBadgeIcon } from '@/components/Icons';

interface ChangeValue {
  memberId: string;
  companyName: string;
  headImg: string;
  wangwangId: string;
}

interface ChooseSuppliersProps {
  onChange?: (value: ChangeValue[]) => void;
  value?: ChangeValue[];
  disabled?: boolean;
  showFindSupplierTip?: boolean; // 是否显示"前往寻源找商"提示
  number?: number; // 数字序号
  // 通过智能推荐选择供应商时的回调，传递供应商列表和供应商-商品对应关系
  onRecommendSelect?: (suppliers: ChangeValue[], supplierItemPairs?: Array<{ memberId: string; itemId?: string }>) => void;
}

const maxSelectCount = 6;

// 深度比较两个数组是否相等
const isEqualArray = (arr1: ChangeValue[] | undefined, arr2: ChangeValue[] | undefined): boolean => {
  if (arr1 === arr2) return true;
  if (!arr1 || !arr2) return false;
  if (arr1.length !== arr2.length) return false;

  const map1 = new Map(arr1.map(item => [item.memberId, item]));
  const map2 = new Map(arr2.map(item => [item.memberId, item]));

  if (map1.size !== map2.size) return false;

  for (const [memberId, item1] of map1) {
    const item2 = map2.get(memberId);
    if (!item2 ||
        item1.memberId !== item2.memberId ||
        item1.companyName !== item2.companyName ||
        item1.headImg !== item2.headImg ||
        item1.wangwangId !== item2.wangwangId) {
      return false;
    }
  }
  return true;
};

const ChooseSuppliers: React.FC<ChooseSuppliersProps> = ({ onChange, value, disabled, showFindSupplierTip = false, number = 2, onRecommendSelect }) => {
  const NumberIcon = getNumberIcon(number);
  const form = Form.useFormInstance();
  const itemInfo = Form.useWatch('itemInfo', form);
  const [open, setOpen] = useState(false);
  const [recommendModalOpen, setRecommendModalOpen] = useState(false);
  const [recommendData, setRecommendData] = useState<any[]>([]);
  const [selectItems, setSelectItems] = useState<any[]>(value || []);
  const [supplierList, setSupplierList] = useState<any[]>([]);
  const [searchPageNum, setSearchPageNum] = useState(1);
  const [searchTotal, setSearchTotal] = useState(0);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [currentSearchValue, setCurrentSearchValue] = useState('');
  const [selectOpen, setSelectOpen] = useState<boolean | undefined>(undefined);
  // 通过智能推荐添加的供应商 memberId 集合
  const [recommendAddedMemberIds, setRecommendAddedMemberIds] = useState<Set<string>>(new Set());
  // 使用ref存储当前的recommendAddedMemberIds，避免在useEffect中使用过期的闭包值
  const recommendAddedMemberIdsRef = React.useRef<Set<string>>(new Set());
  // 按图片URL缓存推荐数据
  const recommendDataCacheRef = React.useRef<Map<string, any[]>>(new Map());
  // 当前图片URL
  const currentImgUrlRef = React.useRef<string | null>(null);
  // Modal loading状态
  const [isRecommendLoading, setIsRecommendLoading] = useState(false);
  // 使用ref存储上一次的value，用于深度比较
  const prevValueRef = React.useRef<ChangeValue[] | undefined>(undefined);

  const [respBlockedRate, setRespBlockedRate] = useState('');

  const handleOpen = () => {
    setOpen(true);
  };

  const handleModalConfirm = (value: any) => {
    setSelectItems(value);
    // 直接触发onChange，避免useEffect死循环
    const selectedSuppliers = value.map((item: any) => (item));
    onChange?.(selectedSuppliers);
  };

  const handleSelect = (value: any) => {
    if (selectItems.length >= maxSelectCount) {
      return;
    }

    if (selectItems.some((item) => item.memberId === value)) {
      return;
    }

    const item = supplierList.find((item) => item.value === value);
    const newSelectItems = [...selectItems, item.original];
    setSelectItems(newSelectItems);
    // 直接触发onChange，避免useEffect死循环
    const selectedSuppliers = newSelectItems.map((item: any) => (item));
    onChange?.(selectedSuppliers);
    // 选择后重置下拉框状态
    setSelectOpen(false);
    setSupplierList([]);
    setCurrentSearchValue('');
  };

  const handleDelete = (value: any) => {
    const newSelectItems = selectItems.filter((item) => item.memberId !== value.memberId);
    setSelectItems(newSelectItems);
    // 如果删除的是通过智能推荐添加的供应商，从集合中移除
    setRecommendAddedMemberIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(value.memberId);
      return newSet;
    });
    // 直接触发onChange，避免useEffect死循环
    const selectedSuppliers = newSelectItems.map((item: any) => (item));
    onChange?.(selectedSuppliers);
  };

  // 搜索供应商数据
  const searchSuppliers = useCallback((searchValue: string, pageNum: number = 1, isAppend: boolean = false) => {
    if (isSearchLoading) return;

    setIsSearchLoading(true);

    getSupplierList({
      companyName: searchValue,
      pageNum: pageNum,
      pageSize: 10,
    }).then((res) => {
      const { data = [], total = 0 } = res as any;
      const newItems = data.map((item: any) => ({
        label: item.companyName,
        value: item.memberId,
        original: item,
      }));

      if (isAppend) {
        // 追加数据
        setSupplierList(prev => [...prev, ...newItems]);
        setSearchPageNum(pageNum);
      } else {
        // 重置数据
        setSupplierList(newItems);
        setSearchPageNum(1);
      }

      setSearchTotal(total);
      setCurrentSearchValue(searchValue);
    }).catch((error) => {
      console.error('搜索供应商失败:', error);
    }).finally(() => {
      setIsSearchLoading(false);
    });
  }, [isSearchLoading]);

  const handleSearch = useMemo(() => {
    const loadOptions = (value: string) => {
      if (!value || value.trim() === '') {
        setSupplierList([]);
        setSearchTotal(0);
        setCurrentSearchValue('');
        setSelectOpen(false);
        return;
      }

      searchSuppliers(value.trim());
      setSelectOpen(true);
    };

    return debounce(loadOptions, 500);
  }, [searchSuppliers]);

  // 处理滚动到底部加载更多
  const handlePopupScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { target } = e;
    const element = target as HTMLDivElement;

    // 检查是否滚动到底部（增加5px的容差，避免因为像素精度问题导致无法触发）
    const isNearBottom = element.scrollTop + element.offsetHeight >= element.scrollHeight - 5;

    if (isNearBottom) {
      // 检查是否还有更多数据需要加载
      const hasMore = supplierList.length < searchTotal;

      if (hasMore && !isSearchLoading && currentSearchValue) {
        const nextPage = searchPageNum + 1;
        searchSuppliers(currentSearchValue, nextPage, true);
      }
    }
  }, [supplierList.length, searchTotal, isSearchLoading, currentSearchValue, searchPageNum, searchSuppliers]);

  const optionRender = (option: any) => {
    const { data = {}, label = '' } = option;
    const { original = {} } = data;
    const { wangwangId = '' } = original;
    return (
      <div className={styles.optionRender}>
        {label}
        <span className={styles.optionRenderText}>
          <WantWantIcon />
          {wangwangId}
        </span>
      </div>
    );
  };

  // 监听外部value变化 - 使用深度比较避免循环
  useEffect(() => {
    // 只有当value真正变化时才更新
    if (!isEqualArray(value, prevValueRef.current)) {
      if (value) {
        setSelectItems(value);
      } else {
        setSelectItems([]);
      }
      prevValueRef.current = value;
    }
  }, [value]);

  // 同步recommendAddedMemberIds到ref
  useEffect(() => {
    recommendAddedMemberIdsRef.current = recommendAddedMemberIds;
  }, [recommendAddedMemberIds]);

  // 监听itemInfo变化，当图片被删除或更换时清除缓存和已选供应商
  useEffect(() => {
    const currentImgUrl = itemInfo?.previewUrl || itemInfo?.offerImg || null;
    const previousImgUrl = currentImgUrlRef.current;

    // 如果图片URL真正发生变化（排除null和undefined之间的切换）
    // 只有当从有值变成无值，或从无值变成有值，或从一个有值变成另一个有值时，才触发
    const hasRealChange = currentImgUrl !== previousImgUrl &&
                         !(!currentImgUrl && !previousImgUrl); // 排除都是null/undefined的情况

    if (hasRealChange) {
      // 如果之前有图片，清除旧图片的缓存
      if (previousImgUrl) {
        recommendDataCacheRef.current.delete(previousImgUrl);
      }
      // 获取当前通过智能推荐添加的供应商ID集合
      const currentRecommendIds = recommendAddedMemberIdsRef.current;

      // 只有当有智能推荐供应商时才清空，避免不必要的onChange调用
      if (currentRecommendIds.size > 0) {
        // 如果当前没有图片，清除数据并关闭Modal，同时清空通过智能推荐添加的供应商
        if (!currentImgUrl) {
          setRecommendData([]);
          setRecommendModalOpen(false);
          // 清空通过智能推荐添加的供应商
          setSelectItems((prevItems) => {
            const nonRecommendItems = prevItems.filter((item) => !currentRecommendIds.has(item.memberId));
            onChange?.(nonRecommendItems);
            return nonRecommendItems;
          });
          setRecommendAddedMemberIds(new Set());
        } else {
          // 如果更换了图片，关闭Modal（下次打开会用新图片重新请求）
          // 同时清空通过智能推荐添加的供应商（因为图片变了，之前的供应商-商品对应关系不再有效）
          setRecommendModalOpen(false);
          setSelectItems((prevItems) => {
            const nonRecommendItems = prevItems.filter((item) => !currentRecommendIds.has(item.memberId));
            onChange?.(nonRecommendItems);
            return nonRecommendItems;
          });
          setRecommendAddedMemberIds(new Set());
        }
      } else {
        // 即使没有智能推荐供应商，也要更新ref和关闭Modal
        if (!currentImgUrl) {
          setRecommendData([]);
          setRecommendModalOpen(false);
        } else {
          setRecommendModalOpen(false);
        }
      }
    }

    currentImgUrlRef.current = currentImgUrl;
  }, [itemInfo?.previewUrl, itemInfo?.offerImg, onChange]);


  return (
    <IndexBlock
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <NumberIcon />
          <span>{$t("global-1688-ai-app.inquiry.ChooseSuppliers.stuis", "选择咨询供应商")}</span>
        </div>
      }
      subTitle={$t("global-1688-ai-app.inquiry.ChooseSuppliers.zkg", "(最多可添加6个)")}
    >
      <div className={`${selectItems.length > 0 && !disabled ? styles.hasSelectItems : styles.chooseSuppliers}`}>
        { !disabled && <Select
          showSearch
          removeIcon
          style={{ width: '100%' }}
          placeholder={$t("global-1688-ai-app.inquiry.ChooseSuppliers.qtauthh", "请输入公司名，支持用逗号、顿号、空格符或回车来分隔")}
          optionFilterProp="children"
          onChange={handleSelect}
          suffixIcon={
            <Button
              icon={<AddIcon />}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleOpen();
              }}
              disabled={selectItems.length >= maxSelectCount || disabled || recommendAddedMemberIds.size > 0}
              className={styles.addSupplierBtn}
            >
              {$t("global-1688-ai-app.inquiry.ChooseSuppliers.cgyskadd", "从供应商库添加")}
            </Button>
          }
          onSearch={handleSearch}
          onPopupScroll={handlePopupScroll}
          options={supplierList}
          filterOption={false}
          value={null}
          optionRender={optionRender}
          disabled={disabled || recommendAddedMemberIds.size > 0}
          loading={isSearchLoading}
          open={selectOpen}
          onDropdownVisibleChange={(open) => {
            // 只有当有搜索内容时才允许打开下拉框
            if (open && supplierList.length === 0) {
              setSelectOpen(false);
            } else {
              setSelectOpen(open);
            }
          }}
          dropdownRender={(menu) => (
            <>
              {menu}
              {isSearchLoading && (
                <div style={{ padding: '8px', textAlign: 'center', color: '#999' }}>{$t("global-1688-ai-app.inquiry.ChooseSuppliers.loading", "加载中...")}</div>
              )}
              {supplierList.length > 0 && supplierList.length >= searchTotal && (
                <div style={{ padding: '8px', textAlign: 'center', color: '#999' }}>{$t("global-1688-ai-app.inquiry.ChooseSuppliers.yiD", "已加载全部数据")}</div>
              )}
            </>
          )}
        />}
        {
          selectItems.length > 0 && (
            <QueueAnim component="ul" type={['right', 'left']} leaveReverse className={`${styles.supplierList} ${disabled ? styles.disabledSupplierList : ''}`}>
              {selectItems.map((supplier) => (
                <div className={styles.supplierListItem} key={supplier.memberId}>
                  <SupplierItem
                    supplier={supplier}
                    showCheckbox={false}
                    showDelete={!disabled}
                    onDelete={disabled ? undefined : handleDelete}
                    disableCardCursor
                  />
                </div>
              ))}
            </QueueAnim>
          )
        }
      </div>
      <SupplierLibrary
        open={open}
        onClose={() => { setOpen(false); }}
        onConfirm={handleModalConfirm}
        maxSelection={maxSelectCount}
        selectItems={selectItems}
      />
      {showFindSupplierTip && !disabled && !selectItems.some(item => !recommendAddedMemberIds.has(item.memberId)) && (
        <div
          className={styles.findSupplierTipAI}
          onClick={async () => {
            const imgUrl = itemInfo?.previewUrl || itemInfo?.offerImg;
            if (!imgUrl) {
              message.warning($t("global-1688-ai-app.inquiry.ChooseSuppliers.qooi", "请先上传商品图片"));
              return;
            }

            // 立即打开Modal
            setRecommendModalOpen(true);

            // 检查缓存
            const cachedData = recommendDataCacheRef.current.get(imgUrl);
            if (cachedData) {
              // 使用缓存数据
              setRecommendData(cachedData);
              setIsRecommendLoading(false);
              return;
            }

            // 如果没有缓存，请求接口
            setIsRecommendLoading(true);
            try {
              const result = await getSupplierRecommend({ imgUrl });
              console.log('供应商推荐接口返回结果:', result);
              if (result?.success && result?.data) {
                // 缓存数据
                recommendDataCacheRef.current.set(imgUrl, result.data);
                setRecommendData(result.data.supplierList);
                setRespBlockedRate(result.data.respBlockedRate);
              } else {
                message.error(result?.msg || $t("global-1688-ai-app.inquiry.ChooseSuppliers.hrma", "获取供应商推荐失败"));
                setRecommendModalOpen(false);
              }
            } catch (error) {
              console.error('调用供应商推荐接口失败:', error);
              message.error('获取供应商推荐失败');
              setRecommendModalOpen(false);
            } finally {
              setIsRecommendLoading(false);
            }
          }}
        >
          <StarBadgeIcon />
          <span className={styles.tipTextAI}>
            {recommendAddedMemberIds.size > 0 ? $t("global-1688-ai-app.inquiry.ChooseSuppliers.glgys", "管理供应商") : $t("global-1688-ai-app.inquiry.ChooseSuppliers.zod", "智能推荐供应商")}
          </span>
          <span className={styles.arrowAI}>→</span>
        </div>
      )}
      <SupplierRecommendModal
        open={recommendModalOpen}
        onClose={() => {
          // Modal关闭时不卸载，只隐藏
          setRecommendModalOpen(false);
        }}
        respBlockedRate={respBlockedRate}
        data={recommendData}
        loading={isRecommendLoading}
        maxSelection={maxSelectCount}
        selectedMemberIds={new Set(selectItems.map((item) => item.memberId))}
        onConfirm={(selectedSuppliers) => {
          // 获取当前已选供应商中不是通过智能推荐添加的（保留这些）
          const nonRecommendItems = selectItems.filter((item) => !recommendAddedMemberIds.has(item.memberId));

          // 从Modal选中的供应商中构建新的供应商列表
          const recommendSuppliers = selectedSuppliers.map((item) => ({
            memberId: item.providerInfo.memberId,
            companyName: item.providerInfo.companyName,
            headImg: item.providerInfo.headImg,
            wangwangId: item.providerInfo.wangwangId,
          }));

          // 合并：保留非智能推荐的 + Modal中选中的智能推荐供应商
          const updatedSelectItems = [...nonRecommendItems, ...recommendSuppliers].slice(0, maxSelectCount);
          setSelectItems(updatedSelectItems);

          // 更新通过智能推荐添加的供应商 memberId 集合
          setRecommendAddedMemberIds(new Set(recommendSuppliers.map((s) => s.memberId)));

          onChange?.(updatedSelectItems);

          // 通知父组件用户通过智能推荐选择了供应商，传递供应商和商品的对应关系
          // 构建供应商和商品的对应关系数组
          const supplierItemPairs = selectedSuppliers.map((item) => ({
            memberId: item.providerInfo.memberId,
            itemId: item.itemInfo?.itemId?.toString(),
          }));
          onRecommendSelect?.(recommendSuppliers, supplierItemPairs);

          const addedCount = recommendSuppliers.length;
          message.success(addedCount > 0 ? $t("global-1688-ai-app.inquiry.ChooseSuppliers.yts", `已更新 ${addedCount} 个供应商`, [addedCount]) : $t("global-1688-ai-app.inquiry.ChooseSuppliers.ytSt", "已更新供应商选择"));
        }}
      />
    </IndexBlock >
  );
};

export default ChooseSuppliers;
