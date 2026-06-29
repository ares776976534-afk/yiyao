import CommonTable from '@/components/ChatFlow/CommonTable';
import { observer } from 'mobx-react-lite';
import { PlatformChoiceKeywordTablemigrateColumns } from '../keywordTableConfig';

export const PlatformChoiceKeywordTable = observer((props: any) => {
  const { keywordList, platform } = props;
  return (
    <CommonTable
      data={keywordList || []}
      columns={PlatformChoiceKeywordTablemigrateColumns(platform)}
    />
  );
});