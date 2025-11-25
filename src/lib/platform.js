
export const isDesktop = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  return !isMobile;
};

export const isAndroid = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  return /android/i.test(window.navigator.userAgent);
};
