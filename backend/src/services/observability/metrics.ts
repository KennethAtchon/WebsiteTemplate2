export const incrementCounter = (name: string, labels?: Record<string, string>) => {
  console.log(`[METRIC] Counter: ${name}`, labels);
};

export const recordHistogram = (name: string, value: number, labels?: Record<string, string>) => {
  console.log(`[METRIC] Histogram: ${name} = ${value}`, labels);
};

export const setGauge = (name: string, value: number, labels?: Record<string, string>) => {
  console.log(`[METRIC] Gauge: ${name} = ${value}`, labels);
};

export const recordDbQuery = (operation: string, duration: number, labels?: Record<string, string>) => {
  console.log(`[METRIC] DB Query: ${operation} took ${duration}ms`, labels);
};

export const recordConnectionPool = (active: number, idle: number, total: number) => {
  console.log(`[METRIC] Connection Pool: active=${active}, idle=${idle}, total=${total}`);
};
