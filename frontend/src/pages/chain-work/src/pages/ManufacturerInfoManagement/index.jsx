import React, { useState, useEffect, useRef } from 'react';
import Block from '@/layouts/Block';
import CommonTable from '@/components/CommonTable';
import NewWorkLayout from '@/layouts/NewWorkLayout';
import schema from './schema';
import FormModel from './FormModal';
import schemas from '@/components/schema/ManufactureInfoManagement';
import './index.scss';
import { alterManufacturerInfo, getManufacturerCountByUserId } from '@/service/common';
import BallonTooltip from '@/pages/ManufacturerInfoManagement/components/BallonTooltip';
import { queryPageAllManufacturerDetailsByUserId } from './services';
import { MessageSuccess, MessageError } from '@/utlis';

export default () => {
  const [manuCount, setManuCount] = useState(false);
  const tableQuery = useRef(null);
  const fetchQueryItem = (values) => {
    return new Promise((resolve) => {
      queryPageAllManufacturerDetailsByUserId(values).then((res) => {
        resolve(res);
      });
    });
  };
  const queryManufacturerCountByUserId = () => {
    getManufacturerCountByUserId().then((res) => {
      setManuCount(Number(res) === 100);
    });
  }
  const getalterManufacturerInfo = (values, fn) => {
    alterManufacturerInfo(values).then((res) => {
      const { content } = res;
      const { success, msg } = content;
      if (success) {
        queryManufacturerCountByUserId();
        MessageSuccess(msg);
        fn();
      } else {
        MessageError(msg || '系统异常');
      }
    });
  };
  // 新增
  const onAdd = (values) => {
    getalterManufacturerInfo({
      action: 0,
      manufacturerModel: {
        ...values,
        type: 'MANUAL',
      },
    }, tableQuery.current());
  };
  // 删除
  const onDelete = (record, fn) => {
    getalterManufacturerInfo(record, fn);
  };
  // 修改
  const onEdit = (record, fn) => {
    getalterManufacturerInfo(record, fn);
  };
  const handleActionClick = ({ type, record }, fn) => {
    switch (type) {
      case 'edit':
        onEdit(record, fn);
        break;
      case 'delete':
        onDelete(record, fn);
        break;
      default:
        break;
    }
  };
  const onJump = () => {
    const currentUrl = new URL(window.location.href);
    const { origin, search } = currentUrl;
    window.location.href = `${origin}/app/channel-fe/chain-work/manufacturerinfo.html`;
  };
  useEffect(() => {
    queryManufacturerCountByUserId();
  }, []);
  const addButton = () => {
    return (
      <div>
        <button
          className={`${manuCount ? 'bg-[#F8F8F8] border-[#DDD] cursor-not-allowed text-[#ddd]' : 'bg-[#0077FF] border-[#0077FF] text-[#fff]'} w-[130px] h-[32px] rounded-[6px] opacity-100 flex flex-row justify-center items-center p-[10px] px-[16px] gap-[8px] text-[14px] mr-[12px]`}
          onClick={() => FormModel.open({
            title: <div className="text-[16px] font-medium">添加制造商信息</div>,
            onSubmit: (value) => onAdd(value),
            schema: () => schemas('add'),
            labelAlign: 'left',
            subName: '保存',
          })}
          disabled={manuCount}
        >
          新增制造商信息
        </button>
      </div>
    );
  };
  return (
    <NewWorkLayout title="制造商信息管理">
      <Block title={false} >
        <div className="flex">
          {manuCount ? (
            <BallonTooltip trigger={addButton()} content="最多支持100个制造商信息，若需要新增请删除未使用的制造商信息。" />
          ) : (
            addButton()
          )}
          <button
            className="w-[160px] h-[32px] rounded-[6px] opacity-100 flex flex-row justify-center items-center p-[10px] px-[16px] gap-[8px] bg-[#FFFFFF] box-border border border-[#0077FF] text-[#0077FF] text-[14px]"
            onClick={onJump}
          >
            查看商品制造商信息
          </button>
        </div>
        <CommonTable
          className="commonTable"
          schema={schema}
          listQueryFn={fetchQueryItem}
          SlotOrShowStatusFilter={false}
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
