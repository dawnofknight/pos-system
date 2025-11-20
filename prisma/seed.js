const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean up existing data in reverse order to avoid foreign key conflicts
  await prisma.saleItem.deleteMany({});
  await prisma.sale.deleteMany({});
  await prisma.item.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.paymentMethod.deleteMany({});
  await prisma.user.deleteMany({});

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.create({
    data: {
      email: "admin@7ss.com",
      password: adminPassword,
      name: "Admin User",
      role: "ADMIN",
    },
  });

  // Create cashier user
  const cashierPassword = await bcrypt.hash("cashier123", 12);
  const cashier = await prisma.user.create({
    data: {
      email: "cashier@7ss.com",
      password: cashierPassword,
      name: "Cashier User",
      role: "CASHIER",
    },
  });

  // Create payment methods
  const paymentMethods = [
    { name: "Cash", enabled: true },
    { name: "Credit Card", enabled: true },
    { name: "Debit Card", enabled: true },
    { name: "Digital Wallet", enabled: true },
  ];

  for (const paymentMethod of paymentMethods) {
    await prisma.paymentMethod.create({
      data: paymentMethod,
    });
  }

  // Create categories
  const categories = [
    { name: "Classic Coffee" },
    { name: "Signature" },
    { name: "Extras" },
    { name: "Snack" },
    { name: "Main Course" },
    { name: "Pasta" },
  ];

  const createdCategories = [];
  for (const category of categories) {
    const createdCategory = await prisma.category.create({
      data: category,
    });
    createdCategories.push(createdCategory);
  }

  // Create items based on cafe/restaurant menu
  const items = [
    // Classic Coffee
    {
      name: "Magic Latte",
      description: "Double Ristretto with Fresh Milk",
      price: 20000,
      stock: 100,
      emoji: "☕",
      categoryId: createdCategories[0].id,
    },
    {
      name: "Coffee Latte",
      description: "Double Espresso with Fresh Milk",
      price: 19000,
      stock: 100,
      emoji: "☕",
      categoryId: createdCategories[0].id,
    },
    {
      name: "Americano",
      description: "Strong Coffee Shot",
      price: 18000,
      stock: 100,
      emoji: "☕",
      categoryId: createdCategories[0].id,
    },

    // Signature Drinks
    {
      name: "Butter Cookie'es",
      description: "Butterscotch Seasalt with Shortbread Cookies",
      price: 23000,
      stock: 50,
      emoji: "🍪",
      categoryId: createdCategories[1].id,
    },
    {
      name: "Salted Pecan",
      description: "Nutty with Caramel Sauce",
      price: 23000,
      stock: 50,
      emoji: "🥜",
      categoryId: createdCategories[1].id,
    },
    {
      name: "Berries Cake",
      description: "Berries Jam with Espresso",
      price: 22000,
      stock: 50,
      emoji: "🍓",
      categoryId: createdCategories[1].id,
    },
    {
      name: "Neroforte",
      description: "Special Palm Sugar",
      price: 20000,
      stock: 50,
      emoji: "🥤",
      categoryId: createdCategories[1].id,
    },
    {
      name: "Summer Thrill",
      description: "Raspberry Aromatic",
      price: 20000,
      stock: 50,
      emoji: "🫐",
      categoryId: createdCategories[1].id,
    },
    {
      name: "Sweetie Rose",
      description: "Fresh Watermelon with Tea",
      price: 20000,
      stock: 50,
      emoji: "🍉",
      categoryId: createdCategories[1].id,
    },
    {
      name: "Golden Peach",
      description: "Shiny Sour Peach",
      price: 20000,
      stock: 50,
      emoji: "🍑",
      categoryId: createdCategories[1].id,
    },
    {
      name: "Wildflower",
      description: "Black Tea Osmanthus",
      price: 20000,
      stock: 50,
      emoji: "🌸",
      categoryId: createdCategories[1].id,
    },
    {
      name: "Apple Prince",
      description: "Fruit of Ngalam",
      price: 18000,
      stock: 50,
      emoji: "🍎",
      categoryId: createdCategories[1].id,
    },
    {
      name: "Hazelnude",
      description: "Butterscotch with Chocohazel",
      price: 22000,
      stock: 50,
      emoji: "🌰",
      categoryId: createdCategories[1].id,
    },
    {
      name: "Chio Smiles",
      description: "Pistachio with Cream Cheese",
      price: 23000,
      stock: 50,
      emoji: "🥜",
      categoryId: createdCategories[1].id,
    },
    {
      name: "Aoi Matcha",
      description: "Umami, Sweet, Bitter, Creamy",
      price: 20000,
      stock: 50,
      emoji: "🍵",
      categoryId: createdCategories[1].id,
    },

    // Extras
    {
      name: "Extra Shot",
      description: "Additional espresso shot",
      price: 5000,
      stock: 200,
      emoji: "➕",
      categoryId: createdCategories[2].id,
    },
    {
      name: "Biscoff Biscuit",
      description: "Crunchy biscuit",
      price: 3000,
      stock: 100,
      emoji: "🍪",
      categoryId: createdCategories[2].id,
    },

    // Snack
    {
      name: "Burger x French Fries",
      description: "Burger with crispy fries",
      price: 30000,
      stock: 30,
      emoji: "🍔",
      categoryId: createdCategories[3].id,
    },
    {
      name: "Golden Platter",
      description: "Nugget, Onion Ring, Sausage, Crinkles",
      price: 30000,
      stock: 25,
      emoji: "🍽️",
      categoryId: createdCategories[3].id,
    },
    {
      name: "Nachoz Bolognese",
      description: "Nachoz with Bolognese Sauce",
      price: 28000,
      stock: 30,
      emoji: "🌮",
      categoryId: createdCategories[3].id,
    },
    {
      name: "Onion Ring",
      description: "Crispy fried onion rings",
      price: 22000,
      stock: 35,
      emoji: "🧅",
      categoryId: createdCategories[3].id,
    },
    {
      name: "Nana Bloating",
      description: "Banana Crunchy with Salted Caramel Topping",
      price: 20000,
      stock: 30,
      emoji: "🍌",
      categoryId: createdCategories[3].id,
    },
    {
      name: "French Fries",
      description: "Crispy golden fries",
      price: 18000,
      stock: 40,
      emoji: "🍟",
      categoryId: createdCategories[3].id,
    },

    // Main Course
    {
      name: "Beef Teriyaki",
      description: "Slice Beef with Teriyaki Sauce",
      price: 28000,
      stock: 20,
      emoji: "🥩",
      categoryId: createdCategories[4].id,
    },
    {
      name: "Beef Blackpepper",
      description: "Slice Beef with Blackpepper Sauce",
      price: 28000,
      stock: 20,
      emoji: "🥩",
      categoryId: createdCategories[4].id,
    },
    {
      name: "Karage Salted Egg",
      description: "Chicken Karage with Salted Egg Sauce",
      price: 27000,
      stock: 25,
      emoji: "🍗",
      categoryId: createdCategories[4].id,
    },
    {
      name: "Karage Butter Sauce",
      description: "Chicken Karage with Butter Sauce",
      price: 27000,
      stock: 25,
      emoji: "🍗",
      categoryId: createdCategories[4].id,
    },
    {
      name: "Ayam Chili Padi",
      description: "Spicy Chicken with Stir-fried Chilies",
      price: 26000,
      stock: 25,
      emoji: "🌶️",
      categoryId: createdCategories[4].id,
    },
    {
      name: "Karage Blackpepper",
      description: "Fried Chicken with Blackpepper",
      price: 27000,
      stock: 25,
      emoji: "🍗",
      categoryId: createdCategories[4].id,
    },
    {
      name: "Tamago Gochujang",
      description: "Boiled Egg with Gochujang Sauce",
      price: 22000,
      stock: 30,
      emoji: "🥚",
      categoryId: createdCategories[4].id,
    },
    {
      name: "Oyster Sauce Egg",
      description: "Boiled Egg with Oyster Sauce",
      price: 22000,
      stock: 30,
      emoji: "🥚",
      categoryId: createdCategories[4].id,
    },

    // Pasta
    {
      name: "Aglio e Olio",
      description: "Spicy, Salty Spaghetti",
      price: 26000,
      stock: 20,
      emoji: "🍝",
      categoryId: createdCategories[5].id,
    },
    {
      name: "Carbonara Fettuccine",
      description: "Creamy, Cheesy Pasta",
      price: 26000,
      stock: 20,
      emoji: "🍝",
      categoryId: createdCategories[5].id,
    },
  ];

  for (const item of items) {
    await prisma.item.create({
      data: item,
    });
  }

  console.log("✅ Database seeded successfully!");
  console.log("👤 Admin user: admin@7ss.com / admin123");
  console.log("👤 Cashier user: cashier@7ss.com / cashier123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
