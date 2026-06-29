import * as qs from "query-string";

let cache = null;

export default (key) => {
  const { hash, search } = location;

  let queryList = {};
  let hashQuery = {};
  let searchQuery = {};

  if (cache) {
    queryList = cache;
  } else {
    if (hash) {
      hashQuery = qs.parse(hash);
    }

    if (search) {
      searchQuery = qs.parse(search);
    }

    queryList = Object.assign({}, searchQuery, hashQuery);
    cache = queryList;
  }

  if (key) {
    // console.log('queryList', queryList);
    return queryList[key] || queryList[key.replace('_hex_','')];
  }
  return queryList;
};
