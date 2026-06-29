import React, { useState, useEffect } from 'react';
import { Alert, ConfigProvider, message } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import NewWorkLayout from '@/layouts/NewWorkLayout';
import Alter from './components/Alter';
import UploadImg from './components/UploadImg';
import { querySettledInfo } from './service';


const OverseasWarehouseResidenceApplication = () => {
  const [pageData, setPageData] = useState([]);
  const [showAlter, setShowAlter] = useState(true);
  useEffect(() => {
    handleQuerySettledInfo();
  }, []);

  const handleQuerySettledInfo = () => {
    querySettledInfo()
      .then((res) => {
        const { success } = res;
        if (success) {
          setPageData(res?.model || {});
        }
      })
      .catch((err) => {
        message.error(err?.message || '网络错误');
      });
  };
  function navigateWithQueryParams() {
    const currentUrl = new URL(window.location.href);
    const { origin } = currentUrl;
    window.open(`${origin}/app/channel-fe/chain-work/overseaswarehouse.html`, '_blank');
  }
  const callback = () => {
    navigateWithQueryParams();
  };
  return (
    <NewWorkLayout
      title={
        <span className="flex flex-row items-center mr-[16px]">
          海外仓商家入驻申请
        </span>
      }
      style={{ backgroundColor: '#F9F9F9', backgroundImage: 'none' }}
    >
      <ConfigProvider locale={zhCN}>
        <div className="flex flex-col gap-y-[16px] h-full mb-[83px]" >
          {showAlter && <Alter closeAlter={() => setShowAlter(false)} reviewStatus={pageData?.reviewStatus || ''} rejectReason={pageData?.rejectReason || ''} />}
          <UploadImg
            pageData={pageData}
            callback={() => {
              callback();
            }}
          />
        </div>
      </ConfigProvider>
    </NewWorkLayout>
  )
};

export default OverseasWarehouseResidenceApplication;