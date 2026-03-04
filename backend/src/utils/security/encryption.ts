export const encrypt = (text: string): string => {
  // Simple placeholder encryption
  return Buffer.from(text).toString('base64');
};

export const decrypt = (encryptedText: string): string => {
  // Simple placeholder decryption
  return Buffer.from(encryptedText, 'base64').toString();
};
