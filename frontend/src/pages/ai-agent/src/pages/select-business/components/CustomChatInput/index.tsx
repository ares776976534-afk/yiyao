import React, { useEffect, useState } from 'react';
import ChatInput from '@/pages/select-product/components/ChatInput';
import ModeSelector from '../ModeSelector';
import { EnumSearchMode } from '../../enum';
import { useSelectProductStore } from '@/stores/select-product';
import ActionButtons from './ActionButtons';
import { $t } from '@/i18n';

// 这个是发起询盘的model，后续cp一个出来
// src/pages/select-product/components/BusinessComponents/InitiateInquiryModal.tsx
// {
//   "imgFileKey": "https://cbu01.alicdn.com/img/ibank/O1CN01TZu5NF26jk0ysrtFG_!!4611686018427387410-0-overseas_pic.jpg",
//   "previewUrl": "https://cbu01.alicdn.com/img/ibank/O1CN01TZu5NF26jk0ysrtFG_!!4611686018427387410-0-overseas_pic.jpg"
// }
interface FileItem {
  imgFileKey: string;
  offerId?: string;
  previewUrl: string;
  // modeValue?: EnumSearchMode;
  // onChange?: (mode: EnumSearchMode) => void;
}
export default (props) => {
  const { fancy, defaultValue, sourcingModeLogKey, sourcingImgLogKey } = props;
  const selectProductStore = useSelectProductStore();
  const [modeValue, setModeValue] = useState(selectProductStore.getFormattedPayload()?.intention || EnumSearchMode.SMART);

  // console.log('selectProductStore.intention', modeValue, 'fancy', fancy);

  const handleNewConversation = () => {
    window.open('/sourcing', '_blank');
  };

  useEffect(() => {
    if (defaultValue) {
      setModeValue(defaultValue.intention);
    }
  }, [defaultValue]);

  useEffect(() => {
    if (selectProductStore.getFormattedPayload()) {
      setModeValue(selectProductStore.getFormattedPayload()?.intention);
    }
  }, [selectProductStore.getFormattedPayload()]);


  return (
    <>
      {
        fancy === false && (
          <ActionButtons
            // onCreateInquiry={handleCreateInquiry}
            onNewConversation={handleNewConversation}
          />
        )
      }
      <ChatInput
        {...props}
        imageUploadLogKey={sourcingImgLogKey}
        placeholder={fancy === false ? props?.placeholder : '请输入你想要找的1688商品或商家，如：支持外贸定制的毛绒玩具工厂'}
        defaultValue={{
          query: defaultValue?.query || '',
          fileList: defaultValue?.searchImageUrl ? [{
            imgFileKey: defaultValue?.searchImageUrl,
            previewUrl: defaultValue?.searchImageUrl,
          }] : [],
        }}
        onSubmit={({ inputValue, fileList }: {
          inputValue?: string;
          fileList: FileItem[];
        }) => {
          // 智能模式 searchImageUrl 和 query 不能全部为空
          // 以品找商 searchImageUrl 和 query 不能全部为空
          // 找商 searchImageUrl 须为空，非空时后端报错
          const intention = selectProductStore.getFormattedPayload()?.intention || EnumSearchMode.SMART;
          props.onSubmit({
            query: inputValue,
            searchImageUrl: modeValue === EnumSearchMode.DIRECT_SUPPLIER ? undefined : fileList?.[0]?.imgFileKey,
            intention,
          });
        }}
        // 直搜商家模式 不显示上传图片按钮, fancy 为 false 时，不显示上传图片按钮
        enableUploadImage={!(fancy === false || modeValue === EnumSearchMode.DIRECT_SUPPLIER)}
        footer={<ModeSelector
          disabled={fancy === false}
          value={modeValue}
          logKey={sourcingModeLogKey}
          onChange={(mode) => {
            selectProductStore.setFormattedPayload({
              ...selectProductStore.getFormattedPayload(),
              intention: mode,
            });
          }}
        />}
      />
    </>
  );
};