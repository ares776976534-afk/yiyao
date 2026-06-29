import React, { useState, useEffect } from 'react';
import { Dialog, Button, Form, Message, Input, Table, Icon, Radio, Field, NumberPicker } from '@alifd/next';
import ReactDOM from 'react-dom';
import BatchEdit from '@/components/BatchEdit';
import { fromEntries, Logger, MessageError, MessageSuccess } from '@/utlis';
import { officialSkuFeaturesData, submitSkuFeatures, fetchIsOfficialSkuFeatures, queryItemPws } from '../services/index';
import { formItemLayout, FieldsMap } from '../enums';
import './PieceWeightDialog.scss';
import pieceColumnSchema from './pieceColumnSchema';

const container = document.createElement('div');
const RadioGroup = Radio.Group;
function PieceWeightDialog(props) {
  const { records, onActionOk } = props.callback;
  const field = Field.useField({ parseName: true });
  const { validate, reset } = field;
  const [visible, setVisible] = useState(true);
  const [dataSource, setDataSource] = useState([]);
  const dialogRef = React.createRef();
  const [scrollToRow, setScrollToRow] = useState();
  const [showDialog, setShowDialog] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [isTipBar, setIsTipBar] = useState('');
  const [radioValue, setRadioValue] = useState('sku');
  const [data, setData] = useState({});
  const getData = async () => {
    setTableLoading(true);
    queryItemPws({
      itemId: records?.itemId,
      // skuIds: [records?.skuId],
    }).then((res) => {
      const { success = false, msg = '系统错误，请稍后再试', model = {} } = res?.content || {};
      setTableLoading(false);
      if (success) {
        const newModel = {
          ...model,
          itemPwsModel: [model?.itemPwsModel],
        };
        setData(newModel);
        setRadioValue(newModel?.showType);
        setDataSource(newModel?.showType === 'sku' ? newModel?.skuPwsModels : newModel?.itemPwsModel);
      } else {
        MessageError(msg || '系统错误，请稍后再试');
      }
    }).catch((error) => {
      setTableLoading(false);
      MessageError(error?.errMsg || '系统错误，请稍后再试');
    });
  };

  const onClose = () => {
    ReactDOM.unmountComponentAtNode(container);
    setVisible(false);
  };

  const onBodyScroll = (start) => {
    setScrollToRow(start);
  };
  // 更新数据源的方法
  const updateDataSource = (rowIndex, dataIndex, newValue) => {
    setDataSource((prevDataSource) => {
      const updatedDataSource = [...prevDataSource];
      updatedDataSource[rowIndex][dataIndex] = newValue;
      return updatedDataSource;
    });
  };

  const handleBatchEditClick = () => {
    setShowDialog(true);
  };

  // 更新数据源的回调函数
  const handleDataSourceUpdate = (newDataSource) => {
    // 过滤没有设置的值
    // eslint-disable-next-line @iceworks/best-practices/recommend-polyfill
    const _newDataSource = fromEntries(Object.entries(newDataSource).filter(([value]) => value !== undefined));
    const keysToUpdate = Object.keys(_newDataSource);
    setDataSource((prevState) =>
      prevState.map((item) => ({
        ...item,
        ...keysToUpdate.reduce((acc, key) => ({ ...acc, [key]: _newDataSource[key] }), {}),
      })));
  };
  const onBindClick = (text, f) => {
    return Logger.report({ c: records?.itemId, d: 'OTHER', e: `@source_3去优化提交@divert_${text}@funnel_优化任务`, f });
  };
  const onOk = () => {
    const newList = dataSource.map((ele) => ({
      attributes: ele?.attributes,
      weight: ele?.weight || ele?.currentPws?.weight || '',
      width: ele?.width || ele?.currentPws?.width || '',
      height: ele?.height || ele?.currentPws?.height || '',
      length: ele?.length || ele?.currentPws?.length || '',
      skuId: ele?.skuId,
    }));
    validate((errors) => {
      if (errors) {
        return;
      }
      setButtonLoading(true);
      submitSkuFeatures({
        offerId: records?.itemId,
        list: JSON.stringify(newList),
        showLogisticsCategory: radioValue,
      }).then((res) => {
        if (res && res?.model) {
          onBindClick('件重尺填写', '成功');
          MessageSuccess('提交成功');
          setButtonLoading(false);
          onClose();
          onActionOk();
        } else {
          MessageError(<div dangerouslySetInnerHTML={{ __html: res?.msg || '系统错误，请稍后再试' }} />);
          setButtonLoading(false);
        }
      }).catch((error) => {
        onBindClick('件重尺填写', '失败');
        MessageError(error?.errorMessage);
        setButtonLoading(false);
        onClose();
      });
    });
  };
  // Select商品官方件重尺数据sampleId查询
  const queryIsOfficialSkuFeatures = () => {
    fetchIsOfficialSkuFeatures({ itemId: records?.itemId }).then((res) => {
      const { success, msg, model } = res;
      if (success) {
        setIsTipBar(model);
      } else {
        MessageError(msg || '系统错误，请稍后再试');
      }
    }).catch((error) => {
      MessageError(error?.errMsg || '系统错误，请稍后再试');
    });
  };
  useEffect(() => {
    getData();
    queryIsOfficialSkuFeatures();
  }, []);
  const onGoUseIt = () => {
    window.open('https://work.1688.com/?spm=a2638g.u_0_1001.framenav.du_65bbd.6e061768oXXctm&_path_=gonghuotuoguan/cross_boarder_2/jianzhongchirenzheng', '_blank');
  };
  const onChange = (value) => {
    setRadioValue(value);
    reset();
    setDataSource(value === 'sku' ? data?.skuPwsModels : data?.itemPwsModel);
  };
  const column = pieceColumnSchema(radioValue, records?.type === 'item_weight' ? true : data?.isWeightOnly, field, data?.isAlert);
  const handleActionClick = ({ type, info }) => {
    const { value, index } = info;
    updateDataSource(index, type, value);
  };
  const renderColumns = (columns) => {
    return columns.map((col) => {
      const __col = {
        ...col,
        cell: (value, index, record) => {
          return col.cell(value, index, record, {
            onActionClick: handleActionClick,
          });
        },
      };
      if (col.children) {
        return (
          <Table.ColumnGroup key={__col.title} {...__col}>
            {renderColumns(col.children)}
          </Table.ColumnGroup>
        );
      }
      return <Table.Column key={__col.title} {...__col} />;
    });
  };
  // 计算警告提示消息
  const getAlertMessage = () => {
    if (radioValue === 'sku') {
      return '件重尺数据不准确，请查看建议值并修改';
    }

    if (!data?.isAlertSkuSuggestDiff) {
      return '件重尺数据不准确，请查看建议值并修改';
    }

    return '件重尺数据不准确；发现存在多个SKU数据不同，建议选择【按规格填写】，并查看系统提供的建议数据';
  };
  return (
    <Dialog
      ref={dialogRef}
      v2
      title={<div className="text-[16px]">件重尺填写</div>}
      onClose={onClose}
      visible={visible}
      footer={
        <div>
          <Button type="primary" onClick={onOk} loading={buttonLoading} >
            更新
          </Button>
          <Button onClick={onClose} className="ml-[12px]">
            取消
          </Button>
        </div>
      }
      style={{ width: '1000px', height: '640px', maxHeight: 'auto' }}
      footerAlign="center"
      className="piece-weight-dialog"
    >
      <div className="mb-[16px]">
        <div className="flex">
          <div className="w-[56px] h-[56px] ">
            <img
              src={records?.imageUrl}
              alt=""
              className="w-[56px] h-[56px]"
            />
          </div>
          <div className="flex justify-between w-[96%] items-end">
            <div className="flex justify-between ml-[16px]">
              <div className="mb-[17px]">
                <div className="text-[13px] text-[#333]">{records?.title}</div>
                <div className="flex items-center text-[13px] text-[#999] ">
                  <div className=" text-[13px]">ID：</div>
                  <div>{records?.itemId}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-[8px] flex items-center justify-between">
        <RadioGroup
          onChange={onChange}
          aria-labelledby="groupId"
          value={radioValue}
        >
          <Radio id="sku" value="sku" disabled={!data?.isSku}>
            按规格填写 {data?.isSku && <span className="text-[#FF7300]">(推荐)</span>}
          </Radio>
          <Radio id="item" value="item">
            按商品设置
          </Radio>
        </RadioGroup>
        <Button onClick={handleBatchEditClick} disabled={radioValue === 'item'}>批量填写</Button>
      </div>
      {data?.isAlert && (
        <div className="py-[9px] px-[12px] bg-[#FFF2ED] text-[14px] flex items-center rounded-[6px] mb-[20px] mt-[20px]">
          <img src="https://img.alicdn.com/imgextra/i1/O1CN01zrTaVz1T5BrNgir2y_!!6000000002330-2-tps-16-16.png" alt="" srcSet="" />
          <div className="text-[#666] ml-[8px]">{getAlertMessage()}</div>
        </div>
      )}
      {dataSource?.some((item) => item?.isOfficial === true) && <div className="text-[14px] mb-[8px] text-[#333]">表格中的灰色数值为建议填写值，该数值由仓库测量，您可以点击后进行修改。</div>}
      {isTipBar && (
        <div className="icon-info flex items-center bg-[#E6F2FF] h-[40px] rounded-[6px] px-[12px] mb-[12px]">
          <Icon type="ic_info" className="text-[#0077FF]" />
          <div className="text-[#666] ml-[8px] mr-[12px]">不会测量件重尺，推荐使用官方认证件重尺服务</div>
          <Button type="primary" text onClick={onGoUseIt}>去使用</Button>
        </div>
      )}
      <Table
        dataSource={dataSource}
        maxBodyHeight={data?.isAlert ? 233 : 300}
        scrollToRow={scrollToRow}
        onBodyScroll={onBodyScroll}
        // cellProps={setCellProps}
        loading={tableLoading}
        style={{ borderRadius: '6px', border: '1px solid #F2F2F2' }}
        className="piece-weight-table"
        fixedHeader
        // useVirtual
      >
        {renderColumns(column)}
      </Table>
      <BatchEdit
        visible={showDialog}
        setVisible={setShowDialog}
        title={
          <div className="text-[16px]">
            批量填写
            <Message
              type="notice"
              style={{
                marginTop: '16px',
                '--message-notice-color-bg-inline': '#E6F2FF',
                border: 'none',
                '--message-size-m-content-font': '13px',
                '--message-notice-color-icon-inline': '#0077FF',
                '--message-size-m-padding': '12px',
              }}
            >
              批量填写生效后会覆盖已填写的信息，请谨慎操作。
            </Message>
          </div>
        }
        onSubmitBatchEdit={handleDataSourceUpdate}
        creationFn={(fields) => (
          <Form
            field={fields}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
            {...formItemLayout}
          >
            {FieldsMap?.map(({ key, label, suffix, precision, rules }) => (
              <Form.Item label={label} key={key} validator={rules} style={{ width: '412px' }}>
                <NumberPicker precision={precision} name={key} placeholder="请输入" innerAfter={suffix} style={{ width: '100%' }} hasTrigger={false} />
              </Form.Item>
            ))}
          </Form>
        )}
      />
    </Dialog>
  );
}

PieceWeightDialog.open = (callback) => {
  ReactDOM.render(<PieceWeightDialog callback={callback} />, container);
};

export default PieceWeightDialog;
