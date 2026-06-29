import { ajax } from '@ali/ice-bind';
import { URL, Util } from '../common/config';
import { Dialog } from '@alifd/next';

const responseCallback = (err, _resp, callback, errCallback) => {
  const resp = _resp;
  if (!err) {
    if (!('success' in resp) && 'code' in resp) {
      resp.success = resp.code === 'OK';
    }
    if (resp && !resp.success) {
      if (resp.msg && resp.msg.startsWith('403')) {
        const acl = `//acl.alibaba-inc.com/apply/instance/post.htm?pnames=${resp.data}`;
        Dialog.alert({
          content: '对不起，你没有访问权限',
          closable: true,
          locale: { ok: '申请权限' },
          onOk: () => {
            window.open(acl);
          },
        });
      } else if (resp.msg && resp.msg.startsWith('A0001')) {
        Dialog.alert({
          content: resp.msg.replace('A0001:', ''),
          closable: true,
          locale: { ok: '申请权限' },
          onOk: () => {
            location.href = Util.getLink('aclList');
          },
          onClose: () => {
            location.href = Util.getLink('aclList');
          },
        });
      } else {
        callback(resp);
      }
    } else {
      callback(resp);
    }
  } else {
    // Dialog.alert({content:"网络错误："+err.toString()});//报错，方便运营和开发排查问题
    errCallback(err);
  }
};

export function request(
  url,
  callback,
  _data = {},
  _method = 'get',
  _dataType = 'jsonp',
  timeout = 30,
  errCallback = () => { },
) {
  const data = _data;
  let method = (_method || 'get').toLowerCase();
  let dataType = (_dataType || 'jsonp').toLowerCase();

  method = method || (dataType === 'jsonp' ? 'get' : 'post');
  dataType = method === 'post' ? '' : dataType;
  // 在jsonp模式下需要使用get，默认json模式下使用post，防止线上过大的表单提交
  for (const key in data) {
    if (typeof data[key] === 'object') {
      data[key] = JSON.stringify(data[key]);
    }
  }

  ajax(
    {
      url: URL.getUrl(url) || url,
      needToken: false,
      type: method,
      timeout: timeout || 30,
      data,
      dataType,
      xhrFields: {
        withCredentials: true,
      },
    },
    (err, resp) => {
      responseCallback(err, resp, callback, errCallback);
    },
  );
}

export function requestJsonp(url, callback, data) {
  /* 线上环境调用json，线下采用jsonp方便调试 */
  if (Util.isDebug === true) {
    request(url, callback, data, 'get', 'jsonp');
  } else {
    request(url, callback, data, 'post', 'json');
  }
}
