import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get or create default payment methods
    let paymentMethods = await prisma.paymentMethod.findMany({
      orderBy: { name: 'asc' }
    })
    
    if (paymentMethods.length === 0) {
      // Create default payment methods
      const defaultMethods = [
        { name: 'Cash', enabled: true },
        { name: 'Transfer', enabled: true },
        { name: 'Debit', enabled: true }
      ]

      await prisma.paymentMethod.createMany({
        data: defaultMethods
      })

      paymentMethods = await prisma.paymentMethod.findMany({
        orderBy: { name: 'asc' }
      })
    }

    return NextResponse.json(paymentMethods)
  } catch (error) {
    console.error('Payment methods fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
