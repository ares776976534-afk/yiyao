import React, { useState, useEffect } from 'react';
import pandoraIO from '@alife/pandora-io';
import './index.scss';

export default function WorkSkin() {
  const [data, setData] = useState({
    loginId: '',
    memberAvatar: 'https://img.alicdn.com/tfs/TB1UjAu4aL7gK0jSZFBXXXZZpXa-44-44.png',
  })
  useEffect(() => {
    pandoraIO.requestFn('cbu-offer.light', {
      serviceName: 'com.alibaba.china.light.methods.base.BaseAccountFn',
      params: {},
      callback: (error, result) => {
        if (result && result.memberId) {
          setData(old => {
            return {
              ...old,
              ...result,
            }
          });
        }
      },
    });
  }, [])

  const shopUrl = 'https://corp.1688.com/page/index.htm?memberId=' + encodeURIComponent(data.memberId);
  return (
    <nav className="nav">
      <div className="merchant-navigation" data-spm="newnav">
        <div className="logo">
          <a href="https://work.1688.com/">1688商家工作台</a>
        </div>
        <div className="right-link">
          <div className="make-up" />
          {/* <form className="search-form" action="https://show.1688.com/item/common/redirect.html" target="_blank">
            <input type="hidden" name="name" value="search" />
            <input
              type="input"
              name="key"
              className="search-key"
              placeholder="搜索"
              value=""
              required="required"
              autocomplete="off"
            />
            <button type="submit" value=""></button>
          </form> */}
          <a target="_blank" href="https://www.1688.com/">
            1688首页
          </a>
          <a target="_blank" href="https://work.1688.com/?_path_=buyer2017Base/2017buyerbase_index/buyer_2017indexpage">
            买家中心
          </a>
          <a target="_blank" href="https://cxt.1688.com/shangjpc.html">
            商家客户端
          </a>
          <div>
            <div className="member-ava">
              <a target="_blank" className="home-link" data-click="我" href={shopUrl}>
                <img src={data.memberAvatar} />
                <strong>{data.loginId}</strong>
              </a>
              <div className="user-link-more">
                <div className="make-up" />
                <div className="make-content">
                  <a target="_blank" href={shopUrl}>
                    查看我的店铺
                  </a>
                  <a target="_blank" href="https://work.1688.com/?_path_=sellerPro/basic/contact">
                    账号管理
                  </a>
                  <a
                    target="_blank"
                    href="https://work.1688.com/?_path_=sellerPro/2017sellerbase_setting/accountSecurity&childAccount=false"
                  >
                    账号安全
                  </a>
                  <hr />
                  <a target="_top" href="https://login.1688.com/member/signout.htm">
                    登出
                  </a>
                </div>
              </div>
            </div>
            {/* <div>
              <a target="_top" href="https://login.1688.com/member/signout.htm">
                登出
              </a>
            </div> */}
          </div>
        </div>
      </div>
    </nav>
  );
}

