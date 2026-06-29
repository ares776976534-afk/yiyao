import { useState, useEffect } from "react";
import Masonry from "react-masonry-css";
import Item from "./item";
import CaseModal from "@/components/Case";
import queryShowCaseList from "@/services/studio/queryShowCaseList";
import aplus from "@/utils/log";
import styles from "./index.module.scss";

const mockData = [
  {
    id: 0,
    showTitle: "案例标题",
    userName: "遨虾官方",
    userImage: "",
    shareCode: "ab76b6f0ae",
    showCoverImages: [
      {
        sourceUrl:
          "https://img.alicdn.com/imgextra/i3/O1CN01eSjLSM1zkvk3Zaknk_!!6000000006753-2-tps-328-464.png",
      },
    ],
  },
  {
    id: 1,
    showTitle: "案例标题",
    userName: "遨虾官方",
    userImage: "",
    shareCode: "ab76b6f0ae",
    showCoverImages: [
      {
        sourceUrl:
          "https://img.alicdn.com/imgextra/i2/O1CN01RghDZk1ZqijtE08DL_!!6000000003246-2-tps-328-426.png",
      },
    ],
  },
  {
    id: 2,
    showTitle: "案例标题",
    userName: "遨虾官方",
    userImage: "",
    shareCode: "ab76b6f0ae",
    showCoverImages: [
      {
        sourceUrl:
          "https://img.alicdn.com/imgextra/i3/O1CN01v1BPvK241CGufb8hQ_!!6000000007330-2-tps-328-426.png",
      },
    ],
  },
  {
    id: 3,
    showTitle: "案例标题",
    userName: "遨虾官方",
    userImage: "",
    shareCode: "ab76b6f0ae",
    showCoverImages: [
      {
        sourceUrl:
          "https://img.alicdn.com/imgextra/i4/O1CN011s0cu61uaKUnmb8Y6_!!6000000006053-2-tps-336-391.png",
      },
    ],
  },
];

