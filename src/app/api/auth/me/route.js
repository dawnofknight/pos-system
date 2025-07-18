import { authMiddleware } from '@/lib/middleware'

export async function GET(request) {
  const { user, error } = await authMiddleware(request)

  if (error || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return Response.json({ user })
}
