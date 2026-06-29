import React, { useState, useEffect, useRef } from 'react';
import { Upload, Image } from 'antd';
import RenderField from '@alife/1688-chain-renderfield';
import { SCHEMA_UPLOAD } from '@/pages/AlipayInternationalAccountRegistration/contanst';
import { SCHEMA_RADIO_GROUP, SCHEMA_CHECKBOX_GROUP } from '@/components/CommonTable/contanst';
import { Checkbox, Icon } from '@alifd/next';
import { select } from '@alife/image-bank';
import '../index.scss';

const SCHEMA_UPLOAD_IMAGE = 'uploadImage';

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
export const UploadForm = ({
  value,
  ...otherProps
}) => {
  return (<Upload
    fileList={value}
    {...otherProps}
  />);
};
function RenderFieldExt(props) {
  const { field, fieldKey, name, type, opt, values, fetchData, onCrossBorderModelChange } = props;
  const isArray = Object.prototype.toString.call(field.getValue(fieldKey)) === '[object Array]';
  const { init, getError } = field;
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsToggle, setNeedsToggle] = useState(false);
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const extraButtonsRef = useRef(null);
  const measureRef = useRef(null);
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    setPreviewImage(file.url || (file.preview));
    setPreviewOpen(true);
  };
  const handleFileChange = () => {
    select([], {
      limitLength: opt?.maxCount || 3,
      hasWinport: false,
      hasWatermark: false,
      sourceName: 'offer_product',
      imageSize: '0',
    }, (isDone, value) => {
      field.setValue(fieldKey, value?.map((ele) => ele?.src));
    });
  };

  // 为 SCHEMA_CHECKBOX_GROUP 初始化字段值
  useEffect(() => {
    if (type === SCHEMA_CHECKBOX_GROUP) {
      const currentValue = field.getValue(fieldKey);
      if (currentValue === undefined || currentValue === null) {
        field.setValue(fieldKey, opt?.initValue || []);
      }
    }
  }, [type, fieldKey]);

  const renderField = (status) => {
    switch (status) {
      case SCHEMA_UPLOAD:
        return (
          <div>
            <UploadForm
              {...init(fieldKey, { rules: opt?.rules, initValue: opt?.initValue })}
              {...opt}
              value={opt?.fileList}
              onPreview={handlePreview}
              disabled={opt?.disabled}
            />
            {previewImage && (
              <Image
                wrapperStyle={{ display: 'none' }}
                preview={{
                  visible: previewOpen,
                  onVisibleChange: (visible) => setPreviewOpen(visible),
                  afterOpenChange: (visible) => !visible && setPreviewImage(''),
                }}
                src={previewImage}
              />
            )}
          </div>
        );
      case SCHEMA_CHECKBOX_GROUP: {
        // 注册字段和验证规则
        init(fieldKey, { rules: opt?.rules, initValue: opt?.initValue || [] });
        return (
          <Checkbox.Group
            value={field.getValue(fieldKey) || []}
            onChange={(value) => {
              field.setValue(fieldKey, value);
              if (opt?.rules) {
                setTimeout(() => {
                  field.validate(fieldKey);
                }, 0);
              }
              // 如果是跨境增值服务字段，触发父组件刷新
              if (onCrossBorderModelChange) {
                onCrossBorderModelChange(value);
              }
            }}
          >
            {values?.map((item) => (
              <Checkbox key={item.value} value={item.value}>{item.label}</Checkbox>
            ))}
          </Checkbox.Group>
        );
      }
      case SCHEMA_UPLOAD_IMAGE:
        return (
          <div>
            <div className="flex">
              {field.getValue(fieldKey) && field.getValue(fieldKey)?.length > 0 && (
                <div className="flex flex-row">
                  {field.getValue(fieldKey).map((ele, index) => (
                    <div key={index} className="upload-container mr-[8px]" onClick={handleFileChange} >
                      <img className="w-[80px] h-[80px]" src={ele} alt="img" />
                    </div>
                  ))}
                </div>
              )}
              {(!field.getValue(fieldKey) || field.getValue(fieldKey)?.length < (opt?.maxCount || 3)) && (
                <div className="upload-container" onClick={handleFileChange} >
                  <div>
                    <div><Icon type="add" /></div>
                    <div className="text-[#999]">上传</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return (
          <RenderField
            fieldKey={fieldKey}
            type={type}
            opt={{
              ...opt,
              disabled: opt?.disabled,
            }}
            values={values}
            name={name}
            fetchData={fetchData}
            fieldInit={() => {
              return init(fieldKey,
                { rules: opt?.rules, initValue: opt?.initValue });
            }}
            field={field}
          />
        );
    }
  };
  // 检测内容是否超出容器宽度
  useEffect(() => {
    const checkOverflow = () => {
      if (!containerRef.current || !measureRef.current) return;

      // 获取容器总宽度
      const containerTotalWidth = containerRef.current.clientWidth;

      // 获取额外按钮占用的宽度
      const extraButtonsWidth = extraButtonsRef.current ? extraButtonsRef.current.offsetWidth : 0;

      // 计算内容可用的最大宽度（容器宽度 - 额外按钮宽度 - 一些padding）
      const availableWidth = containerTotalWidth - extraButtonsWidth - 16; // 16px作为缓冲空间

      // 使用隐藏的测量元素获取内容实际宽度
      const contentWidth = measureRef.current.scrollWidth;


      setNeedsToggle(contentWidth > availableWidth && field.getValue(fieldKey)?.length > 1);
    };

    // 延迟检测，确保DOM渲染完成
    const timer = setTimeout(checkOverflow, 200);

    // 监听窗口大小变化
    const handleResize = () => {
      clearTimeout(timer);
      setTimeout(checkOverflow, 200);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [field.getValue(fieldKey)]);


  return (
    <div className="mb-[20px] flex flex-row">
      {name && (
        // eslint-disable-next-line no-nested-ternary
        <div className={`w-[160px] pr-[7px] text-right text-[14px] ${type !== SCHEMA_UPLOAD ? (type === SCHEMA_RADIO_GROUP || type === SCHEMA_CHECKBOX_GROUP) ? '' : 'mt-[5px]' : ''}`}>
          {opt?.rules && <span className="text-[#FF4000] mr-[4px]">* </span>}
          <span className="text-[#333] text-[14px]">{name}</span>
        </div>
      )}
      <div className="flex-1">
        <div>
          <div className="flex flex-row items-center" ref={containerRef}>
            <div
              ref={contentRef}
              style={{
                maxWidth: '100%',
                minWidth: 0, // 确保可以缩小
                ...(!isExpanded && needsToggle && {
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: '1.5',
                  maxHeight: '80px', // 确保只显示一行
                }),
              }}
            >
              {renderField(type)}
            </div>
            <div ref={extraButtonsRef} className="flex items-center">
              {opt?.extraButtons}
            </div>
          </div>
          {opt?.desc && <div className="text-[12px] text-[#999] flex mt-[8px]">{opt?.desc}</div>}
          {getError(fieldKey) && (
            <div className="text-[#FF4000] mt-[4px]">
              {getError(fieldKey)}
            </div>
          )}
        </div>
        {needsToggle && (
          <div className="text-[14px] text-[#333] cursor-pointer mt-[12px] flex items-center justify-center" onClick={() => setIsExpanded(!isExpanded)}>
            <span className="mr-[8px]">{isExpanded ? '收起' : '展开'}</span>
            <img
              className="w-[16px] h-[16px]"
              src={isExpanded ? 'https://img.alicdn.com/imgextra/i2/O1CN017IGLVG1ljdywDchmq_!!6000000004855-2-tps-32-32.png' : 'https://img.alicdn.com/imgextra/i1/O1CN01E3gTGb21cnv1RLbP2_!!6000000007006-2-tps-32-32.png'}
              alt=""
            />
          </div>
        )}
      </div>

      {/* 隐藏的测量元素，用于获取内容的真实宽度 */}
      <div
        ref={measureRef}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          top: '-9999px',
          left: '-9999px',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}
      >
        {renderField(type)}
      </div>
    </div>
  );
}

export default RenderFieldExt;
