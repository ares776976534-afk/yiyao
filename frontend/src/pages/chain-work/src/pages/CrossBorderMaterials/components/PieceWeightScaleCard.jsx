import React, { useState, useEffect } from 'react';
import { Card, Radio, Table, Message, Icon, Form, Input, NumberPicker } from '@alifd/next';
import BatchEdit from '@/components/BatchEdit';
import { formItemLayout, FieldsMap } from '@/pages/Select/enums';
import { MessageError } from '@/utlis';
import pieceColumnSchema from '@/pages/Select/components/pieceColumnSchema';
import { fetchIsOfficialSkuFeatures } from '@/pages/Select/services';
import Button from '@/components/UI/Button';
import '../index.scss';

const tabMap = {
  sku: 'edit-cross-border-materials-sku',
  item: 'edit-cross-border-materials-item',
};
const RadioGroup = Radio.Group;
function PieceWeightScaleCard({ itemId, dataObj, radioValue, onChange, dataSource, field, tableLoading, handleDataSourceUpdate, updateDataSource }) {
  const [scrollToRow, setScrollToRow] = useState();
  const [showDialog, setShowDialog] = useState(false);
  const [isTipBar, setIsTipBar] = useState('');
  // Select商品官方件重尺数据sampleId查询
  const queryIsOfficialSkuFeatures = () => {
    fetchIsOfficialSkuFeatures({ itemId }).then((res) => {
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
    queryIsOfficialSkuFeatures();
  }, []);
  const cellProps = (rowIndex, colIndex, dataIndex, record) => {
    if (colIndex === 0 && record.rowSpan) {
      return {
        rowSpan: record.rowSpan,
      };
    }
    return {};
  };
  const onBodyScroll = (start) => {
    setScrollToRow(start);
  };
  const onGoUseIt = () => {
    window.open('https://work.1688.com/?spm=a2638g.u_0_1001.framenav.du_65bbd.6e061768oXXctm&_path_=gonghuotuoguan/cross_boarder_2/jianzhongchirenzheng', '_blank');
  };
  const handleBatchEditClick = () => {
    setShowDialog(true);
  };
  const column = pieceColumnSchema(tabMap[radioValue], dataObj?.isWeightOnly, field, dataObj?.isAlert);
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

    if (!dataObj?.isAlertSkuSuggestDiff) {
      return '件重尺数据不准确，请查看建议值并修改';
    }

    return '件重尺数据不准确；发现存在多个SKU数据不同，建议选择【按规格填写】，并查看系统提供的建议数据';
  };

  return (
    <Card free className="mt-[20px] rounded-[6px]">
      <Card.Header
        title={
          <div className="flex items-center">
            <div className="text-[16px] font-semibold mr-[12px]">
              件重尺填写
            </div>
            <div className="text-[14px] text-[#666] leading-[20px]" style={{ fontWeight: 400 }}>商品件重尺为下游买家经营必备信息，将直接影响物流成本，请务必精准填写！</div>
          </div>
        }
      />
      <Card.Divider inset />
      {dataObj?.isAlert && (
        <div className="py-[9px] px-[12px] bg-[#FFF2ED] text-[14px] flex items-center rounded-[6px] mb-[20px] mt-[20px] ml-[20px] mr-[20px]">
          <img src="https://img.alicdn.com/imgextra/i1/O1CN01zrTaVz1T5BrNgir2y_!!6000000002330-2-tps-16-16.png" alt="" srcSet="" />
          <div className="text-[#666] ml-[8px]">{getAlertMessage()}</div>
        </div>
      )}
      <Card.Content>
        <div className="mb-[8px] flex items-center justify-between">
          <RadioGroup
            onChange={onChange}
            aria-labelledby="groupId"
            value={radioValue}
          >
            <Radio id="sku" value="sku" disabled={!dataObj?.isSku}>
              按规格填写 {dataObj?.isSku && <span className="text-[#FF7300]">(推荐)</span>}
            </Radio>
            <Radio id="item" value="item">
              按商品设置
            </Radio>
          </RadioGroup>
          <Button type="normal:primary-ghost" onClick={handleBatchEditClick} disabled={radioValue === 'item'} style={{ width: '90px', borderRadius: '6px' }}>批量填写</Button>
        </div>
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
          maxBodyHeight={300}
          scrollToRow={scrollToRow}
          onBodyScroll={onBodyScroll}
          cellProps={cellProps}
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
      </Card.Content>
    </Card>
  );
}

export default PieceWeightScaleCard;
