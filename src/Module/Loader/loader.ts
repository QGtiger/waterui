import { setStyles } from "@lightfish/tools";

// 加载过的资源
const loadedResource = {};

/**
 * 图片预加载
 * @param {function} cb
 * @param {string} url
 */
export function imgPreload(url: string) {
  return new Promise((resolve, reject) => {
    if (loadedResource[url]) {
      resolve(loadedResource[url]);
    } else {
      const img = new Image();
      img.onload = () => {
        loadedResource[url] = img;
        resolve(img);
      };
      img.onerror = () => {
        reject(`图片加载失败：${url}`);
      };
      //decodeURI一次是为了以防链接被encode过一次
      // url = encodeURI(decodeURI(url));
      //除了base64的路径，其他都设置了跨域，其实有部分服务器不允许跨域，不能设置anonymous
      // if (url.indexOf("data:") !== 0) img.crossOrigin = "anonymous";
      img.src = url;
      setStyles(img, {
        position: 'absolute',
        width: '0px',
        height: '0px',
        left: '-9999px',
        top: '-9999px',
      });
      document.body.appendChild(img);
    }
  });
}

export async function onPreloadOnce(
  url: string,
  preloadFunc: { [x: string]: (res: string) => Promise<any> } = {},
) {
  console.log('预加载', url);
  const type = url.split('.').pop();
  const imageType = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'];
  const preloadKeys = Object.keys(preloadFunc || {});
  const allPreloadKeys = imageType.concat(preloadKeys);
  // const loadFunc = allPreloadKeys.find(k => k === type) ||
  if (imageType.includes(type)) {
    if (preloadFunc && preloadFunc[type]) {
      return preloadFunc[type](url).then((ve) => {
        // todo 加载完成后，需要做一些处理
        return ve;
      });
    } else {
      return imgPreload(url).catch((e) => {
        console.error(e);
      });
    }
  }

  if (preloadKeys.includes(type)) {
    return preloadFunc[type](url).then((ve) => {
      // todo 加载完成后，需要做一些处理
      return ve;
    });
  } else if (preloadFunc && preloadFunc['others']) {
    return preloadFunc['others'](url).then((ve) => {
      // todo 加载完成后，需要做一些处理
      return ve;
    });
  } else {
    console.warn(`.${type}类型的文件 不支持预加载`);
  }
}

/**
 * 预先加载资源
 * @param resouces 资源列表
 * @param parallelMode 是否并行加载
 * @param func 加载资源方法
 * @returns
 */
export function onPreloadResource(
  resouces: string[],
  parallelMode: boolean = false,
  func?: { [x: string]: (res: string) => Promise<any> },
) {
  if (!resouces || resouces.length === 0) {
    return Promise.resolve();
  }
  return new Promise(async (resolve) => {
    let totalCount = resouces.length,
      loadedCount = 0;
    if (parallelMode) {
      await Promise.all(
        resouces.map(async (item: string) => {
          return onPreloadOnce(item, func).then((re) => {
            loadedCount++;
            return re;
          });
        }),
      );
    } else {
      for (let i = 0; i < resouces.length; i++) {
        await onPreloadOnce(resouces[i], func).then((re) => {
          loadedCount++;
          return re;
        });
      }
    }
    resolve(loadedCount);
  });
}