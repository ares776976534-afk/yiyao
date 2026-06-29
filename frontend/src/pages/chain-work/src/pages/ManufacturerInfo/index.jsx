import React, { useRef, useState, useEffect } from 'react';
import Block from '@/layouts/Block';
import NewWorkLayout from '@/layouts/NewWorkLayout';
import CommonTable from '@/components/CommonTable/index.jsx';
import './index.scss';
import schema from './schema';
import { listItemManufacturerInfoByManuId } from './services';
import { batchSetManufacturers, submitCrossBorderComponent, queryAllManufacturerDetailsByUserId } from '@/service/common';
import CommonDialog from '@/components/FormDialog';
import operationSchema from '@/pages/CrossBorderOfferlist/components/Tab/compontents/operationSchema';
import { getQueryParams, MessageError, MessageSuccess } from '@/utlis';
import { Select } from '@alifd/next';

const layout = {
  width: 600,
};
export default () => {
  const tableQuery = useRef(null);
  const fetchQueryItem = (values) => {
    return new Promise((resolve) => {
      listItemManufacturerInfoByManuId({
        manufacturerId: getQueryParams('manufacturerId'),
        pageNum: values?.pageNo,
        ...values,
      }).then((res) => {
        resolve(res);
      });
    });
  };
  const [list, setList] = useState([]);
  useEffect(() => {
    queryAllManufacturerDetailsByUserId().then((res) => {
      setList(res);
    });
  }, []);
  const getSubmitCrossBorderComponent = (record, fn) => {
    submitCrossBorderComponent({
      crossBorderComponent: record,
    }).then((res) => {
      const { content } = res;
      const { success, msg } = content;
      if (success) {
        MessageSuccess(msg);
        fn();
      } else {
        MessageError(msg || '系统异常');
      }
    });
  };
  // 修改
  const onEdit = (record, fn) => {
    getSubmitCrossBorderComponent(record, fn);
  };
  // 保存
  const onSub = (record, fn) => {
    getSubmitCrossBorderComponent(record, fn);
  };
  // 批量设置制造商信息
  const getBatchSetManufacturers = (config, fn) => {
    batchSetManufacturers(config).then((res) => {
      const { content } = res;
      const { success, errorMsg } = content;
      if (success) {
        MessageSuccess(errorMsg);
        fn();
      } else {
        MessageError(errorMsg || '系统异常');
      }
    });
  };
  // 批量设置制造商信息
  const onBatchSettings = (values, fn) => {
    CommonDialog.open({
      title: '批量设置制造商信息',
      onSubmit: (value) => getBatchSetManufacturers({
        itemIdList: values?.map((ele) => ele.itemId),
        manufacturerId: value?.manufacturerId,
        offerCount: values.length,
      }, fn),
      schema: () => operationSchema('info', values),
      labelAlign: 'top',
    });
  };
  const handleActionClick = ({ type, values }, fn) => {
    switch (type) {
      case 'edit':
        onEdit(values, fn);
        break;
      case 'sub':
        onSub(values, fn);
        break;
      case 'batch_settings':
        onBatchSettings(values, fn);
        break;
      default:
        break;
    }
  };
  const onChange = (v) => {
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    tableQuery.current({ manufacturerId: v });
  };
  return (
    <NewWorkLayout title="管理商品制造商信息">
      <Block title={false} >
        <div className="flex items-center mb-[20px]">
          <span className="mr-2 text-[14px]">制造商信息</span>
          <Select defaultValue={getQueryParams('manufacturerId')} style={layout} placeholder="请选择" onChange={(v) => onChange(v)} hasClear showSearch >
            {list?.map((ele) => {
              const { manufacturerModel } = ele;
              const { manufacturerId, detailedAddressCn, manufacturerAddress, manufacturerNameCn, phoneNumber, email } = manufacturerModel;
              return <Select.Option value={manufacturerId} key={manufacturerId}>{`${manufacturerNameCn},${manufacturerAddress},${detailedAddressCn},${phoneNumber},${email}`}</Select.Option>;
            })}
          </Select>
        </div>
        <CommonTable
          className="commonTable"
          schema={schema}
          SlotOrShowStatusFilter={false}
          searchFilterType="3"
          listQueryFn={fetchQueryItem}
          pageSize={10}
          onActionComplete={handleActionClick}
          searchChangeFn={(fn) => {
            tableQuery.current = fn;
          }}
        />
      </Block>
    </NewWorkLayout>
  );
};
