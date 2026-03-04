const debugLog = (message: string, ...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.debug(`[DEBUG] ${message}`, ...args);
  }
};

export default debugLog;
export { debugLog };
