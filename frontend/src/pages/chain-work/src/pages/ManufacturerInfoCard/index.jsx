import React, { useState, useEffect } from 'react';
import './index.scss';
import { MessageError } from '@/utlis';
import { queryCrossBorderComponentByItemId } from '@/pages/ProductsBidding/api';
import HeadContent from './components/HeadContent';
import { getPrefillMfrInfo } from '@/pages/AeOrder/api';
import FormModel from '@/pages/ManufacturerInfoManagement/FormModal';

function ManufacturerInfo({ itemId = '', showManufacturerInfo = () => { }, type, getData, allowModify = true }) {
  const [infoData, setInfoData] = useState([
    { label: '制造商名称：', value: '' },
    { label: '制造商地址：', value: '' },
    { label: '制造商电话：', value: '' },
    { label: '制造商邮箱：', value: '' },
  ]);
  const [manufacturer, setManufacturer] = useState({});
  const getQueryCrossBorderComponentByItemId = () => {
    queryCrossBorderComponentByItemId({ itemId }).then((res) => {
      const { content } = res;
      const { success, data, msg } = content;
      if (success) {
        const { manufacturerInfo, manufacturerId } = data;
        const {
          manufacturerNameCn = '',
          manufacturerAddress = '',
          areaCode = '',
          phoneNum = '',
          email = '',
        } = manufacturerInfo;
        setManufacturer({
          ...manufacturerInfo,
          manufacturerId,
          type: 'MANUAL',
        });
        showManufacturerInfo(!data?.manufacturerId);
        setInfoData([
          { label: '制造商名称：', value: manufacturerNameCn },
          { label: '制造商地址：', value: manufacturerAddress },
          { label: '制造商电话：', value: `${areaCode} ${phoneNum}` },
          { label: '制造商邮箱：', value: email },
        ]);
      } else {
        MessageError(msg || '系统异常');
      }
    });
  };
  const PrefillMfrInfo = () => {
    getPrefillMfrInfo().then((res) => {
      if (res?.content?.model && res?.content?.success) {
        const { prefillInfo } = res?.content?.model;
        const { addressDetail } = prefillInfo || {};
        setManufacturer({
          ...prefillInfo,
          type: 'DEFAULT',
        });
        setInfoData([
          { label: '制造商名称：', value: prefillInfo?.manufacturerNameCn, translate: prefillInfo?.manufacturerNameEn },
          { label: '制造商地区：', value: `${addressDetail?.provinceName}${addressDetail?.cityName}${addressDetail?.areaName}` },
          { label: '制造商地址：', value: prefillInfo?.detailedAddressCn, translate: prefillInfo?.detailedAddressEn },
          { label: '制造商电话：', value: `${prefillInfo?.areaCode} ${prefillInfo?.phoneNumber}` },
          { label: '制造商邮箱：', value: prefillInfo?.email },
        ]);
      }
    });
  };
  useEffect(() => {
    type === 'productsbidding' && getQueryCrossBorderComponentByItemId();
    type === 'product' && PrefillMfrInfo();
  }, []);
  // 回显数据
  const getDataSource = (data) => {
    setInfoData([
      { label: '制造商名称：', value: data?.manufacturerNameCn, translate: data?.manufacturerNameEn },
      { label: '制造商地址：', value: data?.detailedAddressCn, translate: data?.detailedAddressEn },
      { label: '制造商电话：', value: `${data?.areaCode} ${data?.phoneNumber}` },
      { label: '制造商邮箱：', value: data?.email },
    ]);
    getData(data);
  };
  return (
    <div>
      {type === 'productsbidding' && (<HeadContent
        manufacturer={manufacturer}
        itemId={itemId}
        getQueryCrossBorderComponentByItemId={getQueryCrossBorderComponentByItemId}
      />)}
      <div className="shipping-info-content w-full relative">
        <div>
          {infoData?.map((ele) => (
            <div className="shipping-info-item flex" key={ele?.label}>
              <div className="w-[84px]" >{ele?.label}</div>
              <div className="font-medium flex-1">
                <div>{ele?.value}</div>
                <div>{ele?.translate}</div>
              </div>
            </div>
          ))}
        </div>
        {(type === 'product' && allowModify) && (
          <div
            className="text-[#07f] cursor-pointer absolute right-[10px] top-[12px]"
            onClick={() => FormModel.open({
              title: <div className="text-[16px] font-medium">修改制造商信息</div>,
              onSubmit: (v) => getDataSource(v),
              values: manufacturer,
              labelAlign: 'left',
              subName: '保存',
            })}
          >
            去修改
          </div>
        )}
      </div>
    </div>
  );
}

export default ManufacturerInfo;
