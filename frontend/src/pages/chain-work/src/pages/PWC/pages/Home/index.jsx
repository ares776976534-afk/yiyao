import React, { useState } from 'react';
import { Button } from '@alifd/next';
import NewWorkLayout from '@/layouts/NewWorkLayout';
import CommonTable from '@/components/CommonTable';
import schema from './schema';
import { getList } from '../../service';
import { STATUS_WAITING } from '../../constants';

import './index.scss';

let isInit = false;

const SubTitle = () => {
  const handleClick = () => {
    window.open('https://peixun.1688.com/space/l2AmoZ7J1vJjlXdb/detail/QG53mjyd80RjkKPPSX5k2GdgV6zbX04v', '_blank');
  };
  return (
    <Button text type="primary" onClick={handleClick}>件重尺认证操作手册</Button>
  );
};

const Empty = () => {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <div className="flex flex-col justify-center items-center">
        <img
          src="https://img.alicdn.com/imgextra/i3/O1CN01i5uL9h1Zc3vaMFPUI_!!6000000003214-2-tps-560-504.png"
          className="w-[140px] h-[126px] mb-[16px]"
        />
        <div className="text-[18px] text-[#333] h-[29px] flex flex-col justify-center items-center">暂无需认证商品</div>
      </div>
    </div>
  );
};

export default () => {
  const [isEmpty, setIsEmpty] = useState(false);

  const getData = (params) => {
    return getList(params)
      .then((res) => {
        if (!isInit && res.total === 0) {
          setIsEmpty(true);
        }
        isInit = true;
        return res;
      });
  };

  return (
    <NewWorkLayout
      title="件重尺认证"
      subTitle={<SubTitle />}
    >
      <div className="pwc-home h-[100vh]">
        {
          isEmpty ? <Empty /> : <CommonTable
            schema={schema}
            SlotOrShowStatusFilter={false}
            searchFilterType="3"
            listQueryFn={getData}
            tableProps={
              {
                rowSelection: {
                  getProps: (record) => {
                    return {
                      disabled: record.status !== STATUS_WAITING,
                    };
                  },
                },
              }
            }
          />
        }
      </div>
    </NewWorkLayout>
  );
};
