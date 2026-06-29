import { observer } from 'mobx-react-lite';
import { TypeRightPanelSide } from '@/types/select-product';
import { ColorfulBtn } from '@/components/ChatFlow/ColorfulBtn';
import { PlusSignIcon } from '@/components/Icon';
import style from './businessReport.module.css';
import InitiateInquiryModal from './InitiateInquiryModal';
import { useState, useCallback, useEffect, useRef } from 'react';
import { handleScroll } from '../../hooks/useChatStream';
import { $t } from '@/i18n';

interface TypeReportProps {
  onViewDetails?: () => void;
  title?: string;
  itemBtn?: {
    key: string;
    value: string;
  }[];
  report: any;
  cardType?: TypeRightPanelSide;
  onMoreClick: (cardType: TypeRightPanelSide, data: any) => void;
  rightSideType: string;
  imageUrl: string;
}

export const BusinessReport = observer((props: TypeReportProps) => {
  const { title, onMoreClick, imageUrl, rightSideType } = props;
  const hasCalledRef = useRef(false);
  // 当 rightSideType 为空字符串时type为'br'，否则为'bm'
  const type = rightSideType === '' ? 'br' : 'bm';
  const handleMoreClick = useCallback(() => {
    onMoreClick('REPORT_CARD', props);
    handleScroll();
  }, [onMoreClick, props]);

  useEffect(() => {
    // 只在首次渲染时调用，避免死循环
    if (!hasCalledRef.current) {
      hasCalledRef.current = true;
      handleMoreClick();
    }
  }, [handleMoreClick]);
  return (
    <div className={style.colorfulCard}>
      <div>
        <div className="flex items-center">
          <img src={imageUrl} alt="image" className="w-12 h-12 rounded-[4px] mr-3" />
          <div className="text-base font-medium leading-6 text-gray-900">{title}</div>
        </div>
        {type === 'bm' && <div className={style.bmBtn}><ColorfulBtn title={$t("global-1688-ai-app.select-product.BusinessComponents.BusinessReport.zzview", "正在查看")} onClick={handleMoreClick} /></div>}
      </div>
      {type === 'br' && <ColorfulBtn title={$t("global-1688-ai-app.select-product.BusinessComponents.BusinessReport.viewDetails", "查看详情")} onClick={handleMoreClick} />}
    </div>
  );
});

export const InitiateInquiry = observer((props: TypeReportProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState([]);

  const onClick = () => {
    setData(props?.report);
    setIsOpen(true);
  };

  return (
    <div>
      <div
        className={style.initiateInquiry}
        onClick={onClick}
      >
        <PlusSignIcon />
        <span className={style.text}>{$t("global-1688-ai-app.select-product.BusinessComponents.BusinessReport.stqs", "选择供应商，发起询盘任务")}</span>
      </div>
      <InitiateInquiryModal isOpen={isOpen} onClose={() => setIsOpen(false)} data={data} />
    </div>
  );
});

export const Footer = observer((props: TypeReportProps) => {
  return (
    <div className='flex flex-col gap-[16px] items-center'>
      <BusinessReport {...props} />
      <InitiateInquiry {...props} />
    </div>
  );
});