import { Form, message } from 'antd';
import style from '../index.module.css';
import { imgIcon } from '@/components/ChatFlow/imgIcon';
import { Select } from 'antd';
import { search } from '../services';
import { useState, useEffect } from 'react';
import { $t } from '@/i18n';

const FollowedCategoriesItem = (props) => {
  const { form, platform = 'tiktok', region, cateLev1Id, isGetCateLev2Id, isRequired = false, label = true } = props;
  const [categoryList, setCategoryList] = useState<{ categoryId: string; categoryName: string; categoryNameCn: string }[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageNum, setPageNum] = useState(1);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [secondCategoryList, setSecondCategoryList] = useState<{ categoryId: string; categoryName: string, categoryNameCn: string }[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [secondPageNum, setSecondPageNum] = useState(1);
  const [secondHasMore, setSecondHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [secondLoading, setSecondLoading] = useState(false);
  
  const getSearch = (cateLev1Id?: string, isLoadMore: boolean = false) => {
    if (cateLev1Id) {
      if (secondLoading) return;
      setSecondLoading(true);
    } else {
      if (loading) return;
      setLoading(true);
    }

    const currentPageNum = cateLev1Id 
      ? (isLoadMore ? secondPageNum : 1)
      : (isLoadMore ? pageNum : 1);
    
    search({
      pageSize,
      pageNum: currentPageNum,
      platform,
      region,
      cateLev1Id,
    }).then(res => {
      const { success, categoryInfoList = [], hasMore: hasMoreData = false, msg = $t("global-1688-ai-app.ChatFlow.RequirementFormCard.FollowedCategoriesItem.smrsr", "系统异常，请稍后重试") } = res;
      
      if (success) {
        if (cateLev1Id) {
          if (isLoadMore) {
            setSecondCategoryList(prev => {
              const existingIds = new Set(prev.map(item => item.categoryId));
              const newItems = categoryInfoList?.filter(item => !existingIds.has(item?.categoryId));
              return [...prev, ...newItems];
            });
          } else {
            setSecondCategoryList(categoryInfoList);
            setSecondPageNum(1);
          }
          setSecondHasMore(hasMoreData);
        } else {
          if (isLoadMore) {
            setCategoryList(prev => {
              const existingIds = new Set(prev.map(item => item.categoryId));
              const newItems = categoryInfoList?.filter(item => !existingIds.has(item.categoryId));
              return [...prev, ...newItems];
            });
          } else {
            setCategoryList(categoryInfoList);
          }
          setHasMore(hasMoreData);
        }
      } else {
        message.error(msg);
      }
    }).catch(error => {
      message.error('加载失败，请重试');
    }).finally(() => {
      // 重置加载状态
      if (cateLev1Id) {
        setSecondLoading(false);
      } else {
        setLoading(false);
      }
    });
  }
  const onSelectCategory = (value: string) => {
    setSelectedCategoryId(value);
    setSecondPageNum(1);
    setSecondHasMore(true);
    setSecondLoading(false); // 重置二级类目加载状态
    getSearch(value);
    form?.setFieldValue('cateLev2Id', undefined);
  }
  const handlePopupScroll = (e: any) => {
    const { target } = e;
    const { scrollTop, scrollHeight, clientHeight } = target;
    // 只有在有更多数据且未在加载时才触发
    if (scrollTop + clientHeight >= scrollHeight - 10 && hasMore && !loading) {
      setPageNum(prev => prev + 1);
    }
  };
  const handleSecondPopupScroll = (e: any) => {
    const { target } = e;
    const { scrollTop, scrollHeight, clientHeight } = target;
    if (scrollTop + clientHeight >= scrollHeight - 10 && secondHasMore && !secondLoading) {
      setSecondPageNum(prev => prev + 1);
    }
  };
  // const onOpenChange = (open: boolean) => {
  //   if (open) {
  //     getSearch();
  //   }
  // }
  useEffect(() => {
    if (region) {
      getSearch();
    }
  }, [region]);
  useEffect(() => {
    if (pageNum > 1) {
      getSearch(undefined, true);
    }
  }, [pageNum]);
  useEffect(() => {
    if (isGetCateLev2Id) {
      if (cateLev1Id){
        getSearch(cateLev1Id);
      } else {
        getSearch(undefined, true);
      }
    }
  }, [cateLev1Id]);
  useEffect(() => {
    if (secondPageNum > 1 && selectedCategoryId) {
      getSearch(selectedCategoryId, true);
    }
  }, [secondPageNum, selectedCategoryId]);
  return (
    <Form.Item
      label={
        label && <div className={style.requirementFormCardLabel}>
          <img className={style.imgIcon} src={imgIcon[2]} alt="" srcSet="" />
          <div className={style.requirementFormCardLabelText}>{$t("global-1688-ai-app.ChatFlow.RequirementFormCard.FollowedCategoriesItem.followdlm", "关注的类目")}</div>
          {isRequired && <div className={style.requirementFormCardLabelRequired}>*</div>}
        </div>
      }
      className={style.followedCategoriesItem}
    >
      <Form.Item name="cateLev1Id" rules={isRequired ? [{ required: true, message: $t("global-1688-ai-app.ChatFlow.RequirementFormCard.FollowedCategoriesItem.selectejlm", "选择二级类目") }] : undefined} noStyle={false}>
        <Select
          placeholder={$t("global-1688-ai-app.ChatFlow.RequirementFormCard.FollowedCategoriesItem.selectyjlm", "选择一级类目")}
          style={{ width: '100%' }}
          onChange={onSelectCategory}
          value={selectedCategoryId}
          onPopupScroll={handlePopupScroll}
          // onOpenChange={onOpenChange}
          options={categoryList?.map(item => ({
            label: `${item.categoryName} (${item.categoryNameCn})`,
            value: item.categoryId,
            key: item.categoryId,
          }))}
          listHeight={200}
        />
      </Form.Item>
      <Form.Item name="cateLev2Id" rules={isRequired ? [{ required: true, message: $t("global-1688-ai-app.ChatFlow.RequirementFormCard.FollowedCategoriesItem.selectejlm", "选择二级类目") }] : undefined} noStyle={false}>
        <Select
          placeholder={$t("global-1688-ai-app.ChatFlow.RequirementFormCard.FollowedCategoriesItem.selectejlm", "选择二级类目")}
          style={{ width: '100%' }}
          onPopupScroll={handleSecondPopupScroll}
          options={secondCategoryList?.map(item => ({
            label: `${item.categoryName} (${item.categoryNameCn})`,
            value: item.categoryId,
            key: item.categoryId,
          }))}
          listHeight={200}
        />
      </Form.Item>
    </Form.Item>
  )
};

export default FollowedCategoriesItem;