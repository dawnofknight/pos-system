import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request) {
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

    const formData = await request.formData()
    const file = formData.get('logo')

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG files are allowed.' 
      }, { status: 400 })
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 5MB.' 
      }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = `logo-${timestamp}.${extension}`
    
    // Define upload path
    const uploadDir = join(process.cwd(), 'public', 'assets', 'logos')
    const filePath = join(uploadDir, filename)
    
    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = new Uint8Array(bytes)
    
    await writeFile(filePath, buffer)

    // Get current settings to remove old logo if exists
    const currentSettings = await prisma.settings.findFirst()
    
    // Delete old logo file if exists
    if (currentSettings?.logoPath) {
      const oldLogoPath = join(process.cwd(), 'public', currentSettings.logoPath)
      if (existsSync(oldLogoPath)) {
        try {
          await unlink(oldLogoPath)
        } catch (error) {
          console.warn('Failed to delete old logo:', error)
        }
      }
    }

    // Update settings with new logo path
    const logoPath = `/assets/logos/${filename}`
    
    let settings
    if (currentSettings) {
      settings = await prisma.settings.update({
        where: { id: currentSettings.id },
        data: { logoPath }
      })
    } else {
      settings = await prisma.settings.create({
        data: {
          currency: 'IDR',
          currencySymbol: 'Rp',
          taxEnabled: false,
          taxRate: 0.0,
          taxName: 'Tax',
          tableCount: 6,
          appName: 'POS System Restaurant Management',
          logoPath
        }
      })
    }

    return NextResponse.json({ 
      message: 'Logo uploaded successfully',
      logoPath: settings.logoPath
    })

  } catch (error) {
    console.error('Logo upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
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

    // Get current settings
    const settings = await prisma.settings.findFirst()
    
    if (!settings?.logoPath) {
      return NextResponse.json({ error: 'No logo to delete' }, { status: 400 })
    }

    // Delete logo file
    const logoFilePath = join(process.cwd(), 'public', settings.logoPath)
    if (existsSync(logoFilePath)) {
      try {
        await unlink(logoFilePath)
      } catch (error) {
        console.warn('Failed to delete logo file:', error)
      }
    }

    // Update settings to remove logo path
    await prisma.settings.update({
      where: { id: settings.id },
      data: { logoPath: null }
    })

    return NextResponse.json({ message: 'Logo deleted successfully' })

  } catch (error) {
    console.error('Logo delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}