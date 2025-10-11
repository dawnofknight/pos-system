import Redis from 'ioredis'

let redis = null

// Initialize Redis client
function getRedisClient() {
  if (!redis) {
    try {
      // Access environment variable - Next.js automatically injects process.env on server side
      const redisUrl = typeof process !== 'undefined' ? process.env.REDIS_URL : undefined
      if (!redisUrl) {
        throw new Error('REDIS_URL environment variable is not set')
      }
      
      redis = new Redis(redisUrl, {
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        // Connection timeout
        connectTimeout: 10000,
        // Command timeout
        commandTimeout: 5000,
        // Retry configuration
        retryDelayOnClusterDown: 300,
      })

      redis.on('connect', () => {
        console.log('✅ Redis connected successfully')
      })

      redis.on('error', (err) => {
        console.error('❌ Redis connection error:', err)
      })

      redis.on('close', () => {
        console.log('🔌 Redis connection closed')
      })

      redis.on('reconnecting', () => {
        console.log('🔄 Redis reconnecting...')
      })

    } catch (error) {
      console.error('❌ Failed to initialize Redis client:', error)
      redis = null
    }
  }
  
  return redis
}

// Test Redis connection
export async function testRedisConnection() {
  try {
    const client = getRedisClient()
    if (!client) {
      throw new Error('Redis client not initialized')
    }
    
    await client.ping()
    console.log('✅ Redis connection test successful')
    return true
  } catch (error) {
    console.error('❌ Redis connection test failed:', error)
    return false
  }
}

// Close Redis connection
export async function closeRedisConnection() {
  if (redis) {
    await redis.quit()
    redis = null
    console.log('🔌 Redis connection closed')
  }
}

export { getRedisClient }
export default getRedisClient