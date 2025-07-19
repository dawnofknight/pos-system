import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs'
import { promises as fsPromises } from 'fs'

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'items')
const MAX_WIDTH = 800
const MAX_HEIGHT = 600
const QUALITY = 80

// Ensure uploads directory exists
export async function ensureUploadsDir() {
  try {
    await fsPromises.access(UPLOADS_DIR)
  } catch {
    await fsPromises.mkdir(UPLOADS_DIR, { recursive: true })
  }
}

// Compress and save uploaded image
export async function processUploadedImage(buffer, originalName) {
  await ensureUploadsDir()
  
  const fileExtension = path.extname(originalName).toLowerCase()
  const fileName = `${uuidv4()}${fileExtension}`
  const filePath = path.join(UPLOADS_DIR, fileName)
  
  // Process image with sharp
  await sharp(buffer)
    .resize(MAX_WIDTH, MAX_HEIGHT, { 
      fit: 'inside',
      withoutEnlargement: true 
    })
    .jpeg({ quality: QUALITY })
    .toFile(filePath.replace(fileExtension, '.jpg'))
  
  // Return the processed filename
  return fileName.replace(fileExtension, '.jpg')
}

// Download and process external image
export async function processExternalImage(imageUrl) {
  try {
    await ensureUploadsDir()
    
    console.log('Fetching image from:', imageUrl)
    
    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 seconds
    
    let response
    try {
      response = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          'Referer': 'https://unsplash.com/'
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const contentType = response.headers.get('content-type')
      console.log('Image content type:', contentType)
      
      if (!contentType || !contentType.startsWith('image/')) {
        throw new Error(`Invalid content type: ${contentType}. Expected an image.`)
      }
      
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - the image took too long to download')
      }
      
      throw error
    }
    
    const buffer = await response.arrayBuffer()
    const fileName = `${uuidv4()}.jpg`
    const filePath = path.join(UPLOADS_DIR, fileName)
    
    // Process image with sharp
    await sharp(Buffer.from(buffer))
      .resize(MAX_WIDTH, MAX_HEIGHT, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ quality: QUALITY })
      .toFile(filePath)
    
    return fileName
  } catch (error) {
    throw new Error(`Failed to process external image: ${error.message}`)
  }
}

// Delete image file
export async function deleteImage(filename) {
  if (!filename) return
  
  try {
    const filePath = path.join(UPLOADS_DIR, filename)
    await fsPromises.unlink(filePath)
  } catch (error) {
    console.error('Error deleting image:', error)
  }
}

// Get image URL for frontend
export function getImageUrl(filename) {
  if (!filename) return null
  return `/uploads/items/${filename}`
}

// Validate image file
export function validateImage(file) {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.')
  }
  
  if (file.size > maxSize) {
    throw new Error('File size too large. Maximum size is 5MB.')
  }
  
  return true
}

// Validate external URL
export function validateImageUrl(url) {
  try {
    const urlObj = new URL(url)
    const allowedProtocols = ['http:', 'https:']
    
    if (!allowedProtocols.includes(urlObj.protocol)) {
      throw new Error('Invalid URL protocol. Only HTTP and HTTPS are allowed.')
    }
    
    // Allow most image-related URLs
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
    const hasImageExtension = imageExtensions.some(ext => 
      urlObj.pathname.toLowerCase().includes(ext)
    )
    
    // Also allow URLs with image query parameters or from known image services
    const hasImageQuery = urlObj.search.includes('format') || 
                         urlObj.search.includes('image') ||
                         urlObj.search.includes('photo')
    
    const imageServices = [
      'imgur.com', 'cloudinary.com', 'unsplash.com', 'pexels.com', 
      'pixabay.com', 'flickr.com', 'amazonaws.com', 'googleusercontent.com',
      'plus.unsplash.com'  // Added for Unsplash premium photos
    ]
    const isImageService = imageServices.some(service => 
      urlObj.hostname.includes(service)
    )
    
    if (!hasImageExtension && !hasImageQuery && !isImageService) {
      console.warn(`URL might not be an image: ${url}. Proceeding anyway...`)
    }
    
    return true
  } catch (error) {
    throw new Error(`Invalid URL format: ${error.message}`)
  }
}
