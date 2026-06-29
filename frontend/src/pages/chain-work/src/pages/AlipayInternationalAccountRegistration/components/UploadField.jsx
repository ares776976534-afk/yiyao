import React, { useState } from 'react';
import { Upload, Image } from 'antd';
import { Icon } from '@alifd/next';

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

function UploadField({
  field,
  fieldKey,
  name,
  opt,
  fileLists,
  onFileListChange,
  query,
  panes,
  isPassport,
}) {
  const { init, getError } = field;
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [list, setList] = useState([]);
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file?.originFileObj);
    }

    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };
  const handleChange = ({ file, fileList }) => {
    setList(fileList);
    onFileListChange(fileList);
    const { status } = file;
    if (status === 'done') {
      if (isPassport) {
        if (status === 'done' && opt?.title === '人像页') {
          field.setValues({
            [`${panes}_faceImageKey`]: file.response.result,
            [`${panes}_faceImageUrl`]: file.response.result,
          });
          if (field?.getValue(`${panes}_backImageUrl`)) {
            query && query(file);
          }
          if (fileList.filter((item) => item.response && !item.response.success)?.length) {
            field.setErrors({
              [`${panes}_faceImageUrl`]: file?.response?.retMsg,
            });
            return false;
          } else {
            field.setErrors({
              [`${panes}_faceImageUrl`]: null,
            });
          }
        } else if (status === 'done' && opt?.title === '国徽页') {
          field.setValues({
            [`${panes}_backImageKey`]: file.response.result,
            [`${panes}_backImageUrl`]: file.response.result,
          });
          if (field?.getValue(`${panes}_faceImageUrl`)) {
            query && query(file);
          }
          if (fileList.filter((item) => item.response && !item.response.success)?.length) {
            field.setErrors({
              [`${panes}_backImageUrl`]: file?.response?.retMsg,
            });
            return false;
          } else {
            field.setErrors({
              [`${panes}_backImageUrl`]: null,
            });
          }
        }
      } else {
        query && query(file, isPassport);
      }
    }
    field.setErrors({
      [fieldKey]: null,
      [`${panes}_birthDate`]: null,
      [`${panes}_address`]: null,
      [`${panes}_addressDetail`]: null,
      [`${panes}_idNumber`]: null,
    });
  };
  return (
    <>
      <div className="flex flex-row">
        {name && (
        <div>
          <span className="flex flex-row items-center justify-end w-[182px] h-[32px] mr-[12px]">
            <span className="text-[14px] text-[#333]">{name}</span>
          </span>
        </div>
        )}
        <div>
          {opt?.title && <div className="text-[12px] text-[#999] mb-[8px] text-center">{opt?.title}</div>}
          <UploadForm
            {...init(fieldKey, { rules: opt?.rules, initValue: opt?.initValue })}
            {...opt}
            value={fileLists || list}
            onChange={handleChange}
            onPreview={handlePreview}
            disabled={opt?.disabled}
          >
            {fileLists?.length >= 1 ? null : (
              <div className="relative upload-content">
                {isPassport && <img className="w-[160px] h-[100px]" src={opt?.imgUrl} alt="" />}
                {query ? (
                  <div className="upload-round w-[36px] h-[36px] rounded-[30px] bg-black bg-opacity-10 absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]" >
                    <Icon type="add" size="xl" className="text-[#fff] absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]" />
                  </div>
                ) : (
                  <div className="products-business-upload-text">
                    <Icon type="add" />
                    <div>上传</div>
                  </div>
                )}
              </div>
            )}
          </UploadForm>
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
          {getError(fieldKey) && (
          <div className="text-[#FF4000] mt-[4px]">
            {getError(fieldKey)}
          </div>
          )}
          {opt?.balloon && (
          <div className="text-[12px] text-[#999] flex mt-[4px]">
            股权架构图请参考说明：股权架构图示例
            {opt?.balloon}
          </div>
          )}
        </div>
      </div>
    </>
  );
}

export default UploadField;
