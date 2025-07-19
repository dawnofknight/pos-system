// Simple test script to verify image processing
import { processExternalImage, validateImageUrl } from './src/lib/imageUtils.js'

const testUrl = 'https://plus.unsplash.com/premium_photo-1669652639337-c513cc42ead6?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Ym9va3N8ZW58MHx8MHx8fDA%3D'

async function testImageProcessing() {
  try {
    console.log('Testing URL validation...')
    validateImageUrl(testUrl)
    console.log('✓ URL validation passed')
    
    console.log('Testing image processing...')
    const filename = await processExternalImage(testUrl)
    console.log('✓ Image processed successfully:', filename)
    
  } catch (error) {
    console.error('✗ Test failed:', error.message)
  }
}

testImageProcessing()
