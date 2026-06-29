import clipboard from 'clipboard';

export default (selector: string | Element) => {
  return new Promise((resolve, reject) => {
    const result = new clipboard(selector);
    console.log(result);
    result.on('success', () => {
      resolve(true);
    });
    result.on('error', (err) => {
      reject(err);
    });
  });
};