import React from 'react';
import pxToVw from '@/utils/pxToVw';
import styles from './index.module.scss';
import { useIsMobile } from '@/hooks/useDeviceDetection';
import { $t } from '@/i18n';

interface BrandCustomerVoiceProps {
  id?: string;
}

interface TestimonialData {
  text: string;
  author: {
    name: string;
    title: string;
    avatar?: string;
  };
}

// 客户证言配置数据
const testimonialsConfig = {
  topRow: [
    {
      text: $t("global-1688-ai-app.seller-center.home.CustomVoice.krdtIwkmfgdrzznAPrdxhydazzrbgstdyztxcqzwgxwcl", "跨境电商进入智能化拐点，遨虾以一套全新的AI能力平台，为1688 叩开了全球贸易的新门扉——从行业首个外贸全自动询盘机器人、智能选品专家，到素材智能Agent与开放API/MCP生态，正在让跨境生意的效率和想象力同步进化。在全球贸易充满不确定性的当下，遨虾是中国制造出海的智能加速器，让跨境生意变得更确定、更可持续。用数据和智能替代了拍脑袋的直觉。它用AI处理执行，让你能抬起头看路。想在海外市场掌握主动权，就该用这种更聪明的武器，从源头构建你的核心优势。别让无尽的“忙碌”，成为你战略懒惰的借口。"),
      author: {
        name: $t("global-1688-ai-app.seller-center.home.CustomVoice.hx", "虎嗅"),
        title: $t("global-1688-ai-app.seller-center.home.CustomVoice.jcz", "聚焦科技与创新的资讯平台"),
        avatar: 'https://img.alicdn.com/imgextra/i1/O1CN015ffJA41cYo4rZ4KqI_!!6000000003613-2-tps-200-200.png',
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
    {
      text: $t("global-1688-ai-app.seller-center.home.CustomVoice.kzscsdxtadjlabcdlwpxynntlnlsdzdthrllk", "跨境生意里最宝贵的不是资金，而是创始人专注思考的时间。当你还在为选品、比价、P图这些琐事熬夜时，你的对手可能已经在思考战略。1688“遨虾”就是要把你的精力从重复性劳动中解放出来。它把AI武装到了选品和找商这些核心环节 ，用数据和智能替代了拍脑袋的直觉。它用AI处理执行，让你能抬起头看路。想在海外市场掌握主动权，就该用这种更聪明的武器，从源头构建你的核心优势。别让无尽的“忙碌”，成为你战略懒惰的借口。"),
      author: {
        name: $t("global-1688-ai-app.seller-center.home.CustomVoice.pkz", "朋克周"),
        title: $t("global-1688-ai-app.seller-center.home.CustomVoice.Ajt", "AI前沿科技洞察自媒体"),
        avatar: 'https://img.alicdn.com/imgextra/i2/O1CN01ELzzEK1PKWixGcQ94_!!6000000001822-2-tps-200-200.png',
      },
    },
    {
      text: $t("global-1688-ai-app.seller-center.home.CustomVoice.zyh6pngyjzgkPMggdssjxynntlnlsdzdthrllk", "针对跨境经营过程中的核心痛点，1688“遨虾”平台以AI能力赋能各个环节，这无疑能提高跨境生意效率、助力更多中国制造出海，开放性的API架构与MCP服务，更为行业提供了可进化的智能基础设施。跨境电商运营由此进入智能体协同新阶段。 ，用数据和智能替代了拍脑袋的直觉。它用AI处理执行，让你能抬起头看路。想在海外市场掌握主动权，就该用这种更聪明的武器，从源头构建你的核心优势。别让无尽的“忙碌”，成为你战略懒惰的借口。"),
      author: {
        name: $t("global-1688-ai-app.seller-center.home.CustomVoice.news", "新熵"),
        title: $t("global-1688-ai-app.seller-center.home.CustomVoice.zmtczz", "自媒体创作者"),
        avatar: 'https://img.alicdn.com/imgextra/i2/O1CN01LZuhnG1l90IwsswSZ_!!6000000004775-2-tps-200-200.png',
      },
    },
  ] as TestimonialData[],
  bottomRow: [
    {
      text: $t("global-1688-ai-app.seller-center.home.CustomVoice.dcsdhszyblcjHdyrlddjy1yzydwhyajsHynbgoCxsxzldhbll", "对于很多希望从事跨境电商得商家来说，搭建一个专业的跨境运营团队并不简单，很多时候不仅需要面临高昂的成本，也会面临无人可用的尴尬境地。但“遨虾”平台将AI技术应用于目前1688已有的能力和资源之中，可以有效的降低商家的运营难度，快速搭建团队，快速切入，高效运转。 Agent工具。这不仅大幅降低了运营成本，更显著提升了生意效率与响应速度。真正懂生意、能落地，非常值得商家老板们关注、用起来！"),
      author: {
        name: $t("global-1688-ai-app.seller-center.home.CustomVoice.ssb", "沈帅波"),
        title: $t("global-1688-ai-app.seller-center.home.CustomVoice.jjbcjcsr", "进击波财经创始人"),
        avatar: 'https://img.alicdn.com/imgextra/i4/O1CN01e9nL2S1F19ofaYW5M_!!6000000000426-2-tps-200-200.png',
      },
    },
    {
      text: $t("global-1688-ai-app.seller-center.home.CustomVoice.kghryyh8dArhsdhzdezjctxssfjzgjfyzyyddsg", "跨境电商从高利润逐步回归正常利润，精细化运营已成为新一轮竞争的核心。1688利用自身的大数据和AI能力，围绕跨境关键环节——从选品、素材生成到多语言本地化，打造了一整套高质量的AI Agent工具。这不仅大幅降低了运营成本，更显著提升了生意效率与响应速度。真正懂生意、能落地，非常值得商家老板们关注、用起来！ Agent工具。这不仅大幅降低了运营成本，更显著提升了生意效率与响应速度。真正懂生意、能落地，非常值得商家老板们关注、用起来！"),
      author: {
        name: $t("global-1688-ai-app.seller-center.home.CustomVoice.lmuchq", "李多全"),
        title: $t("global-1688-ai-app.seller-center.home.CustomVoice.ssr", "小数汇智创始人"),
        avatar: 'https://img.alicdn.com/imgextra/i2/O1CN01Jr1q4L1DsAQTe2r8l_!!6000000000271-2-tps-200-200.png',
      },
    },
    {
      text: $t("global-1688-ai-app.seller-center.home.CustomVoice.sldtjjhj8wddcxzIwybycmnylkItnrzz0cc1", "时至今日，阿里仍然是最懂商家的平台。拿“遨虾”来讲，当其他跨境电商平台还在为“流量”焦虑时，1688已经在为生态客户搭建 AI 时代的“脚手架”，从选品、找商、询盘，到素材制作和 API&MCP服务，“遨虾”就像一个超级百宝箱，几乎所有跨境电商场景下可能面临的效率难题，“遨虾”都用 AI 重构了新解法，以跨境选品 AI Agent 为例，你很难相信，普通人只用 1 分钟，就能拿到专家级 100 分钟工作成果的同时，成本却不到 1/20。"),
      author: {
        name: $t("global-1688-ai-app.seller-center.home.CustomVoice.smq", "桑明强"),
        title: $t("global-1688-ai-app.seller-center.home.CustomVoice.newmcsr", "新眸创始人"),
        avatar: 'https://img.alicdn.com/imgextra/i3/O1CN01KN8dhl23EBsJvyK6Q_!!6000000007223-2-tps-200-200.png',
      },
    },
    {
      text: $t("global-1688-ai-app.seller-center.home.CustomVoice.kzle6dIzIScyhzjazyekgzezrLyglyznzcllq", "跨境电商正在AI的助力下奔向新未来。1688推出的遨虾，将AI化身选品专家，用API与MCP服务，助力企业构建数字化运营体系。这不仅是工具升级，更是中国出海产业的智能新基建，为跨境企业提供确切性增长路径。 Agent工具。这不仅大幅降低了运营成本，更显著提升了生意效率与响应速度。真正懂生意、能落地，非常值得商家老板们关注、用起来！"),
      author: {
        name: $t("global-1688-ai-app.seller-center.home.CustomVoice.dsnewz", "电商新知"),
        title: $t("global-1688-ai-app.seller-center.home.CustomVoice.zmtczz", "自媒体创作者"),
        avatar: 'https://img.alicdn.com/imgextra/i4/O1CN01wcXXxS1e9HES2Z142_!!6000000003828-2-tps-200-200.png',
      },
    },
  ] as TestimonialData[],
};

const brandLogosConfigMobile = [
  {
    src: 'https://img.alicdn.com/imgextra/i3/O1CN01XTtEEI1oRGx0zSwMv_!!6000000005221-2-tps-464-160.png',
    alt: $t("global-1688-ai-app.seller-center.home.CustomVoice.wln", "万里牛"),
  },
  {
    src: 'https://img.alicdn.com/imgextra/i2/O1CN01xBwEZV1TN3N63OxPV_!!6000000002369-2-tps-452-160.png',
    alt: $t("global-1688-ai-app.seller-center.home.CustomVoice.lx", "领星"),
  },
  {
    src: 'https://img.alicdn.com/imgextra/i2/O1CN01PJGHbT1ofvcqEHZDg_!!6000000005253-2-tps-558-240.png',
    alt: $t("global-1688-ai-app.seller-center.home.CustomVoice.mbERP", "马帮ERP"),
  },
  {
    src: 'https://img.alicdn.com/imgextra/i3/O1CN01thilsf1tbsCGmgJqP_!!6000000005921-2-tps-346-160.png',
    alt: $t("global-1688-ai-app.seller-center.home.CustomVoice.pyyERP", "普源云ERP"),
  },
  {
    src: 'https://img.alicdn.com/imgextra/i4/O1CN01EZIlRf1NWJgbji3Ht_!!6000000001577-2-tps-576-160.png',
    alt: $t("global-1688-ai-app.seller-center.home.CustomVoice.tt", "通途"),
  },
  {
    src: 'https://img.alicdn.com/imgextra/i1/O1CN016MTVCv1LmEDqRgChp_!!6000000001341-2-tps-448-320.png',
    alt: $t("global-1688-ai-app.seller-center.home.CustomVoice.dsmallm", "店小秘"),
  },
  {
    src: 'https://img.alicdn.com/imgextra/i3/O1CN01hwEcJG1LISTKP7McI_!!6000000001276-2-tps-212-160.png',
    alt: $t("global-1688-ai-app.seller-center.home.CustomVoice.msERP", "妙手ERP"),
  },
];

const brandLogosConfig = [
  {
    src: 'https://img.alicdn.com/imgextra/i3/O1CN01XTtEEI1oRGx0zSwMv_!!6000000005221-2-tps-464-160.png',
    alt: $t("global-1688-ai-app.seller-center.home.CustomVoice.wln", "万里牛"),
  },
  {
    src: 'https://img.alicdn.com/imgextra/i2/O1CN01xBwEZV1TN3N63OxPV_!!6000000002369-2-tps-452-160.png',
    alt: $t("global-1688-ai-app.seller-center.home.CustomVoice.lx", "领星"),
  },
  {
    src: 'https://img.alicdn.com/imgextra/i2/O1CN01PJGHbT1ofvcqEHZDg_!!6000000005253-2-tps-558-240.png',
    alt: $t("global-1688-ai-app.seller-center.home.CustomVoice.mbERP", "马帮ERP"),
  },
  {
    src: 'https://img.alicdn.com/imgextra/i3/O1CN01thilsf1tbsCGmgJqP_!!6000000005921-2-tps-346-160.png',
    alt: $t("global-1688-ai-app.seller-center.home.CustomVoice.pyyERP", "普源云ERP"),
  },
  {
    src: 'https://img.alicdn.com/imgextra/i4/O1CN01EZIlRf1NWJgbji3Ht_!!6000000001577-2-tps-576-160.png',
    alt: $t("global-1688-ai-app.seller-center.home.CustomVoice.tt", "通途"),
  },
  {
    src: 'https://img.alicdn.com/imgextra/i3/O1CN014VS0kv20Crso7YAEu_!!6000000006814-2-tps-528-318.png',
    alt: $t("global-1688-ai-app.seller-center.home.CustomVoice.dsmallm", "店小秘"),
  },
  {
    src: 'https://img.alicdn.com/imgextra/i3/O1CN01hwEcJG1LISTKP7McI_!!6000000001276-2-tps-212-160.png',
    alt: $t("global-1688-ai-app.seller-center.home.CustomVoice.msERP", "妙手ERP"),
  },
];


const BrandCustomerVoice: React.FC<BrandCustomerVoiceProps> = () => {
  const isMobile = useIsMobile();

  // 渲染证言卡片的函数
  const renderTestimonialCard = (testimonial: TestimonialData, index: number) => {
    const { text, author } = testimonial;
    const { name, title, avatar } = author;
    return (
      <div>
        <div className={styles.testimonialCard}>
          <span className={styles.testimonialText} title={text}>
            {text}
          </span>
          <div className={styles.authorSection}>
            <div className={styles.authorInfo}>
              <span className={styles.authorName}>{name}</span>
              <span className={styles.authorTitle}>{title}</span>
            </div>
            <img
              src={avatar}
              alt={name}
              className={styles.authorAvatar}
            />
          </div>
        </div>
      </div>
    );
  };

  // 移动端渲染证言卡片
  const renderTestimonialCardMobile = (testimonial: TestimonialData, index: number) => {
    const { text, author } = testimonial;
    const { name, title, avatar } = author;
    return (
      <div>
        <div className={styles.testimonialCard}>
          <span className={styles.testimonialTextMobile} title={text}>
            {text}
          </span>
          <div className={styles.authorSection}>
            <img
              src={avatar}
              alt={name}
              className={styles.authorAvatar}
            />
            <div className={styles.authorInfo}>
              <span className={styles.authorName}>{name}</span>
              <span className={styles.authorTitle}>{title}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <span className={styles.title}>{$t("global-1688-ai-app.seller-center.home.CustomVoice.bCm", "品牌客户声音")}</span>
      <div className={styles.contentWrapper}>
        {
          isMobile ? (
            <>
              {testimonialsConfig.topRow.map((testimonial, index) =>
                renderTestimonialCardMobile(testimonial, index),
              )}

              {testimonialsConfig.bottomRow.map((testimonial, index) =>
                renderTestimonialCardMobile(testimonial, index),
              )}
            </>
          ) : (
            <div className={styles.testimonialsContainer}>
              <div className={styles.scrollContainer}>
                <div className={styles.scrollTrack}>
                  {testimonialsConfig.topRow.map((testimonial, index) =>
                    renderTestimonialCard(testimonial, index),
                  )}
                  {/* 重复内容实现无缝循环 */}
                  {testimonialsConfig.topRow.map((testimonial, index) =>
                    renderTestimonialCard(testimonial, index),
                  )}
                </div>
              </div>
              <div className={styles.scrollContainer} style={{ marginTop: '24px' }}>
                <div className={styles.scrollTrack}>
                  {testimonialsConfig.bottomRow.map((testimonial, index) =>
                    renderTestimonialCard(testimonial, index),
                  )}
                  {/* 重复内容实现无缝循环 */}
                  {testimonialsConfig.bottomRow.map((testimonial, index) =>
                    renderTestimonialCard(testimonial, index),
                  )}
                </div>
              </div>
            </div>
          )
        }

        {isMobile
          ? <>
            <div className={styles.brandLogosMobile}>
              {brandLogosConfigMobile.slice(0, 3).map((logo, index) => (
                <div key={index} className={styles.brandLogoContainer}>
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    className={styles.brandLogoMobile}
                  />
                </div>
              ))}
            </div>
            <div className={styles.brandLogosMobile2}>
              {brandLogosConfigMobile.slice(3, 7).map((logo, index) => (
                <div key={index} className={styles.brandLogoContainer}>
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    className={styles.brandLogoMobile}
                  />
                </div>
              ))}
            </div>
          </>
          : (<div className={styles.brandLogos}>
            {brandLogosConfig.map((logo, index) => (
              <div key={index} className={styles.brandLogoContainer}>
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className={styles.brandLogo}
                />
              </div>
            ))}
          </div>)}

      </div >

      <div className={styles.backgroundImage3} />
      <div className={styles.backgroundImage4} />
    </div >
  );
};

export default BrandCustomerVoice;
