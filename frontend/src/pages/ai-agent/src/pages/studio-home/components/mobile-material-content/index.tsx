import React, { useState, useEffect, useRef } from 'react';
import { useSpm } from 'ice';
import { observer } from 'mobx-react-lite';
import StudioRoot from '@/components/studio/root';
import InputChat from '@/components/InputChat';
import { useMobileImagePreview } from '@/components/MobileImagePreview';
import Prompt from '../prompt';
import CaseToolsMobile from '@/components/CaseTools/mobile';
import MobileOfferLinkAnalysis from '@/components/studio/MobileOfferLinkAnalysis';
import MasonryExcellentCases from '@/components/studio/MasonryExcellentCases';
import {
  type TypeInputChatRef,
  type TypeUploadItem,
  Status,
} from '@/components/InputChat/types';
import { useStore } from '@/stores/context';
import createChatCache from '@/services/studio/createChatCache';
import { routeJump } from '@/utils/url';
import { $t } from '@/i18n';
import { checkAuthAndLogin } from '@/utils/login';
import styles from './index.module.scss';

// PC端尺寸转移动端
const calcForPaltform = (size, baseWidth = 375) => {
  return (size * window.innerWidth) / baseWidth;
};

const Page = observer((props: { showPromptList?: boolean }) => {
  const inputChatRef = useRef<TypeInputChatRef>(null);
  const [status, setStatus] = useState<Status>(Status.DEFAULT);
  const [inputChatData, setInputChataData] = useState<TypeUploadItem[]>([]);
  const [offerLinkAnalysisShow, setOfferLinkAnalysisShow] = useState(false);
  const [spmA, spmB] = useSpm();
  const store = useStore();

  // 使用自定义图片预览 hooks
  const imagePreview = useMobileImagePreview();

  const handleOpenOfferLinkAnalysis = () => {
    setOfferLinkAnalysisShow(true);
  };

  const handleCloseOfferLinkAnalysis = () => {
    setOfferLinkAnalysisShow(false);
  };

  const handleSendMessage = (data: any) => {
    createChatCache({
      query: data.content,
      attachments: data.files,
    })
      .then((res) => {
        routeJump('mobile-studio', {
          cacheId: res,
          autoSend: 'true',
          theme: 'light',
          spm: `${spmA}.${spmB}.send-input`,
        });
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (inputChatRef.current) {
      store.setInputChat(inputChatRef.current);
    }
  }, [inputChatRef.current]);

  return (
    <div className={styles.mobileMaterial}>
      <div className={styles.inputChatBox}>
        <div className={styles.inputChatInnerBox}>
          <InputChat
            isMobile
            uploadCompact
            uploadCompactConfig={{
              placement: 'bottomLeft',
              align: {
                offset: [0, 6],
              },
              menuClassName: styles.uploadMenu,
            }}
            chatInputMinHeight={calcForPaltform(52)}
            chatInputMaxHeight={calcForPaltform(164)}
            ref={inputChatRef}
            inputChatData={inputChatData}
            // 隐藏上传商品链接按钮
            showUploadOffer={!store.isCustomUser}
            onInputChataDataChange={setInputChataData}
            status={status}
            onStatusChange={setStatus}
            imagePreview={imagePreview}
            onSendMessage={(data) => {
              checkAuthAndLogin({
                onSuccess: () => {
                  handleSendMessage(data);
                },
              }).then((loginSuccess) => {
                if (loginSuccess) {
                  handleSendMessage(data);
                }
              });
            }}
            onOfferLinkClick={handleOpenOfferLinkAnalysis}
          />
        </div>
      </div>

      <div className={styles.extraBox}>
        {/* 提示词列表 */}
        {props?.showPromptList !== false && (
          <Prompt
            className={styles.promptList}
            onClick={(item) => {
              if (item.query) {
                inputChatRef.current?.addTextToChat(item.query, false);
              }

              if (item.imageList?.length > 0) {
                inputChatRef.current?.addImagesToChat(item.imageList, false);
              }
            }}
          />
        )}
        <MobileOfferLinkAnalysis
          offerLinkAnalysisShow={offerLinkAnalysisShow}
          handleCloseOfferLinkAnalysis={handleCloseOfferLinkAnalysis}
          onImport={(result) => {
            inputChatRef.current?.addOffersToChat(result);
            handleCloseOfferLinkAnalysis();
          }}
        />
      </div>

      <div className={styles.fitContainer}>
        {/* 快捷工具栏 */}
        <CaseToolsMobile className={styles.caseToolsContainer} max={4} />

        {/* 精彩案例展示 */}
        <div className={styles.excellentCaseContainer}>
          <div className={styles.excellentCasesTitle}>
            {$t(
              'global-1688-ai-app.agent-home.Agents.Material.tsjxal',
              '探索精选案例',
            )}
          </div>
          <MasonryExcellentCases
            className={styles.excellentCaseContent}
            showTitle={false}
            max={18}
            columns={2}
            jumpPageParams={{
              theme: 'light',
            }}
            onClick={(item) => {
              // 跳转到移动端对话流的分享页面
              routeJump('mobile-studio-share', {
                theme: 'light',
                shareCode: item.shareCode,
                spm: `${spmA}.${spmB}.send-input`,
              });
              return false;
            }}
          />
        </div>
      </div>

      {/* <div className={styles.footer}>{$t("global-1688-ai-app.agent-home.DemoList.ddl", "- 到底了 -")}</div> */}
    </div>
  );
});

export default (props) => {
  return (
    <StudioRoot theme="light">
      <Page {...props} />
    </StudioRoot>
  );
};
