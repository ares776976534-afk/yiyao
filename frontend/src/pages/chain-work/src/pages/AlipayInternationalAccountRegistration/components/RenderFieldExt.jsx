import React, { useState } from 'react';
import RenderField from '@alife/1688-chain-renderfield';
import { Upload, Image } from 'antd';
import AddressPicker from '@ali/ctf-lib-antd-address-picker';
import { NumberPicker } from '@alifd/next';
import { SCHEMA_UPLOAD, SCHEMA_ADDRESS, SCHEMA_NUMBER_PICKER } from '../contanst';
import { SCHEMA_RADIO_GROUP, SCHEMA_CHECKBOX } from '@/components/CommonTable/contanst';

export const UploadForm = ({
  value,
  ...otherProps
}) => {
  return (<Upload
    fileList={value}
    {...otherProps}
  />);
};
const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
const labelAlignMap = {
  left: 'flex flex-row',
  top: 'flex flex-col',
};
const labelTextAlignMap = {
  left: 'justify-end mt-[7px]',
  top: 'mb-[8px]',
};
function RenderFieldExt(props) {
  const { field, fieldKey, name, type, opt, values, fetchData, title_style = 'w-[182px]', content_style, labelAlign = 'left' } = props;
  const { init, getError } = field;
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file?.originFileObj);
    }

    setPreviewImage(file.url || (file.preview));
    setPreviewOpen(true);
  };
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
      case SCHEMA_ADDRESS:
        return (
          <AddressPicker
            {...init(fieldKey, { rules: opt?.rules, initValue: opt?.initValue })}
            {...opt}
            disabled={opt?.disabled}
            className={opt?.disabled ? 'addressPicker' : ''}
          />
        );
      case SCHEMA_NUMBER_PICKER:
        return (
          <NumberPicker
            {...field.init(fieldKey, {
              initValue: opt?.initValue,
              rules: opt?.rules,
            })}
            {...opt}
            disabled={opt?.disabled}
          />
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
  // eslint-disable-next-line no-nested-ternary
  const mtClass = name ? 'mt-[20px]' : type !== SCHEMA_UPLOAD ? 'mt-[12px] ml-[194px]' : 'mt-[20px]';
  return (
    <div className={`${labelAlignMap[labelAlign]} ${content_style || mtClass}`} >
      {name && type !== SCHEMA_CHECKBOX && (
        <div>
          <span className={`flex flex-row items-center mr-[12px] ${title_style} ${labelTextAlignMap[labelAlign]} leading-[17px]`}>
            {opt?.rule && <span className="text-[#FB3B20] mr-[4px]">* </span>}
            <span className="text-[14px] text-[#333]">{name}</span>
          </span>
        </div>
      )}
      <div>
        {opt?.title && <div className="text-[12px] text-[#999] mb-[8px] text-center">{opt?.title}</div>}
        <div className={`${type === SCHEMA_RADIO_GROUP ? 'mt-[7px]' : ''}`}>{renderField(type)}</div>
        {opt?.desc && <div className="text-[12px] text-[#999] flex mt-[8px]">{opt?.desc}</div>}
        {opt?.flattenErrors && (
          <div className="text-[#FF8B00] mt-[4px]">
            {opt?.flattenErrors}
          </div>
        )}
        {getError(fieldKey) && (
          <div className="text-[#FF4000] mt-[4px]">
            {getError(fieldKey)}
          </div>
        )}
        {opt?.balloon}
      </div>
    </div>
  );
}

export default RenderFieldExt;
