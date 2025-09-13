import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(request, { params }) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied. Admin required.' }, { status: 403 })
    }

    const awaitedParams = await params
    const methodId = parseInt(awaitedParams.id)
    const { enabled } = await request.json()

    const paymentMethod = await prisma.paymentMethod.update({
      where: { id: methodId },
      data: { enabled }
    })

    return NextResponse.json(paymentMethod)
  } catch (error) {
    console.error('Payment method update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
