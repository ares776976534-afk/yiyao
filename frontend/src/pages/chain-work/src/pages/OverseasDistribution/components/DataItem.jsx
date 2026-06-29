/* eslint-disable no-nested-ternary */
import React from 'react';
import { Icon, Balloon } from '@alifd/next';
import { formatOrReturn } from '@/pages/Select/utlis';
import '../index.scss';

const { Tooltip } = Balloon;
const DataItem = ({ child, isShow, setIsShow, tab }) => {
  return (
    <div>
      <div className="text-[14px] mt-[16px] mb-[8px] flex items-start text-[#333] leading-[19px]">
        {
            // 查询cookie不为空null，并且child.code为铺货商品数
            child.code === '铺货商品数' && !localStorage.getItem('isShowTooltip') ? (
              <Balloon
                v2
                trigger={<span className="mr-[4px] pt-[1px]">{child.code}</span>}
                align="l"
                visible={isShow}
                closable={false}
                popupClassName="bg-[#0077FF] products-business"
              >
                <div className="flex flex-col">
                  <div className="text-[14px] leading-[17px] text-[#fff]">如何提升铺货买家数？</div>
                  <div
                    className="w-[74px] mt-[8px] rounded-[4px] flex justify-center items-center h-[24px] px-[10px] py-[10px] bg-[#fff] text-[#0077FF] text-[12px] leading-[14px] cursor-pointer"
                    onClick={() => {
                      if (child?.collectionBuyerCount > 0) {
                        // 存入cookie
                        localStorage.setItem('isShowTooltip', 'false');
                        setIsShow(false);
                        window.open('https://peixun.1688.com/space/l2AmoZ7J1vJjlXdb/detail/Gl6Pm2Db8D3moaOOTqOjO7QkJxLq0Ee4', '_blank');
                      } else {
                        window.open('https://peixun.1688.com/space/l2AmoZ7J1vJjlXdb/detail/Gl6Pm2Db8D3moaOOTqOjO7QkJxLq0Ee4', '_blank');
                      }
                    }}
                  >
                    点此了解
                  </div>
                </div>
              </Balloon>
            ) : (
              <span className="mr-[4px] pt-[1px]">{child.code}</span>
            )
          }
        <Tooltip
          v2
          trigger={<Icon type="d-help" size="small" className="text-[#BBB]" />}
          align="t"
          arrowPointToCenter
          popupStyle={{ backgroundColor: '#333' }}
          popupClassName="products-business-tooltips"
        >
          {tab === '严选分销' ? child.tip1 || child.tip : child.tip}
        </Tooltip>
      </div>
      <div className="text-[18px] font-[500] leading-[18px]">
        {formatOrReturn(child.value)}
      </div>
    </div>
  );
};

export default DataItem;
