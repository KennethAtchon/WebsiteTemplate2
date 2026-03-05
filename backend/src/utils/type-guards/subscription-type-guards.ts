export const isSubscriptionType = (type: string): boolean => {
  return ['basic', 'pro', 'enterprise'].includes(type);
};

// Aliases for compatibility
export const isSubscriptionTier = isSubscriptionType;

export const toSubscriptionTier = (value: unknown): string | null => {
  if (typeof value === 'string' && isSubscriptionType(value)) {
    return value;
  }
  return null;
};

export const isValidSubscriptionStatus = (status: string): boolean => {
  return ['active', 'canceled', 'past_due', 'trialing'].includes(status);
};
