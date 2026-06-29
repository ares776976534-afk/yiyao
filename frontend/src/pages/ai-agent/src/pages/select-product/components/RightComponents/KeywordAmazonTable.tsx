import CommonTable from '@/components/ChatFlow/CommonTable';
import { observer } from 'mobx-react-lite';
import { KeywordAmazonTablechoiceColumns } from '../keywordTableConfig';

export const KeywordAmazonTable = observer((props: any) => {
  const { keywordList, platform } = props;
  return (
    <CommonTable
      data={keywordList || []}
      columns={KeywordAmazonTablechoiceColumns(platform)}
    />
  );
});