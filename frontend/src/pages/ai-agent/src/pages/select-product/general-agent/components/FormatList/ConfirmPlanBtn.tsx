import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { CONFIRM_PLAN_FETCH_URL } from '../../index';
import { commonRecord } from '@/utils/log';
import { $t } from '@/i18n';
import { useSelectProductStore } from '@/stores/select-product';

export default (props: any) => {
  const { getStream } = props;
  const [disabled, setDisabled] = useState(false);
  const { getFormattedPayload } = useSelectProductStore();

  const handleConfirm = () => {
    const { query } = getFormattedPayload() || {};
    getStream({
      fetchUrl: CONFIRM_PLAN_FETCH_URL,
      params: {
        isPlanConfirm: true,
        query,
      },
    });
    setDisabled(true);
    commonRecord(`通用选品确定需求点击`);
  };

  useEffect(() => {
    handleConfirm();
  }, []);

  return null;
};