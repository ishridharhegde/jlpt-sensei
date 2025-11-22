const STORAGE_KEYS = {
  SHEETS_URL: 'nihongo_samurai_sheets_url',
  LAST_SYNC: 'nihongo_samurai_last_sync',
  ANIMATIONS_ENABLED: 'nihongo_samurai_animations_enabled',
  RANDOM_ORDER_ENABLED: 'nihongo_samurai_random_order_enabled',
  UNLIMITED_REVIEWS: 'nihongo_samurai_unlimited_reviews'
};

/**
 * Get Google Sheets URL from localStorage
 */
export function getSheetsUrl() {
  return localStorage.getItem(STORAGE_KEYS.SHEETS_URL) || '';
}

/**
 * Save Google Sheets URL to localStorage
 */
export function setSheetsUrl(url) {
  localStorage.setItem(STORAGE_KEYS.SHEETS_URL, url);
}

/**
 * Get last sync timestamp
 */
export function getLastSyncTime() {
  const timestamp = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  return timestamp ? new Date(timestamp) : null;
}

/**
 * Update last sync timestamp
 */
export function updateLastSyncTime() {
  localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
}

/**
 * Get animations enabled setting
 */
export function getAnimationsEnabled() {
  const value = localStorage.getItem(STORAGE_KEYS.ANIMATIONS_ENABLED);
  return value === null ? true : value === 'true'; // Default to enabled
}

/**
 * Set animations enabled setting
 */
export function setAnimationsEnabled(enabled) {
  localStorage.setItem(STORAGE_KEYS.ANIMATIONS_ENABLED, enabled.toString());
}

/**
 * Get random order enabled setting
 */
export function getRandomOrderEnabled() {
  const value = localStorage.getItem(STORAGE_KEYS.RANDOM_ORDER_ENABLED);
  return value === null ? false : value === 'true'; // Default to sequential order
}

/**
 * Set random order enabled setting
 */
export function setRandomOrderEnabled(enabled) {
  localStorage.setItem(STORAGE_KEYS.RANDOM_ORDER_ENABLED, enabled.toString());
}

/**
 * Get unlimited reviews setting
 */
export function getUnlimitedReviews() {
  const value = localStorage.getItem(STORAGE_KEYS.UNLIMITED_REVIEWS);
  return value === null ? false : value === 'true'; // Default to limited
}

/**
 * Set unlimited reviews setting
 */
export function setUnlimitedReviews(enabled) {
  localStorage.setItem(STORAGE_KEYS.UNLIMITED_REVIEWS, enabled.toString());
}

/**
 * Clear all configuration
 */
export function clearConfig() {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}
