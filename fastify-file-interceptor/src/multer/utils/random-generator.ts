const crypto = require("crypto");

export const randomStringGenerator = () => {
  return crypto.randomUUID({ disableEntropyCache: true });
};
