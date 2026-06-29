import { Markdown } from "@/components/ChatFlow/Markdown";
import style from './taskPlanning.module.css';

export const TaskPlanning = (props) => {
  return (
    <div className={style.taskPlanning}>
      <Markdown {...props} />
    </div>
  )
}