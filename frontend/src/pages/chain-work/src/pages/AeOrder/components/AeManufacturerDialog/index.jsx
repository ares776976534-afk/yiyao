import React, { useEffect, useRef } from 'react';
import ManufacturerInfoCard from '@/pages/ManufacturerInfoCard';
import { querySignAgreement } from '@/pages/CrossBorderOfferlist/api';
import CommonDialog from './CommonDialog';
import logger from '@alife/channel-uni-event-logger';
import { getPrefillMfrInfo } from '../../api';
import ReactDOM from 'react-dom';
import { alterManufacturerInfo } from '@/service/common';
import { MessageError, MessageSuccess } from '@/utlis';
import { Message } from '@alifd/next';
import { getSignAgreement } from './services';
import OperationVideoDialog from '@/components/OperationVideoDialog';
import { videoIntro } from '@/pages/AliExpress/enums';
import DescribeDom from '@/pages/AliExpress/components/DescribeDom';

const labelType = [
  {
    title: '《直通“速卖通优选”服务协议》',
    url: 'https://terms.alicdn.com/legal-agreement/terms/b_end_product_protocol/20240524204617685/20240524204617685_1_0_22987.html',
  },
  {
    title: '《“速卖通优选”活动规则》',
    url: 'https://peixun.1688.com/space/l2AmoZ7J1vJjlXdb/detail/AR4GpnMqJzML1lddtEKRkQ2yVKe0xjE3',
  },
  {
    title: '《“速卖通优选”招商规则》',
    url: 'https://peixun.1688.com/space/l2AmoZ7J1vJjlXdb/detail/qnYMoO1rWxDl12ddcOOB0aAGW47Z3je9',
  },
  {
    title: '《信息共享授权书》',
    url: 'https://terms.alicdn.com/legal-agreement/terms/b_end_product_protocol/20230928094558858/20230928094558858.html',
  },
  {
    title: '《支付宝付款授权协议》',
    url: 'https://render.alipay.com/p/yuyan/180020010001196791/preview.html?agreementId=AG00000051',
  },
];

const titleDom = () => {
  return (
    <div className="flex flex-row items-center">
      <img
        src="https://img.alicdn.com/imgextra/i4/O1CN01fsJhpu26w6VzEoudc_!!6000000007725-0-tps-38-32.jpg"
        className="title-img"
      />
      1688跨境“速卖通优选”活动入驻
    </div>
  );
};

const AeManufacturerData3 = {
  title: titleDom(),
  describe: [
    {
      title: '尊敬的1688会员：',
      describe: '根据欧洲通用产品安全法规（GPSR）的要求，所有销往欧洲的商品必须在其实物标签上提供符合法规要求的欧盟责任人和制造商信息。因此，参与“速卖通优选“活动的商家需注意以下事项：',
    },
    {
      title: '1、欧盟责任人信息',
      describe: '如您自行委托了欧盟责任人，请将相关信息提供给1688小二。如您没有或所提供的欧盟责任人信息不符合欧盟法律要求，您在此同意授权速卖通相关公司为您供应的商品委托相关服务主体作为欧盟责任人。您需配合速卖通相关公司完成此委托，包括但不限于获取商品制造商的授权或转授权，并确保持续拥有相关授权。您只需点击下方确认按钮，即可视为对速卖通相关公司的有效授权，双方无需签署其他授权文件。',
    },
    {
      title: '',
      describe: '以上信息将被提交给速卖通、Joom、Miravia, Rakuten, Voghion, Cdiscount等欧洲电商平台。',
    },
  ],
  checkboxList: [
    {
      content: (
        <div className="ml-[8px]">
          我同意入驻速卖通渠道，签署
          {labelType?.map((ele) => (
            <a
              href={ele?.url}
              target="_blank"
              rel="noreferrer"
              className="a"
              key={ele?.title}
            >
              {ele?.title}
            </a>
          ))}
          ，知晓商品在速卖通渠道的订单将抽取 <span style={{ color: '#ff4d4f' }}>5%</span>的技术服务费，且满<span style={{ color: '#ff4d4f' }}>90</span>天才能退出。
        </div>
      ),
    },
  ],
  footer: [
    {
      text: '一键入驻',
      primaryType: 'primary',
    },
    {
      text: '我再想想',
      primaryType: 'normal',
      disabled: 'false',
    },
  ],
};

