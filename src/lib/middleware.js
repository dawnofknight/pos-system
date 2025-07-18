import { verifyToken } from './auth'
import { prisma } from './prisma'
import { parse } from 'cookie'

export const authMiddleware = async (req) => {
  const cookieHeader = req.headers.get ? req.headers.get('cookie') : req.headers.cookie
  const cookies = parse(cookieHeader || '')
  const token = cookies['auth-token']
  
  if (!token) {
    return { user: null, error: 'No token provided' }
  }

  try {
    const decoded = verifyToken(token)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true }
    })

    if (!user) {
      return { user: null, error: 'User not found' }
    }

    return { user, error: null }
  } catch (error) {
    return { user: null, error: 'Invalid token' }
  }
}

export const requireAuth = (handler) => {
  return async (req, res) => {
    const { user, error } = await authMiddleware(req)

    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    req.user = user
    return handler(req, res)
  }
}

export const requireAdmin = (handler) => {
  return async (req, res) => {
    const { user, error } = await authMiddleware(req)

    if (error || !user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' })
    }

    req.user = user
    return handler(req, res)
  }
}
