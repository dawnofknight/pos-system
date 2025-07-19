import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { processUploadedImage, processExternalImage, validateImageUrl } from '@/lib/imageUtils'

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

    const contentType = request.headers.get('content-type')

    // Handle form data (file upload)
    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('image')

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
      }

      // Validate file
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        return NextResponse.json({ error: 'File size too large. Maximum size is 5MB.' }, { status: 400 })
      }

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ 
          error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' 
        }, { status: 400 })
      }

      const buffer = await file.arrayBuffer()
      const filename = await processUploadedImage(Buffer.from(buffer), file.name)

      return NextResponse.json({
        success: true,
        filename,
        url: `/uploads/items/${filename}`,
        type: 'upload'
      })
    }

    // Handle JSON data (external URL)
    if (contentType?.includes('application/json')) {
      const { imageUrl } = await request.json()

      if (!imageUrl) {
        return NextResponse.json({ error: 'No image URL provided' }, { status: 400 })
      }

      console.log('Processing external image URL:', imageUrl)

      // Validate URL
      try {
        validateImageUrl(imageUrl)
      } catch (error) {
        console.error('URL validation failed:', error.message)
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      try {
        const filename = await processExternalImage(imageUrl)

        return NextResponse.json({
          success: true,
          filename,
          url: `/uploads/items/${filename}`,
          type: 'url'
        })
      } catch (imageProcessError) {
        console.error('Image processing error:', imageProcessError.message)
        return NextResponse.json({ 
          error: `Failed to process image: ${imageProcessError.message}` 
        }, { status: 500 })
      }
    }

    return NextResponse.json({ error: 'Invalid request format' }, { status: 400 })

  } catch (error) {
    console.error('Error processing image:', error)
    return NextResponse.json({ 
      error: `Failed to process image: ${error.message}` 
    }, { status: 500 })
  }
}
