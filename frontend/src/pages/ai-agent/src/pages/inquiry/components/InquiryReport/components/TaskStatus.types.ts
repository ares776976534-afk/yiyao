export type TaskStatus = 'FINISHED' | 'RUNNING' | 'QUEUING' | 'STOP';

export interface TypeTaskInfo {
  status: TaskStatus;
  img: string;
  createTime: string;
  finishTime?: string;
  title: string;
  isAutoOrder: boolean;
  questionNum?: number;
  supplierNum?: number;
}

export interface TypeAiInsight {
  value: string;
  cnKey: string;
}

export interface TypeTaskStatusData {
  taskInfo: TypeTaskInfo;
  aiInsight: TypeAiInsight[];
  isReport: boolean;
}

export interface TypeTaskStatusProps {
  data: TypeTaskStatusData;
  taskId?: string;
}
