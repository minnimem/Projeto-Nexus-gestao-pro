export function safeApi(promise, fallback) {
  return promise.catch(() => fallback);
}
