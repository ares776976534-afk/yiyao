import React, { useEffect, useState } from 'react';
import Block from '@/layouts/Block';
import { CHANNEL } from '../utils';
import { Balloon, Icon } from '@alifd/next';
import Button from '@/components/UI/Button';
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
  oppServiceDemand,
  servicesList,
  channelList,
  setServicesList,
  setChannelList,
  titleClassName = '',
  getParam,
  serviceOkRef,
  showBtn = false,
  domId = 'servicePromise',
}) {
  const [channels, setChannels] = useState([]);
  const [mustListOfTime, setMustListOfTime] = useState([]);
  const [mustListOfReturn, setMustListOfReturn] = useState([]);
  const [mustListOfQuality, setMustListOfQuality] = useState([]);
  const dealList = (list, setFn, type = 'default') => {
    const must = [];
    const mustValue = [];
    const defaultList = (list || []).map((item) => {
      if (item.must) {
        must.push(item);
        mustValue.push(item.value);
      }
      // 没传 或者 originalService === true的情况下，都认为选中
      if (item.originalService !== false) {
        return item.value;
      }
      return null;
    });
    if (setFn) {
      setFn(must);
    }
    switch (type) {
      case 'default':
        return defaultList.filter((item) => item);
      case 'must':
        // 品质服务
        return mustValue;
      case 'all': {
        // channel 需要勾选上must+defaultList
        const allList = [...defaultList, ...mustValue].filter((item) => item);
        return Array.from(new Set(allList));
      }
    }
  };
  useEffect(() => {
    const musts2 = [];
    const defaultList1 = dealList(oppServiceDemand.sendTimeServiceDemandList, setMustListOfTime);
    const defaultList2 = dealList(oppServiceDemand.returnServiceDemandList, setMustListOfReturn);
    const defaultList3 = dealList(oppServiceDemand.qualityServiceDemandList, setMustListOfQuality, 'must');
    setServicesList([...defaultList1, ...defaultList2, ...defaultList3]);
    const wayBillChannelList =
      oppServiceDemand.wayBillChannelList?.map((item) => {
        item.icon = CHANNEL.filter((_item) => _item.value === item.value)[0]?.icon;
        return item;
      }) || [];
    setChannels(wayBillChannelList);
    const defaultChannel = wayBillChannelList.map((item) => {
      return item.value;
    });
    const defaultList4 = dealList(wayBillChannelList, null, 'all');
    setChannelList(defaultList4);
  }, []);

  const renderCell = (
    item,
    _type,
    list,
    setListFn,
    _unLockMust = false,
    selectType = 'multipleAndNo',
    allList = [],
  ) => {
    return (
      <SingleSelectCell
        service={item}
        type={_type} // long(services 长) short(channel 密文面单渠道 有icon+居中+更短)
        unLockMust={_unLockMust}
        selectList={list}
        setSelectList={setListFn}
        key={item?.value}
        selectType={selectType}
        allList={allList}
        getParam={getParam}
      />
    );
  };
  const hasHigher = (item, nowList) => {
    if (item.higherPriorityService) {
      return item.higherPriorityService.every((priority) => nowList.indexOf(priority) === -1);
    }
    return true;
  };

  const judgeDemand = (musts, nowList) => {
    const errorList = [];
    musts.forEach((item) => {
      // 报错条件：item为must，且没勾选item的升级项
      if (nowList.indexOf(item.value) === -1) {
        if (hasHigher(item, nowList)) {
          // console.log('musts', item);
          errorList.push(`【${item.label}】`);
        }
      }
    });

    return errorList;
  };
  const errorRender = (musts, nowList) => {
    const errorList = judgeDemand(musts, nowList);
    if (errorList.length === 0) {
      return null;
    }
    const labelStr = errorList.join(',');
    return (
      <span className="text-[#FF3000] absolute top-[21px] left-[88px]">报名当前商机需要承诺支持{labelStr}才可报名</span>
    );
  };
  // 只有展示全部服务选项时该逻辑才是正确的
  const dealHigherChoice = (key) => {
    const values = {
      services: [
        ...oppServiceDemand['sendTimeServiceDemandList'],
        ...oppServiceDemand['qualityServiceDemandList'],
        ...oppServiceDemand['returnServiceDemandList'],
      ],
      channels: oppServiceDemand['wayBillChannelList'],
    };
    const oppServiceDemandValue = values[key];
    // console.log('oppServiceDemandValue', oppServiceDemandValue);
    const newList = [];
    // 只有展示全部服务选项时该逻辑才是正确的
    oppServiceDemandValue.forEach((item) => {
      if (!item.higherPriorityService) {
        if (item.value) {
          newList.push(item.value);
        }
      }
    });
    return newList;
  };
  const handleClick = () => {
    setServicesList((oldV) => {
      return dealHigherChoice('services');
    });
    setChannelList((oldV) => {
      return dealHigherChoice('channels');
    });
  };
  useEffect(() => {
    const errorList = judgeDemand([...mustListOfTime, ...mustListOfReturn, ...mustListOfQuality], servicesList);
    serviceOkRef.current = errorList.length === 0;
  }, [servicesList]);

  return (
    <Block className="!px-[0px]" id={domId}>
      <div className="text-[#333] text-[16px] font-[500] mx-[20px] pb-[12px] border-b-[1px] flex items-center">
        确认服务
        {showBtn && (
          <div className="ml-[8px] text-[12px]">
            <Button
              onClick={handleClick}
              type="primary-ghost"
              style={{ color: '#07f', borderColor: '#07f', height: '24px', position: 'relative' }}
            >
              全部勾选
            </Button>
            <img
              src="https://img.alicdn.com/imgextra/i3/O1CN012vPHO81vPAMgErcUp_!!6000000006164-2-tps-192-56.png"
              alt=""
              className="absolute top-[37px] left-[287px] w-[48px] h-[14px]"
            />
            <span className="ml-[8px] text-[#999]">选择最优服务可获得更多流量扶持，带来更多销量！</span>
          </div>
        )}
      </div>
      {oppServiceDemand?.sendTimeServiceDemandList && (
        <Block title="发货时间" titleClassName={titleClassName} className="!mb-[0px] !pb-[0px] relative">
          {errorRender(mustListOfTime, servicesList)}
          <div className="flex gap-[20px] pt-[12px]">
            {oppServiceDemand?.sendTimeServiceDemandList.map((item) => {
              return renderCell(
                item,
                'long',
                servicesList,
                setServicesList,
                true,
                'single',
                oppServiceDemand.sendTimeServiceDemandList,
              );
            })}
          </div>
        </Block>
      )}
      {oppServiceDemand?.returnServiceDemandList && (
        <Block title="退货服务" titleClassName={titleClassName} className="!mb-[0px] !pb-[0px] relative">
          {errorRender(mustListOfReturn, servicesList)}
          <div className="flex gap-[20px] pt-[12px]">
            {oppServiceDemand?.returnServiceDemandList.map((item) => {
              return renderCell(
                item,
                'long',
                servicesList,
                setServicesList,
                true,
                'singleAndNo',
                oppServiceDemand.returnServiceDemandList,
              );
            })}
          </div>
        </Block>
      )}
      {oppServiceDemand?.qualityServiceDemandList?.length > 0 && (
        <Block title="品质服务" titleClassName={titleClassName} className="!mb-[0px] !pb-[0px] relative">
          {errorRender(mustListOfQuality, servicesList)}
          <div className="flex gap-[20px] pt-[12px]">
            {oppServiceDemand?.qualityServiceDemandList.map((item) => {
              return renderCell(
                item,
                'long',
                servicesList,
                setServicesList,
                false,
                'multipleAndNo',
                oppServiceDemand.qualityServiceDemandList,
              );
            })}
          </div>
        </Block>
      )}
      {channels.length > 0 && (
        <Block
          title={
            <div className="flex items-center">
              <div className="text-[#333] font-[500] h-[19px] leading-[19px] text-[14px]">密文面单渠道</div>
              <div className="text-[#999] text-[12px] ml-[8px]">根据报名要求，以下部分选项为必选项，已为您默认勾选</div>
            </div>
          }
          titleClassName={titleClassName}
        >
          <div className="flex gap-[20px] pt-[12px] flex-wrap">
            {channels.map((item) => {
              return renderCell(item, 'long', channelList, setChannelList, false, 'multipleAndNo');
            })}
          </div>
        </Block>
      )}
    </Block>
  );
}

export default ServicesBox;
