import React from 'react';
import { Dialog, Icon } from '@alifd/next';
import { QQJX_XIEYI } from '@/constant';

const ALI_PAY_XIEYI = 'https://render.alipay.com/p/yuyan/180020010001196791/preview.html?agreementId=AG00000051';

export const qqjx_agreement_text_cell = (
  <span className="text-[14px] text-[#333]">
    我同意加入1688全球严选并签署
    <a target="_blank" href={QQJX_XIEYI} rel="noreferrer">
      《1688大严选帮卖技术服务协议》
    </a>
    <a target="_blank" href={ALI_PAY_XIEYI} rel="noreferrer">
      《付款授权服务协议》
    </a>
    ，知晓该商品站外订单将收取5% 的技术服务费（餐饮生鲜、食品酒水享受5折优惠），符合全球严选优惠活动的订单按照实际活动规则收取，知晓加入全球严选后3天内随时可退，超过3天冷静期后加入90天方可申请退出。全球严选商品亦有机会自动加入严选，加入严选后“严选标商品”和“严选潜力品”的订单均需支付技术服务费，您亦可享受对应的严选权益。
  </span>
);

export const BatchResultDialogCell = ({
  visible,
  _status = '',
  _msg = {},
  setBatchJoinResultParams,
  updateTableData,
}) => {
  if (!visible) {
    return null;
  }
  let titleCell = '';
  let contentCell = '';
  let childrenCell = '';
  switch (_status) {
    case 'success':
      titleCell = (
        <div className="title">
          <Icon type="success" style={{ color: '#25BE13', marginRight: '4px' }} size="medium" />
          恭喜，已经成功加入全球严选
        </div>
      );
      contentCell = `${Number(_msg?.successCount) || '多'
      }个商品已成功加入全球严选，您可继续报名更多商品，商品将获得AI智能多语言翻译、卖点提炼、跨境渠道重点展示等核心资源扶持，抢占更多跨境订单！`;
      childrenCell = '提报更多商品';
      break;
    case 'doing':
      titleCell = (
        <div className="title">
          <Icon type="loading" style={{ color: '#07f', marginRight: '4px' }} size="medium" />
          您已成功提交，请耐心等待
        </div>
      );
      contentCell = `${Number(_msg?.totalCount) || '多'
      }个商品已提交渠道审核，您也可以继续提报其他商品，抢占更多跨境订单！`;
      childrenCell = '提报更多商品';
      break;
    default:
      titleCell = (
        <div className="title">
          <Icon type="error" style={{ color: '#FF7300', marginRight: '4px' }} size="medium" />
          加入失败，未满足资质
        </div>
      );
      contentCell = `由于商品未满足全球严选资源，${Number(_msg?.failCount) || '多'
      }个商品加入失败，请优化商品后再提报。`;
      childrenCell = '重新去提报';
      break;
  }

  const dialogJoinResult = (
    <Dialog
      title={titleCell}
      footerActions={['ok']}
      className="dialog-result"
      footerAlign="center"
      visible={visible}
      onClose={() => {
        setBatchJoinResultParams({ visible: false });
        updateTableData ? updateTableData() : window.location.reload();
      }}
      onOk={() => {
        setBatchJoinResultParams({ visible: false });
        updateTableData ? updateTableData() : window.location.reload();
      }}
      okProps={{
        children: childrenCell,
      }}
    >
      <div>{contentCell}</div>
    </Dialog>
  );
  return dialogJoinResult;
};
