import React from 'react';
import RenderFieldEx from '../RenderFieldExt';
import { MODE_EDIT, MODE_PREVIEW } from '../..';
import { Balloon } from '@alifd/next';

// TODO 缺少预览态

const RequireIcon = () => <img className="w-[8px] h-[7px]" src="https://img.alicdn.com/imgextra/i2/O1CN013nHVSw1asNhI4Qkrd_!!6000000003385-2-tps-17-16.png" />;
const Tips = ({ tips = '' }) => (
  <Balloon align="tl" closable={false} v2 trigger={<img className="w-[15px] h-[15px] ml-[4px]" src="https://img.alicdn.com/imgextra/i3/O1CN014HAmSX1cRTf9xlCM3_!!6000000003597-2-tps-30-30.png" />} triggerType="hover">
    {tips}
  </Balloon>
);

const alignCenter = 'items-center';
// const alignStart = 'items-start';

export default ({ title, fieldKey, type, field, opt, fieldInitOptions, display = 'inline', tips, customComponent, name = '', align = 'center', mode, labelClassName = '', contentClassName, ...otherProps }) => {
  const required = fieldInitOptions?.rules?.some((item) => item.required);
  const error = field.getError(fieldKey);
  const isCustom = type === 'custom';
  const alignStyle = (mode === MODE_PREVIEW && align === 'center') ? alignCenter : '';
  return (
    <div className={`flex flex-row ${alignStyle} ${labelClassName}`}>
      {title && (
        <div>
          <span className="flex flex-row items-center justify-end w-[160px] h-[32px] label">
            {required && <span className="mr-[4px]"><RequireIcon /></span>}
            <span className="text-[14px] text-[#666]">{title}</span>
            {tips && <Tips tips={tips} />}
          </span>
        </div>
      )}
      <div className={`flex flex-col items-start ml-[12px] justify-center ${contentClassName}`}>
        <div className="flex flex-col items-start" style={{ width: '100%' }}>
          {
            isCustom ? customComponent({ field, fieldKey, fieldInitOptions, display, opt, ...otherProps }) : (
              <RenderFieldEx
                fieldInit={field?.init}
                fieldKey={fieldKey}
                type={type}
                fieldInitOptions={fieldInitOptions}
                display={display}
                opt={{
                  ...opt,
                  state: error && 'error',
                  isPreview: mode === MODE_PREVIEW,
                }}
                name={name || title}
                // mode={mode}
                {...otherProps}
              />
            )
          }
        </div>
        {error && mode === MODE_EDIT && <span className="text-[12px] h-[14px] text-[#FB3B20] mt-[8px]">{title}是必填字段</span>}
      </div>
    </div>
  );
};
