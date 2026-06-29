import { useState, useEffect } from 'react';
import { Dialog, Button, Checkbox, Message, Radio } from '@alifd/next';
import ReactDOM from 'react-dom';
import { batchSetCrossBorderService, batchSetCrossBorderInfo } from './api';
import './index.scss';

const container = document.createElement('div');

interface BatchCrossBorderInfoDialogProps {
  onConfirm?: (success: boolean, selectedServices?: string[]) => void;
  visible?: boolean;
  onClose?: () => void;
  count: number;
  offerIds?: string[];
  centered?: boolean;
  pointText?: string;
  isCrm?: boolean;
  crossBorderOnlyOfferCount?: number;
}

// 跨境增值服务选项
const SERVICE_OPTIONS = [
  { label: '可提供外语说明书', value: 'foreignLanguageManual' },
  { label: '可提供外语包装', value: 'foreignLanguagePackaging' },
  { label: '支持跨境贴标', value: 'crossBorderLabeling' },
  { label: '支持贴箱唛', value: 'cartonMarking' },
];

function BatchCrossBorderInfoDialog(props: BatchCrossBorderInfoDialogProps) {
  const {
    onConfirm,
    visible: propVisible,
    onClose: propOnClose,
    count,
    offerIds = [],
    centered = false,
    pointText,
    isCrm,
    crossBorderOnlyOfferCount = 0,
  } = props;
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedDeliveryTime, setSelectedDeliveryTime] = useState<string>(
    crossBorderOnlyOfferCount === 0 ? '' : 'crossBorderOnly',
  );
  useEffect(() => {
    if (crossBorderOnlyOfferCount > 0) {
      setSelectedDeliveryTime('crossBorderOnly');
    }
  }, [crossBorderOnlyOfferCount]);

  // 如果传入了 visible prop，使用它；否则使用内部状态（.open() 模式）
  const isOpenMode = propVisible === undefined;
  const [internalVisible, setInternalVisible] = useState(true);
  const visible = propVisible !== undefined ? propVisible : internalVisible;
  const [loading, setLoading] = useState(false);
  const handleClose = () => {
    setSelectedServices([]); // 重置已选中的跨境增值服务
    if (isOpenMode) {
      ReactDOM.unmountComponentAtNode(container);
      setInternalVisible(false);
    }
    propOnClose?.();
  };

  const handleConfirm = () => {
    if (isCrm) return;
    // 将选中的服务项转换为 API 请求格式
    const serviceParams: Record<string, boolean | string> = {};
    selectedServices.forEach((service) => {
      serviceParams[service] = true;
    });
    setLoading(true);
    if (pointText) {
      batchSetCrossBorderService({
        ...serviceParams,
        allShop: !(offerIds?.length > 0),
        offerIds,
      })
        .then((res) => {
          handleClose();
          if (res.success) {
            Message.show({
              type: 'success',
              content: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img
                    src="https://img.alicdn.com/imgextra/i4/O1CN0111scWo1WPkZyF5xcq_!!6000000002781-2-tps-48-48.png"
                    alt=""
                    style={{ width: 16, height: 16, marginRight: 8 }}
                  />
                  设置成功
                </div>
              ),
              align: 'cc cc',
              className: 'custom-success-message',
              style: {
                padding: '9px 12px',
                borderRadius: '6px',
              },
            });
            onConfirm?.(true, selectedServices);
          } else {
            Message.error(res.errMsg || '系统异常');
            onConfirm?.(false, selectedServices);
          }
          setLoading(false);
        })
        .catch((err) => {
          handleClose();
          Message.error(err.errMsg || '系统异常');
          onConfirm?.(false, selectedServices);
          setLoading(false);
        });
    } else {
      if (crossBorderOnlyOfferCount > 0) {
        serviceParams.saleChannel = selectedDeliveryTime;
      }
      batchSetCrossBorderInfo({
        ...serviceParams,
      })
        .then((res) => {
          handleClose();
          if (res.success) {
            Message.show({
              type: 'success',
              content: (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img
                    src="https://img.alicdn.com/imgextra/i4/O1CN0111scWo1WPkZyF5xcq_!!6000000002781-2-tps-48-48.png"
                    alt=""
                    style={{ width: 16, height: 16, marginRight: 8 }}
                  />
                  设置成功
                </div>
              ),
              align: 'cc cc',
              className: 'custom-success-message',
              style: {
                padding: '9px 12px',
                borderRadius: '6px',
              },
            });
            onConfirm?.(true, selectedServices);
          } else {
            Message.error(res.errMsg || '系统异常');
            onConfirm?.(false, selectedServices);
          }
          setLoading(false);
        })
        .catch((err) => {
          handleClose();
          Message.error(err.errMsg || '系统异常');
          onConfirm?.(false, selectedServices);
          setLoading(false);
        });
    }
  };

  const handleServiceChange = (value: string, checked: boolean) => {
    if (checked) {
      setSelectedServices([...selectedServices, value]);
    } else {
      setSelectedServices(selectedServices.filter((item) => item !== value));
    }
  };

  return (
    <Dialog
      v2
      // eslint-disable-next-line no-nested-ternary
      title={<div className="text-[16px]">{(pointText || crossBorderOnlyOfferCount === 0) ? '批量设置跨境信息' : count === 0 ? '批量设置“跨境专供”' : '批量设置“跨境专供”/跨境信息'}</div>}
      onClose={handleClose}
      visible={visible}
      centered
      footerAlign="center"
      style={{ width: '656px', maxWidth: '1024px' }}
      footer={
        <div>
          <Button
            type="primary"
            onClick={handleConfirm}
            style={{ marginRight: '8px', borderRadius: '6px' }}
            loading={loading}
          >
            确定
          </Button>
          <Button onClick={handleClose} style={{ borderRadius: '6px' }}>
            取消
          </Button>
        </div>
      }
    >
      <div>
        {!pointText && crossBorderOnlyOfferCount > 0 && (
          <div
            style={{
              fontSize: '14px',
              color: '#333333',
              fontWeight: 'normal',
              lineHeight: '22px',
              marginBottom: '8px',
            }}
          >
            {count > 0 && <div className="text-[14px] text-[#333333] font-medium mb-[12px] ml-[6px]">1. 批量设置“跨境专供”</div>}
            已上传跨境资质商品数量：
            <span style={{ color: '#FB3B20', fontWeight: 600 }}>{crossBorderOnlyOfferCount}</span>个，建议设置为
            “跨境专供”商品
          </div>
        )}
        {!pointText && crossBorderOnlyOfferCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ fontSize: '14px', color: '#333333', fontWeight: 'normal', lineHeight: '22px' }}>销售渠道</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Radio.Group
                name="radiogroup"
                value={selectedDeliveryTime}
                onChange={(value: string) => setSelectedDeliveryTime(value)}
              >
                <Radio value="crossBorderOnly">跨境专供</Radio>
                <Radio value="domesticCrossBorder">国内/跨境</Radio>
              </Radio.Group>
            </div>
          </div>
        )}
        {!pointText && count > 0 && (
          <div className="text-[14px] text-[#333333] font-normal leading-[22px] mb-[8px]">
            {crossBorderOnlyOfferCount > 0 && (
              <div className="text-[14px] text-[#333333] font-medium mb-[12px] ml-[4px]">2. 批量设置跨境信息</div>
            )}
            当前未设置跨境信息商品数量：
            <span className="text-[#FB3B20] font-semibold mr-[4px]">{count}</span>个，提交后将对这些商品生效
          </div>
        )}
        {pointText && (
          <div className="pointWrapper">
            <div className="flex items-center rounded-[6px_] bg-[#EBF6FF] p-[9px_12px] mb-[16px]">
              <img
                className="w-[]16px h-[16px] mr-[8px]"
                src="https://img.alicdn.com/imgextra/i4/O1CN01fImXoy1lrQkjh3FpC_!!6000000004872-2-tps-48-48.png"
                alt=""
              />
              <div className="text-[14px] text-[#666]">{pointText}</div>
            </div>
            <div className="text-[14px] text-[#333] mb-[16px]">已选商品：{count}个</div>
          </div>
        )}
        {/* 跨境增值服务 */}
        {(pointText || count > 0) && (
          <div className="flex items-center gap-3">
            <div className="text-[14px] text-[#333333] font-normal leading-[20px]">跨境增值服务</div>
            <div className="flex gap-[20px]">
              {SERVICE_OPTIONS.map((option) => (
                <div key={option.value} className="">
                  <Checkbox
                    checked={selectedServices.includes(option.value)}
                    onChange={(checked) => handleServiceChange(option.value, checked)}
                  >
                    <span className="text-[14px] text-[#333333] leading-[20px] ml-[8px]">{option.label}</span>
                  </Checkbox>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}

BatchCrossBorderInfoDialog.open = (props: BatchCrossBorderInfoDialogProps) => {
  ReactDOM.render(<BatchCrossBorderInfoDialog {...props} />, container);
};

export default BatchCrossBorderInfoDialog;