const mockData2 = [
  {
    id: 53,
    showTitle: "大容量水杯商品组批量优化",
    showCoverImages: [
      {
        sourceUrl:
          "https://img.alicdn.com/imgextra/i1/6000000005768/O1CN01tMee4f1sTnc3pvknq_!!6000000005768-0-cbu_global_ai_agent.jpg",
        width: 0,
        height: 0,
      },
    ],
    showDesc: "大容量水杯商品组批量优化",
    createdTime: 1763613435000,
    userName: "遨虾官方",
    userImage:
      "https://img.alicdn.com/imgextra/i4/O1CN01oupWdN1zar0jHCxFm_!!6000000006731-2-tps-176-176.png",
    shareCode: "10371eb5ae",
  },
  {
    id: 47,
    showTitle: "多色号抹胸裙生成，一裙多色",
    showCoverImages: [
      {
        sourceUrl:
          "https://img.alicdn.com/imgextra/i2/6000000003255/O1CN01Wotznv1ZuqIesVvMr_!!6000000003255-0-cbu_global_ai_agent.jpg",
        width: 0,
        height: 0,
      },
    ],
    showDesc: "多色号抹胸裙生成，一裙多色",
    createdTime: 1763604244000,
    userName: "遨虾官方",
    userImage:
      "https://img.alicdn.com/imgextra/i4/O1CN01oupWdN1zar0jHCxFm_!!6000000006731-2-tps-176-176.png",
    shareCode: "59b99a35a4",
  },
  {
    id: 46,
    showTitle: "高温清洁器家用场景图",
    showCoverImages: [
      {
        sourceUrl:
          "https://img.alicdn.com/imgextra/i2/6000000007476/O1CN01oL61RS25645q8IiTJ_!!6000000007476-0-cbu_global_ai_agent.jpg",
        width: 0,
        height: 0,
      },
    ],
    showDesc: "高温清洁器家用场景图",
    createdTime: 1763604188000,
    userName: "遨虾官方",
    userImage:
      "https://img.alicdn.com/imgextra/i4/O1CN01oupWdN1zar0jHCxFm_!!6000000006731-2-tps-176-176.png",
    shareCode: "bf649228ff",
  },
  {
    id: 51,
    showTitle: "香薰蜡适配多节日场景图",
    showCoverImages: [
      {
        sourceUrl:
          "https://img.alicdn.com/imgextra/i4/6000000006354/O1CN013lPVKw1woBhqWC3nD_!!6000000006354-2-cbu_global_ai_agent.png",
        width: 0,
        height: 0,
      },
      {
        sourceUrl:
          "https://img.alicdn.com/imgextra/i4/6000000002808/O1CN01UntKeT1Wc7FzVLSDC_!!6000000002808-2-cbu_global_ai_agent.png",
        width: 0,
        height: 0,
      },
      {
        sourceUrl:
          "https://img.alicdn.com/imgextra/i3/6000000007698/O1CN01FR25kz26jk1CA5lBL_!!6000000007698-2-cbu_global_ai_agent.png",
        width: 0,
        height: 0,
      },
      {
        sourceUrl:
          "https://img.alicdn.com/imgextra/i2/6000000001591/O1CN01ubejO01NcjFFD5mtj_!!6000000001591-2-cbu_global_ai_agent.png",
        width: 0,
        height: 0,
      },
    ],
    showDesc: "香薰蜡适配多节日场景图",
    createdTime: 1763604187000,
    userName: "遨虾官方",
    userImage:
      "https://img.alicdn.com/imgextra/i4/O1CN01oupWdN1zar0jHCxFm_!!6000000006731-2-tps-176-176.png",
    shareCode: "7322f85377",
  },
  {
    id: 52,
    showTitle: "包品挂饰批量生成模特展示图",
    showCoverImages: [
      {
        sourceUrl:
          "https://img.alicdn.com/imgextra/i3/6000000001377/O1CN01QyIKt51M2iUKyTIrx_!!6000000001377-0-cbu_global_ai_agent.jpg",
        width: 0,
        height: 0,
      },
    ],
    showDesc: "包品挂饰批量生成模特展示图",
    createdTime: 1763604186000,
    userName: "遨虾官方",
    userImage:
      "https://img.alicdn.com/imgextra/i4/O1CN01oupWdN1zar0jHCxFm_!!6000000006731-2-tps-176-176.png",
    shareCode: "13b0da8ecc",
  },
  {
    id: 45,
    showTitle: "批量抠图&生成商品展示图",
    showCoverImages: [
      {
        sourceUrl:
          "https://img.alicdn.com/imgextra/i3/6000000004027/O1CN01V60CgK1fcQ3wKMwcX_!!6000000004027-0-cbu_global_ai_agent.jpg",
        width: 0,
        height: 0,
      },
    ],
    showDesc: "批量抠图&生成商品展示图",
    createdTime: 1763604105000,
    userName: "遨虾官方",
    userImage:
      "https://img.alicdn.com/imgextra/i4/O1CN01oupWdN1zar0jHCxFm_!!6000000006731-2-tps-176-176.png",
    shareCode: "28717ef443",
  },
  {
    id: 43,
    showTitle: "发胶模特展示图",
    showCoverImages: [
      {
        sourceUrl:
          "https://img.alicdn.com/imgextra/i1/6000000007036/O1CN019TcYG321qXp6pi3WH_!!6000000007036-2-cbu_global_ai_agent.png",
        width: 0,
        height: 0,
      },
    ],
    showDesc: "发胶模特展示图",
    createdTime: 1763603862000,
    userName: "遨虾官方",
    userImage:
      "https://img.alicdn.com/imgextra/i4/O1CN01oupWdN1zar0jHCxFm_!!6000000006731-2-tps-176-176.png",
    shareCode: "6c98b815ce",
  },
  {
    id: 42,
    showTitle: "亮橙色夹克上身展示",
    showCoverImages: [
      {
        sourceUrl:
          "https://img.alicdn.com/imgextra/i3/6000000004688/O1CN01xjbRsU1kV9rNn4ysM_!!6000000004688-0-cbu_global_ai_agent.jpg",
        width: 0,
        height: 0,
      },
      {
        sourceUrl:
          "https://img.alicdn.com/imgextra/i4/6000000004615/O1CN014K32zf1jxiwmaddmE_!!6000000004615-0-cbu_global_ai_agent.jpg",
        width: 0,
        height: 0,
      },
    ],
    showDesc: "亮橙色夹克上身展示",
    createdTime: 1763603819000,
    userName: "遨虾官方",
    userImage:
      "https://img.alicdn.com/imgextra/i4/O1CN01oupWdN1zar0jHCxFm_!!6000000006731-2-tps-176-176.png",
    shareCode: "4965e97a34",
  },
  {
    id: 54,
    showTitle: "Ins风穿搭单品拆解",
    showCoverImages: [
      {
        sourceUrl:
          "https://cbu01.alicdn.com/imgextra/i4/6000000000787/O1CN01YNvRvd1HgUo7BIZ1w_!!6000000000787-2-cbu_global_ai_agent.png",
        width: 0,
        height: 0,
      },
      {
        sourceUrl:
          "https://img.alicdn.com/imgextra/i4/6000000004932/O1CN014dddRY1mIuV2HPLPO_!!6000000004932-2-cbu_global_ai_agent.png",
        width: 0,
        height: 0,
      },
    ],
    showDesc: "Ins风穿搭单品拆解",
    createdTime: 1763603818000,
    userName: "遨虾官方",
    userImage:
      "https://img.alicdn.com/imgextra/i4/O1CN01oupWdN1zar0jHCxFm_!!6000000006731-2-tps-176-176.png",
    shareCode: "9bc1f30b5b",
  },
  {
    id: 40,
    showTitle: "桂花香水展示图",
    showCoverImages: [
      {
        sourceUrl:
          "https://img.alicdn.com/imgextra/i1/6000000003376/O1CN0175JMng1aoGDlnjPUi_!!6000000003376-2-cbu_global_ai_agent.png",
        width: 0,
        height: 0,
      },
    ],
    showDesc: "桂花香水展示图",
    createdTime: 1763603527000,
    userName: "遨虾官方",
    userImage:
      "https://img.alicdn.com/imgextra/i4/O1CN01oupWdN1zar0jHCxFm_!!6000000006731-2-tps-176-176.png",
    shareCode: "813c1a0192",
  },
  {
    id: 55,
    showTitle: "阳光橙味护手霜展示图",
    showCoverImages: [
      {
        sourceUrl:
          "https://img.alicdn.com/imgextra/i1/6000000005358/O1CN01mt4Mat1pS1Dw34UHs_!!6000000005358-0-cbu_global_ai_agent.jpg",
        width: 0,
        height: 0,
      },
    ],
    showDesc: "阳光橙味护手霜展示图",
    createdTime: 1763603317000,
    userName: "遨虾官方",
    userImage:
      "https://img.alicdn.com/imgextra/i4/O1CN01oupWdN1zar0jHCxFm_!!6000000006731-2-tps-176-176.png",
    shareCode: "b8a476883c",
  },
  {
    id: 36,
    showTitle: "除螨仪厨房清洗场景图",
    showCoverImages: [
      {
        sourceUrl:
          "https://img.alicdn.com/imgextra/i2/6000000006566/O1CN01QoX3xw1yNHfndAedN_!!6000000006566-0-cbu_global_ai_agent.jpg",
        width: 0,
        height: 0,
      },
    ],
    showDesc: "除螨仪厨房清洗场景图",
    createdTime: 1763603316000,
    userName: "遨虾官方",
    userImage:
      "https://img.alicdn.com/imgextra/i4/O1CN01oupWdN1zar0jHCxFm_!!6000000006731-2-tps-176-176.png",
    shareCode: "6504429ba9",
  },
];

