import React, { useState } from 'react';
import { Dialog, Form, Field, Select, NumberPicker } from '@alifd/next';
import ReactDOM from 'react-dom';
import actions from '@/service/actions';
import { MessageError } from '@/utlis';

const FormItem = Form.Item;
const container = document.createElement('div');
const formItemLayout = {
  labelCol: {
    fixedSpan: 4,
  },
  wrapperCol: {
    span: 15,
  },
};
function PrintBoxLabelDialog({ props }) {
  const { record, onActionOk } = props;
  const field = Field.useField({ parseName: true });
  const { validate } = field;
  const [visible, setVisible] = useState(true);
  const dialogRef = React.createRef();

  const onClose = () => {
    ReactDOM.unmountComponentAtNode(container);
    setVisible(false);
  };
  const onOk = (v) => {
    validate(async (errors) => {
      if (errors) {
        return;
      }
      // 获取预览原始数据
      const { goodsId = '', planQty = '', goodsName = '', goodsCode = '', relatedSupplierItemId = '', appointOrderCode = '', fulfilmentOrderCode = '' } = record;
      const { boxGauge = 0, boxNum = 0 } = v;
      try {
        await actions({
          group: 'aeOrder',
          name: 'queryPrintData',
          params: {
            type: 'printBoxLabel',
            data: {
              preview: true,
              goodsId,
              data: {
                supplierName: '',
                planQty,
                boxSize: Number(boxGauge),
                boxNum,
                appointOrderCode,
                goods: {
                  goodsName,
                  goodsCode,
                  relatedSupplierItemId,
                  fulfilmentOrderCode,
                },
              },
            },
          },
        });
        onActionOk(v);
        onClose();
      } catch (error) {
        MessageError(error?.data?.msg || '系统异常');
      }
    });
  };
  const handleInputChange = (value) => {
    const newValue = Math.ceil(parseFloat(record?.planQty / value));
    field.setValue('boxNum', isNaN(newValue) ? '' : newValue);
  };

  return (
    <Dialog
      ref={dialogRef}
      v2
      title={<div className="text-[16px] font-medium">打印箱唛</div>}
      onClose={onClose}
      visible={visible}
      footerAlign="center"
      footer={false}
      style={{ width: '360px' }}
    >
      <Form {...formItemLayout} field={field}>
        <FormItem label="打印尺寸" name="printSize" >
          <Select className="printSize" placeholder="请选择打印尺寸" disabled style={{ width: '100%' }} defaultValue="76mm*130mm" />
        </FormItem>
        <FormItem
          label="箱规"
          name="boxGauge"
          required
          requiredMessage="箱规不能为空"
        >
          <NumberPicker
            hasTrigger={false}
            innerAfter="件/箱"
            precision={0}
            placeholder="请输入箱规"
            min={1}
            max={record.planQty}
            style={{ borderRadius: '6px', width: 195 }}
            onChange={handleInputChange}
          />
        </FormItem>
        <FormItem label="箱数" name="boxNum">
          <NumberPicker
            hasTrigger={false}
            innerAfter="箱"
            precision={0}
            placeholder="请输入箱数"
            min={1}
            style={{ borderRadius: '6px', width: 195 }}
            disabled
          />
        </FormItem>
        <FormItem label=" " colon={false} className="mb-0">
          <Form.Submit
            type="primary"
            validate
            onClick={onOk}
            style={{ marginRight: 8, borderRadius: '6px', marginLeft: '22px' }}
          >
            确认
          </Form.Submit>
          <Form.Reset style={{ borderRadius: '6px' }} onClick={onClose}>取消</Form.Reset>
        </FormItem>
      </Form>
    </Dialog>
  );
}

PrintBoxLabelDialog.open = (props) => {
  ReactDOM.render(<PrintBoxLabelDialog props={props} />, container);
};

export default PrintBoxLabelDialog;
