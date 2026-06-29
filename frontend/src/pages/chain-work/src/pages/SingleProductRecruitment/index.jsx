import React, { useState, useEffect, useCallback } from 'react';
import NewWorkLayout from '@/layouts/NewWorkLayout';
import CommonTable from '@/components/CommonTable';
import schema from './schema';
import './index.scss';
import { getDirectedItems, getChoiceDirectOppCard } from '@/pages/Select/services';
import Message from '@/components/UI/Message';
import { getQueryParams, Logger } from '@/utlis';

Logger.init({ a: 'Choice单品定招', b: 'Choice单品定招' }, { pageKey: 'Choice单品定招' });
function SingleProductRecruitment() {
  const [totals, setTotals] = useState(0);
  const [action, setAction] = useState(getQueryParams('strategyId'));
  const [tabMap, setTabMap] = useState([]);
  const getData = (params) => {
    return new Promise((resolve) => {
      getDirectedItems({
        request: {
          ...params,
          pageNum: params?.pageNo || 1,
          strategyId: action,
        },
      }).then((res) => {
        const { list = [], total = 0 } = res;
        setTotals(total);
        resolve({ model: list, total });
      }).catch((err) => {
        Message._show({ content: err.errorMessage || '数据异常', type: 'error' });
      });
    });
  };
  const onTab = (strategyId) => {
    setAction(strategyId);
    getData();
  };
  const newSchema = {
    ...schema,
    componentSchema: () => {
      return schema.componentSchema({ getData });
    },
  };
  useEffect(() => {
    getChoiceDirectOppCard().then((res) => {
      const { model = [], success, msg = '数据异常' } = res;
      if (success) {
        setTabMap(model);
      } else {
        Message._show({ content: msg, type: 'error' });
      }
    }).catch((err) => {
      Message._show({ content: err.errorMessage || '数据异常', type: 'error' });
    });
  }, []);

  const TableCom = useCallback(() => {
    return (
      <>
        <CommonTable
          schema={newSchema}
          searchFilterType="4"
          SlotOrShowStatusFilter={false}
        />
        <div className="absolute bottom-0 left-0 p-[20px] text-[#999] text-[13px]">共{totals}个商机</div>
      </>
    );
  }, [action]);
  return (
    <NewWorkLayout title="Choice单品定招">
      <div className="relative p-[20px] bg-[#fff] rounded-[6px]">
        <div>
          <div className="flex mb-[12px]">
            {tabMap?.map(({ oppName = '', strategyId = '' }) => {
              return (
                <div
                  key={strategyId}
                  onClick={() => onTab(strategyId)}
                  className={`p-[8px] inline-table text-[14px] leading-[17px] font-medium mr-[8px] rounded-[4px] cursor-pointer ${action === strategyId ? 'text-[#0077FF] bg-[#EBF6FF]' : 'text-[#333] bg-[#F8F8F8]'}`}
                >
                  {oppName}
                </div>
              );
            })}
          </div>
          <div className="text-[14px] leading-[17px] text-[#333] p-[10px] rounded-[4px]" style={{ background: 'linear-gradient(90deg, #EBF6FF -12%, rgba(255, 255, 255, 0) 48%)' }}>
            权益说明：{tabMap?.find((item) => item.strategyId === action)?.oppText}
          </div>
        </div>
        <TableCom />
      </div>
    </NewWorkLayout>
  );
}

export default SingleProductRecruitment;
