import CommonTable from '@/components/ChatFlow/CommonTable';
import { observer } from 'mobx-react-lite';
import { ImproveChoiceKeywordTablecolumns } from '../keywordTableConfig';

export const ImproveChoiceKeywordTable = observer((props: any) => {
  const { keywordList, platform } = props;

  return (
    <CommonTable
      data={keywordList || []}
      columns={ImproveChoiceKeywordTablecolumns(platform)}
    />
  );
});