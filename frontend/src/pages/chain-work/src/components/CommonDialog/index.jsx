import { useEffect } from 'react';
import { Message } from '@alifd/next';
import './index.scss';
import logger from '@alife/channel-uni-event-logger';
import { querySellerType } from '@/pages/CrossBorderOfferlist/api';
import { getSignAgreement } from './services';
import DataDialog from './DataDialog';

export const CommonDialog = () => {
  useEffect(() => {
    querySellerType(660291).then((res) => {
      if (res?.data?.data === 'false') {
        DataDialog.open({ onAEClick });
        logger.report({
          actionType: 'chain-work/crossborderofferlist@跨境速卖通协议弹窗',
        });
      }
    });
  }, []);
  const onAEClick = async () => {
    logger.report({
      actionType: 'CLK_加入跨境速卖通弹窗_一键入驻',
    });
    getSignAgreement({
      agreementEnum: 'AE',
    }).then((res) => {
      if (res?.success) {
        Message.success(res?.msg);
        logger.report({
          actionType: 'CLK_加入跨境速卖通弹窗_一键入驻_成功',
        });
      } else {
        Message.error(res?.msg);
      }
    }).catch(() => {
      Message.warning('签署失败，请重试');
    });
  };
};