function AeManufacturerDialog({ props }) {
  const __data = useRef(null);
  const getData = (values) => {
    __data.current = values;
  };

  const AeManufacturerData = {
    title: '1688跨境“速卖通优选”活动入驻',
    describe: [
      {
        title: '尊敬的1688会员：',
        describe: '根据欧洲通用产品安全法规（GPSR）的要求，所有销往欧洲的商品必须在其实物标签上提供符合法规要求的欧盟责任人和制造商信息。因此，参与“速卖通优选“活动的商家需注意以下事项：',
      },
      {
        title: '1、欧盟责任人信息',
        describe: '如您自行委托了欧盟责任人，请将相关信息提供给1688小二。如您没有或所提供的欧盟责任人信息不符合欧盟法律要求，您在此同意授权速卖通相关公司为您供应的商品委托相关服务主体作为欧盟责任人。您需配合速卖通相关公司完成此委托，包括但不限于获取商品制造商的授权或转授权，并确保持续拥有相关授权。您只需点击下方确认按钮，即可视为对速卖通相关公司的有效授权，双方无需签署其他授权文件。',
      },
      {
        title: '2、制造商信息',
        describe: '请核对以下的商品制造商信息是否正确，如有错误，请及时修改并提交正确的信息。',
      },
      {
        title: '',
        describe: '以上信息将被提交给速卖通、Joom、Miravia, Rakuten, Voghion, Cdiscount等欧洲电商平台。',
      },
    ],
    children: <ManufacturerInfoCard type="product" getData={getData} />,
    checkboxList: [
      {
        content: (
          <div className="ml-[8px]">
            我同意入驻速卖通渠道，签署
            {labelType?.map((ele) => (
              <a
                href={ele?.url}
                target="_blank"
                rel="noreferrer"
                className="a"
                key={ele?.title}
              >
                {ele?.title}
              </a>
            ))}
            ，知晓商品在速卖通渠道的订单将抽取 <span style={{ color: '#ff4d4f' }}>5%</span>  的技术服务费，且满<span style={{ color: '#ff4d4f' }}>90</span> 天才能退出。
            {/* ，知晓商品在速卖通渠道交易成功的订单将抽取 <span style={{ color: '#ff4d4f' }}>5%</span> 的技术服务费，<span style={{ color: '#ff4d4f' }}>2.5%</span>的优惠技术服务费费率在2025年4月30日截止。 */}
          </div>
        ),
      },
    ],
    footer: [
      {
        text: '一键入驻',
        primaryType: 'primary',
      },
      {
        text: '我再想想',
        primaryType: 'normal',
        disabled: 'false',
      },
    ],
  };

  const AeManufacturerData2 = ({ allowModify = false }) => {
    return {
      title: '商品制造商信息确认',
      describe: [
        {
          title: '尊敬的1688会员：',
          describe: '根据欧洲通用产品安全法规（GPSR）的要求，所有销往欧洲的商品必须在其实物标签上提供符合法规要求的欧盟责任人和制造商信息。因此，参与“速卖通优选“活动的商家需注意以下事项：',
        },
        {
          title: '1、欧盟责任人信息',
          describe: '如您自行委托了欧盟责任人，请将相关信息提供给1688小二。如您没有或所提供的欧盟责任人信息不符合欧盟法律要求，您在此同意授权速卖通相关公司为您供应的商品委托相关服务主体作为欧盟责任人。您需配合速卖通相关公司完成此委托，包括但不限于获取商品制造商的授权或转授权，并确保持续拥有相关授权。您只需点击下方确认按钮，即可视为对速卖通相关公司的有效授权，双方无需签署其他授权文件。',
        },
        {
          title: '2、制造商信息',
          describe: '请核对以下的商品制造商信息是否正确，如有错误，请及时修改并提交正确的信息。',
        },
        {
          title: '',
          describe: '以上信息将被提交给速卖通、Joom、Miravia, Rakuten, Voghion, Cdiscount等欧洲电商平台。',
        },
      ],
      children: <ManufacturerInfoCard type="product" getData={getData} allowModify={allowModify} />,
      footer: [
        {
          text: '确认',
        },
      ],
    };
  };

  const buryingPoint = () => {
    logger.report({
      actionType: 'chain-work/aeorder@跨境速卖通协议弹窗',
    });
  };

  const getalterManufacturerInfo = (prefillMfrinfo = {}) => {
    return new Promise((resolve) => {
      const { allowModify } = prefillMfrinfo || {};
      const postData = {
        ...__data?.current || {},
        type: 'AGREE_SHARE',
      };
      delete postData.class;
      const isUnconfirmed = __data?.current?.type === 'UNCONFIRMED' || __data?.current?.type === 'DEFAULT';
      let isValid = true;
      Object.keys(postData).forEach((key) => {
        if (!postData[key]) {
          isValid = false;
        }
      });
      if (!isValid && allowModify) {
        MessageError('请先填写或确认制造商信息');
        resolve(false);
        return;
      }
      alterManufacturerInfo({
        action: isUnconfirmed ? 1 : 0,
        manufacturerModel: postData,
      }).then((res) => {
        const { content = {} } = res;
        const { msg, success = false } = content;
        if (success) {
          MessageSuccess(msg);
          props?.onOk();
        } else {
          MessageError(msg || '系统异常');
        }
        resolve(success);
      }).catch((err) => {
        MessageError(err?.errMsg || '系统异常');
      });
    });
  };

  const SignAgreement = () => {
    return new Promise((resolve) => {
      logger.report({
        actionType: 'CLK_加入跨境速卖通弹窗_一键入驻',
      });
      getSignAgreement({
        agreementEnum: 'AE',
      }).then((res) => {
        if (res?.success) {
          ReactDOM.unmountComponentAtNode(container);
          Message.success(res?.msg);
          logger.report({
            actionType: 'CLK_加入跨境速卖通弹窗_一键入驻_成功',
          });
          props?.onOk();
        } else {
          Message.error(res?.msg);
        }
        resolve(res?.success);
      }).catch(() => {
        Message.warning('签署失败，请重试');
      });
    });
  };

  const query = (prefillMfrinfo) => {
    return new Promise((resolve) => {
      getalterManufacturerInfo(prefillMfrinfo).then((res) => {
        if (res) {
          SignAgreement().then((r) => {
            resolve(r && res);
            props?.onOk();
          });
        }
      });
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [response1, response2] = await Promise.all([
          querySignAgreement({ agreementEnum: 'AE' }),
          getPrefillMfrInfo(),
        ]);
        const result1 = response1?.content?.data; // false表示ae没有签署，true表示ae已签署
        const result2 = response2?.content?.model?.isPopWindow;
        const result3 = response2?.content?.model?.allowModify;
        __data.current = response2?.content?.model?.prefillInfo;
        if (result1 && !result2) {
          props?.onOk();
          return;
        } else if (!result1 && result2) {
          // ae没有签署，制造商信息没有确认
          CommonDialog.open({ data: AeManufacturerData, isCheck: false, onOkInfo: () => query(response2?.content?.model), isCloseIcon: !props?.isCloseIcon, onOk: () => OperationVideoDialog.open({ video: videoIntro, content: <DescribeDom /> }) });
          buryingPoint();
        } else if (result1 && result2) {
          // ae已经签署，制造商信息没有确认
          CommonDialog.open({ data: () => AeManufacturerData2({ allowModify: result3 }), isCheck: true, onOkInfo: () => query(response2?.content?.model), isCloseIcon: !props?.isCloseIcon });
        } else if (!result1 && !result2) {
          // ae没有签署，制造商信息已经确认
          CommonDialog.open({ data: AeManufacturerData3, isCheck: true, onOkInfo: SignAgreement, isCloseIcon: !props?.isCloseIcon, onOk: () => OperationVideoDialog.open({ video: videoIntro, content: <DescribeDom /> }) });
          buryingPoint();
        } else {
          props?.onOk();
        }
      } catch (error) {
        props?.onOk();
      }
    };
    fetchData();
  }, []);

  return null;
}

let container;

AeManufacturerDialog.open = (props) => {
  container = document.createElement('div');
  document.body.appendChild(container);
  ReactDOM.render(<AeManufacturerDialog props={props} />, container);
};

AeManufacturerDialog.close = () => {
  if (container) {
    ReactDOM.unmountComponentAtNode(container);
    document.body.removeChild(container);
    container = null;
  }
};

export default AeManufacturerDialog;
