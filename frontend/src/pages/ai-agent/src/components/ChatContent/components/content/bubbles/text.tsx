import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import pcStyles from "./index.module.scss";
import { TypeTextContent } from "@/components/ChatContent/index.d";
import mobileStyles from "./index.mobile.module.scss";
interface TextBubbleProps {
  content: TypeTextContent;
  style?: React.CSSProperties;
  className?: string;
  icon?: React.ReactNode;
  isMobile?: boolean;
}

export default function TextBubble(props: TextBubbleProps) {
  const { content, style, className, icon, isMobile = false } = props;
  const styles = isMobile ? mobileStyles : pcStyles;

  // 确保 content.content 是字符串类型
  const textContent =
    typeof content?.content === "string" ? content.content : "";

  // 如果没有文本内容，不渲染
  if (!textContent) {
    return null;
  }

  return (
    <div
      className={`${styles.bubbleContainer}${className ? ` ${className}` : ""}`}
      style={{ ...style }}
    >
      {icon || null}
      <div>
        <Markdown remarkPlugins={[remarkGfm]}>{textContent}</Markdown>
      </div>
    </div>
  );
}
