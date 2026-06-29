import React from 'react';
import styles from './index.module.scss';
import { $t } from '@/i18n';
import TestimonialItem from './TestimonialItem';

interface BrandCustomerVoiceProps {
  id?: string;
}

// 客户证言配置数据
const testimonialsConfig = {
  firstCol: [
    {
      text: $t("global-1688-ai-app.seller-center.home.CustomVoice.krdtdp8qNcdbxsgkMzshbqbdzhssqx", "跨境电商进入智能化拐点，遨虾以一套全新的AI能力平台，为1688 叩开了全球贸易的新门扉——从外贸全自动询盘机器人、智能选品专家，到素材智能Agent与开放API/MCP生态，正在让跨境生意的效率和想象力同步进化。在全球贸易充满不确定性的当下，遨虾是中国制造出海的智能加速器，让跨境生意变得更确定、更可持续"),
      author: {
        name: $t("global-1688-ai-app.seller-center.home.CustomVoice.hx", "虎嗅"),
        title: $t("global-1688-ai-app.seller-center.home.CustomVoice.jcz", "聚焦科技与创新的资讯平台"),
        avatar: 'https://img.alicdn.com/imgextra/i1/O1CN015ffJA41cYo4rZ4KqI_!!6000000003613-2-tps-200-200.png',
      },
    },
    {
      text: $t("global-1688-ai-app.seller-center.home.CustomVoice.kzscsm8yllcIrthwgccnsdnd", "跨境生意里最宝贵的不是资金，而是创始人专注思考的时间。1688“遨虾”就是要把你的精力从重复性劳动中解放出来。它用AI处理执行，让你能抬起头看路。想在海外市场掌握主动权，就该用这种更聪明的武器，从源头构建你的核心优势。别让无尽的“忙碌”，成为你战略懒惰的借口。"),
      author: {
        name: $t("global-1688-ai-app.seller-center.home.CustomVoice.pkz", "朋克周"),
        title: $t("global-1688-ai-app.seller-center.home.CustomVoice.Ajt", "AI前沿科技洞察自媒体"),
        avatar: 'https://img.alicdn.com/imgextra/i2/O1CN01ELzzEK1PKWixGcQ94_!!6000000001822-2-tps-200-200.png',
      },
    },
  ],
  secondCol: [
    {
      text: $t("global-1688-ai-app.seller-center.home.CustomVoice.dcsdhszyblpjm8lzlLrtdajytsldycrtoy", "对于很多希望从事跨境电商的商家来说，搭建一个专业的跨境运营团队并不简单。但“遨虾”平台将AI技术应用于目前1688已有的能力和资源之中，可以有效的降低商家的运营难度，这不仅大幅降低了运营成本，更显著提升了生意效率与响应速度。真正懂生意、能落地，非常值得商家老板们关注、用起来！"),
      author: {
        name: $t("global-1688-ai-app.seller-center.home.CustomVoice.ssb", "沈帅波"),
        title: $t("global-1688-ai-app.seller-center.home.CustomVoice.jjbcjcsr", "进击波财经创始人"),
        avatar: 'https://img.alicdn.com/imgextra/i4/O1CN01e9nL2S1F19ofaYW5M_!!6000000000426-2-tps-200-200.png',
      },
    },
    {
      text: $t("global-1688-ai-app.seller-center.home.CustomVoice.sysrthdkxxzwjAwxznnjigtt2", "时至今日，阿里仍然是最懂商家的平台。几乎所有跨境电商场景下可能面临的效率难题，“遨虾”都用 AI 重构了新解法。以跨境选品 AI Agent 为例，你很难相信，普通人只用 1 分钟，就能拿到专家级 100 分钟工作成果的同时，成本却不到 1/20。"),
      author: {
        name: $t("global-1688-ai-app.seller-center.home.CustomVoice.smq", "桑明强"),
        title: $t("global-1688-ai-app.seller-center.home.CustomVoice.newmcsr", "新眸创始人"),
        avatar: 'https://img.alicdn.com/imgextra/i3/O1CN01KN8dhl23EBsJvyK6Q_!!6000000007223-2-tps-200-200.png',
      },
    },
  ],
  thirdCol: [
    {
      text: $t("global-1688-ai-app.seller-center.home.CustomVoice.khrNlhwlxlLDArhsMyzHuygjajytsldycrtoy", "跨境电商从高利润逐步回归正常利润，精细化运营已成为新一轮竞争的核心。1688利用自身的大数据和AI能力，围绕跨境关键环节——从选品、素材生成到多语言本地化，打造了一整套高质量的AI Agent工具。这不仅大幅降低了运营成本，更显著提升了生意效率与响应速度。真正懂生意、能落地，非常值得商家老板们关注、用起来！"),
      author: {
        name: $t("global-1688-ai-app.seller-center.home.CustomVoice.lmuchq", "李多全"),
        title: $t("global-1688-ai-app.seller-center.home.CustomVoice.ssr", "小数汇智创始人"),
        avatar: 'https://img.alicdn.com/imgextra/i2/O1CN01Jr1q4L1DsAQTe2r8l_!!6000000000271-2-tps-200-200.png',
      },
    },
    {
      text: $t("global-1688-ai-app.seller-center.home.CustomVoice.1wyactzuhtAjeguywzed", "1688作为“中国买家”最大的厂货采购平台，正加速成长为“全球买家”采货的首选平台，跨境AI Agent既给买家提供了更智能的多维经营工具，也成为了中国制造大航海时代的强力引擎。"),
      author: {
        name: $t("global-1688-ai-app.seller-center.home.CustomVoice.TKlg", "TK磊哥"),
        title: $t("global-1688-ai-app.seller-center.home.CustomVoice.TKgccsr", "TK观察创始人"),
        avatar: 'https://img.alicdn.com/imgextra/i3/O1CN01wCumyU1I9o8zPkDaW_!!6000000000851-2-tps-200-200.png',
      },
    },
  ],
};

const BrandCustomerVoice: React.FC<BrandCustomerVoiceProps> = () => {
  return (
    <div className="flex justify-center overflow-x-hidden w-full">
      <div className="flex flex-col items-center justify-center w-[1200px]">

        <p className="text-[34px] text-[#1D1E29] mt-[108px] font-['FZLTHProS'] h-[38px]">{$t("global-1688-ai-app.seller-center.home.CustomVoice.bCm", "品牌客户声音")}</p>

        <div className={styles.container} >
          <div className={styles.col}>
            {testimonialsConfig.firstCol.map((testimonial, index) => {
              return (
                <TestimonialItem key={index} testimonial={testimonial} />
              );
            })}
          </div>

          <div className={styles.col}>
            {testimonialsConfig.secondCol.map((testimonial, index) => {
              return (
                <TestimonialItem key={index} testimonial={testimonial} />
              );
            })}
          </div>

          <div className={styles.col}>
            {testimonialsConfig.thirdCol.map((testimonial, index) => {
              return (
                <TestimonialItem key={index} testimonial={testimonial} />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandCustomerVoice;
