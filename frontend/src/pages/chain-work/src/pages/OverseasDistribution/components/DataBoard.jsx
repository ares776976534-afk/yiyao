/* eslint-disable no-nested-ternary */
import React, { useState, useEffect } from 'react';
import { Icon, Balloon, Grid, Loading, Divider, Radio } from '@alifd/next';
import Block from '@/layouts/Block';
import { ranking } from '@/pages/OverseasDistribution/services';
import Message from '@/components/UI/Message';
import DataItem from './DataItem';
import '../index.scss';

const { Row, Col } = Grid;
const { Tooltip } = Balloon;

const tabItem = [
  { key: '基础分销', title: '基础分销商品' },
  { key: '严选分销', title: '严选分销商品' },
];

const DataBoard = () => {
  const [shape, setShape] = useState('7d');
  const [tab, setTab] = useState('基础分销');
  const [isLoading, setIsLoading] = useState(false);
  const [reactList, setReactList] = useState([]);
  const [dataList, setDataList] = useState([]);
  const [isShowTooltip, setIsShowTooltip] = useState(false);
  const [list, setList] = useState([]);
  // 生成数据列表
  const generateDataList = (result) => [
    {
      code: '铺货商品数',
      value: result[0]?.collectionOfferCount === '-1' ? '--' : result[0]?.collectionOfferCount === 'null' ? '0' : result[0]?.collectionOfferCount,
      tip: <div>已绑定下游跨境分销店铺并在本店近30天内有成交的买家数量。<span className="text-[#07f] cursor-pointer" onClick={() => window.open('https://peixun.1688.com/space/l2AmoZ7J1vJjlXdb/detail/Gl6Pm2Db8D3moaOOTqOjO7QkJxLq0Ee4')}>了解如何提升铺货买家数</span></div>,
      collectionBuyerCount: result[0]?.collectionBuyerCount === '-1' ? 0 : result[0]?.collectionBuyerCount === 'null' ? 0 : Number(result[0]?.collectionBuyerCount),
    },
    { code: '铺货次数', value: result[0]?.collectionCount === '-1' ? '--' : result[0]?.collectionCount === 'null' ? '0' : result[0]?.collectionCount, tip: '近7天/30天在海外分销渠道被铺货的次数' },
    { code: '成交订单数', value: result[0]?.orderCount === '-1' ? '--' : result[0]?.orderCount === 'null' ? '0' : result[0]?.orderCount, tip: '近7天/30天所有基础分销商品的成交订单数', tip1: '近7天/30天所有严选分销商品的成交订单数' },
    { code: '成交GMV', value: result[0]?.gmv === '-1' ? '--' : result[0]?.gmv === 'null' ? '0' : result[0]?.gmv, tip: '近7天/30天所有基础分销商品的成交GMV', tip1: '近7天/30天所有严选分销商品的成交GMV' },
  ];

  // 数据过滤处理器
  const handleFilter = (newTab, newShape, newList) => {
    const newResult = newList?.length ? newList : reactList.filter(
      ele => ele?.type === (newTab || tab) && ele?.timeRange === (newShape || shape),
    );
    const v = newResult[0]?.collectionOfferCount === '-1' ? '--' : newResult[0]?.collectionOfferCount === 'null' ? '0' : newResult[0]?.collectionOfferCount
    setIsShowTooltip(v >= 0);
    setDataList(generateDataList(newResult));
    setList(newResult);
    if (newTab) setTab(newTab);
    if (newShape) setShape(newShape);
  };

  // 初始数据加载
  useEffect(() => {
    setIsLoading(true);
    ranking().then((res) => {
      setIsLoading(false);
      const { result = [], errorMsg = '数据加载失败，请稍后重试' } = res;
      if (errorMsg === 'success') {
        setReactList(result);
        handleFilter(tab, shape, result);
      } else {
        Message._show({ content: errorMsg, type: 'error' });
      }
    }).catch((err) => {
      setIsLoading(false);
      Message._show({ content: err.errMsg || '系统异常', type: 'error' });
    });
  }, []);

  return (
    <Block
      title={
        <div className="text-[16px] leading-[19px] text-medium">数据概览</div>
      }
      subTitle={
        <div className="flex justify-between items-center">
          <div className="text-[#999] text-[14px] leading-[17px] mr-[12px]">
            统计周期: {list[0]?.startDate}-{list[0]?.endDate}
          </div>
          <Radio.Group shape="button" value={shape} onChange={val => handleFilter(null, val)} size="small">
            <Radio value="7d">
              <spna className="text-[14px]" style={{ fontWeight: 500 }}>近7日</spna>
            </Radio>
            <Radio value="30d">
              <spna className="text-[14px]" style={{ fontWeight: 500 }}>近30天</spna>
            </Radio>
          </Radio.Group>
        </div>
      }
      className="h-[158px]"
    >
      <div className="flex items-center mt-[16px]">
        {tabItem.map((ele, index) => (
          <div key={ele.key}>
            <span
              className={`text-[16px] leading-[19px] cursor-pointer ${
                tab === ele.key ? 'text-[#0077FF] font-medium' : 'text-[#666]'
              }`}
              onClick={() => handleFilter(ele.key, null)}
            >
              {ele.title}
            </span>
            {index !== tabItem.length - 1 && <Divider direction="ver" className="h-[16px] mx-[16px]" />}
          </div>
        ))}
      </div>
      <Loading visible={isLoading} style={{ width: '100%' }}>
        {dataList.length > 0 ? (
          <Row gutter={24} className="flex flex-wrap">
            {dataList.map((child) => (
              <Col span={6} key={child.code}>
                <DataItem child={child} isShow={isShowTooltip} setIsShow={setIsShowTooltip} tab={tab} />
              </Col>
            ))}
          </Row>
        ) : (
          <div className="text-[#999] text-[14px] flex justify-center items-center h-[62px]">暂无数据</div>
        )}
      </Loading>
    </Block>
  );
};

export default DataBoard;
