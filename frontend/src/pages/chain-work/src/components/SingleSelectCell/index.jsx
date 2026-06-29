import React from 'react';
import { Icon } from '@alifd/next';
import './index.scss';
import Balloon from '@/components/UI/Balloon';

function SingleSelectCell({
  service,
  type = 'long', // long(services 无icon+左对齐+更长) short(channel 有icon+居中+更短)
  unLockMust = false,
  selectList = [],
  setSelectList = () => {},
  selectType = 'multipleAndNo', // single(单选) singleAndNo(单选+可不选) multipleAndNo(多选+可不选)
  allList = [], // 用于单选重置
  getParam,
}) {
  const allListValue = allList.map(item => item.value);
  let isMust = service.must !== false;
  if (unLockMust) {
    isMust = false; // 开放修改 有些场景下允许修改
  }
  let realUnlockMust = false;
  if (getParam('selectBuyerProtect').length > 0) {
    realUnlockMust = String(getParam('selectBuyerProtect')) === 'true';
  }
  const isSelect = selectList.includes(service.value);
  const isShort = type === 'short'; // 有icon+居中+更短
  const selectStyle = isSelect
    ? 'single-select-cell border-[#0077FF] cursor-pointer after:!border-y-[#0077FF] after:!border-b-[#07f]'
    : 'border-[rgba(0 0 0 0.1)] cursor-pointer';
  return (
    <div
      className={`h-[50px] rounded-[6px] border-[1px] p-[16px] text-[14px] text-[#333] box-border leading-[14px] font-[500] ${
        isMust ? 'single-select-cell border-[#ccc]' : selectStyle
      }`}
      onClick={() => {
        if (isMust) return;
        if (isSelect) {
          // todo
          if (realUnlockMust || selectType.endsWith('AndNo')) {
            setSelectList(selectList.filter((item) => item !== service.value));
          }
        } else if (selectType.startsWith('single')) {
          setSelectList(old => {
            const emptyList = old.filter(item => !allListValue.includes(item));
            return [...emptyList, service.value];
          });
        } else {
          setSelectList([...selectList, service.value]);
        }
      }}
      key={service.label}
    >
      <span
        className={isShort ? 'flex items-center justify-center w-[146px]' : 'flex items-center justify-start w-[206px]'}
      >
        {service.icon && <img className="w-[16px] h-[16px] mr-[4px]" src={service.icon} />}
        {service.label}
        {service.des && <Balloon>{service.des}</Balloon>}
      </span>

      {(isSelect || isMust) && <Icon type="select" className="service-icon" size="xs" />}
    </div>
  );
}

export default SingleSelectCell;
