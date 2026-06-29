import { useState, useEffect } from "react";
import { useSpm } from "ice";
import Item from "./item";
import CaseModal from "@/components/Case";
import queryShowCaseList from "@/services/studio/queryShowCaseList";
import aplus from "@/utils/log";
import styles from "./index.module.scss";
import { $t } from '@/i18n';

const mockData = new Array(20).fill(0).map((item, index) => {
  return {
    id: index,
    showTitle: $t("global-1688-ai-app.studio.ExcellentCases.altitle", "案例标题"),
    userName: $t("global-1688-ai-app.studio.ExcellentCases.axgf", "遨虾官方"),
    userImage: "",
    shareCode: "ab76b6f0ae",
    showCoverImages: [
      {
        sourceUrl:
          "https://img.alicdn.com/imgextra/i2/O1CN01kQPvFO24thOVVAz4m_!!6000000007449-2-tps-1200-1200.png",
      },
      {
        sourceUrl:
          "https://img.alicdn.com/imgextra/i1/O1CN015OJoij1DeQY7OAoC9_!!6000000000241-2-tps-1024-1024.png",
      },
      {
        sourceUrl:
          "https://img.alicdn.com/imgextra/i3/O1CN01FkqpNg1ScKyhhbJzI_!!6000000002267-2-tps-1024-1024.png",
      },
      {
        sourceUrl:
          "https://img.alicdn.com/imgextra/i1/O1CN01e0QzLV22724gAFX7F_!!6000000007072-2-tps-1024-1024.png",
      },
    ].slice(0, (index % 4) + 1),
  };
});

export default (props: {
  className?: string;
  showTitle?: boolean;
  title?: string;
  data?: any[];
  max?: number;
  jumpPageParams?: any;
  onClick?: (item: any) => boolean;
}) => {
  const { className, showTitle = true, title, data, jumpPageParams, onClick } = props;
  const [shareCode, setShareCode] = useState("");
  const [caseModalOpen, setCaseModalOpen] = useState(false);
  const [list, setList] = useState(data || []);
  const maxLength = props.max || data?.length;

  const [, spmB] = useSpm();

  const logmap = {
    caseClick: `/alphashop.${spmB}.showcase.designclick`,
  };

  const handleCloseCaseModal = () => {
    setCaseModalOpen(false);
    // 关闭modal时移除视频播放器容器
    const videoControlsContainer = document.querySelector(
      ".video-controls-container"
    );
    if (videoControlsContainer) {
      videoControlsContainer.innerHTML = "";
    }
  };

  const handleOpenCaseModal = (item: any) => {
    setShareCode(item?.shareCode);
    setCaseModalOpen(true);
  };

  useEffect(() => {
    queryShowCaseList().then((res) => {
      setList(res || []);
    });
  }, []);

  return (
    <div
      className={`${styles.excellentCases}${className ? ` ${className}` : ""}`}
    >
      {showTitle && (
        <div className={styles.excellentCasesTitle}>
          {title || $t("global-1688-ai-app.studio.ExcellentCases.jcalzs", "精彩案例展示")}
        </div>
      )}
      <div className={styles.excellentCasesList} data-spm="excellent-cases" data-role="excellent-cases-list">
        {list?.slice(0, maxLength)?.map((item, i) => {
          return (
            <Item
              key={`case_${i}`}
              data={item}
              dataIndex={i}
              onFirstAppear={() => {
                aplus.record(logmap.caseClick, "EXP");
              }}
              onClick={() => {
                aplus.record(logmap.caseClick, "CLK", {
                  id: item.id,
                });

                // 用户自定义click事件返回false，则不执行默认点击事件
                if (onClick?.(item) === false) {
                  return;
                }

                handleOpenCaseModal(item);
              }}
            />
          );
        })}
      </div>

      {
        !!caseModalOpen && (
          <CaseModal
            isModalOpen={caseModalOpen}
            onClose={handleCloseCaseModal}
            shareCode={shareCode}
            jumpPageParams={jumpPageParams}
          />
        )
      }
    </div >
  );
};
