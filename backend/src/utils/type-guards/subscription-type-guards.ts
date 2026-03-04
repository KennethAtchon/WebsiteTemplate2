export const isSubscriptionType = (type: string): boolean => {
  return ['basic', 'pro', 'enterprise'].includes(type);
};

export const isValidSubscriptionStatus = (status: string): boolean => {
  return ['active', 'canceled', 'past_due', 'trialing'].includes(status);
};
