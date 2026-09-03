/**
 * Saves an item to localStorage with a Time-To-Live expiration timestamp.
 * @param {string} key - Unique storage target key identifier.
 * @param {any} value - The payload data string/object.
 * @param {number} ttlInMs - Lifetime window duration in milliseconds (Default: 30 minutes = 1,800,000 ms).
 */
export const setItemWithExpiry = (key, value, ttlInMs = 1800000) => {
  const now = new Date();
  const item = {
    value: value,
    expiry: now.getTime() + ttlInMs,
  };
  localStorage.setItem(key, JSON.stringify(item));
};

/**
 * Retrieves an item from localStorage, destroying it immediately if expired.
 * @param {string} key - Target key identifier.
 * @returns {any|null} Raw clean value string or null if dead/absent.
 */
export const getItemWithExpiry = (key) => {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  try {
    const item = JSON.parse(itemStr);
    const now = new Date();

    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key); // Evict instantly
      return null;
    }
    return item.value;
  } catch (e) {
    return null; // Graceful fallback for malformed structural profiles
  }
};
