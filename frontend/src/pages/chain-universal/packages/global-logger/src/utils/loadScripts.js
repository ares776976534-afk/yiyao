import loadscript from 'load-script';

const load = (url) => {
  return new Promise((resolve, reject) => {
    loadscript(url, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

export default (url) => {
  if (typeof url === 'string') {
    return load(url);
  } else if (Array.isArray(url)) {
    return Promise.all(url.map(load));
  }
};
