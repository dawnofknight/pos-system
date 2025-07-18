import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

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

    // Get or create settings
    let settings = await prisma.settings.findFirst()
    
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          currency: 'USD',
          currencySymbol: '$',
          taxEnabled: false,
          taxRate: 0.0,
          taxName: 'Tax'
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if user is admin for settings changes
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied. Admin required.' }, { status: 403 })
    }

    const { currency, currencySymbol, taxEnabled, taxRate, taxName } = await request.json()

    // Get existing settings or create new
    let settings = await prisma.settings.findFirst()
    
    if (settings) {
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: {
          currency: currency || settings.currency,
          currencySymbol: currencySymbol || settings.currencySymbol,
          taxEnabled: taxEnabled !== undefined ? taxEnabled : settings.taxEnabled,
          taxRate: taxRate !== undefined ? taxRate : settings.taxRate,
          taxName: taxName || settings.taxName
        }
      })
    } else {
      settings = await prisma.settings.create({
        data: {
          currency: currency || 'USD',
          currencySymbol: currencySymbol || '$',
          taxEnabled: taxEnabled || false,
          taxRate: taxRate || 0.0,
          taxName: taxName || 'Tax'
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
