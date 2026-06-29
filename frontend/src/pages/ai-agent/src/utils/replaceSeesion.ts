export default (_sessionId) => {
  let searchParams = new URLSearchParams(window.location.search);
  // 修改参数值
  searchParams.set("__chat_history_session__", _sessionId);
  searchParams.delete("__share_code__");
  searchParams.delete("__chat_input_cache_id__");
  searchParams.delete("__chat_input__");
  searchParams.delete("__is_make_similar__");
  // 创建一个新的 URL，但不替换当前的 URL，也不刷新页面
  let newUrl = `${window.location.origin}${window.location.pathname
    }?${searchParams.toString()}`;
  // 使用 pushState 替换当前的 URL，但不刷新页面
  window.history.pushState({}, "", newUrl);
};