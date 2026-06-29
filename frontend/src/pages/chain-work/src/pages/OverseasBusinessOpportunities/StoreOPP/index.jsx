import React, { useEffect, useState, useRef, useMemo } from 'react';
import '../index.scss';
import { Form, Field, CascaderSelect, Input, Icon, Pagination, Checkbox, Button } from '@alifd/next';
import { CardRadioGroup } from '../components';
import { StoreCard } from './StoreCard';
import { BatchModal } from './BatchModal';
import { getOppFilterOption, getOppList } from '../api';
import { getOppCard } from '../../AliExpress/services';
import { useDebounceFn } from 'ahooks';

const distributeChannel = 'QQYX_SHOP_ITEM';

export const StoreOPP = () => {
  const field = Field.useField({ parseName: true });
  const [list, setList] = useState([]);
  const [current, setCurrent] = useState(1);
  const [allSelected, setAllSelected] = useState(false);
  const [selectedList, setSelectedList] = useState([]);
  const [excludeList, setExcludeList] = useState([]);
  const [total, setTotal] = useState(0);
  const [selectedCount, setSelectedCount] = useState(0);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [cardList, setCardList] = useState([]);
  const [pageSize, setPageSize] = useState(20);
  const [isComposing, setIsComposing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cate, setCate] = useState([]);

  // 仅映射 label/value/children，避免额外字段干扰组件渲染；value 统一转为字符串
  const normalizeCate = (nodes = []) => (nodes || []).map((n) => {
    const rawChildren = n?.children || n?.childList || n?.child || n?.nodes || n?.list || [];
    const label = n?.cateName ?? n?.name ?? n?.cat3Name ?? n?.cat2Name ?? n?.cat1Name ?? n?.cateDesc ?? n?.desc ?? n?.categoryName ?? n?.title ?? '';
    const rawValue = n?.id ?? n?.cateId ?? n?.cat3Id ?? n?.cat2Id ?? n?.cat1Id ?? n?.cateCode ?? n?.code ?? n?.categoryId;
    return {
      label,
      value: rawValue != null ? String(rawValue) : '',
      children: normalizeCate(rawChildren),
    };
  });

  const cateOptions = useMemo(() => normalizeCate(cate || []), [cate]);

  // 字段变化时：重置到第1页并发起请求
  const handleFieldChange = (fieldName, value) => {
    const normalized = fieldName === 'categoryId' && Array.isArray(value) ? value[value.length - 1] : value;
    field.setValue(fieldName, normalized);
    setCurrent(1);
    const values = field.getValues();
    const { strategyId, categoryId, oppKeyword } = { ...values, [fieldName]: normalized };
    setIsLoading(true);
    getOppList({
      request: {
        distributeChannel,
        strategyId: strategyId || cardList?.[0]?.strategyId,
        categoryId,
        oppKeyword,
        pageNum: 1,
        pageSize,
      },
    }).then((res) => {
      setList(res?.content?.list);
      setTotal(res?.content?.total);
    }).finally(() => setIsLoading(false));
  };

  const { run: runOppKeywordChange, cancel: cancelOppKeywordChange } = useDebounceFn(
    (val) => {
      field.setValue('oppKeyword', val);
      setCurrent(1);
      const values = field.getValues();
      const { strategyId, categoryId } = values || {};
      setIsLoading(true);
      getOppList({
        request: {
          distributeChannel,
          strategyId: strategyId || cardList?.[0]?.strategyId,
          categoryId,
          oppKeyword: val,
          pageNum: 1,
          pageSize,
        },
      }).then((res) => {
        setList(res?.content?.list);
        setTotal(res?.content?.total);
      }).finally(() => setIsLoading(false));
    },
    { wait: 600, leading: false, trailing: true },
  );

  const handleKeywordInputChange = (value) => {
    if (isComposing) return;
    runOppKeywordChange(value);
  };

  useEffect(() => () => cancelOppKeywordChange(), [cancelOppKeywordChange]);

  const handleChange = (value) => {
    setCurrent(value);
    const values = field.getValues();
    const { strategyId, categoryId, oppKeyword } = values || {};
    setIsLoading(true);
    getOppList({
      request: {
        distributeChannel,
        strategyId: strategyId || cardList?.[0]?.strategyId,
        categoryId,
        oppKeyword,
        pageNum: value,
        pageSize,
      },
    }).then((res) => {
      setList(res?.content?.list);
      setTotal(res?.content?.total);
    }).finally(() => setIsLoading(false));
  };
  const handlePageSizeChange = (value) => {
    setPageSize(value);
    setCurrent(1);
    const values = field.getValues();
    const { strategyId, categoryId, oppKeyword } = values || {};
    setIsLoading(true);
    getOppList({
      request: {
        distributeChannel,
        strategyId: strategyId || cardList?.[0]?.strategyId,
        categoryId,
        oppKeyword,
        pageNum: 1,
        pageSize: value,
      },
    }).then((res) => {
      setList(res?.content?.list);
      setTotal(res?.content?.total);
    }).finally(() => setIsLoading(false));
  };

  useEffect(() => {
    // 查询枚举 → 用默认策略触发一次列表查询
    getOppCard({
      request: {
        distributeChannel,
      },
    }).then((res) => {
      setCardList(res?.model);
      const defaultStrategyId = res?.model?.[0]?.strategyId;
      if (defaultStrategyId) {
        handleFieldChange('strategyId', defaultStrategyId);
      } else {
        setIsLoading(false);
      }
    });

    getOppFilterOption({
      request: {
        distributeChannel,
      },
    }).then((res) => {
      setCate(res?.content?.model?.categoryTree || []);
    });
  }, []);

  return (
    <div className="tab-content">
      <Form
        field={field}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <Form.Item label="" name="categoryId" style={{ marginRight: '16px' }}>
            <CascaderSelect
              placeholder="请选择类目"
              onChange={(value) => handleFieldChange('categoryId', value)}
              dataSource={cateOptions}
              changeOnSelect
              hasClear
            />
          </Form.Item>
          <Form.Item label="" name="oppKeyword">
            <Input
              style={{ width: '200px' }}
              placeholder="商机标题或ID"
              innerAfter={<Icon type="search" style={{ color: '#999' }} />}
              hasClear
              onChange={handleKeywordInputChange}
              onCompositionStart={() => { setIsComposing(true); cancelOppKeywordChange(); }}
              onCompositionEnd={(e) => { setIsComposing(false); runOppKeywordChange(e?.target?.value); }}
            />
          </Form.Item>
        </div>

        <Form.Item label="" name="strategyId" required>
          <CardRadioGroup
            field={field}
            name="strategyId"
            onChange={(value) => handleFieldChange('strategyId', value)}
            dataSource={cardList}
          />
        </Form.Item>
      </Form>

      <div className="action">
        <Checkbox
          onChange={(checked) => {
            setAllSelected(checked);
            if (checked) {
              setSelectedList(list.map((item) => item.oppMatchId));
              setExcludeList([]);
              setSelectedCount(total);
            } else {
              setSelectedList([]);
              setSelectedCount(0);
            }
          }}
        >
          全选
        </Checkbox>

        <span style={{ color: '#999999' }} >已选</span>
        <span style={{
          color: '#333333',
          fontSize: '14px',
          fontWeight: '500',
          marginLeft: '3px',
          marginRight: '3px',
        }}
        >
          {selectedCount}/{total}
        </span>
        <span style={{ color: '#999999' }} >个商机</span>

        <Button
          style={{ marginLeft: '20px' }}
          type="primary"
          disabled={selectedCount === 0}
          onClick={() => {
            setBatchModalOpen(true);
          }}
        >批量报名
        </Button>
      </div >

      {list?.length > 0 ? (
        <div className="card-list">
          {list?.map((item) => {
            const { oppMatchId } = item;
            return (
              <StoreCard
                data={item}
                checked={selectedList.includes(oppMatchId)}
                key={oppMatchId}
                onCheck={(checked) => {
                  if (checked) {
                    if (allSelected) {
                      setExcludeList(excludeList.filter((_item) => _item !== oppMatchId));
                    }
                    setSelectedList([...selectedList, oppMatchId]);
                    setSelectedCount(selectedCount + 1);
                  } else {
                    if (allSelected) {
                      setExcludeList([...excludeList, oppMatchId]);
                    }
                    setSelectedList(selectedList.filter((_item) => _item !== oppMatchId));
                    setSelectedCount(selectedCount - 1);
                  }
                }}
                onEnroll={() => {
                  setSelectedList([oppMatchId]);
                  setAllSelected(false);
                  setSelectedCount(1);
                  setBatchModalOpen(true);
                }}
              />);
          })}
        </div>
      ) : (
        <div style={{ height: '600px', fontSize: '16px', padding: '250px 0', textAlign: 'center', color: '#999' }}>{isLoading ? '加载中...' : '暂无数据'}</div>
      )}

      <div className="pagination">
        {
          total &&
          <Pagination
            pageSizeList={[20, 50, 100]}
            pageSizeSelector="dropdown"
            pageSizePosition="start"
            current={current}
            total={total}
            pageSize={pageSize}
            onChange={handleChange}
            onPageSizeChange={handlePageSizeChange}
          />
        }
      </div>

      <BatchModal
        visible={batchModalOpen}
        onClose={() => setBatchModalOpen(false)}
        count={selectedCount}
        isSelectAll={allSelected}
        field={field}
        excludeList={excludeList}
        selectedList={selectedList}
      />
    </div >
  );
};
