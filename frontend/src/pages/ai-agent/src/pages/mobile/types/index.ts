export interface TaskProps {
    createTime: string
    isReportFinished: boolean;
    itemInfo: {
        imgUrl: string;
        offerId: string;
        title: string;
    }
    name: string;
    status: string;
    supplierCnt: number;
    taskId: string;
    type: string;
}