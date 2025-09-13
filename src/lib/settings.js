import { prisma } from './prisma'

export async function getSettings() {
  try {
    let settings = await prisma.settings.findFirst()
    
    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.settings.create({
        data: {
          currency: 'IDR',
          currencySymbol: 'Rp',
          taxEnabled: false,
          taxRate: 0.0,
          taxName: 'Tax'
        }
      })
    }
    
    return settings
  } catch (error) {
    console.error('Error fetching settings:', error)
    return {
      currency: 'IDR',
      currencySymbol: 'Rp',
      taxEnabled: false,
      taxRate: 0.0,
      taxName: 'Tax'
    }
  }
}

export async function calculateTaxAmount(subtotal, settings = null) {
  if (!settings) {
    settings = await getSettings()
  }
  
  if (!settings.taxEnabled) {
    return 0
  }
  
  return subtotal * (settings.taxRate / 100)
}

export async function calculateTotalWithTax(subtotal, settings = null) {
  if (!settings) {
    settings = await getSettings()
  }
  
  const taxAmount = await calculateTaxAmount(subtotal, settings)
  return subtotal + taxAmount
}

export function formatCurrency(amount, settings = null) {
  const symbol = settings?.currencySymbol || 'Rp'
  return `${symbol}${amount.toFixed(2)}`
}
