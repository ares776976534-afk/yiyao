import React from 'react';
import { Icon, Balloon, Grid, Loading, Divider } from '@alifd/next';
import { formatOrReturn } from '@/pages/Select/utlis';

const { Tooltip } = Balloon;
const { Row, Col } = Grid;

function convertTo2DArray(oneDimensionalArray) {
  const twoDimensionalArray = [];

  for (let i = 0; i < oneDimensionalArray.length; i += 2) {
    // 取出每对元素
    const pair = [oneDimensionalArray[i], oneDimensionalArray[i + 1]];
    // 添加到二维数组中
    twoDimensionalArray.push(pair);
  }

  return twoDimensionalArray;
}

export default ({ dataList, isLoading }) => {
  const RenderIcon = (config) => {
    const { value } = config;
    const intro = <Icon type="d-help" size="small" style={{ color: '#BBB' }} />;
    return (
      <Tooltip
        v2
        trigger={intro}
        align="t"
        arrowPointToCenter
        popupStyle={{ backgroundColor: '#333' }}
        popupClassName="products-business-tooltips"
      >
        {value}
      </Tooltip>
    );
  };
  const imgIcon = {
    up: 'https://img.alicdn.com/imgextra/i1/O1CN01sApMot1IWFQnx2Igx_!!6000000000900-2-tps-32-41.png',
    down: 'https://img.alicdn.com/imgextra/i2/O1CN01QPfpu91NDXKSVEmMA_!!6000000001536-2-tps-32-41.png',
  };
  const TreeNode = ({ item }) => {
    const itemChildrenBlock = convertTo2DArray(item?.children);
    return (
      <div className="py-[9.5px]">
        <div className="text-[14px] font-medium leading-[17px]">{item?.code}</div>
        {
          item.children && (
            <div className="flex flex-row gap-x-[20px]">
              {itemChildrenBlock?.map((block) => (
                <div className="flex flex-col w-[50%] justify-between">
                  {
                    block?.filter(Boolean)?.map((child, index) => (
                      <div key={child?.code} className={index === 0 ? '' : 'mt-[30px]'}>
                        <div className="text-[14px] mt-[12px] mb-[8px] flex items-start text-[#333] leading-[16px]">
                          <span className="mr-[4px] mt-px">{child?.code}</span>
                          <RenderIcon value={child?.desc} />
                        </div>
                        <div className="text-[18px] font-medium leading-[18px]">
                          <span>{child?.code === 'GMV' && '¥'}</span>
                          <span>{formatOrReturn(child?.value)}</span>
                        </div>
                        <div className={`flex items-center ${child?.compareDirection === 'down' ? 'text-[#25BE13]' : 'text-[#f00000]'}`}>
                          {child?.compareDirection && <img className="w-[9px] " src={imgIcon[child?.compareDirection]} alt="" srcSet="" />}
                          <span className="ml-[4px] text-xs">{child?.compareValue}</span>
                        </div>
                      </div>
                    ))
                  }
                </div>
              ))}
            </div>
          )
        }
      </div>
    );
  };
  const calculateParentSpan = (data) => {
    const totalChildren = data?.reduce((sum, node) => {
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      return sum + (node.children ? node.children.length : 0);
    }, 0);
    return Math.floor(24 / totalChildren);
  };
  const TreeGrid = ({ data }) => {
    const parentSpan = calculateParentSpan(data);
    return (
      <Row>
        {data?.map((node, index) => (
          <>
            <Col key={node.desc} span={parentSpan * (node?.code === '跨境托管数据' ? 6 : node.children.length)}>
              <TreeNode item={node} />
            </Col>
            {index === 0 && (<Divider direction="ver" dashed className="my-[15px] h-[155px] mx-[20px]" />)}
          </>
        ))}
      </Row>
    );
  };
  return (
    <Loading className="w-full h-[164px]" visible={isLoading}>
      <TreeGrid data={dataList} />
    </Loading>
  );
};
