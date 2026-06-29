import React, { useState } from 'react';
import { Icon, Balloon, Grid, Loading, Radio } from '@alifd/next';
import { formatOrReturn } from '@/pages/Select/utlis';
import { TIME_RANGE } from '../enums';

const { Tooltip } = Balloon;
const { Row, Col } = Grid;

const valueDescCodeMap = {
  GOOD: '表现优秀',
  BAD: '表现不佳',
};
const valueDescColorMap = {
  GOOD: 'text-[#30953C]',
  BAD: 'text-[#FB3B20]',
};

// 将一维数组转换为二维数组（每两个元素为一组）
const convertTo2DArray = (oneDimensionalArray) => {
  const twoDimensionalArray = [];
  for (let i = 0; i < oneDimensionalArray.length; i += 2) {
    twoDimensionalArray.push([oneDimensionalArray[i], oneDimensionalArray[i + 1]]);
  }
  return twoDimensionalArray;
};

// 渲染带有提示图标的组件
const RenderIcon = ({ value }) => {
  const icon = <Icon type="d-help" size="small" style={{ color: '#BBB' }} />;
  return (
    <Tooltip
      v2
      trigger={icon}
      align="t"
      arrowPointToCenter
      popupClassName="notic-borad-tooltip bg-[#333] text-[14px] leading-[22px] p-[12px]"
    >
      {value}
    </Tooltip>
  );
};

// 树节点组件
const TreeNode = ({ item, tabPosition, onChange }) => {
  const itemChildrenBlock = convertTo2DArray(item?.children);
  return (
    <div className={item?.code === '商品信息' ? 'py-[20px]' : ''}>
      <div className="flex items-center justify-between">
        <div className="text-[14px] font-medium leading-[17px]">{item?.code}</div>
        {item?.code === '履约数据' && (
          <Radio.Group shape="button" size="small" value={tabPosition} onChange={onChange}>
            {TIME_RANGE.map((ele) => (
              <Radio value={ele.key} key={ele.key}>{ele.title}</Radio>
            ))}
          </Radio.Group>
        )}
      </div>
      {item.children && (
        <div className="flex flex-row gap-x-[20px]">
          {itemChildrenBlock.map((block) => (
            <div className={`${item?.code === '履约数据' ? 'w-[50%]' : ''} flex flex-col justify-between`} key={block[0]?.code}>
              {block
                .filter(Boolean)
                .map((child) => (
                  <div key={child?.code}>
                    <div className="mt-[20px] mb-[8px] flex items-start text-[#333] leading-[16px]">
                      <span className="text-[14px] mr-[4px] mt-px">{child?.code}</span>
                      <RenderIcon value={child?.desc} />
                    </div>
                    <div className="flex items-center ">
                      <div className="text-[18px] font-medium leading-[18px]">
                        {formatOrReturn(child?.value)}
                      </div>
                      {valueDescCodeMap[child?.valueDescCode] && (
                        <div
                          className={`text-[12px] ml-[4px] ${valueDescColorMap[child?.valueDescCode]}`}
                        >
                          {valueDescCodeMap[child?.valueDescCode]}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 计算列跨度的函数
const calculateParentSpan = (data) => {
  const totalChildren = data?.reduce((sum, node) => sum + (node.children?.length || 0), 0);
  return totalChildren ? Math.floor(24 / totalChildren) : 0;
};

// 树结构网格组件
const TreeGrid = ({ data, tabPosition, onChange }) => {
  const parentSpan = calculateParentSpan(data);
  return (
    <Row>
      {data?.map((node, index) => (
        <Col
          key={node.desc}
          span={parentSpan * (node.children?.length || 0)}
        >
          <TreeNode item={node} index={index} tabPosition={tabPosition} onChange={onChange} />
        </Col>
      ))}
    </Row>
  );
};

// 主组件
export default ({ dataList, isLoading }) => {
  const [tabPosition, setTabPosition] = useState('data7d');
  const onChange = (value) => {
    setTabPosition(value);
  };
  return (
    <Loading className="w-full" visible={isLoading}>
      <div className="flex gap-x-[20px]">
        {/* 第一个数据块 */}
        <div className="w-[25%]">
          <TreeGrid data={dataList[tabPosition]?.slice(0, 1)} tabPosition={tabPosition} onChange={onChange} />
        </div>
        {/* 后续数据块 */}
        <div className="flex-1 p-[20px] bg-gradient-to-r from-[#F3F9FF] to-[#FFFFFF] rounded-[6px] h-[190px]">
          <TreeGrid data={dataList[tabPosition]?.slice(1, 3)} tabPosition={tabPosition} onChange={onChange} />
        </div>
      </div>
    </Loading>
  );
};
