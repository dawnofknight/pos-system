// Script to seed audit logs for testing
import { getAuditCollection } from "../lib/mongodb";
import { connectToDatabase } from "../lib/mongodb";

async function seedAuditLogs() {
  try {
    console.log("Connecting to MongoDB...");
    await connectToDatabase();

    const collection = await getAuditCollection();
    console.log("Connected to audit logs collection");

    // Sample user data
    const users = [
      { id: 1, name: "Admin User", email: "admin@example.com", role: "ADMIN" },
      {
        id: 2,
        name: "Cashier User",
        email: "cashier@example.com",
        role: "CASHIER",
      },
    ];

    // Sample actions
    const actions = ["create", "update", "delete", "view"];

    // Sample resources
    const resources = ["item", "category", "sale", "user", "settings"];

    // Generate sample logs
    const sampleLogs = [];

    // Create logs from the past 7 days
    for (let i = 0; i < 50; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const resource = resources[Math.floor(Math.random() * resources.length)];
      const resourceId = Math.floor(Math.random() * 100) + 1;

      // Random date within the past 7 days
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 7));

      sampleLogs.push({
        timestamp: date,
        action,
        resource,
        resourceId: resourceId.toString(),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        details: {
          description: `${action} ${resource} #${resourceId}`,
        },
        ipAddress: "127.0.0.1",
      });
    }

    // Insert the sample logs
    if (sampleLogs.length > 0) {
      const result = await collection.insertMany(sampleLogs);
      console.log(`Successfully inserted ${result.insertedCount} audit logs`);
    }

    console.log("Audit logs seeding completed");
  } catch (error) {
    console.error("Error seeding audit logs:", error);
  }
}

// Run the seeding function
seedAuditLogs();
