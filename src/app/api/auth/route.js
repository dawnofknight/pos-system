import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword, generateToken, createAuthCookie } from '@/lib/auth'

export async function POST(request) {
  try {
    const { email, password, name, action } = await request.json()

    if (action === 'register') {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        return Response.json({ error: 'User already exists' }, { status: 400 })
      }

      // Hash password
      const hashedPassword = await hashPassword(password)

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'CASHIER'
        },
        select: { id: true, email: true, name: true, role: true }
      })

      // Generate token
      const token = generateToken(user.id)

      // Set cookie
      const cookie = createAuthCookie(token)

      return Response.json({ 
        user,
        message: 'Registration successful' 
      }, { 
        status: 201,
        headers: { 'Set-Cookie': cookie }
      })
    }

    if (action === 'login') {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user) {
        return Response.json({ error: 'Invalid credentials' }, { status: 401 })
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password)

      if (!isValidPassword) {
        return Response.json({ error: 'Invalid credentials' }, { status: 401 })
      }

      // Generate token
      const token = generateToken(user.id)

      // Set cookie
      const cookie = createAuthCookie(token)

      return Response.json({ 
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        message: 'Login successful' 
      }, { 
        status: 200,
        headers: { 'Set-Cookie': cookie }
      })
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Auth error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
