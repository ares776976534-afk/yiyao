const BASE = '/api';

const handleRes = async (r) => {
  if (!r.ok) {
    let msg = r.statusText || `请求失败 (${r.status})`;
    try {
      const data = await r.json();
      if (data && (data.msg || data.message)) msg = data.msg || data.message;
    } catch {}
    throw new Error(msg);
  }
  return r.json().catch(() => { throw new Error('响应解析失败'); });
};

const wrapFetch = (promise) =>
  promise.catch(e => {
    if (e.name === 'TypeError' || e.message === 'Failed to fetch') {
      throw new Error('无法连接后端服务，请确认 backend 已启动');
    }
    throw e;
  });

const pendingGet = new Map();

export const get = (path, params, opt) => {
  const url = params && Object.keys(params).length ? `${BASE}${path}?${new URLSearchParams(params)}` : `${BASE}${path}`;
  const key = url;
  if (!opt?.signal && pendingGet.has(key)) return pendingGet.get(key);
  const p = fetch(url, opt?.signal ? { signal: opt.signal } : {}).then(handleRes).finally(() => pendingGet.delete(key));
  if (!opt?.signal) pendingGet.set(key, p);
  return p;
};

export const post = (path, data) =>
  wrapFetch(fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })).then(handleRes);

export const put = (path, data) =>
  wrapFetch(fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })).then(handleRes);

export const del = (path) =>
  wrapFetch(fetch(`${BASE}${path}`, { method: 'DELETE' })).then(handleRes);
