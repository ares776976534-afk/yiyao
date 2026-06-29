import React, { useState, useEffect } from 'react';
import { Form, Upload, Button, message, Image, Checkbox } from 'antd';
import { UploadOutlined, PlusOutlined, CloseOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { submitSettledInfo } from '../service';
import './uploadimg.scss';
import Info from './Info';
import { agreement } from '../type';

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const UploadImg = ({ pageData, callback }) => {
  const {
    // offerImportExportProof,
    siteOfferImage,
    warehousingProof,
    reviewStatus,
  } = pageData;
  const [warehouseDocsFileList, setWarehouseDocsFileList] = useState([]);
  const [productDocsFileList, setProductDocsFileList] = useState([]);
  const [sitePhotosFileList, setSitePhotosFileList] = useState([]); // 改为单个数组

  // 预览状态
  const [warehouseDocsPreviewOpen, setWarehouseDocsPreviewOpen] = useState(false);
  const [warehouseDocsPreviewImage, setWarehouseDocsPreviewImage] = useState('');
  const [productDocsPreviewOpen, setProductDocsPreviewOpen] = useState(false);
  // const [productDocsPreviewImage, setProductDocsPreviewImage] = useState('');
  const [sitePhotosPreviewOpen, setSitePhotosPreviewOpen] = useState(false);
  const [sitePhotosPreviewImage, setSitePhotosPreviewImage] = useState('');
  const [checked, setChecked] = useState(false);

  const [form] = Form.useForm();

  useEffect(() => {
    // if (offerImportExportProof && offerImportExportProof.length > 0) {
    //   setProductDocsFileList(convertToFileList(offerImportExportProof));
    //   form.setFieldValue('offerImportExportProof', offerImportExportProof);
    // }
    if (siteOfferImage && siteOfferImage.length > 0) {
      setSitePhotosFileList(convertToFileList(siteOfferImage));
      form.setFieldValue('siteOfferImage', siteOfferImage);
    }
    if (warehousingProof && warehousingProof.length > 0) {
      setWarehouseDocsFileList(convertToFileList(warehousingProof));
      form.setFieldValue('warehousingProof', warehousingProof);
    }
    form.setFieldsValue({
      userName: pageData.userName,
      phoneAreaCode: pageData.phoneAreaCode,
      phoneNumber: pageData.phoneNumber,
      mainRegion: pageData.mainRegion,
    });
    setChecked(pageData.isSignAgreement);
  }, [pageData]);

  const convertToFileList = (dataList) => {
    return dataList.map((item) => ({
      uid: item.uploadFileKey,
      name: item.uploadFileName,
      url: item.uploadFileUrl,
      status: 'done',
    }));
  };

  // 上传前的验证
  const beforeUpload = (file) => {
    const isValidType = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'application/pdf';
    if (!isValidType) {
      message.error('只能上传 JPG/PNG/PDF 格式的文件!');
      return false;
    }

    const isLt20M = file.size / 1024 / 1024 < 20;
    if (!isLt20M) {
      message.error('文件大小不能超过 20MB!');
      return false;
    }

    return true;
  };

  // 图片上传前的验证
  const beforeImageUpload = (file) => {
    const isImage = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isImage) {
      message.error('只能上传 JPG/PNG 格式的图片!');
      return false;
    }

    const isLt20M = file.size / 1024 / 1024 < 20;
    if (!isLt20M) {
      message.error('图片大小不能超过 20MB!');
      return false;
    }

    return true;
  };

  // 表单提交
  const onFinish = (values) => {
    console.info('表单数据:', values);
    console.info('文件列表:', {
      warehousingProof: warehouseDocsFileList,
      siteOfferImage: sitePhotosFileList,
      // offerImportExportProof: productDocsFileList,
    });
  };

  const onFinishFailed = (errorInfo) => {
    console.info('表单提交失败:', errorInfo);
    console.info('文件列表:', {
      warehousingProof: warehouseDocsFileList,
      siteOfferImage: sitePhotosFileList,
      // offerImportExportProof: productDocsFileList,
    });
  };

  // 删除文件处理函数
  const handleRemoveWarehouseFile = (file) => {
    const newFileList = warehouseDocsFileList.filter(item => item.uid !== file.uid);
    setWarehouseDocsFileList(newFileList);
    form.setFieldValue('warehousingProof', newFileList?.map((ele) => ({
      uploadFileKey: ele?.response?.result || ele?.uid,
      uploadFileName: ele?.name,
    })));
  };

  const handleRemoveProductFile = (file) => {
    const newFileList = productDocsFileList.filter(item => item.uid !== file.uid);
    setProductDocsFileList(newFileList);
    // form.setFieldValue('offerImportExportProof', newFileList?.map((ele) => ({
    //   uploadFileKey: ele?.response?.result || ele?.uid,
    //   uploadFileName: ele?.name,
    // })));
  };

  const handleRemoveSiteFile = (file) => {
    const newFileList = sitePhotosFileList.filter(item => item.uid !== file.uid);
    setSitePhotosFileList(newFileList);
    form.setFieldValue('siteOfferImage', newFileList?.map((ele) => ({
      uploadFileKey: ele?.response?.result || ele?.uid,
      uploadFileName: ele?.name,
    })));
  };

  // 自定义文件列表渲染 - 仓储相关证明
  const customWarehouseItemRender = (originNode, file, currFileList, actions) => {
    if (file.status === 'error') {
      return <ErrorUploadItem file={file} onRemove={() => handleRemoveWarehouseFile(file)} />;
    }
    if (file.status === 'done' || file.url) {
      return (
        <ImagePreview
          file={file}
          onPreview={handleWarehouseDocsPreview}
          onRemove={() => handleRemoveWarehouseFile(file)}
        />
      );
    }
    return originNode;
  };

  // 自定义文件列表渲染 - 商品相关证明
  // const customProductItemRender = (originNode, file, currFileList, actions) => {
  //   if (file.status === 'error') {
  //     return <ErrorUploadItem file={file} onRemove={() => handleRemoveProductFile(file)} />;
  //   }
  //   if (file.status === 'done' || file.url) {
  //     return (
  //       <ImagePreview
  //         file={file}
  //         onPreview={handleProductDocsPreview}
  //         onRemove={() => handleRemoveProductFile(file)}
  //       />
  //     );
  //   }
  //   return originNode;
  // };

  // 自定义文件列表渲染 - 场地实物照片
  const customSiteItemRender = (originNode, file, currFileList, actions) => {
    if (file.status === 'error') {
      return <ErrorUploadItem file={file} onRemove={() => handleRemoveSiteFile(file)} />;
    }
    if (file.status === 'done' || file.url) {
      return (
        <ImagePreview
          file={file}
          onPreview={handleSitePhotosPreview}
          onRemove={() => handleRemoveSiteFile(file)}
        />
      );
    }
    return originNode;
  };

  // 仓储相关证明处理
  const handleWarehouseDocsPreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setWarehouseDocsPreviewImage(file.url || file.preview);
    setWarehouseDocsPreviewOpen(true);
  };

  const handleWarehouseDocsChange = ({ file, fileList }) => {
    console.info(fileList);
    setWarehouseDocsFileList(fileList);

    // 检查上传失败的文件
    if (fileList.filter((item) => item.response && !item.response.success)?.length) {
      message.error(file?.response?.retMsg || '上传失败');
      return false;
    }

    // 更新表单值
    form.setFieldValue('warehousingProof', fileList?.map((ele) => ({
      uploadFileKey: ele?.response?.result || ele?.uid,
      uploadFileName: ele?.name,
    })));
  };

  // 商品相关证明处理
  // const handleProductDocsPreview = async (file) => {
  //   if (!file.url && !file.preview) {
  //     file.preview = await getBase64(file.originFileObj);
  //   }
  //   setProductDocsPreviewImage(file.url || file.preview);
  //   setProductDocsPreviewOpen(true);
  // };

  // const handleProductDocsChange = ({ file, fileList }) => {
  //   setProductDocsFileList(fileList);

  //   // 检查上传失败的文件
  //   if (fileList.filter((item) => item.response && !item.response.success)?.length) {
  //     message.error(file?.response?.retMsg || '上传失败');
  //     return false;
  //   }

  //   // 更新表单值
  //   form.setFieldValue('offerImportExportProof', fileList?.map((ele) => ({
  //     uploadFileKey: ele?.response?.result || ele?.uid,
  //     uploadFileName: ele?.name,
  //   })));
  // };

  // 场地实物照片处理 - 修改为3-5张
  const handleSitePhotosPreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setSitePhotosPreviewImage(file.url || file.preview);
    setSitePhotosPreviewOpen(true);
  };

  const handleSitePhotosChange = ({ file, fileList }) => {
    // 检查数量限制
    if (fileList.length > 5) {
      message.error('最多只能上传5张照片');
      return;
    }

    setSitePhotosFileList(fileList);

    // 检查上传失败的文件
    if (fileList.filter((item) => item.response && !item.response.success)?.length) {
      message.error(file?.response?.retMsg || '上传失败');
      return false;
    }

    // 更新表单值
    form.setFieldValue('siteOfferImage', fileList?.map((ele) => ({
      uploadFileKey: ele?.response?.result || ele?.uid,
      uploadFileName: ele?.name,
    })));
  };

  // 错误上传项组件（上传失败）
  const ErrorUploadItem = ({ file, onRemove }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div
        className="relative w-[100px] h-[100px] rounded-[6px] border border-solid border-[#ff4d4f] bg-white flex flex-col items-center justify-center cursor-pointer relative upload-error-item"
        // onClick={(e) => {
        //   e.stopPropagation();
        //   onRemove && onRemove(file);
        // }}
        title={`上传失败：${file.name}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col items-center">
          <CloseOutlined className="text-[#FB3B20] text-[24px] mb-[8px]" />
          <div className="text-[14px] text-[#FB3B20] text-center">上传错误</div>
        </div>
        {isHovered && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-[6px] flex items-center justify-center image-preview-overlay">
            <img
              src="https://img.alicdn.com/imgextra/i1/O1CN01iNxV6i1z5FgLl1QD6_!!6000000006662-2-tps-80-80.png"
              style={{ width: '20px', height: '20px' }}
              onClick={(e) => {
                e.stopPropagation();
                onRemove && onRemove(file);
              }}
            />
          </div>
        )}
      </div>
    );
  };

  // 图片预览组件（上传成功）
  const ImagePreview = ({ file, onPreview, onRemove }) => {
    const [isHovered, setIsHovered] = useState(false);

    // 判断是否为PDF文件
    const isPDF = file.name?.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';

    return (
      <div
        className="relative w-[100px] h-[100px] rounded-[6px] cursor-pointer border border-[#d9d9d9]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isPDF ? (
          // PDF文件显示PDF图标
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#fafafa] rounded-[6px]">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 2H6C4.9 2 4 2.9 4 4V28C4 29.1 4.9 30 6 30H26C27.1 30 28 29.1 28 28V10L20 2Z" fill="#F40F02" />
              <path d="M20 2V10H28" fill="#ffffff" />
              <text x="16" y="22" textAnchor="middle" fill="white" fontSize="8" fontFamily="Arial">PDF</text>
            </svg>
            <div className="text-[10px] text-[#666] mt-1 text-center truncate w-full px-1">
              {file.name}
            </div>
          </div>
        ) : (
          // 图片文件正常显示
          <img
            src={file.url || file.thumbUrl || file.preview}
            alt={file.name}
            className="w-full h-full object-cover rounded-[6px]"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yMCAyMEg0NFY0NEgyMFYyMFoiIHN0cm9rZT0iI0Q5RDlEOSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggZD0iTTI4IDMwTDMyIDM0TDQwIDI2IiBzdHJva2U9IiNEOUQ5RDkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=';
            }}
          />
        )}

        {/* Hover时显示的操作按钮 */}
        {isHovered && !['PASS', 'UNDER_REVIEW'].includes(reviewStatus) && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-[6px] flex items-center justify-center image-preview-overlay">
            {isPDF ? (
              // PDF文件显示预览和删除按钮
              <div className="flex items-center justify-center gap-4">
                <img
                  src="https://img.alicdn.com/imgextra/i2/O1CN01omccEt28km8HflKYL_!!6000000007971-2-tps-80-80.png"
                  style={{ width: '20px', height: '20px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // PDF文件直接在新窗口打开
                    window.open(file.url || file.response?.url, '_blank');
                  }}
                  title="预览PDF"
                />
                <img
                  src="https://img.alicdn.com/imgextra/i1/O1CN01iNxV6i1z5FgLl1QD6_!!6000000006662-2-tps-80-80.png"
                  style={{ width: '20px', height: '20px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove && onRemove(file);
                  }}
                  title="删除文件"
                />
              </div>
            ) : (
              // 图片文件显示预览和删除按钮
              <div className="flex items-center justify-center gap-4">
                <img
                  src="https://img.alicdn.com/imgextra/i2/O1CN01omccEt28km8HflKYL_!!6000000007971-2-tps-80-80.png"
                  style={{ width: '20px', height: '20px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreview && onPreview(file);
                  }}
                  title="预览图片"
                />
                <img
                  src="https://img.alicdn.com/imgextra/i1/O1CN01iNxV6i1z5FgLl1QD6_!!6000000006662-2-tps-80-80.png"
                  style={{ width: '20px', height: '20px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove && onRemove(file);
                  }}
                  title="删除文件"
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // 自定义上传按钮 - 修改为100px x 100px
  const uploadButton = (text = '上传') => (
    <div className="w-[100px] h-[100px] border-1 border-dashed border-[#ccc] rounded-[6px] flex flex-col items-center justify-center cursor-pointer bg-white text-[#999] hover:text-[#0077FF] hover:border-[#0077FF] hover:border-solid">
      <PlusOutlined className="text-xl mb-1 " />
      <span className="text-xs">{text}</span>
    </div>
  );

  // 场地实物照片验证规则
  const sitePhotosRules = [
    { required: true, message: '请上传场地实物照片' },
    {
      validator: (_, value) => {
        if (!value || value.length < 3) {
          return Promise.reject(new Error('至少需要上传3张照片'));
        }
        if (value.length > 5) {
          return Promise.reject(new Error('最多只能上传5张照片'));
        }
        return Promise.resolve();
      },
    },
  ];

  const handleSave = () => {
    // 不进行表单校验，直接使用当前文件列表状态
    const warehousingProofData = warehouseDocsFileList?.map((ele) => ({
      uploadFileKey: ele?.response?.result || ele?.uid,
      uploadFileName: ele?.name,
    }));

    const siteOfferImageData = sitePhotosFileList?.map((ele) => ({
      uploadFileKey: ele?.response?.result || ele?.uid,
      uploadFileName: ele?.name,
    }));

    const offerImportExportProofData = productDocsFileList?.map((ele) => ({
      uploadFileKey: ele?.response?.result || ele?.uid,
      uploadFileName: ele?.name,
    }));

    const params = {
      warehousingProof: warehousingProofData,
      siteOfferImage: siteOfferImageData,
      // offerImportExportProof: offerImportExportProofData,
      saveDraft: true,
      ...form.getFieldsValue(),
      isSignAgreement: checked,
    };

    console.info(params);
    // return;

    submitSettledInfo(params).then((res) => {
      const { success } = res;
      if (success) {
        message.success('保存成功');
        callback();
      }
    }).catch((err) => {
      message.error(err?.message || '网络错误');
    });
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const {
        warehousingProof: formWarehousingProof,
        siteOfferImage: formSiteOfferImage,
        // offerImportExportProof: formOfferImportExportProof,
        userName,
        phoneAreaCode,
        phoneNumber,
        mainRegion,
      } = values;
      const params = {
        warehousingProof: formWarehousingProof,
        siteOfferImage: formSiteOfferImage,
        // offerImportExportProof: formOfferImportExportProof,
        saveDraft: false,
        userName,
        phoneAreaCode,
        phoneNumber,
        mainRegion,
        isSignAgreement: checked,
      };
      submitSettledInfo(params).then((res) => {
        const { success } = res;
        if (success) {
          message.success('提交成功');
          callback();
        }
      }).catch((err) => {
        message.error(err?.message || '网络错误');
      });
    }).catch((err) => {
      console.info(err);
    });
  };
  return (
    <div>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        className="flex flex-col gap-y-[12px] "
      >
        {/* 基础信息 */}
        <Info reviewStatus={reviewStatus} />
        {/* 本地仓发货的相关证明 */}
        <div className="bg-white rounded-[6px] p-[20px]">
          <div className="text-[16px] text-[#333] font-bold mb-[20px]">海外仓发货的相关证明</div>
          <div className="flex flex-col gap-[16px] mt-[0px] pl-[20px]">
            {/* 仓储相关证明 */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-red-500">*</span>
                  <span className="text-[14px] text-[#333] mb-[12px]">仓储相关证明</span>
                </div>
                <p className="font-normal text-[14px] leading-[22px] text-[#666] mb-[12px] px-[9px] py-[12px] bg-[#EBF6FF] rounded-[6px]">
                  请提供仓储服务合同、仓储租赁合同、自有仓库的产权三项之一。
                </p>

                <Form.Item
                  name="warehousingProof"
                  rules={[{ required: true, message: '请上传仓储相关证明文件' }]}
                >
                  <Upload
                    disabled={['PASS', 'UNDER_REVIEW'].includes(reviewStatus)}
                    action="https://crossborder.1688.com/choice/upload"
                    listType="picture-card"
                    fileList={warehouseDocsFileList}
                    onPreview={handleWarehouseDocsPreview}
                    onChange={handleWarehouseDocsChange}
                    beforeUpload={beforeUpload}
                    maxCount={5}
                    multiple
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="warehouse-docs-upload"
                    style={{ width: '100px', height: '100px' }}
                    itemRender={customWarehouseItemRender}
                    showUploadList={{
                      showPreviewIcon: false,
                      showRemoveIcon: false,
                      showDownloadIcon: false,
                    }}
                  >
                    {warehouseDocsFileList.length >= 5 || ['PASS', 'UNDER_REVIEW'].includes(reviewStatus) ? null : uploadButton()}
                  </Upload>
                  {warehouseDocsPreviewImage && (
                    <Image
                      wrapperStyle={{ display: 'none' }}
                      preview={{
                        visible: warehouseDocsPreviewOpen,
                        onVisibleChange: (visible) => setWarehouseDocsPreviewOpen(visible),
                        afterOpenChange: (visible) => !visible && setWarehouseDocsPreviewImage(''),
                      }}
                      src={warehouseDocsPreviewImage}
                    />
                  )}
                </Form.Item>
                <div className="text-[12px] text-[#999] font-normal mt-[-16px]">最多上传5个文件，支持JPG、JPEG、PDF、PNG格式，单个文件大小不超过20MB</div>
              </div>
            </div>

            {/* 场地实物照片 - 修改为3-5张 */}
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-red-500">*</span>
                <span className="text-[14px] text-[#333] mb-[12px]">场地实物照片</span>
              </div>

              <Form.Item
                name="siteOfferImage"
                rules={sitePhotosRules}
              >
                <Upload
                  disabled={['PASS', 'UNDER_REVIEW'].includes(reviewStatus)}
                  action="https://crossborder.1688.com/choice/upload"
                  listType="picture-card"
                  fileList={sitePhotosFileList}
                  onPreview={handleSitePhotosPreview}
                  onChange={handleSitePhotosChange}
                  beforeUpload={beforeImageUpload}
                  maxCount={5}
                  multiple
                  accept=".jpg,.jpeg,.png"
                  className="site-photos-upload"
                  style={{ width: '100px', height: '100px' }}
                  itemRender={customSiteItemRender}
                  showUploadList={{
                    showPreviewIcon: false,
                    showRemoveIcon: false,
                    showDownloadIcon: false,
                  }}
                >
                  {sitePhotosFileList.length >= 5 || ['PASS', 'UNDER_REVIEW'].includes(reviewStatus) ? null : uploadButton()}
                </Upload>
                {sitePhotosPreviewImage && (
                  <Image
                    wrapperStyle={{ display: 'none' }}
                    preview={{
                      visible: sitePhotosPreviewOpen,
                      onVisibleChange: (visible) => setSitePhotosPreviewOpen(visible),
                      afterOpenChange: (visible) => !visible && setSitePhotosPreviewImage(''),
                    }}
                    src={sitePhotosPreviewImage}
                  />
                )}
              </Form.Item>
              <div className="text-[12px] text-[#999] font-normal mt-[-16px]">需要上传3-5张照片，支持JPG、JPEG、PNG格式，单张图片大小不超过20MB</div>
            </div>
          </div>
        </div>

        {/* 商品相关证明 */}
        {/* <div className="bg-white rounded-[6px] p-[20px]">
          <div className="text-[16px] text-[#333] font-bold mb-[20px]">商品相关证明</div>
          <div className="pl-[20px]">
            <div className="flex items-center space-x-2">
              <span className="text-red-500">*</span>
              <span className="text-[14px] text-[#333] mb-[12px]">商品进出口相关资质证明</span>
            </div>

            <div>
              <p className="inline-block font-normal text-[14px] leading-[22px] text-[#666] mb-[12px] px-[9px] py-[12px] bg-[#EBF6FF] rounded-[6px]">
                请提供能够保障商品为中国生产、非木地生产的相关证明文件，如进出口许可证、原产地证明、生产许可证等。
              </p>

              <Form.Item
                name="offerImportExportProof"
                rules={[{ required: true, message: '请上传商品相关资质证明文件' }]}
              >
                <Upload
                  disabled={['PASS', 'UNDER_REVIEW'].includes(reviewStatus)}
                  action="https://crossborder.1688.com/choice/upload"
                  listType="picture-card"
                  fileList={productDocsFileList}
                  onPreview={handleProductDocsPreview}
                  onChange={handleProductDocsChange}
                  beforeUpload={beforeUpload}
                  maxCount={5}
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="product-docs-upload"
                  style={{ width: '100px', height: '100px' }}
                  itemRender={customProductItemRender}
                  showUploadList={{
                    showPreviewIcon: false,
                    showRemoveIcon: false,
                    showDownloadIcon: false,
                  }}
                >
                  {productDocsFileList.length >= 5 || ['PASS', 'UNDER_REVIEW'].includes(reviewStatus) ? null : uploadButton()}
                </Upload>
                {productDocsPreviewImage && (
                  <Image
                    wrapperStyle={{ display: 'none' }}
                    preview={{
                      visible: productDocsPreviewOpen,
                      onVisibleChange: (visible) => setProductDocsPreviewOpen(visible),
                      afterOpenChange: (visible) => !visible && setProductDocsPreviewImage(''),
                    }}
                    src={productDocsPreviewImage}
                  />
                )}
              </Form.Item>
              <div className="text-[12px] text-[#999] font-normal mt-[-16px]">最多上传5个文件，支持JPG、JPEG、PDF、PNG格式，单个文件大小不超过20MB</div>
            </div>
          </div>
        </div> */}
      </Form>
      {(!['PASS', 'UNDER_REVIEW'].includes(reviewStatus)) && (
        <div className="gap-[16px] fixed bottom-[0px] ml-[-24px] py-[16px] bg-[#fff] w-full h-[102px]">
          <div className="flex items-center gap-[4px] mb-[16px] justify-center w-full">
            <Checkbox
              checked={checked}
              onChange={(e) => {
                setChecked(e.target.checked);
              }}
            />
            我已阅读并同意
            {agreement?.map((item) => (
              <div className="text-[#07f] text-[14px] cursor-pointer leading-[17px]" key={item?.name} onClick={() => window.open(item?.link, '_black')}>{item?.name}</div>
            ))}
          </div>
          <div className="flex items-center gap-[12px] justify-center w-full">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              onClick={() => {
                handleSubmit();
              }}
              style={{ height: '32px' }}
              disabled={['UNDER_REVIEW'].includes(reviewStatus) || !checked}
            >
              提交
            </Button>
            <Button
              htmlType="button"
              size="large"
              disabled={['UNDER_REVIEW', 'REJECT'].includes(reviewStatus)}
              onClick={() => {
                handleSave();
              }}
              style={{ height: '32px' }}
            >
              保存
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadImg;
