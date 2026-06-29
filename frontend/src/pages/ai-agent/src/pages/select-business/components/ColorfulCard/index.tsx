import style from './index.module.css';
import { ColorfulBtn } from '../ColorfulBtn';
import { Button } from 'antd';
import { $t } from '@/i18n';
import { InstructionsIcon } from "@/components/Icon";
import { MainBtn } from "@/components/ChatFlow/Btn";
import FrostedGlass from '@/components/ChatFlow/FrostedGlass';

interface TypeColorfulCardProps {
  type?: 'br' | 'bm';
  onClick?: () => void;
  title?: string;
  itemBtn?: {
    key: string;
    value: string;
  }[];
  isViewing?: boolean;
  imageUrl?: string;
}

export default function ColorfulCard({ type, onClick, title, itemBtn, isViewing, imageUrl }: TypeColorfulCardProps) {
  return (
    <div className={style.colorfulCard}>
      <div className={style.colorfulCard__header}>
        {
          imageUrl && (
            <FrostedGlass
              style={{ width: 76, height: 76 }}
              imageUrl={imageUrl}
            />
          )
        }
        <div className={style.colorfulCard__content}>
          <div className={style.colorfulCard__title}>{title}</div>
          <div className={style.colorfulCard__item}>
            {itemBtn?.map((ele, index) => <div className={style.item_btn} key={`${ele?.value}-${index}`}>{ele?.value}</div>)}
          </div>
          <div className={style.colorfulCard__bottom}>
            {type === 'br' && (
              <div className={style.colorfulCard__icon}>
                <InstructionsIcon />
                <div className={style.colorfulCard__iconText}>{$t("global-1688-ai-app.select-business.ColorfulCard.bexCn", "本内容由遨虾AI生成，内容供参考")}</div>
              </div>
            )}
            <div className={style.bmBtn}>
              <MainBtn
                text={isViewing ? $t(
                  "global-1688-ai-app.ChatFlow.ColorfulCard.zzview",
                  "正在查看"
                ) : $t(
                  "global-1688-ai-app.ChatFlow.ColorfulCard.viewDetails",
                  "查看详情"
                )}
                handleBtn={onClick}
                style={{ height: '36px' }}
                other={{
                  disabled: isViewing
                }}
              />
            </div>
          </div>
        </div>
        {/* {type === 'br' && <ColorfulBtn title="查看详情" onClick={onClick} />} */}
      </div>
      {type === 'bm' && (
        <div className={style.colorfulCard__icon}>
          <InstructionsIcon />
          <div className={style.colorfulCard__iconText}>{$t("global-1688-ai-app.select-business.ColorfulCard.bexCn", "本内容由遨虾AI生成，内容供参考")}</div>
        </div>
      )}
    </div>
  );
}