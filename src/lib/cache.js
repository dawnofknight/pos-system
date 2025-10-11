import { getRedisClient } from './redis'

// Default TTL values (in seconds)
const DEFAULT_TTL = {
  SHORT: 60,      // 1 minute
  MEDIUM: 300,    // 5 minutes
  LONG: 1800,     // 30 minutes
  VERY_LONG: 3600 // 1 hour
}

// Cache key prefixes for organization
const CACHE_PREFIXES = {
  DASHBOARD: 'dashboard:',
  ITEMS: 'items:',
  CATEGORIES: 'categories:',
  SALES: 'sales:',
  USERS: 'users:',
  SETTINGS: 'settings:',
  REPORTS: 'reports:',
  PERMISSIONS: 'permissions:'
}

/**
 * Get data from cache
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} - Cached data or null if not found
 */
export async function getCache(key) {
  try {
    const redis = getRedisClient()
    if (!redis) {
      console.warn('Redis client not available, skipping cache get')
      return null
    }

    const data = await redis.get(key)
    if (!data) {
      return null
    }

    return JSON.parse(data)
  } catch (error) {
    console.error(`Cache get error for key ${key}:`, error)
    return null
  }
}

/**
 * Set data in cache with TTL
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttl - Time to live in seconds (optional)
 * @returns {Promise<boolean>} - Success status
 */
export async function setCache(key, data, ttl = DEFAULT_TTL.MEDIUM) {
  try {
    const redis = getRedisClient()
    if (!redis) {
      console.warn('Redis client not available, skipping cache set')
      return false
    }

    const serializedData = JSON.stringify(data)
    await redis.setex(key, ttl, serializedData)
    return true
  } catch (error) {
    console.error(`Cache set error for key ${key}:`, error)
    return false
  }
}

/**
 * Delete data from cache
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} - Success status
 */
export async function deleteCache(key) {
  try {
    const redis = getRedisClient()
    if (!redis) {
      console.warn('Redis client not available, skipping cache delete')
      return false
    }

    await redis.del(key)
    return true
  } catch (error) {
    console.error(`Cache delete error for key ${key}:`, error)
    return false
  }
}

/**
 * Delete multiple cache keys by pattern
 * @param {string} pattern - Pattern to match keys (e.g., 'dashboard:*')
 * @returns {Promise<boolean>} - Success status
 */
export async function deleteCachePattern(pattern) {
  try {
    const redis = getRedisClient()
    if (!redis) {
      console.warn('Redis client not available, skipping cache pattern delete')
      return false
    }

    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
    return true
  } catch (error) {
    console.error(`Cache pattern delete error for pattern ${pattern}:`, error)
    return false
  }
}

/**
 * Get or set cache with a fallback function
 * @param {string} key - Cache key
 * @param {Function} fallbackFn - Function to call if cache miss
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<any>} - Cached or fresh data
 */
export async function getCacheOrSet(key, fallbackFn, ttl = DEFAULT_TTL.MEDIUM) {
  try {
    // Try to get from cache first
    const cachedData = await getCache(key)
    if (cachedData !== null) {
      return cachedData
    }

    // Cache miss - call fallback function
    const freshData = await fallbackFn()
    
    // Cache the fresh data
    await setCache(key, freshData, ttl)
    
    return freshData
  } catch (error) {
    console.error(`Cache or set error for key ${key}:`, error)
    // If caching fails, still return the fresh data
    try {
      return await fallbackFn()
    } catch (fallbackError) {
      console.error(`Fallback function error for key ${key}:`, fallbackError)
      throw fallbackError
    }
  }
}

/**
 * Invalidate cache for specific data types
 */
export const invalidateCache = {
  dashboard: () => deleteCachePattern(CACHE_PREFIXES.DASHBOARD + '*'),
  items: () => deleteCachePattern(CACHE_PREFIXES.ITEMS + '*'),
  categories: () => deleteCachePattern(CACHE_PREFIXES.CATEGORIES + '*'),
  sales: () => deleteCachePattern(CACHE_PREFIXES.SALES + '*'),
  users: () => deleteCachePattern(CACHE_PREFIXES.USERS + '*'),
  settings: () => deleteCachePattern(CACHE_PREFIXES.SETTINGS + '*'),
  reports: () => deleteCachePattern(CACHE_PREFIXES.REPORTS + '*'),
  permissions: () => deleteCachePattern(CACHE_PREFIXES.PERMISSIONS + '*'),
  all: () => deleteCachePattern('*')
}

// Export constants for use in other files
export { DEFAULT_TTL, CACHE_PREFIXES }