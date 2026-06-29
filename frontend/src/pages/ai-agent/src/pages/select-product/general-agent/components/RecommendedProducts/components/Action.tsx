import styles from './action.module.scss';
import { MainBtn, SecondaryBtn } from '@/components/ChatFlow/Btn';
import jumpTo from '@/utils/jumpTo';
import useChatQuery from '@/pages/select-product/hooks/useChatQuery';
import { $t } from "@/i18n";

const mainBtnStyle = {
  padding: '8px 16px',
};
interface ActionProps {
  imageUrl?: string;
  type?: string;
}
const Action = ({ imageUrl = '', type = 'listMode' }: ActionProps) => {
  const { navigateByCache } = useChatQuery();
  const onBatchClick = () => {
    navigateByCache({ chatInput: { searchImageUrl: imageUrl, intention: 'AUTO' }, url: '/sourcing', isMakeSimilar: false, target: 'blank' });
  };
  const onEnquiryClick = () => {
    jumpTo(`/inquiry?fromPage=ZS&imageUrl=${imageUrl}`);
  };
  return (
    <div className={`${styles.actions} ${type === 'bigCard' ? styles.actionsBigCard : ''}`}>
      <MainBtn
        text={$t("global-1688-ai-app.select-product.general-agent.Action.1688Supplier", "1688供应商")}
        style={mainBtnStyle}
        handleBtn={(e: React.MouseEvent) => {
          e.stopPropagation();
          onBatchClick();
        }}
      />
      <SecondaryBtn
        text={$t("global-1688-ai-app.select-product.general-agent.Action.oneClickEnquiry", "一键询盘")}
        style={mainBtnStyle}
        handleBtn={(e: React.MouseEvent) => {
          e.stopPropagation();
          onEnquiryClick();
        }}
      />
    </div>
  );
};

export default Action;