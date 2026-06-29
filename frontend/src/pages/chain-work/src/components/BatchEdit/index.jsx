import React from 'react';
import { Dialog, Field, Form, Message } from '@alifd/next';
// import { getValuesAndErrors } from '@/pages/cbsc/utils';
function BatchEdit({
  visible,
  setVisible,
  onSubmitBatchEdit = () => { },
  title = '批量填写',
  creationFn,
  dialogStyle,
}) {
  const field = Field.useField({ parseName: true });

  const formItemLayout = {
    labelCol: { fixedSpan: 8 },
    wrapperCol: { span: 14 },
    labelAlign: 'left',
    labelTextAlign: 'right',
    // fullWidth: true
  };
  const onClose = () => {
    setVisible(false);
  };
  const onOk = () => {
    try {
      field.validate((errors, values) => {
        // getValuesAndErrors(field, (errors, values) => {
        if (!errors) {
          onSubmitBatchEdit && onSubmitBatchEdit(values);
          Message.success('批量填写成功');
          setVisible(false);
          return true;
        } else {
          Message.warning('你有不满足填写要求的字段，请修改后再次提报！');
        }
      });
    } catch (errors) {
      Message.warning('你有不满足填写要求的字段，请修改后再次提报！');
    }
  };
  const renderEditContent = () => {
    return (
      <Form {...formItemLayout} field={field}>
        {creationFn(field)}
      </Form>
    );
  };
  return (
    <Dialog
      v2
      title={title}
      visible={visible}
      onOk={onOk}
      onClose={onClose}
      footerActions={['ok', 'cancel']}
      footerAlign="center"
      style={dialogStyle}
    >
      {renderEditContent()}
    </Dialog>
  );
}

export default BatchEdit;
