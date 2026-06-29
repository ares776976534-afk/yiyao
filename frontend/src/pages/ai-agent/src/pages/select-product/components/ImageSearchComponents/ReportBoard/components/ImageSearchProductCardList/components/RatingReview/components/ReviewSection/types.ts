import type { TypeReviewTag } from '../../types';

export interface TypeReviewSectionProps {
  // 标题文字
  title: string;
  // 圆点样式类名
  dotClassName: string;
  // 分类标签列表
  categoryTagList: TypeReviewTag[];
  // 统计文本（JSX.Element 或 string）
  statisticsText: React.ReactNode;
}
