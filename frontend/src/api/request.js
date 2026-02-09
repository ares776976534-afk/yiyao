const BASE = '/api';

const handleRes = (r) => {
  if (!r.ok) throw new Error(r.statusText || '请求失败');
  return r.json().catch(() => { throw new Error('响应解析失败'); });
};

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
  fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleRes);

export const put = (path, data) =>
  fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleRes);

export const del = (path) =>
  fetch(`${BASE}${path}`, { method: 'DELETE' }).then(handleRes);
