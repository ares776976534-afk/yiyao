import React, { useEffect, useState, useRef } from 'react';
import { Form, Icon, Balloon, Select, Input, Message } from '@alifd/next';
import RenderFieldExt from '@/pages/AlipayInternationalAccountRegistration/components/RenderFieldExt';
import { SCHEMA_UPLOAD } from '@/pages/AlipayInternationalAccountRegistration/contanst';
import { TagState } from '@/pages/CrossBorderOfferlist/BusinessToDo/Tag';
import { openLinkAndDownload } from '@/utlis';

interface OverseaQualificationFormProps {
  field?: any;
  state?: TagState;
  data?: any;
  onUploadingChange?: (isUploading: boolean) => void;
}

export const OverseaQualificationForm: React.FC<OverseaQualificationFormProps> = ({ field, state = 'new', data, onUploadingChange }) => {
  const [overseasProofMaterialsList, setOverseasProofMaterialsList] = useState<any[]>([]);
  // 使用 ref 存储 uid 到 blob URL 的映射，确保在 onChange 中能可靠查找
  const localPreviewUrlMapRef = useRef<Map<string, string>>(new Map());

  // 判断表单是否可编辑：new 或 failed 时可编辑，其他状态只读
  const isEditable = state === 'new' || state === 'audit_fail';

  // 文件大小限制：100M
  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

  const beforeUpload = (file: File) => {
    const isLt100M = file.size < MAX_FILE_SIZE;
    if (!isLt100M) {
      Message.error('文件大小不能超过100M');
    }
    return isLt100M;
  };


  const COMPANY_OFFICE_PHOTO = {
    name: '',
    fieldKey: 'overseasProofMaterials',
    type: SCHEMA_UPLOAD,
    opt: {
      desc: '',
      listType: 'picture-card',
      className: 'products-business-upload',
      maxCount: 10,
      action: 'https://crossborder.1688.com/choice/upload',
      accept: '.jpg,.jpeg,.png,.pdf',
      rules: [{ required: true, message: '请上传该国家海外货源的证明资料' }],
      rule: true,
      disabled: !isEditable,
      beforeUpload,
      onDownload: (file: any) => {
        // 文件下载功能
        const fileUrl = file.url || file.response?.result;
        if (fileUrl) {
          // 如果是相对路径，需要构建完整 URL
          let downloadUrl = fileUrl;
          if (!fileUrl.startsWith('https://') && !fileUrl.startsWith('https://')) {
            downloadUrl = `https://crossborder.1688.com/${fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl}`;
          }
          openLinkAndDownload(downloadUrl);
        }
      },
      showUploadList: {
        showDownloadIcon: true,
        showPreviewIcon: true, // 默认显示，但会在文件对象上覆盖
        showRemoveIcon: isEditable,
      },
      onChange: ({ file, fileList }) => {
        // 过滤掉被拦截的文件（status 为 error 或文件大小超过限制的文件）
        const validFileList = fileList.filter((item) => {
          // 如果文件有原始文件对象，检查大小
          if (item.originFileObj) {
            const isValidSize = item.originFileObj.size < MAX_FILE_SIZE;
            if (!isValidSize) {
              return false; // 过滤掉超过大小的文件
            }
          }
          // 过滤掉上传失败的文件（但不包括正在上传的文件）
          if (item.status === 'error') {
            return false;
          }
          // 如果文件有响应且上传失败，过滤掉
          if (item.response && !item.response.success) {
            return false;
          }
          return true;
        });

        // 判断文件是否为 PDF 类型的辅助函数
        const isPdfFile = (fileItem: any): boolean => {
          // 从文件名或 URL 判断
          const fileName = fileItem.name || fileItem.url || '';
          const lowerFileName = fileName.toLowerCase();
          // 检查文件扩展名
          if (lowerFileName.endsWith('.pdf')) {
            return true;
          }
          // 检查 MIME 类型
          if (fileItem.type === 'application/pdf') {
            return true;
          }
          // 检查原始文件对象的类型
          if (fileItem.originFileObj?.type === 'application/pdf') {
            return true;
          }
          return false;
        };

        // 处理所有文件（图片和非图片），统一维护到 overseasProofMaterialsList
        const allFiles = validFileList.map((item) => {
          // 如果响应成功，强制将状态设置为 done
          let { status } = item;
          if (item.response && item.response.success) {
            status = 'done';
          }

          // 判断是否为 PDF 文件
          const isPdf = isPdfFile(item);

          // 确定文件预览 URL
          let fileUrl = '';
          // 优先判断：如果有 originFileObj，说明是新上传的文件，始终使用本地预览
          if (item.originFileObj) {
            // 新上传的文件，使用本地预览
            // 检查 ref 中是否已经有该文件的本地预览 URL
            const existingBlobUrl = localPreviewUrlMapRef.current.get(item.uid);
            if (existingBlobUrl) {
              // 如果之前已经创建了本地预览 URL，直接使用
              fileUrl = existingBlobUrl;
            } else {
              // 创建新的本地预览 URL
              const localUrl = URL.createObjectURL(item.originFileObj);
              fileUrl = localUrl;
              // 存储到 ref 中，用于后续查找
              localPreviewUrlMapRef.current.set(item.uid, localUrl);
            }
          } else {
            // 没有 originFileObj，说明是回显的文件（从服务器加载的），使用服务器 URL
            fileUrl = item.url || item.response?.result || '';
            // 如果这个文件之前有本地预览 URL（可能被移除了），清理它
            const existingBlobUrl = localPreviewUrlMapRef.current.get(item.uid);
            if (existingBlobUrl) {
              URL.revokeObjectURL(existingBlobUrl);
              localPreviewUrlMapRef.current.delete(item.uid);
            }
          }

          return {
            ...item,
            status,
            // 使用确定的 URL（本地预览或服务器 URL）
            url: fileUrl,
            // 确保 response 被保留
            response: item.response,
            // PDF 文件不显示预览按钮
            showPreviewIcon: !isPdf,
            // 添加类名用于 CSS 控制
            className: isPdf ? 'pdf-file-item' : '',
          };
        });

        // 更新文件列表（包含所有文件，图片和非图片）
        setOverseasProofMaterialsList(allFiles);

        // 检查是否有文件正在上传
        const hasUploading = allFiles.some((fileItem) => fileItem.status === 'uploading');
        // 通知父组件上传状态
        onUploadingChange?.(hasUploading);

        // 检查上传错误
        if (fileList.filter((item) => item.response && !item.response.success)?.length) {
          field.setErrors({
            overseasProofMaterials: file?.response?.retMsg,
          });
          return false;
        }
        field.setErrors({
          overseasProofMaterials: null,
        });

        // 获取所有已上传完成的文件 URL（只包含已上传完成的文件）
        const allFileUrls = allFiles
          .filter((ele) => ele.status === 'done' && (ele.response?.result || ele.url))
          .map((ele) => ele.response?.result || ele.url);
        // 当文件上传完成时，更新表单的URL数组
        field.setValue('overseasProofMaterials', allFileUrls);
        return undefined;
      },
      // fileList 包含所有文件（图片和非图片）
      fileList: overseasProofMaterialsList,
      children: (
        !isEditable || overseasProofMaterialsList?.length >= 10 ? null : (
          <div className="products-business-upload-text">
            <Icon type="add" />
            <div>上传</div>
          </div>
        )
      ),
      flattenErrors: '',
    },
  };

  // 判断文件是否为 PDF 类型的辅助函数
  const isPdfFile = (fileName: string, url?: string): boolean => {
    const lowerFileName = (fileName || '').toLowerCase();
    const lowerUrl = (url || '').toLowerCase();
    // 检查文件扩展名
    return lowerFileName.endsWith('.pdf') || lowerUrl.endsWith('.pdf');
  };

  // 清理不再使用的本地预览 URL
  useEffect(() => {
    // 组件卸载时，清理所有本地预览 URL
    const urlMap = localPreviewUrlMapRef.current;
    return () => {
      urlMap.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      urlMap.clear();
    };
  }, []);

  // 清理已从列表中移除的文件的本地预览 URL
  useEffect(() => {
    const currentUids = new Set(overseasProofMaterialsList.map((item) => item.uid));

    // 找出不再使用的本地预览 URL 并释放
    const uidsToRemove: string[] = [];
    localPreviewUrlMapRef.current.forEach((url, uid) => {
      if (!currentUids.has(uid)) {
        uidsToRemove.push(uid);
        URL.revokeObjectURL(url);
      }
    });

    // 清理 ref
    if (uidsToRemove.length > 0) {
      uidsToRemove.forEach((uid) => {
        localPreviewUrlMapRef.current.delete(uid);
      });
    }
  }, [overseasProofMaterialsList]);

  useEffect(() => {
    if (data && field) {
      field.setValues({
        spuNum: data.spuNum,
        warehouseType: data.warehouseType,
        isOfflineTrade: data.isOfflineTrade,
        overseasProofMaterials: data.overseasProofMaterialsPreviewUrl,
      });

      // 如果有预览 URL，转换为 fileList 格式用于回显
      // 优先从 overseasProofMaterialsPreviewUrl 中取 URL，文件名从 overseasProofMaterials 中提取
      if (data.overseasProofMaterialsPreviewUrl && Array.isArray(data.overseasProofMaterialsPreviewUrl)) {
        const allFileList = data.overseasProofMaterialsPreviewUrl.map((url: string, index: number) => {
          // 文件名优先从 overseasProofMaterials 中提取（可能是相对路径或完整 URL）
          let fileName = '';
          if (data.overseasProofMaterials?.[index]) {
            const materialPath = data.overseasProofMaterials[index];
            // 如果是相对路径，提取文件名；如果是完整 URL，也从 URL 中提取
            fileName = materialPath.split('/').pop()?.split('?')[0] || '';
          }
          // 如果从 overseasProofMaterials 中提取不到，从预览 URL 中提取
          if (!fileName) {
            fileName = url.split('/').pop()?.split('?')[0] || `文件${index + 1}`;
          }
          // 判断是否为 PDF 文件
          const isPdf = isPdfFile(fileName, url);
          return {
            uid: `-${index}`,
            name: fileName,
            status: 'done' as const,
            url, // 使用预览 URL
            // PDF 文件不显示预览按钮
            showPreviewIcon: !isPdf,
            // 添加类名用于 CSS 控制
            className: isPdf ? 'pdf-file-item' : '',
          };
        });
        setOverseasProofMaterialsList(allFileList);
      } else if (data.overseasProofMaterials && Array.isArray(data.overseasProofMaterials) && data.overseasProofMaterials.length > 0) {
        // 如果没有预览 URL，但有路径，构建完整的文件访问 URL
        const allFileList = data.overseasProofMaterials.map((path: string, index: number) => {
          // 从路径中提取文件名（去掉查询参数）
          const fileName = path.split('/').pop()?.split('?')[0] || `文件${index + 1}`;
          // 构建完整的文件访问 URL
          // 如果路径已经是完整 URL，直接使用；否则拼接基础 URL
          const fileUrl = path.startsWith('https://') || path.startsWith('https://')
            ? path
            : `https://crossborder.1688.com/${path.startsWith('/') ? path.slice(1) : path}`;
          // 判断是否为 PDF 文件
          const isPdf = isPdfFile(fileName, fileUrl);
          return {
            uid: `-${index}`,
            name: fileName,
            status: 'done' as const,
            url: fileUrl,
            // PDF 文件不显示预览按钮
            showPreviewIcon: !isPdf,
            // 添加类名用于 CSS 控制
            className: isPdf ? 'pdf-file-item' : '',
          };
        });
        setOverseasProofMaterialsList(allFileList);
      } else {
        setOverseasProofMaterialsList([]);
      }
    } else {
      // 如果没有数据，清空列表
      setOverseasProofMaterialsList([]);
    }
  }, [data, field]);

  return (
    <div className="bg-[#fff] px-[20px] py-[40px] rounded-[6px]">
      <style>
        {`
          /* 隐藏 PDF 文件的预览按钮 */
          .products-business-upload .ant-upload-list-item:has(.ant-upload-list-item-name[title$=".pdf"]) .ant-upload-list-item-actions .anticon-eye,
          .products-business-upload .ant-upload-list-item:has(.ant-upload-list-item-name[title$=".PDF"]) .ant-upload-list-item-actions .anticon-eye,
          .products-business-upload .ant-upload-list-item:has(.ant-upload-list-item-name[title$=".pdf"]) .ant-upload-list-item-actions .anticon-eye-o,
          .products-business-upload .ant-upload-list-item:has(.ant-upload-list-item-name[title$=".PDF"]) .ant-upload-list-item-actions .anticon-eye-o {
            display: none !important;
          }
          /* 兼容不支持 :has() 的浏览器，使用属性选择器 */
          .products-business-upload .ant-upload-list-item-name[title$=".pdf"] ~ .ant-upload-list-item-actions .anticon-eye,
          .products-business-upload .ant-upload-list-item-name[title$=".PDF"] ~ .ant-upload-list-item-actions .anticon-eye,
          .products-business-upload .ant-upload-list-item-name[title$=".pdf"] ~ .ant-upload-list-item-actions .anticon-eye-o,
          .products-business-upload .ant-upload-list-item-name[title$=".PDF"] ~ .ant-upload-list-item-actions .anticon-eye-o {
            display: none !important;
          }
        `}
      </style>
      <Form field={field}>
        <Form.Item
          required
          name="spuNum"
          requiredMessage="请输入您在该国家海外备货SPU数（商品数）"
          label={
            <span className="inline-flex items-center gap-[4px]">
              您在该国家海外备货SPU数（商品数）有多少？
              {/* <Balloon.Tooltip
                trigger={<Icon type="help" className="text-[#BBB] cursor-pointer" size="small" />}
                triggerType="hover"
                align="t"
                popupStyle={{ backgroundColor: '#333', fontSize: '14px', maxWidth: '300px' }}
                popupClassName="products-business-tooltips"
              >
                请填写您拥有海外仓或海外货源的国家信息，可多选
              </Balloon.Tooltip> */}
            </span>
          }
        >
          <Input
            style={{ width: '424px' }}
            disabled={!isEditable}
            htmlType="number"
            max={2147483647}
            min={0}
            onChange={(value) => {
              // 只允许整数（过滤掉所有非数字字符，包括小数点）
              const strValue = String(value || '');
              const numValue = strValue.replace(/[^\d]/g, '');
              // 限制最大值和最小值
              if (numValue) {
                const num = parseInt(numValue, 10);
                if (isNaN(num)) {
                  field.setValue('spuNum', '');
                  return;
                }
                if (num > 2147483647) {
                  field.setValue('spuNum', '2147483647');
                  return;
                }
                if (num < 0) {
                  field.setValue('spuNum', '0');
                  return;
                }
                // 确保是整数，去掉前导零
                field.setValue('spuNum', String(num));
                return;
              }
              field.setValue('spuNum', numValue);
            }}
          />
        </Form.Item>

        <Form.Item
          required
          name="warehouseType"
          requiredMessage="请选择您在该国的海外仓类型"
          label={
            <span className="inline-flex items-center gap-[4px]">
              您在该国的海外仓类型是？
              <Balloon.Tooltip
                trigger={<Icon type="help" className="text-[#BBB] cursor-pointer" size="small" />}
                triggerType="hover"
                align="t"
                popupStyle={{ backgroundColor: '#333', fontSize: '14px', maxWidth: '300px' }}
                popupClassName="products-business-tooltips"
              >
                自建海外仓：海外仓主体、运作等均有自主权；
                租赁海外仓：租赁海外仓，商品支持发往各个平台，不受约束；
                入驻官方仓：商品仅支持入驻平台订单发货，受平台约束；
              </Balloon.Tooltip>
            </span>
          }
        >
          <Select
            dataSource={[
              {
                label: '自建海外仓',
                value: 'self_warehouse',
              },
              {
                label: '租赁海外仓',
                value: 'rent_warehouse',
              },
              {
                label: '入驻跨境电商平台官方仓',
                value: 'official_warehouse',
              },
            ]}
            placeholder="请选择"
            style={{ width: '424px' }}
            disabled={!isEditable}
          />
        </Form.Item>

        <Form.Item
          required
          name="isOfflineTrade"
          requiredMessage="请选择您是否直接在该国生产商品或在该国做线下贸易"
          label={
            <span className="inline-flex items-center gap-[4px]">
              您是否直接在该国生产商品或在该国做线下贸易？
              <Balloon.Tooltip
                trigger={<Icon type="help" className="text-[#BBB] cursor-pointer" size="small" />}
                triggerType="hover"
                align="t"
                popupStyle={{ backgroundColor: '#333', fontSize: '14px', maxWidth: '300px' }}
                popupClassName="products-business-tooltips"
              >
                在海外有营业执照
              </Balloon.Tooltip>
            </span>
          }
        >
          <Select
            dataSource={[
              {
                label: '是',
                value: 'yes',
              },
              {
                label: '否',
                value: 'no',
              },
            ]}
            placeholder="请选择"
            style={{ width: '424px' }}
            disabled={!isEditable}
          />
        </Form.Item>


        <Form.Item
          required
          name="overseasProofMaterials"
          requiredMessage="请上传该国家海外货源的证明资料"
          label={
            <span className="inline-flex items-center gap-[4px]">
              请您提供该国家海外货源的证明资料
            </span>
          }
        >
          <div
            className="w-[900px] h-[40px] flex py-[9px]
                    px-[12px] gap-2 rounded-[6px] bg-[#EBF6FF]
                    my-[12px]"
          >
            如：1.海外店铺截图(包含国家、平台、店铺名称、商品数等)； 2.海外仓入驻协议/系统截图等； 3.海关报关数据等 或者其他可以证明的材料。
          </div>

          <RenderFieldExt
            {...COMPANY_OFFICE_PHOTO}
            field={field}
          />
        </Form.Item>

      </Form>
    </div>
  );
};
