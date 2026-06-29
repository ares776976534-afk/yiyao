export function postMessageToParent<T = unknown>(
  type: string,
  data: T,
  targetOrigin = '*',
): void {
  if (typeof window === 'undefined' || typeof window.postMessage !== 'function') return;
  const target = window.parent === window ? window : window.parent;
  target.postMessage({ type, data }, targetOrigin);
}
