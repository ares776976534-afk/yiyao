import React, { useState, useEffect, useRef, useMemo } from 'react';
import '../index.scss';
import { Form, Field, CascaderSelect, Select, Input, Icon, Pagination, Checkbox, Button } from '@alifd/next';
import { CustomRadioGroup, CustomRadio } from '../components';
import { NewCountCard } from './NewCountCard';
import { ViewModal } from './ViewModal';
import { DeliverModal } from './DeliverModal';
import { useDebounceFn } from 'ahooks';
import { getOppFilterOption, getOppList } from '../api';

const distributeChannel = 'QQYX_NEW_ITEM';

export const NewOPP = () => {
  const field = Field.useField({ parseName: true });
  const [selectedRegion, setSelectedRegion] = useState('vietnam');
  const [sameModalVisible, setSameModalVisible] = useState(false);
  const [deliverModalVisible, setDeliverModalVisible] = useState(false);
  const [pageSize, setPageSize] = useState(20);
  const [list, setList] = useState([]);
  const [current, setCurrent] = useState(1);
  const [oppEnums, setOppEnums] = useState({});
  const [oppRegionOptions, setOppRegionOptions] = useState([]);
  const [oppTypeOptions, setOppTypeOptions] = useState([]);
  const [oppPlatformOptions, setOppPlatformOptions] = useState([]);
  const [total, setTotal] = useState(0);
  const [oppMatchId, setOppMatchId] = useState('');
  const [deliverData, setDeliverData] = useState({});
  const [isComposing, setIsComposing] = useState(false);
  const lastKeywordRef = useRef('');
  const [enumsReady, setEnumsReady] = useState(false);
  const [cate, setCate] = useState([]);

  // oppType -> oppPlatform -> oppRegion 三级联动映射
  const typeToPlatformRef = useRef({});
  const tpToRegionRef = useRef({});
  const typeToRegionRef = useRef({});

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

  const cleanCate = useMemo(() => normalizeCate(cate || []), [cate]);

  // 统一的列表拉取方法
  const fetchList = (override = {}) => {
    const values = field.getValues() || {};
    const { categoryId, oppRegion, oppKeyword, oppType, oppPlatform } = { ...values, ...override };
    getOppList({
      request: {
        distributeChannel,
        categoryId,
        oppRegion,
        oppKeyword,
        oppType,
        oppPlatform,
        pageNum: override.pageNum ?? current,
        pageSize: override.pageSize ?? pageSize,
      },
    }).then((res) => {
      setList(res?.content?.list);
      setTotal(res?.content?.total);
    });
  };

  // 字段变化时：重置到第1页并发请求
  const handleFieldChange = (fieldName, value) => {
    const normalized = fieldName === 'categoryId' && Array.isArray(value) ? value[value.length - 1] : value;
    field.setValue(fieldName, normalized);
    setCurrent(1);
    fetchList({ [fieldName]: normalized, pageNum: 1 });
  };

  const { run: runOppKeywordChange, cancel: cancelOppKeywordChange } = useDebounceFn(
    (val) => {
      field.setValue('oppKeyword', val);
      setCurrent(1);
      const trimmed = (val || '').trim();
      if (trimmed === (lastKeywordRef.current || '')) {
        return;
      }
      lastKeywordRef.current = trimmed;
      fetchList({ oppKeyword: val, pageNum: 1 });
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
  };
  const handlePageSizeChange = (value) => {
    setPageSize(value);
    setCurrent(1);
  };

  useEffect(() => {
    getOppFilterOption({
      request: {
        distributeChannel,
      },
    }).then((res) => {
      setCate(res?.content?.model?.categoryTree || []);

      const oppOption = res?.content?.model?.oppOption || [];
      const typeOptions = oppOption.map((t) => ({ label: t.desc, value: t.code }));

      const typeToPlatform = {};
      const tpToRegion = {};
      const typeToRegion = {};

      oppOption.forEach((t) => {
        const children = t?.children || [];
        const hasPlatform = children.some((c) => Array.isArray(c?.children) && c.children.length > 0);
        if (hasPlatform) {
          typeToPlatform[t.code] = children.map((p) => ({ label: p.desc, value: p.code }));
          children.forEach((p) => {
            tpToRegion[`${t.code}||${p.code}`] = (p?.children || []).map((r) => ({ label: r.desc, value: r.code }));
          });
        } else {
          typeToPlatform[t.code] = [];
          typeToRegion[t.code] = children.map((r) => ({ label: r.desc, value: r.code }));
        }
      });

      typeToPlatformRef.current = typeToPlatform;
      tpToRegionRef.current = tpToRegion;
      typeToRegionRef.current = typeToRegion;

      setOppTypeOptions(typeOptions);
      const type = typeOptions[0]?.value;
      const platforms = typeToPlatform[type] || [];
      const hasPlatform = platforms.length > 0;

      if (hasPlatform) {
        setOppPlatformOptions(platforms);
        const platform = platforms[0]?.value;
        const regions = tpToRegion[`${type}||${platform}`] || [];
        setOppRegionOptions(regions);

        field.setValue('oppType', type);
        field.setValue('oppPlatform', platform);
        field.setValue('oppRegion', regions[0]?.value);
      } else {
        setOppPlatformOptions([]);
        const regions = typeToRegion[type] || [];
        setOppRegionOptions(regions);

        field.setValue('oppType', type);
        field.setValue('oppPlatform', undefined);
        field.setValue('oppRegion', regions[0]?.value);
      }

      setEnumsReady(true);
    });
  }, [field]);

  useEffect(() => {
    if (!enumsReady) return;
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enumsReady, current, pageSize]);

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
              dataSource={cleanCate}
              changeOnSelect
              hasClear
            />
          </Form.Item>

          <Form.Item label="" name="oppKeyword">
            <Input
              hasClear
              style={{ width: '200px' }}
              placeholder="商机标题或ID"
              innerAfter={<Icon type="search" style={{ color: '#999' }} />}
              onChange={handleKeywordInputChange}
              onCompositionStart={() => { setIsComposing(true); cancelOppKeywordChange(); }}
              onCompositionEnd={(e) => { setIsComposing(false); runOppKeywordChange(e?.target?.value); }}
            />
          </Form.Item>
        </div>

        <Form.Item label="" name="oppType" required>
          <CustomRadioGroup
            field={field}
            name="oppType"
            onChange={(type) => {
              const typeToPlatform = typeToPlatformRef.current || {};
              const tpToRegion = tpToRegionRef.current || {};
              const typeToRegion = typeToRegionRef.current || {};
              const platforms = typeToPlatform[type] || [];
              const hasPlatform = platforms.length > 0;

              field.setValue('oppType', type);
              setCurrent(1);

              if (hasPlatform) {
                setOppPlatformOptions(platforms);
                const platform = platforms[0]?.value;
                const regions = tpToRegion[`${type}||${platform}`] || [];
                setOppRegionOptions(regions);

                field.setValue('oppPlatform', platform);
                field.setValue('oppRegion', regions[0]?.value);
                fetchList({ oppType: type, oppPlatform: platform, oppRegion: regions[0]?.value, pageNum: 1 });
              } else {
                setOppPlatformOptions([]);
                const regions = typeToRegion[type] || [];
                setOppRegionOptions(regions);

                field.setValue('oppPlatform', undefined);
                field.setValue('oppRegion', regions[0]?.value);
                fetchList({ oppType: type, oppRegion: regions[0]?.value, pageNum: 1 });
              }
            }}
          >
            {oppTypeOptions?.map(({ label, value }) => {
              return (
                <CustomRadio
                  key={value}
                  field={field}
                  name="oppType"
                  value={value}
                >
                  {label}
                </CustomRadio>
              );
            })}
          </CustomRadioGroup>
        </Form.Item>

        {((typeToPlatformRef.current?.[field.getValue('oppType')] || []).length > 0) && (
          <Form.Item label="" name="oppPlatform" required>
            <CustomRadioGroup
              field={field}
              name="oppPlatform"
              onChange={(platform) => {
                const type = field.getValue('oppType');
                const tpToRegion = tpToRegionRef.current || {};
                const regions = tpToRegion[`${type}||${platform}`] || [];
                setOppRegionOptions(regions);

                field.setValue('oppPlatform', platform);
                field.setValue('oppRegion', regions[0]?.value);
                setCurrent(1);
                fetchList({ oppPlatform: platform, oppRegion: regions[0]?.value, pageNum: 1 });
              }}
            >
              {oppPlatformOptions?.map(({ label, value }) => {
                return (
                  <CustomRadio
                    key={value}
                    field={field}
                    name="oppPlatform"
                    value={value}
                  >
                    {label}
                  </CustomRadio>
                );
              })}
            </CustomRadioGroup>
          </Form.Item>
        )}

        {oppRegionOptions?.length > 0 && (
          <Form.Item label="" name="oppRegion" style={{ marginRight: '16px' }}>
            <Select
              placeholder="请选择地区"
              onChange={(value) => handleFieldChange('oppRegion', value)}
              dataSource={oppRegionOptions}
              hasClear
            />
          </Form.Item>
        )}

      </Form>

      {
        list?.length > 0 ? (
          <div className="card-list">
            {list?.map((item) => {
              return (<NewCountCard
                data={item}
                key={item.oppMatchId}
                onSameClick={item.matchItemCnt > 0 ? () => {
                  setSameModalVisible(true);
                  setOppMatchId(item.oppMatchId);
                } : undefined}
                onDeliverClick={() => {
                  setDeliverModalVisible(true);
                  setDeliverData(item);
                }}
              />);
            })}
          </div>
        ) : (
          <div style={{ height: '600px', fontSize: '16px', padding: '250px 0', textAlign: 'center', color: '#999' }}>{enumsReady ? '暂无数据' : '加载中...'}</div>
        )
      }

      <div className="pagination">
        {
          total && <Pagination
            pageSizeList={[20, 50, 100]}
            pageSizeSelector="dropdown"
            pageSizePosition="start"
            total={total}
            current={current}
            onChange={handleChange}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
          />
        }
      </div>

      <ViewModal
        visible={sameModalVisible}
        onClose={() => setSameModalVisible(false)}
        oppMatchId={oppMatchId}
      />

      <DeliverModal
        visible={deliverModalVisible}
        onClose={() => setDeliverModalVisible(false)}
        data={deliverData}
      />
    </div >
  );
};
