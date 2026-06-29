import React from 'react';
import {
  BH_PENDING_CONFIRM,
  CO_CONFIRMED,
  CO_IN_TRANSIT,
  CO_DISCREPANCY,
  PO_PENDING_APPOINTMENT,
} from '../../../../constant';
import { listQuery } from '../../services/search';

export default (type) => {
  switch (type) {
    case BH_PENDING_CONFIRM:
      return {
        link: null,
        msg: '超时7天未处理补货任务会触发自动关单，关单次数将会进入您的考核，后续影响您的售卖，请及时处理',
      };
    case CO_CONFIRMED:
      return {
        link: null,
        msg: '超时10天未处理补货任务会触发自动关单，关单次数将会进入您的考核，后续影响您的售卖，请及时处理',
      };
    case CO_IN_TRANSIT:
      return {
        link: null,
        msg: '超时7天未处理补货任务会触发自动关单，关单次数将会进入您的考核，后续影响您的售卖，请及时处理',
      };
    case CO_DISCREPANCY:
      return {
        link: null,
        msg: '超时15天未处理理货报告会触发自动关单，关单次数将会进入您的考核，后续影响您的售卖，请及时处理',
      };
    case 'previewDialog':
      return {
        link: null,
        msg: '您正在选择的时间为货物实际到仓时间，请保证按照预约时间到仓，否则晚到仓库可能会拒收您的货品。',
      };
    case PO_PENDING_APPOINTMENT:
      return {
        link: (
          <a
            style={{ color: '#0077FF' }}
            href="https://rulechannel.1688.com/?type=detail&ruleId=20005378&cId=3032#/rule/detail?ruleId=20005378&cId=3032"
            target="_blank"
            rel="noreferrer"
          >
            查看处罚规则
          </a>
        ),
        msg: '紧急补货单需要在创建后1天内进行预约，超时将会按照平台规则进行处罚。',
        getIsShow: () => {
          // 当为补货预约时，查询是否有紧急补货单
          const param = { subModuleCode: PO_PENDING_APPOINTMENT, pageNo: 1, pageSize: 10 };
          return listQuery(param)
            .then((res) => {
              const isExists =
                res?.model?.length &&
                res.model.some((item) => {
                  if (item.isUrgent) {
                    return true;
                  }
                  return false;
                });
              return isExists;
            })
            .catch(() => {});
        },
      };
    default:
      return { link: null, msg: null };
  }
};
