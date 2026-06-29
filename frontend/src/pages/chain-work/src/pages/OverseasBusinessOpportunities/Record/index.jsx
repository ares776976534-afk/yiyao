import React, { useState, useEffect, useRef } from 'react';
import {
  Table,
  Input, Icon, Button, Balloon, Pagination, Form, Field,
  Message,
} from '@alifd/next';
import ChartModal from './ChartModal';
import '../index.scss';
import { queryOppEnums, querySignUpRecord } from '../api';
// import { WaveChartIcon } from './WaveChartIcon';
import { joinOfferQqjx } from '../../CrossBorderOfferlist/api';
import { useDebounceFn } from 'ahooks';

const { Tooltip } = Balloon;

export const Record = () => {
  const [visible, setVisible] = useState(false);
  const [oppRegionOptions, setOppRegionOptions] = useState([]);
  const [current, setCurrent] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [list, setList] = useState([]);
  const [itemId, setItemId] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const lastKeywordRef = useRef('');

  const field = Field.useField({ parseName: true });

  const fetchList = (override = {}) => {
    const values = field.getValues() || {};
    const { categoryId, oppRegion, oppKeyword } = { ...values, ...override };
    querySignUpRecord({
      queryParam: {
        categoryId,
        oppRegion,
        oppKeyword,
        pageNum: override.pageNum ?? current,
        pageSize: override.pageSize ?? pageSize,
      },
    }).then((res) => {
      setList(res?.content?.list || []);
      setTotal(res?.content?.total || 0);
    });
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

  const columns = [
    {
      title: '商品信息',
      dataIndex: 'itemId',
      key: 'itemId',
      cell: (value, index, record) => {
        return (
          <div className="flex gap-2">
            <img
              src={record?.itemPic}
              alt={record.title}
              style={{ width: 80, height: 80, borderRadius: 6 }}
            />
            <div className="text-[13px] text-[#333]">
              <Tooltip
                v2
                trigger={
                  <div
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '200px',
                      display: 'block',
                    }}
                  >
                    {record?.itemTitle}
                  </div>
                }
                align="t"
                arrowPointToCenter
              >
                {record?.itemTitle}
              </Tooltip>

              <p className="text-[#999] text-[13px]">ID：{value}</p>
              <p className="text-[13px]">¥{record?.itemPrice}</p>
              <p className="text-[#999] text-[13px]">{record?.categoryName}</p>
            </div>
          </div>
        );
      },
    },
    {
      title: '商机信息',
      dataIndex: 'oppId',
      key: 'oppId',
      cell: (value, index, record) => {
        return (
          <div className="flex gap-2">
            <img
              src={record?.oppPic}
              alt={record.title}
              style={{ width: 80, height: 80, borderRadius: 6 }}
            />
            <div className="text-[13px] text-[#333]">
              <Tooltip
                v2
                trigger={
                  <div
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '200px',
                      display: 'block',
                    }}
                  >
                    {record?.oppTitle}
                  </div>
                }
                align="t"
                arrowPointToCenter
              >
                {record?.oppTitle}
              </Tooltip>

              <p className="text-[#999] text-[13px]">ID：{value}</p>
            </div>
          </div>
        );
      },
    },
    {
      title: (
        <div>是否商机同款
          <Tooltip
            v2
            trigger={<Icon type="d-help" size="small" style={{ marginLeft: 2 }} />}
            align="t"
            arrowPointToCenter
            popupStyle={{ backgroundColor: '#333' }}
            popupClassName="products-business-tooltips"
          >
            商机同款可获得流量权益
          </Tooltip>
        </div>
      ),
      dataIndex: 'auditStatus',
      key: 'auditStatus',
      cell: (value) => {
        if (value === 'PASS') {
          return <span className="text-[#3BB347]">是</span>;
        }
        if (value === 'AUDITING') {
          return <span className="text-[#0077FF]">审核中</span>;
        }
        return <span className="text-[#FB3B20]">否</span>;
      },
    },
    {
      title: (
        <div>是否加入全球严选
          <Tooltip
            v2
            trigger={<Icon type="d-help" size="small" style={{ marginLeft: 2 }} />}
            align="t"
            arrowPointToCenter
            popupStyle={{ backgroundColor: '#333' }}
            popupClassName="products-business-tooltips"
          >
            全球严选可获得流量权益
          </Tooltip>
        </div>
      ),
      dataIndex: 'joinQqyxStatus',
      key: 'joinQqyxStatus',
      cell: (value) => {
        if (value === 'JOIN_SUCCESS') {
          return <div>是</div>;
        } else if (value === 'NOT_JOIN') {
          return <div>否</div>;
        } else if (value === 'JOIN_FAIL') {
          return <div>加入失败</div>;
        }
      },
    },
    // {
    //   title: '商品曝光数据',
    //   dataIndex: 'exposureTimes',
    //   key: 'exposureTimes',
    //   cell: (value, index, record) => {
    //     return (
    //       <div className="flex items-center">
    //         <span>{value}</span>
    //         <WaveChartIcon
    //           size={24}
    //           color="#0077FF"
    //           style={{
    //             marginLeft: '4px',
    //             cursor: 'pointer',
    //           }}
    //           onClick={() => {
    //             setItemId(record.itemId);
    //             setVisible(true);
    //           }}
    //         />
    //       </div>
    //     );
    //   },
    // },
    {
      title: '操作',
      dataIndex: 'joinQqyxStatus',
      cell: (value, index, record) => {
        if (value === 'JOIN_SUCCESS') {
          return <div>-</div>;
        } else {
          return (
            <div>
              <Button
                type="primary"
                text
                onClick={() => {
                  joinOfferQqjx({ itemId: record.itemId }).then((res) => {
                    if (res.data.bizSuccess === 'true') {
                      fetchList();
                      Message.success('加入全球严选成功');
                    } else {
                      Message.error(res.data.bizMsg);
                    }
                  });
                }}
              >加入全球严选
              </Button>
            </div>
          );
        }
      },
    },
  ];

  // 字段变化时：重置到第1页并发请求
  const handleFieldChange = (fieldName, value) => {
    field.setValue(fieldName, value);
    setCurrent(1);
    fetchList({ [fieldName]: value, pageNum: 1 });
  };

  const handleChange = (value) => {
    setCurrent(value);
  };
  const handlePageSizeChange = (value) => {
    setPageSize(value);
    setCurrent(1);
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, pageSize]);

  useEffect(() => () => cancelOppKeywordChange(), [cancelOppKeywordChange]);

  useEffect(() => {
    queryOppEnums().then((res) => {
      const _oppRegionOptions = res?.content?.model?.oppRegion?.map(({ code, desc }) => ({
        label: desc,
        value: code,
      }));
      setOppRegionOptions(_oppRegionOptions);
    });
  }, []);

  return (
    <div className="tab-content">
      <Form
        field={field}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          {/* <Form.Item label="" name="categoryId" style={{ marginRight: '16px' }}>
            <CascaderSelect
              placeholder="请选择类目"
              onChange={(value) => handleFieldChange('categoryId', value)}
              labelKey="cateName"
              valueKey="id"
              dataSource={cate}
              canOnlySelectLeaf={false}
              changeOnSelect
              hasClear
            />
          </Form.Item> */}

          {/* <Form.Item label="" name="oppRegion" style={{ marginRight: '16px' }}>
            <Select
              placeholder="请选择地区"
              onChange={(value) => handleFieldChange('oppRegion', value)}
              dataSource={oppRegionOptions}
              hasClear
            />
          </Form.Item> */}

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
      </Form>

      <Table
        dataSource={list}
        columns={columns}
      />

      <div className="pagination">

        <Pagination
          pageSizeList={[20, 50, 100]}
          current={current}
          pageSizePosition="start"
          pageSizeSelector="dropdown"
          onChange={handleChange}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          total={total}
        />
      </div>

      <ChartModal
        visible={visible}
        itemId={itemId}
        onClose={() => {
          setVisible(false);
        }}
      />
    </div>
  );
};
