export function isBrowser(): boolean {
  // https://stackoverflow.com/a/32598826/12948018
  return !!(
    (typeof window !== 'undefined' &&
     window.document && window.document.createElement)
  );
}

export function isServer(): boolean {
  return !isBrowser();
}
