import React, { useEffect, useState } from 'react';
import { Icon } from '@alifd/next';
import FormModal from '@/pages/ManufacturerInfoManagement/FormModal';
import FormDialog from '@/components/FormDialog';
import schema from '@/components/schema/ManufactureInfoManagement';
import { queryCrossBorderComponentByItemId, submitManufacturerBinding } from '../../../api';
import schemas from './schema';
import { alterManufacturerInfo, getManufacturerCountByUserId } from '@/service/common';
import BallonTooltip from '@/pages/ManufacturerInfoManagement/components/BallonTooltip';
import { MessageSuccess, MessageError } from '@/utlis';

function ManufacturerInfo({ itemId = '', showManufacturerInfo = () => { } }) {
  const [manuCount, setManuCount] = useState(false);
  const [infoData, setInfoData] = useState([
    { label: '制造商名称：', value: '' },
    { label: '制造商地址：', value: '' },
    { label: '制造商电话：', value: '' },
    { label: '制造商邮箱：', value: '' },
  ]);
  const [manufacturer, setManufacturer] = useState({
    manufacturerId: 'warning',
    manufacturerNameCn: '',
    manufacturerNameEn: '',
    manufacturerAddress: '',
    areaCode: '',
    phoneNum: '',
    email: '',
  });
  const [manufacturerId, setManufacturerId] = useState('');
  const getQueryCrossBorderComponentByItemId = () => {
    queryCrossBorderComponentByItemId({ itemId }).then((res) => {
      const { content } = res;
      const { success, data, msg } = content;
      if (success) {
        const { manufacturerInfo } = data;
        setManufacturerId(data?.manufacturerId);
        setManufacturer(data?.manufacturerInfo);
        const {
          manufacturerNameCn = '',
          manufacturerAddress = '',
          areaCode = '',
          phoneNum = '',
          email = '',
        } = manufacturerInfo;
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
  const getSubmitManufacturerBinding = (values) => {
    submitManufacturerBinding({
      itemId,
      manufacturerId: values?.manufacturerId,
    })
      .then((res) => {
        const { content } = res;
        const { success, msg } = content;
        if (success) {
          getQueryCrossBorderComponentByItemId();
          MessageSuccess(msg);
        } else {
          MessageError(msg || '系统异常');
        }
      })
      .catch((err) => {
        MessageError(err.msg || '系统异常');
      });
  };
  const queryManufacturerCountByUserId = () => {
    getManufacturerCountByUserId().then((res) => {
      setManuCount(Number(res) === 100);
    });
  };
  useEffect(() => {
    getQueryCrossBorderComponentByItemId();
    queryManufacturerCountByUserId();
  }, []);
  const tooltipInfo = {
    warning: {
      content: '跨境商品销售往速卖通渠道欧盟和英国地区需要补全制造商信息。',
      type: 'ic_info',
      color: '#0077FF',
      bg: '#E6F2FF',
    },
    error: {
      content: '请添加制造商信息，保障跨境商品顺利销往海外。',
      type: 'ic_x_circle',
      color: '#FF0000',
      bg: '#FFE6E6',
    },
  };
  const TooltipComponent = ({ type }) => {
    const info = tooltipInfo[type];
    if (!info) return null;
    return (
      <div
        className="h-[42px] p-[12px] flex items-center mt-[16px] mb-[12px]"
        style={{ backgroundColor: info.bg, borderRadius: '6px' }}
      >
        <Icon type={info.type} style={{ color: info.color }} size="small" />
        <span className="ml-[8px]">{info.content}</span>
      </div>
    );
  };
  // 添加制造商信息
  const addManufacturerInfo = (values) => {
    alterManufacturerInfo({
      action: 0,
      manufacturerModel: {
        ...values,
        type: 'MANUAL',
      },
    })
      .then((res) => {
        const { content } = res;
        const { success, msg } = content;
        if (success) {
          queryManufacturerCountByUserId();
          MessageSuccess(msg);
        } else {
          MessageError(msg || '系统异常');
        }
      })
      .catch((err) => {
        MessageError(err.errMsg || '系统异常');
      });
  };
  const addButton = () => {
    return (
      <div className={`${manuCount && 'text-[#bbb]'}`}>
        <button
          className={`flex flex-row justify-center items-center p-[10px_12px] gap-[4px] w-[86px] h-[24px] rounded-[4px] ${manuCount ? 'bg-[#F8F8F8] border-[#DDD] cursor-not-allowed' : 'bg-[#FFFFFF] border-[#0077FF] cursor-pointer'
          } box-border border mr-[8px]`}
          onClick={() =>
            FormModal.open({
              title: <div className="text-[16px] font-medium">添加制造商信息</div>,
              onSubmit: (value) => addManufacturerInfo(value),
              schema,
              labelAlign: 'left',
              subName: '确认',
              status: 'add',
            })
          }
          disabled={manuCount}
        >
          添加制造商
        </button>
      </div>
    );
  };
  return (
    <div className="shipping-info-container">
      <div className="flex flex-row justify-between">
        <div className="shipping-info-title">制造商信息</div>
        <div className="text-[#0077FF] text-[12px] flex items-center">
          {manuCount ? (
            <BallonTooltip
              trigger={addButton()}
              content="最多支持100个制造商信息，若需要新增请删除未使用的制造商信息。"
            />
          ) : (
            addButton()
          )}
          <button
            className="flex flex-row justify-center items-center p-[10px_12px] gap-[4px] w-[86px] h-[24px] rounded-[4px] bg-[#FFFFFF] border-[#0077FF] box-border border"
            onClick={() =>
              FormDialog.open({
                title: (
                  <div className="text-[16px] font-medium">
                    {manufacturer?.manufacturerId ? '更换制造商' : '选择制造商'}
                  </div>
                ),
                onSubmit: (value) => getSubmitManufacturerBinding(value),
                schema: schemas,
                labelAlign: 'top',
                subName: '保存',
                status: manufacturerId,
              })
            }
          >
            {manufacturer?.manufacturerId ? '更换制造商' : '选择制造商'}
          </button>
        </div>
      </div>
      <TooltipComponent type={manufacturer?.manufacturerId ? 'warning' : 'error'} />
      <div className="shipping-info-content">
        {infoData?.map((ele, index) => (
          <div className="shipping-info-item" key={index}>
            <span>{ele.label}</span>
            <span className="font-medium">{ele.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ManufacturerInfo;
