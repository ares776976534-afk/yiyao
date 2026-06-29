import loadScripts from "./loadScripts";

const depScripts = [
  "https://g.alicdn.com/assets-group/cbu-splus/0.0.8/index.js",
];
const isScriptLoaded = (scriptSrc) => {
  for (let script of document.scripts) {
    if (script.src === scriptSrc) {
      return true;
    }
  }
  return false;
};
const setGoldlog = ({ appKey, pageKey, userId, userNick }) => {
  const q = window.goldlog_queue || (window.goldlog_queue = []);
  if (appKey && pageKey) {
    q.push({
      action: "goldlog.setPageSPM",
      arguments: [appKey, pageKey],
    });
    q.push({
      action: "goldlog.sendPV",
      arguments: [
        {
          is_auto: false,
        },
      ],
    });
  }
  if (userId) {
    q.push({
      action: "goldlog.setUserProfile",
      arguments: [
        {
          uidaplus: userId,
          nick: userNick || "",
        },
      ],
    });
  }
}
export default (goldlogData) => {
  // 检查aplus-core是否已经存在
  if (!document.querySelector('meta[name="aplus-core"]')) {
    const meta = document.createElement("meta");
    meta.name = "aplus-core";
    meta.content = "aplus.js";
    document.head.appendChild(meta);
  }
  let scriptsToLoad = [];
  depScripts.forEach((scriptSrc) => {
    if (!isScriptLoaded(scriptSrc)) {
      scriptsToLoad.push(scriptSrc);
    }
  });
  return new Promise((resolve, reject) => {
    if (scriptsToLoad.length > 0) {
      loadScripts(scriptsToLoad)
        .then(() => {
          setGoldlog(goldlogData)
          resolve();
        })
        .catch((e) => {
          console.error("setAplus error:", e);
          reject();
        });
    }else{
      setGoldlog(goldlogData)
      resolve();
    }
  });
};
