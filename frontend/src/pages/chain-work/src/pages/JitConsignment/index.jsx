import React, { useEffect, useState } from 'react';
import NewWorkLayout from '@/layouts/NewWorkLayout';
import { Select, Icon, Field } from '@alifd/next';
import ConsignmentType from './components/ConsignmentType';
import CommonTable from '@/components/CommonTable';
import schema from './schema';
import Button from '@/components/UI/Button';
import PromptDialog from './components/PromptDialog';
import './index.scss';
import { getQueryParams } from '@/utlis';
import { querySendGoodsAddressList } from '@/pages/AeCreateOrder/api';
import { createConsignOrder, getAllCpInfo, querySolution, getSenderInfo } from './services';
import Message from '@/components/UI/Message';
import moment from 'moment';
import AddressRender from './components/AddressRender';

const onClick = () => {
  window.open('https://work.1688.com/home/seller.htm?_path_=sellerPro/2017sellerbase_setting/receiveAddresses&spm=a2638g.u_f6fc4.frametopbar.8.3f7d1768ndfThi', '_blank');
};

const navigateWithQueryParams = () => {
  window.open('https://work.1688.com/?_path_=gonghuotuoguan/cross_boarder_2/jit', '_blank');
};

function JitConsignment() {
  const field = Field.useField();
  const { init, getValues, setValue, getError } = field;
  const [selectedKey, setSelectedKey] = useState('DOOR_2_DOOR_PICK_UP');
  const [list, setList] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [logisticsList, setLogisticsList] = useState([]);
  const [providerCode, setProviderCode] = useState('');
  const [gmtExpectPickUpTime, setGmtExpectPickUpTime] = useState(''); // 期望揽收时间 [2023-04-01 00:00:00
  const [querySolutionList, setQuerySolutionList] = useState([]);
  const door2doorQuantity = JSON.parse(getQueryParams('offer'))?.reduce((sum, item) => sum + item.quantity, 0);
  const relatedFCOrderEntryList = JSON.parse(getQueryParams('id')).filter(Boolean);
  const receiveAddressRequest = JSON.parse(getQueryParams('add'));
  function mergeNestedObjects(data) {
    const result = {};
    data.forEach(item => {
      for (const outerKey in item) {
        if (!result[outerKey]) {
          result[outerKey] = {};
        }
        // 合并内层对象
        Object.assign(result[outerKey], item[outerKey]);
      }
    });
    return result;
  }
  useEffect(() => {
    querySendGoodsAddressList().then((res) => {
      const { model, success, msg } = res?.content;
      if (success) {
        const modelList = model.map((i) => ({
          label: `${i.province} ${i.city} ${i.county} ${i.address}`,
          value: `${i.addressId}`,
          key: JSON.stringify(i),
        }));
        setList(modelList);
      } else {
        Message._show({ content: msg || '数据异常', type: 'error' });
      }
    }).catch((err) => {
      Message._show({ content: err?.errMsg || '系统繁忙，请稍后再试。' || '数据异常', type: 'error' });
    });
  }, []);
  const onTab = (key) => {
    setSelectedKey(key);
  };
  const listQueryFn = () => {
    return new Promise((resolve) => {
      resolve({ model: JSON.parse(getQueryParams('offer')), total: 10 });
    });
  };
  // 选择发货地址
  const onChange = (value) => {
    if (!value) {
      setDisabled(false);
    }
    setValue('address', value);
    const key = list?.filter((e) => e?.value === value)[0]?.key || '{}';
    const sendAddress = JSON.parse(key);
    querySolution({
      sendAddressRequest: {
        id: sendAddress?.addressId,
        provinceName: sendAddress?.province,
        cityName: sendAddress?.city,
        areaName: sendAddress?.county,
        townName: sendAddress?.street,
        detailAddress: sendAddress?.address,
        mobile: sendAddress?.phone,
        contactorName: sendAddress?.name,
      },
      receiveAddressRequest,
      relatedFCOrderEntryMap: mergeNestedObjects(relatedFCOrderEntryList),
    }).then((res) => {
      const { success, msg, model } = res;
      if (success) {
        setDisabled(!model?.length);
        setProviderCode(model[0]?.cpCode);
        setGmtExpectPickUpTime(model[0]?.gmtExpectPickUpTime);
        setQuerySolutionList(model);
        if (!model?.length) {
          setSelectedKey('SUPPLIER_OFFLINE_SEND');
        }
      } else {
        Message._show({ content: msg || '数据异常', type: 'error' });
      }
    });
  };
  useEffect(() => {
    if (selectedKey === 'SUPPLIER_OFFLINE_SEND') {
      getAllCpInfo().then((res) => {
        if (res?.result) {
          setLogisticsList(res?.result.map((ele) => ({ label: ele.companyName, value: ele.companyCode, key: ele.companyCode })));
        }
      });
    }
  }, [selectedKey]);
  const render = () => {
    if (querySolutionList[0]?.handoverType === 'PICK_UP') {
      return selectedKey === 'DOOR_2_DOOR_PICK_UP' ? querySolutionList[0]?.handoverAddress : receiveAddressRequest;
    } else {
      return receiveAddressRequest;
    }
  };
  // 确认发货
  const ConfirmShipment = () => {
    const error = field.getErrors();
    if (Object.values(error).filter((e) => e !== null).length > 0) {
      field.setErrors(error);
      return;
    }
    field.validate((errors, values) => {
      if (errors) {
        return;
      }
      const key = JSON.parse(list?.filter((e) => e?.value === getValues()?.address)[0]?.key || '{}');
      const sendAddressRequest = {
        id: key?.addressId,
        provinceName: key?.province,
        cityName: key?.city,
        areaName: key?.county,
        townName: key?.street,
        detailAddress: key?.address,
        mobile: key?.phone,
        contactorName: key?.name,
      };
      const cpList = [];
      Object.keys(values).forEach(k => {
        if (k?.endsWith('.cpCode')) {
          const index = k?.split('.')[0];
          const mailNKey = `${index}.mailN`;
          if (values[mailNKey]) {
            cpList.push({
              cpCode: values[k],
              cpName: logisticsList.filter((item) => item?.value === values[k])[0]?.label,
              mailNo: values[mailNKey],
            });
          }
        }
      });
      const params = {
        sendType: selectedKey,
        sendAddressRequest,
        receiveAddressRequest: render(),
        fetchPackageQuantity: getValues()?.packageQuantity || cpList.length,
        door2doorQuantity,
        relatedFCOrderEntryMap: mergeNestedObjects(relatedFCOrderEntryList),
        providerCode,
        cpList,
        gmtExpectPickUpTime,
      };
      createConsignOrder(params).then((res) => {
        const { success, msg = '数据异常', model } = res;
        if (success && model?.result) {
          PromptDialog.open({
            pickupOrderNumber: model?.consignOrderId,
            state: 'success',
            selectedKey,
            content: selectedKey === 'DOOR_2_DOOR_PICK_UP' ?
              <div>
                <div>已生成{getValues()?.packageQuantity || cpList.length}个揽收单，您可在物流详情中查看揽收详情。</div>
                <div>
                  预计最晚上门时间为：{
                    <span className="text-[#FF8B00]">{model?.gmtExpectPickUpTime}</span>
                  }，具体时间您可在“物流详情”查看司机电话主动联系沟通或等待司机电话联系你
                </div>
              </div> : (
                <div>
                  请及时寄出，保障在 {moment(JSON.parse(getQueryParams('gmtCreate'))).add(72, 'hours').format('YYYY/MM/DD HH:mm')} 前送达
                </div>
              ),
          });
        } else {
          PromptDialog.open({ state: 'error', content: `揽收单创建失败，[${msg}]，请重试或联系小二` });
        }
      });
    });
  };
  useEffect(() => {
    if (list.length > 0 && !getValues()?.address) {
      getSenderInfo({
        offerDTO: JSON.parse(getQueryParams('offer'))[0],
      }).then((res) => {
        const { success, msg, model } = res;
        if (success) {
          onChange(`${model?.addressId}`);
        } else {
          Message._show({ content: msg || '数据异常', type: 'error' });
        }
      });
    }
  }, [list]);
  return (
    <div>
      <NewWorkLayout title={getQueryParams('type') === 'shipments' ? '发货' : '合并发货'} style={{ marginBottom: '72px' }}>
        <div className="w-[100%] h-[100%] bg-white mb-[16px] rounded-[6px] p-[20px]">
          <span className="text-[16px] font-semibold text-[#333]">请选择发货方式</span>
          {getQueryParams('type') !== 'shipments' && (
            <div className="px-[12px] py-[9px] bg-[#EBF6FF] rounded-[6px] text-[14px] text-[#666] mt-[16px]">
              <Icon type="prompt" style={{ marginRight: 8, color: '#0077FF' }} />
              使用合并发货，需保持多个供货商品的发货地址一致，请仔细检查发货地址。
            </div>
          )}
          <div className="flex mb-[16px] mt-[16px] select-rounded">
            <span className="mr-[4px] text-[14px] text-[#666] mt-[6px]">发货地址：</span>
            <div>
              <Select
                placeholder="请选择"
                style={{ width: 600, borderRadius: 6 }}
                hasClear
                showSearch
                {...init('address', {
                  rules: [{ required: true, message: '发货地址不能为空' }],
                })}
                onChange={onChange}
                dataSource={list}
              />
              {getError('address') ? (
                <div style={{ color: 'red' }}>
                  {getError('address').join(',')}
                </div>
              ) : (
                ''
              )}
            </div>
            <div className="text-[14px] text-[#0077ff] ml-[12px] cursor-pointer mt-[6px]" onClick={onClick}>编辑地址</div>
          </div>
          <div className="text-[14px] text-[#333] flex items-center">
            <span className="text-[#666] mr-[4px]">收货地址：</span>
            <AddressRender handoverAddress={render()} />
          </div>
        </div>
        <ConsignmentType door2doorQuantity={door2doorQuantity} gmtExpectPickUpTime={gmtExpectPickUpTime} selectedKey={selectedKey} onTab={onTab} field={field} disabled={disabled} list={logisticsList} />
        <div className="w-[100%] h-[100%] bg-white mb-[16px] rounded-[6px] p-[20px]">
          <span className="text-[16px] font-semibold text-[#333]">供货产品信息</span>
          <CommonTable
            schema={schema}
            SlotOrShowStatusFilter={false}
            listQueryFn={listQueryFn}
            showPagination={false}
          />
        </div>
      </NewWorkLayout>
      <div className="fixed bottom-0 w-full flex flex-row justify-center p-[20px] bg-[#fff] z-[100]">
        <Button type="primary" className="w-[104px]" style={{ borderRadius: '6px', marginRight: '8px' }} onClick={ConfirmShipment}>
          确认发货
        </Button>
        <Button type="normal:primary-ghost" className="w-[74px]" style={{ borderRadius: '6px' }} onClick={navigateWithQueryParams}>
          取消
        </Button>
      </div>
    </div>
  );
}

export default JitConsignment;
