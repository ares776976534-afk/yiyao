/**
 * 根据订单号获取揽收单模板数据，包含打印和预览
 */
import mtopFc from '@/libs/mtopFc';

interface Model {
  task: {
    printType?: string;
    printer?: string;
    documents: Array<{
      contents: Array<{
        templateURL: string;
      }>;
    }>;
  };
}

export default ({ type, data }) => {
  const serviceMap = {
    wayBill: 'ExpressOrderPrint1688',
    mark: 'BoxMarkPrint1688',
    label: 'OfferMarkPrint1688',
    label_cbsc: 'OfferMarkPrintBP', // 逻辑与label一致
    label_pws: 'PWS',
    printDelivery: 'LBXPrintAppointOrderService',
    printBoxLabel: 'BoxMarkPrintAppointOrderService',
    printBarCode: 'OfferMarkPrintAppointOrderService',
    jitPrintWayBill: 'FulfillmentCheckOrderPrint',
  };
  const apiMap = {
    printDelivery: 'mtop.com.alibaba.cbu.sc.label.LBXPrintOrderService.execute',
  };

  return mtopFc(
    serviceMap[type],
    {
      params: {
        previewType: 'pdf',
        ...data,
      },
      enableToken: true,
      api: apiMap[type] || 'mtop.alibaba.national.sc.CommonMtop',
      type: 'POST',
    },
  ).then((res) => {
    // 把多个最外层的数据合并到第一个数据模型的contents中，这样只会生成一个大文件
    const model = (res?.model || [] as Model[]).reduce((a, b) => {
      if (!a) {
        return b;
      }

      if (!a.task.documents) {
        a.task.documents = [{ contents: [] }];
      }

      if (!a.task.documents[0].contents) {
        a.task.documents[0].contents = [];
      }

      a.task.documents[0].contents.push(...(b.task.documents?.[0].contents || []));
      return a;
    }, null);

    if (!model || !model.task) {
      return;
    }

    if (!data.preview) {
      model.task.printer = data.printer;

      // 箱唛和货品标签是打印PDF（揽收单是xml+数据转换打印），需要加printType='dirctPrint'
      // if (['mark', 'label'].includes(type)) {
      if (['mark', 'label'].some((i) => type.startsWith(i))) {
        model.task.printType = 'dirctPrint';
      }
    } else {
      // windows系统必须是boolean类型的true才能识别为预览
      model.task.preview = true;
    }

    // taskID不能重复
    model.task.taskID = model.requestID || new Date().getTime();

    return model;
  });
};
