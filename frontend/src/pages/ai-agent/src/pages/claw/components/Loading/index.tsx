import React, { useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import type {
  TypeFullScreenLoadingProps,
  TypeFullScreenLoadingHandle,
  TypeFullScreenLoadingOptions,
  TypeUseFullScreenLoadingReturn,
} from './types';
import styles from './index.module.scss';

const DEFAULT_ID = '__claw_loading_default__';
const CONTAINER_ID_PREFIX = 'claw-loading-root-';

interface TypeLoadingInstance {
  container: HTMLDivElement;
  root: ReturnType<typeof createRoot>;
  handle: TypeFullScreenLoadingHandle;
  id: string;
}

const instancesById = new Map<string, TypeLoadingInstance>();

/** 全屏 Loading 组件（组件方式使用） */
const FullScreenLoading: React.FC<TypeFullScreenLoadingProps> = ({
  className,
  style,
  visible = true,
  text = '加载中...',
  imageUrl = 'https://img.alicdn.com/imgextra/i1/O1CN01YRKoVd1rBBuBqzMwl_!!6000000005592-54-tps-244-180.apng',
  fullScreen = true,
}) => {
  if (!visible) return null;

  const overlayClass = fullScreen
    ? styles.overlay
    : `${styles.overlay} ${styles.overlayContained}`;

  return (
    <div className={`${overlayClass} ${className ?? ''}`} style={style} role="alert" aria-busy="true">
      <div className={styles.box} style={{ backgroundColor: fullScreen ? '#fff' : 'transparent' }}>
        <div className={styles.iconWrap}>
          {imageUrl ? (
            <img className={styles.iconImg} src={imageUrl} alt="" />
          ) : (
            <div className={styles.spinner} />
          )}
        </div>
        <span className={styles.text}>{text}</span>
      </div>
    </div>
  );
};

export default FullScreenLoading;

function getOrCreateContainer(
  id: string,
  parent: HTMLElement | null | undefined,
): { container: HTMLDivElement; root: ReturnType<typeof createRoot>; isNew: boolean } {
  const existing = instancesById.get(id);
  if (existing) {
    const { container } = existing;
    const stillInDom =
      parent != null
        ? parent.contains(container)
        : document.body.contains(container);
    if (stillInDom) {
      return { container, root: existing.root, isNew: false };
    }
    existing.root.unmount();
    if (container.parentNode) container.parentNode.removeChild(container);
    instancesById.delete(id);
  }

  const el = document.createElement('div');
  el.id = CONTAINER_ID_PREFIX + id;
  el.style.position = 'relative';
  el.style.width = '100%';
  el.style.height = '100%';

  const mountTarget = parent ?? document.body;
  mountTarget.appendChild(el);

  const root = createRoot(el);
  return { container: el, root, isNew: true };
}

function destroy(id: string) {
  const inst = instancesById.get(id);
  if (!inst) return;
  const { root, container } = inst;
  if (container.parentNode) {
    root.unmount();
    container.parentNode.removeChild(container);
  }
  instancesById.delete(id);
}

/**
 * 以工具方式显示 Loading（按 id 单例：相同 id 的多次调用共用一个实例）
 * @param options 可选文案、图片、id、父元素；不传 id 使用默认单例
 * @returns 返回带 close 方法的对象，用于主动关闭
 */
export function showFullScreenLoading(
  options: TypeFullScreenLoadingOptions = {},
): TypeFullScreenLoadingHandle {
  const {
    text = '加载中...',
    imageUrl,
    id = DEFAULT_ID,
    parent = null,
  } = options;

  const { container, root, isNew } = getOrCreateContainer(id, parent);
  const fullScreen = parent == null;

  const handleClose = () => {
    destroy(id);
  };

  const handle: TypeFullScreenLoadingHandle = { close: handleClose };

  if (isNew) {
    instancesById.set(id, { container, root, handle, id });
  } else {
    const existing = instancesById.get(id);
    if (existing) existing.handle = handle;
  }

  root.render(
    <FullScreenLoading
      visible
      text={text}
      imageUrl={imageUrl}
      fullScreen={fullScreen}
    />,
  );

  return handle;
}

/**
 * Hook 方式使用 Loading，按 id 单例
 * @returns { show, close } show 显示 Loading（可选 id/parent），close(id?) 关闭指定 id 或默认单例
 */
export function useFullScreenLoading(): TypeUseFullScreenLoadingReturn {
  return useMemo(
    () => ({
      show: showFullScreenLoading,
      close: (id?: string) => {
        const targetId = id ?? DEFAULT_ID;
        instancesById.get(targetId)?.handle?.close?.();
      },
    }),
    [],
  );
}

export type {
  TypeFullScreenLoadingProps,
  TypeFullScreenLoadingHandle,
  TypeFullScreenLoadingOptions,
  TypeUseFullScreenLoadingReturn,
};
