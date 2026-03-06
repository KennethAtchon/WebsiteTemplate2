const debugLog = Object.assign(
  (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
  {
    warn: (message: string, ...args: any[]) => {
      if (process.env.NODE_ENV === "development") {
        console.warn(`[DEBUG] ${message}`, ...args);
      }
    },
    error: (message: string, ...args: any[]) => {
      if (process.env.NODE_ENV === "development") {
        console.error(`[DEBUG] ${message}`, ...args);
      }
    },
    info: (message: string, ...args: any[]) => {
      if (process.env.NODE_ENV === "development") {
        console.info(`[DEBUG] ${message}`, ...args);
      }
    },
    debug: (message: string, ...args: any[]) => {
      if (process.env.NODE_ENV === "development") {
        console.debug(`[DEBUG] ${message}`, ...args);
      }
    }
  }
);

export default debugLog;
export { debugLog };
