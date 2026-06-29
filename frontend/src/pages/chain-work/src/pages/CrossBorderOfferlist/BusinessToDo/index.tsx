import { useEffect, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import BusinessCard from './BusinessCard';
import { isPossibleReceiveQqqyService, queryQualificationsDetailService } from '@/pages/OverseaQualification/api';
import { TagState } from './Tag';
import { getBusinessBacklog } from '../api';
import Message from '@/components/UI/Message';
import styles from './index.module.scss';

const statusBtnTextMap: Record<TagState, string> = {
  new: '去提交',
  auditing: '去查看',
  audit_success: '去查看',
  audit_fail: '重新提交',
  to_be_added: '去补充',
};

const contentMap: Record<TagState, string> = {
  new: '提交海外仓等跨境资质，平台会重点推流。',
  auditing: '您的跨境资质已在审核中，请耐心等待！',
  audit_success: '您将有机会被推荐进行联动合作或优先推品！',
  audit_fail: '请查看原因后，重新提交！',
  to_be_added: '个商品待完善跨境信息，有机会得到跨境流量扶持（统计店铺中有效状态且没有设置跨境信息的商品数量）',
};

interface BusinessToDoProps {
  onCrossInfoClick: (backlogFormat: any) => void;
}

export interface BusinessToDoRef {
  refreshBusinessBacklog: () => void;
}

export const BusinessToDo = forwardRef<BusinessToDoRef, BusinessToDoProps>(({ onCrossInfoClick }, ref) => {
  const [status, setStatus] = useState<TagState>('new');
  const [businessBacklog, setBusinessBacklog] = useState<any[]>([]);
  const [isPossibleReceiveQqqy, setIsPossibleReceiveQqqy] = useState(false);

  // 提取刷新跨境信息的逻辑
  const refreshBusinessBacklog = useCallback(() => {
    getBusinessBacklog().then((res) => {
      const { model = [], success = false, msg = '系统异常' } = res;
      if (success) {
        const currentUrl = new URL(window.location.href);
        const { origin } = currentUrl;

        setBusinessBacklog(model.map((item: any) => {
          if (item.title === '跨境信息完善') {
            return {
              status: 'to_be_added',
              ...item,
              onClick: () => onCrossInfoClick(item.backlogFormat),
            };
          } else if (item.title === '上传资质证书') {
            return {
              status: 'to_be_added',
              ...item,
              // tooltipText: item.content,
              onClick: () => {
                window.open('https://work.1688.com/home/page/index.htm?_path_=sellerPro/2017sellerbase_winport/zhengshubianji&type=add&category=offer&certType1=10010&certificateName1=%E4%BA%A7%E5%93%81%E8%AE%A4%E8%AF%81%E7%B1%BB%E8%AF%81%E4%B9%A6%EF%BC%88%E8%B7%A8%E5%A2%83%EF%BC%89&certType2=650&certificateName2=CE&disabled=false', '_blank');
              },
            };
          } else {
            return {
              ...item,
              onClick: () => {
                window.open(`${origin}/app/channel-fe/chain-work/weightwaring.html?spm=defwork.home.0.0.70755c4b0fWInj&type=qqyx`, '_blank');
              },
            };
          }
        }));
      } else {
        Message._show({ content: msg, type: 'error' });
      }
    }).catch((err) => {
      Message._show({ content: err.msg || '系统异常', type: 'error' });
    });
  }, [onCrossInfoClick]);

  // 暴露刷新方法给父组件
  useImperativeHandle(ref, () => ({
    refreshBusinessBacklog,
  }));

  useEffect(() => {
    queryQualificationsDetailService().then((res: any) => {
      const { status: statusFromRes = 'new' } = res?.model || {};
      setStatus(statusFromRes);
    }).catch((err) => {
      console.log(err);
    });

    refreshBusinessBacklog();

    isPossibleReceiveQqqyService().then((res: any) => {
      const { model = [], success = false, msg = '系统异常' } = res;
      if (success) {
        setIsPossibleReceiveQqqy(model);
      } else {
        Message._show({ content: msg, type: 'error' });
      }
    }).catch((err) => {
      Message._show({ content: err.msg || '系统异常', type: 'error' });
    });
  }, [refreshBusinessBacklog]);

  const currentUrl = new URL(window.location.href);
  const { origin } = currentUrl;

  return (
    <div className="p-[20px] rounded-[6px] mt-[16px] bg-[#fff]" style={{ boxShadow: '0px 1px 12px 0px rgba(0, 0, 0, 0.01)' }}>
      <div className="flex items-center">
        <div className="text-[#333] leading-[16px] text-[16px] font-medium">经营待办</div>
      </div>
      <div className="flex items-center mt-4">
        {isPossibleReceiveQqqy && <BusinessCard
          title="全球工厂权益领取"
          content="您是全球工厂达标商家，可以领取专属权益。"
          btnText="去领取"
          className="mr-[12px]
          bg-[url('https://img.alicdn.com/imgextra/i4/O1CN011fsUW71D07hYukHrB_!!6000000000153-2-tps-180-150.png')] bg-no-repeat"
          style={{ backgroundSize: '90px 75px', backgroundPosition: '235px 71px' }}
          onClick={() => {
            window.open('https://work.1688.com/?spm=a2638g.u_0_1001.userinfo.19.b67817680WBtX7&_path_=sellerPro/seller-center/seller-growth', '_blank');
          }}
        />}

        {businessBacklog.length > 0 ? businessBacklog?.map(({ title, backlogFormat, effect,
          backlog, action, actionCode, status: _status, onClick }) => {
          const [beforeValue, afterValue] = backlog.split('{value}');
          return (<BusinessCard
            title={title}
            state={_status}
            content={
              title === '上传资质证书' ? beforeValue :
              <span>
                {beforeValue}
                <span className={styles.backlogNumber}>{backlogFormat}</span>
                {afterValue}
              </span>
            }
            className="mr-[12px]"
            btnText={action}
            onClick={onClick}
            tooltipText={title === '上传资质证书' ? beforeValue : ''}
          />);
        }) : null}

        <BusinessCard
          title="跨境资质提交"
          state={status}
          content={contentMap[status]}
          btnText={statusBtnTextMap[status]}
          className="mr-[12px]"
          onClick={() => {
            window.open(`${origin}/app/channel-fe/chain-work/overseaqualification.html`, '_blank');
          }}
        />
      </div>
    </div>
  );
});

export default BusinessToDo;
