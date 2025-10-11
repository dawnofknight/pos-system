import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get settings without authentication for public branding
    let settings = await prisma.settings.findFirst({
      select: {
        appName: true,
        logoPath: true
      }
    })
    
    if (!settings) {
      // Return default branding if no settings exist
      return NextResponse.json({
        appName: 'POS System Restaurant Management',
        logoPath: '/burger-logo.svg'
      })
    }

    return NextResponse.json({
      appName: settings.appName || 'POS System Restaurant Management',
      logoPath: settings.logoPath || '/burger-logo.svg'
    })
  } catch (error) {
    console.error('Branding fetch error:', error)
    return NextResponse.json({
      appName: 'POS System Restaurant Management',
      logoPath: '/burger-logo.svg'
    })
  }
}