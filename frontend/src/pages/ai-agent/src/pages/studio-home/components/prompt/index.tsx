import React, { useEffect } from "react";
import aplus from "@/utils/log";
import { $t } from '@/i18n';
import styles from "./index.module.scss";

const promptList = [
  {
    icon: "https://img.alicdn.com/imgextra/i4/O1CN016NGZRX1ymTRc9YLbT_!!6000000006621-55-tps-14-14.svg",
    title: $t("global-1688-ai-app.home.bulkbdt", "批量白底图"),
    query: $t("global-1688-ai-app.home.qzehmcy", "请你将这几张图片批量换成适合亚马逊上架的纯白底主图，一步到位"),
    imageList: [
      {
        url: "https://img.alicdn.com/imgextra/i4/O1CN01GD3PeQ252OusDxJt4_!!6000000007468-2-tps-1024-1024.png",
        width: 1024,
        height: 1024,
      },
      {
        url: "https://img.alicdn.com/imgextra/i1/O1CN01kA4JwC22ycPimV656_!!6000000007189-2-tps-1024-1024.png",
        width: 1024,
        height: 1024,
      },
      {
        url: "https://img.alicdn.com/imgextra/i3/O1CN01QH6Juz1ywYA7FILxr_!!6000000006643-2-tps-1024-1024.png",
        width: 1024,
        height: 1024,
      },
    ],
    logmap: {
      logKey: '/alphashop.32265051.shortcut.wbimg',
    },
  },
  {
    icon: "https://img.alicdn.com/imgextra/i3/O1CN01PCO8zY1cJEc1xDbGU_!!6000000003579-55-tps-14-14.svg",
    title: $t("global-1688-ai-app.home.yjfgh", "一键风格化"),
    query:
      $t("global-1688-ai-app.home.qzdtlUdxzISli", "请你将这两张照片上面的上衣材质都换成MUJI风格的米白色灯芯绒，生成两张新的图片。尺寸比例1:1。 超高清"),
    imageList: [
      {
        url: "https://img.alicdn.com/imgextra/i1/O1CN015OJoij1DeQY7OAoC9_!!6000000000241-2-tps-1024-1024.png",
        width: 1024,
        height: 1024,
      },
      {
        url: "https://img.alicdn.com/imgextra/i3/O1CN01FkqpNg1ScKyhhbJzI_!!6000000002267-2-tps-1024-1024.png",
        width: 1024,
        height: 1024,
      },
    ],
    logmap: {
      logKey: '/alphashop.32265051.shortcut.style',
    },
  },
  {
    icon: "https://img.alicdn.com/imgextra/i1/O1CN01bj1u7w1P1kUCE2DDC_!!6000000001781-55-tps-14-14.svg",
    title: $t("global-1688-ai-app.home.pcc", "商品套图生成"),
    query:
      $t("global-1688-ai-app.home.crtcxtxgtiyrsjtolx", "参考这张商品图，请你生成这件服饰相关的 模特图/场景图/营销海报图，一共三张图。生图条件：衣服穿在真人女性模特身上，适配场景是tiktokshop，生图比例为1：1，清晰度为2k"),
    imageList: [
      {
        url: "https://img.alicdn.com/imgextra/i1/O1CN01e0QzLV22724gAFX7F_!!6000000007072-2-tps-1024-1024.png",
        width: 1024,
        height: 1024,
      },
    ],
    logmap: {
      logKey: '/alphashop.32265051.shortcut.itemimg',
    },
  },
  {
    icon: "https://img.alicdn.com/imgextra/i3/O1CN01aceJx21FiD2xzIuqH_!!6000000000520-55-tps-14-14.svg",
    title: $t("global-1688-ai-app.home.fkhotfg", "复刻热门风格"),
    query:
      $t("global-1688-ai-app.home.qeghsIPctfskyzgli", "请你复刻第二张图片的风格和展示样式，生成第一张图片商品的海报图，海报上部分上用创意宋体文字写“跨境电商，就用遨虾”，中等字号。图片要求比例为 1:1，高清"),
    imageList: [
      {
        url: "https://img.alicdn.com/imgextra/i1/O1CN01IQB4xz1XxvjJNs4hB_!!6000000002991-2-tps-1024-1024.png",
        width: 1024,
        height: 1024,
      },
      {
        url: "https://img.alicdn.com/imgextra/i3/O1CN01KBVC3m1VtgpbSlkaK_!!6000000002711-2-tps-1024-1024.png",
        width: 1024,
        height: 1024,
      },
    ],
    logmap: {
      logKey: '/alphashop.32265051.shortcut.hotcopy',
    },
  },
];

export default (props) => {

  useEffect(() => {
    promptList?.forEach?.((item) => {
      aplus.record(item?.logmap?.logKey || '', "EXP");
    });
  }, []);

  return promptList?.length > 0 && (
    <div
      className={`${styles.promptList}${props?.className ? ` ${props?.className}` : ''}`}
      data-spm="prompt-list"
    >
      {promptList.map((item, index) => {
        return (
          <div
            key={`${item}-${index}`}
            className={styles.hotWordItem}
            onClick={() => {
              aplus.record(item?.logmap?.logKey || '', "CLK");
              props?.onClick(item);
            }}
          >
            <i
              className={styles.promptListIcon}
              style={{ "--icon-url": `url(${item.icon})` }}
            />
            <span className={styles.promptListText}>{item.title}</span>
          </div>
        );
      })}
    </div>
  );;
};
