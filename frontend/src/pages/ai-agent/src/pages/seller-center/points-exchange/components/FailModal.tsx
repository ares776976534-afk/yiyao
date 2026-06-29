import { Modal } from 'antd';
import { $t } from '@/i18n';

type TypeFailModalProps = {
  open: boolean;
  onClose: () => void;
  failMessage: string;
};

export const FailModal = ({ failMessage, open, onClose }: TypeFailModalProps) => {
  return (
    <Modal
      title={<div className="text-center">{$t("global-1688-ai-app.seller-center.points-exchange.FailModal.exchangeFailed", "兑换失败")}</div>}
      open={open}
      onCancel={onClose}
      footer={null}
      width={420}
    >
      <div className="flex w-full flex-col items-center justify-center">
        <div className="w-full text-center text-sm font-normal leading-5 text-[#7C7F9A]">
          {failMessage || $t("global-1688-ai-app.seller-center.points-exchange.FailModal.dIitnooSihypjh", "当前有API服务正在调用，为保障您的账户积分安全，请稍后重试或停止调用后再进行兑换。")}
        </div>

        <div className="mt-6">
          <button
            onClick={onClose}
            className="h-9 w-[168px] cursor-pointer rounded bg-blue-500 text-white transition-colors hover:bg-blue-600"
          >{$t("global-1688-ai-app.seller-center.points-exchange.FailModal.wzdl", "我知道了")}</button>
        </div>
      </div>
    </Modal>
  );
};