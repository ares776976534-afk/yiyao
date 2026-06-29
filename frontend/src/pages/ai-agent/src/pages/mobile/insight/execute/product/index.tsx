import Streaming from '../components/streaming';
import Product from './product';
import { selApiBaseUrl } from '@/utils/env';
import { SelectProductProvider, useSelectProductStore } from '@/stores/select-product';
import { observer } from 'mobx-react-lite';
import { StatusEnum } from '@/pages/select-product/config';
import { productFormatList } from '@/pages/mobile/insight/execute/format/product';
import { useNavigateWithScroll } from '@/hooks/useNavigateWithScroll';

const SelectProductContent = observer(() => {
  const selectProductStore = useSelectProductStore();
  const status = selectProductStore.status;
  const navigator = useNavigateWithScroll();
  return (
    <Streaming
      fetchUrl={`${selApiBaseUrl}/opp/sel/api/new-product/execute`}
      productFormatList={productFormatList}
      title='机会新品选品'
      onBack={() => navigator('/mobile/insight', { replace: true })}
      reqComponent={
        <Product
          userRequest={selectProductStore.userRequest}
          onSubmit={(formattedPayload) => {
            selectProductStore.setFormattedPayload(formattedPayload);
            selectProductStore.setFormSubmitted(true);
            selectProductStore.setStatus(StatusEnum.RUNNING);
          }}
          status={selectProductStore.status}
        />
      }
    />
  )
})

const SelectProductPage = observer(() => {
  return (
    <SelectProductProvider>
      <SelectProductContent />
    </SelectProductProvider>
  );
});

export default SelectProductPage;