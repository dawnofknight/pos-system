const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean up existing data in reverse order to avoid foreign key conflicts
  await prisma.saleItem.deleteMany({})
  await prisma.sale.deleteMany({})
  await prisma.item.deleteMany({})
  await prisma.category.deleteMany({})
  await prisma.user.deleteMany({})

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@pos.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  })

  // Create cashier user
  const cashierPassword = await bcrypt.hash('cashier123', 12)
  const cashier = await prisma.user.create({
    data: {
      email: 'cashier@pos.com',
      password: cashierPassword,
      name: 'Cashier User',
      role: 'CASHIER',
    },
  })

  // Create categories
  const categories = [
    { name: 'Beverages' },
    { name: 'Snacks' },
    { name: 'Electronics' },
    { name: 'Clothing' },
    { name: 'Books' },
  ]

  const createdCategories = []
  for (const category of categories) {
    const createdCategory = await prisma.category.create({
      data: category,
    })
    createdCategories.push(createdCategory)
  }

  // Create items
  const items = [
    {
      name: 'Coca Cola',
      description: 'Refreshing soft drink',
      price: 2.50,
      stock: 50,
      categoryId: createdCategories[0].id, // Beverages
    },
    {
      name: 'Pepsi',
      description: 'Cola soft drink',
      price: 2.30,
      stock: 45,
      categoryId: createdCategories[0].id, // Beverages
    },
    {
      name: 'Water Bottle',
      description: 'Pure drinking water',
      price: 1.00,
      stock: 100,
      categoryId: createdCategories[0].id, // Beverages
    },
    {
      name: 'Potato Chips',
      description: 'Crispy potato chips',
      price: 3.00,
      stock: 30,
      categoryId: createdCategories[1].id, // Snacks
    },
    {
      name: 'Chocolate Bar',
      description: 'Milk chocolate bar',
      price: 2.00,
      stock: 25,
      categoryId: createdCategories[1].id, // Snacks
    },
    {
      name: 'Cookies',
      description: 'Chocolate chip cookies',
      price: 4.50,
      stock: 20,
      categoryId: createdCategories[1].id, // Snacks
    },
    {
      name: 'Wireless Earbuds',
      description: 'Bluetooth earbuds',
      price: 99.99,
      stock: 15,
      categoryId: createdCategories[2].id, // Electronics
    },
    {
      name: 'Phone Charger',
      description: 'USB-C phone charger',
      price: 19.99,
      stock: 8,
      categoryId: createdCategories[2].id, // Electronics
    },
    {
      name: 'T-Shirt',
      description: 'Cotton t-shirt',
      price: 25.00,
      stock: 40,
      categoryId: createdCategories[3].id, // Clothing
    },
    {
      name: 'Jeans',
      description: 'Denim jeans',
      price: 65.00,
      stock: 5,
      categoryId: createdCategories[3].id, // Clothing
    },
    {
      name: 'Programming Book',
      description: 'JavaScript programming guide',
      price: 45.00,
      stock: 12,
      categoryId: createdCategories[4].id, // Books
    },
  ]

  for (const item of items) {
    await prisma.item.create({
      data: item,
    })
  }

  console.log('✅ Database seeded successfully!')
  console.log('👤 Admin user: admin@pos.com / admin123')
  console.log('👤 Cashier user: cashier@pos.com / cashier123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
