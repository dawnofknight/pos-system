import { removeAuthCookie } from '@/lib/auth'

export async function POST() {
  const cookie = removeAuthCookie()

  return Response.json({ message: 'Logout successful' }, {
    status: 200,
    headers: { 'Set-Cookie': cookie }
  })
}
