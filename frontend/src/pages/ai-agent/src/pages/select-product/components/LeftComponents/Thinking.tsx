import React from "react";
import { $t } from "@/i18n";
import './thinking.scss';

enum ThinkingStatus {
  THINKING = "THINKING",
  COMPLETED = "COMPLETED",
}

// 思考中文本和动画组件
const ThinkingText: React.FC = () => {
  return (
    <div className="flex items-center gap-[8px]">
      <div className="text-[14px] text-[#7C7F9A]">
        {$t(
          "global-1688-ai-app.select-product.LeftComponents.Thinking.skz",
          `正在思考`,
        )}
      </div>
      <div className="dot-flashing" style={{ marginLeft: "6px" }} />
    </div>
  );
};

export default function Thinking({
  thinkingStatus,
}: {
  thinkingStatus: ThinkingStatus;
}) {
  if (thinkingStatus === ThinkingStatus.COMPLETED) {
    return null;
  }
  return (
    <div className="flex items-center gap-[4px]">
      <div className="text-[16px]" style={{ color: "rgba(0, 0, 0, 0.87)" }}>
        <ThinkingText />
      </div>
    </div>
  );
}
