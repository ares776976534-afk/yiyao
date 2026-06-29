import React, { useState, useEffect } from 'react';
import NoticBoard from './components/NoticBoard';
import NewWorkLayout from '@/layouts/NewWorkLayout';
import OperationVideoDialog from '@/components/OperationVideoDialog';
import InfoFeedback from './components/InfoFeedback';
import EntryTemplate from './components/EntryTemplate';
import { querySettledInfo, queryEnums } from './services';
import Message from '@/components/UI/Message';
import { ErrorIcon, SuccessIcon } from './Icon';
import List from './components/List';

const videoIntro = 'https://cloud.video.taobao.com/vod/4MNmI67BogYcVqgREjY3x_wk2w7O0Of7jWalgJt_xd4.mp4';
const OverseasWarehouse = () => {
  const [reviewStatus, setReviewStatus] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [enums, setEnums] = useState({});
  const [shouldFilterRestrictedSales, setShouldFilterRestrictedSales] = useState(false);
  useEffect(() => {
    handleQueryEnums();
    querySettledInfo().then((res) => {
      const { model = {}, success = false, msg = '系统异常' } = res;
      console.info(model, 'model=========');
      if (success) {
        setReviewStatus(model?.reviewStatus || '');
        setRejectReason(model?.rejectReason || '');
      } else {
        Message._show({ content: msg, type: 'error' });
      }
    }).catch((err) => {
      Message._show({ content: err.message || '系统异常', type: 'error' });
    });
  }, []);

  const handleQueryEnums = () => {
    queryEnums().then((res) => {
      if (res.success) {
        setEnums(res.model);
      }
    });
  };
  function navigateWithQueryParams() {
    const currentUrl = new URL(window.location.href);
    const { origin } = currentUrl;
    window.open(`${origin}/app/channel-fe/chain-work/overseaswarehouseresidenceapplication.html`, '_blank');
  }
  const callback = () => {
    // 触发筛选禁售商品
    setShouldFilterRestrictedSales(true);
  }
  return (
    <NewWorkLayout
      title={
        <span className="flex flex-row items-center mr-[16px]">
          海外仓商品管理
          {/* <a
            className="flex flex-row items-center text-[12px] ml-[16px] text-[#07f] cursor-pointer"
            onClick={() => OperationVideoDialog.open({ video: videoIntro, title: '操作视频' })}
          >
            <img src="https://img.alicdn.com/imgextra/i3/O1CN01T8qIRZ23CMEWaQWau_!!6000000007219-2-tps-32-32.png" className="w-[16px] h-[16px] mr-[4px]" />
            <span>操作视频</span>
          </a> */}
        </span>
      }
      style={{ height: '100vh' }}
    >
      <div className="flex flex-col gap-y-[16px]">
        {reviewStatus === 'REJECT' && (
          <div className="flex flex-col p-[12px] gap-[8px] bg-[#FFF2ED] rounded-[6px]">
            <div className="flex gap-[8px]">
              <ErrorIcon />
              <span className="text-[16px] text-[#333] font-medium leading-[19px]">海外仓入驻申请审核未通过，请重新提交申请。</span>
            </div>
            <div className="text-[14px] text-[#666] leading-[22px]">原因：{rejectReason}</div>
          </div>
        )}
        {reviewStatus === 'PASS' && (
          <div className="flex items-center gap-[8px] h-[40px] bg-[#ECF7EC] rounded-[6px] px-[12px] py-[9px]">
            <SuccessIcon />
            <div className="flex items-center gap-[4px]">
              <span className="text-[13px] text-[#666] leading-[16px] font-normal">入驻申请审核通过。</span>
              <span className="text-[#07f] cursor-pointer text-[13px] leading-[16px] font-normal" onClick={navigateWithQueryParams}>查看申请</span>
            </div>
          </div>
        )}
        <NoticBoard callback={callback} />
        {reviewStatus !== 'PASS' && (
          <>
            <InfoFeedback />
            <EntryTemplate reviewStatus={reviewStatus} />
          </>
        )}
        {reviewStatus === 'PASS' ? (
          <List
            enums={enums}
            insufficientMargin={false}
            shouldFilterRestrictedSales={shouldFilterRestrictedSales}
            onFilterRestrictedSalesComplete={() => setShouldFilterRestrictedSales(false)}
          />
        ) : (
          <div className="p-[20px] h-[400px] bg-[#fff] rounded-[6px] flex flex-col gap-[20px]" style={{ boxShadow: '0px 1px 12px 0px rgba(0, 0, 0, 0.01)' }}>
            <div className="text-[16px] font-medium leading-[19px] text-[#333]">海外仓商品列表</div>
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center gap-[12px] flex-col">
                <img className="w-[88px] h-[88px]" src="https://img.alicdn.com/imgextra/i2/O1CN01zTo4tk1D6zdCxWUIo_!!6000000000168-2-tps-176-176.png" alt="" srcSet="" />
                <div className="flex flex-col gap-[8px] items-center justify-center">
                  <div className="text-[#333] font-medium leading-[19px] text-[16px]">您还未申请海外仓业务</div>
                  <div className="text-[#999] leading-[17px] text-[14px]">请先申请海外仓业务后查看商品列表</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </NewWorkLayout>
  )
};

export default OverseasWarehouse;