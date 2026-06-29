// 用户偏好记录
const userPrefer = {
  _storeName: 'alphaShopUserPrefer',
  _store: null as any,
  getStore(cache = true) {
    if (!this._store || !cache) {
      try {
        this._store = JSON.parse(localStorage.getItem(this._storeName) || '{}') || {};
      } catch (e) {
        this._store = {};
      }
    }

    return this._store;
  },

  setItem(k, v) {
    const store = this.getStore();

    store[k] = v;
    localStorage.setItem(this._storeName, JSON.stringify(this._store));
  },

  getItem(k) {
    const store = this.getStore();
    return store[k];
  },
};

export default userPrefer;