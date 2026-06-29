import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Image, Tooltip, Typography, Form, Input, Select, Checkbox, Pagination, ConfigProvider } from 'antd';
import './index.scss';
import { calc } from 'antd/es/theme/internal';
import zhCN from 'antd/es/locale/zh_CN';
import { pageOwOfferMember } from '../../services';

const { Text } = Typography;
const { Option } = Select;
const List = ({ enums, insufficientMargin, shouldFilterRestrictedSales, onFilterRestrictedSalesComplete }) => {
  const { region = [], verifyStatus = [] } = enums;
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchForm] = Form.useForm();
  const [total, setTotal] = useState(0);
  const [jumpPage, setJumpPage] = useState('');
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({});
  // 初始化数据
  useEffect(() => {
    handlePageOwOfferMember(1, pageSize, {});
  }, []);

  // 监听筛选禁售商品的触发
  useEffect(() => {
    if (shouldFilterRestrictedSales) {
      // 清空所有表单字段，然后只设置筛选禁售商品为true
      searchForm.resetFields();
      searchForm.setFieldsValue({ isRestrictedSales: true });

      // 更新搜索参数并查询（只保留筛选禁售商品条件）
      const newSearchParams = { isRestrictedSales: true };
      setSearchParams(newSearchParams);
      setCurrent(1);

      // 立即执行查询
      handlePageOwOfferMember(1, pageSize, newSearchParams);

      // 通知父组件已完成筛选
      if (onFilterRestrictedSalesComplete) {
        onFilterRestrictedSalesComplete();
      }
    }
  }, [shouldFilterRestrictedSales, searchForm, pageSize, onFilterRestrictedSalesComplete]);

  const handlePageOwOfferMember = (pageNum = current, pageSizeParam = pageSize, searchParamsParam = searchParams) => {
    setLoading(true);
    const params = {
      pageNum,
      pageSize: pageSizeParam,
      ...searchParamsParam,
    };

    pageOwOfferMember(params).then((res) => {
      const { success = false } = res;
      if (success) {
        setDataSource(res?.list || []);
        setTotal(res?.total || 0);
      }
    }).finally(() => {
      setLoading(false);
    });
  };

  // 搜索表单提交
  const onSearchFinish = (values) => {
    // 更新搜索参数和重置页码
    setSearchParams(values);
    setCurrent(1);
    // 立即执行搜索请求
    handlePageOwOfferMember(1, pageSize, values);
  };

  // 重置搜索表单
  const onReset = () => {
    searchForm.resetFields();
    // 清空搜索参数和重置页码
    setSearchParams({});
    setCurrent(1);
    // 立即执行重置请求
    handlePageOwOfferMember(1, pageSize, {});
  };


  // 页面跳转
  const handleJumpPage = () => {
    const page = parseInt(jumpPage);
    const totalPages = Math.ceil(total / pageSize);
    if (page >= 1 && page <= totalPages) {
      setCurrent(page);
      setJumpPage('');
      // 立即执行跳转页面请求
      handlePageOwOfferMember(page, pageSize, searchParams);
    }
  };

  // 操作
  const handleAction = (item, record) => {
    const { actionCode } = item;
    const { itemId } = record;
    console.info(itemId, 'itemId=========', actionCode, 'actionCode=========');
    if (['OFFER_EDIT'].includes(actionCode)) {
      window.open(
        `https://offer.1688.com/offer/post/fill_product_info.vm?operator=edit&offerId=${itemId}`,
      );
    } else if (['UNPAID', 'PAID_NOT_COMPLETED'].includes(actionCode)) {
      window.open(
        'https://work.1688.com/?_path_=sellerPro/lvyue/protectionService',
      );
    }
  };

  // 生成分页按钮
  const generatePageButtons = () => {
    const totalPages = Math.ceil(total / pageSize);
    const buttons = [];
    const showPages = 5; // 显示的页码数量

    let startPage = Math.max(1, current - Math.floor(showPages / 2));
    const endPage = Math.min(totalPages, startPage + showPages - 1);

    if (endPage - startPage < showPages - 1) {
      startPage = Math.max(1, endPage - showPages + 1);
    }

    // 第一页
    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          className="rounded-[6px] px-[12px] py-[6px] border border-[#ccc] bg-white hover:border-[#1677ff] hover:text-[#1677ff]"
          onClick={() => {
            setCurrent(1);
            handlePageOwOfferMember(1, pageSize, searchParams);
          }}
        >
          1
        </button>,
      );
      if (startPage > 2) {
        buttons.push(<span key="start-ellipsis" className="px-[8px]">...</span>);
      }
    }

    // 页码按钮
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          className={`rounded-[6px] px-[12px] py-[6px] border ${i === current ? 'border-[#1677ff] bg-[#1677ff] text-white' : 'border-[#ccc] bg-white hover:border-[#1677ff] hover:text-[#1677ff]'}`}
          onClick={() => {
            setCurrent(i);
            handlePageOwOfferMember(i, pageSize, searchParams);
          }}
        >
          {i}
        </button>,
      );
    }

    // 最后一页
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="end-ellipsis" className="px-[8px]">...</span>);
      }
      buttons.push(
        <button
          key={totalPages}
          className="rounded-[6px] px-[12px] py-[6px] border border-[#ccc] bg-white hover:border-[#1677ff] hover:text-[#1677ff]"
          onClick={() => {
            setCurrent(totalPages);
            handlePageOwOfferMember(totalPages, pageSize, searchParams);
          }}
        >
          {totalPages}
        </button>,
      );
    }

    return buttons;
  };

  const columns = [
    {
      title: '商品信息',
      dataIndex: 'title',
      key: 'title',
      width: '300px',
      align: 'center',
      render: (title, record) => (
        <div className="flex p-[16px] gap-[8px] w-full my-auto">
          <Image
            src={record?.imageUrl}
            alt={title}
            width={60}
            height={60}
            className="rounded-[6px] "
          />
          <div className="flex-1 text-left">
            <div className="product-name text-[14px] text-[#333] mb-[2px]">
              <Tooltip title={title}>
                {title}
              </Tooltip>
            </div>
            <div className="product-meta text-[13px] text-[#999] mb-[2px]">
              {record?.itemId}
            </div>
            <div className="product-meta text-[13px] text-[#999] mb-[2px]">
              {/* {record?.sendRegion} */}
              {region.filter(item => record?.sendRegion.includes(item.value))[0]?.label}
            </div>
            {record?.isRestrictedSales && (
              <div className="text-[13px] text-[#FB3B20] mt-[5px] bg-[#FFF2ED] rounded-[3px] px-[4px] py-[1px] inline-block">
                禁售中
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'SKU规格',
      dataIndex: 'skuInfos',
      key: 'skuInfos',
      width: '260px',
      align: 'center',
      render: (skuInfos) => (
        <div className="sku-specs" style={{ height: '100%' }}>
          {Array.isArray(skuInfos) && skuInfos.length > 0 && skuInfos.map((spec, index) => (
            <div key={index} className={'sku-spec-item text-[14px] text-[#333]'} style={{ height: `${100 / skuInfos.length}%` }}>
              {skuInfos.length > 1 ? <Text style={{ width: '260px', textAlign: 'center' }} className="vis-item" ellipsis={{ rows: 1, tooltip: spec }}>{spec?.name || '-'}</Text> : spec?.name || '-'}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: '价格（元）',
      dataIndex: 'skuPrices',
      key: 'skuPrices',
      align: 'center',
      render: (_, record) => (
        <div className="price-container" style={{ height: '100%' }}>
          {Array.isArray(record.skuInfos) && record.skuInfos.length > 0 && record.skuInfos.map((item, index) => (
            <div key={index} className="price-item flex flex-col items-center justify-center text-[14px] text-[#333]" style={{ height: `${100 / record.skuInfos.length}%` }}>
              <span>{item?.price || '-'}</span>
              {item?.suggestPrice && item.price && <span className="text-[14px] text-[#FF8B00]">建议降价至 {item?.suggestPrice}</span>}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: '核价状态',
      dataIndex: 'verifyStatus',
      key: 'verifyStatus',
      align: 'center',
      render: (status, record) => {
        const text = verifyStatus.filter(item => item.value === status)[0]?.label;
        const insufficientMarginText = {
          VERIFYING: '',
          PASS: '流量已加权',
          REJECT: '限流中, 请调价',
        }
        const textColor = {
          VERIFYING: '#0077FF',
          PASS: '#3BB347',
          REJECT: '#FB3B20',
        }
        const bgColor = {
          VERIFYING: '#EBF6FF',
          PASS: '#ECF7EC',
          REJECT: '#FFF2ED',
        }
        return (
          <div className="flex flex-col items-center justify-center px-[16px] py-[12px] h-full">
            <div className={`status-item text-[12px] text-[${textColor[status]}] bg-[${bgColor[status]}] rounded-[10px] px-[4px] py-[1px] inline-block`}>
              {text}
            </div>
            {!insufficientMargin && (
              <div className="mt-[4px] text-[12px] text-[#333]">
                {insufficientMarginText[status]}
              </div>
            )}
          </div>
        );
      },
    },
    // {
    //   title: '商品数据（近7天）',
    //   width: '320px',
    //   key: 'productData',
    //   align: 'center',
    //   children: [
    //     {
    //       title: '曝光次数',
    //       dataIndex: 'exposure',
    //       key: 'exposure',
    //       width: '102px',
    //       align: 'center',
    //       render: (exposure) => (
    //         <div className="flex flex-col items-center justify-center px-[16px] py-[12px] h-full">
    //           <div className="text-[14px] text-[#333]">{exposure || '-'}</div>
    //         </div>
    //       ),
    //     },
    //     {
    //       title: '订单量',
    //       dataIndex: 'orders',
    //       key: 'orders',
    //       align: 'center',
    //       width: '102px',
    //       render: (orders) => (
    //         <div className="flex flex-col items-center justify-center px-[16px] py-[12px] h-full">
    //           <div className="text-[14px] text-[#333]">{orders || '-'}</div>
    //         </div>
    //       ),
    //     },
    //     {
    //       title: 'GMV (元)',
    //       dataIndex: 'gmv',
    //       align: 'center',
    //       key: 'gmv',
    //       width: '116px',
    //       render: (gmv) => (
    //         <div className="flex flex-col items-center justify-center px-[16px] py-[12px] h-full">
    //           <div className="text-[14px] text-[#333]">{gmv || '-'}</div>
    //         </div>
    //       ),
    //     },
    //   ],
    // },
    {
      title: '操作',
      key: 'offerActions',
      dataIndex: 'offerActions',
      width: '200px',
      align: 'center',
      render: (offerActions, record) => (
        <div className="flex flex-col items-center justify-center px-[16px] py-[12px] h-full gap-[8px]">
          {Array.isArray(offerActions) && offerActions.length > 0 && offerActions.map((item, index) => (
            <div key={index}>
              <div className="text-[14px] text-[#0077FF] cursor-pointer" onClick={() => handleAction(item, record)}>{item.actionDesc}</div>
              <Tooltip placement="bottom" title={item.actionTips}><div className="action-tips text-[12px] text-[#FB3B20] mt-[4px]">{item.actionTips}</div></Tooltip>
            </div>
          ))}
          {(!Array.isArray(offerActions) || offerActions.length === 0) && (
            <div className="text-[14px] text-[#333]">/</div>
          )}
        </div>
      ),
    },
  ];

  return (
    <ConfigProvider locale={zhCN}>
      <div>
        <div className="bg-white p-[20px] rounded-[6px] mb-[16px]">
          <Form
            form={searchForm}
            onFinish={onSearchFinish}
          >
            <div className="flex gap-[32px] justify-between">
              {/* 第一列：商品ID 、 数据周期 */}
              <div className="flex gap-[20px] flex-col flex-1">
                <Form.Item
                  name="itemId"
                  label={<span className="text-[14px] text-[#333]">商品ID</span>}
                  className="flex-1 mb-0"
                >
                  <Input
                    placeholder="请输入"
                    allowClear
                    onInput={(e) => {
                      // 只保留数字字符
                      const numericValue = e.target.value.replace(/[^0-9]/g, '');
                      if (e.target.value !== numericValue) {
                        e.target.value = numericValue;
                        // 手动触发change事件更新表单值
                        const event = new Event('change', { bubbles: true });
                        e.target.dispatchEvent(event);
                      }
                    }}
                  />
                </Form.Item>
                <Form.Item
                  name="isRestrictedSales"
                  valuePropName="checked"
                  className="mb-0"
                >
                  <Checkbox className="text-[14px] text-[#333]">
                    筛选禁售商品
                  </Checkbox>
                </Form.Item>
              </div>
              {/* 第二列：核价结果、筛选禁售商品 */}
              <div className="flex gap-[20px] flex-col flex-1">
                <Form.Item
                  name="itemVerifyPriceStatus"
                  label={<span className="text-[14px] text-[#333]">核价结果</span>}
                  className="flex-1 mb-0"
                >
                  <Select placeholder="请选择" options={verifyStatus} mode="multiple" />
                </Form.Item>
              </div>
              {/* 第三列：地区 */}
              <div className="flex gap-[20px] flex-col flex-1">

                <Form.Item
                  name="sendRegion"
                  label={<span className="text-[14px] text-[#333]">发货地区</span>}
                  className="flex-1 mb-0"
                >
                  <Select placeholder="请选择" options={region} mode="multiple" />
                </Form.Item>
                <Space className="flex justify-end">
                  <Button
                    className="bg-white border-[#1677ff] text-[#1677ff] hover:border-[#1677ff] hover:text-[#1677ff] hover:bg-white rounded-[6px] px-[15px] py-[4px]"
                    htmlType="submit"
                  >
                    查询
                  </Button>
                  <Button onClick={onReset}>
                    重置
                  </Button>
                </Space>
              </div>
            </div>
          </Form>
        </div>
        <div className="bg-white p-[20px] rounded-[6px]">
          <div className="mb-[20px] flex items-center justify-between">
            <div className="text-[16px] font-bold text-[#333]">
              海外仓商品列表
            </div>
            <div className="flex items-center gap-[16px]">
              <div className="text-[14px] text-[#0077FF] flex items-center gap-[8px]">
                {/* 业务介绍
                <span className="text-[#ddd]">|</span>  */}
                <span style={{ cursor: 'pointer' }} onClick={() => window.open('https://qr.dingtalk.com/action/joingroup?code=v1,k1,GJvKXhYGULa/epzAbyLkYsXsn2wf710V91G4oeA/x4Q=&_dt_no_comment=1&origin=11?', '_blank')}>商家群</span>
                <span className="text-[#ddd]">|</span>
                <span style={{ cursor: 'pointer' }} onClick={() => window.open('https://survey.1688.com/apps/zhiliao/c-DtSx0QV', '_blank')}>核价申诉</span>
              </div>
              <Button type="primary" onClick={() => window.open('https://offer-new.1688.com/select.htm', '_blank')}>发布商品</Button>
            </div>
          </div>
          <Table
            columns={columns}
            dataSource={dataSource}
            size="middle"
            pagination={false}
            loading={loading}
            className="overseas-warehouse-table"
            scroll={{ x: 'max-content' }}
            bordered
          />
          {dataSource.length > 0 && (
            <div className="flex items-center justify-center">
              <div className="flex items-center justify-center mt-[16px] px-[16px] py-[12px] bg-white">
                {/* 左侧：每页显示 */}
                <div className="flex items-center gap-[8px] mr-[16px]">
                  <span className="text-[14px] text-[#999]">每页显示</span>
                  <Select
                    value={pageSize}
                    onChange={(size) => {
                      setPageSize(size);
                      setCurrent(1);
                      // 立即执行页面大小变化请求
                      handlePageOwOfferMember(1, size, searchParams);
                    }}
                    className="w-[80px]"
                  >
                    <Option value={10}>10</Option>
                    <Option value={20}>20</Option>
                    <Option value={50}>50</Option>
                    <Option value={100}>100</Option>
                  </Select>
                </div>

                {/* 中间：分页按钮 */}
                <div className="flex items-center gap-[8px] text-[#333]">
                  {/* 上一页 */}
                  <button
                    className="rounded-[6px] px-[12px] py-[6px] border border-[#ccc] bg-white hover:border-[#1677ff] hover:text-[#1677ff] disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={current === 1}
                    onClick={() => {
                      const prevPage = current - 1;
                      setCurrent(prevPage);
                      handlePageOwOfferMember(prevPage, pageSize, searchParams);
                    }}
                  >
                    &lt;
                  </button>

                  {/* 页码按钮 */}
                  {generatePageButtons()}

                  {/* 下一页 */}
                  <button
                    className="rounded-[6px] px-[12px] py-[6px] border border-[#ccc] bg-white hover:border-[#1677ff] hover:text-[#1677ff] disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={current === Math.ceil(total / pageSize)}
                    onClick={() => {
                      const nextPage = current + 1;
                      setCurrent(nextPage);
                      handlePageOwOfferMember(nextPage, pageSize, searchParams);
                    }}
                  >
                    &gt;
                  </button>
                </div>

                {/* 右侧：页面跳转 */}
                <div className="flex items-center gap-[8px] ml-[16px]">
                  <span className="text-[14px] text-[#333]">
                    <span className="text-[#0077FF]">{current}</span>/<span className="text-[#333]">{Math.ceil(total / pageSize)}</span>
                  </span>
                  <span className="text-[14px] text-[#333]">页</span>
                  <Input
                    value={jumpPage}
                    onChange={(e) => setJumpPage(e.target.value)}
                    onPressEnter={handleJumpPage}
                    className="w-[60px] text-center"
                    placeholder=""
                  />
                  <Button
                    onClick={handleJumpPage}
                    className="text-[12px] px-[12px] py-[4px]"
                  >
                    确定
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ConfigProvider>
  );
};

export default List;