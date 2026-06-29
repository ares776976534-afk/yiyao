import { Spin } from "antd";
import { imgIcon } from "@/components/ChatFlow/imgIcon";
import style from "./brief.module.css";
import CorrectIcon from "@/components/Icon/Correct";

interface TypeBriefProps {
  taskDescription: string;
  taskStatus?: string;
  type?: string;
}

export const Brief = ({ taskDescription, taskStatus, type }: TypeBriefProps) => {
  const isMobile = type === 'mobile';
  return (
    <div className={isMobile ? style.briefMobile : style.brief}>
      <div className={isMobile ? style.briefMobileIcon : ''}>
        {taskStatus === "COMPLETED" ? (
          <CorrectIcon fill="var(--icon-accent)" />
        ) : (
          <Spin
            // spinning
            indicator={
              <img
                src={imgIcon[6]}
                className={style.loadingSpin}
              />
            }
          />
        )}
      </div>
      <span className="font-medium ml-[6px] flex-1">{taskDescription}</span>
    </div>
  );
};
