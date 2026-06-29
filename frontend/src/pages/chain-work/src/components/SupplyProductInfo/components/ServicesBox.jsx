import React, { useEffect, useState } from 'react';
import Block from '@/layouts/Block';
import { CHANNEL } from '../utils';
import { Balloon, Icon } from '@alifd/next';
import SingleSelectCell from '@/components/SingleSelectCell';
const openRuleLink = () => {
  window.open(
    'https://rulechannel.1688.com/?spm=a2638g.u_0_1001.frametopbar.12.5d881768hjlaKl&type=detail&ruleId=20005464&cId=3043#/ruleStudy/detail?ruleId=20005464&cId=3043',
    '_blank',
  );
};
const renderSWBP = (serviceType) => {
  if (serviceType !== 'distributionKA') {
    return (
      <div>
        根据《中华人民共和国产品质量法》要求，发货时需附上商品标签、吊牌、合格证等信息，买家另有要求除外
        <span style={{ color: '#0379ff', marginLeft: '3px', cursor: 'pointer' }} onClick={openRuleLink}>
          查看规则
        </span>
      </div>
    );
  } else {
    return (
      <div>
        根据《中华人民共和国产品质量法》要求，发货时需附上商品标签、吊牌、合格证等信息，买家另有要求除外；分销大客商品需发往零售终端，商家需承诺商品包装必须有以下信息，三无必罚，详细查看三无标准
        <span style={{ color: '#0379ff', marginLeft: '3px', cursor: 'pointer' }} onClick={openRuleLink}>
          查看规则
        </span>
        <div className="mt-[8px] bg-[#F8F8F8] p-[12px] flex flex-col gap-[12px] rounded-[6px]">
          <div className="text-[14px] leading-[17px] h-[17px] font-[500]">生产信息</div>
          <div className="text-[12px] leading-[14px] h-[14px] font-normal">制造商名称：XXX 有限公司</div>
          <div className="text-[12px] leading-[14px] h-[14px] font-normal">制造商地址：XX省 XX市 XX区 XX街道 XXX</div>
          <div className="text-[12px] leading-[14px] h-[14px] font-normal">制造商电话：+86 XXX</div>
        </div>
      </div>
    );
  }
};
function ServicesBox({
  showWaybillChannels,
  unLockMust = false,
  servicesList,
  channelList,
  setServicesList,
  setChannelList,
  titleClassName = '',
  getIsMustFn = null,
  serviceType = 'xiaoerOpp',
}) {
  const [servicesMap, setServicesMap] = useState([]);
  // unLockMust ==> getParam('selectBuyerProtect') === 'true'
  const labelMap = [
    { label: '24小时发货', value: 'essxsfh' },
    { label: '48小时发货', value: 'ssbxsfh' },
    { label: '7天无理由', value: 'qtwlybt' },
    {
      label: '三无包赔',
      value: 'swbp',
      des: <>{renderSWBP(serviceType)}</>,
    },
  ];
  useEffect(() => {
    let _map = [];
    if (typeof showWaybillChannels !== 'boolean') {
      // 根据showWaybillChannels内容决定显示哪些服务
      labelMap.forEach((item) => {
        if (showWaybillChannels.current.includes(item.value)) {
          _map.push(item);
        }
      });
    } else {
      _map = showWaybillChannels
        ? [
          { label: '48小时发货', value: 'ssbxsfh' },
          { label: '7天无理由', value: 'qtwlybt' },
          {
            label: '三无包赔',
            value: 'swbp',
            des: (
              <div>
                根据《中华人民共和国产品质量法》要求，发货时需附上商品标签、吊牌、合格证等信息，买家另有要求除外
                <span style={{ color: '#0379ff', marginLeft: '3px', cursor: 'pointer' }} onClick={openRuleLink}>
                  查看规则
                </span>
              </div>
            ),
          },
        ]
        : [
          { label: '48小时发货', value: 'ssbxsfh' },
          { label: '7天无理由', value: 'qtwlybt' },
        ];
    }
    setServicesMap(_map);
  }, [showWaybillChannels?.current]);

  const renderCell = (item, _type, list, setListFn, _unLockMust = false) => {
    return (
      <SingleSelectCell
        service={item}
        type={_type} // long(services 长) short(channel 密文面单渠道 有icon+居中+更短)
        unLockMust={_unLockMust}
        selectList={list}
        setSelectList={setListFn}
        getIsMustFn={getIsMustFn}
        key={item?.value}
      />
    );
  };
  return (
    <div>
      <Block title="服务承诺" titleClassName={titleClassName} className="!mb-[0px] !pb-[12px]">
        <div className="flex gap-[20px] pt-[12px]">
          {servicesMap.map((item) => {
            return renderCell(item, 'long', servicesList, setServicesList, unLockMust);
          })}
        </div>
      </Block>
      {showWaybillChannels && (
        <Block title="密文面单渠道" titleClassName={titleClassName}>
          <div className="flex gap-[20px] pt-[12px] flex-wrap">
            {CHANNEL.map((item) => {
              return renderCell(item, 'short', channelList, setChannelList, false);
            })}
          </div>
        </Block>
      )}
    </div>
  );
}

export default ServicesBox;
