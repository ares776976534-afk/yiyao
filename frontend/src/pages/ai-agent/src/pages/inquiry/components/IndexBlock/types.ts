export type IndexBlockProps = {
  title: React.ReactNode | string;
  subTitle?: string | React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
  contentClassName?: string; // 新增：允许自定义content区域的样式
}