export default (props: {
  className?: string;
  showTitle?: boolean;
  title?: string;
  data?: any[];
  max?: number;
  columns?: number;
  jumpPageParams?: any;
  onClick?: (item: any) => boolean;
}) => {
  const {
    className,
    showTitle = false,
    title,
    data,
    jumpPageParams,
    onClick,
    columns = 2,
  } = props;
  const [shareCode, setShareCode] = useState("");
  const [caseModalOpen, setCaseModalOpen] = useState(false);
  const [list, setList] = useState(data || []);
  const maxLength = props.max || data?.length;

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
      className={`${styles.masonryExcellentCases}${
        className ? ` ${className}` : ""
      }`}
    >
      {showTitle && (
        <div className={styles.excellentCasesTitle}>
          {title || "精彩案例展示"}
        </div>
      )}
      <Masonry
        breakpointCols={columns}
        className={styles.masonryGrid}
        columnClassName={styles.masonryColumn}
        data-spm="excellent-cases"
        data-role="excellent-cases-list"
      >
        {list?.slice(0, maxLength)?.map((item, i) => {
          return (
            <Item
              key={`case_${i}`}
              data={item}
              dataIndex={i}
              onClick={() => {
                aplus.record("/alphashop.studio.home.case-click", "CLK", {
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
      </Masonry>

      {!!caseModalOpen && (
        <CaseModal
          isModalOpen={caseModalOpen}
          onClose={handleCloseCaseModal}
          shareCode={shareCode}
          jumpPageParams={jumpPageParams}
        />
      )}
    </div>
  );
};
