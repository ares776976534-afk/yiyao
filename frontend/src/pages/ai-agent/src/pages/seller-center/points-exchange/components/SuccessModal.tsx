import { useEffect, useState } from 'react';
import { Modal } from 'antd';
import { $t } from '@/i18n';

type TypeSuccessModalProps = {
  open: boolean;
  onClose: () => void;
  remaining: number;
  exchangeToken?: number;
  unitName?: string;
};

export const SuccessModal = ({ open, onClose, remaining, exchangeToken, unitName }: TypeSuccessModalProps) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!open) return;

    setCountdown(5);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open]);

  useEffect(() => {
    if (countdown === 0 && open) {
      onClose();
    }
  }, [countdown, open, onClose]);

  return (
    <Modal
      title={<div className="text-center">{$t("global-1688-ai-app.seller-center.points-exchange.SuccessModal.enc", "🎉 兑换成功 🎉")}</div>}
      open={open}
      onCancel={onClose}
      footer={null}
      width={420}
    >
      <div className="flex w-full flex-col items-center justify-center">
        <div className="flex w-full max-w-[396px] flex-col items-center gap-2 rounded-xl border border-[#F3F3F6] py-5 z-[1]">
          <p className="font-[PingFang_SC] text-sm leading-5 text-[#1D1E29]">
            <span>{$t("global-1688-ai-app.seller-center.points-exchange.SuccessModal.bssh", "本次已为您成功兑换")}</span>
            <span
              className="font-[Alibaba_Sans_102] text-[32px]
              font-bold text-[rgba(0,0,0,0.87)] ml-3 mr-3"
            >
              {exchangeToken || 0}
            </span>
            <span>{unitName || ''}</span>
          </p>
          <p className="mt-3 font-[PingFang_SC] text-xs leading-5 text-[#7B7B8D]">{$t("global-1688-ai-app.seller-center.points-exchange.SuccessModal.deialn", `当前您的剩余可用积分为${remaining}分`, [remaining])}</p>
        </div>

        <div className="mt-6 flex h-9 w-[168px] items-center justify-center gap-1.5 px-3 py-2 font-[PingFang_SC] text-xs leading-[18px]">
          <button
            onClick={onClose}
            className="w-[168px] h-[36px] cursor-pointer rounded bg-blue-500 text-white transition-colors hover:bg-blue-600"
          >
            <span className="text-white">{$t("global-1688-ai-app.seller-center.points-exchange.SuccessModal.wzdl", "我知道了")}</span>
            <span className="ml-1 text-white/30">{$t("global-1688-ai-app.seller-center.points-exchange.SuccessModal.shoff", `(${countdown}s后关闭)`, [countdown])}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};