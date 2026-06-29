import { MainBtn, SecondaryBtn } from '@/components/ChatFlow/Btn';
import { SearchIcon, StarMarkerIcon } from '@/components/Icon';
import { $t } from '@/i18n';
import { getVersionComponent } from '@/utils/versionRouter';
import styles from '../index.module.css';

interface TypeBtnProps {
  handleFindSupplier: () => void;
  handleMaterialProcessing: () => void;
}

const createBtn = (width?: string) => ({ handleFindSupplier, handleMaterialProcessing }: TypeBtnProps) => (
  <div className={styles.itemInfoCardHeaderRightScoreItemRight}>
    <MainBtn style={{ width, height: '36px' }} icon={<SearchIcon />} text={$t('global-1688-ai-app.ChatFlow.ItemInfoCard.ztkgys', '找同款供应商')} handleBtn={handleFindSupplier} />
    <SecondaryBtn style={{ width, height: '36px' }} icon={<StarMarkerIcon />} text={$t('global-1688-ai-app.ChatFlow.ItemInfoCard.sccl', '素材处理')} handleBtn={handleMaterialProcessing} />
  </div>
);

export default getVersionComponent({
  CN: createBtn('140px'),
  GLOBAL: createBtn(),
});
