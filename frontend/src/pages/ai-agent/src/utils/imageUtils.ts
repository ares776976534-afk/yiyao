/**
 * 图片处理工具函数
 */

/**
 * 压缩图片并转换为base64
 * @param base64 原始base64字符串
 * @param maxWidth 最大宽度，默认1000px
 * @param quality 压缩质量，默认0.8
 * @returns Promise<string> 压缩后的base64字符串
 */
export const compressImage = (
  base64: string,
  maxWidth: number = 1000,
  quality: number = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!base64 || typeof base64 !== 'string') {
      reject(new Error('Invalid base64 input'));
      return;
    }

    const image = new Image();
    image.src = base64;
    image.setAttribute('crossOrigin', 'Anonymous');

    image.onload = function () {
      try {
        const { width: imgWidth, height: imgHeight } = image;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas context creation failed'));
          return;
        }

        // 计算新的尺寸，保持宽高比
        let newWidth = imgWidth;
        let newHeight = imgHeight;

        if (Math.max(imgWidth, imgHeight) > maxWidth) {
          if (imgWidth > imgHeight) {
            newWidth = maxWidth;
            newHeight = (maxWidth * imgHeight) / imgWidth;
          } else {
            newHeight = maxWidth;
            newWidth = (maxWidth * imgWidth) / imgHeight;
          }
        }

        canvas.width = newWidth;
        canvas.height = newHeight;

        ctx.clearRect(0, 0, newWidth, newHeight);
        ctx.drawImage(image, 0, 0, newWidth, newHeight);

        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      } catch (error) {
        reject(error);
      }
    };

    image.onerror = (error) => {
      reject(new Error(`Image loading failed: ${error}`));
    };
  });
};

/**
 * 将File对象转换为base64字符串，并自动压缩
 * @param file 图片文件
 * @param maxWidth 最大宽度，默认1000px
 * @param quality 压缩质量，默认0.8
 * @returns Promise<string> base64字符串
 */
export const fileToBase64 = (
  file: File,
  maxWidth: number = 1000,
  quality: number = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file || !(file instanceof File)) {
      reject(new Error('Invalid file input'));
      return;
    }

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async (event) => {
      try {
        const result = event.target?.result;
        if (result && typeof result === 'string') {
          const compressedBase64 = await compressImage(result, maxWidth, quality);
          resolve(compressedBase64);
        } else {
          reject(new Error('FileReader result is invalid'));
        }
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => {
      reject(new Error(`FileReader error: ${error}`));
    };
  });
};

/**
 * 验证base64字符串是否为有效的图片格式
 * @param base64 base64字符串
 * @returns boolean
 */
export const isValidImageBase64 = (base64: string): boolean => {
  if (!base64 || typeof base64 !== 'string') {
    return false;
  }

  // 检查是否是有效的base64图片格式
  const validImagePrefixes = [
    'data:image/jpeg;base64,',
    'data:image/jpg;base64,',
    'data:image/png;base64,',
    'data:image/gif;base64,',
    'data:image/webp;base64,'
  ];

  return validImagePrefixes.some(prefix => base64.startsWith(prefix));
};

/**
 * 获取base64图片的尺寸信息
 * @param base64 base64字符串
 * @returns Promise<{width: number, height: number}>
 */
export const getImageDimensions = (base64: string): Promise<{ width: number, height: number }> => {
  return new Promise((resolve, reject) => {
    if (!isValidImageBase64(base64)) {
      reject(new Error('Invalid base64 image'));
      return;
    }

    const image = new Image();
    image.src = base64;

    image.onload = function () {
      resolve({
        width: image.width,
        height: image.height
      });
    };

    image.onerror = (error) => {
      reject(new Error(`Failed to load image: ${error}`));
    };
  });
};


/**
 * 将图片URL转换为base64字符串，并自动压缩
 * @param url 图片URL地址
 * @param maxWidth 最大宽度，默认1000px
 * @param quality 压缩质量，默认0.8
 * @returns Promise<string> base64字符串
 */
export const urlToBase64 = (
  url: string,
  maxWidth: number = 1000,
  quality: number = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!url || typeof url !== 'string') {
      reject(new Error('Invalid URL input'));
      return;
    }

    const image = new Image();
    image.setAttribute('crossOrigin', 'Anonymous');
    image.src = url;

    image.onload = async function () {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas context creation failed'));
          return;
        }

        canvas.width = image.width;
        canvas.height = image.height;

        ctx.clearRect(0, 0, image.width, image.height);
        ctx.drawImage(image, 0, 0);

        const initialBase64 = canvas.toDataURL('image/jpeg', 1.0);
        const compressedBase64 = await compressImage(initialBase64, maxWidth, quality);
        resolve(compressedBase64);
      } catch (error) {
        reject(error);
      }
    };

    image.onerror = (error) => reject(new Error(`Failed to load image: ${error}`));
  });
};