import { definePageConfig } from 'ice';
import { observer } from 'mobx-react-lite';
import { SafeArea } from 'antd-mobile';
import StudioRoot from '@/components/studio/root';
import MobileNavigator from '@/components/MobileNavigator';
import GuideButton from '@/components/GuideButton';
import ChatContent from '@/components/ChatContent';
import 'antd/dist/reset.css';
import '@/styles/design-tokens.mobile.css';
import styles from './index.module.scss';
import { MobileShareIcon } from '@/components/Icons';
import * as clipboard from 'clipboard-polyfill';
import showTaskLinkModal from '@/components/TaskLinkModel';

interface StudioProps {
  canvasState?: any;
  showDebugTool?: boolean;
  showLayerPanel?: boolean;
  showToolbar?: boolean;
  onAutoSave?: (canvasData: string) => void;
  isShared?: boolean;
}

const Page = observer((props: StudioProps) => {
  // console.log('【mobile-studio-share】props:', props);

  const handleShare = () => {
    console.log('【mobile-studio-share】handleShare', location.href);
    clipboard.writeText(location.href);
    const handler = showTaskLinkModal({
      isClickable: true,
      onClose: () => {
        handler.close();
      },
    });
  };

  return (
    <div className={styles.mobileStudioShareContainer}>
      <ChatContent
        speed={50}
        step={2}
        typing
        isShared
        isMobile
        historyTyping={props.isShared}
        headerRender={(props) => (
          <MobileNavigator
            sticky
            right={
              <div onClick={handleShare}>
                <MobileShareIcon />
              </div>
            }
          />
        )}
      />
      <GuideButton />
      <SafeArea position="bottom" />
    </div>
  );
});

export default observer((props: StudioProps) => {
  return (
    <StudioRoot root theme="light">
      <Page {...props} />
    </StudioRoot>
  );
});

export const pageConfig = definePageConfig(() => ({
  spm: {
    spmB: '32265064',
  },
}));
